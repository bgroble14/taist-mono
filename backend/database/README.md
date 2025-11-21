# Database

This directory contains database-related files including migrations, seeders, and factories for the Taist backend application.

## Overview

The database structure is built using Laravel's migration system, which provides version control for the database schema. The application uses MySQL/MariaDB as the primary database.

## Directory Structure

### migrations/
Contains database migration files that define the schema.

**Key Migrations:**
- User tables (customers, chefs, admins)
- Menu and category tables
- Order and order item tables
- Transaction and payment tables
- Notification and conversation tables
- Review and rating tables
- Availability and schedule tables
- Allergen and customization tables
- Support and ticket tables
- Configuration tables (versions, zipcodes)

**Recent Migrations:**
- `2024_11_13_124701_create_notifications_table.php` - Notifications system
- `2025_03_26_085235_create_versions_table.php` - App version management

### seeds/
Contains database seeder classes for populating initial or test data.

**DatabaseSeeder.php:**
- Seeds initial admin users
- Seeds reference data (allergens, categories)
- Seeds test data for development

### factories/
Contains model factories for generating fake data for testing.

**UserFactory.php:**
- Generates fake user data for tests
- Creates customers, chefs, and admins
- Used in automated tests and seeding

## Database Schema

### Core Tables

#### users
Main user table for customers, chefs, and platform users.

**Key Columns:**
- `id` - Primary key
- `user_type` - ENUM ('customer', 'chef', 'admin')
- `email` - Unique email address
- `password` - Hashed password
- `name` - Full name
- `phone` - Contact phone number
- `profile_photo` - Profile image URL
- `address_*` - Address fields (street, city, state, zip)
- `latitude`, `longitude` - Geolocation coordinates
- `is_active` - Account status
- `email_verified_at` - Email verification timestamp
- `stripe_customer_id` - Stripe customer reference
- `stripe_connect_id` - Stripe Connect account (chefs only)
- `created_at`, `updated_at` - Timestamps

#### menus
Chef menu items.

**Key Columns:**
- `id` - Primary key
- `chef_id` - Foreign key to users
- `category_id` - Foreign key to categories
- `name` - Item name
- `description` - Item description
- `price` - Base price
- `images` - JSON array of image URLs
- `preparation_time` - Minutes to prepare
- `is_available` - Availability toggle
- `allergen_info` - JSON array of allergen IDs

#### orders
Customer orders.

**Key Columns:**
- `id` - Primary key
- `order_number` - Unique order identifier
- `customer_id` - Foreign key to users
- `chef_id` - Foreign key to users
- `status` - ENUM (pending, accepted, preparing, ready, delivered, cancelled)
- `subtotal` - Item total
- `delivery_fee` - Delivery charge
- `service_fee` - Platform fee
- `tax` - Tax amount
- `total_amount` - Final total
- `delivery_date` - Scheduled delivery date
- `delivery_time` - Scheduled delivery time
- `delivery_address` - Full delivery address
- `special_instructions` - Customer notes
- Various timestamp fields for status changes

#### order_items
Individual items within orders.

**Key Columns:**
- `id` - Primary key
- `order_id` - Foreign key to orders
- `menu_id` - Foreign key to menus
- `quantity` - Item quantity
- `unit_price` - Price per unit
- `customizations` - JSON array of customization data
- `subtotal` - Line item total

#### transactions
Payment transaction records.

**Key Columns:**
- `id` - Primary key
- `order_id` - Foreign key to orders
- `stripe_payment_intent_id` - Stripe reference
- `amount` - Transaction amount
- `status` - Payment status
- `payment_method` - Payment method type
- `chef_payout_amount` - Amount paid to chef
- `platform_fee` - Platform commission
- `created_at`, `updated_at`

#### reviews
Customer reviews for orders and chefs.

**Key Columns:**
- `id` - Primary key
- `order_id` - Foreign key to orders
- `customer_id` - Foreign key to users
- `chef_id` - Foreign key to users
- `rating` - Star rating (1-5)
- `review_text` - Review content
- `photos` - JSON array of review photos
- `chef_response` - Chef's response text
- `created_at`

#### availabilities
Chef availability schedules.

**Key Columns:**
- `id` - Primary key
- `chef_id` - Foreign key to users
- `day_of_week` - Day (0-6, Sun-Sat)
- `start_time` - Opening time
- `end_time` - Closing time
- `is_available` - Availability toggle

#### conversations & messages
Chat messaging system.

**conversations:**
- `id` - Primary key
- `customer_id` - Foreign key to users
- `chef_id` - Foreign key to users
- `last_message` - Last message preview
- `last_message_at` - Timestamp
- `customer_unread_count` - Unread count
- `chef_unread_count` - Unread count

**messages:**
- `id` - Primary key
- `conversation_id` - Foreign key
- `sender_id` - Foreign key to users
- `message` - Message content
- `is_read` - Read status
- `created_at`

#### notifications
Push notification records.

**Key Columns:**
- `id` - Primary key
- `user_id` - Foreign key to users
- `title` - Notification title
- `body` - Notification content
- `data` - JSON data payload
- `type` - Notification category
- `is_read` - Read status
- `created_at`

### Reference Tables

#### categories
Menu item categories (e.g., Appetizers, Entrees, Desserts).

#### allergens
Food allergens (e.g., Peanuts, Dairy, Gluten).

#### zipcodes
Supported service areas with delivery fees and tax rates.

#### versions
Mobile app version management for force updates.

## Running Migrations

```bash
# Run all pending migrations
php artisan migrate

# Rollback last migration batch
php artisan migrate:rollback

# Reset and re-run all migrations
php artisan migrate:fresh

# Run migrations with seeding
php artisan migrate:fresh --seed
```

## Seeding Data

```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=AdminSeeder
```

## Database Configuration

Database connection is configured in:
- `.env` file - Environment-specific settings
- `config/database.php` - Connection configurations

**Required .env Variables:**
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taist
DB_USERNAME=root
DB_PASSWORD=
```

## Indexes and Performance

Tables include indexes on:
- Foreign keys
- Email addresses (unique)
- Status columns (for filtering)
- Timestamps (for sorting)
- Geolocation coordinates (for spatial queries)

## Relationships

Tables are connected through foreign key constraints ensuring referential integrity:
- Users → Orders (as customer or chef)
- Orders → Order Items → Menus
- Users → Reviews (as customer)
- Menus → Reviews (as reviewed item)
- Users → Conversations → Messages

## Backup and Restore

```bash
# Backup database
mysqldump -u username -p taist > backup.sql

# Restore database
mysql -u username -p taist < backup.sql
```

## Best Practices

1. **Always Use Migrations**: Never modify the database directly
2. **Rollback Safety**: Implement `down()` methods in migrations
3. **Foreign Keys**: Define relationships with constraints
4. **Indexes**: Add indexes for frequently queried columns
5. **Soft Deletes**: Use `SoftDeletes` trait for recoverable deletions
6. **Timestamps**: Use `timestamps()` in migrations
7. **Factories**: Create factories for all models
8. **Seeders**: Maintain seeders for reference data


