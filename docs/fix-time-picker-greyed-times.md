# Fix: Time Picker Greyed Out / Unselectable Times

## Problem

On the Chef Profile "Hours Available" screen, the iOS time picker shows certain hours and minutes as greyed out and **unselectable**. For example, if the current time is 3:15 PM, hours before 3 PM cannot be selected.

## Root Cause

The `@react-native-community/datetimepicker` component uses JavaScript `Date` objects even for time-only selection (`mode="time"`). The iOS native `UIDatePicker` still respects the **date portion** of the value and applies implicit constraints.

### The Data Flow Problem

1. **Backend stores times as Unix timestamps** (seconds since Jan 1, 1970)
   - Example: 9:00 AM stored as a full timestamp like `1733835600` (Dec 10, 2025 at 9:00 AM)

2. **Frontend loads times incorrectly** at [index.tsx:103-104](frontend/app/screens/chef/profile/index.tsx#L103-L104):
   ```javascript
   start: moment(startVal * 1000).toDate(),
   end: moment(endVal * 1000).toDate(),
   ```
   This creates a `Date` with the **actual stored date** (which could be yesterday or any past date).

3. **Default times use today's date** at [index.tsx:125-126](frontend/app/screens/chef/profile/index.tsx#L125-L126):
   ```javascript
   start: moment().startOf('day').add(9, 'hours').toDate(),  // Today at 9 AM
   end: moment().startOf('day').add(17, 'hours').toDate(),   // Today at 5 PM
   ```

4. **iOS applies implicit constraints**: When the `DateTimePicker` receives a `Date` with today's date, iOS may disable times that are "in the past" relative to the current moment.

### Why This Causes Greyed Times

- If current time is 3:15 PM and the picker's `value` has today's date
- iOS `UIDatePicker` treats times before 3:15 PM as "past" and disables them
- This is iOS native behavior, not a bug in our code per se, but we're triggering it by using today's date

## Solution

**Normalize all time `Date` objects to use a fixed, arbitrary date** (e.g., January 1, 2000) so the date component never triggers any iOS constraints. Only the hours and minutes should matter for availability times.

### Implementation Plan

#### 1. Add Helper Functions

Add these utility functions near the top of the component (after line 47):

```javascript
// Use a fixed date far in the future to avoid any iOS date constraints
const FIXED_TIME_DATE = new Date(2000, 0, 1); // Jan 1, 2000

// Convert a timestamp (seconds) to a Date with fixed date, preserving only hours/minutes
const timestampToTimeDate = (timestamp: number): Date => {
  const date = new Date(timestamp * 1000);
  const result = new Date(FIXED_TIME_DATE);
  result.setHours(date.getHours(), date.getMinutes(), 0, 0);
  return result;
};

// Create a time Date with fixed date from hours and minutes
const createTimeDate = (hours: number, minutes: number = 0): Date => {
  const result = new Date(FIXED_TIME_DATE);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

// Normalize any Date to use the fixed date (preserving hours/minutes)
const normalizeTimeDate = (date: Date): Date => {
  const result = new Date(FIXED_TIME_DATE);
  result.setHours(date.getHours(), date.getMinutes(), 0, 0);
  return result;
};
```

#### 2. Fix Loading Times from Backend

Update [index.tsx:99-106](frontend/app/screens/chef/profile/index.tsx#L99-L106):

**Before:**
```javascript
if (startVal && endVal && startVal > 0 && endVal > 0) {
  return {
    ...day,
    checked: true,
    start: moment(startVal * 1000).toDate(),
    end: moment(endVal * 1000).toDate(),
  };
}
```

**After:**
```javascript
if (startVal && endVal && startVal > 0 && endVal > 0) {
  return {
    ...day,
    checked: true,
    start: timestampToTimeDate(startVal),
    end: timestampToTimeDate(endVal),
  };
}
```

#### 3. Fix Default Times When Toggling Day

Update [index.tsx:121-127](frontend/app/screens/chef/profile/index.tsx#L121-L127):

**Before:**
```javascript
if (newChecked && !day.start) {
  return {
    ...day,
    checked: newChecked,
    start: moment().startOf('day').add(9, 'hours').toDate(),
    end: moment().startOf('day').add(17, 'hours').toDate(),
  };
}
```

**After:**
```javascript
if (newChecked && !day.start) {
  return {
    ...day,
    checked: newChecked,
    start: createTimeDate(9, 0),   // 9:00 AM
    end: createTimeDate(17, 0),    // 5:00 PM
  };
}
```

#### 4. Fix Opening Time Picker

Update [index.tsx:140-141](frontend/app/screens/chef/profile/index.tsx#L140-L141):

**Before:**
```javascript
const currentTime = type === 'start' ? day.start : day.end;
setTempTime(currentTime || moment().startOf('day').add(9, 'hours').toDate());
```

**After:**
```javascript
const currentTime = type === 'start' ? day.start : day.end;
setTempTime(currentTime ? normalizeTimeDate(currentTime) : createTimeDate(9, 0));
```

#### 5. Fix Time Change Handler

Update [index.tsx:157-160](frontend/app/screens/chef/profile/index.tsx#L157-L160):

**Before:**
```javascript
// iOS - update temp time
if (selectedDate) {
  setTempTime(selectedDate);
}
```

**After:**
```javascript
// iOS - update temp time (normalize to fixed date)
if (selectedDate) {
  setTempTime(normalizeTimeDate(selectedDate));
}
```

#### 6. Fix Time Auto-Adjustment Logic

Update [index.tsx:189-195](frontend/app/screens/chef/profile/index.tsx#L189-L195):

**Before:**
```javascript
if (type === 'start') {
  // User changed start time to be >= end, push end forward by 1 hour
  newEnd = moment(newStart).add(1, 'hour').toDate();
} else {
  // User changed end time to be <= start, pull start backward by 1 hour
  newStart = moment(newEnd).subtract(1, 'hour').toDate();
}
```

**After:**
```javascript
if (type === 'start') {
  // User changed start time to be >= end, push end forward by 1 hour
  newEnd = createTimeDate(newStart!.getHours() + 1, newStart!.getMinutes());
} else {
  // User changed end time to be <= start, pull start backward by 1 hour
  newStart = createTimeDate(newEnd!.getHours() - 1, newEnd!.getMinutes());
}
```

#### 7. Fix Initial tempTime State

Update [index.tsx:67](frontend/app/screens/chef/profile/index.tsx#L67):

**Before:**
```javascript
const [tempTime, setTempTime] = useState<Date>(new Date());
```

**After:**
```javascript
const [tempTime, setTempTime] = useState<Date>(createTimeDate(9, 0));
```

### Backend Compatibility

**No backend changes required.** The `getTimestampVal` function at [index.tsx:266-271](frontend/app/screens/chef/profile/index.tsx#L266-L271) still works correctly:

```javascript
const getTimestampVal = (date: Date | undefined) => {
  if (date) {
    return Math.floor(date.getTime() / 1000);
  }
  return 0;
};
```

This will now send timestamps based on Jan 1, 2000 (e.g., `946717200` for 9:00 AM), but the backend only cares about extracting the **time portion** using `HOUR()` and `MINUTE()` SQL functions, as seen in [MapiController.php:2941](backend/app/Http/Controllers/MapiController.php#L2941):

```php
HOUR(convert_tz(from_unixtime(monday_start), ...))
```

The `HOUR()` function extracts just the hour regardless of the date, so this is fully compatible.

### Also Update: dayRowComponent.tsx

The same pattern should be applied to [dayRowComponent.tsx](frontend/app/screens/chef/profile/component/dayRowComponent.tsx) if it's still being used anywhere. The key locations are:

- Lines 18-19: `startTime` and `endTime` initialization
- Lines 179-187: iOS DateTimePicker for start time
- Lines 244-252: iOS DateTimePicker for end time

## Testing

After implementation, verify:

1. **All times are selectable** - No greyed out hours or minutes
2. **Times display correctly** - Shows proper AM/PM format
3. **Saving works** - Times are saved to backend correctly
4. **Loading works** - Previously saved times load correctly
5. **Default times work** - When checking a new day, 9 AM - 5 PM is set
6. **Auto-adjustment works** - Start/end time constraints still function
