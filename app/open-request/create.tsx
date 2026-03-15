import DatePickerModal, { formatDateDisplay } from '@/components/DatePickerModal';
import LocationField, { SelectedLocation } from '@/components/LocationField';
import LocationPicker, { PickerResult } from '@/components/LocationPicker';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { createOpenRequest } from '@/lib/firestore/openRequests';
import { getUserProfile } from '@/lib/firestore/users';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useScrollToFocusedInput } from '@/hooks/useScrollToFocusedInput';
import KeyboardDoneBar, { KEYBOARD_DONE_BAR_HEIGHT } from '@/components/ui/KeyboardDoneBar';

export default function CreateOpenRequestScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useUI();
  const [fromLocation, setFromLocation] = useState<SelectedLocation | null>(null);
  const [toLocation, setToLocation] = useState<SelectedLocation | null>(null);
  const [pickerFor, setPickerFor] = useState<'from' | 'to' | null>(null);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [reward, setReward] = useState('');
  const [needByDate, setNeedByDate] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { keyboardHeight, isKeyboardVisible, dismiss } = useKeyboard();
  const { scrollRef, registerField, setLayoutY } = useScrollToFocusedInput(keyboardHeight);

  function handlePickerSelect(result: PickerResult) {
    const sel: SelectedLocation = 'custom' in result
      ? { city_id: 'custom', city_name: result.city, country: result.country, country_code: '' }
      : { city_id: result.id, city_name: result.city, country: result.country, country_code: result.country_code };
    if (pickerFor === 'from') setFromLocation(sel);
    else if (pickerFor === 'to') setToLocation(sel);
    setPickerFor(null);
  }

  async function handleCreate() {
    if (!fromLocation || !toLocation || !itemName.trim() || !weightKg.trim() || !reward.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (fromLocation.city_id === toLocation.city_id) {
      showToast('From and To cannot be the same city', 'error');
      return;
    }

    const kg = parseFloat(weightKg);
    if (isNaN(kg) || kg <= 0) {
      showToast('Enter a valid weight in kg', 'error');
      return;
    }

    const rewardAmt = parseFloat(reward);
    if (isNaN(rewardAmt) || rewardAmt <= 0) {
      showToast('Enter a valid reward amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfile(user!.uid);
      await createOpenRequest({
        requesterId: user!.uid,
        requesterName: profile?.name ?? user!.displayName ?? user!.email ?? 'Unknown',
        requesterAvatar: profile?.avatarUrl ?? user!.photoURL ?? null,
        from: fromLocation,
        to: toLocation,
        itemName: itemName.trim(),
        description: description.trim(),
        weightKg: kg,
        reward: rewardAmt,
        ...(needByDate ? { needByDate } : {}),
      });
      showToast('Request posted!', 'success');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to post request', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.form,
          { paddingBottom: 16 + keyboardHeight + (isKeyboardVisible ? KEYBOARD_DONE_BAR_HEIGHT : 0) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.field} {...registerField(0)}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            placeholder="e.g. iPhone 15 Pro, Medicines, Clothes"
            placeholderTextColor={Colors.textMuted}
            onFocus={registerField(0).onFocus}
          />
        </View>

        <View style={styles.field} {...registerField(1)}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the item, brand, size, color, quantity..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            onFocus={registerField(1).onFocus}
          />
        </View>

        <LocationField
          label="Ship From *"
          value={fromLocation}
          onChange={setFromLocation}
          placeholder="Where should the traveler pick it up?"
          onPress={() => setPickerFor('from')}
        />

        <LocationField
          label="Ship To *"
          value={toLocation}
          onChange={setToLocation}
          placeholder="Where do you need it delivered?"
          onPress={() => setPickerFor('to')}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Need By Date</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => setDatePickerOpen(true)}
          >
            <Text style={[styles.dateInputText, !needByDate && styles.dateInputPlaceholder]}>
              {needByDate ? formatDateDisplay(needByDate, needByDate) : 'Select date (optional)'}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={needByDate ? Colors.textPrimary : Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View
          style={styles.row}
          onLayout={(e) => setLayoutY([2, 3], e.nativeEvent.layout.y)}
        >
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
              style={styles.input}
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="e.g. 0.5"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              onFocus={registerField(2).onFocus}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Reward (TND) *</Text>
            <TextInput
              style={styles.input}
              value={reward}
              onChangeText={setReward}
              placeholder="e.g. 100"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              onFocus={registerField(3).onFocus}
            />
          </View>
        </View>

        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Request Guidelines</Text>
          {[
            'Only request legal items',
            'Be specific about what you need',
            'No cash, documents, or hazardous goods',
            'Agree on payment method with the traveler',
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
            <Text style={styles.buttonText}>Post Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <KeyboardDoneBar
        visible={isKeyboardVisible}
        keyboardHeight={keyboardHeight}
        onDone={dismiss}
      />
      <DatePickerModal
        visible={datePickerOpen}
        mode="single"
        initialFrom={needByDate || null}
        onConfirm={(from) => {
          setNeedByDate(from ?? '');
          setDatePickerOpen(false);
        }}
        onClose={() => setDatePickerOpen(false)}
      />
      <LocationPicker
        visible={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={handlePickerSelect}
        userLocation={null}
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
    backgroundColor: Colors.request,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  form: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  dateInputPlaceholder: {
    color: Colors.textMuted,
  },
  guidelines: {
    backgroundColor: '#F0F4FF',
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
    backgroundColor: Colors.request,
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
