# String DateTime Conversion Plan

## Executive Summary

**Problem:** Timezone bugs occur when ordering near date boundaries because:
- Frontend sends Unix timestamp
- Backend uses different timezones in different places
- "Today" calculated inconsistently

**Solution:** Store orders as separate date/time strings in chef's local timezone, plus a UTC timestamp for scheduling.

**Impact:** Orders are calendar events ("Friday 10 AM at chef's location"), not point-in-time events.

---

## Priority Task List

### HIGH PRIORITY (Order System - Causes Bugs Now)

| # | Task | Depends On | File(s) | Status |
|---|------|------------|---------|--------|
| 1 | Add database columns | - | Migration | ✅ DONE |
| 2 | Backfill existing orders | 1 | Migration | ✅ DONE |
| 3 | Update Orders model | 1 | `Orders.php` | ✅ DONE |
| 4 | Update createOrder API | 1, 3 | `MapiController.php` | |
| 5 | Update isAvailableForOrder | 1 | `Listener.php` | |
| 6 | Update SendOrderReminders | 1 | `SendOrderReminders.php` | |
| 7 | Update OrderSmsService | 1 | `OrderSmsService.php` | |
| 8 | Update frontend checkout | 4 | `checkout/index.tsx` | |
| 9 | Update order display | 1 | Various frontend | |
| 10 | Test & deploy | 1-9 | - | |

### LOW PRIORITY (Weekly Schedule - Works Currently)

| # | Task | Depends On | File(s) |
|---|------|------------|---------|
| 11 | Migrate availability times to strings | - | Migration |
| 12 | Update getSearchChefs time slot SQL | 11 | `MapiController.php` |
| 13 | Update ChefConfirmationReminderService | 11 | `ChefConfirmationReminderService.php` |

### NO CHANGES NEEDED

- GoLiveToggle / Availability Overrides (already correct)
- Frontend weekly schedule saving (already uses strings)
- TimezoneHelper (complete)

---

## Implementation Details

---

### Task 1: Add Database Columns ✅ DONE

**Priority:** HIGH
**Depends on:** Nothing
**File:** `backend/database/migrations/2026_01_08_000001_add_order_datetime_fields.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->date('order_date_new')->nullable()->after('order_date');
            $table->string('order_time', 5)->nullable()->after('order_date_new');  // "HH:MM"
            $table->string('order_timezone', 50)->nullable()->after('order_time');
            $table->unsignedBigInteger('order_timestamp')->nullable()->after('order_timezone');
            $table->index('order_timestamp');
        });
    }

    public function down()
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropIndex(['order_timestamp']);
            $table->dropColumn(['order_date_new', 'order_time', 'order_timezone', 'order_timestamp']);
        });
    }
};
```

---

### Task 2: Backfill Existing Orders ✅ DONE

**Priority:** HIGH
**Depends on:** Task 1
**File:** `backend/database/migrations/2026_01_08_000002_backfill_order_datetime_fields.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Orders;
use App\Listener;
use App\Helpers\TimezoneHelper;
use DateTime;
use DateTimeZone;

return new class extends Migration
{
    public function up()
    {
        Orders::whereNull('order_date_new')
            ->chunkById(100, function ($orders) {
                foreach ($orders as $order) {
                    $timestamp = (int) $order->order_date;
                    if ($timestamp <= 0) continue;

                    $chef = Listener::find($order->chef_user_id);
                    $chefTimezone = $chef
                        ? TimezoneHelper::getTimezoneForState($chef->state)
                        : TimezoneHelper::getDefaultTimezone();

                    $dt = new DateTime("@{$timestamp}");
                    $dt->setTimezone(new DateTimeZone($chefTimezone));

                    $order->update([
                        'order_date_new' => $dt->format('Y-m-d'),
                        'order_time' => $dt->format('H:i'),
                        'order_timezone' => $chefTimezone,
                        'order_timestamp' => $timestamp,
                    ]);
                }
            });
    }

    public function down()
    {
        Orders::whereNotNull('order_date_new')->update([
            'order_date_new' => null,
            'order_time' => null,
            'order_timezone' => null,
            'order_timestamp' => null,
        ]);
    }
};
```

---

### Task 3: Update Orders Model ✅ DONE

**Priority:** HIGH
**Depends on:** Task 1
**File:** `backend/app/Models/Orders.php`

**Add to $fillable array:**
```php
'order_date_new',
'order_time',
'order_timezone',
'order_timestamp',
```

**Add casts:**
```php
protected $casts = [
    'order_timestamp' => 'integer',
];
```

**Add helper method:**
```php
/**
 * Get the order's scheduled datetime in the chef's timezone
 */
public function getScheduledDateTimeAttribute(): ?DateTime
{
    if (!$this->order_date_new || !$this->order_time) {
        return null;
    }
    $tz = $this->order_timezone ?? 'America/Chicago';
    return new DateTime("{$this->order_date_new} {$this->order_time}", new DateTimeZone($tz));
}
```

---

### Task 4: Update createOrder API

**Priority:** HIGH
**Depends on:** Task 1, Task 3
**File:** `backend/app/Http/Controllers/MapiController.php`
**Function:** `createOrder()` (starts ~line 2318)

**Add after chef lookup (~line 2377):**
```php
// Get chef's timezone for all date/time operations
$chefTimezone = TimezoneHelper::getTimezoneForState($chef->state);

// Detect format and normalize to strings + timestamp
if (is_numeric($request->order_date)) {
    // Legacy format: Unix timestamp
    $orderTimestamp = (int) $request->order_date;
    $dt = new DateTime("@{$orderTimestamp}");
    $dt->setTimezone(new DateTimeZone($chefTimezone));
    $orderDateStr = $dt->format('Y-m-d');
    $orderTimeStr = $dt->format('H:i');
} else {
    // New format: separate date and time strings
    $orderDateStr = $request->order_date;
    $orderTimeStr = $request->order_time;

    if (!$orderTimeStr) {
        return response()->json(['success' => 0, 'error' => 'order_time is required when order_date is a string']);
    }

    $dt = new DateTime("{$orderDateStr} {$orderTimeStr}", new DateTimeZone($chefTimezone));
    $orderTimestamp = $dt->getTimestamp();
}

$orderDateOnly = $orderDateStr;
$orderTime = $orderTimeStr;
$chefToday = TimezoneHelper::getTodayInTimezone($chefTimezone);
$todayDateOnly = $chefToday;
```

**Update order creation (~line 2470):**
```php
$order = app(Orders::class)->create([
    // ... existing fields ...
    'order_date' => $orderTimestamp,           // Keep for backward compat
    'order_date_new' => $orderDateStr,         // New string date
    'order_time' => $orderTimeStr,             // New string time
    'order_timezone' => $chefTimezone,         // Chef's timezone
    'order_timestamp' => $orderTimestamp,      // UTC timestamp
    // ... rest of fields ...
]);
```

---

### Task 5: Update isAvailableForOrder

**Priority:** HIGH
**Depends on:** Task 1
**File:** `backend/app/Listener.php`
**Function:** `isAvailableForOrder()` (line 116)

**Replace with backward-compatible version:**
```php
public function isAvailableForOrder($orderDate, $orderTimeOrTimezone = null, $deprecatedTimezone = null)
{
    // Detect if called with new signature (date, time) or old signature (date, timezone)
    if ($orderTimeOrTimezone && preg_match('/^\d{2}:\d{2}$/', $orderTimeOrTimezone)) {
        // New signature: isAvailableForOrder("2025-01-10", "10:00")
        $orderDateOnly = $orderDate;
        $orderTime = $orderTimeOrTimezone;
    } else {
        // Old signature: isAvailableForOrder(timestamp, timezone)
        $timezone = $orderTimeOrTimezone;
        $orderTimestamp = is_numeric($orderDate) ? (int)$orderDate : strtotime($orderDate);

        if (!$orderTimestamp || $orderTimestamp <= 0) {
            \Log::warning("[AVAILABILITY] Invalid order date: " . var_export($orderDate, true));
            return false;
        }

        $orderDateOnly = date('Y-m-d', $orderTimestamp);
        $orderTime = date('H:i', $orderTimestamp);
    }

    $chefTimezone = \App\Helpers\TimezoneHelper::getTimezoneForState($this->state);
    $today = \App\Helpers\TimezoneHelper::getTodayInTimezone($chefTimezone);

    $override = \App\Models\AvailabilityOverride::forChef($this->id)->forDate($orderDateOnly)->first();
    if ($override) {
        return $override->isAvailableAt($orderTime);
    }

    if ($orderDateOnly === $today) {
        return false;
    }

    return $this->hasScheduleForDateTime($orderDateOnly, $orderTime);
}
```

---

### Task 6: Update SendOrderReminders

**Priority:** HIGH
**Depends on:** Task 1
**File:** `backend/app/Console/Commands/SendOrderReminders.php`

**Change lines 56-60 from:**
```php
->where('order_date', '>=', (string)$windowStart)
->where('order_date', '<=', (string)$windowEnd)
```

**To:**
```php
->where('order_timestamp', '>=', $windowStart)
->where('order_timestamp', '<=', $windowEnd)
```

---

### Task 7: Update OrderSmsService

**Priority:** HIGH
**Depends on:** Task 1
**File:** `backend/app/Services/OrderSmsService.php`

**Change line 310 to (with fallback):**
```php
if ($order->order_date_new && $order->order_time) {
    $dateFormatted = date('M j', strtotime($order->order_date_new));
    $timeFormatted = date('g:i A', strtotime($order->order_time));
    $orderDateTime = [
        'formatted' => "{$dateFormatted}, {$timeFormatted}",
        'time' => $timeFormatted,
        'timezone' => $order->order_timezone ?? TimezoneHelper::getTimezoneForState($chef->state),
    ];
} else {
    $orderDateTime = TimezoneHelper::formatForSms((int)$order->order_date, $chef->state);
}
```

---

### Task 8: Update Frontend Checkout

**Priority:** HIGH
**Depends on:** Task 4
**File:** `frontend/app/screens/customer/checkout/index.tsx`

**Change lines 407-408:**
```typescript
// FROM:
const order_datetime = day.toDate().getTime() / 1000;

// TO:
const order_date_str = day.format('YYYY-MM-DD');
const order_time_str = day.format('HH:mm');
```

**Change lines 445-450:**
```typescript
// FROM:
order_date: order_datetime,

// TO:
order_date: order_date_str,    // "2025-01-10"
order_time: order_time_str,    // "10:00"
```

**Also update `frontend/app/types/order.interface.ts`:**
```typescript
order_date?: string | number;  // Accept both during migration
```

---

### Task 9: Update Order Display Components

**Priority:** HIGH
**Depends on:** Task 1
**Files to check:**
- `frontend/app/screens/customer/orderDetail/index.tsx`
- `frontend/app/screens/chef/orderDetail/index.tsx`
- `frontend/app/screens/customer/orders/components/orderCard.tsx`

Look for code converting `order_date` timestamp to display string. Update to use `order_date_new` + `order_time` strings directly when available.

---

### Task 10: Test & Deploy

**Priority:** HIGH
**Depends on:** Tasks 1-9

**Deployment order:**
1. Deploy migration (add columns, backfill)
2. Deploy backend (accepts both formats)
3. Deploy frontend (sends new format)
4. Monitor for errors
5. Later: Rename columns, remove legacy code

**Test cases:**
- Old timestamp format still works
- New string format works
- Ordering at 11 PM Central for next day (timezone edge case)
- Reminders find orders correctly

---

### Task 11: Migrate Weekly Schedule Data

**Priority:** LOW
**Depends on:** Nothing
**File:** `backend/database/migrations/XXXX_convert_availability_times_to_strings.php`

**Note:** Only needed if time slot filtering is used. Basic home screen works without this.

```php
public function up()
{
    $availabilities = Availabilities::all();
    foreach ($availabilities as $avail) {
        foreach (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saterday', 'sunday'] as $day) {
            $startField = "{$day}_start";
            $endField = "{$day}_end";

            if ($avail->$startField && is_numeric($avail->$startField)) {
                $avail->$startField = date('H:i', (int)$avail->$startField);
            }
            if ($avail->$endField && is_numeric($avail->$endField)) {
                $avail->$endField = date('H:i', (int)$avail->$endField);
            }
        }
        $avail->save();
    }
}
```

---

### Task 12: Update getSearchChefs Time Slot SQL

**Priority:** LOW
**Depends on:** Task 11
**File:** `backend/app/Http/Controllers/MapiController.php` (lines 3189-3285)

**Note:** Only affects time slot filtering (Morning/Afternoon/Evening/Night). Basic day filtering works for all formats.

Replace complex `from_unixtime()` SQL with:
```php
$whereDayTime .= " AND TIME(monday_start) >= '05:00' AND TIME(monday_start) < '11:00'";
```

---

### Task 13: Update ChefConfirmationReminderService

**Priority:** LOW
**Depends on:** Task 11
**File:** `backend/app/Services/ChefConfirmationReminderService.php`

**Add format detection at line 246:**
```php
// Handle both formats
if (is_numeric($scheduledStart)) {
    $scheduledStart = date('H:i', (int)$scheduledStart);
}
if (is_numeric($scheduledEnd)) {
    $scheduledEnd = date('H:i', (int)$scheduledEnd);
}

$tomorrowStart = Carbon::parse("$tomorrowDate $scheduledStart", $chefTimezone);
```

---

## Reference

### Why Strings Instead of Timestamps?

| Type | Example | Best Practice |
|------|---------|---------------|
| **Point in Time** | "User logged in" | UTC timestamp |
| **Calendar Event** | "Delivery at 10 AM" | Local date/time + timezone |

Orders are calendar events - "Friday 10 AM" means 10 AM at chef's location.

### Why Chef's Timezone?

The order happens at chef's location:
- Customer in NYC ordering from Chicago chef → Chicago time
- Customer in LA ordering from Chicago chef → Chicago time

### Field Reference

| Field | Format | Used For |
|-------|--------|----------|
| `order_date_new` | "2025-01-10" | Display, availability checks |
| `order_time` | "10:00" | Display, availability checks |
| `order_timezone` | "America/Chicago" | Recalculating if needed |
| `order_timestamp` | 1736521200 | Scheduling, time-based queries |
| `order_date` (legacy) | "1736521200" | Backward compat |

### Files Reference

| File | Lines | What |
|------|-------|------|
| `tbl_orders` schema | 352-382 | order_date is varchar(50) |
| `tbl_availabilities` schema | 219-232 | day times are varchar(50) |
| `SendOrderReminders.php` | 56-60 | String comparison bug |
| `OrderSmsService.php` | 310 | Formats order time for SMS |
| `MapiController.php` | 2324, 2332, 2470, 2537, 3849, 4554 | order_date usage |
| `MapiController.php` | 3189-3285 | Time slot SQL (conditional) |
| `checkout/index.tsx` | 408, 448 | Creates/sends timestamp |
| `chef/profile/index.tsx` | 336-341 | getTimeString (already strings) |
| `ChefConfirmationReminderService.php` | 246 | Carbon::parse with schedule |

### TimezoneHelper Methods

| Method | Purpose |
|--------|---------|
| `getTimezoneForState($state)` | "IL" → "America/Chicago" |
| `getTodayInTimezone($tz)` | "2025-01-10" in timezone |
| `formatForSms($ts, $state)` | Format for SMS |
| `getDefaultTimezone()` | "America/Chicago" |
