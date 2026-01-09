<?php

/**
 * Set Up Test Chef Completely
 *
 * Sets up testchef@taist.com with:
 * - Active/verified status
 * - Location data
 * - Weekly availability schedule (Friday 7pm as requested)
 * - Availability override for this Friday
 * - Menu items
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use App\Listener;
use App\Models\Availabilities;
use App\Models\AvailabilityOverride;
use App\Models\Menus;
use Illuminate\Support\Facades\DB;

echo "\n";
echo "╔══════════════════════════════════════════════════════════╗\n";
echo "║   SET UP TEST CHEF COMPLETELY                           ║\n";
echo "╚══════════════════════════════════════════════════════════╝\n\n";

// Find the test chef
$chef = Listener::where('email', 'testchef@taist.com')->first();

if (!$chef) {
    echo "❌ Test chef (testchef@taist.com) not found!\n";
    echo "   Make sure this user exists in the database.\n\n";
    exit(1);
}

echo "Found Chef: {$chef->first_name} {$chef->last_name} (ID: {$chef->id})\n";
echo "Email: {$chef->email}\n\n";

$timestamp = date('Y-m-d H:i:s');

// ============================================
// 1. ACTIVATE CHEF
// ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "1. ACTIVATING CHEF\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$chef->user_type = 2;        // Chef
$chef->is_pending = 0;       // Not pending
$chef->verified = 1;         // Active/verified
$chef->bio = $chef->bio ?: 'Professional test chef specializing in comfort food and quick meals.';

// Set location if missing (Chicago area)
if (!$chef->latitude || !$chef->longitude) {
    $chef->address = $chef->address ?: '123 N Michigan Ave';
    $chef->city = $chef->city ?: 'Chicago';
    $chef->state = $chef->state ?: 'IL';
    $chef->zip = $chef->zip ?: '60601';
    $chef->latitude = '41.8861';
    $chef->longitude = '-87.6186';
    echo "   Set location: {$chef->address}, {$chef->city}, {$chef->state} {$chef->zip}\n";
}

$chef->save();

echo "   user_type: 2 (Chef)\n";
echo "   is_pending: 0\n";
echo "   verified: 1 (Active)\n";
echo "✅ Chef activated!\n\n";

// ============================================
// 2. SET WEEKLY AVAILABILITY
// ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "2. SETTING WEEKLY AVAILABILITY\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$availability = Availabilities::where('user_id', $chef->id)->first();

if ($availability) {
    echo "   Updating existing weekly schedule...\n";
} else {
    echo "   Creating new weekly schedule...\n";
    $availability = new Availabilities();
    $availability->user_id = $chef->id;
}

// Friday: 7pm-11pm (19:00-23:00) - as specifically requested
// Thursday: 6pm-10pm
// Saturday: 5pm-11pm
$availability->monday_start = null;
$availability->monday_end = null;
$availability->tuesday_start = null;
$availability->tuesday_end = null;
$availability->wednesday_start = null;
$availability->wednesday_end = null;
$availability->thursday_start = '18:00';
$availability->thursday_end = '22:00';
$availability->friday_start = '19:00';  // 7pm start as requested
$availability->friday_end = '23:00';    // 11pm end
$availability->saterday_start = '17:00';
$availability->saterday_end = '23:00';
$availability->sunday_start = null;
$availability->sunday_end = null;
$availability->minimum_order_amount = 25.00;
$availability->max_order_distance = 10.0;
$availability->bio = $chef->bio;
$availability->save();

echo "\n   Weekly Schedule:\n";
echo "   ├─ Monday:    Not available\n";
echo "   ├─ Tuesday:   Not available\n";
echo "   ├─ Wednesday: Not available\n";
echo "   ├─ Thursday:  6:00 PM - 10:00 PM\n";
echo "   ├─ Friday:    7:00 PM - 11:00 PM  ← (as requested)\n";
echo "   ├─ Saturday:  5:00 PM - 11:00 PM\n";
echo "   └─ Sunday:    Not available\n";
echo "✅ Weekly availability saved!\n\n";

// ============================================
// 3. CREATE AVAILABILITY OVERRIDE FOR THIS FRIDAY
// ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "3. CREATING AVAILABILITY OVERRIDE\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$today = new \DateTime();
$currentWeekday = (int)$today->format('w');
$daysToFriday = 5 - $currentWeekday; // 5 = Friday
if ($daysToFriday <= 0) {
    $daysToFriday += 7;
}

$nextFriday = clone $today;
$nextFriday->modify("+{$daysToFriday} days");
$fridayDate = $nextFriday->format('Y-m-d');

$fridayOverride = AvailabilityOverride::updateOrCreate(
    ['chef_id' => $chef->id, 'override_date' => $fridayDate],
    [
        'start_time' => '19:00',
        'end_time' => '23:00',
        'status' => 'confirmed',
        'source' => 'manual_toggle',
    ]
);

echo "   Override for: {$fridayDate} (this Friday)\n";
echo "   Time: 7:00 PM - 11:00 PM\n";
echo "   Status: confirmed (LIVE)\n";
echo "✅ Friday override created!\n\n";

// ============================================
// 4. ADD MENU ITEMS
// ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "4. ADDING MENU ITEMS\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Check existing menus
$existingMenuCount = DB::table('tbl_menus')->where('user_id', $chef->id)->count();

if ($existingMenuCount > 0) {
    echo "   Chef already has {$existingMenuCount} menu item(s).\n";
    echo "   Skipping menu creation.\n";
} else {
    echo "   Creating menu items...\n";

    $menus = [
        [
            'user_id' => $chef->id,
            'title' => 'Classic Beef Burger',
            'description' => 'Juicy beef patty with lettuce, tomato, onion, pickles, and special sauce on a toasted brioche bun.',
            'price' => 16.00,
            'serving_size' => 1,
            'meals' => 'Lunch,Dinner',
            'category_ids' => '5', // American
            'allergens' => '1,2', // Gluten, Dairy
            'appliances' => '2', // Stove
            'estimated_time' => 20,
            'is_live' => 1,
            'created_at' => $timestamp,
            'updated_at' => $timestamp
        ],
        [
            'user_id' => $chef->id,
            'title' => 'Grilled Chicken Caesar Salad',
            'description' => 'Crisp romaine lettuce with grilled chicken, parmesan, croutons, and creamy Caesar dressing.',
            'price' => 14.00,
            'serving_size' => 1,
            'meals' => 'Lunch,Dinner',
            'category_ids' => '5', // American
            'allergens' => '1,2,3', // Gluten, Dairy, Eggs
            'appliances' => '2', // Stove
            'estimated_time' => 15,
            'is_live' => 1,
            'created_at' => $timestamp,
            'updated_at' => $timestamp
        ],
        [
            'user_id' => $chef->id,
            'title' => 'Pasta Carbonara',
            'description' => 'Creamy pasta with pancetta, parmesan, and a rich egg sauce. A Roman classic!',
            'price' => 18.00,
            'serving_size' => 1,
            'meals' => 'Dinner',
            'category_ids' => '4', // Italian
            'allergens' => '1,2,3', // Gluten, Dairy, Eggs
            'appliances' => '2', // Stove
            'estimated_time' => 25,
            'is_live' => 1,
            'created_at' => $timestamp,
            'updated_at' => $timestamp
        ],
    ];

    foreach ($menus as $menu) {
        DB::table('tbl_menus')->insert($menu);
        echo "   + {$menu['title']} (\${$menu['price']})\n";
    }
}

echo "✅ Menu items ready!\n\n";

// ============================================
// SUMMARY
// ============================================
echo "╔══════════════════════════════════════════════════════════╗\n";
echo "║   SETUP COMPLETE!                                       ║\n";
echo "╚══════════════════════════════════════════════════════════╝\n\n";

echo "Chef: {$chef->first_name} {$chef->last_name}\n";
echo "Email: {$chef->email}\n";
echo "Status: Active & Verified\n";
echo "Location: {$chef->city}, {$chef->state}\n";
echo "Available: Thu, Fri (7pm), Sat\n";
echo "This Friday ({$fridayDate}): LIVE 7pm-11pm\n";

$menuCount = DB::table('tbl_menus')->where('user_id', $chef->id)->where('is_live', 1)->count();
echo "Menu Items: {$menuCount} live\n\n";
