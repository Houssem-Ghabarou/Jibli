import { Colors } from '@/constants/theme';
import { formatDateDisplay } from '@/components/DatePickerModal';
import { getFlag } from '@/data/locations';
import { OpenRequest } from '@/lib/firestore/openRequests';
import { TripLocation } from '@/lib/firestore/trips';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function locName(loc: TripLocation): string {
  return loc.city_name;
}
function locFlag(loc: TripLocation): string {
  return loc.country_code ? getFlag(loc.country_code) : '';
}

interface Props {
  request: OpenRequest;
  hasOffered?: boolean;
}

export default function OpenRequestCard({ request, hasOffered }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/open-request/${request.id}` as any)}
      activeOpacity={0.85}
    >
      <View style={styles.requesterRow}>
        <View style={styles.avatar}>
          {request.requesterAvatar ? (
            <Image source={{ uri: request.requesterAvatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {request.requesterName?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          )}
        </View>
        <View style={styles.requesterInfo}>
          <Text style={styles.requesterName}>{request.requesterName}</Text>
          <Text style={styles.itemName} numberOfLines={1}>{request.itemName}</Text>
        </View>
        {hasOffered ? (
          <View style={styles.offeredBadge}>
            <Text style={styles.offeredText}>✓ Offered</Text>
          </View>
        ) : (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Open</Text>
          </View>
        )}
      </View>

      <View style={styles.routeRow}>
        <View style={styles.cityBlock}>
          <Text style={styles.city}>{locFlag(request.from)} {locName(request.from)}</Text>
        </View>
        <View style={styles.arrowWrap}>
          <Ionicons name="navigate" size={18} color={Colors.request} />
        </View>
        <View style={[styles.cityBlock, styles.cityBlockRight]}>
          <Text style={styles.city}>{locFlag(request.to)} {locName(request.to)}</Text>
        </View>
      </View>

      {request.needByDate ? (
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Need By</Text>
            <Text style={styles.metaValue}>{formatDateDisplay(request.needByDate ?? null, request.needByDate ?? null)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Reward</Text>
            <Text style={[styles.metaValue, styles.reward]}>{request.reward} TND</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Weight</Text>
            <Text style={styles.metaValue}>{request.weightKg} kg</Text>
          </View>
        </View>
      ) : (
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Reward</Text>
            <Text style={[styles.metaValue, styles.reward]}>{request.reward} TND</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Weight</Text>
            <Text style={styles.metaValue}>{request.weightKg} kg</Text>
          </View>
          {request.offerCount > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Offers</Text>
              <Text style={styles.metaValue}>{request.offerCount}</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push(`/open-request/${request.id}` as any)}
      >
        <Text style={styles.ctaText}>View Request</Text>
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
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.request,
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
  requesterInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.request,
  },
  offeredBadge: {
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offeredText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
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
  arrowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
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
  reward: {
    color: Colors.success,
  },
  ctaButton: {
    backgroundColor: Colors.request,
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
