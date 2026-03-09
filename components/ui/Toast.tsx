import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { ToastMessage } from '@/context/UIContext';

interface ToastProps {
  toast: ToastMessage | null;
  onHide: () => void;
}

export default function Toast({ toast, onHide }: ToastProps) {
  const { top } = useSafeAreaInsets();
  const translateY = useSharedValue(-150);
  const opacity = useSharedValue(0);

  const [localToast, setLocalToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (toast) {
      setLocalToast(toast);
      translateY.value = withSpring(top + 10, { damping: 14, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });

      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, top, translateY, opacity]);

  const hide = () => {
    translateY.value = withTiming(-150, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onHide)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // if there's no active or dismissing toast, don't render anything
  if (!localToast && !toast) return null;

  const currentToast = toast || localToast;

  const getIcon = () => {
    switch (currentToast?.type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'warning-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getColor = () => {
    switch (currentToast?.type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.accent;
      case 'info':
        return Colors.textSecondary;
      default:
        return Colors.white;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.message}>{currentToast?.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  content: {
    backgroundColor: Colors.headerDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});
