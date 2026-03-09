import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { ConfirmOptions } from '@/context/UIContext';

interface ConfirmModalProps {
  options: ConfirmOptions | null;
  onClose: () => void;
}

export default function ConfirmModal({ options, onClose }: ConfirmModalProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const [localOptions, setLocalOptions] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    if (options) {
      setLocalOptions(options);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 120 });
    } else {
      hide();
    }
  }, [options]);

  const hide = () => {
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.9, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setLocalOptions)(null);
      }
    });
  };

  const handleConfirm = async () => {
    if (localOptions?.onConfirm) {
      await localOptions.onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (localOptions?.onCancel) {
      localOptions.onCancel();
    }
    onClose();
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const currentOpts = options || localOptions;

  return (
    <Modal transparent visible={!!currentOpts} animationType="none" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <Animated.View style={[styles.modalCard, modalStyle]}>
          <Text style={styles.title}>{currentOpts?.title}</Text>
          <Text style={styles.message}>{currentOpts?.message}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.buttonCancel} onPress={handleCancel} activeOpacity={0.7}>
              <Text style={styles.buttonCancelText}>{currentOpts?.cancelText || 'Cancel'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buttonConfirm, currentOpts?.dangerous && styles.buttonDangerous]} 
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonConfirmText}>{currentOpts?.confirmText || 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  buttonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonCancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonConfirm: {
    backgroundColor: Colors.headerDark,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonDangerous: {
    backgroundColor: Colors.accent,
  },
  buttonConfirmText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
