# Chef Screens

This directory contains all screens and components for the chef-facing side of the Taist application.

## Overview

Chef screens enable culinary professionals to manage their business, including menus, orders, earnings, and customer interactions. The chef experience is organized into a tab-based navigation structure.

## Screen Structure

### (tabs) - Main Chef Navigation

#### Home Tab
- **Dashboard**: Overview of today's orders and notifications
- **Settings**: Business settings and preferences
- **Availability Management**: Set working hours and days off

#### Orders Tab
- **Order Queue**: View and accept incoming orders
- **Active Orders**: Manage in-progress orders
- **Order History**: View completed orders
- **Calendar View**: See orders by date

#### Menu Tab
- **Menu Management**: View all menu items
- **Add/Edit Items**: Create and modify menu offerings
- **Categories**: Organize menu items
- **Availability Toggle**: Enable/disable items

#### Earnings Tab
- **Earnings Dashboard**: View total earnings and trends
- **Transaction History**: Detailed earning records
- **Payout Information**: Bank account and payout schedule
- **Analytics**: Earnings charts and insights

#### Profile Tab
- **Chef Profile**: Public-facing chef information
- **Business Hours**: Set regular availability
- **Photos**: Upload chef and food photos
- **Bio**: Chef story and specialties

## Key Screens

### home/
Chef dashboard and main control center.

**Features:**
- Today's order summary
- Quick stats (earnings, ratings, orders)
- Important notifications
- Quick action buttons
- Settings access

**Components:**
- `chefOrderCard.tsx` - Order preview cards
- `settingItem.tsx` - Settings menu items

### orders/
Order management and fulfillment.

**Features:**
- New order notifications
- Accept/decline orders
- Update order status (preparing, ready, delivered)
- View order details and customer info
- Order calendar view

**Components:**
- `chefOrderCard.tsx` - Order cards with actions
- `customCalendar.tsx` - Order calendar view

### orderDetail/
Detailed view and management of a specific order.

**Features:**
- Order items and customizations
- Customer information and contact
- Special instructions and allergies
- Order timeline and status updates
- Mark order stages complete
- Customer communication

### menu/
Menu item management and organization.

**Features:**
- View all menu items
- Add new dishes
- Edit existing items
- Toggle item availability
- Category management
- Photo uploads

### addMenuItem/
Create or edit menu items.

**Features:**
- Item name and description
- Pricing
- Category selection
- Photo upload (multiple images)
- Preparation time
- Allergen information
- Add-on customizations
- Availability settings

### addOnCustomization/
Manage customization options for menu items.

**Features:**
- Create customization groups (e.g., "Spice Level")
- Add customization options (e.g., "Mild", "Medium", "Hot")
- Set additional pricing for add-ons
- Mark options as required or optional

### earnings/
View earnings and financial information.

**Features:**
- Total earnings (lifetime, monthly, weekly)
- Earnings breakdown by order
- Chart visualizations
- Payout schedule
- Transaction history
- Tax information

### setupStrip/ (setupStripe)
Configure Stripe Connect for receiving payments.

**Features:**
- Stripe Connect onboarding
- Bank account setup
- Identity verification
- Payout configuration
- Account status

### profile/
Manage chef's public profile and business settings.

**Features:**
- Chef bio and story
- Profile photos
- Cuisine specialties
- Business hours configuration
- Service areas (zip codes)
- Contact information

**Components:**
- `dayRowComponent.tsx` - Day/hour selector for availability

### onboarding/
New chef onboarding flow.

**Features:**
- Welcome and introduction
- Business information collection
- Menu setup wizard
- Stripe Connect setup
- Profile completion
- Initial availability settings
- How-to guides

### backgroundCheck/
Background check process for new chefs.

**Features:**
- Background check requirements
- Submit information for verification
- Status tracking
- Next steps after approval

### feedback/
View and respond to customer reviews.

**Features:**
- Customer ratings and reviews
- Average rating display
- Respond to reviews
- Review analytics

### howToDo/
Educational resources and guides for chefs.

**Features:**
- How-to articles
- Video tutorials
- Best practices
- FAQ
- Support resources

### cancelApplication/
Process for canceling chef application or deactivating account.

**Features:**
- Cancellation reasons
- Final confirmation
- Data retention information
- Reactivation process

## Data Flow

1. **Onboarding**: New chef completes profile and verification
2. **Menu Setup**: Create menu items and pricing
3. **Availability**: Set business hours and days
4. **Orders**: Receive, accept, and fulfill orders
5. **Communication**: Chat with customers about orders
6. **Earnings**: Track income and request payouts
7. **Growth**: Respond to reviews and optimize menu

## State Management

Chef screens use Redux for:
- Chef profile data
- Active orders state
- Menu items cache
- Earnings data
- Notification state

## API Integration

Screens communicate with the Laravel backend for:
- Menu CRUD operations
- Order management
- Stripe Connect integration
- Earnings calculations
- Profile updates
- Push notifications

## Real-Time Updates

Chef screens use Firebase Cloud Messaging for:
- New order notifications
- Order status updates
- Customer messages
- Payout notifications

## Navigation

All chef screens are nested under the chef layout (`/screens/chef/_layout.tsx`), which handles:
- Chef authentication checks
- Tab navigation setup
- Chef-specific header
- Deep linking for chef routes


