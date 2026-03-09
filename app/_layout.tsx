import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { UIProvider } from '@/context/UIContext';

function AuthGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === '(auth)';

    if (!user && !inAuth) {
      router.replace('/(auth)/welcome');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <UIProvider>
          <AuthProvider>
            <NotificationsProvider>
            <AuthGuard />
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="trip/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="trip/create" options={{ headerShown: false }} />
              <Stack.Screen name="request/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="request/create" options={{ headerShown: false }} />
              <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="notifications" options={{ headerShown: false }} />
              <Stack.Screen name="orders" options={{ headerShown: false }} />
              <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
              <Stack.Screen name="review/[id]" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
            </NotificationsProvider>
          </AuthProvider>
        </UIProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
