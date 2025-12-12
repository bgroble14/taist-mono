# Chef Search Performance Optimization Plan

## Executive Summary

The `getSearchChefs` endpoint at [MapiController.php:2918-3195](../backend/app/Http/Controllers/MapiController.php#L2918-L3195) is the primary API powering the customer home screen chef discovery. Analysis reveals multiple performance bottlenecks that can be addressed to achieve **3-5x faster response times**.

**Current estimated response time:** 700-2800ms
**Target response time:** 150-500ms

---

## 1. DATABASE INDEXES (Critical - Highest Impact)

### 1.1 Problem Analysis

The database has **no indexes** on any tables except primary keys. Every query performs full table scans.

#### Current Schema Issues:

**tbl_users** ([taist-schema.sql:475-503](../backend/database/taist-schema.sql#L475-L503))
```sql
CREATE TABLE `tbl_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  ...
  `user_type` tinyint NOT NULL DEFAULT '1',     -- No index
  `is_pending` tinyint NOT NULL DEFAULT '0',    -- No index
  `verified` tinyint NOT NULL DEFAULT '0',      -- No index
  `latitude` varchar(45) DEFAULT NULL,          -- No index, wrong type
  `longitude` varchar(45) DEFAULT NULL,         -- No index, wrong type
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

**tbl_availabilities** ([taist-schema.sql:215-238](../backend/database/taist-schema.sql#L215-L238))
```sql
CREATE TABLE `tbl_availabilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,  -- No index (used in JOIN)
  ...
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

**tbl_reviews** ([taist-schema.sql:415-426](../backend/database/taist-schema.sql#L415-L426))
```sql
CREATE TABLE `tbl_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `to_user_id` int NOT NULL,  -- No index (batch load uses this)
  ...
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

**tbl_menus** ([taist-schema.sql:305-321](../backend/database/taist-schema.sql#L305-L321))
```sql
CREATE TABLE `tbl_menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,      -- No index
  `is_live` tinyint NOT NULL,  -- No index
  `category_ids` varchar(50),  -- Uses FIND_IN_SET (non-indexable)
  ...
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

**tbl_customizations** ([taist-schema.sql:287-295](../backend/database/taist-schema.sql#L287-L295))
```sql
CREATE TABLE `tbl_customizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `menu_id` int NOT NULL,  -- No index
  ...
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
```

### 1.2 Solution: Create Migration for Indexes

Create new migration file: `backend/database/migrations/2025_12_12_000001_add_chef_search_performance_indexes.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddChefSearchPerformanceIndexes extends Migration
{
    public function up()
    {
        // tbl_users: Chef filtering + geospatial
        DB::statement('ALTER TABLE tbl_users ADD INDEX idx_chef_search (user_type, is_pending, verified)');
        DB::statement('ALTER TABLE tbl_users ADD INDEX idx_lat_lng (latitude, longitude)');

        // tbl_availabilities: JOIN performance
        DB::statement('ALTER TABLE tbl_availabilities ADD INDEX idx_user_id (user_id)');

        // tbl_reviews: Batch loading
        DB::statement('ALTER TABLE tbl_reviews ADD INDEX idx_to_user_id (to_user_id)');

        // tbl_menus: Batch loading
        DB::statement('ALTER TABLE tbl_menus ADD INDEX idx_user_id_live (user_id, is_live)');

        // tbl_customizations: Batch loading
        DB::statement('ALTER TABLE tbl_customizations ADD INDEX idx_menu_id (menu_id)');
    }

    public function down()
    {
        DB::statement('ALTER TABLE tbl_users DROP INDEX idx_chef_search');
        DB::statement('ALTER TABLE tbl_users DROP INDEX idx_lat_lng');
        DB::statement('ALTER TABLE tbl_availabilities DROP INDEX idx_user_id');
        DB::statement('ALTER TABLE tbl_reviews DROP INDEX idx_to_user_id');
        DB::statement('ALTER TABLE tbl_menus DROP INDEX idx_user_id_live');
        DB::statement('ALTER TABLE tbl_customizations DROP INDEX idx_menu_id');
    }
}
```

### 1.3 Impact

| Query | Before | After | Improvement |
|-------|--------|-------|-------------|
| Main chef query | Full scan ~200 rows | Index seek | 50-70% faster |
| Availability JOIN | Full scan | Index lookup | 30-50% faster |
| Reviews batch load | Full scan | Index seek | 40-60% faster |
| Menus batch load | Full scan | Index seek | 40-60% faster |
| Customizations load | Full scan | Index seek | 40-60% faster |

**Effort:** 30 minutes
**Risk:** Low (additive change)

---

## 2. BOUNDING BOX PRE-FILTER FOR GEOSPATIAL QUERY

### 2.1 Problem Analysis

The current query calculates Haversine distance for **every chef row** before filtering:

[MapiController.php:3074-3076](../backend/app/Http/Controllers/MapiController.php#L3074-L3076)
```php
->whereRaw("
    (3959 * acos(cos(radians(?)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(?)) + sin(radians(?)) * sin(radians(u.latitude)))) <= ?
", [$user->latitude, $user->longitude, $user->latitude, $radius])
```

This trigonometry calculation runs on every row, even if the chef is 1000 miles away.

### 2.2 Solution: Add Bounding Box Pre-Filter

Add a simple lat/lng bounding box that can use indexes to eliminate obviously-distant chefs before the expensive Haversine calculation:

```php
// Add before the main query (around line 3066)
// Bounding box pre-filter: 1 degree latitude ≈ 69 miles
$latDelta = $radius / 69;
$lngDelta = $radius / (69 * cos(deg2rad($user->latitude)));

$minLat = $user->latitude - $latDelta;
$maxLat = $user->latitude + $latDelta;
$minLng = $user->longitude - $lngDelta;
$maxLng = $user->longitude + $lngDelta;

$data = DB::table('tbl_users as u')
    ->leftJoin('tbl_availabilities as a', 'a.user_id', '=', 'u.id')
    ->where([
        'u.user_type' => 2,
        'u.is_pending' => 0,
        'u.verified' => 1
    ])
    // BOUNDING BOX: Eliminates distant chefs using index
    ->whereBetween('u.latitude', [$minLat, $maxLat])
    ->whereBetween('u.longitude', [$minLng, $maxLng])
    // Then apply precise Haversine for remaining candidates
    ->whereRaw("
        (3959 * acos(cos(radians(?)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians(?)) + sin(radians(?)) * sin(radians(u.latitude)))) <= ?
    ", [$user->latitude, $user->longitude, $user->latitude, $radius])
    // ... rest of query
```

### 2.3 Impact

- Reduces rows evaluated by Haversine by 80-95%
- Works well with the lat/lng index from Step 1
- Simple math that runs once per request (not per row)

**Effort:** 15 minutes
**Risk:** Low

---

## 3. FIX N+1 QUERIES IN RELATED ENDPOINTS

### 3.1 Problem Analysis

Three endpoints have classic N+1 query patterns:

#### getChefMenus() - [MapiController.php:3197-3210](../backend/app/Http/Controllers/MapiController.php#L3197-L3210)
```php
$data = app(Menus::class)->whereRaw("user_id = '" . $request->user_id . "' ...")->get();
foreach ($data as &$item) {
    // N+1: One query per menu!
    $item->customizations = app(Customizations::class)->where(['menu_id' => $item->id])->get();
}
```

#### getOrdersByChef() - [MapiController.php:3224-3237](../backend/app/Http/Controllers/MapiController.php#L3224-L3237)
```php
$data = DB::table('tbl_orders as o')...->get();
foreach ($data as &$item) {
    // N+1: One query per order!
    $item->customizations = app(Customizations::class)->where(['menu_id' => $item->menu_id])->get();
}
```

#### getOrdersByCustomer() - [MapiController.php:3239-3252](../backend/app/Http/Controllers/MapiController.php#L3239-L3252)
```php
// Same N+1 pattern as above
```

### 3.2 Solution: Batch Load Pattern

Apply the same batch loading pattern already used in `getSearchChefs`:

```php
// getChefMenus() - FIXED
public function getChefMenus(Request $request)
{
    // ... auth check ...

    $data = app(Menus::class)
        ->where('user_id', $request->user_id)  // Use parameterized query!
        ->whereRaw('FIND_IN_SET(?, allergens) = 0', [$request->allergen])
        ->get();

    // Batch load all customizations in ONE query
    $menuIds = $data->pluck('id')->toArray();
    $customizationsByMenu = !empty($menuIds)
        ? app(Customizations::class)->whereIn('menu_id', $menuIds)->get()->groupBy('menu_id')
        : collect();

    // Assign to each menu (no additional queries)
    foreach ($data as &$item) {
        $item->customizations = $customizationsByMenu->get($item->id, collect());
    }

    return response()->json(['success' => 1, 'data' => $data]);
}
```

```php
// getOrdersByChef() - FIXED
public function getOrdersByChef(Request $request)
{
    // ... auth check ...

    $data = DB::table('tbl_orders as o')
        ->leftJoin('tbl_reviews as r', 'r.order_id', '=', 'o.id')
        ->where('o.chef_user_id', $request->user_id)
        ->where('o.created_at', '>=', $request->start_time)
        ->where('o.created_at', '<', $request->end_time)
        ->select(['o.*', 'r.rating', 'r.review', 'r.tip_amount'])
        ->orderBy('o.id', 'DESC')
        ->get();

    // Batch load customizations
    $menuIds = $data->pluck('menu_id')->unique()->toArray();
    $customizationsByMenu = !empty($menuIds)
        ? app(Customizations::class)->whereIn('menu_id', $menuIds)->get()->groupBy('menu_id')
        : collect();

    foreach ($data as &$item) {
        $item->customizations = $customizationsByMenu->get($item->menu_id, collect());
    }

    return response()->json(['success' => 1, 'data' => $data]);
}
```

### 3.3 Security Fix (Bonus)

The current code has SQL injection vulnerabilities:

[MapiController.php:3204](../backend/app/Http/Controllers/MapiController.php#L3204)
```php
// VULNERABLE:
$data = app(Menus::class)->whereRaw("user_id = '" . $request->user_id . "' AND FIND_IN_SET('" . $request->allergen . "', 'allergens') = 0")->get();

// FIXED:
$data = app(Menus::class)
    ->where('user_id', $request->user_id)
    ->whereRaw('FIND_IN_SET(?, allergens) = 0', [$request->allergen])
    ->get();
```

### 3.4 Impact

| Endpoint | Queries Before | Queries After | Improvement |
|----------|---------------|---------------|-------------|
| getChefMenus (10 menus) | 11 | 2 | 82% fewer queries |
| getOrdersByChef (50 orders) | 51 | 2 | 96% fewer queries |
| getOrdersByCustomer (30 orders) | 31 | 2 | 94% fewer queries |

**Effort:** 30 minutes
**Risk:** Low

---

## 4. ADD RESPONSE CACHING

### 4.1 Problem Analysis

[MapiController.php](../backend/app/Http/Controllers/MapiController.php) has **zero caching**. The expensive chef search query runs fresh on every request, even when:
- Same user searches again within seconds
- Multiple users in same area search simultaneously
- Filters change but location stays the same

### 4.2 Solution: Add Redis/Cache Layer

```php
use Illuminate\Support\Facades\Cache;

public function getSearchChefs(Request $request, $id)
{
    // ... auth checks ...

    // Build cache key from search parameters
    $cacheKey = sprintf(
        'chef_search:%s:%s:%s:%s:%s',
        round($user->latitude, 2),  // Round to ~1 mile precision
        round($user->longitude, 2),
        $request->week_day ?? 'any',
        $request->time_slot ?? 'any',
        $request->category_id ?? 'any'
    );

    // Cache for 5 minutes (300 seconds)
    $data = Cache::remember($cacheKey, 300, function() use ($request, $user, $radius) {
        // ... existing expensive query logic ...
        return $this->executeChefSearchQuery($request, $user, $radius);
    });

    return response()->json(['success' => 1, 'data' => $data]);
}
```

### 4.3 Cache Invalidation

Add cache clearing when chef data changes:

```php
// When chef updates availability
Cache::tags(['chef_search'])->flush();

// Or more granular:
// When specific chef updates, clear searches that might include them
```

### 4.4 Impact

- **First request:** Same as before (~1-2s)
- **Subsequent requests (cache hit):** 10-50ms
- **Cache hit rate:** Estimated 60-80% for active users

**Effort:** 1-2 hours
**Risk:** Medium (need to handle cache invalidation properly)

---

## 5. REFACTOR TIME FILTERING LOGIC (Medium Priority)

### 5.1 Problem Analysis

The `$whereDayTime` construction spans **105 lines** of nearly-identical code:

[MapiController.php:2953-3058](../backend/app/Http/Controllers/MapiController.php#L2953-L3058)

```php
// Lines 2954-2968: Monday logic
if ($request->week_day == 1) {
    $whereDayTime .= " monday_start != 0 AND monday_end != 0";
    if (isset($request->time_slot) && isset($request->timezone_gap)) {
        if ($request->time_slot == 1) {
            $whereDayTime .= " AND ((HOUR(convert_tz(from_unixtime(monday_start), '+00:00', time_format(sec_to_time(" . $request->timezone_gap . " * 60 * 60), '%H:%i'))) >= 5 ...";
        } else if ($request->time_slot == 2) { /* ... */ }
        else if ($request->time_slot == 3) { /* ... */ }
        else if ($request->time_slot == 4) { /* ... */ }
    }
}
// Lines 2969-2983: Tuesday logic (copy-paste of Monday with "tuesday" instead)
// Lines 2984-2998: Wednesday logic (copy-paste...)
// ... repeated for all 7 days
```

Issues:
1. 7 days × 4 time slots = 28 nearly-identical code blocks
2. Complex MySQL functions (`convert_tz`, `from_unixtime`, `HOUR`) run per-row
3. Timezone conversion happens in database (slow)
4. Impossible to maintain or debug
5. Note: Saturday is misspelled as "saterday" in DB schema

### 5.2 Solution: Extract Helper Method

```php
private function buildDayTimeFilter($weekDay, $timeSlot, $timezoneGap)
{
    $days = [
        0 => 'sunday',
        1 => 'monday',
        2 => 'tuesday',
        3 => 'wednesday',
        4 => 'thursday',
        5 => 'friday',
        6 => 'saterday'  // Matches DB column spelling
    ];

    $day = $days[$weekDay] ?? null;
    if (!$day) return '1=1';  // No filter if invalid day

    $startCol = "{$day}_start";
    $endCol = "{$day}_end";

    // Basic availability check
    $filter = "{$startCol} != 0 AND {$endCol} != 0";

    if ($timeSlot && $timezoneGap !== null) {
        $timeRanges = [
            1 => [5, 11],   // Breakfast
            2 => [11, 16],  // Lunch
            3 => [16, 22],  // Dinner
            4 => [22, 5],   // Late (wraps around midnight)
        ];

        if (isset($timeRanges[$timeSlot])) {
            [$start, $end] = $timeRanges[$timeSlot];
            $filter .= $this->buildTimeSlotCondition($startCol, $endCol, $start, $end, $timezoneGap);
        }
    }

    return $filter;
}

private function buildTimeSlotCondition($startCol, $endCol, $rangeStart, $rangeEnd, $tzGap)
{
    $tzOffset = "time_format(sec_to_time({$tzGap} * 60 * 60), '%H:%i')";
    $startHour = "HOUR(convert_tz(from_unixtime({$startCol}), '+00:00', {$tzOffset}))";
    $endHour = "HOUR(convert_tz(from_unixtime({$endCol}), '+00:00', {$tzOffset}))";

    if ($rangeStart < $rangeEnd) {
        // Normal range (e.g., 5-11, 11-16, 16-22)
        return " AND (
            ({$startHour} >= {$rangeStart} AND {$startHour} < {$rangeEnd})
            OR ({$endHour} > {$rangeStart} AND {$endHour} <= {$rangeEnd})
            OR ({$startHour} <= {$rangeStart} AND {$endHour} > {$rangeEnd})
        )";
    } else {
        // Overnight range (22-5)
        return " AND (
            ({$startHour} >= {$rangeStart} OR {$startHour} < {$rangeEnd})
            OR ({$endHour} > {$rangeStart} OR {$endHour} <= {$rangeEnd})
        )";
    }
}
```

Usage in main method:
```php
$whereDayTime = $this->buildDayTimeFilter(
    $request->week_day,
    $request->time_slot ?? null,
    $request->timezone_gap ?? null
);
```

### 5.3 Impact

- Reduces code from 105 lines to ~40 lines
- Makes the logic testable and maintainable
- No performance change (same SQL generated)
- Easier to fix bugs in time filtering

**Effort:** 2-3 hours
**Risk:** Medium (need thorough testing of all day/time combinations)

---

## 6. LONG-TERM: SCHEMA IMPROVEMENTS

### 6.1 Fix Latitude/Longitude Data Types

Current: `VARCHAR(45)` - requires string-to-number conversion on every comparison

[taist-schema.sql:498-499](../backend/database/taist-schema.sql#L498-L499)
```sql
`latitude` varchar(45) DEFAULT NULL,
`longitude` varchar(45) DEFAULT NULL,
```

Should be:
```sql
`latitude` DECIMAL(10, 8) DEFAULT NULL,
`longitude` DECIMAL(11, 8) DEFAULT NULL,
```

**Impact:** Better index usage, no type coercion overhead
**Effort:** 1-2 hours (migration + data conversion)
**Risk:** Medium (need to update all code that reads/writes lat/lng)

### 6.2 Replace FIND_IN_SET with Junction Table

Current: `category_ids` stored as comma-separated string, queried with non-indexable `FIND_IN_SET`:

[MapiController.php:3097](../backend/app/Http/Controllers/MapiController.php#L3097)
```php
$menusQuery->whereRaw('FIND_IN_SET("' . $request->category_id . '", category_ids) > 0');
```

Should be:
```sql
CREATE TABLE tbl_menu_categories (
    menu_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (menu_id, category_id),
    INDEX idx_category_id (category_id)
);
```

**Impact:** Enables indexed category filtering
**Effort:** 4-6 hours (migration, data conversion, code updates)
**Risk:** High (significant schema change)

---

## Implementation Priority

### Phase 1: Quick Wins (Do First)
| Task | Effort | Impact | Risk |
|------|--------|--------|------|
| 1. Add database indexes | 30 min | HIGH | Low |
| 2. Add bounding box pre-filter | 15 min | MEDIUM | Low |
| 3. Fix N+1 queries | 30 min | MEDIUM | Low |

**Expected improvement: 2-3x faster**

### Phase 2: Caching
| Task | Effort | Impact | Risk |
|------|--------|--------|------|
| 4. Add Redis caching | 1-2 hrs | HIGH | Medium |

**Expected improvement: 5-10x faster for cache hits**

### Phase 3: Code Quality
| Task | Effort | Impact | Risk |
|------|--------|--------|------|
| 5. Refactor time filtering | 2-3 hrs | LOW (maintainability) | Medium |

### Phase 4: Schema Changes (Future)
| Task | Effort | Impact | Risk |
|------|--------|--------|------|
| 6a. Fix lat/lng types | 1-2 hrs | MEDIUM | Medium |
| 6b. Junction table for categories | 4-6 hrs | MEDIUM | High |

---

## Testing Plan

### Before Implementation
1. Measure current response times with logging
2. Use Laravel Telescope or Debugbar to profile queries
3. Document baseline metrics

### After Each Phase
1. Re-measure response times
2. Compare query counts and execution times
3. Verify no regressions in functionality

### Suggested Test Cases
- Search with no filters
- Search with day filter only
- Search with day + time slot
- Search with category filter
- Search from different geographic locations
- Rapid repeated searches (cache testing)

---

## Files to Modify

| File | Changes |
|------|---------|
| `backend/database/migrations/2025_12_12_000001_add_chef_search_performance_indexes.php` | NEW - Add indexes |
| `backend/app/Http/Controllers/MapiController.php` | Lines 2953-3085: Add bounding box, refactor time logic |
| `backend/app/Http/Controllers/MapiController.php` | Lines 3197-3252: Fix N+1 queries |
| `backend/app/Http/Controllers/MapiController.php` | Add caching layer |

---

## Summary

The chef search performance can be improved **3-5x** with straightforward changes:

1. **Database indexes** - Biggest impact, lowest risk
2. **Bounding box** - Simple math optimization
3. **N+1 fixes** - Standard batch loading pattern
4. **Caching** - Eliminates redundant queries

Total effort for Phase 1-2: ~3-4 hours
Expected improvement: 3-10x faster response times
