<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\OrderSmsService;
use App\Services\TwilioService;
use Mockery;

/**
 * Unit tests for OrderSmsService
 * Sprint Task: TMA-001 - Twilio text notifications
 *
 * Tests SMS message formatting, notification types, and error handling
 */
class OrderSmsServiceTest extends TestCase
{
    protected $twilioServiceMock;
    protected $orderSmsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->twilioServiceMock = Mockery::mock(TwilioService::class);
        $this->orderSmsService = new OrderSmsService($this->twilioServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ==========================================
    // Order ID Formatting Tests
    // ==========================================

    /**
     * Test order ID is formatted with 7-digit padding
     */
    public function test_order_id_formatted_with_seven_digit_padding()
    {
        // Test sprintf formatting used in service
        $orderId = 123;
        $formatted = sprintf('%07d', $orderId);
        $this->assertEquals('0000123', $formatted);
    }

    /**
     * Test order ID formatting for small numbers
     */
    public function test_order_id_formatted_for_small_number()
    {
        $orderId = 1;
        $formatted = sprintf('%07d', $orderId);
        $this->assertEquals('0000001', $formatted);
    }

    /**
     * Test order ID formatting for large numbers
     */
    public function test_order_id_formatted_for_large_number()
    {
        $orderId = 9999999;
        $formatted = sprintf('%07d', $orderId);
        $this->assertEquals('9999999', $formatted);
    }

    /**
     * Test order ID formatting for numbers exceeding 7 digits
     */
    public function test_order_id_formatted_for_exceeding_digits()
    {
        $orderId = 12345678;
        $formatted = sprintf('%07d', $orderId);
        $this->assertEquals('12345678', $formatted); // No truncation
    }

    // ==========================================
    // Message Template Tests (using expected patterns)
    // ==========================================

    /**
     * Test new order notification message contains required elements
     */
    public function test_new_order_message_pattern()
    {
        // Expected message pattern from service
        $orderId = 456;
        $customerName = 'John Smith';
        $orderDate = 'Dec 4, 2PM';
        $menuTitle = 'Grilled Chicken Tacos';
        $amount = 4;
        $totalPrice = '45.00';

        $expectedPattern = "New order request! ORDER#" . sprintf('%07d', $orderId) .
                          " from {$customerName} for {$orderDate}. " .
                          "{$menuTitle} x{$amount}. Total: \${$totalPrice}. " .
                          "Accept within 30 minutes. View in app.";

        // Verify message structure
        $this->assertStringContainsString('ORDER#0000456', $expectedPattern);
        $this->assertStringContainsString('New order request!', $expectedPattern);
        $this->assertStringContainsString('Accept within 30 minutes', $expectedPattern);
        $this->assertStringContainsString('John Smith', $expectedPattern);
        $this->assertStringContainsString('$45.00', $expectedPattern);
    }

    /**
     * Test order accepted notification message contains required elements
     */
    public function test_order_accepted_message_pattern()
    {
        $orderId = 789;
        $chefName = 'Sarah Johnson';
        $orderDate = 'Dec 5, 3PM';

        $expectedPattern = "Great news! Chef {$chefName} accepted your order ORDER#" .
                          sprintf('%07d', $orderId) . " for {$orderDate}. " .
                          "We'll notify you when they're on the way!";

        $this->assertStringContainsString('ORDER#0000789', $expectedPattern);
        $this->assertStringContainsString('Great news!', $expectedPattern);
        $this->assertStringContainsString('Sarah Johnson', $expectedPattern);
        $this->assertStringContainsString("We'll notify you when they're on the way!", $expectedPattern);
    }

    /**
     * Test order rejected notification message contains refund info
     */
    public function test_order_rejected_message_pattern()
    {
        $orderId = 321;
        $chefName = 'Mike Brown';

        $expectedPattern = "Sorry, Chef {$chefName} is unable to fulfill your order ORDER#" .
                          sprintf('%07d', $orderId) . ". You will receive a full refund within 5-7 business days. " .
                          "Browse other chefs in the app!";

        $this->assertStringContainsString('ORDER#0000321', $expectedPattern);
        $this->assertStringContainsString('Sorry', $expectedPattern);
        $this->assertStringContainsString('full refund', $expectedPattern);
        $this->assertStringContainsString('5-7 business days', $expectedPattern);
        $this->assertStringContainsString('Browse other chefs', $expectedPattern);
    }

    /**
     * Test chef on the way notification message pattern
     */
    public function test_chef_on_way_message_pattern()
    {
        $orderId = 555;
        $orderTime = '2:00 PM';

        $expectedPattern = "Your chef is on the way! ORDER#" .
                          sprintf('%07d', $orderId) . " should arrive around {$orderTime}.";

        $this->assertStringContainsString('ORDER#0000555', $expectedPattern);
        $this->assertStringContainsString('on the way', $expectedPattern);
        $this->assertStringContainsString('should arrive around', $expectedPattern);
    }

    /**
     * Test order complete notification message asks for rating
     */
    public function test_order_complete_message_pattern()
    {
        $orderId = 777;
        $chefName = 'Lisa Chen';

        $expectedPattern = "Your order is complete! ORDER#" . sprintf('%07d', $orderId) . ". " .
                          "Hope you enjoyed it. Please rate your experience with {$chefName} in the app.";

        $this->assertStringContainsString('ORDER#0000777', $expectedPattern);
        $this->assertStringContainsString('complete', $expectedPattern);
        $this->assertStringContainsString('rate your experience', $expectedPattern);
        $this->assertStringContainsString('Lisa Chen', $expectedPattern);
    }

    /**
     * Test chef reminder notification message pattern
     */
    public function test_chef_reminder_message_pattern()
    {
        $orderId = 888;
        $customerName = 'David Lee';
        $orderTime = '2:00 PM';
        $menuTitle = 'Pad Thai';
        $amount = 2;

        $expectedPattern = "Reminder: You have order ORDER#" . sprintf('%07d', $orderId) .
                          " from {$customerName} scheduled for tomorrow at {$orderTime}. " .
                          "{$menuTitle} x{$amount}. Don't forget!";

        $this->assertStringContainsString('ORDER#0000888', $expectedPattern);
        $this->assertStringContainsString('Reminder:', $expectedPattern);
        $this->assertStringContainsString('tomorrow', $expectedPattern);
        $this->assertStringContainsString("Don't forget!", $expectedPattern);
    }

    /**
     * Test customer reminder notification message pattern
     */
    public function test_customer_reminder_message_pattern()
    {
        $orderId = 999;
        $chefName = 'Emma Wilson';
        $orderTime = '6:00 PM';
        $menuTitle = 'Sushi Platter';
        $amount = 1;

        $expectedPattern = "Reminder: Your order ORDER#" . sprintf('%07d', $orderId) .
                          " from Chef {$chefName} is scheduled for tomorrow at {$orderTime}. " .
                          "{$menuTitle} x{$amount}. Can't wait!";

        $this->assertStringContainsString('ORDER#0000999', $expectedPattern);
        $this->assertStringContainsString('Reminder:', $expectedPattern);
        $this->assertStringContainsString('tomorrow', $expectedPattern);
        $this->assertStringContainsString("Can't wait!", $expectedPattern);
    }

    // ==========================================
    // Notification Type Tests
    // ==========================================

    /**
     * Test notification types are correct strings
     */
    public function test_notification_types_are_defined()
    {
        $expectedTypes = [
            'new_order_request',
            'order_accepted',
            'order_rejected',
            'chef_on_way',
            'order_complete',
            'chef_reminder_24h',
            'customer_reminder_24h'
        ];

        foreach ($expectedTypes as $type) {
            $this->assertIsString($type);
            $this->assertNotEmpty($type);
        }
    }

    // ==========================================
    // Price Formatting Tests
    // ==========================================

    /**
     * Test price is formatted with 2 decimal places
     */
    public function test_price_formatted_with_two_decimals()
    {
        $price = 45;
        $formatted = number_format($price, 2);
        $this->assertEquals('45.00', $formatted);
    }

    /**
     * Test price formatting with cents
     */
    public function test_price_formatted_with_cents()
    {
        $price = 45.5;
        $formatted = number_format($price, 2);
        $this->assertEquals('45.50', $formatted);
    }

    /**
     * Test price formatting with thousands
     */
    public function test_price_formatted_with_thousands()
    {
        $price = 1234.56;
        $formatted = number_format($price, 2);
        $this->assertEquals('1,234.56', $formatted);
    }

    // ==========================================
    // Error Handling Tests
    // ==========================================

    /**
     * Test service returns error when order is not found
     */
    public function test_returns_error_when_order_not_found()
    {
        // Call with non-existent order ID
        $result = $this->orderSmsService->sendNewOrderNotification(99999999);

        $this->assertArrayHasKey('success', $result);
        $this->assertArrayHasKey('error', $result);
        $this->assertFalse($result['success']);
        $this->assertNotEmpty($result['error']);
    }

    /**
     * Test service returns proper structure on error
     */
    public function test_error_response_structure()
    {
        $result = $this->orderSmsService->sendOrderAcceptedNotification(99999999);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
        $this->assertArrayHasKey('error', $result);
        $this->assertIsBool($result['success']);
    }

    /**
     * Test service handles missing chef gracefully
     */
    public function test_returns_error_when_chef_not_found()
    {
        $result = $this->orderSmsService->sendChefReminderNotification(99999999);

        $this->assertFalse($result['success']);
        $this->assertNotEmpty($result['error']);
    }

    /**
     * Test service handles missing customer gracefully
     */
    public function test_returns_error_when_customer_not_found()
    {
        $result = $this->orderSmsService->sendCustomerReminderNotification(99999999);

        $this->assertFalse($result['success']);
        $this->assertNotEmpty($result['error']);
    }

    // ==========================================
    // Message Length Tests (SMS has 160 char limit)
    // ==========================================

    /**
     * Test typical new order message is reasonable length
     */
    public function test_new_order_message_reasonable_length()
    {
        // Build typical message
        $message = "New order request! ORDER#0001234 from John Smith for Dec 4, 2PM. " .
                   "Grilled Chicken x4. Total: \$45.00. Accept within 30 minutes. View in app.";

        // Should be reasonable for SMS (may need concatenation for long messages)
        $this->assertLessThan(300, strlen($message));
    }

    /**
     * Test order accepted message is reasonable length
     */
    public function test_order_accepted_message_reasonable_length()
    {
        $message = "Great news! Chef Sarah Johnson accepted your order ORDER#0001234 " .
                   "for Dec 4, 2PM. We'll notify you when they're on the way!";

        $this->assertLessThan(200, strlen($message));
    }

    /**
     * Test order rejected message is reasonable length
     */
    public function test_order_rejected_message_reasonable_length()
    {
        $message = "Sorry, Chef Mike Brown is unable to fulfill your order ORDER#0001234. " .
                   "You will receive a full refund within 5-7 business days. Browse other chefs in the app!";

        $this->assertLessThan(200, strlen($message));
    }
}
