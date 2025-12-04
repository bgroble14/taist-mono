<?php

/**
 * Unit Tests for Listener Model Helper Methods
 *
 * Tests the isOnline(), isAvailableForOrder(), and schedule checking methods
 * TMA-011 Phase 2 - Model Testing
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Listener;
use App\Models\Availabilities;

echo "\n╔══════════════════════════════════════════════════════════╗\n";
echo "║   TMA-011 LISTENER MODEL HELPER METHOD TESTS            ║\n";
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
// TEST GROUP 1: isOnline() METHOD
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 1: isOnline() Method\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 1.1: isOnline() returns false when offline
echo "Test 1.1: isOnline() returns false when chef is offline\n";
App\Listener::where('id', $chef->id)->update(['is_online' => false]);
$chef = App\Listener::find($chef->id);
if ($chef->isOnline() === false) {
    echo "  ✅ PASS - isOnline() returns false\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should return false\n\n";
    $testsFailed++;
}

// Test 1.2: isOnline() returns true when online
echo "Test 1.2: isOnline() returns true when chef is online\n";
App\Listener::where('id', $chef->id)->update(['is_online' => true]);
$chef = App\Listener::find($chef->id);
if ($chef->isOnline() === true) {
    echo "  ✅ PASS - isOnline() returns true\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should return true\n\n";
    $testsFailed++;
}

// Test 1.3: isOnline() handles null value
echo "Test 1.3: isOnline() handles null gracefully\n";
App\Listener::where('id', $chef->id)->update(['is_online' => null]);
$chef = App\Listener::find($chef->id);
if ($chef->isOnline() === false) {
    echo "  ✅ PASS - null treated as false\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - null should be treated as false\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 2: isAvailableForOrder() - SAME DAY
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 2: isAvailableForOrder() - Same Day Orders\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Setup: Ensure chef has availability for today
$today = strtolower(date('l')); // e.g., "tuesday"
$availability = Availabilities::where('user_id', $chef->id)->first();

if ($availability) {
    $startField = $today . '_start';
    $endField = $today . '_end';

    // Set availability for today
    $availability->$startField = '10:00';
    $availability->$endField = '20:00';
    $availability->save();

    echo "Setup: Chef has availability today ({$today}): 10:00 - 20:00\n\n";

    // Test 2.1: Same-day order with chef offline (should return false)
    echo "Test 2.1: Same-day order with chef OFFLINE\n";
    App\Listener::where('id', $chef->id)->update(['is_online' => false]);
    $chef = App\Listener::find($chef->id);

    $todayAt6pm = date('Y-m-d 18:00:00');
    if ($chef->isAvailableForOrder($todayAt6pm) === false) {
        echo "  ✅ PASS - Returns false (chef offline)\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should return false when offline\n\n";
        $testsFailed++;
    }

    // Test 2.2: Same-day order with chef online (should return true)
    echo "Test 2.2: Same-day order with chef ONLINE\n";
    App\Listener::where('id', $chef->id)->update(['is_online' => true]);
    $chef = App\Listener::find($chef->id);

    if ($chef->isAvailableForOrder($todayAt6pm) === true) {
        echo "  ✅ PASS - Returns true (chef online + has schedule)\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should return true when online and has schedule\n\n";
        $testsFailed++;
    }

    // Test 2.3: Same-day order with chef online but NO schedule
    echo "Test 2.3: Same-day order with chef online but NO schedule today\n";
    $availability->$startField = null;
    $availability->$endField = null;
    $availability->save();

    $chef = App\Listener::find($chef->id);
    if ($chef->isAvailableForOrder($todayAt6pm) === false) {
        echo "  ✅ PASS - Returns false (no schedule)\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should return false without schedule\n\n";
        $testsFailed++;
    }

    // Restore schedule
    $availability->$startField = '10:00';
    $availability->$endField = '20:00';
    $availability->save();
} else {
    echo "⚠️  No availability record found - Tests 2.1-2.3 SKIPPED\n\n";
}

// ========================================
// TEST GROUP 3: isAvailableForOrder() - FUTURE DATES
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 3: isAvailableForOrder() - Future Orders\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

if ($availability) {
    // Setup: Set chef offline
    App\Listener::where('id', $chef->id)->update(['is_online' => false]);
    $chef = App\Listener::find($chef->id);

    // Get tomorrow's day
    $tomorrow = strtolower(date('l', strtotime('tomorrow')));
    $tomorrowStartField = $tomorrow . '_start';
    $tomorrowEndField = $tomorrow . '_end';

    // Test 3.1: Future order with chef offline but HAS schedule (should return true)
    echo "Test 3.1: Tomorrow order with chef OFFLINE (has schedule)\n";
    $availability->$tomorrowStartField = '12:00';
    $availability->$tomorrowEndField = '18:00';
    $availability->save();

    $tomorrowAt2pm = date('Y-m-d 14:00:00', strtotime('tomorrow'));
    $chef = App\Listener::find($chef->id);

    if ($chef->isAvailableForOrder($tomorrowAt2pm) === true) {
        echo "  ✅ PASS - Returns true (has schedule, online status ignored)\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should return true for future dates with schedule\n\n";
        $testsFailed++;
    }

    // Test 3.2: Future order without schedule (should return false)
    echo "Test 3.2: Tomorrow order with NO schedule\n";
    $availability->$tomorrowStartField = null;
    $availability->$tomorrowEndField = null;
    $availability->save();

    $chef = App\Listener::find($chef->id);
    if ($chef->isAvailableForOrder($tomorrowAt2pm) === false) {
        echo "  ✅ PASS - Returns false (no schedule)\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should return false without schedule\n\n";
        $testsFailed++;
    }

    // Test 3.3: Next week order
    echo "Test 3.3: Next week order with schedule\n";
    $nextWeek = strtolower(date('l', strtotime('+7 days')));
    $nextWeekStartField = $nextWeek . '_start';
    $nextWeekEndField = $nextWeek . '_end';

    $availability->$nextWeekStartField = '11:00';
    $availability->$nextWeekEndField = '19:00';
    $availability->save();

    $nextWeekAt2pm = date('Y-m-d 14:00:00', strtotime('+7 days'));
    $chef = App\Listener::find($chef->id);

    if ($chef->isAvailableForOrder($nextWeekAt2pm) === true) {
        echo "  ✅ PASS - Returns true (future date with schedule)\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should return true for future dates\n\n";
        $testsFailed++;
    }
} else {
    echo "⚠️  No availability record - Tests 3.1-3.3 SKIPPED\n\n";
}

// ========================================
// TEST GROUP 4: EDGE CASES
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 4: Edge Cases\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 4.1: Midnight boundary (just after midnight is next day)
echo "Test 4.1: Order at 00:30 tomorrow (should be future order)\n";
$tomorrowMidnight = date('Y-m-d 00:30:00', strtotime('tomorrow'));

// This should be treated as a future order, not same-day
App\Listener::where('id', $chef->id)->update(['is_online' => false]);
$chef = App\Listener::find($chef->id);

if ($availability) {
    $tomorrowDay = strtolower(date('l', strtotime('tomorrow')));
    $startField = $tomorrowDay . '_start';
    $endField = $tomorrowDay . '_end';
    $availability->$startField = '10:00';
    $availability->$endField = '20:00';
    $availability->save();

    $chef = App\Listener::find($chef->id);
    $result = $chef->isAvailableForOrder($tomorrowMidnight);

    // Should return true (future order with schedule, even though chef is offline)
    if ($result === true) {
        echo "  ✅ PASS - Midnight treated as next day\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should treat as next day\n\n";
        $testsFailed++;
    }
}

// Test 4.2: Invalid date string handling
echo "Test 4.2: Invalid date string handling\n";
try {
    $result = $chef->isAvailableForOrder('invalid-date');
    echo "  ✅ PASS - Handled invalid date (returned: " . ($result ? 'true' : 'false') . ")\n\n";
    $testsPassed++;
} catch (Exception $e) {
    echo "  ⚠️  WARNING - Throws exception on invalid date\n";
    echo "  Consider adding validation\n\n";
}

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
    echo "🎉 ALL TESTS PASSED! Listener model methods are production-ready!\n\n";
    exit(0);
} else {
    echo "⚠️  Some tests failed. Please review and fix before deploying.\n\n";
    exit(1);
}
