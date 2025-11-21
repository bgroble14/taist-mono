# TypeScript Types

This directory contains TypeScript type definitions, interfaces, and type utilities used throughout the Taist frontend application.

## Purpose

Centralized type definitions ensure:
- Type safety across the application
- Consistent data structures
- Better IDE autocomplete and IntelliSense
- Easier refactoring and maintenance
- Clear API contracts

## Type Categories

### Domain Models
Type definitions for core business entities:
- **User Types**: Customer, Chef, Admin profiles
- **Order Types**: Order, OrderItem, OrderStatus
- **Menu Types**: MenuItem, Category, Customization
- **Payment Types**: Payment methods, transactions
- **Location Types**: Address, coordinates, delivery zones

### API Types
Request and response types for backend API calls:
- API request payloads
- API response structures
- Error response types
- Pagination types

### Navigation Types
Type definitions for React Navigation:
- Screen parameters
- Navigation props
- Route names and stacks

### Component Props
Prop type definitions for reusable components:
- Component interfaces
- Event handler types
- Render prop types

### Redux Types
State and action types for Redux:
- State shape interfaces
- Action payload types
- Thunk return types

## Usage

```typescript
import type { Chef, MenuItem, Order } from '@/types/models';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { RootStackParamList } from '@/types/navigation';

// Type-safe component props
interface ChefCardProps {
  chef: Chef;
  onPress: (chef: Chef) => void;
}

// Type-safe API responses
const response: ApiResponse<MenuItem[]> = await api.get('/menu');

// Type-safe navigation
navigation.navigate('ChefDetail', { chefId: '123' });
```

## Best Practices

1. **Use `type` for unions and primitives, `interface` for objects**
2. **Export all types for reuse**
3. **Use strict types, avoid `any`**
4. **Document complex types with JSDoc comments**
5. **Keep types DRY using utility types**
6. **Match backend API response structures exactly**

## Utility Types

Common utility types used throughout the app:
- `Optional<T>` - Makes all properties optional
- `Nullable<T>` - Allows null values
- `ID` - String or number identifiers
- `Timestamp` - Date or ISO string


