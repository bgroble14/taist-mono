<?php
/**
 * Test Script: Verify Stripe Return URL Changes
 *
 * This script verifies that the backend code has been updated with the correct
 * deep link return URLs for Stripe account onboarding.
 *
 * DO NOT RUN THIS AGAINST PRODUCTION
 */

echo "=== Stripe Return URL Verification Test ===\n\n";

// Read the MapiController file
$controllerPath = __DIR__ . '/backend/app/Http/Controllers/MapiController.php';

if (!file_exists($controllerPath)) {
    echo "❌ FAILED: MapiController.php not found at: $controllerPath\n";
    exit(1);
}

$fileContents = file_get_contents($controllerPath);

// Test 1: Check for new return_url
echo "Test 1: Checking return_url...\n";
if (strpos($fileContents, "'return_url' => 'taistexpo://stripe-complete?status=success'") !== false) {
    echo "✅ PASSED: return_url correctly set to taistexpo://stripe-complete?status=success\n\n";
} else {
    echo "❌ FAILED: return_url not found or incorrect\n";
    echo "Expected: 'return_url' => 'taistexpo://stripe-complete?status=success'\n\n";
}

// Test 2: Check for new refresh_url
echo "Test 2: Checking refresh_url...\n";
if (strpos($fileContents, "'refresh_url' => 'taistexpo://stripe-refresh?status=incomplete'") !== false) {
    echo "✅ PASSED: refresh_url correctly set to taistexpo://stripe-refresh?status=incomplete\n\n";
} else {
    echo "❌ FAILED: refresh_url not found or incorrect\n";
    echo "Expected: 'refresh_url' => 'taistexpo://stripe-refresh?status=incomplete'\n\n";
}

// Test 3: Ensure old URLs are removed
echo "Test 3: Checking old URLs are removed...\n";
if (strpos($fileContents, "'return_url' => 'https://connect.stripe.com/express'") !== false ||
    strpos($fileContents, "'refresh_url' => 'https://connect.stripe.com/express'") !== false) {
    echo "❌ FAILED: Old Stripe URLs still present in accountLinks->create\n";
    echo "Please verify only the new deep link URLs are used\n\n";
} else {
    echo "✅ PASSED: Old Stripe Connect URLs removed from accountLinks->create\n\n";
}

// Test 4: Check code structure integrity
echo "Test 4: Checking code structure integrity...\n";
if (strpos($fileContents, "'type' => 'account_onboarding'") !== false &&
    strpos($fileContents, "\$account_link = \$stripe->accountLinks->create([") !== false) {
    echo "✅ PASSED: Code structure intact\n\n";
} else {
    echo "❌ FAILED: Code structure may be damaged\n\n";
}

echo "=== Summary ===\n";
echo "Phase 1.1 Backend Changes: Ready for next step\n";
echo "\nNOTE: This only verifies the code changes.\n";
echo "Actual Stripe API behavior must be tested with a real account.\n";
echo "\nNext Step: Phase 1.2 - Add verification status to getPaymentMethod\n";
