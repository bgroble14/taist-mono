<?php

/**
 * Test the HTTP endpoint for available timeslots
 * TMA-011 REVISED - Backend-Driven Approach
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Listener;
use App\Models\AvailabilityOverride;

echo "\n";
echo "Testing GET /mapi/get_available_timeslots HTTP Endpoint\n";
echo "═══════════════════════════════════════════════════════\n\n";

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

// Get API key from config
$apiKey = env('APP_API_KEY', 'taistApiKeyForTaistApp');

// Simulate HTTP request using controller directly
$request = new \Illuminate\Http\Request();
$request->headers->set('apiKey', $apiKey);
$request->merge([
    'chef_id' => $chef->id,
    'date' => $tomorrow
]);

$controller = new \App\Http\Controllers\MapiController();
$response = $controller->getAvailableTimeslots($request);
$data = json_decode($response->getContent(), true);

echo "API Response:\n";
echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

if ($data['success'] === 1) {
    echo "✅ SUCCESS - Endpoint returned data\n";

    $timeslots = $data['data'];
    echo "Total timeslots returned: " . count($timeslots) . "\n\n";

    if (count($timeslots) > 0) {
        echo "Sample timeslots:\n";
        $sampleSize = min(10, count($timeslots));
        for ($i = 0; $i < $sampleSize; $i++) {
            echo "  - {$timeslots[$i]}\n";
        }

        // Verify they're within override times (14:00-18:00)
        $allWithinRange = true;
        foreach ($timeslots as $slot) {
            if ($slot < '14:00' || $slot > '18:00') {
                $allWithinRange = false;
                echo "\n⚠️  Found slot outside override range: {$slot}\n";
            }
        }

        if ($allWithinRange) {
            echo "\n✅ PASS - All slots within override time range (14:00-18:00)\n";
        }

        // Check that 3-hour minimum is applied
        $now = time();
        $minimumTime = $now + (3 * 60 * 60);
        $tomorrowDate = strtotime($tomorrow);

        echo "\nCurrent time: " . date('H:i', $now) . "\n";
        echo "Minimum order time: " . date('Y-m-d H:i', $minimumTime) . "\n";

        // If tomorrow is more than 3 hours away, should have slots starting at 14:00
        if ($tomorrowDate > $minimumTime) {
            if (in_array('14:00', $timeslots)) {
                echo "✅ PASS - Earliest slot (14:00) is available\n";
            }
        }

    } else {
        echo "⚠️  No timeslots returned (might be due to 3-hour minimum filter)\n";
    }
} else {
    echo "❌ FAIL - Endpoint returned error\n";
    echo "Error: " . ($data['error'] ?? 'Unknown') . "\n";
}

// Clean up
AvailabilityOverride::where('chef_id', $chef->id)->delete();
echo "\n✓ Cleanup complete\n\n";
