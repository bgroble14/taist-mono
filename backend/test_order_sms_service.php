<?php

/**
 * Test script for OrderSmsService
 * Tests order-specific SMS notifications
 *
 * Run: php test_order_sms_service.php
 */

require __DIR__.'/vendor/autoload.php';

// Load Laravel app
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\OrderSmsService;
use App\Services\TwilioService;
use App\Models\Orders;
use Illuminate\Support\Facades\Log;

echo "=== OrderSmsService Test Suite ===\n\n";

$orderSmsService = app(OrderSmsService::class);
$twilioService = app(TwilioService::class);

// Test 1: Check if Twilio is enabled
echo "Test 1: Check prerequisites\n";
$enabled = $twilioService->isEnabled();
echo "  Twilio: " . ($enabled ? "✓ ENABLED" : "✗ DISABLED") . "\n";

// Get a recent order for testing, or use mock data
$order = Orders::orderBy('id', 'desc')->first();
$useMockData = false;

if ($order) {
    echo "  Test Order: ✓ Found order #{$order->id}\n";
    echo "\n";

    // Test 2: Test getOrderData (via reflection)
    echo "Test 2: Fetch order data\n";
    $reflection = new ReflectionClass($orderSmsService);
    $getDataMethod = $reflection->getMethod('getOrderData');
    $getDataMethod->setAccessible(true);

    $orderData = $getDataMethod->invoke($orderSmsService, $order->id);

    if ($orderData) {
        echo "  ✓ Order data retrieved successfully\n";
        echo "    - Order ID: {$orderData['order_id']}\n";
        echo "    - Chef: {$orderData['chef_name']}\n";
        echo "    - Customer: {$orderData['customer_name']}\n";
        echo "    - Menu: {$orderData['menu_title']}\n";
        echo "    - Amount: {$orderData['amount']}\n";
        echo "    - Total: \${$orderData['total_price']}\n";
        echo "    - Date: {$orderData['order_date_formatted']}\n";
        echo "    - Time: {$orderData['order_time']}\n";
    } else {
        echo "  ✗ Failed to retrieve order data\n";
        die("Cannot proceed without order data\n");
    }
} else {
    echo "  Test Order: ⚠️  No orders in database, using mock data\n";
    $useMockData = true;

    // Create mock order data for testing
    $order = (object)[
        'id' => 999,
    ];

    $orderData = [
        'order_id' => 999,
        'chef_name' => 'Sarah Johnson',
        'customer_name' => 'John Smith',
        'menu_title' => 'Grilled Chicken Tacos',
        'amount' => 4,
        'total_price' => '45.00',
        'order_date_formatted' => 'Dec 4, 2PM',
        'order_time' => '2:00 PM',
    ];

    echo "  ✓ Using mock data for message preview\n";
    echo "    - Order ID: {$orderData['order_id']}\n";
    echo "    - Chef: {$orderData['chef_name']}\n";
    echo "    - Customer: {$orderData['customer_name']}\n";
    echo "    - Menu: {$orderData['menu_title']}\n";
    echo "    - Amount: {$orderData['amount']}\n";
    echo "    - Total: \${$orderData['total_price']}\n";
    echo "    - Date: {$orderData['order_date_formatted']}\n";
    echo "    - Time: {$orderData['order_time']}\n";
}
echo "\n";

// Test 3: Test formatOrderDateTime (only if not using mock data)
if (!$useMockData) {
    echo "Test 3: Date/time formatting\n";
    $formatMethod = $reflection->getMethod('formatOrderDateTime');
    $formatMethod->setAccessible(true);

    $now = time();
    $formatted = $formatMethod->invoke($orderSmsService, $now);
    echo "  ✓ Current time: {$formatted['formatted']} at {$formatted['time']}\n";
    echo "\n";
} else {
    echo "Test 3: Date/time formatting\n";
    echo "  ✓ Using mock formatted time\n\n";
}

// Test 4: Preview all notification messages (DRY RUN - no SMS sent)
echo "Test 4: Preview all notification messages (no SMS sent)\n\n";

// New Order Request
echo "  [1] NEW ORDER REQUEST (to Chef):\n";
$message = "New order request! ORDER#" . sprintf('%07d', $order->id) .
           " from {$orderData['customer_name']} for {$orderData['order_date_formatted']}. " .
           "{$orderData['menu_title']} x{$orderData['amount']}. Total: \${$orderData['total_price']}. " .
           "Accept within 30 minutes. View in app.";
echo "  → $message\n";
echo "  Length: " . strlen($message) . " chars\n\n";

// Order Accepted
echo "  [2] ORDER ACCEPTED (to Customer):\n";
$message = "Great news! Chef {$orderData['chef_name']} accepted your order ORDER#" .
           sprintf('%07d', $order->id) . " for {$orderData['order_date_formatted']}. " .
           "We'll notify you when they're on the way!";
echo "  → $message\n";
echo "  Length: " . strlen($message) . " chars\n\n";

// Order Rejected
echo "  [3] ORDER REJECTED (to Customer):\n";
$message = "Sorry, Chef {$orderData['chef_name']} is unable to fulfill your order ORDER#" .
           sprintf('%07d', $order->id) . ". You will receive a full refund within 5-7 business days. " .
           "Browse other chefs in the app!";
echo "  → $message\n";
echo "  Length: " . strlen($message) . " chars\n\n";

// Chef On The Way
echo "  [4] CHEF ON THE WAY (to Customer):\n";
$message = "Chef {$orderData['chef_name']} is on the way with your order ORDER#" .
           sprintf('%07d', $order->id) . "! They should arrive around {$orderData['order_time']}.";
echo "  → $message\n";
echo "  Length: " . strlen($message) . " chars\n\n";

// Order Complete
echo "  [5] ORDER COMPLETE (to Customer):\n";
$message = "Your order ORDER#" . sprintf('%07d', $order->id) . " is complete! " .
           "Hope you enjoyed it. Please rate your experience with Chef {$orderData['chef_name']} in the app.";
echo "  → $message\n";
echo "  Length: " . strlen($message) . " chars\n\n";

// Chef Reminder
echo "  [6] CHEF REMINDER (to Chef):\n";
$message = "Reminder: You have order ORDER#" . sprintf('%07d', $order->id) .
           " from {$orderData['customer_name']} scheduled for tomorrow at {$orderData['order_time']}. " .
           "{$orderData['menu_title']} x{$orderData['amount']}. Don't forget!";
echo "  → $message\n";
echo "  Length: " . strlen($message) . " chars\n\n";

// Customer Reminder
echo "  [7] CUSTOMER REMINDER (to Customer):\n";
$message = "Reminder: Your order ORDER#" . sprintf('%07d', $order->id) .
           " from Chef {$orderData['chef_name']} is scheduled for tomorrow at {$orderData['order_time']}. " .
           "{$orderData['menu_title']} x{$orderData['amount']}. Can't wait!";
echo "  → $message\n";
echo "  Length: " . strlen($message) . " chars\n\n";

// Test 5: Send actual SMS (optional)
if ($enabled && !$useMockData) {
    echo "Test 5: Send ACTUAL SMS (optional)\n";
    echo "⚠️  This will send REAL SMS messages and cost money!\n";
    echo "Order #{$order->id} will be used for testing.\n";
    echo "Which notification would you like to test?\n";
    echo "  1 = New Order Request (to Chef)\n";
    echo "  2 = Order Accepted (to Customer)\n";
    echo "  3 = Order Rejected (to Customer)\n";
    echo "  4 = Chef On The Way (to Customer)\n";
    echo "  5 = Order Complete (to Customer)\n";
    echo "  6 = Chef Reminder (to Chef)\n";
    echo "  7 = Customer Reminder (to Customer)\n";
    echo "  0 = Skip testing\n";
    echo "Enter choice (0-7): ";

    $choice = trim(fgets(STDIN));

    if ($choice != '0') {
        $methods = [
            '1' => ['sendNewOrderNotification', 'Chef'],
            '2' => ['sendOrderAcceptedNotification', 'Customer'],
            '3' => ['sendOrderRejectedNotification', 'Customer'],
            '4' => ['sendChefOnTheWayNotification', 'Customer'],
            '5' => ['sendOrderCompleteNotification', 'Customer'],
            '6' => ['sendChefReminderNotification', 'Chef'],
            '7' => ['sendCustomerReminderNotification', 'Customer'],
        ];

        if (isset($methods[$choice])) {
            $method = $methods[$choice][0];
            $recipient = $methods[$choice][1];

            echo "\nSending '$method' to $recipient...\n";
            $result = $orderSmsService->$method($order->id);

            if ($result['success']) {
                echo "  ✓ SMS sent successfully!\n";
            } else {
                echo "  ✗ Failed to send SMS\n";
                echo "  Error: {$result['error']}\n";
            }
        } else {
            echo "  Invalid choice\n";
        }
    } else {
        echo "  ⊘ Skipped\n";
    }
} else {
    echo "Test 5: ⊘ Skipped (Twilio not enabled)\n";
}

echo "\n=== Test Suite Complete ===\n";
echo "\nCheck backend/storage/logs/laravel.log for detailed logs.\n";
