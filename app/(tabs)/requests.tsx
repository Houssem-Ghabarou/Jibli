import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getSentRequests, getReceivedRequests, updateRequestStatus, Request } from '@/lib/firestore/requests';
import { createNotification } from '@/lib/firestore/notifications';
import { getOrCreateConversation } from '@/lib/firestore/conversations';
import { getUserProfile } from '@/lib/firestore/users';

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  accepted: Colors.success,
  rejected: '#E74C3C',
  bought: '#3498DB',
  delivered: '#9B59B6',
  completed: Colors.success,
};

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending',
  accepted:  'Accepted',
  rejected:  'Declined',
  bought:    'In Progress',
  delivered: 'Delivered',
  completed: 'Completed',
};

function SentRequestCard({ item, onPress }: { item: Request; onPress: () => void }) {
  const color = STATUS_COLORS[item.status] ?? Colors.textSecondary;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.statusBadgeText, { color }]}>
            {STATUS_LABELS[item.status] ?? item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="scale-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{item.weightKg} kg</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="cash-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{item.reward} TND</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ReceivedRequestCard({
  item,
  onPress,
  onAccept,
  onDecline,
  actionLoading,
}: {
  item: Request;
  onPress: () => void;
  onAccept: () => void;
  onDecline: () => void;
  actionLoading: boolean;
}) {
  const isPending = item.status === 'pending';
  const color = STATUS_COLORS[item.status] ?? Colors.textSecondary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardTop}>
        <View style={styles.requesterRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.requesterName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.requesterInfo}>
            <Text style={styles.requesterName}>{item.requesterName}</Text>
            <Text style={styles.itemName} numberOfLines={1}>{item.itemName}</Text>
          </View>
        </View>
        {!isPending && (
          <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.statusBadgeText, { color }]}>
              {STATUS_LABELS[item.status] ?? item.status}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="scale-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{item.weightKg} kg</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="cash-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.metaText}>{item.reward} TND reward</Text>
        </View>
      </View>

      {isPending && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.declineBtn, actionLoading && styles.disabled]}
            onPress={e => { e.stopPropagation?.(); onDecline(); }}
            disabled={actionLoading}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, actionLoading && styles.disabled]}
            onPress={e => { e.stopPropagation?.(); onAccept(); }}
            disabled={actionLoading}
          >
            {actionLoading
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Text style={styles.acceptBtnText}>Accept</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RequestsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [sent, setSent] = useState<Request[]>([]);
  const [received, setReceived] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [sentCursor, setSentCursor] = useState<any>(null);
  const [receivedCursor, setReceivedCursor] = useState<any>(null);
  const [sentHasMore, setSentHasMore] = useState(false);
  const [receivedHasMore, setReceivedHasMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getSentRequests(user.uid),
      getReceivedRequests(user.uid),
    ]).then(([s, r]) => {
      setSent(s.data);
      setSentCursor(s.lastDoc);
      setSentHasMore(s.hasMore);
      setReceived(r.data);
      setReceivedCursor(r.lastDoc);
      setReceivedHasMore(r.hasMore);
      setLoading(false);
    });
  }, [user]);

  async function loadMore() {
    if (!user || loadingMore) return;
    if (tab === 'sent' && sentHasMore && sentCursor) {
      setLoadingMore(true);
      try {
        const result = await getSentRequests(user.uid, sentCursor);
        setSent(prev => [...prev, ...result.data]);
        setSentCursor(result.lastDoc);
        setSentHasMore(result.hasMore);
      } finally { setLoadingMore(false); }
    } else if (tab === 'received' && receivedHasMore && receivedCursor) {
      setLoadingMore(true);
      try {
        const result = await getReceivedRequests(user.uid, receivedCursor);
        setReceived(prev => [...prev, ...result.data]);
        setReceivedCursor(result.lastDoc);
        setReceivedHasMore(result.hasMore);
      } finally { setLoadingMore(false); }
    }
  }

  async function handleAccept(item: Request) {
    if (!user) return;
    setActionLoadingId(item.id);
    try {
      await updateRequestStatus(item.id, 'accepted');
      const travelerProfile = await getUserProfile(user.uid);
      const travelerName = travelerProfile?.name ?? user.displayName ?? 'Traveler';
      await getOrCreateConversation(
        item.tripId, item.id, item.travelerId, item.requesterId,
        travelerName, item.requesterName ?? 'Requester',
      );
      await createNotification(
        item.requesterId, 'request_accepted', 'Request Accepted!',
        `Your request for "${item.itemName}" was accepted`, item.id,
      );
      setReceived(prev => prev.map(r => r.id === item.id ? { ...r, status: 'accepted' } : r));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDecline(item: Request) {
    Alert.alert('Decline Request', 'Are you sure you want to decline this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          setActionLoadingId(item.id);
          try {
            await updateRequestStatus(item.id, 'rejected');
            setReceived(prev => prev.map(r => r.id === item.id ? { ...r, status: 'rejected' } : r));
          } finally {
            setActionLoadingId(null);
          }
        },
      },
    ]);
  }

  const data = tab === 'sent' ? sent : received;
  const pendingReceived = received.filter(r => r.status === 'pending').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'sent' && styles.tabActive]}
          onPress={() => setTab('sent')}
        >
          <Text style={[styles.tabText, tab === 'sent' && styles.tabTextActive]}>Sent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'received' && styles.tabActive]}
          onPress={() => setTab('received')}
        >
          <View style={styles.tabLabelRow}>
            <Text style={[styles.tabText, tab === 'received' && styles.tabTextActive]}>Received</Text>
            {pendingReceived > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeCount}>{pendingReceived}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) =>
            tab === 'sent'
              ? <SentRequestCard item={item} onPress={() => router.push(`/request/${item.id}`)} />
              : <ReceivedRequestCard
                  item={item}
                  onPress={() => router.push(`/request/${item.id}`)}
                  onAccept={() => handleAccept(item)}
                  onDecline={() => handleDecline(item)}
                  actionLoading={actionLoadingId === item.id}
                />
          }
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.accent} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No {tab} requests yet</Text>
              <Text style={styles.emptySubtext}>
                {tab === 'sent' ? 'Browse trips and send your first request' : 'Post a trip to start receiving requests'}
              </Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.accent,
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeCount: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  requesterInfo: {
    flex: 1,
    gap: 2,
  },
  requesterName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: Colors.success,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  disabled: {
    opacity: 0.6,
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
