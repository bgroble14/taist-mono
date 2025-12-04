# TMA-001: Twilio SMS Notifications - Implementation Plan

## Overview
Implement comprehensive SMS notifications using Twilio for order lifecycle events affecting both customers and chefs. This system will augment the existing Firebase push notification system with reliable SMS delivery.

---

## Current State Analysis

### Existing Infrastructure
- **Twilio Service**: [backend/app/Services/TwilioService.php](backend/app/Services/TwilioService.php)
  - Currently only implements `sendVerificationCode()` for phone verification during signup
  - Already has error handling, logging, and service enablement checks
  - Returns structured response: `['success' => bool, 'error' => string|null]`

- **Environment Configuration**: [backend/.env](backend/.env)
  ```env
  TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TWILIO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TWILIO_FROM=+1xxxxxxxxxx
  ```

- **Order Status Management**: [backend/app/Http/Controllers/MapiController.php:2805-2986](backend/app/Http/Controllers/MapiController.php#L2805-L2986)
  - `updateOrderStatus()` method handles all order status transitions
  - Currently sends Firebase push notifications only
  - Uses NotificationTemplates (IDs: 4, 6, 10, 14, 15, 20)

- **User Model**: [backend/app/Listener.php](backend/app/Listener.php)
  - Table: `tbl_users`
  - Has `phone` field for SMS delivery
  - Has `first_name`, `last_name` for personalization
  - Has `user_type` field (1 = customer, 2 = chef)

- **Order Model**: [backend/app/Models/Orders.php](backend/app/Models/Orders.php)
  - Table: `tbl_orders`
  - Status values used in order lifecycle:
    - `1` = Requested (pending chef acceptance)
    - `2` = Accepted by chef
    - `3` = Completed by chef
    - `4` = Cancelled
    - `5` = Rejected by chef
    - `7` = Chef on the way

- **Notification Templates**: Database table `tbl_notification_templates`
  - Contains `template_name`, `subject`, `email`, `push`, `text` columns
  - `text` column currently exists but is unused
  - IDs referenced in code: 4, 6, 10, 14, 15, 20

---

## Order Lifecycle & SMS Requirements

### 1. Customer Request (Status → 1)
**Trigger**: Customer creates new order
**Location**: [MapiController.php:1757](backend/app/Http/Controllers/MapiController.php#L1757) - `addOrder()` method
**Recipient**: Chef
**Message Template**:
```
New order request! ORDER#{order_id} from {customer_name} for {order_date}. {menu_title} x{amount}. Total: ${total_price}. Accept within 30 minutes. View in app.
```
**Current Push Notification**: Template ID 6
**Implementation Notes**:
- Must include acceptance deadline urgency
- Include order ID for easy reference
- Menu title from `tbl_menus` table
- Order date formatted as human-readable

---

### 2. Chef Accept (Status 1 → 2)
**Trigger**: Chef accepts order
**Location**: [MapiController.php:2867-2885](backend/app/Http/Controllers/MapiController.php#L2867-L2885) - `updateOrderStatus()` when `status == 2`
**Recipient**: Customer
**Message Template**:
```
Great news! Chef {chef_name} accepted your order ORDER#{order_id} for {order_date}. We'll notify you when they're on the way!
```
**Current Push Notification**: Template ID 10
**Implementation Notes**:
- Reassures customer their order is confirmed
- Sets expectation for next notification

---

### 3. Chef Reject (Status 1 → 5)
**Trigger**: Chef rejects order
**Location**: [MapiController.php:2945-2963](backend/app/Http/Controllers/MapiController.php#L2945-L2963) - `updateOrderStatus()` when `status == 5`
**Recipient**: Customer
**Message Template**:
```
Sorry, Chef {chef_name} is unable to fulfill your order ORDER#{order_id}. You will receive a full refund within 5-7 business days. Browse other chefs in the app!
```
**Current Push Notification**: Template ID 20
**Implementation Notes**:
- Include refund information to reduce support inquiries
- Encourage customer to continue using platform

---

### 4. Chef On My Way (Status 2 → 7)
**Trigger**: Chef marks as on the way
**Location**: [MapiController.php:2964-2983](backend/app/Http/Controllers/MapiController.php#L2964-L2983) - `updateOrderStatus()` when `status == 7`
**Recipient**: Customer
**Message Template**:
```
Chef {chef_name} is on the way with your order ORDER#{order_id}! They should arrive around {order_time}.
```
**Current Push Notification**: Template ID 14
**Implementation Notes**:
- Critical time-sensitive notification
- Parse and format `order_date` timestamp nicely

---

### 5. Chef Complete Order (Status 7 → 3)
**Trigger**: Chef marks order as completed
**Location**: [MapiController.php:2886-2925](backend/app/Http/Controllers/MapiController.php#L2886-L2925) - `updateOrderStatus()` when `status == 3`
**Recipient**: Customer
**Message Template**:
```
Your order ORDER#{order_id} is complete! Hope you enjoyed it. Please rate your experience with Chef {chef_name} in the app.
```
**Current Push Notification**: Template ID 15
**Implementation Notes**:
- Also sends email receipt (already implemented)
- Encourages review submission

---

### 6. Order Reminders (24 Hours Before)
**Trigger**: Scheduled task (new command)
**Location**: New command: `backend/app/Console/Commands/SendOrderReminders.php`
**Recipients**: BOTH Chef AND Customer

**Chef Message**:
```
Reminder: You have order ORDER#{order_id} from {customer_name} scheduled for tomorrow at {order_time}. {menu_title} x{amount}. Don't forget!
```

**Customer Message**:
```
Reminder: Your order ORDER#{order_id} from Chef {chef_name} is scheduled for tomorrow at {order_time}. {menu_title} x{amount}. Can't wait!
```

**Implementation Notes**:
- New scheduled command to run hourly or every 30 minutes
- Query orders where `order_date` is between 23-25 hours from now
- Check if reminder already sent (need new DB column: `reminder_sent_at`)
- Register in [backend/app/Console/Kernel.php:25-33](backend/app/Console/Kernel.php#L25-L33)

---

## Architecture Design

### Phase 1: Enhance TwilioService (Foundation)

**File**: [backend/app/Services/TwilioService.php](backend/app/Services/TwilioService.php)

**New Methods to Add**:

```php
/**
 * Send a generic SMS notification
 * Reusable method for all SMS sending
 *
 * @param string $phoneNumber - E.164 format phone number
 * @param string $message - SMS message body (max 160 chars recommended)
 * @param array $metadata - Optional metadata for logging (order_id, user_id, etc)
 * @return array ['success' => bool, 'error' => string|null, 'sid' => string|null]
 */
public function sendSMS($phoneNumber, $message, $metadata = [])

/**
 * Send order notification SMS to a user
 * Wrapper with order-specific logic
 *
 * @param int $userId - User ID from tbl_users
 * @param string $message - SMS message body
 * @param int $orderId - Order ID for logging and tracking
 * @param string $notificationType - Type descriptor for logging (e.g., 'order_accepted')
 * @return array ['success' => bool, 'error' => string|null]
 */
public function sendOrderNotification($userId, $message, $orderId, $notificationType)

/**
 * Build SMS message from notification template
 * Replaces placeholders with actual data
 *
 * @param string $template - Message template with {placeholders}
 * @param array $data - Associative array of placeholder values
 * @return string - Final message with placeholders replaced
 */
private function buildMessage($template, $data)

/**
 * Validate and format phone number
 * Ensures E.164 format
 *
 * @param string $phoneNumber - Raw phone number
 * @return string|null - Formatted phone number or null if invalid
 */
private function formatPhoneNumber($phoneNumber)

/**
 * Truncate message to SMS limits
 * Ensures message fits in single SMS (160 chars) or handles multi-part
 *
 * @param string $message - Original message
 * @param int $maxLength - Max length (default 160)
 * @return string - Truncated message with "..." if needed
 */
private function truncateMessage($message, $maxLength = 160)
```

**Logging Strategy**:
- Log all SMS attempts (success and failure) to Laravel log
- Include metadata: user_id, order_id, notification_type, phone_number (masked), error
- Use Log levels: `info` for success, `error` for failures, `warning` for config issues

---

### Phase 2: Create SMS Notification Helper Service

**New File**: `backend/app/Services/OrderSmsService.php`

This service sits between the controller and TwilioService, handling all order-specific SMS logic.

**Purpose**:
- Centralize all SMS message templates
- Handle data gathering (user names, menu details, dates)
- Format dates/times appropriately
- Abstract SMS sending from business logic

**Class Structure**:

```php
<?php

namespace App\Services;

use App\Listener;
use App\Models\Orders;
use App\Models\Menus;
use App\Services\TwilioService;
use Illuminate\Support\Facades\Log;

class OrderSmsService
{
    protected $twilioService;

    public function __construct(TwilioService $twilioService)
    {
        $this->twilioService = $twilioService;
    }

    /**
     * Send "new order request" SMS to chef
     */
    public function sendNewOrderNotification($orderId)

    /**
     * Send "order accepted" SMS to customer
     */
    public function sendOrderAcceptedNotification($orderId)

    /**
     * Send "order rejected" SMS to customer
     */
    public function sendOrderRejectedNotification($orderId)

    /**
     * Send "chef on the way" SMS to customer
     */
    public function sendChefOnTheWayNotification($orderId)

    /**
     * Send "order complete" SMS to customer
     */
    public function sendOrderCompleteNotification($orderId)

    /**
     * Send 24-hour reminder SMS to chef
     */
    public function sendChefReminderNotification($orderId)

    /**
     * Send 24-hour reminder SMS to customer
     */
    public function sendCustomerReminderNotification($orderId)

    /**
     * Get order details for SMS (private helper)
     * Returns array with all needed data for templates
     */
    private function getOrderData($orderId)

    /**
     * Format timestamp for SMS display (private helper)
     */
    private function formatOrderDateTime($timestamp)
}
```

**Why Separate Service?**:
- Single Responsibility: TwilioService = SMS delivery, OrderSmsService = Order SMS logic
- Testability: Can mock TwilioService in OrderSmsService tests
- Reusability: Easy to add non-order SMS notifications later (e.g., chef verification approved)
- Maintainability: All SMS templates in one place, not scattered across controllers

---

### Phase 3: Update MapiController

**File**: [backend/app/Http/Controllers/MapiController.php](backend/app/Http/Controllers/MapiController.php)

**Changes Required**:

1. **Add OrderSmsService injection** in constructor [Line 50-60](backend/app/Http/Controllers/MapiController.php#L50-L60):
```php
protected $orderSmsService;

public function __construct(Request $request, OrderSmsService $orderSmsService)
{
    $this->request = $request;
    $this->orderSmsService = $orderSmsService;
    // ... existing Firebase setup
}
```

2. **Update addOrder() method** [Line ~1757](backend/app/Http/Controllers/MapiController.php#L1757):
   - After successfully creating order and sending push notification to chef
   - Add SMS notification call:
   ```php
   // Send SMS to chef about new order
   $this->orderSmsService->sendNewOrderNotification($lastId);
   ```

3. **Update updateOrderStatus() method** [Lines 2805-2986](backend/app/Http/Controllers/MapiController.php#L2805-L2986):
   - Add SMS calls alongside each existing push notification
   - Structure:
   ```php
   // Status 2: Chef accepted
   if ($request->status == 2) {
       // ... existing push notification code ...
       // Add SMS notification
       $this->orderSmsService->sendOrderAcceptedNotification($id);
   }

   // Status 3: Order complete
   else if ($request->status == 3) {
       // ... existing push notification code ...
       // ... existing email receipt code ...
       // Add SMS notification
       $this->orderSmsService->sendOrderCompleteNotification($id);
   }

   // Status 5: Chef rejected
   else if ($request->status == 5) {
       // ... existing push notification code ...
       // Add SMS notification
       $this->orderSmsService->sendOrderRejectedNotification($id);
   }

   // Status 7: Chef on the way
   else if ($request->status == 7) {
       // ... existing push notification code ...
       // Add SMS notification
       $this->orderSmsService->sendChefOnTheWayNotification($id);
   }
   ```

**Error Handling Strategy**:
- SMS failures should NOT block order processing
- Wrap SMS calls in try-catch
- Log errors but continue execution
- Firebase push notifications remain primary, SMS is supplementary

---

### Phase 4: Implement 24-Hour Reminders

#### 4.1 Database Migration

**New File**: `backend/database/migrations/2025_12_03_000001_add_reminder_tracking_to_orders.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReminderTrackingToOrders extends Migration
{
    public function up()
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->timestamp('reminder_sent_at')->nullable()->after('acceptance_deadline');
        });
    }

    public function down()
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropColumn('reminder_sent_at');
        });
    }
}
```

**Purpose**: Track which orders have already received reminder SMS to prevent duplicates

#### 4.2 Console Command

**New File**: `backend/app/Console/Commands/SendOrderReminders.php`

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Orders;
use App\Services\OrderSmsService;
use Illuminate\Support\Facades\Log;

class SendOrderReminders extends Command
{
    protected $signature = 'orders:send-reminders';
    protected $description = 'Send 24-hour reminder SMS to chefs and customers for upcoming orders';

    protected $orderSmsService;

    public function __construct(OrderSmsService $orderSmsService)
    {
        parent::__construct();
        $this->orderSmsService = $orderSmsService;
    }

    public function handle()
    {
        $this->info('Checking for orders needing 24-hour reminders...');

        $now = time();
        $windowStart = $now + (23 * 3600); // 23 hours from now
        $windowEnd = $now + (25 * 3600);   // 25 hours from now

        // Find orders in the reminder window that haven't been reminded
        $orders = Orders::whereIn('status', [1, 2, 7]) // Requested, Accepted, or On The Way
            ->whereNull('reminder_sent_at')
            ->where('order_date', '>=', (string)$windowStart)
            ->where('order_date', '<=', (string)$windowEnd)
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No orders found needing reminders.');
            return 0;
        }

        $this->info("Found {$orders->count()} order(s) needing reminders.");

        $sentCount = 0;
        $failedCount = 0;

        foreach ($orders as $order) {
            try {
                // Send reminder to chef
                $this->orderSmsService->sendChefReminderNotification($order->id);

                // Send reminder to customer
                $this->orderSmsService->sendCustomerReminderNotification($order->id);

                // Mark as reminded
                $order->update(['reminder_sent_at' => now()]);

                $sentCount++;
                $this->info("Sent reminders for order #{$order->id}");
            } catch (\Exception $e) {
                $failedCount++;
                $this->error("Failed to send reminders for order #{$order->id}: " . $e->getMessage());
                Log::error("SendOrderReminders: Failed for order #{$order->id}", [
                    'error' => $e->getMessage(),
                    'order_id' => $order->id
                ]);
            }
        }

        $this->info("Reminder sending complete. Sent: {$sentCount}, Failed: {$failedCount}");
        return 0;
    }
}
```

**Logic Details**:
- Query orders with `order_date` between 23-25 hours from now (2-hour window for flexibility)
- Only consider active orders (status 1, 2, or 7)
- Exclude orders already reminded (`reminder_sent_at IS NULL`)
- Send to BOTH chef and customer
- Mark order after successful sending to prevent re-sending

#### 4.3 Schedule Command

**File**: [backend/app/Console/Kernel.php:25-33](backend/app/Console/Kernel.php#L25-L33)

**Add to schedule() method**:

```php
protected function schedule(Schedule $schedule)
{
    // Existing: Process expired orders every 5 minutes
    $schedule->command('orders:process-expired')
             ->everyFiveMinutes()
             ->withoutOverlapping()
             ->runInBackground();

    // NEW: Send 24-hour order reminders every 30 minutes
    $schedule->command('orders:send-reminders')
             ->everyThirtyMinutes()
             ->withoutOverlapping()
             ->runInBackground();
}
```

**Rationale**:
- Run every 30 minutes to catch orders as they enter the 23-25 hour window
- `withoutOverlapping()` prevents concurrent executions
- `runInBackground()` doesn't block other scheduled tasks

#### 4.4 Update Orders Model

**File**: [backend/app/Models/Orders.php](backend/app/Models/Orders.php)

**Add to $fillable array** [Line 11-41](backend/app/Models/Orders.php#L11-L41):

```php
protected $fillable = [
    // ... existing fields ...
    'reminder_sent_at',  // ADD THIS
];
```

---

### Phase 5: Notification Templates Integration

**Database Table**: `tbl_notification_templates`

**Current Structure**:
- `id` - Primary key
- `template_name` - Template identifier
- `subject` - Email subject
- `email` - Email body HTML
- `push` - Push notification text
- `text` - SMS text (currently unused)
- `status` - Active/inactive
- `created_at`, `updated_at`

**Strategy**:
Two options for SMS templates:

#### Option A: Use Database Templates (Recommended)
**Pros**:
- Consistent with existing notification system
- Can update SMS text without code changes
- Admin panel could manage templates (future enhancement)

**Cons**:
- Requires database updates to populate `text` column
- More complex initial setup

**Implementation**:
1. Create migration to populate `text` column for existing templates
2. Update OrderSmsService to load templates from database
3. Use template ID constants (match push notification IDs)

#### Option B: Hardcode in OrderSmsService
**Pros**:
- Faster initial implementation
- No database changes needed
- Easier to version control message changes

**Cons**:
- Less flexible for non-developers
- Duplicates template concept

**RECOMMENDATION**: Use **Option B** initially for speed, plan migration to Option A later

---

## Implementation Checklist

### Phase 1: Enhance TwilioService
- [ ] Add `sendSMS()` method with generic SMS sending logic
- [ ] Add `sendOrderNotification()` wrapper method
- [ ] Add `buildMessage()` template replacement method
- [ ] Add `formatPhoneNumber()` validation method
- [ ] Add `truncateMessage()` for SMS length limits
- [ ] Update existing `sendVerificationCode()` to use new `sendSMS()` method (DRY)
- [ ] Add comprehensive logging for all SMS operations
- [ ] Write unit tests for TwilioService methods

### Phase 2: Create OrderSmsService
- [ ] Create new `backend/app/Services/OrderSmsService.php` file
- [ ] Implement constructor with TwilioService injection
- [ ] Implement `sendNewOrderNotification()` method
- [ ] Implement `sendOrderAcceptedNotification()` method
- [ ] Implement `sendOrderRejectedNotification()` method
- [ ] Implement `sendChefOnTheWayNotification()` method
- [ ] Implement `sendOrderCompleteNotification()` method
- [ ] Implement `sendChefReminderNotification()` method
- [ ] Implement `sendCustomerReminderNotification()` method
- [ ] Implement `getOrderData()` helper method
- [ ] Implement `formatOrderDateTime()` helper method
- [ ] Define all SMS message templates as constants or methods
- [ ] Write unit tests for OrderSmsService methods

### Phase 3: Update MapiController
- [ ] Add OrderSmsService to constructor injection
- [ ] Update `addOrder()` method to send SMS to chef on new order
- [ ] Update `updateOrderStatus()` for status 2 (accepted) - SMS to customer
- [ ] Update `updateOrderStatus()` for status 3 (complete) - SMS to customer
- [ ] Update `updateOrderStatus()` for status 5 (rejected) - SMS to customer
- [ ] Update `updateOrderStatus()` for status 7 (on the way) - SMS to customer
- [ ] Add try-catch blocks around all SMS calls to prevent blocking
- [ ] Test all order status transitions with SMS sending

### Phase 4: Implement Reminders
- [ ] Create migration `add_reminder_tracking_to_orders`
- [ ] Add `reminder_sent_at` column to Orders $fillable array
- [ ] Run migration on development database
- [ ] Create `SendOrderReminders` console command
- [ ] Implement reminder logic in command handle() method
- [ ] Register command in Console Kernel schedule
- [ ] Test command manually: `php artisan orders:send-reminders`
- [ ] Verify scheduled execution works
- [ ] Test edge cases (orders exactly 24 hours out, multiple orders)

### Phase 5: Documentation
- [ ] Create this implementation plan document
- [ ] Update TWILIO-SETUP.md with new SMS notification features
- [ ] Create SMS_NOTIFICATIONS.md user guide explaining what SMS are sent when
- [ ] Document all SMS message templates
- [ ] Add troubleshooting section for SMS issues
- [ ] Document testing procedure

### Phase 6: Testing
- [ ] Test new order request SMS to chef
- [ ] Test order acceptance SMS to customer
- [ ] Test order rejection SMS to customer
- [ ] Test chef on the way SMS to customer
- [ ] Test order complete SMS to customer
- [ ] Test 24-hour reminder SMS (both chef and customer)
- [ ] Test with invalid phone numbers (should log error, not crash)
- [ ] Test with Twilio disabled (should log warning, not crash)
- [ ] Test SMS character limits and truncation
- [ ] Test rapid-fire order creation (rate limiting concern)

### Phase 7: Deployment
- [ ] Review and merge code changes
- [ ] Run migration on staging database
- [ ] Deploy to Railway staging environment
- [ ] Test SMS sending on staging with real Twilio account
- [ ] Monitor logs for errors
- [ ] Verify scheduled reminders run on staging
- [ ] Deploy to production
- [ ] Monitor production logs for first 24 hours

---

## File Structure Summary

### New Files to Create
```
backend/app/Services/OrderSmsService.php                          [NEW SERVICE]
backend/app/Console/Commands/SendOrderReminders.php               [NEW COMMAND]
backend/database/migrations/2025_12_03_000001_add_reminder_tracking_to_orders.php  [NEW MIGRATION]
docs/SMS-NOTIFICATIONS-USER-GUIDE.md                             [NEW DOCUMENTATION]
```

### Files to Modify
```
backend/app/Services/TwilioService.php                           [ENHANCE]
backend/app/Http/Controllers/MapiController.php                  [UPDATE - add SMS calls]
backend/app/Console/Kernel.php                                   [UPDATE - schedule reminders]
backend/app/Models/Orders.php                                    [UPDATE - add fillable field]
docs/TWILIO-SETUP.md                                             [UPDATE - add SMS notifications info]
```

### Files Referenced (no changes needed)
```
backend/app/Listener.php                                         [User model - phone numbers]
backend/app/Models/NotificationTemplates.php                     [Template reference]
backend/app/Notification.php                                     [Push notification model]
```

---

## Message Templates Reference

### 1. New Order Request (to Chef)
```
New order request! ORDER#{order_id} from {customer_name} for {order_date}. {menu_title} x{amount}. Total: ${total_price}. Accept within 30 minutes. View in app.
```
**Max Length**: ~160 characters (may need truncation for long menu titles)
**Placeholder Example**:
- order_id: 0000123
- customer_name: John Smith
- order_date: Dec 4, 2PM
- menu_title: Grilled Chicken Tacos
- amount: 4
- total_price: 45.00

### 2. Order Accepted (to Customer)
```
Great news! Chef {chef_name} accepted your order ORDER#{order_id} for {order_date}. We'll notify you when they're on the way!
```
**Max Length**: ~120 characters

### 3. Order Rejected (to Customer)
```
Sorry, Chef {chef_name} is unable to fulfill your order ORDER#{order_id}. You will receive a full refund within 5-7 business days. Browse other chefs in the app!
```
**Max Length**: ~160 characters

### 4. Chef On The Way (to Customer)
```
Chef {chef_name} is on the way with your order ORDER#{order_id}! They should arrive around {order_time}.
```
**Max Length**: ~110 characters

### 5. Order Complete (to Customer)
```
Your order ORDER#{order_id} is complete! Hope you enjoyed it. Please rate your experience with Chef {chef_name} in the app.
```
**Max Length**: ~130 characters

### 6. 24-Hour Reminder (to Chef)
```
Reminder: You have order ORDER#{order_id} from {customer_name} scheduled for tomorrow at {order_time}. {menu_title} x{amount}. Don't forget!
```
**Max Length**: ~145 characters

### 7. 24-Hour Reminder (to Customer)
```
Reminder: Your order ORDER#{order_id} from Chef {chef_name} is scheduled for tomorrow at {order_time}. {menu_title} x{amount}. Can't wait!
```
**Max Length**: ~140 characters

---

## Technical Considerations

### SMS Character Limits
- Single SMS: 160 characters (GSM-7 encoding)
- Multi-part SMS: 153 characters per segment
- Unicode/Emoji: 70 characters per segment
- **Strategy**: Keep all messages under 160 characters, truncate menu titles if needed

### Phone Number Format
- Twilio requires E.164 format: `+[country code][number]`
- Database stores various formats
- **Strategy**: Clean and validate in TwilioService before sending

### Error Handling
1. **Invalid phone number**: Log warning, skip SMS, don't block operation
2. **Twilio API error**: Log error, skip SMS, don't block operation
3. **Twilio not configured**: Log info, skip SMS silently
4. **Rate limit hit**: Log error, should never happen with current scale
5. **Network timeout**: Twilio SDK handles retries, log if ultimate failure

### Cost Estimation
- Twilio US SMS: ~$0.0079 per message
- 6 SMS per order lifecycle (new, accepted, on way, complete, 2 reminders)
- Plus 1 SMS for rejection path
- **Estimated**: $0.05-$0.06 per completed order
- With 100 orders/month: ~$5-6/month

### Rate Limiting Concerns
- Twilio has generous rate limits (hundreds per second)
- Current scale won't hit limits
- **Future consideration**: If scaling to 1000+ orders/day, implement queue system

### Testing Strategy
1. **Unit tests**: Mock Twilio client in TwilioService tests
2. **Integration tests**: Use Twilio test credentials in CI/CD
3. **Manual testing**: Use personal phone numbers on staging
4. **Production monitoring**: Alert on SMS failure rate >5%

---

## Documentation Deliverables

### 1. SMS-NOTIFICATIONS-USER-GUIDE.md
**Location**: `docs/SMS-NOTIFICATIONS-USER-GUIDE.md`
**Content**:
- What SMS notifications are sent
- When users receive them
- How to opt-out (if implemented)
- Troubleshooting SMS not received
- Examples of each SMS message

### 2. Update TWILIO-SETUP.md
**Location**: `docs/TWILIO-SETUP.md`
**Add Section**:
- Overview of SMS notification system
- Link to SMS-NOTIFICATIONS-USER-GUIDE.md
- Developer guide for adding new SMS types
- Testing SMS notifications locally

### 3. Code Comments
**In each service/method**:
- Purpose of method
- Parameters explained
- Return value documented
- Example usage

---

## Rollout Strategy

### Phase 1: Development (2-3 days)
1. Day 1: Enhance TwilioService, create OrderSmsService
2. Day 2: Update MapiController, create reminder command
3. Day 3: Testing, documentation, bug fixes

### Phase 2: Staging (1 day)
1. Deploy to Railway staging
2. Test with real phone numbers
3. Monitor logs for errors
4. Verify scheduled reminders run

### Phase 3: Production (1 day)
1. Deploy to production during low-traffic window
2. Monitor first 10-20 orders for SMS delivery
3. Check Twilio console for delivery status
4. Address any issues immediately

### Phase 4: Monitoring (ongoing)
1. Check daily logs for SMS failures
2. Monitor Twilio usage and costs
3. Gather user feedback
4. Iterate on message content if needed

---

## Success Metrics

### Technical Metrics
- SMS delivery rate: Target >95%
- SMS sending latency: Target <2 seconds
- Error rate: Target <2%
- Scheduled reminder accuracy: Target 100%

### User Experience Metrics
- Reduction in "where is my order?" support tickets
- Chef acceptance rate improvement (better notification visibility)
- Customer satisfaction with communication

### Business Metrics
- Order completion rate improvement
- Reduced no-show/confusion incidents
- Platform trust and professionalism

---

## Future Enhancements (Out of Scope for TMA-001)

### 1. SMS Preferences
- Allow users to opt-out of specific SMS types
- Database table: `tbl_user_sms_preferences`
- UI in app settings

### 2. Internationalization
- Support multiple languages
- Detect user locale from profile
- Store templates in multiple languages

### 3. SMS Templates in Admin Panel
- Allow admin to edit SMS templates
- Use `tbl_notification_templates.text` column
- Real-time preview

### 4. Two-Way SMS
- Allow customers to reply to SMS
- Twilio webhook to receive incoming SMS
- Route to support system

### 5. SMS Analytics Dashboard
- Track delivery rates by notification type
- Cost tracking and budgeting
- A/B test message variants

---

## Risk Assessment

### High Risk
❌ **None identified**

### Medium Risk
⚠️ **Twilio costs higher than expected**
- Mitigation: Monitor usage daily first week, set billing alerts
- Fallback: Implement SMS opt-in only, default to push notifications

⚠️ **SMS delivery failures**
- Mitigation: Comprehensive error handling, logging, don't block operations
- Fallback: Firebase push notifications remain primary channel

### Low Risk
⚠️ **Message content issues** (too long, unclear)
- Mitigation: Test with real users, iterate on wording
- Fallback: Easy to update message templates in code

⚠️ **Scheduled reminders not running**
- Mitigation: Test scheduling thoroughly on staging, monitor logs
- Fallback: Manual execution via artisan command if needed

---

## Open Questions

1. **Should SMS be primary or backup to push notifications?**
   - Current plan: Both send simultaneously
   - Alternative: Only send SMS if push fails (more complex, saves costs)

2. **Should we implement SMS opt-out immediately?**
   - Recommendation: Not for v1, add later based on feedback
   - Legal consideration: Check SMS compliance for your jurisdiction

3. **What timezone for reminder sending?**
   - Current plan: Server timezone (UTC on Railway)
   - Better approach: Use order's timezone or user's timezone (requires timezone storage)

4. **Should we send SMS on order cancellation by customer?**
   - Not in current spec
   - Recommendation: Yes, send to chef if order was accepted (status 2 or 7)

5. **Rate limiting for spam prevention?**
   - Not in current spec
   - Recommendation: Add later if abuse detected

---

## Conclusion

This implementation plan provides a comprehensive, production-ready approach to adding SMS notifications to the Taist platform. By leveraging the existing TwilioService foundation and following Laravel best practices, we can deliver reliable, maintainable SMS functionality that enhances the user experience for both chefs and customers.

The phased approach allows for incremental development, testing at each stage, and easy rollback if issues arise. The modular architecture (TwilioService → OrderSmsService → Controllers) ensures clean separation of concerns and enables future enhancements without major refactoring.

**Estimated Total Implementation Time**: 4-5 days
**Estimated Monthly Cost**: $5-10 (based on 100 orders/month)
**Complexity**: Medium
**Priority**: High (directly impacts user experience and order fulfillment)

---

**Document Version**: 1.0
**Created**: December 3, 2025
**Author**: Claude (AI Assistant)
**Status**: Planning - Awaiting Approval to Begin Implementation
