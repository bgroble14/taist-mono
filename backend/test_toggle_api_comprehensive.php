<?php

/**
 * Comprehensive Unit Tests for Toggle Online API
 *
 * Tests all edge cases, validations, and error conditions
 * TMA-011 Phase 3 - Complete Test Coverage
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Listener;

echo "\n╔══════════════════════════════════════════════════════════╗\n";
echo "║   TMA-011 COMPREHENSIVE TOGGLE API UNIT TESTS           ║\n";
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

// Helper function to make API calls
function apiCall($url, $method, $token, $apiKey, $data = null) {
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
        'apiKey: ' . $apiKey,
        'Authorization: Bearer ' . $token
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => $response,
        'data' => json_decode($response, true)
    ];
}

// Reset chef to offline state
App\Listener::where('id', $chef->id)->update([
    'is_online' => false,
    'online_start' => null,
    'online_until' => null,
    'last_toggled_online_at' => null,
    'last_toggled_offline_at' => null
]);

echo "Test Subject: Chef {$chef->first_name} {$chef->last_name} (ID: {$chef->id})\n\n";

// ========================================
// TEST GROUP 1: AUTHORIZATION & ACCESS
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 1: Authorization & Access Control\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 1.1: Invalid API key
echo "Test 1.1: Invalid API key should be rejected\n";
$result = apiCall("{$baseUrl}/get_online_status", 'GET', $chef->api_token, 'INVALID_KEY');
if ($result['data']['success'] == 0 && strpos($result['data']['error'], 'Access denied') !== false) {
    echo "  ✅ PASS - Invalid API key rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Invalid API key not rejected properly\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed++;
}

// Test 1.2: Customer cannot toggle online (only chefs can)
echo "Test 1.2: Customer cannot toggle online (only chefs)\n";
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s'),
    'online_until' => date('Y-m-d H:i:s', strtotime('+2 hours'))
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $customer->api_token, $apiKey, $payload);
if ($result['data']['success'] == 0 && strpos($result['data']['error'], 'Only chefs') !== false) {
    echo "  ✅ PASS - Customer correctly blocked from toggling\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Customer should not be able to toggle\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed++;
}

// Test 1.3: Chef can access their own status
echo "Test 1.3: Chef can get their own online status\n";
$result = apiCall("{$baseUrl}/get_online_status", 'GET', $chef->api_token, $apiKey);
if ($result['data']['success'] == 1 && isset($result['data']['data']['is_online'])) {
    echo "  ✅ PASS - Chef can get online status\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Chef should be able to get status\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 2: INPUT VALIDATION
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 2: Input Validation\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 2.1: Missing online_start when toggling online
echo "Test 2.1: Missing online_start should fail\n";
$payload = [
    'is_online' => true,
    'online_until' => date('Y-m-d H:i:s', strtotime('+2 hours'))
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 0 && strpos($result['data']['error'], 'required') !== false) {
    echo "  ✅ PASS - Missing online_start rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should require online_start\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed++;
}

// Test 2.2: Missing online_until when toggling online
echo "Test 2.2: Missing online_until should fail\n";
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s')
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 0 && strpos($result['data']['error'], 'required') !== false) {
    echo "  ✅ PASS - Missing online_until rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should require online_until\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed++;
}

// Test 2.3: online_until before online_start should fail
echo "Test 2.3: online_until before online_start should fail\n";
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s', strtotime('+2 hours')),
    'online_until' => date('Y-m-d H:i:s', strtotime('+1 hour'))
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 0 && strpos($result['data']['error'], 'after') !== false) {
    echo "  ✅ PASS - Invalid time range rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should reject online_until before online_start\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed++;
}

// Test 2.4: online_until in the past should fail
echo "Test 2.4: online_until in the past should fail\n";
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s', strtotime('-2 hours')),
    'online_until' => date('Y-m-d H:i:s', strtotime('-1 hour'))
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 0 && strpos($result['data']['error'], 'future') !== false) {
    echo "  ✅ PASS - Past online_until rejected\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should reject past online_until\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 3: TOGGLE ONLINE LOGIC
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 3: Toggle Online Logic\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 3.1: Toggle online with start time NOW
echo "Test 3.1: Toggle online NOW (immediate)\n";
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s'),
    'online_until' => date('Y-m-d H:i:s', strtotime('+2 hours'))
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 1 && $result['data']['data']['is_online'] == true) {
    echo "  ✅ PASS - Chef went online immediately\n";

    // Verify database
    $dbChef = App\Listener::find($chef->id);
    if ($dbChef->is_online && $dbChef->last_toggled_online_at) {
        echo "  ✅ PASS - Database updated correctly\n\n";
        $testsPassed += 2;
    } else {
        echo "  ❌ FAIL - Database not updated\n\n";
        $testsFailed++;
    }
} else {
    echo "  ❌ FAIL - Should toggle online immediately\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed += 2;
}

// Test 3.2: Toggle online with future start time
echo "Test 3.2: Toggle online with FUTURE start time (scheduled)\n";
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s', strtotime('+1 hour')),
    'online_until' => date('Y-m-d H:i:s', strtotime('+3 hours'))
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 1 && $result['data']['data']['is_online'] == false) {
    echo "  ✅ PASS - Chef scheduled but not online yet\n";

    // Verify times are stored
    if ($result['data']['data']['online_start'] && $result['data']['data']['online_until']) {
        echo "  ✅ PASS - Start and end times stored\n\n";
        $testsPassed += 2;
    } else {
        echo "  ❌ FAIL - Times not stored\n\n";
        $testsFailed++;
    }
} else {
    echo "  ❌ FAIL - Should be scheduled but not online\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed += 2;
}

// Test 3.3: Toggle back online immediately (override schedule)
echo "Test 3.3: Toggle online NOW (override previous schedule)\n";
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s'),
    'online_until' => date('Y-m-d H:i:s', strtotime('+4 hours'))
];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 1 && $result['data']['data']['is_online'] == true) {
    echo "  ✅ PASS - Schedule overridden, chef online now\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should override previous schedule\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 4: TOGGLE OFFLINE LOGIC
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 4: Toggle Offline Logic\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 4.1: Toggle offline clears online_start and online_until
echo "Test 4.1: Toggle offline clears all online fields\n";
$payload = ['is_online' => false];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 1 &&
    $result['data']['data']['is_online'] == false &&
    $result['data']['data']['online_start'] == null &&
    $result['data']['data']['online_until'] == null) {
    echo "  ✅ PASS - Offline clears all fields\n";

    // Verify last_toggled_offline_at is set
    $dbChef = App\Listener::find($chef->id);
    if ($dbChef->last_toggled_offline_at) {
        echo "  ✅ PASS - last_toggled_offline_at timestamp set\n\n";
        $testsPassed += 2;
    } else {
        echo "  ❌ FAIL - Timestamp not set\n\n";
        $testsFailed++;
    }
} else {
    echo "  ❌ FAIL - Fields not cleared properly\n";
    echo "  Response: {$result['body']}\n\n";
    $testsFailed += 2;
}

// Test 4.2: Toggle offline when already offline (idempotent)
echo "Test 4.2: Toggle offline when already offline (idempotent)\n";
$payload = ['is_online' => false];
$result = apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
if ($result['data']['success'] == 1 && $result['data']['data']['is_online'] == false) {
    echo "  ✅ PASS - Idempotent operation works\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - Should handle already offline state\n\n";
    $testsFailed++;
}

// ========================================
// TEST GROUP 5: TIMESTAMP TRACKING
// ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST GROUP 5: Timestamp Tracking\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Test 5.1: Verify all timestamps are tracked
echo "Test 5.1: All timestamps properly tracked\n";

// Go online
$beforeOnline = time();
sleep(1);
$payload = [
    'is_online' => true,
    'online_start' => date('Y-m-d H:i:s'),
    'online_until' => date('Y-m-d H:i:s', strtotime('+2 hours'))
];
apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
sleep(1);
$afterOnline = time();

$dbChef = App\Listener::find($chef->id);
$onlineTime = strtotime($dbChef->last_toggled_online_at);

if ($onlineTime >= $beforeOnline && $onlineTime <= $afterOnline) {
    echo "  ✅ PASS - last_toggled_online_at accurate\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - last_toggled_online_at incorrect\n";
    $testsFailed++;
}

// Go offline
$beforeOffline = time();
sleep(1);
$payload = ['is_online' => false];
apiCall("{$baseUrl}/toggle_online", 'POST', $chef->api_token, $apiKey, $payload);
sleep(1);
$afterOffline = time();

$dbChef = App\Listener::find($chef->id);
$offlineTime = strtotime($dbChef->last_toggled_offline_at);

if ($offlineTime >= $beforeOffline && $offlineTime <= $afterOffline) {
    echo "  ✅ PASS - last_toggled_offline_at accurate\n\n";
    $testsPassed++;
} else {
    echo "  ❌ FAIL - last_toggled_offline_at incorrect\n\n";
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
    echo "🎉 ALL TESTS PASSED! Toggle API is production-ready!\n\n";
    exit(0);
} else {
    echo "⚠️  Some tests failed. Please review and fix before deploying.\n\n";
    exit(1);
}
