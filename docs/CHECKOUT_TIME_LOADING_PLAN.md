# Checkout Time Loading Optimization Plan

## Overview

This document outlines improvements for the checkout page time slot loading behavior and potential performance optimizations.

---

## Issue 1: Race Condition (CRITICAL BUG)

### Symptom

When clicking dates quickly back and forth:
- Loading finishes but nothing shows up
- Click another date and click back, suddenly the times appear
- Inconsistent/wrong times displayed for the selected date

### Root Cause

Classic async race condition in `addTimes()`:

```
Click Date A → addTimes() starts → API call #1 in flight (for Date A)
Click Date B (quickly) → addTimes() starts → API call #2 in flight (for Date B)
API call #2 returns FIRST → sets times for Date B ✓
API call #1 returns SECOND → OVERWRITES times with Date A's data (BUG!)
```

The function captures `DAY` at call time (line 203) but doesn't verify the response still matches the **current** selected date when it returns.

**File:** [frontend/app/screens/customer/checkout/index.tsx](frontend/app/screens/customer/checkout/index.tsx)
**Lines:** 195-238

### Proposed Fix

Use a ref to track the "current" request and ignore stale responses:

```typescript
// Add ref to track current request
const currentRequestRef = useRef<string | null>(null);

const addTimes = async () => {
  if (!chefInfo?.id) {
    onChangeTimes([]);
    setIsLoadingTimes(false);
    return;
  }

  setIsLoadingTimes(true);
  const selectedDate = DAY.format('YYYY-MM-DD');
  const requestId = `${chefInfo.id}-${selectedDate}-${Date.now()}`;
  currentRequestRef.current = requestId;

  try {
    const resp = await GetAvailableTimeslotsAPI(chefInfo.id, selectedDate);

    // CRITICAL: Check if this response is still relevant
    if (currentRequestRef.current !== requestId) {
      console.log('[DEBUG] Ignoring stale response for date:', selectedDate);
      return; // A newer request was made, ignore this response
    }

    console.log('[DEBUG] addTimes response:', JSON.stringify(resp), 'for date:', selectedDate);

    if (resp.success === 1 && resp.data) {
      const timeslots = resp.data.map((timeStr: string, index: number) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const timeLabel = moment()
          .hour(hours)
          .minute(minutes)
          .format('hh:mm a');

        return {
          id: (index + 1).toString(),
          label: timeLabel + ' ',
          h: hours,
          m: minutes,
        };
      });

      onChangeTimes(timeslots);
    } else {
      onChangeTimes([]);
    }
  } catch (error) {
    // Only handle error if this is still the current request
    if (currentRequestRef.current === requestId) {
      console.error('[TMA-011] Error fetching timeslots:', error);
      onChangeTimes([]);
    }
  } finally {
    // Only clear loading if this is still the current request
    if (currentRequestRef.current === requestId) {
      setIsLoadingTimes(false);
    }
  }
};
```

### Alternative Fix (AbortController)

Could also use AbortController to cancel in-flight requests:

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const addTimes = async () => {
  // Cancel any in-flight request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();

  // ... pass signal to fetch ...
};
```

However, the ref approach is simpler and doesn't require modifying the API layer.

---

## Issue 2: Loading Indicator Timing

### Current Behavior

When a user clicks on a date in the checkout calendar:

1. `handleDayPress()` is triggered with a 10ms delay
2. `onChangeDay()` updates the `DAY` state
3. `useEffect` listening to `DAY` calls `addTimes()`
4. `setIsLoadingTimes(true)` is called at the start of `addTimes()`
5. API call is made to `get_available_timeslots`
6. `setIsLoadingTimes(false)` is called in the `finally` block

### Problem

The loading indicator (`isLoadingTimes`) is set to `true` **inside** `addTimes()` rather than immediately when the date is clicked. This creates a brief moment where:
- The old time slots are still displayed
- No loading indicator is shown
- Then suddenly the loading indicator appears

This causes a jarring transition rather than immediate feedback.

### Proposed Fix

**File:** [frontend/app/screens/customer/checkout/index.tsx](frontend/app/screens/customer/checkout/index.tsx)

Set `isLoadingTimes` to `true` immediately in `handleDayPress()` before updating the date:

```typescript
// Lines 248-251
const handleDayPress = async (day: moment.Moment) => {
  setIsLoadingTimes(true);  // ADD THIS LINE - immediate feedback
  await Delay(10);
  onChangeDay(day);
};
```

This ensures the loading indicator appears **instantly** when the user taps a date, providing immediate visual feedback that something is happening.

### Alternative Consideration

Could also clear the times immediately to prevent showing stale data:

```typescript
const handleDayPress = async (day: moment.Moment) => {
  setIsLoadingTimes(true);
  onChangeTimes([]);  // Clear old times immediately
  await Delay(10);
  onChangeDay(day);
};
```

---

## Issue 2: Performance Optimization Ideas

### Current Architecture Analysis

**Frontend:**
- No caching of time slots
- Every date selection triggers a fresh API call
- Time slots are re-fetched even for recently viewed dates

**Backend (get_available_timeslots):**
- **Well optimized** - Only 3 indexed database queries max
- Uses composite unique index on `tbl_availability_overrides`
- Time slot generation is pure in-memory computation
- Estimated response time: 5-15ms (mostly network latency)

### Optimization Opportunities

#### A. Frontend: Client-Side Caching (HIGH IMPACT)

**Problem:** Switching between dates triggers redundant API calls for dates already fetched.

**Solution:** Implement a simple in-memory cache for fetched time slots.

```typescript
// Add cache state
const [timeSlotsCache, setTimeSlotsCache] = useState<Record<string, TimeSlot[]>>({});

const addTimes = async () => {
  if (!chefInfo?.id) {
    onChangeTimes([]);
    setIsLoadingTimes(false);
    return;
  }

  const selectedDate = DAY.format('YYYY-MM-DD');

  // Check cache first
  const cacheKey = `${chefInfo.id}-${selectedDate}`;
  if (timeSlotsCache[cacheKey]) {
    onChangeTimes(timeSlotsCache[cacheKey]);
    setIsLoadingTimes(false);
    return;
  }

  setIsLoadingTimes(true);

  try {
    const resp = await GetAvailableTimeslotsAPI(chefInfo.id, selectedDate);
    // ... process response ...

    // Store in cache
    setTimeSlotsCache(prev => ({
      ...prev,
      [cacheKey]: timeslots
    }));

    onChangeTimes(timeslots);
  } catch (error) {
    // ... handle error ...
  } finally {
    setIsLoadingTimes(false);
  }
};
```

**Cache Invalidation:**
- Clear cache when checkout screen unmounts
- Clear cache when chef changes
- Consider 5-minute TTL for "today's" date (availability may change)

**Complexity:** Low
**Impact:** High for users browsing multiple dates

---

#### B. Frontend: Pre-fetch Adjacent Days (MEDIUM IMPACT)

**Problem:** Users often browse consecutive dates looking for availability.

**Solution:** When a date is selected, pre-fetch the next 2-3 working days in the background.

```typescript
const prefetchAdjacentDays = async (selectedDate: moment.Moment) => {
  const datesToPrefetch = [];
  let checkDate = selectedDate.clone();

  for (let i = 0; i < 7 && datesToPrefetch.length < 3; i++) {
    checkDate = checkDate.add(1, 'day');
    if (chefWorkingDays.includes(checkDate.weekday())) {
      datesToPrefetch.push(checkDate.format('YYYY-MM-DD'));
    }
  }

  // Fire and forget - don't await
  datesToPrefetch.forEach(date => {
    const cacheKey = `${chefInfo.id}-${date}`;
    if (!timeSlotsCache[cacheKey]) {
      GetAvailableTimeslotsAPI(chefInfo.id, date).then(resp => {
        if (resp.success === 1 && resp.data) {
          // Store in cache silently
        }
      }).catch(() => {}); // Ignore errors on prefetch
    }
  });
};
```

**Complexity:** Medium
**Impact:** Medium - reduces perceived latency for date browsing

---

#### C. Backend: HTTP Response Caching (LOW PRIORITY)

The backend endpoint is already very fast (5-15ms). However, if needed:

**Option 1: Laravel Cache**
```php
public function getAvailableTimeslots(Request $request)
{
    $cacheKey = "timeslots:{$chefId}:{$date}";

    return Cache::remember($cacheKey, 300, function () use ($chefId, $date) {
        // ... existing logic ...
    });
}
```

**Considerations:**
- Cache invalidation when availability changes (override created/updated)
- "Today's" slots need shorter TTL (3-hour rule changes throughout day)
- Future dates can have longer TTL (5-10 minutes)

**Complexity:** Medium
**Impact:** Low (endpoint is already fast)

---

#### D. Backend: Batch Endpoint for Multiple Dates (FUTURE)

**Problem:** If we implement pre-fetching, we'd make multiple sequential API calls.

**Solution:** Create a batch endpoint that accepts multiple dates.

```php
// New endpoint: get_available_timeslots_batch
public function getAvailableTimeslotsBatch(Request $request)
{
    $chefId = $request->input('chef_id');
    $dates = $request->input('dates'); // Array: ["2025-12-12", "2025-12-13", ...]

    $results = [];
    foreach ($dates as $date) {
        $results[$date] = $this->getTimeslotsForDate($chefId, $date);
    }

    return response()->json(['success' => 1, 'data' => $results]);
}
```

**Complexity:** Medium
**Impact:** Medium - only valuable if pre-fetching is implemented

---

#### E. Frontend: Debounce Rapid Date Changes (LOW PRIORITY)

**Problem:** Fast date switching could trigger many API calls.

**Current State:** The 10ms delay in `handleDayPress` helps slightly, but doesn't debounce.

**Solution:** Implement proper debouncing for the API call:

```typescript
const debouncedAddTimes = useMemo(
  () => debounce(() => addTimes(), 200),
  [chefInfo?.id, DAY]
);

useEffect(() => {
  setIsLoadingTimes(true);
  debouncedAddTimes();
  return () => debouncedAddTimes.cancel();
}, [DAY]);
```

**Complexity:** Low
**Impact:** Low - most users don't switch dates rapidly

---

## Recommended Implementation Order

### Phase 1: Critical Bug Fix (IMMEDIATE)
1. **Fix race condition** - Add request tracking ref to ignore stale responses
   - Effort: 15 minutes
   - Impact: Fixes the "times not showing" bug when clicking dates quickly

### Phase 2: Quick Wins
2. **Fix loading indicator timing** - Set `isLoadingTimes(true)` in `handleDayPress`
   - Effort: 5 minutes
   - Impact: Immediate UX improvement (instant feedback)

### Phase 3: Caching (Short-term)
3. **Client-side time slot caching** - Cache fetched slots by date
   - Effort: 30 minutes
   - Impact: Eliminates redundant API calls

### Phase 4: Future Enhancements (If Needed)
4. Pre-fetch adjacent working days
5. Backend batch endpoint
6. Server-side caching with proper invalidation

---

## Files to Modify

| File | Changes |
|------|---------|
| [frontend/app/screens/customer/checkout/index.tsx](frontend/app/screens/customer/checkout/index.tsx) | Loading state timing, caching logic |

---

## Performance Metrics (Current)

| Component | Time |
|-----------|------|
| Backend API response | 5-15ms |
| Network latency | ~100-300ms (varies by connection) |
| Frontend processing | <5ms |
| **Total perceived delay** | ~150-350ms |

The majority of perceived delay is network latency, not backend processing. Client-side caching will have the biggest impact by eliminating network round-trips for cached data.

---

## Notes

- Backend `get_available_timeslots` is already well-optimized with only 3 indexed queries
- No N+1 query issues exist in the current implementation
- The composite unique index on `tbl_availability_overrides` ensures O(1) lookups
- Time slot generation is pure in-memory computation with O(48) iterations
