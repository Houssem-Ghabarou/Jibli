import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getRequestById, updateRequestStatus, Request } from '@/lib/firestore/requests';
import { getOrCreateConversation } from '@/lib/firestore/conversations';
import { getUserProfile } from '@/lib/firestore/users';
import { createNotification } from '@/lib/firestore/notifications';
import { useUI } from '@/context/UIContext';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: Colors.warning,   bg: '#FFF8E1' },
  accepted:  { label: 'Accepted',  color: Colors.success,   bg: '#E8F8F0' },
  rejected:  { label: 'Declined',  color: '#E74C3C',        bg: '#FEE8E8' },
  bought:    { label: 'Bought',    color: '#3498DB',        bg: '#E8F4FD' },
  delivered: { label: 'Delivered', color: '#9B59B6',        bg: '#F4ECF7' },
  completed: { label: 'Completed', color: Colors.success,   bg: '#E8F8F0' },
};

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { showToast, confirm } = useUI();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getRequestById(id).then(r => {
        setRequest(r);
        setLoading(false);
        if (r && r.status !== 'pending' && r.status !== 'rejected') {
          getOrCreateConversation(
            r.tripId, r.id, r.travelerId, r.requesterId, '', r.requesterName ?? ''
          ).then(setConversationId);
        }
      });
    }, [id])
  );

  const isTraveler = request?.travelerId === user?.uid;

  async function handleAccept() {
    if (!request) return;
    setActionLoading(true);
    try {
      await updateRequestStatus(request.id, 'accepted');
      const travelerProfile = await getUserProfile(request.travelerId);
      const travelerName = travelerProfile?.name ?? user?.displayName ?? 'Traveler';
      const cid = await getOrCreateConversation(
        request.tripId, request.id,
        request.travelerId, request.requesterId,
        travelerName, request.requesterName ?? 'Requester',
      );
      setConversationId(cid);
      await createNotification(
        request.requesterId, 'request_accepted',
        'Request Accepted!',
        `Your request for "${request.itemName}" was accepted`,
        request.id,
      );
      setRequest(prev => prev ? { ...prev, status: 'accepted' } : prev);
      showToast('Request accepted successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to accept request', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!request) return;
    confirm({
      title: 'Cancel Request',
      message: 'Are you sure you want to cancel this request?',
      dangerous: true,
      confirmText: 'Yes, Cancel',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateRequestStatus(request.id, 'cancelled');
          setRequest(prev => prev ? { ...prev, status: 'cancelled' } : prev);
          showToast('Request cancelled', 'info');
        } catch (err: any) {
          showToast(err.message || 'Failed to cancel', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  }

  async function handleDecline() {
    if (!request) return;
    confirm({
      title: 'Decline Request',
      message: 'Are you sure you want to decline this request?',
      dangerous: true,
      confirmText: 'Decline',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateRequestStatus(request.id, 'rejected');
          setRequest(prev => prev ? { ...prev, status: 'rejected' } : prev);
          showToast('Request declined', 'info');
        } catch (err: any) {
          showToast(err.message || 'Failed to decline', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.accent} size="large" /></View>;
  }

  if (!request) {
    return <View style={styles.center}><Text style={styles.notFound}>Request not found</Text></View>;
  }

  const statusCfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;

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

        {/* Status badge */}
        <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>

        {/* Item card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Item</Text>
          <Text style={styles.itemName}>{request.itemName}</Text>
          <Text style={styles.description}>{request.description}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="scale-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaValue}>{request.weightKg} kg</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaValue}>{request.reward} TND</Text>
            </View>
          </View>
        </View>

        {/* Requester card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Requester</Text>
          <View style={styles.personRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {request.requesterName?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.personName}>{request.requesterName}</Text>
          </View>
        </View>

        {/* Actions */}
        {isTraveler && request.status === 'pending' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.declineBtn, actionLoading && styles.disabled]}
              onPress={handleDecline}
              disabled={actionLoading}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, actionLoading && styles.disabled]}
              onPress={handleAccept}
              disabled={actionLoading}
            >
              {actionLoading
                ? <ActivityIndicator color={Colors.white} size="small" />
                : <Text style={styles.acceptBtnText}>Accept</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Cancel — requester only, pending only */}
        {!isTraveler && request.status === 'pending' && (
          <TouchableOpacity
            style={[styles.cancelBtn, actionLoading && styles.disabled]}
            onPress={handleCancel}
            disabled={actionLoading}
          >
            {actionLoading
              ? <ActivityIndicator color={Colors.textSecondary} size="small" />
              : <Text style={styles.cancelBtnText}>Cancel Request</Text>
            }
          </TouchableOpacity>
        )}

        {/* Open chat once accepted */}
        {conversationId && request.status !== 'rejected' && (
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => router.push(`/chat/${conversationId}`)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
            <Text style={styles.chatBtnText}>Open Chat</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: Colors.textSecondary },
  header: {
    backgroundColor: Colors.headerDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 15, fontWeight: '700' },
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  metaValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  personName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  actionRow: { flexDirection: 'row', gap: 12 },
  declineBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 24,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  declineBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  acceptBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 24,
    alignItems: 'center', backgroundColor: Colors.success,
  },
  acceptBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  chatBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 24,
  },
  chatBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  disabled: { opacity: 0.6 },
});
