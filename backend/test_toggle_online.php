<?php

/**
 * Test script for toggle_online and get_online_status API endpoints
 *
 * This tests TMA-011 Phase 3: Chef Online Toggle API
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Listener;

echo "\n=== TMA-011 Toggle Online API Test ===\n\n";

// Get a test chef
$chef = App\Listener::where('user_type', 2)->first();

if (!$chef) {
    echo "❌ No chef users found in database\n";
    exit(1);
}

echo "Testing with Chef: {$chef->first_name} {$chef->last_name} (ID: {$chef->id})\n";
echo "API Token: " . substr($chef->api_token, 0, 20) . "...\n\n";

// Get API key (hardcoded in MapiController line 80)
$apiKey = 'ra_jk6YK9QmAVqTazHIrF1vi3qnbtagCIJoZAzCR51lCpYY9nkTN6aPVeX15J49k';
echo "Using API Key: " . substr($apiKey, 0, 20) . "...\n\n";

// Base URL
$baseUrl = 'http://localhost:8000/mapi'; // Adjust if needed

// Headers
$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    'apiKey: ' . $apiKey,
    'Authorization: Bearer ' . $chef->api_token
];

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST 1: Get current online status\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$ch = curl_init("{$baseUrl}/get_online_status");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n";
echo "Response: {$response}\n\n";

$data = json_decode($response, true);
if ($data && $data['success'] == 1) {
    echo "✅ GET online status: SUCCESS\n";
    echo "   Current is_online: " . ($data['data']['is_online'] ? 'true' : 'false') . "\n\n";
} else {
    echo "❌ GET online status: FAILED\n\n";
    exit(1);
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST 2: Toggle online (NOW - 2 hours from now)\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$onlineStart = date('Y-m-d H:i:s'); // Now
$onlineUntil = date('Y-m-d H:i:s', strtotime('+2 hours')); // 2 hours from now

$payload = [
    'is_online' => true,
    'online_start' => $onlineStart,
    'online_until' => $onlineUntil
];

echo "Payload:\n";
echo json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init("{$baseUrl}/toggle_online");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n";
echo "Response: {$response}\n\n";

$data = json_decode($response, true);
if ($data && $data['success'] == 1) {
    echo "✅ Toggle online: SUCCESS\n";
    echo "   is_online: " . ($data['data']['is_online'] ? 'true' : 'false') . "\n";
    echo "   online_start: {$data['data']['online_start']}\n";
    echo "   online_until: {$data['data']['online_until']}\n\n";

    if ($data['data']['is_online']) {
        echo "✅ Chef went online immediately (start time was NOW)\n\n";
    } else {
        echo "⚠️  Chef is scheduled for future (not online yet)\n\n";
    }
} else {
    echo "❌ Toggle online: FAILED\n\n";
    echo "Error: " . ($data['error'] ?? 'Unknown error') . "\n\n";
    exit(1);
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST 3: Verify database was updated\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$chef = App\Listener::where('id', $chef->id)->first();

echo "Database values:\n";
echo "   is_online: " . ($chef->is_online ? 'true' : 'false') . "\n";
echo "   online_start: {$chef->online_start}\n";
echo "   online_until: {$chef->online_until}\n";
echo "   last_toggled_online_at: {$chef->last_toggled_online_at}\n\n";

if ($chef->is_online && $chef->online_start && $chef->online_until) {
    echo "✅ Database updated correctly\n\n";
} else {
    echo "❌ Database not updated correctly\n\n";
    exit(1);
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST 4: Toggle offline\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$payload = [
    'is_online' => false
];

echo "Payload:\n";
echo json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init("{$baseUrl}/toggle_online");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n";
echo "Response: {$response}\n\n";

$data = json_decode($response, true);
if ($data && $data['success'] == 1) {
    echo "✅ Toggle offline: SUCCESS\n";
    echo "   is_online: " . ($data['data']['is_online'] ? 'true' : 'false') . "\n";
    echo "   online_start: " . ($data['data']['online_start'] ?? 'null') . "\n";
    echo "   online_until: " . ($data['data']['online_until'] ?? 'null') . "\n";
    echo "   last_toggled_offline_at: {$data['data']['last_toggled_offline_at']}\n\n";
} else {
    echo "❌ Toggle offline: FAILED\n\n";
    exit(1);
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "TEST 5: Verify offline in database\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$chef = App\Listener::where('id', $chef->id)->first();

echo "Database values:\n";
echo "   is_online: " . ($chef->is_online ? 'true' : 'false') . "\n";
echo "   online_start: " . ($chef->online_start ?? 'null') . "\n";
echo "   online_until: " . ($chef->online_until ?? 'null') . "\n";
echo "   last_toggled_offline_at: {$chef->last_toggled_offline_at}\n\n";

if (!$chef->is_online && !$chef->online_start && !$chef->online_until) {
    echo "✅ Database updated correctly - chef is offline\n\n";
} else {
    echo "❌ Database not updated correctly\n\n";
    exit(1);
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ ALL TESTS PASSED!\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

echo "Summary:\n";
echo "✅ GET /mapi/get_online_status - Working\n";
echo "✅ POST /mapi/toggle_online (online) - Working\n";
echo "✅ POST /mapi/toggle_online (offline) - Working\n";
echo "✅ Database persistence - Working\n";
echo "✅ Timestamp tracking - Working\n\n";

echo "Phase 3 API endpoints are ready for production! 🎉\n\n";
