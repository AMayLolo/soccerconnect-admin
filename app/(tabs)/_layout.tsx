// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8); // keep it comfortably above the home indicator

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          height: 56 + bottom,       // raise the bar visually
          paddingTop: 6,
          paddingBottom: bottom,     // sit above the safe-area
          backgroundColor: 'white',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      {/* Only these three are tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />

      {/* Hide nested Account pages from appearing as tabs */}
      <Tabs.Screen name="account/reviews" options={{ href: null }} />
      <Tabs.Screen name="account/watchlist" options={{ href: null }} />
    </Tabs>
  );
}
