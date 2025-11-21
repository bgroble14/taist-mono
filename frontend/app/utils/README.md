# Utility Functions

This directory contains helper functions and utilities used throughout the Taist frontend application.

## Purpose

Centralized utility functions for:
- Common data transformations
- String formatting and parsing
- Date/time operations
- Validation functions
- Helper methods

## Utility Categories

### Formatting Utilities
- **Currency Formatting**: Format prices and amounts
- **Date Formatting**: Format dates and times for display
- **Phone Formatting**: Format phone numbers
- **Address Formatting**: Format addresses consistently

### Validation Utilities
- **Email Validation**: Validate email addresses
- **Phone Validation**: Validate phone numbers
- **Form Validation**: Common form field validators
- **Input Sanitization**: Clean and sanitize user input

### Data Transformation
- **Object Mappers**: Transform API data to app models
- **Array Utilities**: Filter, sort, and group data
- **Type Converters**: Convert between data types

### Storage Utilities
- **AsyncStorage Helpers**: Wrapper functions for local storage
- **Cache Management**: Handle cached data
- **Secure Storage**: Manage sensitive data

### Navigation Utilities
- **Route Helpers**: Navigation helper functions
- **Deep Linking**: Handle deep link parsing

### Location Utilities
- **Distance Calculation**: Calculate distances between coordinates
- **Geocoding Helpers**: Work with location data
- **Address Parsing**: Parse and validate addresses

### Notification Utilities
- **Push Notification Helpers**: Handle FCM tokens and notifications
- **Local Notifications**: Schedule local notifications

## Usage Examples

```typescript
import { formatCurrency, formatDate } from '@/utils/formatters';
import { validateEmail, validatePhone } from '@/utils/validators';
import { calculateDistance } from '@/utils/location';

// Format currency
const price = formatCurrency(25.50); // "$25.50"

// Validate email
const isValid = validateEmail('user@example.com'); // true

// Calculate distance
const distance = calculateDistance(
  { lat: 40.7128, lng: -74.0060 },
  { lat: 40.7589, lng: -73.9851 }
); // Distance in miles
```

## Best Practices

1. **Keep functions pure** - No side effects, same input = same output
2. **Single responsibility** - Each function does one thing well
3. **Document parameters** - Use JSDoc comments
4. **Handle edge cases** - Null checks, empty arrays, etc.
5. **Write unit tests** - Test utility functions thoroughly
6. **Use TypeScript** - Type all parameters and return values

## Error Handling

Utility functions should:
- Validate inputs
- Return sensible defaults for invalid inputs
- Throw errors for critical failures
- Log warnings for unexpected cases


