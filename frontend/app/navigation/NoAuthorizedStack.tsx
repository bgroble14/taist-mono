import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { router } from 'expo-router';

// Note: Screen components should be handled by Expo Router file-based routing
// This stack is kept for backward compatibility during migration

// Types
import { NavigationStackType } from '../types/index';

const Index = () => {
  const Stack = createNativeStackNavigator<NavigationStackType>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'fade',
        animationTypeForReplace: 'push',
      }}
      initialRouteName={'Splash'}>
      {/* 
        Note: Screen components should be handled by Expo Router
        These screens should be moved to the app/screens directory structure
        For now, keeping this structure for backward compatibility
      */}
      <Stack.Screen 
        name="Splash" 
        component={() => {
          router.replace('/screens/common/splash');
          return null;
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={() => {
          router.replace('/screens/common/login');
          return null;
        }}
      />
      <Stack.Screen 
        name="Signup" 
        component={() => {
          router.replace('/screens/common/signup');
          return null;
        }}
      />
      <Stack.Screen 
        name="Forgot" 
        component={() => {
          router.replace('/screens/common/forgot');
          return null;
        }}
      />
      <Stack.Screen 
        name="Terms" 
        component={() => {
          router.replace('/screens/common/terms');
          return null;
        }}
      />
      <Stack.Screen 
        name="Account" 
        component={() => {
          router.replace('/screens/common/account');
          return null;
        }}
      />
    </Stack.Navigator>
  );
};

export default Index;
