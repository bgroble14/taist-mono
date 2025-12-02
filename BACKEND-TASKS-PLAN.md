# Backend-Only Tasks - Detailed Implementation Plan

This document contains detailed implementation plans for all incomplete backend-only tasks from Sprint 1.

---

## TMA-002: Only Require Phone Number + Email When Signing Up as a Customer
**Status:** Not Started  
**Complexity:** 🟢 Simple

### Overview
Simplify customer registration by only requiring email and phone number instead of the full form with name, address, etc.

### Current State
**File:** `backend/app/Http/Controllers/MapiController.php`  
**Lines:** 276-321 (register function)

**Current validation:**
```php
// Lines 282-285
$validator = Validator::make($request->all(), [
    'email' => 'required|email|unique:tbl_users',
    'password' => 'required',
]);
```

**Current user creation saves many optional fields:**
- first_name, last_name (lines 305-306)
- phone (line 307)
- birthday, address, city, state, zip (lines 308-312)
- user_type, is_pending, verified (lines 313-315)

### Changes Needed

#### 1. Update Validation Rules
Only require email, password, and phone:

```php
// Line 282-285 - Update to:
$validator = Validator::make($request->all(), [
    'email' => 'required|email|unique:tbl_users',
    'password' => 'required',
    'phone' => 'required', // Add phone as required
]);
```

#### 2. Update User Creation Logic
Keep the optional fields but ensure phone is set:

```php
// Lines 304-317 - Already handles this well with isset()
// Just ensure phone is included in the initial create if provided
$api_token = $this->_generateToken();
$user = Listener::create([
    'email' => $request->email, 
    'password' => $request->password, 
    'phone' => $request->phone, // Ensure phone is captured
    'api_token' => $api_token
]);
```

### Implementation Steps
1. Update validation to require phone
2. Test registration with minimal fields
3. Ensure phone is captured during registration
4. Update frontend to only send required fields

### Testing
- Register with only email, password, phone
- Verify user can log in and use the app
- Ensure other fields can be added later in profile

---

## TMA-007: Coupon Code Functionality
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
Implement coupon/promo code system that allows customers to apply discounts to their orders.

### Current State
- Stripe has built-in coupon and promotion code support
- No existing coupon logic in the application
- Needs database table for tracking coupon usage
- Needs API endpoints for validation and application

### Database Schema

#### Create Migration: `create_coupons_table.php`
```php
Schema::create('tbl_coupons', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique(); // User-facing code
    $table->string('stripe_coupon_id')->nullable(); // Stripe coupon ID
    $table->string('stripe_promo_code_id')->nullable(); // Stripe promo code ID
    $table->enum('discount_type', ['percentage', 'fixed']); // percentage or fixed
    $table->decimal('discount_value', 10, 2); // 20 for 20% or 5.00 for $5
    $table->integer('max_uses')->nullable(); // null = unlimited
    $table->integer('times_used')->default(0);
    $table->timestamp('expires_at')->nullable();
    $table->boolean('active')->default(true);
    $table->boolean('first_order_only')->default(false);
    $table->decimal('minimum_order_amount', 10, 2)->nullable();
    $table->timestamps();
});

// Track which users used which coupons
Schema::create('tbl_coupon_usage', function (Blueprint $table) {
    $table->id();
    $table->foreignId('coupon_id')->constrained('tbl_coupons');
    $table->foreignId('user_id')->constrained('tbl_users');
    $table->foreignId('order_id')->constrained('tbl_orders');
    $table->decimal('discount_amount', 10, 2);
    $table->timestamps();
    
    $table->index(['coupon_id', 'user_id']);
});
```

### Model Creation

#### Create Model: `backend/app/Models/Coupons.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupons extends Model
{
    protected $table = 'tbl_coupons';
    protected $guarded = ['id'];
    
    protected $casts = [
        'expires_at' => 'datetime',
        'active' => 'boolean',
        'first_order_only' => 'boolean',
    ];
    
    public function usage()
    {
        return $this->hasMany(CouponUsage::class, 'coupon_id');
    }
    
    public function isValid()
    {
        if (!$this->active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses && $this->times_used >= $this->max_uses) return false;
        return true;
    }
    
    public function canBeUsedBy($userId, $orderTotal)
    {
        if (!$this->isValid()) return false;
        
        // Check minimum order amount
        if ($this->minimum_order_amount && $orderTotal < $this->minimum_order_amount) {
            return false;
        }
        
        // Check first order only restriction
        if ($this->first_order_only) {
            $orderCount = app(Orders::class)
                ->where('customer_user_id', $userId)
                ->where('status', '!=', 6) // Exclude cancelled
                ->count();
            if ($orderCount > 0) return false;
        }
        
        return true;
    }
    
    public function calculateDiscount($orderTotal)
    {
        if ($this->discount_type === 'percentage') {
            return ($orderTotal * $this->discount_value) / 100;
        }
        return min($this->discount_value, $orderTotal);
    }
}
```

#### Create Model: `backend/app/Models/CouponUsage.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponUsage extends Model
{
    protected $table = 'tbl_coupon_usage';
    protected $guarded = ['id'];
    
    public function coupon()
    {
        return $this->belongsTo(Coupons::class, 'coupon_id');
    }
    
    public function user()
    {
        return $this->belongsTo(Listener::class, 'user_id');
    }
    
    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }
}
```

### API Endpoints

Add to `backend/app/Http/Controllers/MapiController.php`:

```php
// Validate coupon code
public function validateCoupon(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied. Api key is not valid."]);
    
    $user = $this->_authUser();
    $code = strtoupper($request->code);
    $orderTotal = $request->order_total;
    
    $coupon = app(Coupons::class)->where('code', $code)->first();
    
    if (!$coupon) {
        return response()->json(['success' => 0, 'error' => 'Invalid coupon code']);
    }
    
    if (!$coupon->isValid()) {
        return response()->json(['success' => 0, 'error' => 'This coupon has expired or is no longer available']);
    }
    
    if (!$coupon->canBeUsedBy($user->id, $orderTotal)) {
        if ($coupon->minimum_order_amount && $orderTotal < $coupon->minimum_order_amount) {
            return response()->json(['success' => 0, 'error' => "Minimum order amount of $" . $coupon->minimum_order_amount . " required"]);
        }
        if ($coupon->first_order_only) {
            return response()->json(['success' => 0, 'error' => 'This coupon is only valid for first orders']);
        }
        return response()->json(['success' => 0, 'error' => 'You are not eligible to use this coupon']);
    }
    
    $discountAmount = $coupon->calculateDiscount($orderTotal);
    
    return response()->json([
        'success' => 1, 
        'data' => [
            'coupon_id' => $coupon->id,
            'code' => $coupon->code,
            'discount_type' => $coupon->discount_type,
            'discount_value' => $coupon->discount_value,
            'discount_amount' => $discountAmount,
            'new_total' => max(0, $orderTotal - $discountAmount)
        ]
    ]);
}

// Apply coupon to order
public function applyCoupon(Request $request, $orderId)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied. Api key is not valid."]);
    
    $user = $this->_authUser();
    $couponId = $request->coupon_id;
    
    $order = app(Orders::class)->find($orderId);
    if (!$order || $order->customer_user_id != $user->id) {
        return response()->json(['success' => 0, 'error' => 'Order not found']);
    }
    
    $coupon = app(Coupons::class)->find($couponId);
    if (!$coupon) {
        return response()->json(['success' => 0, 'error' => 'Invalid coupon']);
    }
    
    $discountAmount = $coupon->calculateDiscount($order->total_price);
    $newTotal = max(0, $order->total_price - $discountAmount);
    
    // Update order
    $order->update([
        'coupon_id' => $coupon->id,
        'discount_amount' => $discountAmount,
        'total_price' => $newTotal
    ]);
    
    // Record usage
    app(CouponUsage::class)->create([
        'coupon_id' => $coupon->id,
        'user_id' => $user->id,
        'order_id' => $order->id,
        'discount_amount' => $discountAmount
    ]);
    
    // Increment usage count
    $coupon->increment('times_used');
    
    return response()->json(['success' => 1, 'data' => $order]);
}
```

### Update Orders Table
Add columns to track coupon usage:
```php
// Migration
Schema::table('tbl_orders', function (Blueprint $table) {
    $table->foreignId('coupon_id')->nullable()->constrained('tbl_coupons');
    $table->decimal('discount_amount', 10, 2)->default(0);
});
```

### Routes
Add to `backend/routes/mapi.php`:
```php
Route::post('/validate-coupon', [MapiController::class, 'validateCoupon']);
Route::post('/apply-coupon/{order_id}', [MapiController::class, 'applyCoupon']);
```

### Admin Interface Endpoints
Add CRUD endpoints for admins to manage coupons:
```php
// In AdminapiController.php
public function createCoupon(Request $request);
public function updateCoupon(Request $request, $id);
public function deleteCoupon(Request $request, $id);
public function getCoupons(Request $request);
```

---

## TMA-014: Automatic Reload When New Zip Code is Added by Admin
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
When an admin adds a new zip code to the system, automatically notify/reload the app for users in that area so they can see newly available chefs.

### Current State
- Admin can add zip codes via admin panel
- No notification system for zip code updates
- Users must manually refresh or restart app

### Implementation Approach

#### Option 1: Push Notification (Recommended)
Use FCM push notifications to alert users in or near the new zip code.

**Changes needed:**

1. **Update Admin Zip Code Creation**
   **File:** `backend/app/Http/Controllers/AdminapiController.php`
   
   After creating a new zip code, send push notifications:
   
```php
public function createZipcode(Request $request)
{
    // ... existing zip code creation logic ...
    
    $zipcode = app(Zipcodes::class)->create([
        'zip' => $request->zip,
        'state' => $request->state,
        'city' => $request->city,
        'active' => $request->active ?? 1,
    ]);
    
    // Send notifications to nearby users
    $this->notifyUsersAboutNewZipCode($zipcode);
    
    return response()->json(['success' => 1, 'data' => $zipcode]);
}

private function notifyUsersAboutNewZipCode($zipcode)
{
    // Get users in same state or nearby zip codes
    $nearbyUsers = app(Listener::class)
        ->where('user_type', 1) // Customers only
        ->where('state', $zipcode->state)
        ->whereNotNull('fcm_token')
        ->get();
    
    $notification = app(NotificationTemplates::class)->where(['id' => 21])->first();
    
    foreach ($nearbyUsers as $user) {
        try {
            $message = "Great news! Taist is now available in {$zipcode->city}, {$zipcode->state}!";
            $this->notification($user->fcm_token, "New Area Available", $message, $zipcode->id, 'user');
            
            Notification::create([
                'title' => 'New Area Available',
                'body' => $message,
                'image' => 'N/A',
                'fcm_token' => $user->fcm_token,
                'user_id' => $user->id,
                'navigation_id' => 0,
                'role' => 'user',
            ]);
        } catch (FirebaseException $e) {
            Log::error('Failed to send zip code notification: ' . $e->getMessage());
        }
    }
}
```

2. **Add Notification Template**
   Create a new notification template in the database:
   ```sql
   INSERT INTO tbl_notification_templates (id, template_name, subject, push, created_at, updated_at)
   VALUES (21, 'New Zip Code Available', 'New Area Available', 'Great news! Taist is now available in your area!', NOW(), NOW());
   ```

#### Option 2: Polling Approach
If push notifications are not reliable, implement a polling mechanism:

```php
// Add endpoint to check for service area updates
public function checkServiceArea(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied. Api key is not valid."]);
    
    $user = $this->_authUser();
    $lastCheck = $request->last_check ?? now()->subDays(7);
    
    // Check if user's zip is now active
    $zipcode = app(Zipcodes::class)
        ->where('zip', $user->zip)
        ->where('active', 1)
        ->where('updated_at', '>', $lastCheck)
        ->first();
    
    if ($zipcode) {
        return response()->json(['success' => 1, 'area_updated' => true, 'data' => $zipcode]);
    }
    
    return response()->json(['success' => 1, 'area_updated' => false]);
}
```

### Frontend Integration
- Listen for FCM notifications with type "zip_code_update"
- When received, trigger a refresh of the chef list
- Show a toast/alert: "New chefs now available in your area!"

---

## TMA-016: Time Window for Chef Accepting Order and Stripe Logic for Full Refund
**Status:** Not Started  
**Complexity:** 🔴 Complex

### Overview
Implement a time window (e.g., 1 hour) for chefs to accept orders. If the chef doesn't accept within the window, automatically refund the customer and cancel the order.

### Current State
- Orders are created with status = 1 (pending)
- No automatic timeout logic
- Manual refund process exists
- Stripe integration is in place

### Implementation Strategy

#### 1. Add Time Window Columns to Orders
**Migration:**
```php
Schema::table('tbl_orders', function (Blueprint $table) {
    $table->timestamp('acceptance_deadline')->nullable()->after('order_date');
    $table->boolean('auto_cancelled')->default(false);
    $table->string('refund_id')->nullable(); // Store Stripe refund ID
});
```

#### 2. Set Acceptance Deadline on Order Creation
**File:** `backend/app/Http/Controllers/MapiController.php`  
**Function:** `createOrder` (around line 1165)

```php
public function createOrder(Request $request)
{
    // ... existing code ...
    
    $acceptanceWindow = 60; // 60 minutes - make this configurable
    
    $data = app(Orders::class)->insertGetId([
        'chef_user_id' => $request->chef_user_id,
        'menu_id' => $request->menu_id,
        'customer_user_id' => $user->id,
        'amount' => $request->amount,
        'total_price' => $request->total_price,
        'addons' => $request->addons,
        'address' => $request->address,
        'order_date' => $request->order_date,
        'status' => 1, // Pending
        'notes' => $request->notes,
        'acceptance_deadline' => now()->addMinutes($acceptanceWindow),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    // ... rest of existing code ...
}
```

#### 3. Create Queue Job for Order Timeout
**Create:** `backend/app/Jobs/CheckOrderAcceptanceTimeout.php`

```php
<?php

namespace App\Jobs;

use App\Models\Orders;
use App\Models\Listener;
use App\Models\NotificationTemplates;
use App\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Log;

class CheckOrderAcceptanceTimeout implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        // Find orders that are pending and past their deadline
        $expiredOrders = app(Orders::class)
            ->where('status', 1) // Pending
            ->where('acceptance_deadline', '<', now())
            ->where('auto_cancelled', false)
            ->get();
        
        foreach ($expiredOrders as $order) {
            $this->processExpiredOrder($order);
        }
    }
    
    private function processExpiredOrder($order)
    {
        try {
            // Process Stripe refund
            $refundId = $this->processStripeRefund($order);
            
            // Update order status
            $order->update([
                'status' => 6, // Cancelled
                'auto_cancelled' => true,
                'refund_id' => $refundId,
                'updated_at' => now(),
            ]);
            
            // Notify customer
            $this->notifyCustomer($order);
            
            Log::info("Order {$order->id} auto-cancelled and refunded");
            
        } catch (\Exception $e) {
            Log::error("Failed to process expired order {$order->id}: " . $e->getMessage());
        }
    }
    
    private function processStripeRefund($order)
    {
        include $_SERVER['DOCUMENT_ROOT'] . '/include/config.php';
        require_once('../stripe-php/init.php');
        $stripe = new \Stripe\StripeClient($stripe_key);
        
        // Find the payment intent for this order
        $transaction = app(Transactions::class)
            ->where('order_id', $order->id)
            ->first();
        
        if (!$transaction || !$transaction->payment_intent_id) {
            throw new \Exception("No transaction found for order");
        }
        
        // Create full refund
        $refund = $stripe->refunds->create([
            'payment_intent' => $transaction->payment_intent_id,
            'reason' => 'requested_by_customer',
            'metadata' => [
                'reason' => 'Chef did not accept within time window',
                'order_id' => $order->id
            ]
        ]);
        
        return $refund->id;
    }
    
    private function notifyCustomer($order)
    {
        $customer = app(Listener::class)->find($order->customer_user_id);
        
        if ($customer && $customer->fcm_token) {
            $notification = app(NotificationTemplates::class)->where(['id' => 22])->first();
            $message = "Your order has been cancelled and refunded because the chef was unable to accept it.";
            
            try {
                $this->notification($customer->fcm_token, "Order Cancelled", $message, $order->id, 'user');
                
                Notification::create([
                    'title' => 'Order Cancelled',
                    'body' => $message,
                    'image' => $customer->photo ?? 'N/A',
                    'fcm_token' => $customer->fcm_token,
                    'user_id' => $customer->id,
                    'navigation_id' => $order->id,
                    'role' => 'user',
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send cancellation notification: ' . $e->getMessage());
            }
        }
    }
}
```

#### 4. Schedule the Job
**File:** `backend/app/Console/Kernel.php`

```php
protected function schedule(Schedule $schedule)
{
    // Check for expired orders every 5 minutes
    $schedule->job(new \App\Jobs\CheckOrderAcceptanceTimeout)
             ->everyFiveMinutes()
             ->name('check-order-acceptance-timeout')
             ->withoutOverlapping();
}
```

#### 5. Update Order Acceptance Logic
When chef accepts order, verify it's within the window:

```php
// In updateOrderStatus function
public function updateOrderStatus(Request $request, $id = "")
{
    $order = app(Orders::class)->find($id);
    
    // If chef is accepting (status = 2)
    if ($request->status == 2) {
        // Check if still within acceptance window
        if ($order->acceptance_deadline && now()->gt($order->acceptance_deadline)) {
            return response()->json([
                'success' => 0, 
                'error' => 'This order can no longer be accepted as the time window has expired'
            ]);
        }
    }
    
    // ... rest of existing logic ...
}
```

#### 6. Configuration
Make time window configurable:
```php
// config/app.php
'order_acceptance_window' => env('ORDER_ACCEPTANCE_WINDOW', 60), // minutes
```

### Testing Scenarios
1. Create order and wait for deadline to pass
2. Verify automatic cancellation
3. Verify Stripe refund is processed
4. Verify customer notification is sent
5. Verify chef cannot accept after deadline

---

## TMA-017: Backend Logic to Generate AI-Generated Reviews
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
When a customer submits a review for a chef, use AI to generate additional synthetic reviews to help new chefs build credibility and improve chef profiles.

### Important Considerations
⚠️ **Ethical & Legal Warning:** Generating fake reviews may violate:
- FTC regulations
- Platform terms of service
- Consumer protection laws

**Recommended Alternative:** Instead of fake reviews, consider:
- Highlighting real reviews more prominently
- Using AI to summarize existing reviews
- Generating chef bios based on their actual cooking style
- Creating sample menus with AI assistance

### Implementation (If Still Desired)

#### 1. Add AI Service Integration
Use OpenAI API or similar service.

**Create:** `backend/app/Services/AIReviewService.php`

```php
<?php

namespace App\Services;

use GuzzleHttp\Client;
use Log;

class AIReviewService
{
    private $apiKey;
    private $client;
    
    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
        $this->client = new Client();
    }
    
    public function generateReview($chef, $existingReview)
    {
        $prompt = $this->buildPrompt($chef, $existingReview);
        
        try {
            $response = $this->client->post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a food critic writing authentic-sounding restaurant reviews.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'temperature' => 0.9, // Higher randomness for variety
                    'max_tokens' => 200,
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            return $data['choices'][0]['message']['content'] ?? null;
            
        } catch (\Exception $e) {
            Log::error('AI Review Generation Failed: ' . $e->getMessage());
            return null;
        }
    }
    
    private function buildPrompt($chef, $existingReview)
    {
        return "Generate a unique, authentic-sounding review for a home chef named {$chef->first_name}. " .
               "Their cooking style is: {$chef->cuisine_type}. " .
               "Here's a real review to base the style on: '{$existingReview->review}'. " .
               "Generate a DIFFERENT review that sounds natural and specific. " .
               "Include specific food details. Keep it under 100 words.";
    }
    
    public function generateRating($existingRating)
    {
        // Generate rating close to existing one
        $variance = 0.5;
        $newRating = $existingRating + (rand(-10, 10) / 20); // ±0.5 variance
        return max(3.0, min(5.0, round($newRating * 2) / 2)); // Keep between 3-5, round to 0.5
    }
}
```

#### 2. Update Review Creation Logic
**File:** `backend/app/Http/Controllers/MapiController.php`

```php
use App\Services\AIReviewService;

public function createReview(Request $request)
{
    // ... existing review creation code ...
    
    $reviewId = app(Reviews::class)->insertGetId([
        'user_id' => $request->user_id,
        'chef_user_id' => $request->chef_user_id,
        'rating' => $request->rating,
        'review' => $request->review,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    // Generate AI reviews (optional, controlled by feature flag)
    if (env('ENABLE_AI_REVIEWS', false)) {
        $this->generateAIReviews($request->chef_user_id, $reviewId);
    }
    
    return response()->json(['success' => 1, 'data' => ['id' => $reviewId]]);
}

private function generateAIReviews($chefUserId, $baseReviewId)
{
    $aiService = new AIReviewService();
    $chef = app(Listener::class)->find($chefUserId);
    $baseReview = app(Reviews::class)->find($baseReviewId);
    
    // Generate 1-3 additional reviews
    $numberOfReviews = rand(1, 3);
    
    for ($i = 0; $i < $numberOfReviews; $i++) {
        $aiReviewText = $aiService->generateReview($chef, $baseReview);
        $aiRating = $aiService->generateRating($baseReview->rating);
        
        if ($aiReviewText) {
            app(Reviews::class)->insert([
                'user_id' => null, // Or create anonymous user IDs
                'chef_user_id' => $chefUserId,
                'rating' => $aiRating,
                'review' => $aiReviewText,
                'is_ai_generated' => true, // Track that it's AI
                'based_on_review_id' => $baseReviewId,
                'created_at' => now()->subDays(rand(1, 30)), // Random past date
                'updated_at' => now(),
            ]);
        }
        
        sleep(1); // Rate limiting
    }
}
```

#### 3. Database Updates
```php
// Migration
Schema::table('tbl_reviews', function (Blueprint $table) {
    $table->boolean('is_ai_generated')->default(false);
    $table->foreignId('based_on_review_id')->nullable();
});
```

#### 4. Environment Configuration
```
# .env
OPENAI_API_KEY=your_api_key_here
ENABLE_AI_REVIEWS=false
```

### Alternative Implementation: Review Enhancement
Instead of fake reviews, enhance real ones:

```php
public function enhanceReviewWithAI($reviewId)
{
    $review = app(Reviews::class)->find($reviewId);
    
    // Generate helpful insights from the review
    $aiService = new AIReviewService();
    $insights = $aiService->extractInsights($review->review);
    
    // Store as structured data, not fake reviews
    $review->update([
        'highlights' => json_encode($insights['highlights']),
        'mentioned_dishes' => json_encode($insights['dishes']),
        'sentiment_score' => $insights['sentiment'],
    ]);
}
```

---

## TMA-018: Categories (Including Time of Day Filters) Not Functioning
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
Fix the category filtering system and time-of-day filters that are currently not working properly.

### Investigation Needed
Need to determine:
1. What categories exist?
2. How are they stored?
3. Where is the filtering logic?
4. What exactly is broken?

### Current State Analysis

**File:** `backend/app/Http/Controllers/MapiController.php`  
Look for `getChefs` or similar functions that handle filtering.

**Database Tables:**
- `tbl_categories` - Category definitions
- `tbl_menus` - Menu items with category associations
- `tbl_users` - Chef profiles

### Likely Issues

#### 1. Category Query Logic
**Find the chef filtering endpoint and check:**

```php
// Common issue: Category joins not working
public function getChefs(Request $request)
{
    $query = app(Listener::class)
        ->where('user_type', 2) // Chefs
        ->where('verified', 1);
    
    // If category filter is provided
    if ($request->category_id) {
        // This might be the broken part - need to join through menus
        $query->whereHas('menus', function($q) use ($request) {
            $q->where('category_id', $request->category_id);
        });
    }
    
    // Time of day filter
    if ($request->meal_time) {
        $query->whereHas('availabilities', function($q) use ($request) {
            $q->where('meal_time', $request->meal_time);
        });
    }
    
    return response()->json(['success' => 1, 'data' => $query->get()]);
}
```

#### 2. Time of Day Filter
Need to check availabilities table structure:

```php
// Ensure meal_time or time_of_day column exists
public function filterByTimeOfDay($query, $timeOfDay)
{
    // timeOfDay might be: 'breakfast', 'lunch', 'dinner', 'late-night'
    $timeRanges = [
        'breakfast' => ['06:00', '11:00'],
        'lunch' => ['11:00', '15:00'],
        'dinner' => ['17:00', '22:00'],
        'late-night' => ['22:00', '02:00'],
    ];
    
    if (isset($timeRanges[$timeOfDay])) {
        [$start, $end] = $timeRanges[$timeOfDay];
        $query->whereHas('availabilities', function($q) use ($start, $end) {
            $q->where('start_time', '>=', $start)
              ->where('end_time', '<=', $end);
        });
    }
    
    return $query;
}
```

### Implementation Steps
1. **Debug existing queries** - Log what's being executed
2. **Check database relationships** - Ensure proper foreign keys
3. **Fix category filtering** - Update query logic
4. **Fix time filtering** - Implement proper time range logic
5. **Add indexes** - Optimize for performance
6. **Test all filter combinations**

### Testing Required
- Filter by single category
- Filter by time of day
- Combine category + time filters
- Check if results are accurate

---

## TMA-020: Closed Order Status Needs to Update Based on Certain User Actions
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
Automatically update order status to "closed" based on specific user actions or time-based triggers.

### Current Order Status Flow
**File:** `backend/app/Http/Controllers/MapiController.php` - `updateOrderStatus` function

**Current statuses (typical):**
- 1: Pending (waiting for chef acceptance)
- 2: Accepted by chef
- 3: In progress / Cooking
- 4: Ready for pickup/delivery
- 5: Completed
- 6: Cancelled
- 7: Disputed
- 8: Closed (?)

### Triggers for Auto-Closing Orders

#### 1. Time-Based Auto-Close
**Scenario:** Close orders X days after completion

```php
// Create scheduled job
// File: app/Jobs/AutoCloseCompletedOrders.php

<?php

namespace App\Jobs;

use App\Models\Orders;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class AutoCloseCompletedOrders implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function handle()
    {
        $daysUntilClose = 3; // Close 3 days after completion
        
        $ordersToClose = app(Orders::class)
            ->where('status', 5) // Completed
            ->where('updated_at', '<', now()->subDays($daysUntilClose))
            ->get();
        
        foreach ($ordersToClose as $order) {
            $order->update([
                'status' => 8, // Closed
                'closed_at' => now(),
                'auto_closed' => true,
            ]);
        }
    }
}
```

#### 2. Action-Based Auto-Close
**Scenario:** Close when customer marks order as received or leaves a review

```php
// Update createReview function
public function createReview(Request $request)
{
    // ... existing review creation code ...
    
    $reviewId = app(Reviews::class)->insertGetId([...]);
    
    // Auto-close the related order when review is left
    $order = app(Orders::class)
        ->where('customer_user_id', $request->user_id)
        ->where('chef_user_id', $request->chef_user_id)
        ->where('status', 5) // Completed
        ->orderBy('updated_at', 'desc')
        ->first();
    
    if ($order) {
        $order->update([
            'status' => 8, // Closed
            'closed_at' => now(),
            'review_id' => $reviewId,
        ]);
    }
    
    return response()->json(['success' => 1, 'data' => ['id' => $reviewId]]);
}
```

#### 3. Explicit User Action
**Add endpoint for customer to mark order as complete:**

```php
public function markOrderComplete(Request $request, $id)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $user = $this->_authUser();
    
    $order = app(Orders::class)->find($id);
    
    if (!$order || $order->customer_user_id != $user->id) {
        return response()->json(['success' => 0, 'error' => 'Order not found']);
    }
    
    if ($order->status != 5) {
        return response()->json(['success' => 0, 'error' => 'Only completed orders can be marked as closed']);
    }
    
    $order->update([
        'status' => 8, // Closed
        'closed_at' => now(),
        'closed_by_customer' => true,
    ]);
    
    return response()->json(['success' => 1, 'data' => $order]);
}
```

### Database Updates
```php
// Migration
Schema::table('tbl_orders', function (Blueprint $table) {
    $table->timestamp('closed_at')->nullable();
    $table->boolean('auto_closed')->default(false);
    $table->boolean('closed_by_customer')->default(false);
    $table->foreignId('review_id')->nullable();
});
```

### Schedule in Kernel
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->job(new \App\Jobs\AutoCloseCompletedOrders)
             ->daily()
             ->at('03:00');
}
```

---

## Task Ranking: Easiest to Hardest

### 🟢 Level 1: Simple (< 2 hours)
1. **TMA-002** - Only Require Phone + Email for Signup
   - Update validation rules
   - Test registration flow
   - Simple logic change

### 🟡 Level 2: Moderate (2-6 hours)
2. **TMA-020** - Auto-Close Order Status
   - Multiple triggers to implement
   - Database updates needed
   - Scheduled job required
   - Clear logic, moderate scope

3. **TMA-014** - Auto Reload for New Zip Codes
   - Push notification logic
   - Admin endpoint update
   - Straightforward implementation

4. **TMA-018** - Fix Category Filtering
   - Debugging existing code
   - Query optimization
   - May require testing various scenarios

5. **TMA-017** - AI-Generated Reviews
   - External API integration
   - Moderate complexity
   - Ethical considerations
   - Well-defined scope

### 🔴 Level 3: Complex (6-12 hours)
6. **TMA-007** - Coupon Code Functionality
   - New database tables
   - Multiple models
   - CRUD endpoints for admin
   - Validation logic
   - Stripe integration considerations
   - Frontend integration needed

7. **TMA-016** - Order Acceptance Time Window + Auto Refund
   - Complex Stripe refund logic
   - Scheduled job for monitoring
   - Error handling critical
   - Multiple notification triggers
   - Database schema updates
   - Edge cases to handle

---

## Recommended Implementation Order

### Phase 1: Quick Wins (1-2 days)
1. ✅ TMA-002 - Simplify signup (1-2 hours)
2. ✅ TMA-020 - Auto-close orders (3-4 hours)
3. ✅ TMA-014 - New zip notification (2-3 hours)

**Total: ~8 hours**

### Phase 2: Medium Tasks (3-5 days)
4. TMA-018 - Fix category filtering (4-6 hours)
5. TMA-017 - AI reviews (4-6 hours) - Optional/Controversial

**Total: ~8-12 hours**

### Phase 3: Complex Features (1-2 weeks)
6. TMA-007 - Coupon system (8-12 hours)
7. TMA-016 - Order timeout + refunds (10-15 hours)

**Total: ~18-27 hours**

---

## Notes

- **TMA-001** (Twilio notifications) is marked as "In Progress" - not included here
- **TMA-009** (AI for menu page) is "In Progress" and likely frontend+backend
- **TMA-006** (Simplify chef Stripe signup) and **TMA-008** (Chef signup flow) are mixed frontend/backend
- All tasks listed here are primarily backend work
- Most tasks require coordination with frontend for full implementation
- Stripe integration tasks (TMA-007, TMA-016) need careful testing in sandbox mode
- Consider creating feature flags for major new features

---

*Last Updated: December 1, 2025*

