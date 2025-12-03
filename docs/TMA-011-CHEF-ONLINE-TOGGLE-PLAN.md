# TMA-011: Chef Online Toggle & 3-Hour Minimum Order Window

**Status**: Planning
**Created**: 2025-12-03
**Priority**: High

---

## Executive Summary

Implement a chef "online toggle" system that requires chefs to confirm availability for same-day (intra-day) orders, while allowing customers to always book scheduled hours for future dates. Add a 3-hour minimum window requirement for all customer orders to give chefs adequate preparation time. Include proactive notification system (24 hours before scheduled time) to prompt chefs to confirm their availability.

---

## Problem Statement

**Current State:**
- Chefs set weekly availability blocks ([Availabilities.php:7-20](backend/app/Models/Availabilities.php))
- Customers can order based solely on these scheduled blocks
- No distinction between advance orders and same-day orders
- No mechanism for chefs to indicate real-time availability
- Orders can potentially be placed too close to the desired delivery time

**Desired State:**
- Chefs maintain weekly schedules that are always bookable for future dates (advance orders)
- For intra-day (same-day) orders, chefs must confirm/toggle "online" to accept orders
- Customers cannot place orders for delivery within 3 hours of current time
- System proactively notifies chefs 24 hours before scheduled time to confirm their availability
- Chefs can toggle online even outside scheduled blocks (flexibility)

---

## Requirements

### 1. Chef Online Status
- Add `is_online` boolean field to track real-time chef availability
- Add `online_start` timestamp field - when chef will start being available
- Add `online_until` timestamp field - when chef will stop being available
- Add `last_toggled_online_at` timestamp to track when chef went online
- Add `last_toggled_offline_at` timestamp for analytics
- Chefs can toggle online/offline via mobile app at any time
- **When toggling online**: Chef must specify BOTH start time (e.g., "2:00 PM") AND end time (e.g., "5:00 PM")
  - If start time is NOW (or past), chef goes online immediately
  - If start time is future (e.g., 2 hours from now), system auto-toggles them online at that time
- **Auto-toggle offline**: System automatically toggles chef offline at their specified `online_until` time
- Online status is independent of weekly schedule (allows flexibility)

### 2. Order Time Window Rules
- **3-Hour Minimum Window**: Customers cannot order for delivery times within 3 hours of current time
- This applies to ALL orders (both advance and same-day)
- Order placement logic must validate: `order_date >= current_time + (3 * 60 * 60)`
- Clear error message when customer tries to order too soon

### 3. Chef Discovery & Filtering
When customers search for available chefs:

**For Advance Orders (order_date is a future date, NOT today):**
- Show chefs based on their weekly availability schedule only
- `is_online` status is NOT checked
- Customers can ALWAYS order from chefs who have scheduled hours on future dates
- Example: Customer ordering Tuesday delivery on Sunday → check chef's Tuesday schedule
- Example: Customer ordering tomorrow's dinner → check chef's schedule for tomorrow

**For Intra-Day Orders (order_date == today, same-day orders):**
- Chef MUST be online (`is_online = true`) - chef must have confirmed availability
- Chef MUST have availability in their schedule for current day
- Still respects 3-hour minimum window
- Example: Customer ordering today at 2pm for 6pm delivery → chef must be online AND have availability covering 6pm

### 4. Notification System
**Proactive Online Reminders:**
- Check chefs with scheduled availability for the next day
- If chef has availability but hasn't confirmed yet, send notification
- **Notification timing**: Single reminder **24 hours before** scheduled start time
  - Rationale: Give chefs advance notice to confirm or adjust their availability
  - Example: Chef scheduled for tomorrow at 2:00 PM → notify today at 2:00 PM (24 hours before)
  - This reminder prompts chef to confirm so they can receive same-day orders tomorrow
- If chef still offline after 24-hour reminder, no additional reminders sent

**Notification Channels:**
- SMS notification (via Twilio - already implemented in [OrderSmsService.php](backend/app/Services/OrderSmsService.php)) - PRIMARY
- Push notification (via Firebase FCM - already implemented) - SECONDARY

**Notification Content:**
```
SMS: "Taist: You're scheduled tomorrow at [time]. Confirm now to receive same-day orders. Tap to confirm or adjust: [deep link]"

Push Title: "Confirm tomorrow's availability"
Push Body: "You're scheduled for [time] tomorrow. Confirm now to receive same-day orders."
Action: Deep link to toggle switch in app
```

**Notification Wording Strategy:**
- Emphasize that confirming allows them to receive same-day orders
- Make it clear this is about intra-day order availability
- Keep it concise and action-oriented
- Include deep link for one-tap access

### 5. Admin Dashboard
- View all chefs' online status in real-time
- Filter chefs by online/offline status
- See last toggle times for analytics
- Override/force offline capability (for emergencies)

---

## Technical Implementation Plan

### Phase 1: Database Changes

#### 1.1 Add Chef Online Status Fields
**File**: New migration `2025_12_03_000002_add_online_status_to_users.php`

```php
Schema::table('tbl_users', function (Blueprint $table) {
    // Online toggle status
    $table->boolean('is_online')->default(false)->after('fcm_token');

    // When chef will start being available (for future scheduling)
    $table->timestamp('online_start')->nullable()->after('is_online');

    // When chef will auto-toggle offline
    $table->timestamp('online_until')->nullable()->after('online_start');

    // Timestamps for analytics and notifications
    $table->timestamp('last_toggled_online_at')->nullable()->after('online_until');
    $table->timestamp('last_toggled_offline_at')->nullable()->after('last_toggled_online_at');

    // Track if we've sent reminder for current schedule block
    $table->timestamp('last_online_reminder_sent_at')->nullable()->after('last_toggled_offline_at');

    // Index for efficient queries
    $table->index(['user_type', 'is_online'], 'idx_users_type_online');
    $table->index(['online_start'], 'idx_users_online_start');
    $table->index(['online_until'], 'idx_users_online_until');
});
```

**Why these fields:**
- `is_online`: Core toggle state (true when chef is currently accepting orders)
- `online_start`: Timestamp when chef will start accepting orders (for scheduled future availability)
- `online_until`: Timestamp when chef should auto-toggle offline
- `last_toggled_online_at`: For analytics and session tracking
- `last_toggled_offline_at`: For analytics and session duration tracking
- `last_online_reminder_sent_at`: Prevents spam - only send one reminder per schedule block

#### 1.2 Update Listener Model
**File**: [backend/app/Listener.php](backend/app/Listener.php)

Add to `$fillable` array (line 22):
```php
'is_online', 'online_start', 'online_until', 'last_toggled_online_at', 'last_toggled_offline_at', 'last_online_reminder_sent_at'
```

Add helper methods:
```php
/**
 * Check if chef is currently online
 */
public function isOnline()
{
    return $this->is_online;
}

/**
 * Check if chef has availability for a specific day/time
 */
public function hasAvailabilityFor($dayOfWeek, $time)
{
    // Implementation to check weekly schedule
}

/**
 * Check if chef should be shown for a specific order_date
 */
public function isAvailableForOrder($orderDate)
{
    $orderTimestamp = strtotime($orderDate);
    $currentTimestamp = time();
    $todayStart = strtotime('today');
    $tomorrowStart = strtotime('tomorrow');

    // Same-day order: must be online
    if ($orderTimestamp >= $todayStart && $orderTimestamp < $tomorrowStart) {
        return $this->is_online && $this->hasScheduleForToday();
    }

    // Future order: check weekly schedule only
    return $this->hasScheduleForDate($orderDate);
}
```

---

### Phase 2: API Endpoints

#### 2.1 Toggle Online Status
**File**: [backend/app/Http/Controllers/MapiController.php](backend/app/Http/Controllers/MapiController.php)
**Location**: After line 460 (after logout function)

```php
/**
 * Toggle chef online/offline status
 *
 * POST /mapi/toggle_online
 * Body: {
 *   "is_online": true/false,
 *   "online_start": "2025-12-03 14:00:00" (required when is_online = true),
 *   "online_until": "2025-12-03 17:00:00" (required when is_online = true)
 * }
 */
public function toggleOnline(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);

    $user = $this->_authUser();

    // Only chefs can toggle online
    if (!$user || $user->user_type != 2) {
        return response()->json([
            'success' => 0,
            'error' => 'Only chefs can toggle online status'
        ]);
    }

    $isOnline = $request->input('is_online', false);

    $updateData = [
        'updated_at' => now()
    ];

    // Track toggle timestamps
    if ($isOnline) {
        // Validate both start and end times are provided
        $onlineStart = $request->input('online_start');
        $onlineUntil = $request->input('online_until');

        if (!$onlineStart || !$onlineUntil) {
            return response()->json([
                'success' => 0,
                'error' => 'Both online_start and online_until are required when toggling online'
            ]);
        }

        $onlineStartTimestamp = strtotime($onlineStart);
        $onlineUntilTimestamp = strtotime($onlineUntil);
        $currentTimestamp = time();

        // Validate online_until is after online_start
        if ($onlineUntilTimestamp <= $onlineStartTimestamp) {
            return response()->json([
                'success' => 0,
                'error' => 'online_until must be after online_start'
            ]);
        }

        // Validate online_until is in the future
        if ($onlineUntilTimestamp <= $currentTimestamp) {
            return response()->json([
                'success' => 0,
                'error' => 'online_until must be a future time'
            ]);
        }

        $updateData['online_start'] = $onlineStart;
        $updateData['online_until'] = $onlineUntil;

        // If start time is now or in the past, toggle online immediately
        if ($onlineStartTimestamp <= $currentTimestamp) {
            $updateData['is_online'] = true;
            $updateData['last_toggled_online_at'] = now();
        } else {
            // Start time is in future - schedule for later, but don't go online yet
            $updateData['is_online'] = false;
        }
    } else {
        // Toggling offline
        $updateData['is_online'] = false;
        $updateData['last_toggled_offline_at'] = now();
        $updateData['online_start'] = null;
        $updateData['online_until'] = null;
    }

    app(Listener::class)->where('id', $user->id)->update($updateData);

    $updatedUser = app(Listener::class)->where('id', $user->id)->first();

    // Log for analytics
    Log::info('Chef toggled online status', [
        'chef_id' => $user->id,
        'is_online' => $updatedUser->is_online,
        'online_start' => $updatedUser->online_start,
        'online_until' => $updatedUser->online_until,
        'timestamp' => now()
    ]);

    return response()->json([
        'success' => 1,
        'data' => [
            'is_online' => $updatedUser->is_online,
            'online_start' => $updatedUser->online_start,
            'online_until' => $updatedUser->online_until,
            'last_toggled_online_at' => $updatedUser->last_toggled_online_at,
            'last_toggled_offline_at' => $updatedUser->last_toggled_offline_at,
        ]
    ]);
}

/**
 * Get chef online status
 *
 * GET /mapi/get_online_status
 */
public function getOnlineStatus(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);

    $user = $this->_authUser();

    if (!$user) {
        return response()->json(['success' => 0, 'error' => 'User not found']);
    }

    return response()->json([
        'success' => 1,
        'data' => [
            'is_online' => $user->is_online ?? false,
            'online_start' => $user->online_start,
            'online_until' => $user->online_until,
            'last_toggled_online_at' => $user->last_toggled_online_at,
            'last_toggled_offline_at' => $user->last_toggled_offline_at,
        ]
    ]);
}
```

#### 2.2 Add Routes
**File**: [backend/routes/mapi.php](backend/routes/mapi.php)
**Location**: After line 99 (in authenticated route group)

```php
// Chef online status management
Route::post('toggle_online', 'MapiController@toggleOnline');
Route::get('get_online_status', 'MapiController@getOnlineStatus');
```

#### 2.3 Update Chef Search/Discovery
**File**: [backend/app/Http/Controllers/MapiController.php](backend/app/Http/Controllers/MapiController.php)

Find the function that returns available chefs to customers (likely `getUsers` or similar - need to verify exact location).

**Modification Logic:**
```php
// Existing chef query
$query = app(Listener::class)->where('user_type', 2);

// Get order date from request
$orderDate = $request->input('order_date');
$orderTimestamp = strtotime($orderDate);
$currentTimestamp = time();

// Determine if this is a same-day order
$isSameDayOrder = date('Y-m-d', $orderTimestamp) === date('Y-m-d', $currentTimestamp);

if ($isSameDayOrder) {
    // Same-day orders: chef must be online
    $query->where('is_online', true);

    // Still need to check schedule for time slot
    // This would require more complex query based on current time
}

// For advance orders (future dates), don't filter by is_online
// Just check their weekly schedule as normal

$chefs = $query->get();
```

---

### Phase 3: Order Validation - 3 Hour Minimum

#### 3.1 Update Order Creation Validation
**File**: [backend/app/Http/Controllers/MapiController.php:1690-1824](backend/app/Http/Controllers/MapiController.php)
**Function**: `createOrder()`

Add validation BEFORE line 1695 (before payment method check):

```php
public function createOrder(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);

    // ===== NEW: Validate 3-hour minimum window =====
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

    // ===== NEW: Validate chef online status for same-day orders =====
    $isSameDayOrder = date('Y-m-d', $orderTimestamp) === date('Y-m-d', $currentTimestamp);

    if ($isSameDayOrder) {
        $chef = app(Listener::class)->where('id', $request->chef_user_id)->first();

        if (!$chef) {
            return response()->json(['success' => 0, 'error' => 'Chef not found']);
        }

        if (!$chef->is_online) {
            return response()->json([
                'success' => 0,
                'error' => 'This chef is not currently accepting orders. Please try again later or choose a future delivery date.',
                'chef_offline' => true,
            ]);
        }
    }
    // ===== END NEW VALIDATION =====

    // Continue with existing order creation logic...
    $chef_payment_method = app(PaymentMethodListener::class)...
```

**Why this location:**
- Fail fast: Check time window before expensive Stripe API calls
- Clear error messages to customer
- Prevents wasted processing

---

### Phase 4: Notification Service

#### 4.1 Create Online Reminder Service
**File**: New file `backend/app/Services/ChefOnlineReminderService.php`

```php
<?php

namespace App\Services;

use App\Listener;
use App\Models\Availabilities;
use App\Notification;
use App\Models\NotificationTemplates;
use Illuminate\Support\Facades\Log;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Exception;

class ChefOnlineReminderService
{
    protected $twilioService;
    protected $firebaseMessaging;

    public function __construct(TwilioService $twilioService)
    {
        $this->twilioService = $twilioService;

        try {
            $this->firebaseMessaging = Firebase::messaging();
        } catch (\Exception $e) {
            $this->firebaseMessaging = null;
            Log::warning('Firebase not configured: ' . $e->getMessage());
        }
    }

    /**
     * Send reminder to chef to toggle online
     *
     * @param int $chefId
     * @param string $scheduledTime The time they're scheduled (e.g., "11:00 AM")
     * @return bool
     */
    public function sendOnlineReminder($chefId, $scheduledTime)
    {
        $chef = app(Listener::class)->where('id', $chefId)->first();

        if (!$chef) {
            Log::warning("Chef not found for online reminder", ['chef_id' => $chefId]);
            return false;
        }

        // Skip if already online
        if ($chef->is_online) {
            Log::info("Chef already online, skipping reminder", ['chef_id' => $chefId]);
            return false;
        }

        // Skip if we recently sent a reminder (prevent spam)
        if ($chef->last_online_reminder_sent_at) {
            $lastReminderTime = strtotime($chef->last_online_reminder_sent_at);
            $timeSinceLastReminder = time() - $lastReminderTime;

            // Don't send more than once per hour
            if ($timeSinceLastReminder < 3600) {
                Log::info("Recently sent reminder, skipping", [
                    'chef_id' => $chefId,
                    'minutes_since_last' => round($timeSinceLastReminder / 60)
                ]);
                return false;
            }
        }

        $title = "Time to go online!";
        $body = "You have availability starting at {$scheduledTime}. Toggle online to start accepting orders.";

        $sent = false;

        // 1. Push notification
        if ($chef->fcm_token && $this->firebaseMessaging) {
            try {
                $this->sendPushNotification($chef, $title, $body);
                $sent = true;
                Log::info("Sent push notification", ['chef_id' => $chefId]);
            } catch (Exception $e) {
                Log::error("Failed to send push notification", [
                    'chef_id' => $chefId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // 2. SMS notification (more reliable for time-sensitive reminders)
        if ($chef->phone) {
            try {
                $this->sendSmsReminder($chef, $scheduledTime);
                $sent = true;
                Log::info("Sent SMS reminder", ['chef_id' => $chefId]);
            } catch (Exception $e) {
                Log::error("Failed to send SMS reminder", [
                    'chef_id' => $chefId,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Update reminder timestamp
        if ($sent) {
            app(Listener::class)->where('id', $chefId)->update([
                'last_online_reminder_sent_at' => now()
            ]);
        }

        return $sent;
    }

    /**
     * Send push notification via Firebase
     */
    private function sendPushNotification($chef, $title, $body)
    {
        if (!$this->firebaseMessaging) {
            return;
        }

        $message = CloudMessage::withTarget('token', $chef->fcm_token)
            ->withNotification([
                'title' => $title,
                'body' => $body,
            ])
            ->withData([
                'type' => 'online_reminder',
                'action' => 'toggle_online',
                'chef_id' => $chef->id,
            ]);

        $this->firebaseMessaging->send($message);

        // Save to notifications table
        Notification::create([
            'title' => $title,
            'body' => $body,
            'image' => $chef->photo ?? 'N/A',
            'fcm_token' => $chef->fcm_token,
            'user_id' => $chef->id,
            'role' => 'chef',
        ]);
    }

    /**
     * Send SMS reminder via Twilio
     */
    private function sendSmsReminder($chef, $scheduledTime)
    {
        $message = "Taist: You're scheduled tomorrow at {$scheduledTime}. Confirm now to receive same-day orders. Open app to confirm or adjust.";

        $this->twilioService->sendSms(
            $chef->phone,
            $message
        );
    }

    /**
     * Find chefs who should receive reminders right now
     *
     * @return array Array of chef IDs with their scheduled times
     */
    public function findChefsNeedingReminders()
    {
        $currentTime = now();
        $tomorrow = $currentTime->copy()->addDay();
        $tomorrowDayOfWeek = strtolower($tomorrow->format('l')); // monday, tuesday, etc.
        $currentTimeStr = $currentTime->format('H:i'); // 14:30

        // Get all availabilities
        $availabilities = app(Availabilities::class)->with('user')->get();

        $chefsToRemind = [];

        foreach ($availabilities as $availability) {
            $chef = app(Listener::class)->where('id', $availability->user_id)->first();

            if (!$chef || $chef->user_type != 2) {
                continue;
            }

            // Skip if already online (already confirmed)
            if ($chef->is_online) {
                continue;
            }

            // Check if they have availability for tomorrow
            $startField = $tomorrowDayOfWeek . '_start';
            $endField = $tomorrowDayOfWeek . '_end';

            $scheduledStart = $availability->$startField;
            $scheduledEnd = $availability->$endField;

            if (!$scheduledStart || !$scheduledEnd) {
                continue; // Not available tomorrow
            }

            // Check if we're in the reminder window (24 hours before start)
            // Create tomorrow's scheduled start timestamp
            $tomorrowStartTimestamp = strtotime($tomorrow->format('Y-m-d') . ' ' . $scheduledStart);
            $reminderTime = $tomorrowStartTimestamp - (24 * 60 * 60); // 24 hours before
            $now = time();

            // Send reminder if we're within 5 minutes of the reminder time (24 hours before start)
            // This gives a wider window for the cron job execution
            if (abs($now - $reminderTime) <= 300) { // 5 minute window
                $chefsToRemind[] = [
                    'chef_id' => $chef->id,
                    'scheduled_time' => date('g:i A', $tomorrowStartTimestamp),
                ];
            }
        }

        return $chefsToRemind;
    }
}
```

#### 4.2 Create Auto-Online Service
**File**: New file `backend/app/Services/ChefAutoOnlineService.php`

```php
<?php

namespace App\Services;

use App\Listener;
use Illuminate\Support\Facades\Log;

class ChefAutoOnlineService
{
    /**
     * Find and toggle online chefs whose online_start time has arrived
     *
     * @return int Number of chefs toggled online
     */
    public function processAutoOnline()
    {
        $now = time();

        // Find all chefs who are scheduled to go online (not yet online, but start time has passed)
        $chefsToToggleOn = app(Listener::class)
            ->where('user_type', 2)
            ->where('is_online', false)
            ->whereNotNull('online_start')
            ->whereNotNull('online_until')
            ->get()
            ->filter(function ($chef) use ($now) {
                $startTime = strtotime($chef->online_start);
                return $startTime <= $now && $startTime > 0;
            });

        $count = 0;
        foreach ($chefsToToggleOn as $chef) {
            app(Listener::class)->where('id', $chef->id)->update([
                'is_online' => true,
                'last_toggled_online_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Chef auto-toggled online', [
                'chef_id' => $chef->id,
                'online_start' => $chef->online_start,
                'online_until' => $chef->online_until,
                'timestamp' => now()
            ]);

            $count++;
        }

        return $count;
    }
}
```

#### 4.3 Create Auto-Offline Service
**File**: New file `backend/app/Services/ChefAutoOfflineService.php`

```php
<?php

namespace App\Services;

use App\Listener;
use Illuminate\Support\Facades\Log;

class ChefAutoOfflineService
{
    /**
     * Find and toggle offline chefs whose online_until time has passed
     *
     * @return int Number of chefs toggled offline
     */
    public function processAutoOffline()
    {
        $now = time();

        // Find all chefs who are online with online_until in the past
        $chefsToToggleOff = app(Listener::class)
            ->where('user_type', 2)
            ->where('is_online', true)
            ->whereNotNull('online_until')
            ->get()
            ->filter(function ($chef) use ($now) {
                return strtotime($chef->online_until) <= $now;
            });

        $count = 0;
        foreach ($chefsToToggleOff as $chef) {
            app(Listener::class)->where('id', $chef->id)->update([
                'is_online' => false,
                'online_until' => null,
                'last_toggled_offline_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Chef auto-toggled offline', [
                'chef_id' => $chef->id,
                'online_until' => $chef->online_until,
                'timestamp' => now()
            ]);

            $count++;
        }

        return $count;
    }
}
```

#### 4.4 Create Scheduled Commands
**File**: New file `backend/app/Console/Commands/SendOnlineReminders.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ChefOnlineReminderService;
use Illuminate\Support\Facades\Log;

class SendOnlineReminders extends Command
{
    protected $signature = 'chefs:send-online-reminders';
    protected $description = 'Send reminders to chefs to toggle online when they have scheduled availability';

    protected $reminderService;

    public function __construct(ChefOnlineReminderService $reminderService)
    {
        parent::__construct();
        $this->reminderService = $reminderService;
    }

    public function handle()
    {
        $this->info('Checking for chefs who need online reminders...');

        $chefsToRemind = $this->reminderService->findChefsNeedingReminders();

        if (empty($chefsToRemind)) {
            $this->info('No chefs need reminders at this time.');
            Log::info('Online reminders check: No chefs need reminders');
            return 0;
        }

        $this->info("Found " . count($chefsToRemind) . " chef(s) to remind.");

        $sentCount = 0;
        foreach ($chefsToRemind as $chef) {
            $this->line("Sending reminder to chef {$chef['chef_id']} for {$chef['scheduled_time']}");

            $sent = $this->reminderService->sendOnlineReminder(
                $chef['chef_id'],
                $chef['scheduled_time']
            );

            if ($sent) {
                $sentCount++;
            }
        }

        $this->info("Successfully sent {$sentCount} reminder(s).");
        Log::info('Online reminders sent', [
            'total_found' => count($chefsToRemind),
            'sent' => $sentCount
        ]);

        return 0;
    }
}
```

**File**: New file `backend/app/Console/Commands/AutoToggleOffline.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ChefAutoOfflineService;
use Illuminate\Support\Facades\Log;

class AutoToggleOffline extends Command
{
    protected $signature = 'chefs:auto-toggle-offline';
    protected $description = 'Automatically toggle chefs offline when their online_until time has passed';

    protected $autoOfflineService;

    public function __construct(ChefAutoOfflineService $autoOfflineService)
    {
        parent::__construct();
        $this->autoOfflineService = $autoOfflineService;
    }

    public function handle()
    {
        $this->info('Checking for chefs to auto-toggle offline...');

        $count = $this->autoOfflineService->processAutoOffline();

        if ($count > 0) {
            $this->info("Auto-toggled {$count} chef(s) offline.");
            Log::info('Auto-toggled chefs offline', ['count' => $count]);
        } else {
            $this->info('No chefs to toggle offline at this time.');
        }

        return 0;
    }
}
```

**File**: New file `backend/app/Console/Commands/AutoToggleOnline.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ChefAutoOnlineService;
use Illuminate\Support\Facades\Log;

class AutoToggleOnline extends Command
{
    protected $signature = 'chefs:auto-toggle-online';
    protected $description = 'Automatically toggle chefs online when their online_start time has arrived';

    protected $autoOnlineService;

    public function __construct(ChefAutoOnlineService $autoOnlineService)
    {
        parent::__construct();
        $this->autoOnlineService = $autoOnlineService;
    }

    public function handle()
    {
        $this->info('Checking for chefs to auto-toggle online...');

        $count = $this->autoOnlineService->processAutoOnline();

        if ($count > 0) {
            $this->info("Auto-toggled {$count} chef(s) online.");
            Log::info('Auto-toggled chefs online', ['count' => $count]);
        } else {
            $this->info('No chefs to toggle online at this time.');
        }

        return 0;
    }
}
```

#### 4.5 Schedule the Commands
**File**: [backend/app/Console/Kernel.php](backend/app/Console/Kernel.php)

Add to the `schedule()` method:

```php
// Run every 5 minutes to check for online reminders (24 hours before scheduled time)
$schedule->command('chefs:send-online-reminders')
    ->everyFiveMinutes()
    ->withoutOverlapping();

// Run every minute to auto-toggle chefs online when their scheduled start time arrives
$schedule->command('chefs:auto-toggle-online')
    ->everyMinute()
    ->withoutOverlapping();

// Run every minute to auto-toggle offline chefs whose time has passed
$schedule->command('chefs:auto-toggle-offline')
    ->everyMinute()
    ->withoutOverlapping();
```

---

### Phase 5: Frontend Integration Points

#### 5.1 Mobile App - Chef Toggle UI
**Location**: Chef dashboard/home screen

**Components Needed:**
1. **Toggle Switch with Time Picker**
   - Large, prominent placement at top of chef dashboard
   - Shows current online status
   - **When toggling ON**: Show modal "When will you be available?"
   - Two time pickers:
     - **START TIME**: "From:" with options (Now, +1 hour, +2 hours, +4 hours, Custom)
     - **END TIME**: "Until:" with options (+2 hours from start, +4 hours from start, +6 hours from start, Custom)
   - If "Now" selected for start, chef goes online immediately
   - If future time selected for start, chef scheduled for later (notification sent 4 hours before)
   - Real-time updates via API
   - Visual feedback on toggle (loading state)

2. **Status Indicator**
   - **When online**: Green dot + "Online until [time]"
   - **When scheduled**: Yellow dot + "Scheduled: [start_time] - [end_time]"
   - **When offline**: Gray dot + "Offline"
   - Countdown timer showing time remaining online (when online)
   - Show scheduled time range (when scheduled)

3. **Auto-Offline Notification**
   - 5 minutes before `online_until`: "You'll be auto-toggled offline in 5 minutes. Extend time?"
   - Quick action buttons: "Extend 1 hour", "Extend 2 hours", "Go offline now"

4. **Reminder Handler**
   - When push notification received with `action: 'toggle_online'`
   - Deep link directly to toggle switch
   - Can toggle directly from notification (if platform supports)

**API Calls:**
```
GET /mapi/get_online_status - On app load and periodically
POST /mapi/toggle_online - When user toggles switch
Body: {
  "is_online": true/false,
  "online_start": "2025-12-03 14:00:00" (required when is_online = true),
  "online_until": "2025-12-03 17:00:00" (required when is_online = true)
}
```

#### 5.2 Mobile App - Customer Order Flow
**Location**: Chef selection & order creation screens

**Changes Needed:**
1. **Chef Listing**
   - When showing available chefs, pass `order_date` to API
   - Show "Online Now" badge for same-day orders (no "Last online" transparency)
   - Show availability schedule for future orders
   - Different visual treatment for online vs offline chefs
   - **Do NOT show** "Last online" times or any chef availability history to customers

2. **Order Creation**
   - Validate 3-hour minimum on frontend BEFORE API call
   - Show user-friendly error if they select time too soon
   - DateTimePicker should disable times within 3 hours
   - If same-day and chef goes offline during order flow, show error

3. **Error Handling**
   - Handle `chef_offline` error from API
   - Suggest: "This chef is not available right now. Try selecting a later time or choose another chef."

---

### Phase 6: Admin Dashboard

#### 6.1 Chef Online Status Overview
**File**: Backend admin controller (need to identify exact file)

**Features:**
1. **Real-Time Status Board**
   - List all chefs with online status
   - Last online timestamp
   - Current schedule for today
   - Filter by online/offline
   - Search by chef name

2. **Analytics Dashboard**
   - Average online time per chef
   - Online compliance rate (online during scheduled hours)
   - Response time to reminders
   - Orders missed due to being offline

3. **Emergency Controls**
   - Force chef offline (for safety/quality issues)
   - Disable notifications for specific chef
   - View notification history

---

## Testing Plan

### Unit Tests

1. **Order Validation Tests**
   ```php
   // Test 3-hour minimum validation
   - Order 2 hours from now → should fail
   - Order exactly 3 hours from now → should succeed
   - Order 4 hours from now → should succeed
   ```

2. **Chef Availability Logic**
   ```php
   // Same-day order tests
   - Chef online + scheduled → should show
   - Chef offline + scheduled → should hide
   - Chef online + not scheduled → should hide

   // Future order tests
   - Chef online + scheduled for that day → should show
   - Chef offline + scheduled for that day → should show
   - Chef not scheduled for that day → should hide
   ```

3. **Toggle Endpoint Tests**
   ```php
   - Customer tries to toggle → should fail (403)
   - Chef toggles online → should update timestamp
   - Chef toggles offline → should update timestamp
   - Invalid user → should fail (401)
   ```

4. **Reminder Service Tests**
   ```php
   - Chef online → no reminder sent
   - Chef offline + not in window → no reminder sent
   - Chef offline + in window → reminder sent
   - Chef offline + already reminded → no duplicate
   ```

### Integration Tests

1. **End-to-End Order Flow**
   - Customer selects same-day delivery
   - System filters to only online chefs
   - Customer attempts order 2 hours away → blocked
   - Customer changes to 4 hours away → succeeds

2. **Notification Flow**
   - Chef scheduled for 11:00 AM
   - At 10:30 AM: reminder sent
   - Chef doesn't respond
   - At 11:00 AM: second reminder sent
   - Chef toggles online
   - No more reminders sent

3. **Toggle Persistence**
   - Chef toggles online
   - App closes/reopens
   - Status persists correctly

### Manual Testing Checklist

- [ ] Chef can toggle online/offline
- [ ] Toggle state persists after app restart
- [ ] Customer sees only online chefs for same-day
- [ ] Customer sees all scheduled chefs for future dates
- [ ] 3-hour validation blocks early orders
- [ ] Reminders sent at correct times
- [ ] SMS and push both work
- [ ] No duplicate reminders
- [ ] Admin can view online status
- [ ] Timestamps recorded correctly

---

## Database Migration Files to Create

1. **`2025_12_03_000002_add_online_status_to_users.php`**
   - Adds is_online, toggle timestamps, reminder tracking to tbl_users

---

## API Endpoints to Create

1. **POST `/mapi/toggle_online`**
   - Auth: Required (chef only)
   - Body: `{ "is_online": boolean, "online_start": "2025-12-03 14:00:00" (required when is_online=true), "online_until": "2025-12-03 17:00:00" (required when is_online=true) }`
   - Response: Updated online status with timestamps, online_start, and online_until

2. **GET `/mapi/get_online_status`**
   - Auth: Required
   - Response: Current online status with timestamps, online_start, and online_until

---

## Files to Modify

1. **[backend/app/Listener.php](backend/app/Listener.php)**
   - Add fillable fields
   - Add helper methods

2. **[backend/app/Http/Controllers/MapiController.php](backend/app/Http/Controllers/MapiController.php)**
   - Add toggleOnline() function (line ~460)
   - Add getOnlineStatus() function
   - Modify createOrder() function (line 1690) - add 3-hour validation
   - Modify chef search/discovery function - add online filtering

3. **[backend/routes/mapi.php](backend/routes/mapi.php)**
   - Add toggle_online route (line ~100)
   - Add get_online_status route

4. **[backend/app/Console/Kernel.php](backend/app/Console/Kernel.php)**
   - Add scheduled command for reminders

---

## Files to Create

1. **`backend/database/migrations/2025_12_03_000002_add_online_status_to_users.php`**
   - Database schema changes (adds is_online, online_start, online_until, timestamps)

2. **`backend/app/Services/ChefOnlineReminderService.php`**
   - Notification logic for online reminders (4 hours before scheduled time)

3. **`backend/app/Services/ChefAutoOnlineService.php`**
   - Auto-toggle online logic when online_start time arrives

4. **`backend/app/Services/ChefAutoOfflineService.php`**
   - Auto-toggle offline logic when online_until time passes

5. **`backend/app/Console/Commands/SendOnlineReminders.php`**
   - Scheduled command to send reminders

6. **`backend/app/Console/Commands/AutoToggleOnline.php`**
   - Scheduled command to auto-toggle chefs online

7. **`backend/app/Console/Commands/AutoToggleOffline.php`**
   - Scheduled command to auto-toggle chefs offline

---

## Configuration Changes

### Environment Variables
No new environment variables needed - reuses existing:
- `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` (SMS)
- `FIREBASE_CREDENTIALS` (Push notifications)

### Cron Schedule
Add to server crontab:
```bash
# Laravel task scheduler (runs every minute, triggers scheduled commands)
* * * * * cd /path-to-project/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## Rollout Plan

### Phase 1: Backend Implementation (Week 1)
1. Day 1-2: Database migration and model updates
2. Day 3: API endpoints (toggle, status)
3. Day 4: Order validation (3-hour rule, online check)
4. Day 5: Testing and fixes

### Phase 2: Notification System (Week 2)
1. Day 1-2: Reminder service implementation
2. Day 3: Scheduled command and testing
3. Day 4-5: SMS and push notification testing

### Phase 3: Frontend Integration (Week 3)
1. Day 1-3: Mobile app toggle UI
2. Day 4-5: Customer order flow updates

### Phase 4: Admin Dashboard (Week 4)
1. Day 1-3: Status overview and analytics
2. Day 4-5: Testing and refinements

### Phase 5: Beta Testing (Week 5)
1. Select 5-10 pilot chefs
2. Monitor closely for issues
3. Gather feedback
4. Iterate on notification timing and UX

### Phase 6: Full Rollout (Week 6)
1. Roll out to all chefs
2. In-app tutorial/onboarding
3. Email announcement
4. Monitor metrics

---

## Success Metrics

### Operational Metrics
- **Online Compliance Rate**: % of time chefs are online during scheduled hours
  - Target: 80%+

- **Response Time**: Time between reminder and toggle online
  - Target: <10 minutes average

- **Missed Orders**: Orders customer couldn't place due to no chefs online
  - Track and minimize

### User Experience Metrics
- **Chef Satisfaction**: Survey about toggle system
  - Target: 4/5 stars

- **Customer Impact**: Orders successfully placed vs blocked
  - Ensure <5% orders blocked due to 3-hour rule

- **Notification Effectiveness**: % of reminders that result in chef going online
  - Target: 60%+

---

## Edge Cases & Considerations

### 1. Chef Goes Offline Mid-Order
**Scenario**: Customer browsing chef's menu, chef toggles offline before checkout

**Solution**:
- Frontend: Check chef still online before final order submission
- Backend: Validate in createOrder() endpoint
- Error message: "This chef is no longer available. Please try a later time."

### 2. No Chefs Online
**Scenario**: Customer wants same-day order, no chefs online

**Solutions**:
- Show message: "No chefs available for same-day delivery. Try selecting a future date."
- Button: "See Tomorrow's Availability"
- Suggest advance ordering

### 3. Chef Forgets to Toggle Offline
**Scenario**: Chef finishes for day but leaves toggle on

**Solution**:
- ✅ **HANDLED**: Chef must specify `online_until` when going online
- System auto-toggles offline at that time
- Optional: 5-min warning notification before auto-offline with option to extend

### 4. Timezone Considerations
**Current Assumption**: All users in same timezone (local service)

**If Multi-Timezone**:
- Store all timestamps in UTC
- Convert for display using user timezone
- 3-hour validation uses customer's local time

### 5. Scheduled Command Failure
**Scenario**: Cron job stops, reminders don't send

**Monitoring**:
- Laravel Telescope/Horizon for job monitoring
- Daily health check: "Did command run in last 30 minutes?"
- Alert via email/Slack if command fails 3 times

### 6. Push Notification Permission Denied
**Scenario**: Chef has push disabled

**Solution**:
- Fall back to SMS (more reliable)
- In-app banner: "Enable notifications to receive order alerts"
- Still check app periodically (polling)

### 7. Chef Wants to Extend Online Time
**Scenario**: Chef is online until 5pm but wants to stay online longer

**Solution**:
- Chef can toggle online again while already online
- System treats it as updating `online_until` time
- API allows toggling online when already online (updates `online_until`)
- Frontend shows "Extend time" button alongside "Go offline" button
- 5-minute warning notification includes "Extend" quick actions

---

## Security Considerations

1. **Authorization**
   - Only chefs can toggle online (enforced in API)
   - Customers cannot see/modify toggle state
   - Admin has read-only view (unless override needed)

2. **Rate Limiting**
   - Prevent toggle spam (max 10 toggles per hour?)
   - API rate limiting on all endpoints

3. **Data Privacy**
   - Don't expose chef phone numbers to customers
   - Online status is functional, not private

4. **Notification Security**
   - Validate all SMS/push recipients
   - No PII in notification content
   - Sanitize all user inputs

---

## Future Enhancements (Out of Scope for TMA-011)

1. **Smart Scheduling**
   - AI predicts when chef should be online based on historical demand
   - Proactive suggestions: "You usually get orders at this time"

2. **Quick Toggle**
   - iOS widget for instant toggle
   - Apple Watch app integration

3. **Auto-Online**
   - Chef can set "auto-online" during scheduled hours
   - Optional feature, defaults to manual

4. **Batch Notifications**
   - "3 customers searching for chefs in your area right now!"
   - Incentivize going online during high demand

5. **Analytics for Chefs**
   - "You were online 23 hours this week"
   - "You received 12 orders while online"
   - "Average earnings: $X/hour when online"

---

## Design Decisions (Confirmed)

1. **Order Logic**: ✅ **Advance vs Intra-Day Orders**
   - **Advance orders (future dates)**: Customers can ALWAYS order based on chef's scheduled hours
   - **Intra-day orders (same-day)**: Chef must toggle on/confirm to receive orders
   - This gives chefs control over same-day orders while keeping future dates always bookable

2. **Auto-Offline Behavior**: ✅ **YES - Auto-toggle offline**
   - When chef toggles online, they specify "available until" time
   - System automatically toggles them offline at that time
   - Ensures customers don't order when chef can't fulfill

3. **Grace Period**: ✅ **Strict 3 hours** (can be adjusted later if needed)
   - No grace period for now
   - Strict validation: `order_date >= current_time + (3 * 60 * 60)`

4. **Notification Timing**: ✅ **Single reminder 24 hours before scheduled start**
   - Gives chef advance notice to confirm their availability for next day
   - Example: Chef scheduled tomorrow 2pm → notify today at 2pm (24 hours before)
   - Reminder emphasizes "confirm to receive same-day orders"
   - If they miss it, advance orders (future dates) are still bookable

5. **Multiple Reminders**: ✅ **Only one reminder per schedule block**
   - Single reminder 24 hours before scheduled time
   - No additional reminders if they don't respond

6. **Customer Transparency**: ✅ **NO - No "Last online" visibility**
   - Customers do NOT see when chef was last online
   - Only see "Online Now" badge for same-day orders
   - Prevents discouragement from seeing inactive chefs

7. **Enforcement**: ✅ **No penalties for now**
   - Track metrics but don't punish chefs initially
   - Monitor online compliance rates
   - Can add incentives/penalties later based on data

---

## Dependencies

### Existing Infrastructure (Already Implemented)
- ✅ Twilio SMS service ([OrderSmsService.php](backend/app/Services/OrderSmsService.php))
- ✅ Firebase push notifications ([MapiController.php](backend/app/Http/Controllers/MapiController.php))
- ✅ Order acceptance deadline system ([Orders.php:123-171](backend/app/Models/Orders.php))
- ✅ Scheduled commands infrastructure ([Kernel.php](backend/app/Console/Kernel.php))

### External Services
- Twilio (SMS) - already configured
- Firebase Cloud Messaging (push) - already configured
- Laravel Task Scheduler (cron) - needs server setup if not already

---

## Deployment Checklist

### Backend
- [ ] Run migration: `php artisan migrate`
- [ ] Clear config cache: `php artisan config:clear`
- [ ] Clear route cache: `php artisan route:clear`
- [ ] Restart queue workers (if using)
- [ ] Verify cron job is running: `php artisan schedule:run`
- [ ] Test API endpoints with Postman

### Database
- [ ] Backup database before migration
- [ ] Run migration on staging first
- [ ] Verify new columns exist: `DESCRIBE tbl_users`
- [ ] Verify indexes created

### Monitoring
- [ ] Add logging for toggle events
- [ ] Monitor error rates in first 24 hours
- [ ] Watch notification delivery rates
- [ ] Check cron job execution logs

### Communication
- [ ] In-app announcement to chefs
- [ ] Email to all chefs explaining new feature
- [ ] Update chef onboarding materials
- [ ] Update customer FAQ if needed

---

## Related Documentation

- [TMA-001: Twilio SMS Notifications](TMA-001-TWILIO-SMS-NOTIFICATIONS-PLAN.md)
- [SMS Notifications Quick Reference](SMS-NOTIFICATIONS-QUICK-REFERENCE.md)
- [Twilio Setup Guide](TWILIO-SETUP.md)

---

## Notes

- The current system has `tbl_availabilities` with weekly schedule (monday_start, tuesday_end, etc.)
- Orders already have `acceptance_deadline` field (30 min currently) - see [Orders.php:23](backend/app/Models/Orders.php)
- There's existing SMS infrastructure via [OrderSmsService.php](backend/app/Services/OrderSmsService.php)
- Push notifications use Firebase FCM - see [MapiController.php:291](backend/app/Http/Controllers/MapiController.php)
- Typo in DB: `saterday_start/saterday_end` should be "saturday" but keeping for compatibility

---

**Last Updated**: 2025-12-03
**Document Version**: 4.0 (FINAL)
**Status**: Ready for Implementation

---

## Summary of Changes from v3.0

### Key Updates:
1. ✅ **Order Logic Clarified**:
   - Advance orders (future dates) are ALWAYS bookable based on chef's schedule
   - Intra-day orders (same-day) require chef to toggle on/confirm
   - This distinction is critical for customer experience

2. ✅ **Notification timing changed**: 24 hours before scheduled start (was 4 hours)
   - Rationale: Give chefs advance notice to confirm next day's availability
   - Example: Chef scheduled tomorrow 2pm → notify today at 2pm
   - Reminder emphasizes need to confirm for same-day order eligibility

3. ✅ **Notification wording updated**:
   - SMS: "Taist: You're scheduled tomorrow at [time]. Confirm now to receive same-day orders. Open app to confirm or adjust."
   - Push: "Confirm tomorrow's availability" / "You're scheduled for [time] tomorrow. Confirm now to receive same-day orders."
   - Clear messaging that confirmation is for same-day order eligibility

4. ✅ **Service logic updated**:
   - `ChefOnlineReminderService` now checks for tomorrow's availability (24 hours ahead)
   - Reminder window changed from 4-hour to 24-hour lookhead
   - All related code updated to reflect 24-hour notification window

### What Didn't Change:
- Database schema remains the same (no new fields needed)
- API endpoints remain the same
- Auto-toggle services remain the same
- All other functionality from v3.0 preserved

### Rationale for v4.0:
This version reflects the final user requirements:
- Customers should always be able to book chefs for future dates (reduces friction)
- Toggle is specifically for same-day order control (gives chefs flexibility)
- 24-hour notice is more reasonable for chefs to plan their schedules
- Clear messaging helps chefs understand the purpose of confirmation
