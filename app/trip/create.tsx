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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { createTrip } from '@/lib/firestore/trips';
import { getUserProfile } from '@/lib/firestore/users';

export default function CreateTripScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [capacityKg, setCapacityKg] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!from.trim() || !to.trim() || !date.trim() || !capacityKg.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    const kg = parseFloat(capacityKg);
    if (isNaN(kg) || kg <= 0) {
      Alert.alert('Invalid Capacity', 'Enter a valid capacity in kg');
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfile(user!.uid);
      await createTrip({
        travelerId: user!.uid,
        travelerName: profile?.name ?? user!.displayName ?? 'Unknown',
        travelerAvatar: profile?.avatarUrl ?? null,
        travelerRating: profile?.rating ?? 0,
        from: from.trim(),
        to: to.trim(),
        date: date.trim(),
        capacityKg: kg,
        notes: notes.trim(),
      });
      Alert.alert('Trip Posted!', 'Your trip is now visible to requesters.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Trip</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>From *</Text>
          <TextInput
            style={styles.input}
            value={from}
            onChangeText={setFrom}
            placeholder="e.g. Tunis"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>To *</Text>
          <TextInput
            style={styles.input}
            value={to}
            onChangeText={setTo}
            placeholder="e.g. Paris"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Departure Date *</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 2024-06-15"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Available Capacity (kg) *</Text>
          <TextInput
            style={styles.input}
            value={capacityKg}
            onChangeText={setCapacityKg}
            placeholder="e.g. 5"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any extra info for requesters..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Trip Guidelines</Text>
          {[
            'Only carry legal items',
            'Verify item contents before accepting',
            'No cash, documents, or hazardous goods',
            'Coordinate pickup/delivery in public places',
          ].map((g, i) => (
            <View key={i} style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.guidelineText}>{g}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Post Trip</Text>
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
  guidelines: {
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidelineText: {
    fontSize: 13,
    color: Colors.textSecondary,
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
