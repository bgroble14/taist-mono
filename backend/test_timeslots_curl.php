<?php

/**
 * Test the HTTP endpoint for available timeslots using curl
 * TMA-011 REVISED - Backend-Driven Approach
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Listener;
use App\Models\AvailabilityOverride;

echo "\n";
echo "Testing GET /mapi/get_available_timeslots via CURL\n";
echo "═══════════════════════════════════════════════════\n\n";

// Get test chef
$chef = Listener::where('user_type', 2)->first();
if (!$chef) {
    echo "❌ No chef found\n";
    exit(1);
}

echo "Test Chef: {$chef->first_name} (ID: {$chef->id})\n\n";

// Clean up and create test override
AvailabilityOverride::where('chef_id', $chef->id)->delete();

$tomorrow = date('Y-m-d', strtotime('+1 day'));
AvailabilityOverride::create([
    'chef_id' => $chef->id,
    'override_date' => $tomorrow,
    'start_time' => '14:00',
    'end_time' => '18:00',
    'status' => 'confirmed',
    'source' => 'manual_toggle',
]);

echo "Created override for {$tomorrow}: 14:00-18:00\n\n";

// Get API URL and key
$appUrl = env('APP_URL', 'http://localhost:8000');
$apiKey = env('APP_API_KEY', 'taistApiKeyForTaistApp');

$url = "{$appUrl}/mapi/get_available_timeslots?chef_id={$chef->id}&date={$tomorrow}";

echo "Calling: {$url}\n\n";

// Make curl request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'apiKey: ' . $apiKey,
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n";
echo "Response:\n";
echo $response . "\n\n";

$data = json_decode($response, true);

if ($data && $data['success'] === 1) {
    echo "✅ SUCCESS - Endpoint works!\n\n";

    $timeslots = $data['data'];
    echo "Total timeslots: " . count($timeslots) . "\n";

    if (count($timeslots) > 0) {
        echo "\nSample timeslots:\n";
        $sampleSize = min(10, count($timeslots));
        for ($i = 0; $i < $sampleSize; $i++) {
            echo "  - {$timeslots[$i]}\n";
        }
        echo "\n✅ Backend endpoint is ready for frontend!\n";
    } else {
        echo "\n⚠️  No timeslots (might be due to 3-hour minimum)\n";
    }
} else {
    echo "❌ FAIL - Check if Laravel server is running\n";
    echo "Run: cd backend && php artisan serve\n";
}

// Clean up
AvailabilityOverride::where('chef_id', $chef->id)->delete();
echo "\n✓ Cleanup complete\n\n";
