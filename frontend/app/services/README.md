# Frontend Services

This directory contains service modules and providers for handling business logic and external integrations.

## Files

### api.ts
Core API service module for making HTTP requests to the backend.

**Features:**
- Axios-based HTTP client
- Authentication token management
- Request/response interceptors
- Error handling and retry logic
- API endpoint configuration

**Usage:**
```typescript
import { api } from '@/services/api';

const response = await api.get('/chefs');
const chef = await api.post('/orders', orderData);
```

### ProgressProvider
Context provider for managing global loading states and progress indicators.

**Components:**
- `index.tsx` - Provider component wrapping the app
- `indicator.tsx` - Loading indicator UI component

**Features:**
- Global loading state management
- Progress tracking for async operations
- Overlay loading indicators
- Context-based state access

**Usage:**
```typescript
import { useProgress } from '@/services/ProgressProvider';

const { showProgress, hideProgress } = useProgress();

// Show loading
showProgress();
try {
  await someAsyncOperation();
} finally {
  hideProgress();
}
```

## API Configuration

The API service connects to the backend Laravel application. Base URL configuration should be set in environment variables or config files.

## Error Handling

All services implement consistent error handling with user-friendly error messages. Network errors, authentication failures, and validation errors are properly managed and surfaced to the UI.


