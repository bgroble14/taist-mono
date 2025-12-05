import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import { ErrorUtils } from 'react-native';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

// Set up global error handlers for Crashlytics
const originalHandler = ErrorUtils.getGlobalHandler();

ErrorUtils.setGlobalHandler((error, isFatal) => {
  // Log to Crashlytics
  try {
    crashlytics().recordError(error);
  } catch (crashlyticsError) {
    console.error('Failed to record error to Crashlytics:', crashlyticsError);
  }
  
  // Call original handler
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

// Handle unhandled promise rejections
if (typeof global !== 'undefined') {
  const originalUnhandledRejection = global.onunhandledrejection;
  global.onunhandledRejection = function(event) {
    if (event && event.reason instanceof Error) {
      try {
        crashlytics().recordError(event.reason);
      } catch (crashlyticsError) {
        console.error('Failed to record promise rejection to Crashlytics:', crashlyticsError);
      }
    }
    if (originalUnhandledRejection) {
      originalUnhandledRejection.call(this, event);
    }
  };
}

// Import expo-router entry point after setting up error handlers
// This ensures all crashes are caught and reported to Crashlytics
import 'expo-router/entry';
