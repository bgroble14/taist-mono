import { Redirect } from 'expo-router';

// Redirect to the home tab by default
export default function TabsIndex() {
  return <Redirect href="/screens/chef/(tabs)/home" />;
}
