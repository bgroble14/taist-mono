# Frontend App Directory

This is the main application directory for the Taist mobile app, built with React Native and Expo Router. It contains all screens, components, and business logic for the mobile application.

## Architecture Overview

The Taist app uses **Expo Router** for file-based navigation and follows a feature-based architecture with clear separation between user roles (Customer and Chef).

## Directory Structure

```
app/
├── _layout.tsx              # Root layout with providers
├── index.tsx                # App entry point
├── assets/                  # Images and media files
├── components/              # Reusable UI components
├── features/                # Feature-specific logic modules
├── firebase/                # Firebase configuration and services
├── hooks/                   # Custom React hooks
├── layout/                  # Layout components
├── navigation/              # Navigation utilities and config
├── reducers/                # Redux state slices
├── screens/                 # All app screens (main content)
│   ├── common/              # Shared screens (auth, notifications)
│   ├── customer/            # Customer-facing screens
│   └── chef/                # Chef-facing screens
├── services/                # API and external services
├── store/                   # Redux store configuration
├── types/                   # TypeScript type definitions
└── utils/                   # Helper functions and utilities
```

## Key Technologies

### Framework & Tools
- **React Native 0.79.5** - Mobile app framework
- **Expo SDK 53** - Development platform and tools
- **Expo Router 5** - File-based routing system
- **TypeScript 5.8** - Type safety

### State Management
- **Redux Toolkit** - State management
- **Redux Persist** - State persistence
- **React Redux** - React bindings

### UI & Styling
- **React Native Paper** - Material Design components
- **FontAwesome** - Icon library
- **React Native Reanimated** - Animations
- **Expo Blur** - Blur effects

### Navigation
- **Expo Router** - Primary navigation
- **React Navigation** - Advanced navigation patterns
- **Deep Linking** - Universal links support

### External Services
- **Firebase Cloud Messaging** - Push notifications
- **Stripe React Native** - Payment processing
- **Expo Location** - Geolocation services
- **Expo Maps** - Google Maps integration

### Development
- **ESLint** - Code linting
- **Expo Dev Client** - Custom development build

## App Flow

### User Journey

#### New User
1. **Splash Screen** → Check authentication
2. **Login/Signup** → Choose user type (Customer or Chef)
3. **Onboarding** → Complete profile
4. **Main App** → Navigate to role-specific home

#### Returning User
1. **Splash Screen** → Auto-login
2. **Home Screen** → Customer or Chef interface

### Navigation Stacks

#### Customer Flow
```
Home (Tabs)
├── Browse Chefs → Chef Detail → Add to Order → Checkout → Order Confirmation
├── Orders → Order Detail
└── Account → Settings/Profile
```

#### Chef Flow
```
Home (Tabs)
├── Dashboard → Settings
├── Orders → Order Detail → Update Status
├── Menu → Add/Edit Menu Items
├── Earnings → Transaction Details
└── Profile → Edit Profile/Availability
```

#### Common Flow
```
Login → Signup → User Information
Notifications (accessible from anywhere)
Chat/Inbox (accessible from anywhere)
```

## State Management

The app uses Redux for global state management with the following slices:

- **Auth**: User authentication and session
- **User**: User profile and preferences
- **Cart**: Shopping cart (customer)
- **Orders**: Order management
- **Chef**: Chef profile and menu
- **Location**: User location and addresses
- **Notifications**: Notification state
- **UI**: Global UI state (modals, loaders)

State is persisted to AsyncStorage for offline access and seamless user experience.

## API Communication

All backend communication goes through the centralized API service (`services/api.ts`):

```typescript
import { api } from '@/services/api';

// GET request
const chefs = await api.get('/chefs');

// POST request
const order = await api.post('/orders', orderData);

// Authenticated requests automatically include token
```

The API service handles:
- Base URL configuration
- Authentication token injection
- Request/response interceptors
- Error handling and retries
- Response formatting

## Real-Time Features

### Push Notifications
- Firebase Cloud Messaging for iOS and Android
- Token registration on login
- Notification handlers for foreground/background
- Deep linking from notifications

### Order Updates
- Real-time order status changes
- Notifications for order lifecycle events
- In-app order tracking

### Messaging
- Real-time chat between customers and chefs
- Unread message counts
- Message notifications

## Authentication

The app uses token-based authentication:

1. **Login** → Receive JWT token from backend
2. **Store Token** → Save to secure storage (Redux Persist + AsyncStorage)
3. **API Requests** → Automatically include token in headers
4. **Token Refresh** → Handle token expiry
5. **Logout** → Clear token and reset state

## User Roles

The app supports three user types:

### Customer
- Browse and search for local chefs
- View menus and place orders
- Track order status
- Rate and review chefs
- Manage payment methods
- Chat with chefs

### Chef
- Manage menu items and pricing
- Set availability and business hours
- Accept and fulfill orders
- Update order status
- View earnings and analytics
- Chat with customers
- Manage profile and photos

### Admin (Limited Mobile Access)
- View platform statistics
- Manage users (approval/suspension)
- Customer support functions

## Screens Organization

### Common Screens (`screens/common/`)
Shared screens for authentication, notifications, messaging, and legal pages. See [common/README.md](./screens/common/README.md).

### Customer Screens (`screens/customer/`)
Customer-specific screens for browsing, ordering, and account management. See [customer/README.md](./screens/customer/README.md).

### Chef Screens (`screens/chef/`)
Chef-specific screens for menu management, orders, and earnings. See [chef/README.md](./screens/chef/README.md).

## Components

Reusable UI components are located in `components/`. All components follow the app's design system and theming. See [components/README.md](./components/README.md).

## Development

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
npx expo start -c
```

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build --platform all
```

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Configuration Files

- **app.json** - Expo configuration
- **eas.json** - EAS Build/Update configuration
- **tsconfig.json** - TypeScript configuration
- **metro.config.js** - Metro bundler configuration
- **.eslintrc.js** - ESLint configuration

## Environment Variables

The app uses environment-specific configurations:

- API Base URL
- Stripe publishable key
- Google Maps API key
- Firebase configuration

These should be configured in `app.json` and environment-specific files.

## Testing

- Unit tests for utilities and helpers
- Component tests for UI components
- Integration tests for screens
- E2E tests for critical user flows

## Performance Optimization

- Image optimization with Expo Image
- Code splitting with dynamic imports
- Memoization of expensive computations
- FlatList for long lists
- React Navigation optimization
- Redux selector optimization

## Accessibility

- Screen reader support
- Keyboard navigation
- Sufficient color contrast
- Touch target sizes
- Accessible labels and hints

## Security

- Secure token storage
- HTTPS communication
- Input validation
- Sensitive data protection
- Biometric authentication (planned)

## Documentation

Each directory contains its own README with detailed information:

- [Components](./components/README.md)
- [Services](./services/README.md)
- [Reducers](./reducers/README.md)
- [Types](./types/README.md)
- [Utils](./utils/README.md)
- [Navigation](./navigation/README.md)
- [Customer Screens](./screens/customer/README.md)
- [Chef Screens](./screens/chef/README.md)
- [Common Screens](./screens/common/README.md)

## Troubleshooting

### Common Issues

**Build Errors:**
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear iOS build: `cd ios && pod install`

**Metro Bundler Issues:**
- Reset cache: `npx expo start -c`
- Check for circular dependencies
- Verify all imports are correct

**Native Module Issues:**
- Rebuild dev client: `npx expo prebuild --clean`
- Run: `npx expo run:ios` or `npx expo run:android`

## Contributing

1. Follow the established file structure
2. Use TypeScript for all new code
3. Create reusable components when appropriate
4. Document complex logic
5. Write tests for new features
6. Follow the style guide (ESLint)

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://expo.github.io/router/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)


