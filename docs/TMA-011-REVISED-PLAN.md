# TMA-011 REVISED: Chef Availability Confirmation & Day-Specific Overrides

**Status**: Planning (Revision)
**Created**: 2025-12-03
**Priority**: High
**Revision**: Based on clarified requirements

---

## Executive Summary

Implement a chef availability confirmation system with day-specific overrides:
1. Weekly schedules remain for future bookings (2+ days out)
2. Chefs receive 24-hour reminders to confirm/modify tomorrow's availability
3. Chefs can manually set availability for today/tomorrow (0-36 hours)
4. All orders require 3-hour minimum advance notice
5. Day-specific availability overrides weekly schedule

---

## Problem Statement

**Current State:**
- Chefs set weekly availability blocks
- No way for chefs to confirm they're actually working on a specific day
- No way to temporarily override schedule for a specific day
- Orders can be placed too close to delivery time

**Desired State:**
- Weekly schedule = default for future dates (2+ days out)
- Day-specific confirmation system for today/tomorrow
- 24-hour reminder to confirm next day's availability
- Manual override option (0-36 hours from now)
- 3-hour minimum order window
- Overrides don't affect recurring weekly schedule

---

## What to Keep from Previous Implementation

### ✅ KEEP - Already Working Well

1. **Database Migration** (`2025_12_03_000002_add_online_status_to_users.php`)
   - We'll reuse some fields, rename/repurpose others
   - Migration already run successfully

2. **3-Hour Minimum Window Validation** (MapiController.php:1831-1845)
   - Working perfectly (10/10 tests passed)
   - Keep as-is

3. **Test Infrastructure**
   - All test files provide good patterns
   - Can adapt for new functionality

4. **TwilioService Integration**
   - Already set up and working
   - Use for confirmation reminders

---

## What to Scrap from Previous Implementation

### ❌ SCRAP - Overly Complex

1. **ChefAutoOnlineService** - Delete entire service
   - Not needed with new design
   - Chefs don't "schedule" to go online later

2. **Future Scheduling in Toggle API** - Simplify
   - Remove `online_start` field usage for future times
   - Only allow setting availability for next 0-36 hours

3. **Same-Day Online Requirement** - Replace
   - Current: Same-day requires `is_online = true`
   - New: Same-day requires day-specific override record

4. **Complex Toggle Logic** - Simplify
   - Remove future scheduling capability
   - Simpler: set availability for specific date/time range

---

## New Database Design

### Option 1: Reuse Existing Fields (Simpler, Less Migration)

Repurpose existing fields in `tbl_users`:
- `is_online` → Remove (not needed)
- `online_start` → `override_date` (DATE type: which day is overridden)
- `online_until` → `override_end_time` (TIME type: end time for override)
- Add: `override_start_time` (TIME type: start time for override)
- Add: `override_status` (enum: 'confirmed', 'cancelled', 'modified')
- `last_online_reminder_sent_at` → Keep (for 24-hour reminders)

**Pros:** Minimal migration, reuse existing columns
**Cons:** Field names don't match usage exactly

### Option 2: New Table (Cleaner, Recommended)

Create `tbl_availability_overrides`:
```php
Schema::create('tbl_availability_overrides', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('chef_id');
    $table->date('override_date'); // Which specific day
    $table->time('start_time')->nullable(); // NULL = cancelled
    $table->time('end_time')->nullable();
    $table->enum('status', ['confirmed', 'modified', 'cancelled'])->default('confirmed');
    $table->enum('source', ['reminder_confirmation', 'manual_toggle']); // How was it created
    $table->timestamps();

    // Indexes
    $table->index(['chef_id', 'override_date']);
    $table->unique(['chef_id', 'override_date']); // One override per chef per day

    // Foreign key
    $table->foreign('chef_id')->references('id')->on('tbl_users')->onDelete('cascade');
});
```

Keep in `tbl_users`:
- `last_online_reminder_sent_at` (for reminder throttling)

**Pros:** Clean data model, clear intent
**Cons:** New table, more migration

**RECOMMENDATION: Option 2** - Cleaner design, easier to maintain

---

## Detailed Requirements

### 1. Weekly Schedule (Existing - No Changes)

**Current behavior (keep as-is):**
- Chefs have `tbl_availabilities` with weekly recurring schedule
- Monday through Sunday, start/end times
- Used for **all future dates** (2+ days from today)

**Example:**
- Chef has Tuesday: 11:00 AM - 5:00 PM in weekly schedule
- Customer can book for **next Tuesday** (7 days out) at 2:00 PM
- No confirmation needed for future dates

### 2. 24-Hour Confirmation Reminder

**Trigger:** 24 hours before scheduled shift start time

**Example:**
- Chef has Wednesday: 11:00 AM - 5:00 PM in weekly schedule
- Current time: Tuesday 11:00 AM (exactly 24 hours before)
- System sends SMS + Push notification

**Notification Content:**
```
SMS: "Taist: Confirm tomorrow's shift (11:00 AM - 5:00 PM)? Tap to confirm, change, or cancel: [deep link]"

Push Notification:
Title: "Confirm tomorrow's availability"
Body: "11:00 AM - 5:00 PM scheduled. Confirm or update?"
Deep Link: taist://availability/confirm?date=2025-12-04
```

**Chef Actions:**
1. **Confirm** → Creates override record with `status='confirmed'`, same times as schedule
2. **Modify** → Creates override record with `status='modified'`, new custom times
3. **Cancel** → Creates override record with `status='cancelled'`, times=NULL
4. **Ignore** → No override created, defaults to weekly schedule

**Key Point:** Reminder only sent ONCE per day, tracked via `last_online_reminder_sent_at`

### 3. Manual Toggle/Override (0-36 hours)

**UI Flow:**
1. Chef opens app, goes to "Availability" section
2. Sees toggle for "Set specific availability"
3. Selects date: TODAY or TOMORROW only
4. Selects time range: Must be between NOW and +36 hours
5. Submits → Creates override record

**API Endpoint:**
```
POST /mapi/set_availability_override

Body:
{
  "override_date": "2025-12-04",  // Today or tomorrow only
  "start_time": "14:00",           // 2:00 PM
  "end_time": "18:00",             // 6:00 PM
  "source": "manual_toggle"
}

Validations:
- Date must be today or tomorrow
- End time must be ≤ 36 hours from now
- Start time must be < end time
- End time must be > current time + 3 hours (order minimum)
```

**Special Case - Cancel Today/Tomorrow:**
```
POST /mapi/set_availability_override

Body:
{
  "override_date": "2025-12-04",
  "status": "cancelled"
  // No times provided = full day cancellation
}
```

### 4. Order Availability Logic (THE CORE)

**When customer tries to order, system checks availability in this order:**

```php
function isChefAvailable($chefId, $orderDateTime) {
    $orderDate = date('Y-m-d', strtotime($orderDateTime));
    $orderTime = date('H:i', strtotime($orderDateTime));
    $currentTime = time();
    $orderTimestamp = strtotime($orderDateTime);

    // 1. Check 3-hour minimum
    if ($orderTimestamp < $currentTime + (3 * 60 * 60)) {
        return false; // Too soon
    }

    // 2. Determine if this is today, tomorrow, or future
    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('+1 day'));

    // 3. Check for override (today or tomorrow)
    if ($orderDate == $today || $orderDate == $tomorrow) {
        $override = AvailabilityOverride::where('chef_id', $chefId)
            ->where('override_date', $orderDate)
            ->first();

        if ($override) {
            // Override exists - use it
            if ($override->status == 'cancelled') {
                return false; // Chef cancelled this day
            }

            // Check if order time is within override times
            return ($orderTime >= $override->start_time &&
                    $orderTime <= $override->end_time);
        }

        // No override for today/tomorrow - NOT AVAILABLE
        // (Chef must explicitly confirm for same-day/next-day orders)
        return false;
    }

    // 4. Future date (2+ days out) - use weekly schedule
    $dayOfWeek = strtolower(date('l', strtotime($orderDate)));
    $availability = Availabilities::where('user_id', $chefId)->first();

    if (!$availability) {
        return false;
    }

    $startField = $dayOfWeek . '_start';
    $endField = $dayOfWeek . '_end';

    if (!$availability->$startField || !$availability->$endField) {
        return false; // Not scheduled for this day
    }

    // Check if order time is within scheduled times
    return ($orderTime >= $availability->$startField &&
            $orderTime <= $availability->$endField);
}
```

**Key Insight:**
- **Today/Tomorrow:** MUST have override (from confirmation or manual toggle)
- **Future (2+ days):** Use weekly schedule only
- **No override today/tomorrow = NOT AVAILABLE**

### 5. 3-Hour Minimum Window

**Keep existing implementation** (already working):
- All orders must be ≥ 3 hours from current time
- Applies to same-day, next-day, and future orders
- Current code at MapiController.php:1831-1845 is correct

---

## Technical Implementation Plan

### Phase 1: Database Changes

#### 1.1 Create Availability Overrides Table

**File:** New migration `2025_12_03_000003_create_availability_overrides.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAvailabilityOverrides extends Migration
{
    public function up()
    {
        Schema::create('tbl_availability_overrides', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('chef_id');
            $table->date('override_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('status', ['confirmed', 'modified', 'cancelled'])->default('confirmed');
            $table->enum('source', ['reminder_confirmation', 'manual_toggle']);
            $table->timestamps();

            $table->index(['chef_id', 'override_date'], 'idx_chef_date');
            $table->unique(['chef_id', 'override_date'], 'uniq_chef_date');

            $table->foreign('chef_id')->references('id')->on('tbl_users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_availability_overrides');
    }
}
```

#### 1.2 Clean Up tbl_users (Remove Unused Fields)

**File:** New migration `2025_12_03_000004_cleanup_users_online_fields.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CleanupUsersOnlineFields extends Migration
{
    public function up()
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            // Drop fields we're not using anymore
            $table->dropColumn([
                'is_online',
                'online_start',
                'online_until',
                'last_toggled_online_at',
                'last_toggled_offline_at'
            ]);

            // Keep last_online_reminder_sent_at for reminder throttling
        });
    }

    public function down()
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            $table->boolean('is_online')->default(false);
            $table->timestamp('online_start')->nullable();
            $table->timestamp('online_until')->nullable();
            $table->timestamp('last_toggled_online_at')->nullable();
            $table->timestamp('last_toggled_offline_at')->nullable();
        });
    }
}
```

#### 1.3 Create Model

**File:** New `backend/app/Models/AvailabilityOverride.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvailabilityOverride extends Model
{
    protected $table = 'tbl_availability_overrides';

    protected $fillable = [
        'chef_id',
        'override_date',
        'start_time',
        'end_time',
        'status',
        'source'
    ];

    protected $casts = [
        'override_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the chef for this override
     */
    public function chef()
    {
        return $this->belongsTo(\App\Listener::class, 'chef_id');
    }

    /**
     * Check if this override allows orders at a specific time
     *
     * @param string $time Time in H:i format (e.g., "14:30")
     * @return bool
     */
    public function allowsOrderAt($time)
    {
        if ($this->status === 'cancelled') {
            return false;
        }

        if (!$this->start_time || !$this->end_time) {
            return false;
        }

        return ($time >= $this->start_time && $time <= $this->end_time);
    }
}
```

---

### Phase 2: API Endpoints

#### 2.1 Set Availability Override

**File:** MapiController.php (add after toggleOnline)

```php
/**
 * Set availability override for a specific day (today or tomorrow)
 *
 * POST /mapi/set_availability_override
 * Body: {
 *   "override_date": "2025-12-04",
 *   "start_time": "14:00",      // Optional if cancelling
 *   "end_time": "18:00",        // Optional if cancelling
 *   "status": "confirmed",      // confirmed, modified, or cancelled
 *   "source": "manual_toggle"   // manual_toggle or reminder_confirmation
 * }
 */
public function setAvailabilityOverride(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);

    $user = $this->_authUser();

    // Only chefs can set overrides
    if (!$user || $user->user_type != 2) {
        return response()->json([
            'success' => 0,
            'error' => 'Only chefs can set availability overrides'
        ]);
    }

    $overrideDate = $request->input('override_date');
    $startTime = $request->input('start_time');
    $endTime = $request->input('end_time');
    $status = $request->input('status', 'confirmed');
    $source = $request->input('source', 'manual_toggle');

    // Validate override_date
    if (!$overrideDate) {
        return response()->json([
            'success' => 0,
            'error' => 'override_date is required'
        ]);
    }

    $overrideDateTimestamp = strtotime($overrideDate);
    $today = strtotime('today');
    $tomorrow = strtotime('tomorrow');
    $dayAfterTomorrow = strtotime('+2 days');

    // Can only set overrides for today or tomorrow (within 36 hours)
    if ($overrideDateTimestamp < $today || $overrideDateTimestamp >= $dayAfterTomorrow) {
        return response()->json([
            'success' => 0,
            'error' => 'Can only set availability for today or tomorrow'
        ]);
    }

    // If not cancelling, validate times
    if ($status !== 'cancelled') {
        if (!$startTime || !$endTime) {
            return response()->json([
                'success' => 0,
                'error' => 'start_time and end_time required unless cancelling'
            ]);
        }

        // Validate end_time > start_time
        if (strtotime($endTime) <= strtotime($startTime)) {
            return response()->json([
                'success' => 0,
                'error' => 'end_time must be after start_time'
            ]);
        }

        // Validate end time is within 36 hours from now
        $endDateTime = strtotime($overrideDate . ' ' . $endTime);
        $maxAllowedTime = time() + (36 * 60 * 60);

        if ($endDateTime > $maxAllowedTime) {
            return response()->json([
                'success' => 0,
                'error' => 'end_time cannot be more than 36 hours from now'
            ]);
        }

        // Validate start time allows for 3-hour minimum orders
        $startDateTime = strtotime($overrideDate . ' ' . $startTime);
        $minimumOrderTime = time() + (3 * 60 * 60);

        if ($startDateTime < $minimumOrderTime) {
            return response()->json([
                'success' => 0,
                'error' => 'start_time must be at least 3 hours from now'
            ]);
        }
    }

    // Create or update override
    $override = \App\Models\AvailabilityOverride::updateOrCreate(
        [
            'chef_id' => $user->id,
            'override_date' => $overrideDate
        ],
        [
            'start_time' => $status === 'cancelled' ? null : $startTime,
            'end_time' => $status === 'cancelled' ? null : $endTime,
            'status' => $status,
            'source' => $source
        ]
    );

    \Log::info('Availability override set', [
        'chef_id' => $user->id,
        'override_date' => $overrideDate,
        'status' => $status,
        'source' => $source
    ]);

    return response()->json([
        'success' => 1,
        'data' => [
            'override_date' => $override->override_date->format('Y-m-d'),
            'start_time' => $override->start_time,
            'end_time' => $override->end_time,
            'status' => $override->status,
            'source' => $override->source
        ]
    ]);
}

/**
 * Get availability overrides for chef
 *
 * GET /mapi/get_availability_overrides
 * Query params: ?days=7 (optional, default 7)
 */
public function getAvailabilityOverrides(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);

    $user = $this->_authUser();

    if (!$user) {
        return response()->json(['success' => 0, 'error' => 'User not found']);
    }

    $days = $request->input('days', 7);
    $startDate = date('Y-m-d');
    $endDate = date('Y-m-d', strtotime("+{$days} days"));

    $overrides = \App\Models\AvailabilityOverride::where('chef_id', $user->id)
        ->whereBetween('override_date', [$startDate, $endDate])
        ->orderBy('override_date')
        ->get()
        ->map(function($override) {
            return [
                'override_date' => $override->override_date->format('Y-m-d'),
                'start_time' => $override->start_time,
                'end_time' => $override->end_time,
                'status' => $override->status,
                'source' => $override->source
            ];
        });

    return response()->json([
        'success' => 1,
        'data' => $overrides
    ]);
}
```

#### 2.2 Add Routes

**File:** routes/mapi.php (in authenticated group)

```php
// Availability override management
Route::post('set_availability_override', 'MapiController@setAvailabilityOverride');
Route::get('get_availability_overrides', 'MapiController@getAvailabilityOverrides');
```

#### 2.3 Remove Old Toggle Online Endpoint

**Action:** Delete or comment out old `toggleOnline()` and `getOnlineStatus()` functions
- These are replaced by `setAvailabilityOverride()`

---

### Phase 3: Update Order Validation Logic

**File:** MapiController.php → `createOrder()` function

**Replace lines 1831-1865 with:**

```php
public function createOrder(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied. Api key is not valid."]);

    // ===== TMA-011 REVISED: Validate 3-hour minimum window =====
    $orderDate = $request->order_date;
    $orderTimestamp = strtotime($orderDate);
    $currentTimestamp = time();
    $minimumOrderTime = $currentTimestamp + (3 * 60 * 60); // 3 hours from now

    if ($orderTimestamp < $minimumOrderTime) {
        $hoursNeeded = ceil(($minimumOrderTime - $orderTimestamp) / 3600);
        return response()->json([
            'success' => 0,
            'error' => "Orders must be placed at least 3 hours in advance. Please select a delivery time at least {$hoursNeeded} hours from now.",
            'minimum_order_timestamp' => $minimumOrderTime,
            'requested_timestamp' => $orderTimestamp,
        ]);
    }

    // ===== TMA-011 REVISED: Check chef availability =====
    $chef = app(Listener::class)->where('id', $request->chef_user_id)->first();

    if (!$chef) {
        return response()->json(['success' => 0, 'error' => 'Chef not found']);
    }

    // Use helper method to check availability
    if (!$chef->isAvailableForOrderDate($orderDate)) {
        return response()->json([
            'success' => 0,
            'error' => 'This chef is not available at the requested time. Please choose a different time or chef.',
            'chef_not_available' => true,
        ]);
    }
    // ===== END TMA-011 REVISED VALIDATION =====

    // Continue with existing order creation logic...
    $chef_payment_method = app(PaymentMethodListener::class)...
```

---

### Phase 4: Update Listener Model Helper Methods

**File:** backend/app/Listener.php

**Replace the `isAvailableForOrder()` method and related methods:**

```php
/**
 * Check if chef is available for a specific order date/time
 *
 * @param string $orderDateTime The full order date/time (e.g., "2025-12-04 14:30:00")
 * @return bool
 */
public function isAvailableForOrderDate($orderDateTime)
{
    $orderDate = date('Y-m-d', strtotime($orderDateTime));
    $orderTime = date('H:i', strtotime($orderDateTime));

    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('+1 day'));

    // For today or tomorrow: MUST have override
    if ($orderDate == $today || $orderDate == $tomorrow) {
        return $this->hasOverrideForDateTime($orderDate, $orderTime);
    }

    // For future dates (2+ days): use weekly schedule
    return $this->hasWeeklyScheduleForDateTime($orderDate, $orderTime);
}

/**
 * Check if chef has override for specific date/time
 *
 * @param string $date Y-m-d format
 * @param string $time H:i format
 * @return bool
 */
private function hasOverrideForDateTime($date, $time)
{
    $override = \App\Models\AvailabilityOverride::where('chef_id', $this->id)
        ->where('override_date', $date)
        ->first();

    if (!$override) {
        return false; // No override = not available for today/tomorrow
    }

    return $override->allowsOrderAt($time);
}

/**
 * Check if chef has weekly schedule for specific date/time
 *
 * @param string $date Y-m-d format
 * @param string $time H:i format
 * @return bool
 */
private function hasWeeklyScheduleForDateTime($date, $time)
{
    $dayOfWeek = strtolower(date('l', strtotime($date)));
    $availability = \App\Models\Availabilities::where('user_id', $this->id)->first();

    if (!$availability) {
        return false;
    }

    $startField = $dayOfWeek . '_start';
    $endField = $dayOfWeek . '_end';

    if (!$availability->$startField || !$availability->$endField) {
        return false;
    }

    return ($time >= $availability->$startField && $time <= $availability->$endField);
}

/**
 * Remove old methods that are no longer used
 * DELETE: isOnline(), hasScheduleForToday(), hasScheduleForDay()
 */
```

---

### Phase 5: Confirmation Reminder Service

**File:** backend/app/Services/ChefConfirmationReminderService.php (NEW - replaces ChefOnlineReminderService)

```php
<?php

namespace App\Services;

use App\Listener;
use App\Models\Availabilities;
use App\Models\AvailabilityOverride;
use Illuminate\Support\Facades\Log;

class ChefConfirmationReminderService
{
    protected $twilioService;
    protected $firebaseMessaging;

    public function __construct(TwilioService $twilioService)
    {
        $this->twilioService = $twilioService;

        try {
            $this->firebaseMessaging = app('firebase.messaging');
        } catch (\Exception $e) {
            $this->firebaseMessaging = null;
            Log::warning('Firebase not configured: ' . $e->getMessage());
        }
    }

    /**
     * Find chefs who need 24-hour reminders for tomorrow's shifts
     *
     * @return array
     */
    public function findChefsNeedingReminders()
    {
        $tomorrow = date('Y-m-d', strtotime('tomorrow'));
        $tomorrowDayOfWeek = strtolower(date('l', strtotime('tomorrow')));
        $currentTime = date('H:i');

        $availabilities = Availabilities::all();
        $chefsToRemind = [];

        foreach ($availabilities as $availability) {
            $chef = Listener::where('id', $availability->user_id)
                ->where('user_type', 2)
                ->first();

            if (!$chef) {
                continue;
            }

            // Check if they already have an override for tomorrow
            $existingOverride = AvailabilityOverride::where('chef_id', $chef->id)
                ->where('override_date', $tomorrow)
                ->first();

            if ($existingOverride) {
                continue; // Already confirmed/modified/cancelled
            }

            // Check weekly schedule for tomorrow
            $startField = $tomorrowDayOfWeek . '_start';
            $endField = $tomorrowDayOfWeek . '_end';

            $scheduledStart = $availability->$startField;
            $scheduledEnd = $availability->$endField;

            if (!$scheduledStart || !$scheduledEnd) {
                continue; // Not scheduled tomorrow
            }

            // Check if we're in the reminder window (24 hours before start)
            // Allow 5-minute window for cron execution
            $timeDiff = abs(strtotime($currentTime) - strtotime($scheduledStart));

            if ($timeDiff <= 300) { // Within 5 minutes
                // Check if we already sent reminder recently
                if ($chef->last_online_reminder_sent_at) {
                    $lastReminder = strtotime($chef->last_online_reminder_sent_at);
                    $hoursSince = (time() - $lastReminder) / 3600;

                    if ($hoursSince < 12) {
                        continue; // Don't spam - wait at least 12 hours
                    }
                }

                $chefsToRemind[] = [
                    'chef_id' => $chef->id,
                    'chef_name' => $chef->first_name . ' ' . $chef->last_name,
                    'scheduled_date' => $tomorrow,
                    'scheduled_start' => $scheduledStart,
                    'scheduled_end' => $scheduledEnd,
                ];
            }
        }

        return $chefsToRemind;
    }

    /**
     * Send confirmation reminder to chef
     *
     * @param array $reminderData
     * @return bool
     */
    public function sendReminder($reminderData)
    {
        $chef = Listener::find($reminderData['chef_id']);

        if (!$chef) {
            Log::warning('Chef not found for reminder', ['chef_id' => $reminderData['chef_id']]);
            return false;
        }

        $startTime = date('g:i A', strtotime($reminderData['scheduled_start']));
        $endTime = date('g:i A', strtotime($reminderData['scheduled_end']));
        $dateFormatted = date('l, M j', strtotime($reminderData['scheduled_date']));

        $sent = false;

        // SMS (primary)
        if ($chef->phone) {
            $smsMessage = "Taist: Confirm tomorrow's shift ({$startTime} - {$endTime})? Tap to confirm, change, or cancel: taist://availability/confirm?date={$reminderData['scheduled_date']}";

            $result = $this->twilioService->sendSMS(
                $chef->phone,
                $smsMessage,
                [
                    'chef_id' => $chef->id,
                    'notification_type' => 'confirmation_reminder',
                    'scheduled_date' => $reminderData['scheduled_date']
                ]
            );

            if ($result['success']) {
                $sent = true;
                Log::info('Sent confirmation reminder SMS', ['chef_id' => $chef->id]);
            }
        }

        // Push notification (secondary)
        if ($chef->fcm_token && $this->firebaseMessaging) {
            try {
                $this->sendPushNotification($chef, $dateFormatted, $startTime, $endTime, $reminderData['scheduled_date']);
                $sent = true;
            } catch (\Exception $e) {
                Log::error('Failed to send push notification', [
                    'chef_id' => $chef->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Update reminder timestamp
        if ($sent) {
            $chef->update(['last_online_reminder_sent_at' => now()]);
        }

        return $sent;
    }

    private function sendPushNotification($chef, $dateFormatted, $startTime, $endTime, $date)
    {
        if (!$this->firebaseMessaging) {
            return;
        }

        $message = \Kreait\Firebase\Messaging\CloudMessage::withTarget('token', $chef->fcm_token)
            ->withNotification([
                'title' => "Confirm tomorrow's availability",
                'body' => "{$startTime} - {$endTime} scheduled for {$dateFormatted}",
            ])
            ->withData([
                'type' => 'confirmation_reminder',
                'action' => 'confirm_availability',
                'date' => $date,
                'start_time' => $startTime,
                'end_time' => $endTime,
            ]);

        $this->firebaseMessaging->send($message);

        // Save to notifications table
        \App\Notification::create([
            'title' => "Confirm tomorrow's availability",
            'body' => "{$startTime} - {$endTime} scheduled for {$dateFormatted}",
            'image' => $chef->photo ?? 'N/A',
            'fcm_token' => $chef->fcm_token,
            'user_id' => $chef->id,
            'role' => 'chef',
        ]);
    }
}
```

---

### Phase 6: Console Commands

**File:** backend/app/Console/Commands/SendConfirmationReminders.php (NEW)

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ChefConfirmationReminderService;
use Illuminate\Support\Facades\Log;

class SendConfirmationReminders extends Command
{
    protected $signature = 'chefs:send-confirmation-reminders';
    protected $description = 'Send 24-hour confirmation reminders to chefs for tomorrow\'s scheduled shifts';

    protected $reminderService;

    public function __construct(ChefConfirmationReminderService $reminderService)
    {
        parent::__construct();
        $this->reminderService = $reminderService;
    }

    public function handle()
    {
        $this->info('Checking for chefs who need confirmation reminders...');

        $chefsToRemind = $this->reminderService->findChefsNeedingReminders();

        if (empty($chefsToRemind)) {
            $this->info('No chefs need reminders at this time.');
            Log::info('Confirmation reminders check: No chefs need reminders');
            return 0;
        }

        $this->info("Found " . count($chefsToRemind) . " chef(s) to remind.");

        $sentCount = 0;
        foreach ($chefsToRemind as $reminderData) {
            $this->line("Sending reminder to {$reminderData['chef_name']} (ID: {$reminderData['chef_id']})");

            $sent = $this->reminderService->sendReminder($reminderData);

            if ($sent) {
                $sentCount++;
            }
        }

        $this->info("Successfully sent {$sentCount} reminder(s).");
        Log::info('Confirmation reminders sent', [
            'total_found' => count($chefsToRemind),
            'sent' => $sentCount
        ]);

        return 0;
    }
}
```

**File:** backend/app/Console/Commands/CleanupOldOverrides.php (NEW)

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AvailabilityOverride;
use Illuminate\Support\Facades\Log;

class CleanupOldOverrides extends Command
{
    protected $signature = 'chefs:cleanup-old-overrides';
    protected $description = 'Delete availability overrides older than 30 days (housekeeping)';

    public function handle()
    {
        $this->info('Cleaning up old availability overrides...');

        $cutoffDate = date('Y-m-d', strtotime('-30 days'));

        $count = AvailabilityOverride::where('override_date', '<', $cutoffDate)->delete();

        if ($count > 0) {
            $this->info("Deleted {$count} old override(s).");
            Log::info('Cleaned up old availability overrides', ['count' => $count]);
        } else {
            $this->info('No old overrides to clean up.');
        }

        return 0;
    }
}
```

---

### Phase 7: Schedule Commands in Kernel

**File:** backend/app/Console/Kernel.php

**In the `schedule()` method:**

```php
// Send confirmation reminders every 5 minutes (to catch 24-hour windows)
$schedule->command('chefs:send-confirmation-reminders')
    ->everyFiveMinutes()
    ->withoutOverlapping();

// Cleanup old overrides daily at 3 AM
$schedule->command('chefs:cleanup-old-overrides')
    ->dailyAt('03:00')
    ->withoutOverlapping();
```

**Remove old commands:**
```php
// DELETE these lines:
$schedule->command('chefs:send-online-reminders')...
$schedule->command('chefs:auto-toggle-online')...
$schedule->command('chefs:auto-toggle-offline')...
```

---

### Phase 8: Update Chef Discovery/Search

**File:** MapiController.php → Find `getSearchChefs()` or equivalent

**Update to check availability overrides:**

```php
// When filtering available chefs for a specific order date/time
// Use the same logic as in order validation

$availableChefs = $allChefs->filter(function($chef) use ($orderDateTime) {
    return $chef->isAvailableForOrderDate($orderDateTime);
});
```

---

## Files to Delete

**Services:**
1. `backend/app/Services/ChefAutoOnlineService.php` - DELETE
2. `backend/app/Services/ChefAutoOfflineService.php` - DELETE
3. `backend/app/Services/ChefOnlineReminderService.php` - DELETE (replaced)

**Console Commands:**
1. `backend/app/Console/Commands/AutoToggleOnline.php` - DELETE
2. `backend/app/Console/Commands/AutoToggleOffline.php` - DELETE
3. `backend/app/Console/Commands/SendOnlineReminders.php` - DELETE (replaced)

**Tests (will need to rewrite):**
1. `backend/test_auto_toggle_services.php` - DELETE

---

## Files to Create

**Models:**
1. `backend/app/Models/AvailabilityOverride.php` - NEW

**Services:**
1. `backend/app/Services/ChefConfirmationReminderService.php` - NEW

**Console Commands:**
1. `backend/app/Console/Commands/SendConfirmationReminders.php` - NEW
2. `backend/app/Console/Commands/CleanupOldOverrides.php` - NEW

**Migrations:**
1. `backend/database/migrations/2025_12_03_000003_create_availability_overrides.php` - NEW
2. `backend/database/migrations/2025_12_03_000004_cleanup_users_online_fields.php` - NEW

---

## Files to Modify

**Controllers:**
1. `backend/app/Http/Controllers/MapiController.php`
   - Add `setAvailabilityOverride()`
   - Add `getAvailabilityOverrides()`
   - Remove `toggleOnline()` and `getOnlineStatus()`
   - Update `createOrder()` validation logic

**Models:**
1. `backend/app/Listener.php`
   - Update `isAvailableForOrderDate()` method
   - Remove `isOnline()` method
   - Update helper methods

**Routes:**
1. `backend/routes/mapi.php`
   - Add availability override routes
   - Remove old toggle routes

**Kernel:**
1. `backend/app/Console/Kernel.php`
   - Add new scheduled commands
   - Remove old scheduled commands

---

## Testing Plan

### Unit Tests

**Test 1: Availability Override Creation**
- Can create override for today
- Can create override for tomorrow
- Cannot create override for 2+ days out
- Cannot create override for yesterday
- End time must be ≤ 36 hours from now
- Start time must be ≥ 3 hours from now

**Test 2: Order Validation with Overrides**
- Future order (2+ days): uses weekly schedule, ignores overrides
- Tomorrow order WITH override: allowed
- Tomorrow order WITHOUT override: blocked
- Today order WITH override: allowed
- Today order WITHOUT override: blocked
- Cancelled override: blocks all orders for that day

**Test 3: Confirmation Reminders**
- Reminder sent 24 hours before shift
- No reminder if override already exists
- No duplicate reminders within 12 hours
- Reminder includes correct times from weekly schedule

**Test 4: 3-Hour Minimum**
- Still enforced for all orders
- Works with overrides
- Works with weekly schedule

### Integration Tests

**Scenario 1: Chef confirms via reminder**
1. Chef has Tuesday 11am-5pm in weekly schedule
2. Monday 11am: reminder sent
3. Chef confirms → override created
4. Customer orders Tuesday 2pm → allowed

**Scenario 2: Chef modifies via reminder**
1. Chef has Tuesday 11am-5pm in weekly schedule
2. Monday 11am: reminder sent
3. Chef changes to 1pm-6pm → override created with new times
4. Customer orders Tuesday 12pm → blocked (before override start)
5. Customer orders Tuesday 3pm → allowed (within override)

**Scenario 3: Chef cancels**
1. Chef has Tuesday 11am-5pm in weekly schedule
2. Monday 11am: reminder sent
3. Chef cancels → override created with status='cancelled'
4. Customer orders Tuesday 2pm → blocked (cancelled)

**Scenario 4: Manual toggle**
1. Monday 2pm: Chef manually sets "available today 4pm-8pm"
2. Override created for Monday
3. Customer orders Monday 6pm → allowed
4. Next Monday: no override, uses weekly schedule

---

## Success Metrics

1. **Chef Confirmation Rate:** % of reminders that get confirmed/modified/cancelled
   - Target: 70%+

2. **Same-Day Order Success Rate:** % of customers who successfully place same-day orders
   - Target: 50%+ (should increase from 0% currently)

3. **Reminder Response Time:** Time between reminder sent and chef action
   - Target: < 2 hours average

4. **Override Usage:** Number of manual overrides vs reminder-based
   - Track to understand chef behavior

---

## Deployment Checklist

### Backend
- [ ] Run new migrations (create overrides table, cleanup users fields)
- [ ] Delete old service files
- [ ] Delete old console command files
- [ ] Update MapiController with new endpoints
- [ ] Update Listener model methods
- [ ] Update routes
- [ ] Update Kernel scheduling
- [ ] Test all API endpoints
- [ ] Verify cron is running

### Testing
- [ ] Test override creation (today/tomorrow)
- [ ] Test order validation with overrides
- [ ] Test order validation without overrides
- [ ] Test future order validation (weekly schedule)
- [ ] Test confirmation reminders
- [ ] Test 3-hour minimum still works

### Monitoring
- [ ] Monitor confirmation reminder delivery
- [ ] Monitor override creation rates
- [ ] Monitor order rejection reasons
- [ ] Watch for errors in logs

---

## Questions Answered

**Q: When does auto-online happen?**
**A:** It doesn't. Removed from design.

**Q: What is `is_online` for?**
**A:** It's not needed. Removed from design.

**Q: When are same-day orders available?**
**A:** Only when chef has confirmed/created an override for that specific day.

**Q: When are future orders available?**
**A:** Always, based on weekly recurring schedule (no confirmation needed).

**Q: How do overrides work?**
**A:** They apply ONLY to the specific date. Weekly schedule remains unchanged.

---

**Last Updated:** 2025-12-03
**Document Version:** 2.0 (REVISED - Correct Requirements)
**Status:** Ready for Implementation

---

## Implementation Order

1. ✅ Create new migrations
2. ✅ Create AvailabilityOverride model
3. ✅ Update Listener model methods
4. ✅ Add new API endpoints
5. ✅ Update order validation
6. ✅ Create confirmation reminder service
7. ✅ Create console commands
8. ✅ Update Kernel scheduling
9. ✅ Delete old files
10. ✅ Write tests
11. ✅ Deploy and monitor
