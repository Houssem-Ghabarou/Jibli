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
import { getRequestById, updateRequestStatus, Request } from '@/lib/firestore/requests';
import { getOrCreateConversation } from '@/lib/firestore/conversations';
import { createNotification } from '@/lib/firestore/notifications';

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  accepted: Colors.success,
  rejected: '#E74C3C',
  bought: '#3498DB',
  delivered: '#9B59B6',
  completed: Colors.success,
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    getRequestById(id).then(r => {
      setRequest(r);
      setLoading(false);
      if (r && r.status === 'accepted') {
        getOrCreateConversation(r.tripId, r.id, r.travelerId, r.requesterId).then(cid => {
          setConversationId(cid);
        });
      }
    });
  }, [id]);

  const isTraveler = request?.travelerId === user?.uid;

  async function handleAccept() {
    if (!request) return;
    setActionLoading(true);
    try {
      await updateRequestStatus(request.id, 'accepted');
      const cid = await getOrCreateConversation(
        request.tripId,
        request.id,
        request.travelerId,
        request.requesterId
      );
      setConversationId(cid);
      await createNotification(
        request.requesterId,
        'request_accepted',
        'Request Accepted!',
        `Your request for "${request.itemName}" was accepted`,
        request.id
      );
      setRequest(prev => prev ? { ...prev, status: 'accepted' } : prev);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!request) return;
    Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await updateRequestStatus(request.id, 'rejected');
            setRequest(prev => prev ? { ...prev, status: 'rejected' } : prev);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Request not found</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[request.status] ?? Colors.textSecondary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status */}
        <View style={[styles.statusBar, { backgroundColor: statusColor + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Text>
        </View>

        {/* Item */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Item</Text>
          <Text style={styles.itemName}>{request.itemName}</Text>
          <Text style={styles.description}>{request.description}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Weight</Text>
              <Text style={styles.metaValue}>{request.weightKg} kg</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Reward</Text>
              <Text style={styles.metaValue}>{request.reward} TND</Text>
            </View>
          </View>
        </View>

        {/* Requester */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Requester</Text>
          <View style={styles.personRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {request.requesterName?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.personName}>{request.requesterName}</Text>
          </View>
        </View>

        {/* Actions */}
        {isTraveler && request.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.rejectButton, actionLoading && styles.disabled]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptButton, actionLoading && styles.disabled]}
              onPress={handleAccept}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.acceptText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {request.status === 'accepted' && conversationId && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push(`/chat/${conversationId}`)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
            <Text style={styles.chatText}>Open Chat</Text>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E74C3C',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  rejectText: {
    color: '#E74C3C',
    fontSize: 15,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  acceptText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  chatButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
  },
  chatText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
