import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getTrips, Trip } from '@/lib/firestore/trips';
import TripCard from '@/components/TripCard';
import LocationPicker, { PickerResult } from '@/components/LocationPicker';
import { useUserLocation } from '@/hooks/useUserLocation';
import { getFlag } from '@/data/locations';

interface SearchLocation {
  city_name: string;
  country_code: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { city: detectedCity } = useUserLocation();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fromFilter, setFromFilter] = useState<SearchLocation | null>(null);
  const [toFilter, setToFilter] = useState<SearchLocation | null>(null);
  const [pickerFor, setPickerFor] = useState<'from' | 'to' | null>(null);

  async function fetchTrips(from?: string, to?: string) {
    try {
      const data = await getTrips({ from, to });
      setTrips(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchTrips(fromFilter?.city_name, toFilter?.city_name);
    }, [])
  );

  function onRefresh() {
    setRefreshing(true);
    fetchTrips(fromFilter?.city_name, toFilter?.city_name);
  }

  function onSearch() {
    setLoading(true);
    fetchTrips(fromFilter?.city_name, toFilter?.city_name);
  }

  function handlePickerSelect(result: PickerResult) {
    const loc: SearchLocation = 'custom' in result
      ? { city_name: result.city, country_code: '' }
      : { city_name: result.city, country_code: result.country_code };

    if (pickerFor === 'from') setFromFilter(loc);
    else setToFilter(loc);
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  function SearchField({ filter, placeholder, icon }: { filter: SearchLocation | null; placeholder: string; icon: string }) {
    const flag = filter?.country_code ? getFlag(filter.country_code) : null;
    return (
      <View style={styles.searchInput}>
        {flag
          ? <Text style={styles.flagSmall}>{flag}</Text>
          : <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
        }
        <Text style={[styles.searchText, !filter && styles.searchPlaceholder]} numberOfLines={1}>
          {filter ? filter.city_name : placeholder}
        </Text>
        {filter && (
          <TouchableOpacity onPress={() => {
            if (placeholder === 'From...') setFromFilter(null);
            else setToFilter(null);
          }}>
            <Ionicons name="close-circle" size={14} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.subtitle}>Find a traveler for your delivery</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={26} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setPickerFor('from')}>
            <SearchField filter={fromFilter} placeholder="From..." icon="location-outline" />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setPickerFor('to')}>
            <SearchField filter={toFilter} placeholder="To..." icon="navigate-outline" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
            <Ionicons name="search" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip Feed */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TripCard trip={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="airplane-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No trips found</Text>
              <Text style={styles.emptySubtext}>Be the first to post a trip!</Text>
            </View>
          }
        />
      )}

      <LocationPicker
        visible={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={handlePickerSelect}
        userLocation={detectedCity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.headerDark,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  flagSmall: {
    fontSize: 16,
  },
  searchText: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
  },
  searchPlaceholder: {
    color: 'rgba(255,255,255,0.5)',
  },
  searchButton: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
