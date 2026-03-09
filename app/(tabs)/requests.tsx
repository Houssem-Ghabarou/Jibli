import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getSentRequests, getReceivedRequests, Request } from '@/lib/firestore/requests';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F39C12',
  accepted: Colors.success,
  rejected: '#E74C3C',
  bought: '#3498DB',
  delivered: '#9B59B6',
  completed: Colors.success,
};

function RequestItem({ item, onPress }: { item: Request; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{item.weightKg} kg</Text>
        <Text style={styles.meta}>•</Text>
        <Text style={styles.meta}>{item.reward} TND reward</Text>
      </View>
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
          renderItem={({ item }) => (
            <RequestItem
              item={item}
              onPress={() => router.push(`/request/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.accent} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No requests yet</Text>
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
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
  },
  meta: {
    fontSize: 13,
    color: Colors.textMuted,
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
});
