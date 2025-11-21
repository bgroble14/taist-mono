import { Redirect } from 'expo-router';

// Redirect to the home stack by default
export default function TabsIndex() {
  return <Redirect href="/screens/customer/(tabs)/(home)" />;
}
