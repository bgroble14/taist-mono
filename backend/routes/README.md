# Routes

This directory contains route definitions for the Taist backend API. Routes map HTTP requests to controller methods.

## Route Files

### api.php
Main API routes for the mobile application (customers and chefs).

**Prefix:** `/api`

**Middleware:** 
- `api` - API middleware group (JSON responses, throttling)
- `auth:api` - API authentication (Laravel Passport)

**Key Route Groups:**

#### Public Routes (No Authentication)
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/password/email` - Request password reset
- `POST /api/password/reset` - Reset password
- `GET /api/app-version` - Check app version

#### Customer Routes (Authenticated)
- `GET /api/chefs` - Browse available chefs
- `GET /api/chefs/{id}` - Chef profile and menu
- `GET /api/chefs/{id}/menu` - Chef's menu items
- `GET /api/chefs/{id}/reviews` - Chef reviews
- `POST /api/orders` - Place new order
- `GET /api/orders` - Customer order history
- `GET /api/orders/{id}` - Order details
- `POST /api/orders/{id}/cancel` - Cancel order
- `POST /api/reviews` - Submit review
- `GET /api/payment-methods` - List payment methods
- `POST /api/payment-methods` - Add payment method

#### Chef Routes (Authenticated)
- `GET /api/chef/profile` - Chef profile
- `PUT /api/chef/profile` - Update chef profile
- `POST /api/chef/menu` - Add menu item
- `PUT /api/chef/menu/{id}` - Update menu item
- `DELETE /api/chef/menu/{id}` - Delete menu item
- `GET /api/chef/orders` - Chef's orders
- `PUT /api/chef/orders/{id}/status` - Update order status
- `POST /api/chef/availability` - Set availability
- `GET /api/chef/earnings` - Earnings summary
- `POST /api/chef/stripe-connect` - Setup Stripe Connect

#### Common Routes (Authenticated)
- `GET /api/profile` - User profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/photo` - Upload profile photo
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `GET /api/conversations` - Message inbox
- `GET /api/conversations/{id}` - Conversation messages
- `POST /api/conversations/{id}/messages` - Send message
- `POST /api/fcm-token` - Register FCM token

### mapi.php
Mobile API routes with additional mobile-specific endpoints.

**Prefix:** `/mapi`

**Purpose:** Mobile-specific features and configurations

**Key Routes:**
- App configuration
- Feature flags
- Force update checking
- Mobile analytics
- Device info logging

### adminapi.php
API routes for admin dashboard operations.

**Prefix:** `/adminapi`

**Middleware:** `auth:admin` - Admin authentication

**Key Routes:**
- `GET /adminapi/dashboard` - Dashboard analytics
- `GET /adminapi/users` - List all users
- `GET /adminapi/users/{id}` - User details
- `PUT /adminapi/users/{id}` - Update user
- `POST /adminapi/users/{id}/approve` - Approve chef
- `POST /adminapi/users/{id}/suspend` - Suspend user
- `GET /adminapi/orders` - All orders
- `GET /adminapi/orders/{id}` - Order details
- `GET /adminapi/analytics` - Platform analytics
- `GET /adminapi/reports` - Generate reports
- `POST /adminapi/notifications/broadcast` - Send broadcast notification

### admin.php
Admin web panel routes (if using server-side rendering).

**Prefix:** `/admin`

**Middleware:** `web`, `auth:admin`

**Key Routes:**
- Admin login/logout
- Dashboard views
- User management views
- Order management views
- Settings pages

### web.php
Web routes for public-facing pages (minimal, mostly redirects to app).

**Prefix:** `/`

**Routes:**
- `GET /` - Landing page or redirect
- `GET /terms` - Terms of service
- `GET /privacy` - Privacy policy
- `GET /password/reset/{token}` - Password reset page

### channels.php
Broadcasting channel authorization for real-time features.

**Channels:**
- `orders.{orderId}` - Order status updates
- `conversations.{conversationId}` - Chat messages
- `notifications.{userId}` - User notifications

### console.php
Artisan console commands (scheduled tasks).

**Commands:**
- Order auto-cancellation for stale orders
- Scheduled payouts
- Notification reminders
- Data cleanup

## Route Naming

Routes use resource naming conventions:
- `index` - List resources
- `show` - Show single resource
- `store` - Create new resource
- `update` - Update existing resource
- `destroy` - Delete resource

## API Versioning

Currently using a single API version. Future versions can be added:
```php
Route::prefix('v2')->group(function () {
    // Version 2 API routes
});
```

## Middleware

### Authentication
- `auth:api` - API token authentication (Passport)
- `auth:admin` - Admin session authentication

### Rate Limiting
```php
Route::middleware('throttle:60,1')->group(function () {
    // 60 requests per minute
});
```

### CORS
Configured in `config/cors.php` to allow mobile app origins.

## API Documentation

Consider using tools like:
- Laravel Passport's built-in token management
- Swagger/OpenAPI for API documentation
- Postman collections for testing

## Testing Routes

```bash
# List all routes
php artisan route:list

# Filter by prefix
php artisan route:list --path=api

# Filter by method
php artisan route:list --method=POST
```

## Best Practices

1. **RESTful Design**: Use proper HTTP methods (GET, POST, PUT, DELETE)
2. **Resource Grouping**: Group related routes together
3. **Middleware**: Apply middleware at group level when possible
4. **Route Names**: Name routes for easy reference in code
5. **Versioning**: Plan for API versioning from the start
6. **Rate Limiting**: Protect against abuse
7. **CORS**: Configure properly for mobile apps
8. **Documentation**: Document all API endpoints

## Security

- All API routes require authentication except public endpoints
- CSRF protection on web routes
- Rate limiting on all routes
- Input validation in controllers/requests
- Authorization checks before data access


