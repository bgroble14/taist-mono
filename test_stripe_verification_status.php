<?php
/**
 * Test Script: Verify Stripe Verification Status Enhancement
 *
 * This script verifies that the getPaymentMethods function has been enhanced
 * to include Stripe verification status fields.
 *
 * DO NOT RUN THIS AGAINST PRODUCTION
 */

echo "=== Stripe Verification Status Enhancement Test ===\n\n";

// Read the MapiController file
$controllerPath = __DIR__ . '/backend/app/Http/Controllers/MapiController.php';

if (!file_exists($controllerPath)) {
    echo "❌ FAILED: MapiController.php not found at: $controllerPath\n";
    exit(1);
}

$fileContents = file_get_contents($controllerPath);

// Test 1: Check for charges_enabled field
echo "Test 1: Checking for charges_enabled field...\n";
if (strpos($fileContents, "\$paymentArray['charges_enabled'] = \$account->charges_enabled;") !== false) {
    echo "✅ PASSED: charges_enabled field added\n\n";
} else {
    echo "❌ FAILED: charges_enabled field not found\n\n";
}

// Test 2: Check for payouts_enabled field
echo "Test 2: Checking for payouts_enabled field...\n";
if (strpos($fileContents, "\$paymentArray['payouts_enabled'] = \$account->payouts_enabled;") !== false) {
    echo "✅ PASSED: payouts_enabled field added\n\n";
} else {
    echo "❌ FAILED: payouts_enabled field not found\n\n";
}

// Test 3: Check for details_submitted field
echo "Test 3: Checking for details_submitted field...\n";
if (strpos($fileContents, "\$paymentArray['details_submitted'] = \$account->details_submitted;") !== false) {
    echo "✅ PASSED: details_submitted field added\n\n";
} else {
    echo "❌ FAILED: details_submitted field not found\n\n";
}

// Test 4: Check for verification_complete computed field
echo "Test 4: Checking for verification_complete computed field...\n";
if (strpos($fileContents, "\$paymentArray['verification_complete']") !== false) {
    echo "✅ PASSED: verification_complete computed field added\n\n";
} else {
    echo "❌ FAILED: verification_complete field not found\n\n";
}

// Test 5: Check for error handling
echo "Test 5: Checking for error handling...\n";
if (strpos($fileContents, "catch (\Exception \$e)") !== false &&
    strpos($fileContents, "\Log::error('Stripe account retrieval failed") !== false) {
    echo "✅ PASSED: Error handling implemented\n\n";
} else {
    echo "❌ FAILED: Error handling not found or incomplete\n\n";
}

// Test 6: Check for stripe_account_id check
echo "Test 6: Checking for stripe_account_id validation...\n";
if (strpos($fileContents, "if (!empty(\$payment->stripe_account_id))") !== false) {
    echo "✅ PASSED: stripe_account_id validation present\n\n";
} else {
    echo "❌ FAILED: stripe_account_id validation not found\n\n";
}

// Test 7: Check for Stripe API call
echo "Test 7: Checking for Stripe accounts->retrieve call...\n";
if (strpos($fileContents, "\$account = \$stripe->accounts->retrieve(\$payment->stripe_account_id);") !== false) {
    echo "✅ PASSED: Stripe accounts->retrieve call present\n\n";
} else {
    echo "❌ FAILED: Stripe accounts->retrieve call not found\n\n";
}

// Test 8: Check that data is mapped and returned correctly
echo "Test 8: Checking for data mapping...\n";
if (strpos($fileContents, "\$enhancedData = \$data->map(function (\$payment)") !== false &&
    strpos($fileContents, "return response()->json(['success' => 1, 'data' => \$enhancedData]);") !== false) {
    echo "✅ PASSED: Data mapping and return statement correct\n\n";
} else {
    echo "❌ FAILED: Data mapping or return statement incorrect\n\n";
}

// Test 9: PHP Syntax Check
echo "Test 9: Running PHP syntax check...\n";
exec("php -l " . escapeshellarg($controllerPath) . " 2>&1", $output, $returnCode);
if ($returnCode === 0) {
    echo "✅ PASSED: PHP syntax is valid\n\n";
} else {
    echo "❌ FAILED: PHP syntax errors detected:\n";
    echo implode("\n", $output) . "\n\n";
}

echo "=== Summary ===\n";
echo "Phase 1.2 Backend Changes: Code structure verified\n";
echo "\nNOTE: This only verifies the code changes and syntax.\n";
echo "Actual Stripe API behavior must be tested with a real account.\n";
echo "\nNext Step: Phase 2 - Update PaymentInterface with verification fields\n";
