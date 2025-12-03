# TMA-001: Twilio SMS Notifications - Planning Complete

## Status: ✅ Planning Phase Complete - Ready for Implementation Approval

---

## Quick Summary

Created a comprehensive implementation plan to add SMS notifications throughout the order lifecycle for both chefs and customers using the existing Twilio infrastructure.

**Estimated Time**: 4-5 days
**Estimated Cost**: $5-10/month (based on 100 orders/month)
**Complexity**: Medium
**Priority**: High

---

## What's Been Created

### 1. Main Implementation Plan
**Document**: [docs/TMA-001-TWILIO-SMS-NOTIFICATIONS-PLAN.md](docs/TMA-001-TWILIO-SMS-NOTIFICATIONS-PLAN.md)

This 800+ line comprehensive plan includes:
- ✅ Complete current state analysis of existing Twilio infrastructure
- ✅ Detailed breakdown of all 6 notification types + recipients
- ✅ Full architecture design (TwilioService → OrderSmsService → Controllers)
- ✅ Message templates for all scenarios (with character counts)
- ✅ Database migration plans for reminder tracking
- ✅ Scheduled task implementation for 24-hour reminders
- ✅ Code location references with line numbers
- ✅ Error handling strategies
- ✅ Testing procedures
- ✅ Cost analysis and projections
- ✅ Risk assessment
- ✅ Rollout strategy (7 phases)
- ✅ Success metrics

### 2. Quick Reference Guide
**Document**: [docs/SMS-NOTIFICATIONS-QUICK-REFERENCE.md](docs/SMS-NOTIFICATIONS-QUICK-REFERENCE.md)

Developer-friendly quick reference with:
- ✅ Notification type table (trigger, recipient, status change)
- ✅ All code file locations
- ✅ Complete message templates with examples
- ✅ API method signatures
- ✅ Testing commands
- ✅ Database schema changes
- ✅ Troubleshooting guide
- ✅ Cost calculator
- ✅ Monitoring commands

---

## Notification Types Planned

| # | Event | Recipient | Message Preview |
|---|-------|-----------|-----------------|
| 1 | **Customer Request** | Chef | "New order request! ORDER#123 from John Smith for Dec 4, 2PM..." |
| 2 | **Chef Accept** | Customer | "Great news! Chef Sarah accepted your order ORDER#123..." |
| 3 | **Chef Reject** | Customer | "Sorry, Chef Sarah is unable to fulfill your order. You will receive a full refund..." |
| 4 | **Chef On My Way** | Customer | "Chef Sarah is on the way with your order ORDER#123!" |
| 5 | **Order Complete** | Customer | "Your order ORDER#123 is complete! Hope you enjoyed it..." |
| 6 | **24hr Reminder** | Chef | "Reminder: You have order ORDER#123 from John Smith scheduled for tomorrow..." |
| 7 | **24hr Reminder** | Customer | "Reminder: Your order ORDER#123 from Chef Sarah is scheduled for tomorrow..." |

All messages are under 160 characters for single SMS delivery.

---

## Architecture Overview

### Modular Design (3 Layers)

```
Controller Layer (MapiController)
    ↓ calls
Service Layer (OrderSmsService) - Business logic & templates
    ↓ calls
Infrastructure Layer (TwilioService) - SMS delivery
```

**Why This Design?**
- ✅ Separation of concerns
- ✅ Easy to test (mock dependencies)
- ✅ Reusable for future SMS features
- ✅ Maintainable (all templates in one place)
- ✅ Follows Laravel best practices

---

## Files to Create

### New Service
```
backend/app/Services/OrderSmsService.php
```
**Purpose**: Order-specific SMS logic, message templates, data gathering

**Methods**:
- `sendNewOrderNotification()` - SMS to chef on new order
- `sendOrderAcceptedNotification()` - SMS to customer on acceptance
- `sendOrderRejectedNotification()` - SMS to customer on rejection
- `sendChefOnTheWayNotification()` - SMS to customer when chef leaves
- `sendOrderCompleteNotification()` - SMS to customer on completion
- `sendChefReminderNotification()` - 24hr reminder to chef
- `sendCustomerReminderNotification()` - 24hr reminder to customer

### New Command
```
backend/app/Console/Commands/SendOrderReminders.php
```
**Purpose**: Scheduled task to send 24-hour reminders

**Schedule**: Every 30 minutes
**Logic**:
- Query orders 23-25 hours away
- Send SMS to chef and customer
- Mark as reminded to prevent duplicates

### New Migration
```
backend/database/migrations/2025_12_03_000001_add_reminder_tracking_to_orders.php
```
**Purpose**: Add `reminder_sent_at` column to `tbl_orders`

### New Documentation
```
docs/SMS-NOTIFICATIONS-USER-GUIDE.md (future)
```
**Purpose**: User-facing guide explaining when SMS are sent

---

## Files to Modify

### Enhance Existing Service
```
backend/app/Services/TwilioService.php
```
**Changes**:
- Add `sendSMS()` - generic SMS sending method
- Add `sendOrderNotification()` - wrapper with user lookup
- Add `buildMessage()` - template placeholder replacement
- Add `formatPhoneNumber()` - E.164 validation
- Add `truncateMessage()` - SMS length handling
- Refactor existing `sendVerificationCode()` to use new methods

### Update Controller
```
backend/app/Http/Controllers/MapiController.php
```
**Changes**:
- Inject `OrderSmsService` in constructor
- Add SMS call in `addOrder()` method (line ~1757)
- Add SMS calls in `updateOrderStatus()` for all status changes (lines 2805-2986)
  - Status 2 (accepted) → SMS to customer
  - Status 3 (complete) → SMS to customer
  - Status 5 (rejected) → SMS to customer
  - Status 7 (on the way) → SMS to customer
- Wrap all SMS calls in try-catch (don't block on SMS failure)

### Update Console Kernel
```
backend/app/Console/Kernel.php
```
**Changes**:
- Register `orders:send-reminders` command to run every 30 minutes

### Update Orders Model
```
backend/app/Models/Orders.php
```
**Changes**:
- Add `reminder_sent_at` to `$fillable` array

---

## Implementation Phases

### Phase 1: Enhance TwilioService (1 day)
- Create generic SMS sending infrastructure
- Add phone validation and formatting
- Implement message templating system
- Add comprehensive logging
- Write unit tests

### Phase 2: Create OrderSmsService (1 day)
- Build order-specific SMS service
- Implement all 7 notification methods
- Define message templates
- Add order data gathering logic
- Write unit tests

### Phase 3: Update MapiController (0.5 days)
- Inject OrderSmsService
- Add SMS calls to order creation
- Add SMS calls to status updates
- Add error handling
- Test all order flows

### Phase 4: Implement Reminders (1 day)
- Create database migration
- Build SendOrderReminders command
- Register in scheduler
- Test reminder timing logic
- Verify no duplicate sends

### Phase 5: Documentation (0.5 days)
- Write SMS user guide
- Update Twilio setup guide
- Document troubleshooting
- Add code comments

### Phase 6: Testing (0.5 days)
- Test all notification types
- Test reminder scheduling
- Test error scenarios
- Test with invalid phone numbers
- Verify SMS costs

### Phase 7: Deployment (0.5 days)
- Deploy to staging
- Test on staging with real SMS
- Monitor logs
- Deploy to production
- Monitor first 24 hours

**Total**: 4-5 days

---

## Current Infrastructure (Already Exists)

✅ **TwilioService**: Basic SMS sending already implemented for phone verification
✅ **Twilio Credentials**: Already configured in `.env`
✅ **Order Status Management**: `updateOrderStatus()` method with push notifications
✅ **User Phone Numbers**: `tbl_users.phone` field exists
✅ **Order Model**: Full order lifecycle tracking
✅ **Scheduled Tasks**: Existing `orders:process-expired` command as example

**This means**: We're building on solid foundations, not starting from scratch.

---

## Key Technical Decisions

### 1. SMS as Supplementary (Not Primary)
- Firebase push notifications remain primary
- SMS runs in parallel as backup
- SMS failure never blocks order processing
- Both sent simultaneously for redundancy

### 2. Hardcoded Templates (v1)
- Message templates in OrderSmsService code
- Can update via code changes
- Future: Move to `tbl_notification_templates.text` column

### 3. Server Timezone for Reminders
- Uses server time (UTC on Railway)
- 23-25 hour window provides 2-hour buffer
- Future: Consider user/order timezone

### 4. No Rate Limiting (v1)
- Twilio has generous limits (hundreds/second)
- Current scale won't hit limits
- Future: Add if order volume grows significantly

### 5. Error Handling Strategy
- Log all failures with context
- Never throw exceptions to controller
- Return structured responses
- Continue order processing regardless

---

## Cost Analysis

### Per-Message Cost
- Twilio US SMS: $0.0079 per message
- Single SMS = 160 characters (all our messages fit)

### Per-Order Cost
**Best Case** (order accepted & completed):
1. New order → Chef SMS
2. Acceptance → Customer SMS
3. On the way → Customer SMS
4. Complete → Customer SMS
5. Chef reminder → Chef SMS
6. Customer reminder → Customer SMS

= 6 messages × $0.0079 = **$0.047 per order**

**Worst Case** (order rejected):
1. New order → Chef SMS
2. Rejection → Customer SMS
3. Chef reminder → Chef SMS (if not rejected immediately)
4. Customer reminder → Customer SMS (if not rejected immediately)

= 4 messages × $0.0079 = **$0.032 per order**

### Monthly Projections
- 100 orders/month: $4-5/month
- 500 orders/month: $20-25/month
- 1000 orders/month: $40-50/month

**Plus**: $1.15/month for phone number rental

---

## Success Metrics

### Technical
- SMS delivery rate: >95%
- SMS sending latency: <2 seconds
- Error rate: <2%
- Reminder accuracy: 100%

### Business
- Reduction in "where is my order?" support tickets
- Improved chef acceptance rate (better visibility)
- Higher customer satisfaction scores
- Reduced order confusion/no-shows

---

## Risk Mitigation

### Medium Risks Identified

**Risk 1: Costs Higher Than Expected**
- Mitigation: Monitor Twilio usage daily first week
- Mitigation: Set billing alerts at $10, $25, $50
- Fallback: Implement SMS opt-in only

**Risk 2: SMS Delivery Failures**
- Mitigation: Comprehensive logging and monitoring
- Mitigation: Don't block order processing
- Fallback: Firebase push remains primary channel

### Low Risks

**Risk 3: Message Content Issues**
- Mitigation: Test with real users before production
- Mitigation: Easy to update templates in code

**Risk 4: Scheduler Not Running**
- Mitigation: Test thoroughly on staging
- Mitigation: Monitor logs daily
- Fallback: Manual execution via artisan command

---

## Testing Strategy

### Unit Tests
- Mock Twilio client
- Test message templating
- Test phone number formatting
- Test data gathering logic

### Integration Tests
- Use Twilio test credentials
- Test full notification flows
- Test error scenarios

### Manual Testing (Staging)
- Create test orders
- Progress through all statuses
- Verify SMS received at each step
- Test reminder timing (create order 23.5 hours out)
- Test with invalid phone numbers

### Production Monitoring
- Watch logs first 24 hours
- Check Twilio console for delivery rates
- Monitor costs
- Gather user feedback

---

## Documentation Created

### For Developers
1. **TMA-001-TWILIO-SMS-NOTIFICATIONS-PLAN.md** (800+ lines)
   - Complete implementation guide
   - Architecture decisions
   - Code examples
   - Testing procedures

2. **SMS-NOTIFICATIONS-QUICK-REFERENCE.md** (500+ lines)
   - Quick lookup for developers
   - All methods and locations
   - Testing commands
   - Troubleshooting

### For Users (Future)
3. **SMS-NOTIFICATIONS-USER-GUIDE.md** (to be created)
   - What SMS they'll receive
   - When they'll receive them
   - How to troubleshoot
   - How to opt-out (future feature)

### Existing Docs to Update
4. **TWILIO-SETUP.md**
   - Add section on SMS notifications
   - Link to new guides

---

## Next Steps (When Approved)

1. **Confirm Approach**
   - Review this plan
   - Approve architecture
   - Confirm message templates

2. **Begin Implementation**
   - Start with Phase 1 (TwilioService enhancement)
   - Daily progress updates
   - Test each phase before moving to next

3. **Staging Testing**
   - Deploy to Railway staging
   - Test with real phone numbers
   - Verify all notification types

4. **Production Rollout**
   - Deploy during low-traffic window
   - Monitor closely
   - Iterate based on feedback

---

## Questions to Resolve Before Implementation

1. **Should SMS be opt-in or opt-out?**
   - Current plan: All users receive SMS (match push notification behavior)
   - Alternative: Add settings to disable SMS (more complex, for v2)

2. **Should we send SMS on customer cancellation?**
   - Not in current spec
   - Recommendation: Yes, send to chef if order was accepted
   - Would add 1 more SMS type

3. **Timezone for reminders?**
   - Current plan: Server timezone (UTC)
   - Better: Use order timezone or user timezone (requires timezone storage)

4. **Add SMS to ProcessExpiredOrders command?**
   - Current: Only push notification on auto-cancellation
   - Recommendation: Yes, add SMS to customer about auto-cancellation

---

## Files Reference Map

### Planning Documents
```
docs/TMA-001-TWILIO-SMS-NOTIFICATIONS-PLAN.md          [800+ lines]
docs/SMS-NOTIFICATIONS-QUICK-REFERENCE.md              [500+ lines]
TMA-001-IMPLEMENTATION-SUMMARY.md                      [this file]
```

### Existing Infrastructure
```
backend/app/Services/TwilioService.php                 [Will enhance]
backend/app/Http/Controllers/MapiController.php        [Will update]
backend/app/Console/Kernel.php                         [Will update]
backend/app/Models/Orders.php                          [Will update]
backend/app/Listener.php                               [Reference only]
backend/.env                                           [Twilio configured]
```

### Files to Create
```
backend/app/Services/OrderSmsService.php               [NEW]
backend/app/Console/Commands/SendOrderReminders.php    [NEW]
backend/database/migrations/2025_12_03_000001_add_reminder_tracking_to_orders.php  [NEW]
docs/SMS-NOTIFICATIONS-USER-GUIDE.md                   [NEW - future]
```

---

## Conclusion

Planning is complete and comprehensive. The implementation plan provides:

✅ Clear architecture with 3-layer separation of concerns
✅ All 7 notification types fully specified
✅ Message templates ready (all under 160 chars)
✅ Database changes documented
✅ Scheduled tasks designed
✅ Error handling strategy defined
✅ Cost projections calculated
✅ Testing procedures outlined
✅ Deployment strategy planned
✅ Risk mitigation identified

The plan builds on existing Twilio infrastructure, follows Laravel best practices, and includes proper error handling to ensure SMS failures never block order processing.

**Ready to proceed with implementation upon approval.**

---

## Contact & Support

**Implementation Plan**: [docs/TMA-001-TWILIO-SMS-NOTIFICATIONS-PLAN.md](docs/TMA-001-TWILIO-SMS-NOTIFICATIONS-PLAN.md)
**Quick Reference**: [docs/SMS-NOTIFICATIONS-QUICK-REFERENCE.md](docs/SMS-NOTIFICATIONS-QUICK-REFERENCE.md)
**Twilio Setup**: [docs/TWILIO-SETUP.md](docs/TWILIO-SETUP.md)
**Sprint Tasks**: [sprint-tasks.md](sprint-tasks.md)

---

**Document Created**: December 3, 2025
**Status**: Planning Complete - Awaiting Implementation Approval
**Estimated Timeline**: 4-5 days
**Estimated Cost**: $5-10/month (100 orders/month)
