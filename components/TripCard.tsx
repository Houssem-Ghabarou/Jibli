import { Colors } from '@/constants/theme';
import { getFlag } from '@/data/locations';
import { Trip } from '@/lib/firestore/trips';
import { getUserProfile } from '@/lib/firestore/users';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function locName(loc: Trip['from']): string {
  return typeof loc === 'string' ? loc : loc.city_name;
}
function locFlag(loc: Trip['from']): string {
  if (typeof loc === 'string') return '';
  return loc.country_code ? getFlag(loc.country_code) : '';
}
function locArea(loc: Trip['from']): string | undefined {
  return typeof loc === 'string' ? undefined : loc.area;
}

interface Props {
  trip: Trip;
  isRequested?: boolean;
}

export default function TripCard({ trip, isRequested }: Props) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(trip.travelerAvatar);

  useEffect(() => {
    if (!trip.travelerAvatar && trip.travelerId) {
      getUserProfile(trip.travelerId).then(p => {
        if (p?.avatarUrl) setAvatarUrl(p.avatarUrl);
      });
    }
  }, [trip.travelerId, trip.travelerAvatar]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/trip/${trip.id}`)}
      activeOpacity={0.85}
    >
      <View style={styles.travelerRow}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {trip.travelerName?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          )}
        </View>
        <View style={styles.travelerInfo}>
          <Text style={styles.travelerName}>{trip.travelerName}</Text>
          {trip.tripCode && (
            <Text style={styles.tripCode}>{trip.tripCode}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, trip.status === 'open' ? styles.open : styles.closed]}>
          <Text style={[styles.statusText, trip.status === 'open' ? styles.openText : styles.closedText]}>
            {trip.status === 'open' ? 'Open' : 'Closed'}
          </Text>
        </View>
        {isRequested && (
          <View style={styles.requestedBadge}>
            <Text style={styles.requestedText}>✓ Requested</Text>
          </View>
        )}
      </View>

      <View style={styles.routeRow}>
        <View style={styles.cityBlock}>
          <Text style={styles.city}>{locFlag(trip.from)} {locName(trip.from)}</Text>
          {locArea(trip.from) ? <Text style={styles.area}>{locArea(trip.from)}</Text> : null}
        </View>
        <Text style={styles.arrow}>✈</Text>
        <View style={[styles.cityBlock, styles.cityBlockRight]}>
          <Text style={styles.city}>{locFlag(trip.to)} {locName(trip.to)}</Text>
          {locArea(trip.to) ? <Text style={[styles.area, { textAlign: 'right' }]}>{locArea(trip.to)}</Text> : null}
        </View>
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
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  tripCode: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
    marginTop: 2,
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
    paddingHorizontal: 4,
    gap: 8,
  },
  cityBlock: {
    flex: 1,
  },
  cityBlockRight: {
    alignItems: 'flex-end',
  },
  city: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  area: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  arrow: {
    color: Colors.accent,
    fontSize: 16,
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
  requestedBadge: {
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
});
