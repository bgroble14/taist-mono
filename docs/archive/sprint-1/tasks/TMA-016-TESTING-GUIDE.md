# TMA-016: Testing Guide for 1-Hour Order Acceptance Deadline

## Quick Testing Overview

This feature implements a 1-hour deadline for chefs to accept orders. If the chef doesn't accept within 1 hour, the customer receives an automatic full refund.

## Prerequisites

Before testing, ensure:
1. ✅ Database migration has been applied
2. ✅ Laravel scheduler is running (see setup below)
3. ✅ Backend API is running
4. ✅ Frontend app is running
5. ✅ Stripe is configured in test mode
6. ✅ Firebase Cloud Messaging is configured

## Server Setup for Testing

### Option 1: Run Scheduler Manually (Quick Test)
```bash
cd /Users/williamgroble/taist-mono/backend

# Run the scheduler manually (simulates cron)
php artisan schedule:run

# Or run the command directly
php artisan orders:process-expired
```

### Option 2: Run Scheduler Continuously (Realistic Test)
```bash
cd /Users/williamgroble/taist-mono/backend

# Run scheduler in watch mode (checks every minute)
php artisan schedule:work
```

## Testing Scenarios

### Scenario 1: Normal Flow - Chef Accepts Before Deadline

**Steps:**
1. Login as customer in the app
2. Create a new order
3. Go to order detail screen
4. **Expected**: See countdown timer showing ~60:00 (1 hour)
5. Login as chef (different device or browser)
6. Go to "REQUESTED" orders tab
7. Click on the order and press "ACCEPT ORDER"
8. Return to customer app
9. **Expected**:
   - Countdown timer disappears
   - Order status changes to "Accepted"

**Result**: ✅ Order accepted, no refund needed

---

### Scenario 2: Timeout - Chef Does Not Accept

**Steps:**
1. Login as customer in the app
2. Create a new order
3. Go to order detail screen
4. **Expected**: See countdown timer showing ~60:00
5. **DO NOT** have chef accept the order
6. Watch the countdown timer tick down
7. After 1 hour + up to 5 minutes (processing delay):
8. **Expected**:
   - Timer shows "Expired"
   - Message shows "Processing automatic refund..."
   - After next refresh, order status = "Cancelled"
   - Customer receives notification
   - Full refund appears in Stripe

**Result**: ✅ Automatic refund processed

**To verify refund:**
- Check Stripe dashboard for refund transaction
- Check Laravel logs: `tail -f backend/storage/logs/laravel.log`
- Look for: "Order #X expired and refunded successfully"

---

### Scenario 3: Quick Test with 1-Minute Deadline (Testing Mode)

To test without waiting 1 hour, temporarily modify the deadline:

**1. Edit MapiController.php**
```bash
# File: backend/app/Http/Controllers/MapiController.php
# Line: 1252

# Change this:
'acceptance_deadline' => (string)($currentTimestamp + 3600),

# To this (1 minute):
'acceptance_deadline' => (string)($currentTimestamp + 60),
```

**2. Create a test order**
```bash
# In one terminal, watch the logs
cd /Users/williamgroble/taist-mono/backend
tail -f storage/logs/laravel.log
```

**3. In app, create order and watch countdown**
- Should show 1:00 (1 minute)
- Timer will tick down to 0:00
- Shows "Expired"

**4. Manually trigger refund processing**
```bash
# In another terminal
cd /Users/williamgroble/taist-mono/backend
php artisan orders:process-expired
```

**5. Check results**
- Logs should show: "Found 1 expired order(s). Processing refunds..."
- Logs should show: "Order #X processed successfully"
- Refresh app - order status should be "Cancelled"

**6. IMPORTANT: Revert the change**
```bash
# Change back to 1 hour
'acceptance_deadline' => (string)($currentTimestamp + 3600),
```

---

### Scenario 4: Multiple Expired Orders

**Steps:**
1. Create 3 orders from different customers
2. Do not have chef accept any
3. Wait for expiration (or use 1-minute deadline for quick test)
4. Run command: `php artisan orders:process-expired`
5. **Expected**:
   - Logs show: "Found 3 expired order(s)"
   - All 3 orders processed
   - All 3 refunds in Stripe
   - All 3 customers notified

**Result**: ✅ Batch processing works correctly

---

## Verification Checklist

After testing, verify these items:

### Database Verification
```bash
php artisan tinker
```

```php
// Check if acceptance_deadline field exists
$order = App\Models\Orders::latest()->first();
echo $order->acceptance_deadline;

// Check expired orders
$expired = App\Models\Orders::where('status', 1)
    ->whereNotNull('acceptance_deadline')
    ->where('acceptance_deadline', '<', (string)time())
    ->get();
echo "Expired orders: " . $expired->count();

// Check refund metadata
$cancelled = App\Models\Orders::where('cancellation_type', 'system_timeout')->first();
print_r([
    'refund_amount' => $cancelled->refund_amount,
    'refund_percentage' => $cancelled->refund_percentage,
    'cancellation_reason' => $cancelled->cancellation_reason,
]);
```

### API Verification
```bash
# Test getOrderData endpoint (replace ORDER_ID and API_KEY)
curl -X POST http://localhost:8000/api/get_order_data/ORDER_ID \
  -H "apiKey: YOUR_API_KEY" \
  | jq '.data.deadline_info'

# Expected response:
{
  "deadline_timestamp": 1733123456,
  "seconds_remaining": 2400,
  "minutes_remaining": 40,
  "is_expired": false
}
```

### Frontend Verification

**Visual checks in customer order detail:**
- [ ] Countdown timer displays when status = Requested
- [ ] Timer shows MM:SS format (e.g., "59:45")
- [ ] Timer updates every second
- [ ] Timer turns red when < 5 minutes remaining
- [ ] Message displays: "You will receive a full refund if not accepted within this time"
- [ ] When expired, shows "Expired" and "Processing automatic refund..."
- [ ] Timer disappears when chef accepts order

### Stripe Verification

**In Stripe Dashboard (Test Mode):**
1. Go to Payments → All payments
2. Find the order's payment intent
3. After refund, should see:
   - Status: "Refunded"
   - Refund amount: Full order total
   - Refund reason: System timeout

### Logs Verification

**Check Laravel logs:**
```bash
cd /Users/williamgroble/taist-mono/backend
grep "ProcessExpiredOrders" storage/logs/laravel.log | tail -20
```

**Expected log entries:**
```
[2025-12-02 12:00:00] local.INFO: Order #123 expired and refunded successfully
[2025-12-02 12:00:00] local.INFO: Notification sent to customer #456 for expired order #123
```

---

## Common Issues & Solutions

### Issue 1: Timer Not Showing
**Symptoms**: Countdown timer doesn't appear on customer order detail screen

**Possible causes:**
- Order status is not 1 (Requested)
- `acceptance_deadline` field is null
- API not returning `deadline_info`

**Solution:**
```bash
# Check order data
php artisan tinker
$order = App\Models\Orders::find(ORDER_ID);
echo "Status: " . $order->status;
echo "Deadline: " . $order->acceptance_deadline;
echo "Deadline info: " . json_encode($order->getDeadlineInfo());
```

---

### Issue 2: Refunds Not Processing
**Symptoms**: Orders expire but refunds don't happen

**Possible causes:**
- Scheduler not running
- Payment token missing
- Stripe API key issues

**Solution:**
```bash
# Test command directly
php artisan orders:process-expired

# Check command is registered
php artisan schedule:list | grep expired

# Check Stripe configuration
php artisan tinker
echo config('services.stripe.secret');
```

---

### Issue 3: Notification Not Sent
**Symptoms**: Customer doesn't receive notification

**Possible causes:**
- Customer has no FCM token
- Firebase configuration issue

**Solution:**
```bash
# Check customer FCM token
php artisan tinker
$customer = App\Listener::find(CUSTOMER_ID);
echo "FCM Token: " . $customer->fcm_token;
```

---

## Performance Testing

### Test with Many Orders
```bash
# Create 100 test orders (use Tinker or Postman)
# Set all deadlines to now - 1 hour
# Run command and measure time

time php artisan orders:process-expired

# Should complete in < 30 seconds for 100 orders
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Revert any testing deadlines (ensure 3600 seconds / 1 hour)
- [ ] Set up cron job for Laravel scheduler
- [ ] Configure log rotation for Laravel logs
- [ ] Set up monitoring/alerting for failed refunds
- [ ] Test with real Stripe account in test mode
- [ ] Verify Firebase notifications work in production
- [ ] Document scheduled task in deployment docs
- [ ] Train support team on refund monitoring

---

## Monitoring in Production

### Daily Checks
```bash
# Count expired orders processed today
grep "expired and refunded successfully" storage/logs/laravel.log | grep "$(date +%Y-%m-%d)" | wc -l

# Check for failures
grep "Failed to process order" storage/logs/laravel.log | grep "$(date +%Y-%m-%d)"
```

### Weekly Report
```bash
# Generate weekly refund report
php artisan tinker
```

```php
$start = now()->subWeek();
$refunds = App\Models\Orders::where('cancellation_type', 'system_timeout')
    ->where('cancelled_at', '>', $start)
    ->get();

echo "Total expired orders: " . $refunds->count();
echo "Total refund amount: $" . $refunds->sum('refund_amount');
```

---

## Support Contact

If you encounter issues:
1. Check Laravel logs first
2. Review this testing guide
3. Refer to TMA-016-IMPLEMENTATION-SUMMARY.md
4. Check Stripe dashboard for payment/refund details
