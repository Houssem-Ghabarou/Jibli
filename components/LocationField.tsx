import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { getFlag } from '@/data/locations';

export interface SelectedLocation {
  city_id: string;
  city_name: string;
  country: string;
  country_code: string;
  area?: string;
}

interface Props {
  label: string;
  value: SelectedLocation | null;
  onChange: (val: SelectedLocation | null) => void;
  placeholder: string;
  onPress: () => void;
  showArea?: boolean;
}

export default function LocationField({
  label,
  value,
  onChange,
  placeholder,
  onPress,
  showArea = true,
}: Props) {
  const flag = value?.country_code ? getFlag(value.country_code) : null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={onPress} activeOpacity={0.7}>
        {flag ? <Text style={styles.flag}>{flag}</Text> : (
          <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
        )}
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {value ? `${value.city_name}, ${value.country}` : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      {showArea && value && (
        <TextInput
          style={styles.areaInput}
          placeholder="Area / neighborhood (optional)"
          placeholderTextColor={Colors.textMuted}
          value={value.area ?? ''}
          onChangeText={area => onChange({ ...value, area })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  flag: {
    fontSize: 20,
  },
  fieldText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  areaInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 4,
  },
});
