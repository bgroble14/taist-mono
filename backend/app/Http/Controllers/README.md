# Laravel Controllers

This directory contains HTTP controllers that handle incoming requests and return responses for the Taist backend API.

## Overview

Controllers follow Laravel's MVC pattern and are organized by functionality and user role. Each controller is responsible for processing HTTP requests, validating input, calling business logic, and returning JSON responses.

## Controller Organization

### API Controllers

#### ApiController
Main API controller for mobile app endpoints.

**Responsibilities:**
- User authentication (login, register, password reset)
- Chef operations (profile, menu management, orders)
- Customer operations (browse chefs, place orders, reviews)
- Common endpoints (notifications, chat, profile)

**Key Methods:**
- User registration and authentication
- Chef list with filtering (location, cuisine, rating)
- Menu item CRUD
- Order placement and management
- Review submission
- Profile updates

#### API/NotificationController
Handles push notifications and notification management.

**Responsibilities:**
- Send push notifications (FCM)
- Fetch user notifications
- Mark notifications as read
- Notification preferences
- Device token management

### Admin Controllers

#### Admin/AdminController
Main admin panel controller.

**Responsibilities:**
- Dashboard analytics
- User management (customers, chefs)
- Order oversight
- Content management
- System settings
- Reports and exports

**Key Methods:**
- List and manage users
- Approve/reject chef applications
- View and manage all orders
- Platform analytics
- Support ticket management
- Configuration updates

#### Admin/LoginController
Admin authentication controller.

**Responsibilities:**
- Admin login
- Admin logout
- Admin session management
- Admin password reset

#### AdminapiController
API endpoints for admin panel operations.

**Responsibilities:**
- RESTful API for admin SPA/dashboard
- Data exports
- Bulk operations
- Analytics data

### Mobile API Controllers

#### MapiController
Mobile API controller with additional mobile-specific endpoints.

**Responsibilities:**
- App version checking
- Force update logic
- Mobile-specific configurations
- Feature flags
- Maintenance mode

## Controller Structure

### Base Controller
All controllers extend Laravel's base `Controller` class which includes middleware and authorization traits.

### Request Flow
1. **Route**: Request hits a route defined in `/routes/`
2. **Middleware**: Request passes through middleware (auth, validation)
3. **Controller**: Controller method processes request
4. **Business Logic**: Controller calls services/models as needed
5. **Response**: Controller returns JSON response

### Response Format

All API responses follow a consistent format:

**Success Response:**
```php
return response()->json([
    'success' => true,
    'data' => $data,
    'message' => 'Operation successful'
], 200);
```

**Error Response:**
```php
return response()->json([
    'success' => false,
    'error' => 'Error message',
    'errors' => $validationErrors // Optional validation errors
], 400);
```

## Common Controller Patterns

### Authentication
```php
// Get authenticated user
$user = auth()->user();
$userId = auth()->id();

// Check user type
if ($user->user_type === 'chef') {
    // Chef-specific logic
}
```

### Validation
```php
$validated = $request->validate([
    'email' => 'required|email',
    'password' => 'required|min:8'
]);
```

### Eloquent Queries
```php
// Fetch with relationships
$order = Orders::with(['customer', 'chef', 'items'])
    ->findOrFail($orderId);

// Filtering
$chefs = User::where('user_type', 'chef')
    ->where('is_active', true)
    ->get();
```

### Pagination
```php
$orders = Orders::where('customer_id', $userId)
    ->orderBy('created_at', 'desc')
    ->paginate(20);
```

## API Endpoints

Controllers serve RESTful API endpoints:

### Customer Endpoints
- `GET /api/chefs` - List available chefs
- `GET /api/chefs/{id}` - Chef details
- `POST /api/orders` - Place order
- `GET /api/orders` - Customer order history
- `POST /api/reviews` - Submit review

### Chef Endpoints
- `GET /api/chef/orders` - Chef's orders
- `PUT /api/chef/orders/{id}` - Update order status
- `POST /api/chef/menu` - Add menu item
- `PUT /api/chef/menu/{id}` - Update menu item
- `POST /api/chef/availability` - Set availability

### Common Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/notifications` - Get notifications
- `POST /api/messages` - Send message

## Middleware

Controllers use middleware for:
- **auth:api** - API authentication (Passport)
- **throttle** - Rate limiting
- **verified** - Email verification
- Custom middleware for role-based access

## Error Handling

Controllers leverage Laravel's exception handling:
- ModelNotFoundException → 404 response
- ValidationException → 422 response
- AuthenticationException → 401 response
- AuthorizationException → 403 response

## Testing

Controllers should have corresponding feature tests in `/tests/Feature/`.

## Best Practices

1. **Keep Controllers Thin**: Move business logic to services
2. **Use Form Requests**: Extract validation to request classes
3. **Resource Classes**: Use API resources for response transformation
4. **Authorization**: Check permissions before operations
5. **Transaction Wrapping**: Use DB transactions for multi-step operations
6. **Consistent Responses**: Follow standard response format
7. **Error Handling**: Return appropriate HTTP status codes
8. **Documentation**: Document all API endpoints (consider Swagger/OpenAPI)

## Security

- Validate all inputs
- Use parameter binding to prevent SQL injection
- Implement rate limiting
- Check authorization before data access
- Sanitize output
- Use HTTPS in production
- Protect against CSRF (handled by middleware)


