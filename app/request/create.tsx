import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { createRequest } from '@/lib/firestore/requests';
import { getUserProfile } from '@/lib/firestore/users';
import { createNotification } from '@/lib/firestore/notifications';
import { useUI } from '@/context/UIContext';

export default function CreateRequestScreen() {
  const { tripId, travelerId, travelerName } = useLocalSearchParams<{
    tripId: string;
    travelerId: string;
    travelerName: string;
  }>();
  const { user } = useAuth();
  const router = useRouter();
  const { showToast, confirm } = useUI();

  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [reward, setReward] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!itemName.trim() || !description.trim() || !weightKg.trim() || !reward.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const kg = parseFloat(weightKg);
    const rew = parseFloat(reward);
    if (isNaN(kg) || kg <= 0 || isNaN(rew) || rew < 0) {
      showToast('Enter valid weight and reward values', 'error');
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfile(user!.uid);
      const requestId = await createRequest({
        tripId,
        travelerId,
        requesterId: user!.uid,
        requesterName: profile?.name ?? user!.displayName ?? 'Unknown',
        requesterAvatar: profile?.avatarUrl ?? null,
        itemName: itemName.trim(),
        description: description.trim(),
        weightKg: kg,
        reward: rew,
      });

      await createNotification(
        travelerId,
        'new_request',
        'New Request',
        `${profile?.name ?? 'Someone'} wants you to bring: ${itemName.trim()}`,
        requestId
      );

      confirm({
        title: 'Request Sent!',
        message: 'The traveler will review your request.',
        confirmText: 'OK',
        onConfirm: () => router.back()
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to send request', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request an Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.travelerInfo}>
          <Ionicons name="person-circle-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.travelerText}>Traveler: <Text style={styles.travelerName}>{travelerName}</Text></Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            placeholder="e.g. Olive oil, Harissa, Medina shoes"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the item, brand, quantity..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
              style={styles.input}
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="e.g. 1.5"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Reward (TND) *</Text>
            <TextInput
              style={styles.input}
              value={reward}
              onChangeText={setReward}
              placeholder="e.g. 50"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={18} color={Colors.warning} />
          <Text style={styles.warningText}>
            Prohibited: cash, documents, medications, hazardous goods, counterfeit items
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Send Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.headerDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  form: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  travelerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  travelerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  travelerName: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#7D5A00',
    lineHeight: 18,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
