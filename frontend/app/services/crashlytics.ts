import crashlytics from '@react-native-firebase/crashlytics';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * Initialize Firebase Crashlytics
 * This should be called early in the app lifecycle
 */
export const initializeCrashlytics = async () => {
  try {
    const APP_ENV = Constants.expoConfig?.extra?.APP_ENV || 'production';
    
    // Enable Crashlytics collection (disabled in debug mode by default)
    // For staging and production, we want it enabled
    if (APP_ENV !== 'local' || !__DEV__) {
      await crashlytics().setCrashlyticsCollectionEnabled(true);
    } else {
      // Disable in local dev to avoid cluttering crash reports
      await crashlytics().setCrashlyticsCollectionEnabled(false);
    }

    // Set user attributes for better crash reporting
    await crashlytics().setAttribute('environment', APP_ENV);
    await crashlytics().setAttribute('platform', Platform.OS);
    await crashlytics().setAttribute('platform_version', Platform.Version.toString());
    
    // Set device info if available
    if (Device.deviceName) {
      await crashlytics().setAttribute('device_name', Device.deviceName);
    }
    if (Device.modelName) {
      await crashlytics().setAttribute('device_model', Device.modelName);
    }
    
    // Set app version info
    const appVersion = Constants.expoConfig?.version || 'unknown';
    const buildNumber = Platform.OS === 'ios' 
      ? Constants.expoConfig?.ios?.buildNumber || 'unknown'
      : Constants.expoConfig?.android?.versionCode?.toString() || 'unknown';
    
    await crashlytics().setAttribute('app_version', appVersion);
    await crashlytics().setAttribute('build_number', buildNumber);

    console.log('✅ Crashlytics initialized', { 
      environment: APP_ENV, 
      enabled: APP_ENV !== 'local' || !__DEV__ 
    });
  } catch (error) {
    console.error('❌ Failed to initialize Crashlytics:', error);
    // Don't throw - we don't want Crashlytics initialization to crash the app
  }
};

/**
 * Set user identifier for crash reports
 * Call this after user login/authentication
 */
export const setCrashlyticsUserId = async (userId: string | number) => {
  try {
    await crashlytics().setUserId(userId.toString());
  } catch (error) {
    console.error('Failed to set Crashlytics user ID:', error);
  }
};

/**
 * Set custom attributes for crash reports
 */
export const setCrashlyticsAttribute = async (key: string, value: string) => {
  try {
    await crashlytics().setAttribute(key, value);
  } catch (error) {
    console.error(`Failed to set Crashlytics attribute ${key}:`, error);
  }
};

/**
 * Log a non-fatal error to Crashlytics
 * Use this for caught errors that you want to track
 */
export const logError = async (error: Error, context?: Record<string, string>) => {
  try {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        crashlytics().setAttribute(key, value);
      });
    }
    await crashlytics().recordError(error);
  } catch (crashlyticsError) {
    console.error('Failed to log error to Crashlytics:', crashlyticsError);
  }
};

/**
 * Log a custom message to Crashlytics
 * Useful for tracking important events that might help debug crashes
 */
export const logMessage = async (message: string) => {
  try {
    await crashlytics().log(message);
  } catch (error) {
    console.error('Failed to log message to Crashlytics:', error);
  }
};

/**
 * Force a test crash (only use in development/testing)
 * This will crash the app immediately - use with caution!
 */
export const forceCrash = () => {
  crashlytics().crash();
};
