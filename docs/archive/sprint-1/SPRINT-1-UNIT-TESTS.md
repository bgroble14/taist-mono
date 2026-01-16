# Sprint 1 Unit Tests Documentation

**Created**: January 16, 2026
**Total Tests**: 212 tests, 1630 assertions
**Status**: ✅ All Passing

---

## Overview

This document describes the unit tests created for completed Sprint 1 tasks. All tests are located in `/backend/tests/Unit/` and can be run using PHPUnit.

### Running Tests

```bash
# Run all unit tests
cd backend
php vendor/bin/phpunit tests/Unit --testdox

# Run specific test file
php vendor/bin/phpunit tests/Unit/Services/TwilioServiceTest.php --testdox

# Run with coverage (requires Xdebug)
php vendor/bin/phpunit tests/Unit --coverage-html coverage
```

---

## Test Files by Sprint Task

### TMA-001: Twilio Text Notifications

**Test Files:**
- `tests/Unit/Services/TwilioServiceTest.php` (25 tests)
- `tests/Unit/Services/OrderSmsServiceTest.php` (22 tests)

**TwilioServiceTest Coverage:**
| Category | Tests | Description |
|----------|-------|-------------|
| Phone Formatting | 11 | E.164 format conversion, US prefix handling, cleaning special characters |
| Message Truncation | 6 | SMS 160-char limit, ellipsis handling, custom lengths |
| Template Building | 4 | Placeholder replacement, multiple placeholders |
| Configuration | 1 | Service enabled check |
| Error Handling | 3 | Invalid phone handling, metadata preservation |

**OrderSmsServiceTest Coverage:**
| Category | Tests | Description |
|----------|-------|-------------|
| Order ID Formatting | 4 | 7-digit padding (e.g., ORDER#0000123) |
| Message Patterns | 7 | New order, accepted, rejected, on the way, complete, reminders |
| Notification Types | 1 | Type string validation |
| Price Formatting | 3 | Currency formatting with decimals |
| Error Handling | 4 | Missing order, chef, customer handling |
| Message Length | 3 | SMS length validation |

---

### TMA-007: Coupon Code Functionality

**Test File:** `tests/Unit/Models/DiscountCodesTest.php` (30 tests)

**Coverage:**
| Category | Tests | Description |
|----------|-------|-------------|
| Validation (isValid) | 8 | Active/inactive, date range, max uses |
| Fixed Discounts | 3 | Dollar amount calculation, capping at order total |
| Percentage Discounts | 5 | Percentage calculation, max cap, rounding |
| Minimum Order | 4 | Minimum order amount enforcement |
| Formatting | 4 | Display strings ("$10.00 off", "20% off") |
| Edge Cases | 6 | Zero amount, large orders, attribute casting |

**Key Test Cases:**
- `test_percentage_discount_respects_max_cap()` - Ensures 50% on $100 is capped at $25 max
- `test_order_below_minimum_is_rejected()` - Enforces minimum order requirements
- `test_fixed_discount_caps_at_order_amount()` - Prevents negative totals

---

### TMA-016: Order Acceptance Time Window & Stripe Refunds

**Test Files:**
- `tests/Unit/Models/OrdersTest.php` (35 tests)
- `tests/Unit/OrderStatusTest.php` (32 tests)

**OrdersTest Coverage:**
| Category | Tests | Description |
|----------|-------|-------------|
| Expiration (isExpired) | 8 | 30-minute deadline, status-based checks |
| Time Remaining | 4 | Seconds calculation, never negative |
| Deadline Info | 5 | API response structure, minutes calculation |
| Discount Summary | 4 | Discount tracking on orders |
| Cancellation Summary | 3 | Cancellation metadata |
| Scheduled DateTime | 4 | Timezone handling, attribute accessor |
| Edge Cases | 7 | Fillable attributes, string deadline conversion |

**OrderStatusTest Coverage:**
| Category | Tests | Description |
|----------|-------|-------------|
| Status Constants | 2 | 7 status values (Requested → On My Way) |
| Valid Transitions | 6 | Allowed status changes |
| Terminal Statuses | 4 | Completed, Cancelled, Rejected, Expired |
| Cancellation Types | 5 | 8 cancellation type values |
| Cancelled By Role | 2 | customer, chef, admin, system |
| Refund Percentages | 5 | 80% within 24h, 100% beyond |
| 30-Minute Window | 4 | Deadline calculation and expiration |
| Notifications | 2 | Status-to-notification mapping |

---

### TMA-017: AI-Generated Reviews

**Test File:** `tests/Unit/Services/OpenAIServiceTest.php` (23 tests)

**Coverage:**
| Category | Tests | Description |
|----------|-------|-------------|
| Model Constants | 6 | GPT-5, GPT-4, GPT-3.5 model constants |
| Rating Variance | 5 | ±0.5 variance, 1-5 bounds, 0.5 rounding |
| Date Variance | 3 | 1-14 day range, always past dates |
| Focus Areas | 2 | food_quality, presentation_service, overall_experience |
| Length Guides | 1 | Short (40-70 chars), Medium (70-100 chars) |
| Rating Descriptions | 1 | highly positive, positive, neutral-positive, mixed, critical |
| Review Variants | 3 | 3 variants per authentic review |
| Metadata | 3 | JSON structure, encoding, source values |

**Key Test Cases:**
- `test_rating_variance_stays_within_bounds()` - 100 iterations verifying 1-5 range
- `test_rating_rounds_to_half()` - Rounds to 3.0, 3.5, 4.0, etc.
- `test_date_variance_minimum_one_day()` - At least 86400 seconds offset

---

### TMA-011: Calendar Overhaul & TMA-018: Categories/Time Filters

**Test File:** `tests/Unit/Models/AvailabilityOverrideTest.php` (32 tests)

**Coverage:**
| Category | Tests | Description |
|----------|-------|-------------|
| Cancellation (isCancelled) | 4 | Status-based and null-times cancellation |
| Availability (isAvailableAt) | 6 | Time range checking, boundary conditions |
| Time Slots | 8 | Breakfast (5-11), Lunch (11-16), Dinner (16-22), Late Night (22-5) |
| Category Filtering | 4 | FIND_IN_SET logic simulation |
| Status Messages | 4 | Confirmed, Modified, Cancelled, Unknown |
| Source Tracking | 1 | reminder_confirmation, manual_toggle |
| Fillable Attributes | 1 | Model attribute validation |
| Edge Cases | 4 | Midnight handling, boundary times |

**Time Slot Definitions:**
```
Slot 1 (Breakfast): 05:00 - 11:00
Slot 2 (Lunch):     11:00 - 16:00
Slot 3 (Dinner):    16:00 - 22:00
Slot 4 (Late Night): 22:00 - 05:00
```

---

### TMA-020: Order Status Updates

**Covered by:** `tests/Unit/OrderStatusTest.php` and `tests/Unit/Models/OrdersTest.php`

**Key Status Transitions:**
```
1 (Requested) → 2 (Accepted) → 3 (Completed)
                            → 7 (On My Way) → 3 (Completed)
1 (Requested) → 4 (Cancelled)
1 (Requested) → 5 (Rejected)
1 (Requested) → 6 (Expired) [system auto]
```

---

## Existing Tests (Pre-Sprint)

The following tests existed before this sprint:

- `tests/Unit/ExampleTest.php` - Basic example test
- `tests/Unit/Notifications/NewOrderNotificationTest.php` - Push notification tests
- `tests/Unit/Notifications/OrderAcceptedNotificationTest.php` - Push notification tests
- `tests/Unit/Notifications/ChefApprovedNotificationTest.php` - Push notification tests
- `tests/Unit/Notifications/FirebaseChannelTest.php` - Firebase channel tests

---

## Test Organization

```
tests/
├── Unit/
│   ├── ExampleTest.php
│   ├── OrderStatusTest.php                    # TMA-016, TMA-020
│   ├── Models/
│   │   ├── AvailabilityOverrideTest.php      # TMA-011, TMA-018
│   │   ├── DiscountCodesTest.php             # TMA-007
│   │   └── OrdersTest.php                    # TMA-016, TMA-020
│   ├── Notifications/
│   │   ├── ChefApprovedNotificationTest.php
│   │   ├── FirebaseChannelTest.php
│   │   ├── NewOrderNotificationTest.php
│   │   └── OrderAcceptedNotificationTest.php
│   └── Services/
│       ├── OpenAIServiceTest.php             # TMA-017, TMA-009
│       ├── OrderSmsServiceTest.php           # TMA-001
│       └── TwilioServiceTest.php             # TMA-001
└── Feature/
    └── ExampleTest.php
```

---

## Summary by Sprint Task

| Task ID | Task Title | Test File(s) | Tests |
|---------|-----------|--------------|-------|
| TMA-001 | Twilio text notifications | TwilioServiceTest, OrderSmsServiceTest | 47 |
| TMA-007 | Coupon code functionality | DiscountCodesTest | 30 |
| TMA-009 | AI for menu page | OpenAIServiceTest (shared) | - |
| TMA-011 | Calendar overhaul | AvailabilityOverrideTest | 32 |
| TMA-016 | Time window for order acceptance | OrdersTest, OrderStatusTest | 67 |
| TMA-017 | AI-generated reviews | OpenAIServiceTest | 23 |
| TMA-018 | Categories/time filters | AvailabilityOverrideTest (shared) | - |
| TMA-020 | Order status updates | OrdersTest, OrderStatusTest (shared) | - |

**Note:** Some tests cover multiple tasks (shared coverage).

---

## Tasks Without Unit Tests

The following completed tasks did not require unit tests:

| Task ID | Task Title | Reason |
|---------|-----------|--------|
| TMA-000 | Hide UI options on Customer side | UI-only changes |
| TMA-002 | Phone + email signup | Validation covered by Laravel |
| TMA-003 | Cart icon at top | UI-only changes |
| TMA-004 | Tutorial overhaul | UI/UX changes |
| TMA-005 | Overall styling overhaul | CSS/styling changes |
| TMA-008 | Chef signup flow | Form flow, no testable logic |
| TMA-012 | Camera roll for profile pic | Native functionality |
| TMA-013 | Show current location | Uses native geolocation |
| TMA-014 | Reload on new zip code | Admin event trigger |
| TMA-015 | Cancel order dialog | UI confirmation |
| TMA-019 | Order receipt customizations | Display formatting |
| TMA-021 | Date selection navigation | UI interaction |
| TMA-022 | Admin panel profile view | Display only |
| TMA-025 | Text label change | Simple string change |

---

## Best Practices Used

1. **Isolation**: Each test is independent and doesn't rely on database state
2. **Reflection**: Private methods tested via `ReflectionClass` where needed
3. **Mocking**: External services (Twilio) mocked with Mockery
4. **Descriptive Names**: Test methods describe expected behavior
5. **Edge Cases**: Boundary conditions and error scenarios covered
6. **PHPUnit 8.5**: Compatible with Laravel 8.x test framework

---

## Next Steps

1. Consider adding integration tests for API endpoints
2. Add frontend tests (Jest/React Testing Library) when framework is set up
3. Set up CI/CD to run tests on every push
4. Add code coverage reporting to track test coverage percentage
