# Timezone Standardization Plan

> **Status: IMPLEMENTED** (December 24, 2024)

## Executive Summary

**Problem:** The arrival time displayed in the app may differ from the arrival time shown in SMS notifications by 1+ hours, depending on the user's device timezone settings.

**Root Cause:** SMS notifications hardcode `America/Chicago`, while the frontend uses the device's local timezone (via moment.js with no explicit timezone).

**Solution:** Use the chef's location (state) to determine the correct timezone for both app display AND SMS notifications, ensuring consistency.

## Implementation Summary

The following changes were made to implement timezone standardization:

### Backend
- **NEW:** `backend/app/Helpers/TimezoneHelper.php` - Maps US states to IANA timezones
- **UPDATED:** `backend/app/Services/OrderSmsService.php` - Uses chef's state for timezone
- **UPDATED:** `backend/app/Http/Controllers/MapiController.php` - Returns `timezone` in order API, fixes email receipt

### Frontend
- **UPDATED:** `frontend/package.json` - Added `moment-timezone` dependency
- **UPDATED:** `frontend/app/utils/validations.ts` - Added timezone-aware formatting functions
- **UPDATED:** `frontend/app/types/order.interface.ts` - Added `timezone` field
- **UPDATED:** `frontend/app/screens/customer/orderDetail/index.tsx` - Uses timezone from API
- **UPDATED:** `frontend/app/screens/chef/orderDetail/index.tsx` - Uses timezone from API

### Post-Deployment Steps
1. Run `cd frontend && npm install` to install moment-timezone
2. Deploy backend first (API change is backwards compatible)
3. Deploy frontend

---

## Current State Analysis

### Where Timezone is Used

| Component | File | Line(s) | Current Behavior |
|-----------|------|---------|------------------|
| SMS Notifications | `backend/app/Services/OrderSmsService.php` | 340 | Hardcoded `America/Chicago` |
| Email Receipt | `backend/app/Http/Controllers/MapiController.php` | 3705-3707 | Hardcoded `America/Chicago` |
| Frontend Display | `frontend/app/utils/validations.ts` | 112-115, 122-125 | Device timezone (moment.js default) |
| Backend Config | `backend/config/app.php` | 70 | `UTC` |
| Admin Panel Config | `backend/config/admin.php` | 15 | `America/Los_Angeles` |

### Data Flow for Order Times

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CHECKOUT SCREEN (frontend/app/screens/customer/checkout/index.tsx)          │
│                                                                             │
│ 1. User selects date from calendar                                          │
│ 2. User selects time slot (e.g., "2:00 pm")                                 │
│ 3. Creates moment object with selected date/time                            │
│ 4. Converts to Unix timestamp: day.toDate().getTime() / 1000  (line 390)    │
│                                                                             │
│ NOTE: This timestamp is created in DEVICE LOCAL TIME                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND - Order Storage                                                     │
│                                                                             │
│ Stores `order_date` as Unix timestamp (seconds)                             │
│ Unix timestamps are timezone-agnostic (absolute moment in time)             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────────────┐
│ SMS NOTIFICATION               │   │ APP DISPLAY                           │
│                               │   │                                       │
│ OrderSmsService.php:336-358   │   │ validations.ts:112-115                │
│                               │   │                                       │
│ $tz = 'America/Chicago';      │   │ moment(date).format('MMM DD, YYYY     │
│ $dateTime->setTimezone($tz);  │   │   hh:mm A')                           │
│ $dateTime->setTimestamp($ts); │   │                                       │
│ → "Dec 24, 2PM"              │   │ Uses DEVICE timezone (implicit)       │
│                               │   │ → Could be different!                 │
└───────────────────────────────┘   └───────────────────────────────────────┘
```

### The Problem Scenario

**Example:** Customer in Denver (Mountain Time) orders from Chicago chef

1. **Checkout:** Customer selects "2:00 PM" on Dec 24
   - Their device is in Mountain Time (UTC-7)
   - Creates timestamp for 2 PM Mountain = 9 PM UTC = `1735077600`

2. **SMS Notification:** Uses `America/Chicago` (UTC-6)
   - Formats `1735077600` → "3:00 PM" Central Time
   - SMS says: "arriving around 3:00 PM"

3. **App Display:** Uses device timezone (Mountain)
   - Formats `1735077600` → "2:00 PM" Mountain Time
   - App shows: "Dec 24, 2024 02:00 PM"

**Result:** SMS says 3 PM, App says 2 PM. User is confused.

---

## Solution: Chef Location-Based Timezone

### Why Chef's Location?

1. **The chef is cooking at their location** - the service happens in the chef's timezone
2. **Chef's availability is set in their local time** - "9 AM - 5 PM" means their local time
3. **Delivery happens at customer's location** - but customer is typically near the chef (same service area)
4. **Industry standard** - DoorDash, Uber Eats display times in the restaurant/service location timezone

### Implementation Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NEW FLOW                                                                    │
│                                                                             │
│ 1. Chef has `state` field (already exists in tbl_users)                     │
│ 2. Add TimezoneHelper::getTimezoneForState($state) → 'America/Chicago'      │
│ 3. Backend includes `timezone` in order API response                        │
│ 4. Frontend uses timezone from API for display                              │
│ 5. SMS uses same timezone lookup                                            │
│                                                                             │
│ Result: App and SMS ALWAYS show the same time                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Implementation

### Step 1: Create TimezoneHelper (Backend)

**File:** `backend/app/Helpers/TimezoneHelper.php`

```php
<?php

namespace App\Helpers;

/**
 * Timezone Helper for US-based operations
 *
 * Maps US states to their primary timezone.
 * Note: Some states span multiple timezones (e.g., Indiana, Texas).
 * We use the most common timezone for each state.
 */
class TimezoneHelper
{
    /**
     * US State to Timezone mapping
     * Uses IANA timezone identifiers
     */
    private static $stateTimezones = [
        // Eastern Time (UTC-5 / UTC-4 DST)
        'CT' => 'America/New_York',
        'DE' => 'America/New_York',
        'DC' => 'America/New_York',
        'FL' => 'America/New_York',  // Most of FL is Eastern
        'GA' => 'America/New_York',
        'IN' => 'America/Indiana/Indianapolis',  // Most of IN is Eastern
        'KY' => 'America/New_York',  // Most of KY is Eastern
        'ME' => 'America/New_York',
        'MD' => 'America/New_York',
        'MA' => 'America/New_York',
        'MI' => 'America/Detroit',
        'NH' => 'America/New_York',
        'NJ' => 'America/New_York',
        'NY' => 'America/New_York',
        'NC' => 'America/New_York',
        'OH' => 'America/New_York',
        'PA' => 'America/New_York',
        'RI' => 'America/New_York',
        'SC' => 'America/New_York',
        'VT' => 'America/New_York',
        'VA' => 'America/New_York',
        'WV' => 'America/New_York',

        // Central Time (UTC-6 / UTC-5 DST)
        'AL' => 'America/Chicago',
        'AR' => 'America/Chicago',
        'IL' => 'America/Chicago',
        'IA' => 'America/Chicago',
        'KS' => 'America/Chicago',  // Most of KS is Central
        'LA' => 'America/Chicago',
        'MN' => 'America/Chicago',
        'MS' => 'America/Chicago',
        'MO' => 'America/Chicago',
        'NE' => 'America/Chicago',  // Most of NE is Central
        'ND' => 'America/Chicago',  // Most of ND is Central
        'OK' => 'America/Chicago',
        'SD' => 'America/Chicago',  // Most of SD is Central
        'TN' => 'America/Chicago',  // Most of TN is Central
        'TX' => 'America/Chicago',  // Most of TX is Central
        'WI' => 'America/Chicago',

        // Mountain Time (UTC-7 / UTC-6 DST)
        'AZ' => 'America/Phoenix',  // AZ doesn't observe DST (except Navajo Nation)
        'CO' => 'America/Denver',
        'ID' => 'America/Boise',    // Most of ID is Mountain
        'MT' => 'America/Denver',
        'NM' => 'America/Denver',
        'UT' => 'America/Denver',
        'WY' => 'America/Denver',

        // Pacific Time (UTC-8 / UTC-7 DST)
        'CA' => 'America/Los_Angeles',
        'NV' => 'America/Los_Angeles',
        'OR' => 'America/Los_Angeles',  // Most of OR is Pacific
        'WA' => 'America/Los_Angeles',

        // Alaska Time (UTC-9 / UTC-8 DST)
        'AK' => 'America/Anchorage',

        // Hawaii-Aleutian Time (UTC-10, no DST)
        'HI' => 'Pacific/Honolulu',

        // US Territories
        'PR' => 'America/Puerto_Rico',  // Atlantic Time, no DST
        'VI' => 'America/Virgin',       // Atlantic Time, no DST
        'GU' => 'Pacific/Guam',         // Chamorro Time
        'AS' => 'Pacific/Pago_Pago',    // Samoa Time
    ];

    /**
     * Default timezone if state is unknown or not provided
     */
    private static $defaultTimezone = 'America/Chicago';

    /**
     * Get timezone identifier for a US state
     *
     * @param string|null $state State abbreviation (e.g., 'IL', 'CA') or full name
     * @return string IANA timezone identifier (e.g., 'America/Chicago')
     */
    public static function getTimezoneForState(?string $state): string
    {
        if (empty($state)) {
            return self::$defaultTimezone;
        }

        // Normalize to uppercase 2-letter abbreviation
        $stateAbbrev = AppHelper::getStateAbbreviation($state);
        $stateAbbrev = strtoupper(trim($stateAbbrev));

        return self::$stateTimezones[$stateAbbrev] ?? self::$defaultTimezone;
    }

    /**
     * Format a Unix timestamp for display in a specific state's timezone
     *
     * @param int $timestamp Unix timestamp
     * @param string|null $state State abbreviation or full name
     * @param string $format PHP date format (default: 'M j, gA' = "Dec 24, 2PM")
     * @return string Formatted date/time string
     */
    public static function formatForState(int $timestamp, ?string $state, string $format = 'M j, gA'): string
    {
        try {
            $timezone = self::getTimezoneForState($state);
            $dateTime = new \DateTime();
            $dateTime->setTimezone(new \DateTimeZone($timezone));
            $dateTime->setTimestamp($timestamp);
            return $dateTime->format($format);
        } catch (\Exception $e) {
            \Log::error('TimezoneHelper::formatForState failed', [
                'timestamp' => $timestamp,
                'state' => $state,
                'error' => $e->getMessage()
            ]);
            // Fallback to default timezone
            return date($format, $timestamp);
        }
    }

    /**
     * Get both formatted date and time for SMS templates
     *
     * @param int $timestamp Unix timestamp
     * @param string|null $state State abbreviation or full name
     * @return array ['formatted' => 'Dec 24, 2PM', 'time' => '2:00 PM', 'timezone' => 'America/Chicago']
     */
    public static function formatForSms(int $timestamp, ?string $state): array
    {
        $timezone = self::getTimezoneForState($state);

        try {
            $dateTime = new \DateTime();
            $dateTime->setTimezone(new \DateTimeZone($timezone));
            $dateTime->setTimestamp($timestamp);

            return [
                'formatted' => $dateTime->format('M j, gA'),  // "Dec 24, 2PM"
                'time' => $dateTime->format('g:i A'),         // "2:00 PM"
                'timezone' => $timezone,
            ];
        } catch (\Exception $e) {
            \Log::error('TimezoneHelper::formatForSms failed', [
                'timestamp' => $timestamp,
                'state' => $state,
                'error' => $e->getMessage()
            ]);
            return [
                'formatted' => 'soon',
                'time' => 'soon',
                'timezone' => self::$defaultTimezone,
            ];
        }
    }

    /**
     * Get the default timezone
     *
     * @return string
     */
    public static function getDefaultTimezone(): string
    {
        return self::$defaultTimezone;
    }
}
```

---

### Step 2: Update OrderSmsService (Backend)

**File:** `backend/app/Services/OrderSmsService.php`

**Current code (lines 336-358):**
```php
private function formatOrderDateTime($timestamp)
{
    try {
        $dateTime = new DateTime();
        $timezone = new DateTimeZone('America/Chicago'); // Central time
        $dateTime->setTimezone($timezone);
        $dateTime->setTimestamp((int)$timestamp);

        return [
            'formatted' => $dateTime->format('M j, gA'), // "Dec 4, 2PM"
            'time' => $dateTime->format('g:i A'),        // "2:00 PM"
        ];
    } catch (Exception $e) {
        // ... error handling
    }
}
```

**Updated code:**
```php
use App\Helpers\TimezoneHelper;

// Update getOrderData method to include chef's state
private function getOrderData($orderId)
{
    $order = Orders::find($orderId);
    // ... existing code ...

    $chef = Listener::find($order->chef_user_id);
    // ... existing code ...

    // Format order date/time using chef's timezone
    $orderDateTime = TimezoneHelper::formatForSms((int)$order->order_date, $chef->state);

    return [
        // ... existing fields ...
        'order_date_formatted' => $orderDateTime['formatted'],
        'order_time' => $orderDateTime['time'],
        'timezone' => $orderDateTime['timezone'],  // NEW: include timezone for debugging
    ];
}

// Remove the old formatOrderDateTime method (lines 336-358)
// It's now replaced by TimezoneHelper::formatForSms()
```

---

### Step 3: Update Email Receipt (Backend)

**File:** `backend/app/Http/Controllers/MapiController.php`

**Current code (lines 3704-3707):**
```php
$orderDateTime = new \DateTime();
$timezone = new \DateTimeZone('America/Chicago');
$orderDateTime->setTimezone($timezone);
$orderDateTime->setTimestamp(floor($order->order_date));
```

**Updated code:**
```php
use App\Helpers\TimezoneHelper;

// Get chef for timezone lookup
$chef = app(Listener::class)->where(['id' => $order->chef_user_id])->first();
$formattedDate = TimezoneHelper::formatForState(
    (int)$order->order_date,
    $chef->state ?? null,
    'M d, Y h:i A'
);

// In the email:
$msg .= "<p>Order Date: <b>" . $formattedDate . "</b></p>";
```

---

### Step 4: Update Order API Response (Backend)

**File:** `backend/app/Http/Controllers/MapiController.php`

**Update getOrderData method (around line 2235):**

```php
use App\Helpers\TimezoneHelper;

public function getOrderData(Request $request, $id)
{
    // ... existing auth checks ...

    $data = app(Orders::class)->where(['id' => $id])->first();
    if ($data) {
        $data->chef = app(Listener::class)->where(['id' => $data->chef_user_id])->first();
        $data->customer = app(Listener::class)->where(['id' => $data->customer_user_id])->first();
        $data->menu = app(Menus::class)->where(['id' => $data->menu_id])->first();

        // Add acceptance deadline info if order is in requested status
        if ($data->status == 1 && $data->acceptance_deadline) {
            $data->deadline_info = $data->getDeadlineInfo();
        }

        // NEW: Add timezone for frontend display
        $data->timezone = TimezoneHelper::getTimezoneForState($data->chef->state ?? null);
    }

    return response()->json(['success' => 1, 'data' => $data]);
}
```

---

### Step 5: Update Frontend Time Formatting

**File:** `frontend/app/utils/validations.ts`

**Option A: Install moment-timezone (Recommended)**

```bash
cd frontend
npm install moment-timezone
```

**Updated code:**
```typescript
import moment from 'moment-timezone';

// Keep existing functions for backwards compatibility, add new timezone-aware versions

/**
 * Format date/time in a specific timezone
 * @param date - Unix timestamp in milliseconds or Date object
 * @param timezone - IANA timezone identifier (e.g., 'America/Chicago')
 * @returns Formatted string like "Dec 24, 2024 02:00 PM"
 */
export const getFormattedDateTimeInTimezone = (date: any, timezone?: string) => {
  if (date === undefined || date === null) return '';

  if (timezone) {
    return moment(date).tz(timezone).format('MMM DD, YYYY hh:mm A');
  }
  // Fallback to device timezone if no timezone specified
  return moment(date).format('MMM DD, YYYY hh:mm A');
};

/**
 * Format just the time in a specific timezone
 * @param date - Unix timestamp in milliseconds or Date object
 * @param timezone - IANA timezone identifier (e.g., 'America/Chicago')
 * @returns Formatted string like "02:00 PM"
 */
export const getFormattedTimeInTimezone = (date: any, timezone?: string) => {
  if (date === undefined || date === null) return '';

  if (timezone) {
    return moment(date).tz(timezone).format('hh:mm A');
  }
  return moment(date).format('hh:mm A');
};

/**
 * Format just the date in a specific timezone
 * @param date - Unix timestamp in milliseconds or Date object
 * @param timezone - IANA timezone identifier (e.g., 'America/Chicago')
 * @returns Formatted string like "Dec 24, 2024"
 */
export const getFormattedDateInTimezone = (date: any, timezone?: string) => {
  if (date === undefined || date === null) return '';

  if (timezone) {
    return moment(date).tz(timezone).format('MMM DD, YYYY');
  }
  return moment(date).format('MMM DD, YYYY');
};
```

---

### Step 6: Update Order Detail Screens (Frontend)

**File:** `frontend/app/screens/customer/orderDetail/index.tsx`

```typescript
import {
  getFormattedDate,
  getFormattedDateTime,
  getFormattedDateInTimezone,
  getFormattedDateTimeInTimezone
} from '../../../utils/validations';

// In the component, use the timezone from the API response:

// Line 279 - Title
title={getFormattedDateInTimezone(
  (orderInfo?.order_date ?? 0) * 1000,
  orderInfo?.timezone
)}

// Line 308 - Order Date display
{getFormattedDateTimeInTimezone(
  (orderInfo?.order_date ?? 0) * 1000,
  orderInfo?.timezone
)}
```

**File:** `frontend/app/screens/chef/orderDetail/index.tsx`

```typescript
// Same pattern - use timezone from orderInfo
{getFormattedDateTimeInTimezone(
  (orderInfo?.order_date ?? 0) * 1000,
  orderInfo?.timezone
)}
```

---

### Step 7: Update Order Interface (Frontend)

**File:** `frontend/app/types/index.ts` (or wherever IOrder is defined)

```typescript
export interface IOrder {
  // ... existing fields ...
  timezone?: string;  // IANA timezone identifier from chef's location
}
```

---

## Files Changed Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `backend/app/Helpers/TimezoneHelper.php` | **NEW** | State → timezone mapping |
| `backend/app/Services/OrderSmsService.php` | **MODIFY** | Use TimezoneHelper instead of hardcoded Chicago |
| `backend/app/Http/Controllers/MapiController.php` | **MODIFY** | Add timezone to order response, update email |
| `frontend/package.json` | **MODIFY** | Add moment-timezone dependency |
| `frontend/app/utils/validations.ts` | **MODIFY** | Add timezone-aware formatting functions |
| `frontend/app/screens/customer/orderDetail/index.tsx` | **MODIFY** | Use new timezone-aware functions |
| `frontend/app/screens/chef/orderDetail/index.tsx` | **MODIFY** | Use new timezone-aware functions |
| `frontend/app/screens/customer/orders/components/orderCard.tsx` | **MODIFY** | Use new timezone-aware functions |
| `frontend/app/types/index.ts` | **MODIFY** | Add timezone field to IOrder |

---

## Testing Plan

### Unit Tests

1. **TimezoneHelper tests:**
   - `getTimezoneForState('IL')` → `'America/Chicago'`
   - `getTimezoneForState('CA')` → `'America/Los_Angeles'`
   - `getTimezoneForState('NY')` → `'America/New_York'`
   - `getTimezoneForState(null)` → `'America/Chicago'` (default)
   - `getTimezoneForState('Illinois')` → `'America/Chicago'` (full name)

2. **formatForSms tests:**
   - Timestamp `1735077600` with state `'IL'` → Central Time formatted
   - Same timestamp with state `'CA'` → Pacific Time formatted

### Integration Tests

1. **Create order from different timezone:**
   - Set device to Mountain Time
   - Order from Chicago chef
   - Verify SMS and app show same time

2. **Order detail screen:**
   - Load order for chef in different state
   - Verify time matches SMS notification

### Manual Testing

1. Create order in each US timezone region
2. Verify SMS notification time matches app display
3. Test with:
   - Eastern (NY)
   - Central (IL)
   - Mountain (CO)
   - Pacific (CA)
   - Arizona (no DST)
   - Hawaii

---

## Rollout Plan

### Phase 1: Backend Only (Low Risk)
1. Deploy `TimezoneHelper.php`
2. Update `OrderSmsService.php` to use chef's state
3. Update email receipt formatting
4. **No frontend changes yet** - existing functionality preserved

### Phase 2: API Enhancement (Low Risk)
1. Add `timezone` field to order API response
2. Frontend still works with existing code (timezone is optional)

### Phase 3: Frontend Update
1. Add moment-timezone dependency
2. Add new timezone-aware formatting functions
3. Update order detail screens to use new functions
4. Update order card components

---

## Alternatives Considered

### Alternative 1: Hardcode Central Time Everywhere
- **Pros:** Simplest, no new dependencies
- **Cons:** Wrong for chefs outside Central timezone, bad UX for national expansion

### Alternative 2: Use Customer's Timezone
- **Pros:** Customer sees times in familiar timezone
- **Cons:** Doesn't match chef's availability (set in chef's local time), confusing if traveling

### Alternative 3: Store Timezone on Chef Profile
- **Pros:** Chef can override if needed
- **Cons:** Requires database migration, extra field to maintain, most chefs won't set it

### Alternative 4: ZIP Code → Timezone Lookup
- **Pros:** More precise than state
- **Cons:** More complex, edge cases at timezone boundaries, overkill for this use case

**Chosen:** State-based lookup is the best balance of simplicity and correctness for a US-only service.

---

## Future Considerations

1. **Multi-timezone states:** Some states (TX, FL, IN) span multiple timezones. Current implementation uses the most common timezone. Could enhance with ZIP code lookup if needed.

2. **Displaying timezone abbreviation:** Consider adding "CT", "PT" etc. to time displays for clarity.

3. **Chef timezone override:** If a chef is near a timezone boundary, allow them to manually set their timezone in profile settings.

4. **International expansion:** If Taist expands beyond US, will need more comprehensive timezone handling (potentially using coordinates or requiring timezone selection).
