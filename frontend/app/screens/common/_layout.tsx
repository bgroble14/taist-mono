import { Stack } from 'expo-router';
import React from 'react';

export default function CommonLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      {/* Let Expo Router auto-discover all common screens */}
    </Stack>
  );
}
