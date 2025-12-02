# Backend App Directory

This directory contains the core application logic for the Taist Laravel backend. It follows Laravel's MVC architecture and includes models, controllers, middleware, and service providers.

## Overview

The Taist backend is built with Laravel 7.x and provides a RESTful API for the mobile application, as well as an admin panel for platform management.

## Directory Structure

```
app/
├── Console/                 # Artisan commands and kernel
│   └── Kernel.php           # Console command scheduler
├── Exceptions/              # Exception handling
│   └── Handler.php          # Global exception handler
├── Helpers/                 # Helper functions
│   └── AppHelper.php        # Application-wide helper functions
├── Http/                    # HTTP layer
│   ├── Controllers/         # Request handlers
│   ├── Middleware/          # Request/response middleware
│   └── Kernel.php           # HTTP kernel configuration
├── Listener.php             # Event listener
├── Models/                  # Eloquent ORM models
├── Notification.php         # Notification handler
└── Providers/               # Service providers
    ├── AppServiceProvider.php
    ├── AuthServiceProvider.php
    ├── BroadcastServiceProvider.php
    ├── EventServiceProvider.php
    └── RouteServiceProvider.php
```

## Key Components

### Models (`Models/`)

Eloquent ORM models representing database tables. Each model handles:
- Database interactions
- Relationships between tables
- Attribute casting and mutation
- Model events and observers

**Key Models:**
- **Users** - Customers, chefs, and admins (polymorphic)
- **Menus** - Chef menu items
- **Orders** - Customer orders
- **Transactions** - Payment records
- **Reviews** - Customer ratings and reviews
- **Conversations** - Chat messages
- **Notifications** - Push notifications

See [Models/README.md](./Models/README.md) for detailed documentation.

### Controllers (`Http/Controllers/`)

Controllers handle HTTP requests and return responses. Organized by functionality:

#### API Controllers
- **ApiController** - Main mobile API endpoints
- **MapiController** - Mobile-specific API features
- **API/NotificationController** - Notification management

#### Admin Controllers
- **Admin/AdminController** - Admin panel operations
- **Admin/LoginController** - Admin authentication
- **AdminapiController** - Admin API endpoints

See [Http/Controllers/README.md](./Http/Controllers/README.md) for detailed documentation.

### Middleware (`Http/Middleware/`)

Middleware processes requests before they reach controllers:

- **Authenticate.php** - Authentication checks
- **TrustProxies.php** - Proxy configuration
- **VerifyCsrfToken.php** - CSRF protection
- **TrimStrings.php** - Input sanitization
- **RedirectIfAuthenticated.php** - Guest-only routes
- **CheckForMaintenanceMode.php** - Maintenance mode

Custom middleware can be added for:
- Role-based authorization
- API rate limiting
- Request logging
- Custom validation

### Service Providers (`Providers/`)

Service providers bootstrap application services:

#### AppServiceProvider
- Application-wide service bindings
- Singleton registrations
- Global configurations

#### AuthServiceProvider
- Authentication policies
- Authorization gates
- Passport token configuration

#### RouteServiceProvider
- Route model bindings
- Route group configurations
- Route caching

#### EventServiceProvider
- Event listener mappings
- Observer registrations

#### BroadcastServiceProvider
- Broadcasting channel authorization
- Pusher configuration

### Console (`Console/`)

Console commands and task scheduling:

#### Kernel.php
Defines scheduled tasks:
- Automated order cancellation for abandoned orders
- Daily earnings calculations
- Notification reminders
- Database cleanup
- Report generation

**Example Scheduled Tasks:**
```php
// Cancel orders pending for > 15 minutes
$schedule->command('orders:cancel-pending')->everyFifteenMinutes();

// Calculate daily earnings for chefs
$schedule->command('earnings:calculate')->daily();

// Send order reminders
$schedule->command('notifications:order-reminders')->hourly();
```

### Helpers (`Helpers/`)

#### AppHelper.php
Global helper functions used throughout the application:
- Response formatting
- Date/time utilities
- String manipulation
- Price calculations
- Distance calculations
- Notification formatting

**Usage:**
```php
use App\Helpers\AppHelper;

// Format currency
$price = AppHelper::formatCurrency(25.50); // "$25.50"

// Calculate distance
$distance = AppHelper::calculateDistance($lat1, $lng1, $lat2, $lng2);

// Standard API response
return AppHelper::successResponse($data, 'Success message');
```

### Exceptions (`Exceptions/`)

#### Handler.php
Global exception handling:
- API error responses
- Logging configuration
- HTTP exception mapping
- Custom exception rendering

Handles:
- ModelNotFoundException → 404 JSON response
- ValidationException → 422 JSON response
- AuthenticationException → 401 JSON response
- AuthorizationException → 403 JSON response
- General exceptions → 500 JSON response with logging

## Architecture Patterns

### MVC (Model-View-Controller)
- **Models**: Data layer and business logic
- **Controllers**: Request handling and orchestration
- **Views**: API responses (JSON) and admin panel views

### Repository Pattern (Partial)
Some controllers use repository classes to abstract database queries:
```php
// Controller
$orders = $this->orderRepository->getCustomerOrders($customerId);

// Repository
class OrderRepository {
    public function getCustomerOrders($customerId) {
        return Orders::where('customer_id', $customerId)
            ->with(['chef', 'items'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
```

### Service Layer
Complex business logic is extracted to service classes:
```php
// OrderService
class OrderService {
    public function createOrder($customer, $chef, $items, $paymentMethod) {
        // Multi-step order creation
        // Payment processing
        // Notification sending
        // Return order
    }
}
```

## API Authentication

The backend uses **Laravel Passport** for API authentication:

### Token Generation
```php
// Login
$token = $user->createToken('mobile-app')->accessToken;
return response()->json([
    'access_token' => $token,
    'user' => $user
]);
```

### Protected Routes
```php
Route::middleware('auth:api')->group(function () {
    Route::get('/profile', 'ApiController@getProfile');
});
```

### Token Validation
Tokens are validated on each request. Expired tokens return 401 Unauthorized.

## External Services Integration

### Stripe
Payment processing and chef payouts:
- Customer payments
- Stripe Connect for chef accounts
- Webhook handling for payment events
- Refunds and disputes

### Firebase Cloud Messaging
Push notifications:
- Token storage
- Notification delivery
- Topic subscriptions
- Notification analytics

### Twilio
SMS notifications:
- Order confirmations
- Status updates
- Verification codes
- Support alerts

### SendGrid
Email notifications:
- Welcome emails
- Password resets
- Order confirmations
- Weekly summaries

### Google Maps API
Location services:
- Geocoding addresses
- Distance calculations
- Place autocomplete

## Database Interactions

### Query Building
```php
// Eloquent queries
$chefs = User::where('user_type', 'chef')
    ->where('is_active', true)
    ->with(['menus', 'reviews'])
    ->orderBy('rating', 'desc')
    ->paginate(20);
```

### Transactions
```php
DB::beginTransaction();
try {
    $order = Orders::create($orderData);
    $transaction = Transactions::create($transactionData);
    // Send notifications
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

### Eager Loading
Prevent N+1 queries by eager loading relationships:
```php
$orders = Orders::with([
    'customer',
    'chef',
    'items.menu',
    'transaction'
])->get();
```

## Event System

Laravel events for decoupled architecture:

### Defining Events
```php
// OrderCreated event
event(new OrderCreated($order));
```

### Event Listeners
```php
// Registered in EventServiceProvider
protected $listen = [
    OrderCreated::class => [
        SendOrderNotification::class,
        UpdateChefStats::class,
    ],
];
```

## Error Handling

### API Error Responses
```php
try {
    $order = Orders::findOrFail($orderId);
} catch (ModelNotFoundException $e) {
    return response()->json([
        'success' => false,
        'error' => 'Order not found'
    ], 404);
}
```

### Logging
```php
Log::info('Order created', ['order_id' => $order->id]);
Log::error('Payment failed', ['error' => $e->getMessage()]);
```

## Validation

Input validation using Laravel's validator:

```php
$validated = $request->validate([
    'chef_id' => 'required|exists:users,id',
    'items' => 'required|array|min:1',
    'items.*.menu_id' => 'required|exists:menus,id',
    'items.*.quantity' => 'required|integer|min:1',
    'delivery_date' => 'required|date|after:today',
    'payment_method_id' => 'required|string'
]);
```

## Security

- **SQL Injection**: Protected by Eloquent ORM
- **XSS**: Output escaping in views
- **CSRF**: Token validation on state-changing requests
- **Authentication**: Passport token-based auth
- **Authorization**: Gates and policies
- **Rate Limiting**: Throttle middleware
- **Encryption**: Laravel's built-in encryption
- **Password Hashing**: Bcrypt hashing

## Testing

### Unit Tests
Test individual methods and classes:
```php
public function testCalculateOrderTotal() {
    $order = factory(Orders::class)->create();
    $total = $order->calculateTotal();
    $this->assertEquals(45.99, $total);
}
```

### Feature Tests
Test complete features and API endpoints:
```php
public function testCustomerCanPlaceOrder() {
    $response = $this->actingAs($customer, 'api')
        ->postJson('/api/orders', $orderData);
    
    $response->assertStatus(201)
        ->assertJsonStructure(['success', 'data', 'message']);
}
```

## Performance Optimization

- **Query Optimization**: Eager loading, indexes
- **Caching**: Redis for sessions and cache
- **Queue Jobs**: Background processing for emails and notifications
- **Database Indexing**: Optimized queries
- **API Response Caching**: Cache frequently accessed data

## Documentation

Detailed documentation for each component:
- [Models Documentation](./Models/README.md)
- [Controllers Documentation](./Http/Controllers/README.md)
- [Database Schema](../database/README.md)
- [Routes Documentation](../routes/README.md)

## Best Practices

1. Keep controllers thin, move logic to services
2. Use form requests for validation
3. Implement repository pattern for complex queries
4. Use events for decoupled architecture
5. Write tests for critical business logic
6. Document complex methods with PHPDoc
7. Follow PSR coding standards
8. Use type hints and return types



