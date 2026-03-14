import React, { useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export type PostOption = 'trip' | 'request';

interface Props {
  onClose?: () => void;
  onOptionSelect: (option: PostOption) => void;
}

export type PostOptionsBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
};

const SNAP_POINTS = ['48%'];

const TRIP_BG = '#FFEBE8';      // accent-tinted (trip)
const REQUEST_BG = '#EEF0FF';   // request blue tint (request)

const PostOptionsBottomSheet = forwardRef<PostOptionsBottomSheetRef, Props>(
  function PostOptionsBottomSheet({ onClose, onOptionSelect }, ref) {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { bottom: safeBottom } = useSafeAreaInsets();

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const handleSelect = useCallback(
      (option: PostOption) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onOptionSelect(option);
        bottomSheetRef.current?.dismiss();
      },
      [onOptionSelect]
    );

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const handleChange = useCallback(
      (index: number) => {
        if (index === -1) onClose?.();
      },
      [onClose]
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
        onChange={handleChange}
      >
        <BottomSheetView style={[styles.content, { paddingBottom: safeBottom + 20 }]}>
          <Text style={styles.title}>Create new</Text>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => handleSelect('trip')}
              activeOpacity={0.75}
            >
              <View style={[styles.tileIconWrap, { backgroundColor: TRIP_BG }]}>
                <Ionicons name="navigate" size={36} color={Colors.accent} />
              </View>
              <Text style={styles.tileLabel}>Post a Trip</Text>
              <Text style={styles.tileSublabel}>Share your journey</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tile}
              onPress={() => handleSelect('request')}
              activeOpacity={0.75}
            >
              <View style={[styles.tileIconWrap, { backgroundColor: REQUEST_BG }]}>
                <Ionicons name="bag-handle" size={36} color={Colors.request} />
              </View>
              <Text style={styles.tileLabel}>Post a Request</Text>
              <Text style={styles.tileSublabel}>Ask a traveler</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => bottomSheetRef.current?.dismiss()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  handle: {
    backgroundColor: Colors.border,
    width: 36,
  },
  sheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  tileIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  tileSublabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostOptionsBottomSheet;
