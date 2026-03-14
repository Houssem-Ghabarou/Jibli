import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onOptionSelect: (option: 'trip' | 'request') => void;
}

export default function PostOptionsModal({ isVisible, onClose, onOptionSelect }: Props) {
  const handleSelect = (option: 'trip' | 'request') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOptionSelect(option);
    onClose(); // Automatically close after selection
  };

  return (
    <Modal 
      transparent 
      visible={isVisible} 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.modalCard}>
          <Text style={styles.title}>What would you like to post?</Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleSelect('trip')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="navigate" size={32} color="#1976D2" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Post a Trip</Text>
                <Text style={styles.optionSublabel}>Traveling soon? Share your trip.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, { borderBottomWidth: 0 }]}
              onPress={() => handleSelect('request')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#FBE9E7' }]}>
                <Ionicons name="gift" size={32} color={Colors.accent} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Post a Request</Text>
                <Text style={styles.optionSublabel}>Need something? Ask a traveler.</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    width: '100%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionSublabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
