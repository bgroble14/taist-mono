<?php

/**
 * Unit Tests for Auto-Toggle Services
 *
 * Tests ChefAutoOnlineService and ChefAutoOfflineService
 * TMA-011 Phase 5 Testing
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Listener;
use App\Services\ChefAutoOnlineService;
use App\Services\ChefAutoOfflineService;

echo "\n╔══════════════════════════════════════════════════════════╗\n";
echo "║   TMA-011 AUTO-TOGGLE SERVICES TESTS                    ║\n";
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

$autoOnlineService = new ChefAutoOnlineService();
$autoOfflineService = new ChefAutoOfflineService();

// ========================================
// TEST GROUP 1: AUTO-ONLINE SERVICE
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 1: ChefAutoOnlineService\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 1.1: Chef with start time in past (should toggle online)
echo "Test 1.1: Chef scheduled for past time (should auto-toggle online)\n";

// Setup: Schedule chef for 1 minute ago
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => date('Y-m-d H:i:s', strtotime('-1 minute')),
    'online_until' => date('Y-m-d H:i:s', strtotime('+1 hour'))
]);

$count = $autoOnlineService->processAutoOnline();

$chef = App\Listener::find($chef->id);
if ($count == 1 && $chef->is_online) {
    echo "  ✅ PASS - Chef auto-toggled online\n";
    echo "  Toggled {$count} chef(s)\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should have toggled chef online\n";
    echo "  Count: {$count}, is_online: " . ($chef->is_online ? 'true' : 'false') . "\n\n";
    $testsFailed++;
}

// Test 1.2: Chef with start time in future (should NOT toggle)
echo "Test 1.2: Chef scheduled for future time (should NOT toggle yet)\n";

// Setup: Schedule for 1 hour from now
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => date('Y-m-d H:i:s', strtotime('+1 hour')),
    'online_until' => date('Y-m-d H:i:s', strtotime('+2 hours'))
]);

$count = $autoOnlineService->processAutoOnline();

$chef = App\Listener::find($chef->id);
if ($count == 0 && !$chef->is_online) {
    echo "  ✅ PASS - Chef NOT toggled (future start time)\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should NOT toggle for future times\n\n";
    $testsFailed++;
}

// Test 1.3: Chef already online (should NOT toggle again)
echo "Test 1.3: Chef already online (should be ignored)\n";

// Setup: Chef online with past start time
App\Listener::where('id', $chef->id)->update([
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s', strtotime('-1 minute')),
    'online_until' => date('Y-m-d H:i:s', strtotime('+1 hour'))
]);

$count = $autoOnlineService->processAutoOnline();

if ($count == 0) {
    echo "  ✅ PASS - Already online chefs ignored\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should ignore already online chefs\n\n";
    $testsFailed++;
}

// Test 1.4: Chef with expired schedule (should clear, not toggle)
echo "Test 1.4: Chef scheduled but time already expired (should clear)\n";

// Setup: Start time in past, end time also in past
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => date('Y-m-d H:i:s', strtotime('-2 hours')),
    'online_until' => date('Y-m-d H:i:s', strtotime('-1 hour'))
]);

$count = $autoOnlineService->processAutoOnline();

$chef = App\Listener::find($chef->id);
if ($count == 0 && !$chef->is_online && $chef->online_start === null) {
    echo "  ✅ PASS - Expired schedule cleared\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should clear expired schedules\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 2: AUTO-OFFLINE SERVICE
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 2: ChefAutoOfflineService\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 2.1: Chef online with expired time (should toggle offline)
echo "Test 2.1: Chef online with expired online_until (should auto-toggle offline)\n";

// Setup: Chef online but time expired
App\Listener::where('id', $chef->id)->update([
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s', strtotime('-2 hours')),
    'online_until' => date('Y-m-d H:i:s', strtotime('-1 minute'))
]);

$count = $autoOfflineService->processAutoOffline();

$chef = App\Listener::find($chef->id);
if ($count == 1 && !$chef->is_online && $chef->online_until === null) {
    echo "  ✅ PASS - Chef auto-toggled offline\n";
    echo "  Toggled {$count} chef(s)\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should have toggled chef offline\n";
    echo "  Count: {$count}, is_online: " . ($chef->is_online ? 'true' : 'false') . "\n\n";
    $testsFailed++;
}

// Test 2.2: Chef online with future end time (should NOT toggle)
echo "Test 2.2: Chef online with future online_until (should NOT toggle)\n";

// Setup: Chef online, end time in future
App\Listener::where('id', $chef->id)->update([
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s', strtotime('-1 hour')),
    'online_until' => date('Y-m-d H:i:s', strtotime('+1 hour'))
]);

$count = $autoOfflineService->processAutoOffline();

$chef = App\Listener::find($chef->id);
if ($count == 0 && $chef->is_online) {
    echo "  ✅ PASS - Chef stays online (future end time)\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should NOT toggle for future times\n\n";
    $testsFailed++;
}

// Test 2.3: Chef already offline (should be ignored)
echo "Test 2.3: Chef already offline (should be ignored)\n";

// Setup: Chef offline
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => null,
    'online_until' => null
]);

$count = $autoOfflineService->processAutoOffline();

if ($count == 0) {
    echo "  ✅ PASS - Already offline chefs ignored\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should ignore offline chefs\n\n";
    $testsFailed++;
}

// Test 2.4: Chef online without online_until (should be ignored)
echo "Test 2.4: Chef online without online_until field (should be ignored)\n";

// Setup: Chef online but no online_until
App\Listener::where('id', $chef->id)->update([
    'is_online' => true,
    'online_start' => null,
    'online_until' => null
]);

$count = $autoOfflineService->processAutoOffline();

$chef = App\Listener::find($chef->id);
if ($count == 0 && $chef->is_online) {
    echo "  ✅ PASS - Chefs without online_until ignored\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should ignore chefs without online_until\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 3: INTEGRATION SCENARIOS
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 3: Integration Scenarios\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 3.1: Full lifecycle - scheduled -> online -> offline
echo "Test 3.1: Full lifecycle test (scheduled → auto-online → auto-offline)\n";

// Step 1: Schedule for past (should go online)
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => date('Y-m-d H:i:s', strtotime('-1 minute')),
    'online_until' => date('Y-m-d H:i:s', strtotime('+10 seconds'))
]);

echo "  Step 1: Chef scheduled (start: past, end: 10 seconds from now)\n";

// Process auto-online
$onlineCount = $autoOnlineService->processAutoOnline();
$chef = App\Listener::find($chef->id);

if ($onlineCount == 1 && $chef->is_online) {
    echo "  ✅ Step 1 PASS - Chef auto-toggled online\n";
} else {
    echo "  ❌ Step 1 FAIL - Chef should be online\n";
    $testsFailed++;
}

// Step 2: Wait for end time to pass
echo "  Step 2: Waiting 11 seconds for online_until to pass...\n";
sleep(11);

// Process auto-offline
$offlineCount = $autoOfflineService->processAutoOffline();
$chef = App\Listener::find($chef->id);

if ($offlineCount == 1 && !$chef->is_online) {
    echo "  ✅ Step 2 PASS - Chef auto-toggled offline\n";
    echo "  ✅ TEST 3.1 COMPLETE - Full lifecycle works!\n\n";
    $testsPassed++;
} else {
    echo "  ❌ Step 2 FAIL - Chef should be offline\n";
    echo "  ❌ TEST 3.1 FAILED\n\n";
    $testsFailed++;
}

// Clean up
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => null,
    'online_until' => null
]);

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
    echo "🎉 ALL TESTS PASSED! Auto-toggle services are production-ready!\n\n";
    exit(0);
} else {
    echo "⚠️  Some tests failed. Please review and fix before deploying.\n\n";
    exit(1);
}
