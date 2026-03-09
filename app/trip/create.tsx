import { useState, useEffect } from 'react';
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
import LocationField, { SelectedLocation } from '@/components/LocationField';
import LocationPicker, { PickerResult } from '@/components/LocationPicker';
import { useUserLocation } from '@/hooks/useUserLocation';
import DatePickerModal, { formatDateDisplay } from '@/components/DatePickerModal';

export default function CreateTripScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { city: detectedCity } = useUserLocation();

  const [fromLocation, setFromLocation] = useState<SelectedLocation | null>(null);
  const [toLocation, setToLocation] = useState<SelectedLocation | null>(null);
  const [pickerFor, setPickerFor] = useState<'from' | 'to' | null>(null);
  const [date, setDate] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [capacityKg, setCapacityKg] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (detectedCity && !fromLocation) {
      setFromLocation({
        city_id: detectedCity.id,
        city_name: detectedCity.city,
        country: detectedCity.country,
        country_code: detectedCity.country_code,
      });
    }
  }, [detectedCity]);

  function handlePickerSelect(result: PickerResult) {
    const sel: SelectedLocation = 'custom' in result
      ? { city_id: 'custom', city_name: result.city, country: result.country, country_code: '' }
      : { city_id: result.id, city_name: result.city, country: result.country, country_code: result.country_code };
    if (pickerFor === 'from') setFromLocation(sel);
    else if (pickerFor === 'to') setToLocation(sel);
    setPickerFor(null);
  }

  async function handleCreate() {
    if (!fromLocation || !toLocation || !date || !capacityKg.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    const fromCode = fromLocation.country_code ?? fromLocation.country;
    const toCode = toLocation.country_code ?? toLocation.country;
    const involvesTunisia = fromCode === 'TN' || toCode === 'TN';
    if (!involvesTunisia) {
      Alert.alert('Invalid Route', 'At least one end of the trip must be Tunisia. Jibli connects Tunisia with the world.');
      return;
    }
    if (fromCode === toCode) {
      Alert.alert('Invalid Route', 'From and To must be in different countries.');
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
        travelerName: profile?.name ?? user!.displayName ?? user!.email ?? 'Unknown',
        travelerAvatar: profile?.avatarUrl ?? user!.photoURL ?? null,
        travelerRating: profile?.rating ?? 0,
        from: fromLocation,
        to: toLocation,
        date: date.trim(),
        capacityKg: kg,
        notes: notes.trim(),
      });
      router.back();
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
        <LocationField
          label="From *"
          value={fromLocation}
          onChange={setFromLocation}
          placeholder="Departure city"
          onPress={() => setPickerFor('from')}
        />

        <LocationField
          label="To *"
          value={toLocation}
          onChange={setToLocation}
          placeholder="Destination city"
          onPress={() => setPickerFor('to')}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Departure Date *</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => setDatePickerOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={date ? Colors.textPrimary : Colors.textMuted}
            />
            <Text style={[styles.dateInputText, !date && styles.dateInputPlaceholder]}>
              {date ? formatDateDisplay(date, date) : 'Select date'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
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

      <LocationPicker
        visible={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={handlePickerSelect}
        userLocation={detectedCity}
      />

      <DatePickerModal
        visible={datePickerOpen}
        mode="single"
        initialFrom={date || null}
        onConfirm={(from) => {
          setDate(from);
          setDatePickerOpen(false);
        }}
        onClose={() => setDatePickerOpen(false)}
      />
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  dateInputPlaceholder: {
    color: Colors.textMuted,
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
