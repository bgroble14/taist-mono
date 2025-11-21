# Laravel Models

This directory contains Eloquent ORM models for the Taist application. Models represent database tables and define relationships, attributes, and business logic.

## Models Overview

### Admins
Admin user accounts with elevated privileges.

**Key Fields:**
- Authentication credentials
- Name and contact info
- Permissions and roles

**Relationships:**
- N/A (isolated from customer/chef models)

### Allergens
Food allergens that can be associated with menu items.

**Key Fields:**
- Name (e.g., "Peanuts", "Dairy", "Gluten")
- Description
- Icon/image

**Relationships:**
- Many-to-many with menu items

### Appliances
Kitchen appliances/equipment used by chefs.

**Key Fields:**
- Name (e.g., "Oven", "Grill", "Sous Vide")
- Description

**Relationships:**
- Many-to-many with chefs

### Availabilities
Chef availability schedules.

**Key Fields:**
- Chef ID
- Day of week
- Start time
- End time
- Is available flag

**Relationships:**
- Belongs to Chef (User)

### Categories
Menu item categories and classifications.

**Key Fields:**
- Name (e.g., "Appetizers", "Entrees", "Desserts")
- Description
- Display order
- Image

**Relationships:**
- Has many menu items

### Conversations
Chat conversations between users.

**Key Fields:**
- Participant user IDs
- Last message
- Last message timestamp
- Unread count

**Relationships:**
- Belongs to Users (customer and chef)
- Has many Messages

### Customizations
Menu item customization options and add-ons.

**Key Fields:**
- Menu item ID
- Name (e.g., "Spice Level", "Extra Cheese")
- Type (dropdown, checkbox, text)
- Options (JSON)
- Additional price
- Required flag

**Relationships:**
- Belongs to Menu Item

### Menus
Menu items offered by chefs.

**Key Fields:**
- Chef ID (User)
- Name
- Description
- Price
- Category ID
- Images
- Preparation time
- Is available flag
- Allergen information

**Relationships:**
- Belongs to Chef (User)
- Belongs to Category
- Has many Customizations
- Many-to-many with Allergens
- Has many Order Items

### NotificationTemplates
Predefined notification message templates.

**Key Fields:**
- Template key/slug
- Title template
- Body template
- Type (email, push, SMS)
- Variables (JSON)

**Relationships:**
- N/A (reference data)

### Orders
Customer orders placed with chefs.

**Key Fields:**
- Order number
- Customer ID (User)
- Chef ID (User)
- Status (pending, accepted, preparing, ready, delivered, cancelled)
- Subtotal
- Fees (service, delivery)
- Tax
- Total amount
- Delivery date/time
- Delivery address
- Special instructions
- Timestamps (placed, accepted, ready, delivered)

**Relationships:**
- Belongs to Customer (User)
- Belongs to Chef (User)
- Has many Order Items
- Has one Transaction

### Reviews
Customer reviews for chefs and orders.

**Key Fields:**
- Order ID
- Customer ID (User)
- Chef ID (User)
- Rating (1-5 stars)
- Review text
- Photos
- Response (chef's response)
- Created at

**Relationships:**
- Belongs to Order
- Belongs to Customer (User)
- Belongs to Chef (User)

### Tickets
Customer support tickets.

**Key Fields:**
- User ID
- Subject
- Description
- Category
- Status (open, in progress, resolved, closed)
- Priority
- Assigned admin ID
- Messages (JSON or related model)

**Relationships:**
- Belongs to User
- Belongs to Admin (assigned)

### Transactions
Payment transactions for orders.

**Key Fields:**
- Order ID
- Stripe payment intent ID
- Amount
- Status (pending, succeeded, failed, refunded)
- Payment method
- Chef payout amount
- Platform fee
- Processing fee
- Created at

**Relationships:**
- Belongs to Order
- Belongs to Customer (User)

### Version
App version tracking for mobile apps.

**Key Fields:**
- Platform (iOS, Android)
- Version number
- Build number
- Is forced update
- Release notes

**Relationships:**
- N/A (configuration data)

### Zipcodes
Supported zip codes and service areas.

**Key Fields:**
- Zip code
- City
- State
- Is active
- Delivery fee
- Tax rate

**Relationships:**
- N/A (reference data)

### PaymentMethodListener
Handles Stripe payment method events and webhooks.

**Key Fields:**
- Event type
- Event data (JSON)
- Processed status
- Created at

**Relationships:**
- N/A (event log)

## Model Conventions

### Eloquent ORM
All models extend Laravel's Eloquent base model and follow Laravel conventions:
- Table names are plural, lowercase
- Primary key is `id` by default
- Timestamps (`created_at`, `updated_at`) managed automatically

### Attributes
Models define:
- `$fillable` - Mass assignable attributes
- `$hidden` - Attributes hidden from JSON
- `$casts` - Type casting for attributes
- `$appends` - Computed attributes added to JSON

### Relationships
Models use Eloquent relationship methods:
- `belongsTo()` - Many-to-one
- `hasMany()` - One-to-many
- `belongsToMany()` - Many-to-many
- `hasOne()` - One-to-one

### Scopes
Models may define query scopes:
- Local scopes for reusable queries
- Global scopes for automatic filtering

## Usage Example

```php
use App\Models\Orders;
use App\Models\Menus;

// Create a new order
$order = Orders::create([
    'customer_id' => $customerId,
    'chef_id' => $chefId,
    'status' => 'pending',
    'total_amount' => 45.99
]);

// Query with relationships
$order = Orders::with(['customer', 'chef', 'items.menu'])
    ->where('status', 'pending')
    ->first();

// Access relationships
$customerName = $order->customer->name;
$chefName = $order->chef->name;

foreach ($order->items as $item) {
    echo $item->menu->name;
}
```

## Database Schema

Models correspond to database tables created via migrations in `/database/migrations/`. Refer to migration files for complete schema definitions.

## Best Practices

1. **Relationships**: Define all relationships in models
2. **Fillable/Guarded**: Protect against mass assignment vulnerabilities
3. **Accessors/Mutators**: Use for attribute transformations
4. **Validation**: Implement validation in form requests, not models
5. **Business Logic**: Keep complex logic in services, not models
6. **Scopes**: Use scopes for reusable queries


