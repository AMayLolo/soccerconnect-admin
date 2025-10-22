import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../providers/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        {/* Tabs group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Non-tab routes */}
        <Stack.Screen name="club/[id]" options={{ title: 'Club' }} />

        {/* Review routes use custom compact headers */}
        <Stack.Screen name="review/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="review/edit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="review/new" options={{ headerShown: false }} />

        {/* Auth */}
        <Stack.Screen name="auth/login" options={{ title: 'Sign in' }} />
      </Stack>
    </AuthProvider>
  );
}
