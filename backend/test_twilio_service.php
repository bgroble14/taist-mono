<?php

/**
 * Test script for TwilioService
 * Tests all new methods before proceeding to Phase 2
 *
 * Run: php test_twilio_service.php
 */

require __DIR__.'/vendor/autoload.php';

// Load Laravel app
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\TwilioService;
use Illuminate\Support\Facades\Log;

echo "=== TwilioService Test Suite ===\n\n";

$twilioService = app(TwilioService::class);

// Test 1: Check if service is enabled
echo "Test 1: Check if Twilio is enabled\n";
$enabled = $twilioService->isEnabled();
echo "Result: " . ($enabled ? "✓ ENABLED" : "✗ DISABLED") . "\n";
if (!$enabled) {
    echo "⚠️  Twilio credentials not configured. SMS won't be sent.\n";
}
echo "\n";

// Test 2: Test formatPhoneNumber (via reflection since it's private)
echo "Test 2: Phone number formatting (internal method)\n";
$reflection = new ReflectionClass($twilioService);
$formatMethod = $reflection->getMethod('formatPhoneNumber');
$formatMethod->setAccessible(true);

$testNumbers = [
    '5551234567' => '+15551234567',  // 10-digit US number
    '15551234567' => '+15551234567', // 11-digit with 1
    '(555) 123-4567' => '+15551234567', // Formatted US number
    '+15551234567' => '+15551234567', // Already E.164
    '' => null, // Empty
    'invalid' => null, // Invalid
];

foreach ($testNumbers as $input => $expected) {
    $result = $formatMethod->invoke($twilioService, $input);
    $match = $result === $expected ? "✓" : "✗";
    echo "  $match '$input' -> " . ($result ?? 'null') . "\n";
}
echo "\n";

// Test 3: Test truncateMessage
echo "Test 3: Message truncation (internal method)\n";
$truncateMethod = $reflection->getMethod('truncateMessage');
$truncateMethod->setAccessible(true);

$shortMessage = "Short message";
$result = $truncateMethod->invoke($twilioService, $shortMessage);
echo "  ✓ Short message: '$result'\n";

$longMessage = str_repeat("a", 200);
$result = $truncateMethod->invoke($twilioService, $longMessage);
echo "  ✓ Long message (200 chars) truncated to: " . strlen($result) . " chars\n";
echo "\n";

// Test 4: Test buildMessage
echo "Test 4: Template message building (internal method)\n";
$buildMethod = $reflection->getMethod('buildMessage');
$buildMethod->setAccessible(true);

$template = "Hello {name}, your order #{order_id} for \${price} is ready!";
$data = [
    'name' => 'John',
    'order_id' => '123',
    'price' => '45.00'
];
$result = $buildMethod->invoke($twilioService, $template, $data);
echo "  Template: $template\n";
echo "  Result: $result\n";
echo "  " . (strpos($result, '{') === false ? "✓" : "✗") . " All placeholders replaced\n";
echo "\n";

// Test 5: Test sendSMS (only if enabled and you want to send real SMS)
echo "Test 5: Send test SMS\n";
if ($enabled) {
    echo "⚠️  This will send a REAL SMS and cost ~$0.0079\n";
    echo "Enter a phone number to test (or press Enter to skip): ";
    $testPhone = trim(fgets(STDIN));

    if (!empty($testPhone)) {
        echo "Sending test SMS to $testPhone...\n";
        $result = $twilioService->sendSMS(
            $testPhone,
            "Test message from Taist. TwilioService is working correctly!",
            ['test' => true]
        );

        if ($result['success']) {
            echo "  ✓ SMS sent successfully!\n";
            echo "  SID: " . $result['sid'] . "\n";
        } else {
            echo "  ✗ Failed to send SMS\n";
            echo "  Error: " . $result['error'] . "\n";
        }
    } else {
        echo "  ⊘ Skipped (no phone number entered)\n";
    }
} else {
    echo "  ⊘ Skipped (Twilio not enabled)\n";
}
echo "\n";

// Test 6: Test sendOrderNotification
echo "Test 6: Send order notification SMS\n";
if ($enabled) {
    echo "This requires a valid user_id with a phone number.\n";
    echo "Enter a user_id to test (or press Enter to skip): ";
    $userId = trim(fgets(STDIN));

    if (!empty($userId) && is_numeric($userId)) {
        echo "Sending order notification SMS to user #$userId...\n";
        $result = $twilioService->sendOrderNotification(
            $userId,
            "Test order notification from Taist!",
            999, // test order_id
            'test_notification'
        );

        if ($result['success']) {
            echo "  ✓ Order notification sent successfully!\n";
        } else {
            echo "  ✗ Failed to send order notification\n";
            echo "  Error: " . $result['error'] . "\n";
        }
    } else {
        echo "  ⊘ Skipped (no user_id entered)\n";
    }
} else {
    echo "  ⊘ Skipped (Twilio not enabled)\n";
}
echo "\n";

echo "=== Test Suite Complete ===\n";
echo "\nCheck backend/storage/logs/laravel.log for detailed logs.\n";
