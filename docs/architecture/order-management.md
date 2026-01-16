# Order Management System

Complete documentation of order lifecycle, status transitions, cancellations, refunds, and automatic expiration.

---

## Table of Contents

1. [Overview](#overview)
2. [Order Status Flow](#order-status-flow)
3. [Order Creation](#order-creation)
4. [30-Minute Acceptance Deadline](#30-minute-acceptance-deadline)
5. [Cancellation System](#cancellation-system)
6. [Refund Processing](#refund-processing)
7. [Notifications](#notifications)
8. [Database Schema](#database-schema)

---

## Overview

The order management system handles the complete lifecycle of food orders from placement through delivery or cancellation. Key features include:

- **Status-based workflow** with defined transitions
- **30-minute acceptance deadline** for chef response
- **Automatic expiration and refunds** for unaccepted orders
- **Cancellation tracking** with role attribution
- **Discount code integration**
- **Timezone-aware scheduling**

**Related Files:**
- Model: `backend/app/Models/Orders.php`
- Controller: `backend/app/Http/Controllers/MapiController.php`
- Background Job: `backend/app/Console/Commands/ProcessExpiredOrders.php`

---

## Order Status Flow

```
                    ┌─────────────┐
                    │  REQUESTED  │ (status = 1)
                    │   (New)     │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  ACCEPTED  │  │  REJECTED  │  │  EXPIRED   │
    │ (status=2) │  │ (status=5) │  │ (status=6) │
    └─────┬──────┘  └────────────┘  └────────────┘
          │              │               │
          │              └───────┬───────┘
          │                      │
          │                      ▼
          │              ┌────────────┐
          │              │ CANCELLED  │
          │              │ (status=4) │
          │              └────────────┘
          │
          ▼
    ┌────────────┐
    │ COMPLETED  │
    │ (status=3) │
    └────────────┘
```

### Status Codes

| Code | Status | Description | Who Can Trigger |
|------|--------|-------------|-----------------|
| 1 | Requested | Order placed, awaiting chef | Customer (auto) |
| 2 | Accepted | Chef accepted the order | Chef |
| 3 | Completed | Order delivered | Chef |
| 4 | Cancelled | Order cancelled | Customer, Chef, System |
| 5 | Rejected | Chef declined the order | Chef |
| 6 | Expired | 30-min deadline passed | System (auto) |

### Valid Status Transitions

| From | To | Actor |
|------|-----|-------|
| Requested (1) | Accepted (2) | Chef |
| Requested (1) | Rejected (5) | Chef |
| Requested (1) | Cancelled (4) | Customer |
| Requested (1) | Expired (6) | System |
| Accepted (2) | Completed (3) | Chef |
| Accepted (2) | Cancelled (4) | Chef or Customer |

---

## Order Creation

When a customer places an order:

### 1. Validation
- Verify chef exists and is active
- Check menu item is available (`is_live = 1`)
- Validate delivery address is in service area
- Check timeslot availability

### 2. Payment Authorization
- Create Stripe PaymentIntent (hold funds)
- Store `payment_token` on order

### 3. Order Record
```php
$order = Orders::create([
    'chef_user_id' => $chefId,
    'menu_id' => $menuId,
    'customer_user_id' => $customerId,
    'amount' => $quantity,
    'total_price' => $calculatedTotal,
    'addons' => json_encode($customizations),
    'address' => $deliveryAddress,
    'order_date_new' => '2026-01-20',      // YYYY-MM-DD
    'order_time' => '14:30',                // HH:MM
    'order_timezone' => 'America/Chicago',
    'notes' => $specialInstructions,
    'status' => 1,                          // Requested
    'acceptance_deadline' => time() + 1800, // 30 min from now
]);
```

### 4. Notifications
- Push notification sent to chef
- SMS sent to chef (if enabled)

### 5. Discount Application (if code provided)
```php
if ($discountCode) {
    $discount = DiscountCodes::where('code', $discountCode)->first();
    $calculation = $discount->calculateDiscount($subtotal);

    $order->update([
        'discount_code_id' => $discount->id,
        'discount_code' => $discountCode,
        'discount_amount' => $calculation['discount_amount'],
        'subtotal_before_discount' => $subtotal,
        'total_price' => $calculation['final_amount'],
    ]);

    // Record usage
    DiscountCodeUsage::create([
        'discount_code_id' => $discount->id,
        'customer_user_id' => $customerId,
        'order_id' => $order->id,
    ]);

    $discount->incrementUsage();
}
```

---

## 30-Minute Acceptance Deadline

Chefs have 30 minutes to accept or reject an order. This protects customers from indefinite waits.

### How It Works

1. **Order Placed:** `acceptance_deadline` set to `time() + 1800` (30 min)
2. **Background Job:** `ProcessExpiredOrders` runs every 5 minutes
3. **Check:** Finds orders where `status = 1` AND `acceptance_deadline < now()`
4. **Process:** Auto-cancels and refunds expired orders

### Background Command

```bash
php artisan orders:process-expired
```

**Scheduled in:** `app/Console/Kernel.php`
```php
$schedule->command('orders:process-expired')->everyFiveMinutes();
```

### Expiration Flow

```
1. Find expired orders:
   - status = 1 (Requested)
   - acceptance_deadline < current timestamp
   - Has payment_token

2. For each expired order:
   - Issue full Stripe refund
   - Update order status to 4 (Cancelled)
   - Set cancellation metadata
   - Notify customer via push/SMS

3. Update order record:
   - cancelled_by_role = 'system'
   - cancellation_reason = 'Chef did not accept order within 30 minutes'
   - cancellation_type = 'system_timeout'
   - refund_amount = total_price
   - refund_percentage = 100
   - refund_stripe_id = <Stripe refund ID>
```

### Order Model Methods

```php
// Check if order has exceeded deadline
$order->isExpired();  // Returns bool

// Get time remaining
$order->getTimeRemaining();  // Returns seconds or null

// Get deadline info for API
$order->getDeadlineInfo();
// Returns: {
//   deadline_timestamp: 1705432800,
//   seconds_remaining: 450,
//   minutes_remaining: 7,
//   is_expired: false
// }
```

---

## Cancellation System

Orders can be cancelled by customers, chefs, or the system. Full attribution is tracked.

### Cancellation Fields

| Field | Type | Description |
|-------|------|-------------|
| cancelled_by_user_id | int | User who cancelled (null for system) |
| cancelled_by_role | string | 'customer', 'chef', or 'system' |
| cancellation_reason | string | Reason provided or system message |
| cancellation_type | string | 'manual', 'system_timeout' |
| cancelled_at | timestamp | When cancellation occurred |

### Customer Cancellation

Customers can cancel orders in `Requested` status only (before chef accepts).

```php
// In MapiController
$order->update([
    'status' => 4,
    'cancelled_by_user_id' => $customerId,
    'cancelled_by_role' => 'customer',
    'cancellation_reason' => $request->reason ?? 'Cancelled by customer',
    'cancellation_type' => 'manual',
    'cancelled_at' => now(),
]);
```

**Refund:** Full refund issued automatically.

### Chef Cancellation

Chefs can reject before accepting, or cancel after accepting (with consequences).

**Before Accepting (Rejection):**
```php
$order->update([
    'status' => 5, // Rejected
    'cancelled_by_user_id' => $chefId,
    'cancelled_by_role' => 'chef',
    'cancellation_reason' => $reason,
]);
```

**After Accepting:**
```php
$order->update([
    'status' => 4, // Cancelled
    'cancelled_by_user_id' => $chefId,
    'cancelled_by_role' => 'chef',
    'cancellation_reason' => $reason,
    'cancellation_type' => 'manual',
    'cancelled_at' => now(),
]);
```

**Refund:** Full refund issued to customer.

### System Cancellation

Triggered by `ProcessExpiredOrders` command when deadline passes.

```php
$order->update([
    'status' => 4,
    'cancelled_by_role' => 'system',
    'cancellation_reason' => 'Chef did not accept order within 30 minutes',
    'cancellation_type' => 'system_timeout',
    'cancelled_at' => now(),
]);
```

### Cancellation Summary

The model provides a helper method:

```php
$summary = $order->getCancellationSummary();
// Returns: {
//   who: "John Smith",
//   role: "customer",
//   when: "2026-01-16 14:30:00",
//   reason: "Changed my mind",
//   type: "manual"
// }
```

---

## Refund Processing

Refunds are processed through Stripe when orders are cancelled or rejected.

### Refund Fields

| Field | Type | Description |
|-------|------|-------------|
| refund_amount | decimal | Amount refunded |
| refund_percentage | int | Percentage refunded (usually 100) |
| refund_processed_at | timestamp | When refund was issued |
| refund_stripe_id | string | Stripe refund ID |

### Refund Flow

```php
// 1. Initialize Stripe
$stripe = new \Stripe\StripeClient($stripe_key);

// 2. Create refund
$refund = $stripe->refunds->create([
    'payment_intent' => $order->payment_token,
    'amount' => $order->total_price * 100, // Cents
]);

// 3. Update order
$order->update([
    'refund_amount' => $order->total_price,
    'refund_percentage' => 100,
    'refund_processed_at' => now(),
    'refund_stripe_id' => $refund->id,
]);
```

### Refund Scenarios

| Scenario | Refund % | Who Pays |
|----------|----------|----------|
| Customer cancels (before accept) | 100% | Platform |
| Chef rejects | 100% | Platform |
| Chef cancels (after accept) | 100% | Chef may be penalized |
| System timeout (30 min) | 100% | Platform |

---

## Notifications

Orders trigger notifications at key status changes.

### Notification Events

| Event | Recipients | Channels |
|-------|------------|----------|
| Order Placed | Chef | Push, SMS |
| Order Accepted | Customer | Push |
| Order Rejected | Customer | Push |
| Order Completed | Customer | Push |
| Order Expired | Customer | Push |
| Order Cancelled | Both parties | Push |

### Implementation

Notifications are in `backend/app/Notifications/`:
- `NewOrderNotification`
- `OrderAcceptedNotification`
- `OrderRejectedNotification`
- `OrderCompletedNotification`

Example notification trigger:
```php
$customer->notify(new OrderAcceptedNotification($order));
```

---

## Database Schema

### tbl_orders

```sql
CREATE TABLE tbl_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Relationships
    chef_user_id INT NOT NULL,
    menu_id INT NOT NULL,
    customer_user_id INT NOT NULL,

    -- Order details
    amount INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    addons JSON,
    address TEXT,
    notes TEXT,

    -- DateTime (timezone-safe)
    order_date_new DATE,
    order_time TIME,
    order_timezone VARCHAR(50) DEFAULT 'America/Chicago',
    order_timestamp INT,

    -- Legacy date field (deprecated)
    order_date DATETIME,

    -- Status
    status TINYINT DEFAULT 1,
    acceptance_deadline VARCHAR(20),
    reminder_sent_at TIMESTAMP NULL,

    -- Payment
    payment_token VARCHAR(255),

    -- Discount tracking
    discount_code_id INT NULL,
    discount_code VARCHAR(50) NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    subtotal_before_discount DECIMAL(10,2) NULL,

    -- Cancellation tracking
    cancelled_by_user_id INT NULL,
    cancelled_by_role ENUM('customer','chef','system') NULL,
    cancellation_reason TEXT NULL,
    cancellation_type ENUM('manual','system_timeout') NULL,
    cancelled_at TIMESTAMP NULL,

    -- Refund tracking
    refund_amount DECIMAL(10,2) NULL,
    refund_percentage INT NULL,
    refund_processed_at TIMESTAMP NULL,
    refund_stripe_id VARCHAR(255) NULL,

    -- Auto-close
    is_auto_closed TINYINT DEFAULT 0,
    closed_at TIMESTAMP NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_status (status),
    INDEX idx_chef (chef_user_id),
    INDEX idx_customer (customer_user_id),
    INDEX idx_deadline (acceptance_deadline)
);
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/create_order` | POST | Place new order |
| `/get_order/{id}` | GET | Get order details |
| `/get_order_data/{id}` | GET | Get full order with relations |
| `/update_order_status/{id}` | POST | Change order status |
| `/get_orders_by_chef` | GET | Chef's orders |
| `/get_orders_by_customer` | GET | Customer's orders |
| `/cancel_order_payment` | POST | Cancel and refund |
| `/reject_order_payment` | POST | Chef reject order |
| `/complete_order_payment` | POST | Mark payment complete |
| `/tip_order_payment` | POST | Add tip after delivery |

---

## Best Practices

1. **Always check status before transitions** - Validate current status before changing
2. **Use transactions** - Wrap payment + order updates in DB transactions
3. **Log cancellations** - Full audit trail for disputes
4. **Handle Stripe errors** - Gracefully handle payment failures
5. **Timezone awareness** - Always store and compare times with timezone context
