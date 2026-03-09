import { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { LOCATIONS, Location, getFlag, Zone } from '@/data/locations';
import { searchLocations } from '@/utils/locationSearch';

const RECENT_KEY = 'jibli_recent_locations';
const MAX_RECENT = 3;

export interface CustomLocation {
  custom: true;
  city: string;
  country: string;
}

export type PickerResult = Location | CustomLocation;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: PickerResult) => void;
  userLocation: Location | null;
}

const ZONE_LABELS: Record<Zone, string> = {
  tunisia: 'Tunisia',
  europe: 'Europe',
  north_america: 'North America',
  gulf: 'Gulf',
  north_africa: 'North Africa',
  other: 'Other Regions',
};

const ZONE_ORDER: Zone[] = ['tunisia', 'europe', 'gulf', 'north_africa', 'north_america', 'other'];

async function loadRecent(): Promise<Location[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveRecent(loc: Location) {
  try {
    const recent = await loadRecent();
    const filtered = recent.filter(r => r.id !== loc.id);
    const updated = [loc, ...filtered].slice(0, MAX_RECENT);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

type ListItem =
  | { type: 'header'; label: string }
  | { type: 'location'; location: Location }
  | { type: 'other' };

export default function LocationPicker({ visible, onClose, onSelect, userLocation }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<Location[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [customCountry, setCustomCountry] = useState('');

  useEffect(() => {
    if (visible) {
      loadRecent().then(setRecent);
      setQuery('');
      setShowCustom(false);
      setCustomCity('');
      setCustomCountry('');
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

  const snapPoints = useMemo(() => ['85%'], []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const listData = useMemo((): ListItem[] => {
    if (query.trim()) {
      const results = searchLocations(query);
      const items: ListItem[] = results.map(loc => ({ type: 'location', location: loc }));
      items.push({ type: 'other' });
      return items;
    }

    const items: ListItem[] = [];
    const shownIds = new Set<string>();

    if (userLocation) {
      items.push({ type: 'header', label: 'Near You' });
      items.push({ type: 'location', location: userLocation });
      shownIds.add(userLocation.id);
    }

    const filteredRecent = recent.filter(loc => !shownIds.has(loc.id));
    if (filteredRecent.length > 0) {
      items.push({ type: 'header', label: 'Recent' });
      filteredRecent.forEach(loc => {
        items.push({ type: 'location', location: loc });
        shownIds.add(loc.id);
      });
    }

    for (const zone of ZONE_ORDER) {
      const zoneLocations = LOCATIONS.filter(l => l.zone === zone && !shownIds.has(l.id));
      if (zoneLocations.length > 0) {
        items.push({ type: 'header', label: ZONE_LABELS[zone] });
        zoneLocations.forEach(loc => items.push({ type: 'location', location: loc }));
      }
    }

    items.push({ type: 'other' });
    return items;
  }, [query, userLocation, recent]);

  function handleSelect(loc: Location) {
    saveRecent(loc);
    onSelect(loc);
    onClose();
  }

  function handleCustomSubmit() {
    if (!customCity.trim() || !customCountry.trim()) return;
    onSelect({ custom: true, city: customCity.trim(), country: customCountry.trim() });
    onClose();
  }

  function renderItem({ item }: { item: ListItem }) {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.label}</Text>;
    }

    if (item.type === 'other') {
      if (showCustom) {
        return (
          <View style={styles.customForm}>
            <TextInput
              style={styles.customInput}
              placeholder="City name"
              placeholderTextColor={Colors.textMuted}
              value={customCity}
              onChangeText={setCustomCity}
            />
            <TextInput
              style={styles.customInput}
              placeholder="Country"
              placeholderTextColor={Colors.textMuted}
              value={customCountry}
              onChangeText={setCustomCountry}
            />
            <TouchableOpacity
              style={[styles.customSubmit, (!customCity.trim() || !customCountry.trim()) && styles.customSubmitDisabled]}
              onPress={handleCustomSubmit}
              disabled={!customCity.trim() || !customCountry.trim()}
            >
              <Text style={styles.customSubmitText}>Use this location</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <TouchableOpacity style={styles.otherRow} onPress={() => setShowCustom(true)}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
          <Text style={styles.otherText}>Other city not listed…</Text>
        </TouchableOpacity>
      );
    }

    const loc = item.location;
    const flag = getFlag(loc.country_code);
    return (
      <TouchableOpacity style={styles.locationRow} onPress={() => handleSelect(loc)}>
        <Text style={styles.flag}>{flag}</Text>
        <View style={styles.locationInfo}>
          <Text style={styles.cityName}>{loc.city}</Text>
          <Text style={styles.countryName}>
            {loc.region ? `${loc.region}, ` : ''}{loc.country}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
    >
      <BottomSheetFlatList
        data={listData}
        keyExtractor={(item, idx) => {
          if (item.type === 'header') return `h-${item.label}`;
          if (item.type === 'other') return 'other';
          return item.location.id;
        }}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city or country…"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        }
        stickyHeaderIndices={[0]}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  list: {
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    backgroundColor: Colors.background,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  flag: {
    fontSize: 24,
    width: 36,
    textAlign: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  countryName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  otherText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  customForm: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  customInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  customSubmit: {
    backgroundColor: Colors.accent,
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  customSubmitDisabled: {
    opacity: 0.5,
  },
  customSubmitText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
