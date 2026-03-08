import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getTripById, closeTrip, Trip } from '@/lib/firestore/trips';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTripById(id).then(t => {
      setTrip(t);
      setLoading(false);
    });
  }, [id]);

  const isOwner = trip?.travelerId === user?.uid;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.routeBanner}>
          <Text style={styles.routeCity}>{trip.from}</Text>
          <Ionicons name="airplane" size={20} color={Colors.white} />
          <Text style={styles.routeCity}>{trip.to}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Traveler info */}
        <View style={styles.card}>
          <View style={styles.travelerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {trip.travelerName?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.travelerInfo}>
              <Text style={styles.travelerName}>{trip.travelerName}</Text>
              <Text style={styles.travelerRating}>★ {trip.travelerRating?.toFixed(1) ?? '—'}</Text>
            </View>
            <View style={[styles.statusBadge, trip.status === 'open' ? styles.open : styles.closed]}>
              <Text style={[styles.statusText, trip.status === 'open' ? styles.openText : styles.closedText]}>
                {trip.status === 'open' ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
        </View>

        {/* Trip details grid */}
        <View style={styles.gridCard}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Departure Date</Text>
            <Text style={styles.gridValue}>{trip.date}</Text>
          </View>
          <View style={styles.gridDivider} />
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Capacity</Text>
            <Text style={styles.gridValue}>{trip.capacityKg} kg</Text>
          </View>
        </View>

        {trip.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{trip.notes}</Text>
          </View>
        ) : null}

        {/* Actions */}
        {!isOwner && trip.status === 'open' && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() =>
              router.push({
                pathname: '/request/create',
                params: {
                  tripId: trip.id,
                  travelerId: trip.travelerId,
                  travelerName: trip.travelerName,
                },
              })
            }
          >
            <Text style={styles.ctaText}>Request Item Delivery</Text>
          </TouchableOpacity>
        )}

        {isOwner && trip.status === 'open' && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() =>
              Alert.alert('Close Trip', 'Mark this trip as closed?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Close',
                  style: 'destructive',
                  onPress: async () => {
                    await closeTrip(trip.id);
                    setTrip(prev => prev ? { ...prev, status: 'closed' } : prev);
                  },
                },
              ])
            }
          >
            <Text style={styles.closeButtonText}>Close Trip</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.headerDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  routeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  travelerRating: {
    fontSize: 14,
    color: Colors.star,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  open: {
    backgroundColor: '#E8F8F0',
  },
  closed: {
    backgroundColor: Colors.surface,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: Colors.success,
  },
  closedText: {
    color: Colors.textSecondary,
  },
  gridCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  gridItem: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  gridDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  gridLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notes: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: '#E74C3C',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#E74C3C',
    fontSize: 15,
    fontWeight: '600',
  },
});
