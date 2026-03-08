import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getTrips, Trip } from '@/lib/firestore/trips';
import TripCard from '@/components/TripCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  async function fetchTrips() {
    try {
      const data = await getTrips({
        from: searchFrom.trim() || undefined,
        to: searchTo.trim() || undefined,
      });
      setTrips(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchTrips();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    fetchTrips();
  }

  function onSearch() {
    setLoading(true);
    fetchTrips();
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

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
          <View style={styles.searchInput}>
            <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchText}
              value={searchFrom}
              onChangeText={setSearchFrom}
              placeholder="From..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={styles.searchInput}>
            <Ionicons name="navigate-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.searchText}
              value={searchTo}
              onChangeText={setSearchTo}
              placeholder="To..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
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
  searchText: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
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
