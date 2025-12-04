<?php

/**
 * Comprehensive Unit Tests for Order Validation
 *
 * Tests 3-hour minimum window and same-day online requirements
 * TMA-011 Phase 4 - Complete Test Coverage
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Listener;

echo "\n╔══════════════════════════════════════════════════════════╗\n";
echo "║   TMA-011 COMPREHENSIVE ORDER VALIDATION TESTS          ║\n";
echo "╚══════════════════════════════════════════════════════════╝\n\n";

// Setup
$chef = App\Listener::where('user_type', 2)->first();
$customer = App\Listener::where('user_type', 1)->first();

if (!$chef || !$customer) {
    echo "❌ SETUP FAILED: No chef or customer users found\n";
    exit(1);
}

$apiKey = 'ra_jk6YK9QmAVqTazHIrF1vi3qnbtagCIJoZAzCR51lCpYY9nkTN6aPVeX15J49k';
$baseUrl = 'http://localhost:8000/mapi';

$testsPassed = 0;
$testsFailed = 0;

// Helper function
function makeOrderRequest($chefId, $customerId, $orderDate, $token, $apiKey, $baseUrl) {
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
        'apiKey: ' . $apiKey,
        'Authorization: Bearer ' . $token
    ];

    $payload = [
        'chef_user_id' => $chefId,
        'customer_user_id' => $customerId,
        'order_date' => $orderDate,
        'total_price' => 50.00
    ];

    $ch = curl_init("{$baseUrl}/create_order");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

echo "Test Subjects:\n";
echo "  Chef: {$chef->first_name} {$chef->last_name} (ID: {$chef->id})\n";
echo "  Customer: {$customer->first_name} {$customer->last_name} (ID: {$customer->id})\n\n";

// ========================================
// TEST GROUP 1: 3-HOUR MINIMUM WINDOW
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 1: 3-Hour Minimum Window Validation\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 1.1: Order 1 hour from now (should fail)
echo "Test 1.1: Order 1 hour from now (too soon)\n";
$orderDate = date('Y-m-d H:i:s', strtotime('+1 hour'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
if ($result['success'] == 0 && strpos($result['error'], '3 hours') !== false) {
    echo "  ✅ PASS - 1 hour order rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should reject 1 hour orders\n";
    echo "  Response: " . json_encode($result) . "\n\n";
    $testsFailed++;
}

// Test 1.2: Order 2 hours from now (should fail)
echo "Test 1.2: Order 2 hours from now (too soon)\n";
$orderDate = date('Y-m-d H:i:s', strtotime('+2 hours'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
if ($result['success'] == 0 && strpos($result['error'], '3 hours') !== false) {
    echo "  ✅ PASS - 2 hour order rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should reject 2 hour orders\n\n";
    $testsFailed++;
}

// Test 1.3: Order 2 hours 59 minutes from now (edge case - should fail)
echo "Test 1.3: Order 2h 59m from now (edge case - should fail)\n";
$orderDate = date('Y-m-d H:i:s', strtotime('+2 hours 59 minutes'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
if ($result['success'] == 0 && strpos($result['error'], '3 hours') !== false) {
    echo "  ✅ PASS - 2h 59m order rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should reject orders < 3 hours\n\n";
    $testsFailed++;
}

// Test 1.4: Order exactly 3 hours from now (edge case - may pass payment validation)
echo "Test 1.4: Order exactly 3 hours from now (boundary)\n";
$orderDate = date('Y-m-d H:i:s', strtotime('+3 hours'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
// This should NOT be our 3-hour error (may fail at payment method)
$is3HourError = isset($result['error']) && strpos($result['error'], '3 hours') !== false;
if (!$is3HourError) {
    echo "  ✅ PASS - 3 hour order passed time validation\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - 3 hour orders should be allowed\n";
    echo "  Error: {$result['error']}\n\n";
    $testsFailed++;
}

// Test 1.5: Order 4 hours from now (should pass time validation)
echo "Test 1.5: Order 4 hours from now (should pass)\n";
$orderDate = date('Y-m-d H:i:s', strtotime('+4 hours'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
$is3HourError = isset($result['error']) && strpos($result['error'], '3 hours') !== false;
if (!$is3HourError) {
    echo "  ✅ PASS - 4 hour order passed time validation\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - 4 hour orders should be allowed\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 2: SAME-DAY ONLINE REQUIREMENT
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 2: Same-Day Online Requirement\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Setup: Ensure chef is offline
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => null,
    'online_until' => null
]);

$currentHour = (int)date('H');

if ($currentHour < 18) {
    // Test 2.1: Same-day order with chef offline
    echo "Test 2.1: Same-day order with chef OFFLINE (should fail)\n";
    $orderDate = date('Y-m-d 20:00:00'); // 8pm today
    $result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
    if ($result['success'] == 0 && isset($result['chef_offline'])) {
        echo "  ✅ PASS - Same-day order rejected (chef offline)\n";
        echo "  Error message: {$result['error']}\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should reject when chef is offline\n";
        echo "  Response: " . json_encode($result) . "\n\n";
        $testsFailed++;
    }

    // Setup: Toggle chef online
    App\Listener::where('id', $chef->id)->update([
        'is_online' => true,
        'online_start' => date('Y-m-d H:i:s'),
        'online_until' => date('Y-m-d 23:59:59'),
        'last_toggled_online_at' => now()
    ]);

    // Test 2.2: Same-day order with chef online
    echo "Test 2.2: Same-day order with chef ONLINE (should pass time check)\n";
    $orderDate = date('Y-m-d 20:00:00'); // 8pm today
    $result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
    // Should NOT be our chef_offline error
    $isChefOfflineError = isset($result['chef_offline']);
    if (!$isChefOfflineError) {
        echo "  ✅ PASS - Same-day order passed online check\n";
        echo "  (May fail at payment - that's expected)\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - Should allow when chef is online\n\n";
        $testsFailed++;
    }
} else {
    echo "⚠️  Tests 2.1-2.2 SKIPPED (too late in day for same-day testing)\n\n";
    echo "  Note: Run tests earlier in the day for full coverage\n\n";
}

// ========================================
// TEST GROUP 3: FUTURE DATE ORDERS
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 3: Future Date Orders (Bypass Online Check)\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Setup: Ensure chef is offline
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => null,
    'online_until' => null
]);

// Test 3.1: Tomorrow order with chef offline (should bypass online check)
echo "Test 3.1: Tomorrow order with chef OFFLINE\n";
$orderDate = date('Y-m-d 14:00:00', strtotime('tomorrow'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
$isChefOfflineError = isset($result['chef_offline']);
if (!$isChefOfflineError) {
    echo "  ✅ PASS - Future order bypassed online check\n";
    echo "  (Chef offline but future orders still allowed)\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Future orders should bypass online check\n";
    echo "  Response: " . json_encode($result) . "\n\n";
    $testsFailed++;
}

// Test 3.2: Next week order with chef offline
echo "Test 3.2: Next week order with chef OFFLINE\n";
$orderDate = date('Y-m-d 14:00:00', strtotime('+7 days'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
$isChefOfflineError = isset($result['chef_offline']);
if (!$isChefOfflineError) {
    echo "  ✅ PASS - Next week order bypassed online check\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Future orders should bypass online check\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 4: EDGE CASES
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 4: Edge Cases & Boundary Conditions\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 4.1: Order in the past (should fail)
echo "Test 4.1: Order in the PAST (should fail)\n";
$orderDate = date('Y-m-d H:i:s', strtotime('-1 hour'));
$result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
if ($result['success'] == 0) {
    echo "  ✅ PASS - Past order rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should reject past orders\n\n";
    $testsFailed++;
}

// Test 4.2: Order crossing midnight (late night same-day)
$currentHour = (int)date('H');
if ($currentHour >= 18) {
    echo "Test 4.2: Order just after midnight (tomorrow technically)\n";
    $orderDate = date('Y-m-d 00:30:00', strtotime('tomorrow'));
    $result = makeOrderRequest($chef->id, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
    // This is tomorrow, so should NOT require chef to be online
    $isChefOfflineError = isset($result['chef_offline']);
    if (!$isChefOfflineError) {
        echo "  ✅ PASS - After midnight treated as future date\n\n";
        $testsPassed++;
    } else {
        echo "  ❌ FAIL - After midnight should be future date\n\n";
        $testsFailed++;
    }
} else {
    echo "Test 4.2: SKIPPED (run after 6pm for midnight boundary test)\n\n";
}

// Test 4.3: Invalid chef ID
echo "Test 4.3: Order with invalid chef ID\n";
$orderDate = date('Y-m-d H:i:s', strtotime('+4 hours'));
$result = makeOrderRequest(999999, $customer->id, $orderDate, $customer->api_token, $apiKey, $baseUrl);
if ($result['success'] == 0) {
    echo "  ✅ PASS - Invalid chef ID rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should reject invalid chef ID\n\n";
    $testsFailed++;
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
    echo "🎉 ALL TESTS PASSED! Order validation is production-ready!\n\n";
    exit(0);
} else {
    echo "⚠️  Some tests failed. Please review and fix before deploying.\n\n";
    exit(1);
}
