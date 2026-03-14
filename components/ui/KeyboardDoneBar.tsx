import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/theme';

const BAR_HEIGHT = 44;

interface Props {
  visible: boolean;
  keyboardHeight: number;
  onDone: () => void;
}

/**
 * A bar that sits just above the keyboard with a "Done" button on the right.
 * Only render when keyboard is visible. Use inside KeyboardAvoidingView.
 */
export default function KeyboardDoneBar({ visible, keyboardHeight, onDone }: Props) {
  if (!visible || keyboardHeight <= 0) return null;

  return (
    <View
      style={[styles.bar, { bottom: keyboardHeight }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={onDone}
        style={styles.doneBtn}
        hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        activeOpacity={0.7}
      >
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

export const KEYBOARD_DONE_BAR_HEIGHT = BAR_HEIGHT;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  doneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
});
