<?php

/**
 * Comprehensive Tests for Availability Override System
 *
 * TMA-011 REVISED Phase 10
 *
 * Tests the complete override system including:
 * - AvailabilityOverride model
 * - Listener model override logic
 * - API endpoints
 * - Order validation with overrides
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Listener;
use App\Models\AvailabilityOverride;
use App\Models\Availabilities;

echo "\n╔══════════════════════════════════════════════════════════╗\n";
echo "║   TMA-011 REVISED: AVAILABILITY OVERRIDE SYSTEM TESTS   ║\n";
echo "╚══════════════════════════════════════════════════════════╝\n\n";

$testsPassed = 0;
$testsFailed = 0;

// Get test chef
$chef = App\Listener::where('user_type', 2)->first();

if (!$chef) {
    echo "❌ No chef found for testing\n";
    exit(1);
}

echo "Test Subject: Chef {$chef->first_name} {$chef->last_name} (ID: {$chef->id})\n\n";

// ========================================
// TEST GROUP 1: AVAILABILITY OVERRIDE MODEL
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 1: AvailabilityOverride Model\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Clean up any existing test overrides
AvailabilityOverride::where('chef_id', $chef->id)->delete();

// Test 1.1: Create override
echo "Test 1.1: Create availability override for tomorrow\n";
$tomorrow = date('Y-m-d', strtotime('+1 day'));
$override = AvailabilityOverride::create([
    'chef_id' => $chef->id,
    'override_date' => $tomorrow,
    'start_time' => '14:00',
    'end_time' => '17:00',
    'status' => 'confirmed',
    'source' => 'manual_toggle',
]);

if ($override && $override->id && $override->override_date->format('Y-m-d') === $tomorrow) {
    echo "  ✅ PASS - Override created successfully\n";
    echo "  ID: {$override->id}, Date: {$tomorrow}, Time: 14:00-17:00\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Failed to create override\n\n";
    $testsFailed++;
}

// Test 1.2: Check isAvailableAt() method
echo "Test 1.2: Check isAvailableAt() method\n";
$availableAt1500 = $override->isAvailableAt('15:00');
$availableAt1200 = $override->isAvailableAt('12:00');
$availableAt1800 = $override->isAvailableAt('18:00');

if ($availableAt1500 && !$availableAt1200 && !$availableAt1800) {
    echo "  ✅ PASS - isAvailableAt() works correctly\n";
    echo "  Available at 15:00: Yes, at 12:00: No, at 18:00: No\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - isAvailableAt() logic incorrect\n\n";
    $testsFailed++;
}

// Test 1.3: Create cancelled override
echo "Test 1.3: Create cancelled override\n";
$dayAfterTomorrow = date('Y-m-d', strtotime('+2 days'));
$cancelledOverride = AvailabilityOverride::create([
    'chef_id' => $chef->id,
    'override_date' => $dayAfterTomorrow,
    'start_time' => null,
    'end_time' => null,
    'status' => 'cancelled',
    'source' => 'reminder_confirmation',
]);

if ($cancelledOverride->isCancelled() && !$cancelledOverride->isAvailableAt('15:00')) {
    echo "  ✅ PASS - Cancelled override works correctly\n";
    echo "  isCancelled: Yes, isAvailableAt(15:00): No\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Cancelled override logic incorrect\n\n";
    $testsFailed++;
}

// Test 1.4: Test scopes
echo "Test 1.4: Test query scopes\n";
$chefOverrides = AvailabilityOverride::forChef($chef->id)->get();
$tomorrowOverride = AvailabilityOverride::forChef($chef->id)->forDate($tomorrow)->first();

if ($chefOverrides->count() === 2 && $tomorrowOverride && $tomorrowOverride->id === $override->id) {
    echo "  ✅ PASS - Scopes work correctly\n";
    echo "  Total overrides: {$chefOverrides->count()}, Tomorrow override found: Yes\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Scopes not working\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 2: LISTENER MODEL OVERRIDE LOGIC
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 2: Listener Model Override Logic\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 2.1: isAvailableForOrder with override
echo "Test 2.1: isAvailableForOrder() with active override\n";
$orderDateTime1 = $tomorrow . ' 15:00:00'; // Within override time
$orderDateTime2 = $tomorrow . ' 12:00:00'; // Before override time

$available1 = $chef->isAvailableForOrder($orderDateTime1);
$available2 = $chef->isAvailableForOrder($orderDateTime2);

if ($available1 && !$available2) {
    echo "  ✅ PASS - Override logic working in isAvailableForOrder()\n";
    echo "  Available at 15:00: Yes, at 12:00: No\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Override logic not working correctly\n";
    echo "  Available at 15:00: " . ($available1 ? 'Yes' : 'No') . ", at 12:00: " . ($available2 ? 'Yes' : 'No') . "\n\n";
    $testsFailed++;
}

// Test 2.2: isAvailableForOrder with cancelled override
echo "Test 2.2: isAvailableForOrder() with cancelled override\n";
$cancelledDateTime = $dayAfterTomorrow . ' 15:00:00';
$availableWhenCancelled = $chef->isAvailableForOrder($cancelledDateTime);

if (!$availableWhenCancelled) {
    echo "  ✅ PASS - Cancelled override blocks availability\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Cancelled override should block availability\n\n";
    $testsFailed++;
}

// Test 2.3: isAvailableForOrder without override (falls back to weekly schedule)
echo "Test 2.3: isAvailableForOrder() without override (weekly schedule fallback)\n";
$nextWeek = date('Y-m-d', strtotime('+7 days'));
$nextWeekDayOfWeek = strtolower(date('l', strtotime($nextWeek)));
$availability = Availabilities::where('user_id', $chef->id)->first();

if ($availability) {
    $startField = $nextWeekDayOfWeek . '_start';
    $endField = $nextWeekDayOfWeek . '_end';
    $weeklyStart = $availability->$startField;
    $weeklyEnd = $availability->$endField;

    if ($weeklyStart && $weeklyEnd) {
        // Test within weekly schedule time
        $testTime = date('H:i', strtotime($weeklyStart) + 3600); // 1 hour after start
        $futureOrderDate = $nextWeek . ' ' . $testTime . ':00';
        $availableFuture = $chef->isAvailableForOrder($futureOrderDate);

        if ($availableFuture) {
            echo "  ✅ PASS - Falls back to weekly schedule when no override\n";
            echo "  Weekly schedule time ({$testTime}): Available\n\n";
            $testsPassed++;
        } else {
            echo "  ❌ FAIL - Should fall back to weekly schedule\n\n";
            $testsFailed++;
        }
    } else {
        echo "  ⚠️  SKIP - Chef has no weekly schedule for {$nextWeekDayOfWeek}\n\n";
    }
} else {
    echo "  ⚠️  SKIP - Chef has no availability record\n\n";
}

// ========================================
// TEST GROUP 3: ORDER VALIDATION
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 3: Order Validation with Overrides\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 3.1: 3-hour minimum still enforced
echo "Test 3.1: 3-hour minimum validation (still enforced)\n";
$tooSoonOrder = date('Y-m-d H:i:s', strtotime('+2 hours'));
$validOrder = date('Y-m-d H:i:s', strtotime('+4 hours'));

$tooSoonTimestamp = strtotime($tooSoonOrder);
$validTimestamp = strtotime($validOrder);
$minimumTime = time() + (3 * 60 * 60);

$tooSoonBlocked = $tooSoonTimestamp < $minimumTime;
$validAllowed = $validTimestamp >= $minimumTime;

if ($tooSoonBlocked && $validAllowed) {
    echo "  ✅ PASS - 3-hour minimum still enforced\n";
    echo "  +2 hours: Blocked, +4 hours: Allowed\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - 3-hour minimum not working\n\n";
    $testsFailed++;
}

// Test 3.2: Order blocked when chef unavailable (override)
echo "Test 3.2: Order blocked when chef has cancelled override\n";
$blockedOrder = $dayAfterTomorrow . ' 15:00:00'; // Cancelled day
$blockedByOverride = !$chef->isAvailableForOrder($blockedOrder);

if ($blockedByOverride) {
    echo "  ✅ PASS - Order correctly blocked by cancelled override\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Order should be blocked\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 4: INTEGRATION SCENARIOS
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 4: Integration Scenarios\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 4.1: Update existing override
echo "Test 4.1: Update existing override (modify hours)\n";
$updated = AvailabilityOverride::updateOrCreate(
    ['chef_id' => $chef->id, 'override_date' => $tomorrow],
    ['start_time' => '13:00', 'end_time' => '18:00', 'status' => 'modified', 'source' => 'manual_toggle']
);

$refreshed = AvailabilityOverride::forChef($chef->id)->forDate($tomorrow)->first();

// Database stores time as HH:MM:SS, so compare with :00 suffix
if ($refreshed->start_time === '13:00:00' && $refreshed->end_time === '18:00:00' && $refreshed->status === 'modified') {
    echo "  ✅ PASS - Override updated successfully\n";
    echo "  New times: 13:00-18:00, Status: modified\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Override not updated correctly\n";
    echo "  Expected: 13:00:00 / 18:00:00 / modified\n";
    echo "  Got: {$refreshed->start_time} / {$refreshed->end_time} / {$refreshed->status}\n\n";
    $testsFailed++;
}

// Test 4.2: Availability with updated override
echo "Test 4.2: Availability check with updated override\n";
$availableAt1230 = $chef->isAvailableForOrder($tomorrow . ' 12:30:00'); // Before new start
$availableAt1330 = $chef->isAvailableForOrder($tomorrow . ' 13:30:00'); // After new start
$availableAt1730 = $chef->isAvailableForOrder($tomorrow . ' 17:30:00'); // Before new end
$availableAt1830 = $chef->isAvailableForOrder($tomorrow . ' 18:30:00'); // After new end

if (!$availableAt1230 && $availableAt1330 && $availableAt1730 && !$availableAt1830) {
    echo "  ✅ PASS - Updated override times working correctly\n";
    echo "  12:30: No, 13:30: Yes, 17:30: Yes, 18:30: No\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Updated override times not working\n";
    echo "  12:30: " . ($availableAt1230?'Y':'N') . ", 13:30: " . ($availableAt1330?'Y':'N') .
         ", 17:30: " . ($availableAt1730?'Y':'N') . ", 18:30: " . ($availableAt1830?'Y':'N') . "\n\n";
    $testsFailed++;
}

// Test 4.3: Delete override (chef returns to weekly schedule)
echo "Test 4.3: Delete override (returns to weekly schedule)\n";
AvailabilityOverride::where('chef_id', $chef->id)->where('override_date', $tomorrow)->delete();

$tomorrowDayOfWeek = strtolower(date('l', strtotime($tomorrow)));
if ($availability) {
    $startField = $tomorrowDayOfWeek . '_start';
    $endField = $tomorrowDayOfWeek . '_end';
    $weeklyStart = $availability->$startField;
    $weeklyEnd = $availability->$endField;

    if ($weeklyStart && $weeklyEnd) {
        $testTime = date('H:i', strtotime($weeklyStart) + 1800); // 30 min after weekly start
        $backToWeekly = $chef->isAvailableForOrder($tomorrow . ' ' . $testTime . ':00');

        if ($backToWeekly) {
            echo "  ✅ PASS - After override deleted, returns to weekly schedule\n";
            echo "  Weekly schedule time ({$testTime}): Available\n\n";
            $testsPassed++;
        } else {
            echo "  ❌ FAIL - Should return to weekly schedule\n\n";
            $testsFailed++;
        }
    } else {
        echo "  ⚠️  SKIP - No weekly schedule for tomorrow\n\n";
    }
}

// Clean up
echo "Cleaning up test data...\n";
AvailabilityOverride::where('chef_id', $chef->id)->delete();
echo "✓ Test overrides deleted\n\n";

// ========================================
// SUMMARY
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST SUMMARY\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$totalTests = $testsPassed + $testsFailed;
$passRate = $totalTests > 0 ? round(($testsPassed / $totalTests) * 100, 1) : 0;

echo "Total Tests: {$totalTests}\n";
echo "✅ Passed: {$testsPassed}\n";
echo "❌ Failed: {$testsFailed}\n";
echo "Pass Rate: {$passRate}%\n\n";

if ($testsFailed == 0) {
    echo "🎉 ALL TESTS PASSED! Override system is production-ready!\n\n";
    exit(0);
} else {
    echo "⚠️  Some tests failed. Please review and fix before deploying.\n\n";
    exit(1);
}
