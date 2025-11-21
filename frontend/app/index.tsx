import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to splash screen when app starts
  return <Redirect href="/screens/common/splash" />;
}
