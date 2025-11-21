# Taist Frontend - React Native Mobile App

Cross-platform mobile application for the Taist food marketplace, built with React Native, Expo, and TypeScript. Connects customers with local chefs for ordering homemade meals.

## Overview

The Taist mobile app provides two distinct experiences:
- **Customer App**: Browse local chefs, order meals, track deliveries, and leave reviews
- **Chef App**: Manage menus, accept orders, update order status, and track earnings

## Technology Stack

### Core
- **React Native 0.79.5** - Mobile app framework
- **Expo SDK 53** - Development platform and build tools
- **TypeScript 5.8** - Type safety and developer experience
- **Expo Router 5** - File-based navigation

### State Management
- **Redux Toolkit 2.8** - Global state management
- **Redux Persist 6.0** - State persistence to AsyncStorage
- **React Redux 9.2** - React bindings for Redux

### UI & Design
- **React Native Paper 5.14** - Material Design components
- **React Native Reanimated 3.17** - Smooth animations
- **React Native SVG** - SVG rendering
- **FontAwesome 6.7** - Icon library
- **Expo Blur** - Blur effects

### Navigation
- **Expo Router** - File-based routing system
- **React Navigation 7** - Navigation library
- **Bottom Tabs & Drawer** - Navigation patterns

### External Services
- **Firebase Cloud Messaging** - Push notifications
- **Stripe React Native** - Payment processing
- **Expo Location** - Geolocation services
- **Expo Maps** - Google Maps integration
- **Axios 1.10** - HTTP client

### Development Tools
- **ESLint 9** - Code linting
- **Expo Dev Client** - Custom development builds
- **EAS Build & Update** - Build and deployment platform

## Project Structure

```
frontend/
├── android/                 # Android native project
├── ios/                     # iOS native project
├── app/                     # Main application code
│   ├── screens/             # All app screens
│   │   ├── common/          # Auth, notifications, messaging
│   │   ├── customer/        # Customer-facing screens
│   │   └── chef/            # Chef-facing screens
│   ├── components/          # Reusable UI components
│   ├── services/            # API and external services
│   ├── reducers/            # Redux state slices
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Helper functions
│   ├── navigation/          # Navigation config
│   ├── store/               # Redux store
│   └── README.md            # App directory docs
├── assets/                  # Images and media
├── constants/               # App constants and theme
├── scripts/                 # Build and utility scripts
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Development**: macOS with Xcode
- **Android Development**: Android Studio with SDK

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (create `.env` if needed):
   ```env
   API_BASE_URL=http://localhost:8000/api
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   GOOGLE_MAPS_API_KEY=AIza...
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

### Running the App

#### Expo Go (Development)
```bash
# Start Metro bundler
npm start

# Scan QR code with Expo Go app
```

#### Development Builds

For features requiring native modules (Firebase, Stripe):

```bash
# iOS
npm run ios

# Android
npm run android

# Build development client
npx expo prebuild
```

#### Specific Platforms

```bash
# iOS
npm run ios

# iOS clean build
npx expo prebuild --clean
npx expo run:ios --no-build-cache

# Android
npm run android

# Web (limited support)
npm run web
```

## App Architecture

### File-Based Routing

Expo Router automatically generates routes from the file structure:

```
app/screens/
├── common/
│   ├── login/index.tsx          → /common/login
│   ├── signup/index.tsx         → /common/signup
│   └── notification/index.tsx   → /common/notification
├── customer/
│   └── (tabs)/
│       ├── index.tsx            → /customer/(tabs) [Home]
│       ├── orders.tsx           → /customer/(tabs)/orders
│       └── account.tsx          → /customer/(tabs)/account
└── chef/
    └── (tabs)/
        ├── home.tsx             → /chef/(tabs)/home
        ├── orders.tsx           → /chef/(tabs)/orders
        └── menu.tsx             → /chef/(tabs)/menu
```

### State Management

Redux state structure:

```typescript
{
  auth: {
    isAuthenticated: boolean,
    user: User | null,
    token: string | null
  },
  cart: {
    items: CartItem[],
    total: number
  },
  orders: {
    activeOrders: Order[],
    orderHistory: Order[]
  },
  chef: {
    profile: ChefProfile,
    menu: MenuItem[],
    earnings: EarningsData
  },
  notifications: {
    list: Notification[],
    unreadCount: number
  }
}
```

### API Communication

Centralized API service handles all backend communication:

```typescript
import { api } from '@/services/api';

// Authenticated requests
const chefs = await api.get('/chefs');
const order = await api.post('/orders', orderData);
```

Features:
- Automatic token injection
- Request/response interceptors
- Error handling
- Retry logic

### Real-Time Features

**Push Notifications:**
- Firebase Cloud Messaging for iOS & Android
- Foreground, background, and quit state handling
- Deep linking from notifications
- Badge count management

**Order Updates:**
- Real-time status changes
- Instant notifications
- In-app order tracking

## Key Features

### Customer Features

#### Chef Discovery
- Location-based search
- Filter by cuisine, rating, availability
- View chef profiles and menus
- Read reviews and ratings

#### Order Placement
- Add items to cart with customizations
- Schedule delivery date/time
- Multiple payment methods
- Special instructions and dietary notes

#### Order Tracking
- Real-time order status
- Order history
- Reorder functionality
- Rate and review completed orders

#### Account Management
- Profile editing
- Address management
- Payment method management
- Notification preferences

### Chef Features

#### Menu Management
- Add/edit menu items
- Upload multiple photos
- Set pricing and customizations
- Manage item availability
- Allergen information

#### Order Management
- Accept/decline incoming orders
- Update order status (preparing, ready, delivered)
- View order details and customer info
- Order calendar view

#### Business Management
- Set availability and business hours
- View earnings and analytics
- Manage Stripe Connect account
- Respond to customer reviews

#### Profile Management
- Chef bio and story
- Upload profile and food photos
- Service area management
- Contact information

### Common Features

#### Authentication
- Email/password login
- Social login (Google, Apple)
- Password reset
- Email verification

#### Messaging
- Real-time chat with customers/chefs
- Order-specific conversations
- Support messaging

#### Notifications
- Push notifications for orders
- In-app notification center
- Customizable preferences

## Development

### Code Structure

**Components**: Reusable UI components with TypeScript props
```typescript
interface StyledButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}
```

**Screens**: Full-screen views with navigation
```typescript
export default function ChefDetailScreen() {
  const { chefId } = useLocalSearchParams();
  // Screen logic
}
```

**Redux Slices**: State management with Redux Toolkit
```typescript
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => { /* ... */ },
    removeItem: (state, action) => { /* ... */ }
  }
});
```

### Styling

Styles are colocated with components in separate `styles.ts` files:

```typescript
import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  }
});
```

### Type Safety

All code uses TypeScript with strict mode:
- Component props are typed
- API responses are typed
- Navigation params are typed
- Redux state is typed

### Code Quality

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Format code (if configured)
npm run format
```

## Building & Deployment

### EAS Build

Configure in `eas.json`:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both platforms
eas build --platform all
```

### Build Profiles

- **development**: Development builds with Expo Dev Client
- **preview**: Internal testing builds
- **production**: App Store/Play Store release builds

### App Store Submission

**iOS:**
1. Build with production profile
2. Download IPA from EAS dashboard
3. Upload to App Store Connect via Transporter
4. Submit for review

**Android:**
1. Build with production profile
2. Download AAB from EAS dashboard
3. Upload to Google Play Console
4. Submit for review

### Over-The-Air Updates

```bash
# Publish update
eas update --branch production

# Update specific channel
eas update --channel preview
```

## Testing

### Manual Testing
- Test on physical devices (iOS and Android)
- Test all user flows
- Test push notifications
- Test offline scenarios

### Automated Testing
- Unit tests for utilities and helpers
- Component tests with React Testing Library
- Integration tests for critical flows
- E2E tests with Detox (future)

## Performance Optimization

### Implemented Optimizations
- **Expo Image**: Optimized image loading and caching
- **FlatList**: Virtualized lists for performance
- **Memoization**: React.memo for expensive components
- **Code Splitting**: Dynamic imports for large screens
- **Redux Selectors**: Memoized selectors with reselect

### Performance Monitoring
- Track app launch time
- Monitor screen render performance
- Analyze bundle size
- Profile with React DevTools

## Troubleshooting

### Common Issues

**Metro Bundler Not Starting:**
```bash
npx expo start -c  # Clear cache
```

**Native Module Issues:**
```bash
npx expo prebuild --clean
npx expo run:ios    # or run:android
```

**Build Errors:**
```bash
# Clean iOS
cd ios && pod install && cd ..

# Clean Android
cd android && ./gradlew clean && cd ..

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Expo Go Limitations:**
If a feature doesn't work in Expo Go, create a development build:
```bash
npx expo prebuild
npx expo run:ios  # or run:android
```

## Environment Setup

### iOS Development
1. Install Xcode from App Store
2. Install CocoaPods: `sudo gem install cocoapods`
3. Open Xcode and accept license
4. Install iOS Simulator

### Android Development
1. Install Android Studio
2. Install Android SDK (API 34+)
3. Configure ANDROID_HOME environment variable
4. Create Android emulator

## Configuration Files

- **app.json**: Expo configuration (app name, icons, permissions)
- **eas.json**: Build profiles and configurations
- **tsconfig.json**: TypeScript compiler options
- **metro.config.js**: Metro bundler configuration
- **babel.config.js**: Babel transpiler configuration

## Security

- Sensitive data stored securely (AsyncStorage for non-sensitive, consider SecureStore for sensitive)
- HTTPS communication with backend
- Input validation and sanitization
- Secure authentication token storage
- Proper permission handling

## Accessibility

- Screen reader support
- Proper labeling of interactive elements
- Sufficient color contrast
- Touch target sizes (minimum 44x44)
- Keyboard navigation support

## Documentation

Detailed documentation for each component:

- [App Directory](./app/README.md) - Main app architecture
- [Components](./app/components/README.md) - Reusable components
- [Services](./app/services/README.md) - API and external services
- [Reducers](./app/reducers/README.md) - Redux state management
- [Types](./app/types/README.md) - TypeScript definitions
- [Utils](./app/utils/README.md) - Helper functions
- [Navigation](./app/navigation/README.md) - Routing and navigation
- [Customer Screens](./app/screens/customer/README.md) - Customer features
- [Chef Screens](./app/screens/chef/README.md) - Chef features
- [Common Screens](./app/screens/common/README.md) - Shared features

## Contributing

1. Follow TypeScript best practices
2. Use existing components when possible
3. Write meaningful commit messages
4. Test on both iOS and Android
5. Update documentation for new features
6. Follow the established file structure

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Docs](https://expo.github.io/router/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## Migration Notes

This app was migrated from React Native CLI to Expo. Original CLI code is preserved in `/app/src-cli/` for reference.

See the Android build guide: [android_guide.md](./android_guide.md)

## License

MIT

## Support

For development questions:
- Check relevant README files in subdirectories
- Review app logs and error messages
- Consult Expo documentation
- Contact development team
