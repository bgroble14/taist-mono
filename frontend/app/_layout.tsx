import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-gesture-handler';
import KeyboardManager from 'react-native-keyboard-manager';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useColorScheme } from 'react-native';
import ProgressProvider from './services/ProgressProvider';
import { persistor, store } from './store';
import { StripPublishableKey } from './utils/constance';
import { initializeNavigation } from './utils/navigation';
import { toastConfig } from './utils/toast';
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true);
    }
    
    // Initialize navigation
    initializeNavigation();
    
    // Hide the splash screen
    SplashScreen.hideAsync();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ProgressProvider>
          <StripeProvider publishableKey={StripPublishableKey}>
            <SafeAreaProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="screens" options={{ headerShown: false }} />
                  <Stack.Screen name="(not-found)" options={{ title: 'Not Found' }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </SafeAreaProvider>
          </StripeProvider>
          <Toast config={toastConfig} />
        </ProgressProvider>
      </PersistGate>
    </Provider>
  );
}
