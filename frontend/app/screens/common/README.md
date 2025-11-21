# Common Screens

This directory contains screens shared between customers and chefs, including authentication, notifications, messaging, and legal pages.

## Overview

Common screens provide functionality used by all user types in the Taist application. These screens are accessible before authentication and from both customer and chef navigation stacks.

## Screens

### Authentication

#### login/
User login screen for both customers and chefs.

**Features:**
- Email/password authentication
- Social login (Google, Apple)
- Remember me functionality
- Forgot password link
- Sign up navigation
- Role selection (customer/chef)

#### signup/
New user registration flow.

**Features:**
- Account type selection (customer or chef)
- Email/password registration
- Social sign up options
- Phone number verification
- Terms acceptance
- Email verification

**Sub-screens:**
- `onBoarding/` - Post-signup onboarding flow with profile completion

#### forgot/
Password reset request screen.

**Features:**
- Email input for reset link
- Reset code verification
- Password reset form
- Back to login

#### userInformation/
Complete user profile after initial registration.

**Features:**
- Personal information (name, phone)
- Profile photo upload
- Address input
- Preferences setup

### Communication

#### notification/
View all app notifications.

**Features:**
- Notification list (orders, messages, promotions)
- Mark as read/unread
- Notification filtering
- Clear all notifications
- Deep links to relevant screens

**Components:**
- `NotificationCard.tsx` - Individual notification items

#### inbox/
Message center for conversations.

**Features:**
- Conversation list
- Unread message count
- Customer-chef messaging
- Support conversations
- Search conversations

**Components:**
- `inboxRecord.tsx` - Conversation preview cards

#### chat/
One-on-one chat screen.

**Features:**
- Real-time messaging
- Message history
- Read receipts
- Typing indicators
- Order context (if chat is about an order)
- Image sharing

**Components:**
- `textBubble.tsx` - Message bubble UI

### Utility Screens

#### map/
Interactive map view for locations.

**Features:**
- Display chef locations
- User's current location
- Delivery address selection
- Distance calculations
- Map markers and pins

#### splash/
Initial app loading screen.

**Features:**
- App logo animation
- Authentication state check
- Data preloading
- Navigation to appropriate home screen

#### account/
Account settings and management (when accessed from common navigation).

**Features:**
- Profile editing
- Notification preferences
- Privacy settings
- Language selection
- Logout

#### contactUs/
Customer support contact form.

**Features:**
- Subject selection
- Message composition
- Attachment upload
- Submit to support team
- FAQ links

### Legal

#### terms/
Terms of Service document.

**Features:**
- Full terms of service text
- Scrollable content
- Last updated date
- Acceptance required for signup

#### privacy/
Privacy Policy document.

**Features:**
- Full privacy policy text
- Data collection information
- User rights
- Contact information

## Navigation Context

Common screens are accessed from multiple contexts:

### Pre-Authentication
- Splash → Login → Signup → User Information
- Forgot Password flow

### Post-Authentication (Both Roles)
- Notifications (from all screens)
- Inbox/Chat (from all screens)
- Map (when needed)
- Terms/Privacy (from settings)
- Contact Us (from settings)
- Account (from settings)

## State Management

Common screens use Redux for:
- Authentication state
- User profile
- Notification count
- Message state
- Location data

## API Integration

Common screens interact with backend for:
- User authentication (login, signup, verify)
- Password reset
- Profile management
- Notifications
- Messaging
- Support tickets

## Real-Time Features

### Push Notifications
- Firebase Cloud Messaging integration
- Notification handling and display
- Deep linking from notifications

### Messaging
- Real-time message delivery
- Online status
- Read receipts

## Security

### Authentication
- JWT token management
- Secure token storage
- Auto-refresh tokens
- Logout on expiry

### Data Protection
- Sensitive data encryption
- Secure form inputs
- HTTPS communication

## Shared Components

Common screens use many shared components from `/app/components/`:
- `headerWithBack` - Standard header
- `styledTextInput` - Form inputs
- `styledButton` - Action buttons
- `emptyListView` - Empty states

## Best Practices

1. **Authentication State**: Always check auth state before navigation
2. **Error Handling**: Display user-friendly error messages
3. **Loading States**: Show progress indicators during async operations
4. **Deep Linking**: Handle deep links appropriately for each screen
5. **Offline Support**: Gracefully handle offline scenarios
6. **Accessibility**: Ensure all screens are accessible


