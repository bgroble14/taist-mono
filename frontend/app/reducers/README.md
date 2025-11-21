# Redux Reducers

This directory contains Redux Toolkit slices for state management across the Taist application.

## Overview

The app uses Redux Toolkit with Redux Persist for state management. Each reducer manages a specific domain of the application state.

## Reducers

### User State Management
Handles authentication, user profiles, and session management.

### Order State Management
Manages customer orders, order history, and order status tracking.

### Chef State Management
Handles chef profiles, menus, availability, and chef-specific data.

### Cart State Management
Manages shopping cart items, customizations, and checkout flow.

### Location State Management
Stores user location, address information, and geolocation data.

### Notification State Management
Manages notification preferences, push tokens, and notification history.

### UI State Management
Handles global UI states like modals, drawers, and navigation state.

## Store Configuration

The Redux store is configured in `/app/store/` with the following middleware:
- Redux Persist - Persists state to AsyncStorage
- Redux Thunk - Handles async actions
- Redux DevTools - Development debugging

## Usage

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addToCart, removeFromCart } from '@/reducers/cartSlice';

// In your component
const cart = useSelector((state: RootState) => state.cart);
const dispatch = useDispatch();

const handleAddToCart = (item) => {
  dispatch(addToCart(item));
};
```

## State Persistence

Critical state (auth, user profile, cart) is persisted to device storage using Redux Persist. State is automatically rehydrated on app launch.

## Best Practices

1. Keep reducers pure and focused on a single domain
2. Use Redux Toolkit's `createSlice` for consistent reducer creation
3. Implement proper TypeScript types for state and actions
4. Use selectors for complex state derivations
5. Keep business logic in actions/thunks, not components


