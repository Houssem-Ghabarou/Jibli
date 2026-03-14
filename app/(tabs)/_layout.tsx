import { useRef, useCallback } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationsContext';
import PostOptionsBottomSheet, { PostOptionsBottomSheetRef } from '@/components/ui/PostOptionsBottomSheet';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FABButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.fabWrapper}>
      <AnimatedPressable
        style={[styles.fab, animatedStyle]}
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        onPress={onPress}
      >
        <Ionicons name="add" size={32} color={Colors.white} />
      </AnimatedPressable>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const postSheetRef = useRef<PostOptionsBottomSheetRef>(null);
  const { unreadMessages } = useNotifications();
  const { bottom } = useSafeAreaInsets();

  const handleFABPress = useCallback(() => {
    postSheetRef.current?.present();
  }, []);

  const handleOptionSelect = useCallback(
    (option: 'trip' | 'request') => {
      if (option === 'trip') {
        router.push('/trip/create');
      } else {
        router.push('/open-request/create');
      }
    },
    [router]
  );

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60 + bottom,
          paddingBottom: bottom || 8,
          paddingTop: 8,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: '',
          tabBarButton: () => (
            <FABButton onPress={handleFABPress} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />
          ),
          tabBarBadge: unreadMessages > 0 ? (unreadMessages > 99 ? '99+' : unreadMessages) : undefined,
          tabBarBadgeStyle: { backgroundColor: '#E74C3C', fontSize: 10 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="trips" options={{ href: null }} />
    </Tabs>

    <PostOptionsBottomSheet
      ref={postSheetRef}
      onOptionSelect={handleOptionSelect}
    />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    top: -22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        borderWidth: 3,
        borderColor: Colors.white,
      },
      android: {
        elevation: 8,
        borderWidth: 3,
        borderColor: Colors.white,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 3,
        borderColor: Colors.white,
      },
    }),
  },
});
