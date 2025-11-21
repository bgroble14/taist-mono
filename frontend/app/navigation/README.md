# Navigation

This directory contains navigation configuration and routing logic for the Taist mobile application.

## Overview

Taist uses **Expo Router** for file-based navigation, combined with React Navigation for advanced navigation patterns. The app has three main user flows: Customer, Chef, and Common (shared screens).

## Navigation Structure

### File-Based Routing
Expo Router automatically generates routes based on the file structure in `/app/screens/`:

```
screens/
├── common/          # Shared screens (auth, notifications, etc.)
├── customer/        # Customer-specific screens
│   └── (tabs)/      # Customer tab navigation
└── chef/            # Chef-specific screens
    └── (tabs)/      # Chef tab navigation
```

### Navigation Stacks

#### Customer Stack
- **Home Tab**: Browse chefs, view menus, add items to cart
- **Orders Tab**: View order history and track active orders  
- **Account Tab**: Profile settings and preferences

#### Chef Stack
- **Home Tab**: Dashboard, settings, availability
- **Orders Tab**: Manage incoming and active orders
- **Menu Tab**: Manage menu items and customizations
- **Earnings Tab**: View earnings and payout information
- **Profile Tab**: Chef profile and business settings

#### Common Stack
- Authentication (Login, Signup, Forgot Password)
- Notifications
- Chat/Inbox
- Map view
- Contact Us
- Terms & Privacy

## Navigation Utilities

This directory contains helper functions and configurations:

### Route Helpers
Functions to navigate programmatically and handle navigation state.

### Deep Linking
Configuration for handling deep links and universal links:
- Order tracking links
- Chef profile links
- Password reset links

### Navigation Guards
Middleware to protect routes based on authentication and user type.

## Usage

```typescript
import { router, useRouter, useNavigation } from 'expo-router';

// Navigate to a screen
router.push('/screens/customer/chefDetail');

// Navigate with parameters
router.push({
  pathname: '/screens/customer/chefDetail',
  params: { chefId: '123' }
});

// Go back
router.back();

// Replace current screen
router.replace('/screens/common/login');
```

## Type Safety

Navigation is fully typed using Expo Router's typed routes:

```typescript
import type { Href } from 'expo-router';

const route: Href = '/screens/customer/chefDetail';
```

## Tab Navigation

Both customer and chef roles use bottom tab navigation with custom tab bars. Tabs are configured in the respective `(tabs)/_layout.tsx` files.

## Protected Routes

Authentication is handled at the layout level. Unauthenticated users are redirected to the login screen. User type (customer/chef) determines which navigation stack is shown.

## Best Practices

1. Use Expo Router's `router` for programmatic navigation
2. Pass minimal data through route params
3. Fetch detailed data on the destination screen
4. Use proper TypeScript types for route params
5. Handle navigation errors gracefully
6. Test deep linking thoroughly


