import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Trip } from '@/lib/firestore/trips';
import { format } from 'date-fns';

interface Props {
  trip: Trip;
}

export default function TripCard({ trip }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/trip/${trip.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.travelerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {trip.travelerName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.travelerInfo}>
          <Text style={styles.travelerName}>{trip.travelerName}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{trip.travelerRating?.toFixed(1) ?? '—'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, trip.status === 'open' ? styles.open : styles.closed]}>
          <Text style={[styles.statusText, trip.status === 'open' ? styles.openText : styles.closedText]}>
            {trip.status === 'open' ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>

      <View style={styles.routeRow}>
        <Text style={styles.city}>{trip.from}</Text>
        <Text style={styles.arrow}>✈ ──────</Text>
        <Text style={styles.city}>{trip.to}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Date</Text>
          <Text style={styles.metaValue}>{trip.date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Capacity</Text>
          <Text style={styles.metaValue}>{trip.capacityKg} kg</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push(`/trip/${trip.id}`)}
      >
        <Text style={styles.ctaText}>View Trip Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  travelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    color: Colors.star,
    fontSize: 13,
  },
  rating: {
    color: Colors.textSecondary,
    fontSize: 13,
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
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  city: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  arrow: {
    color: Colors.accent,
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  ctaText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
