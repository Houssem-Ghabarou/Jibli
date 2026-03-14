import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { getFlag } from '@/data/locations';
import { getOrCreateConversation } from '@/lib/firestore/conversations';
import {
  acceptOffer,
  cancelOpenRequest,
  createOffer,
  getOffersByOpenRequest,
  getOpenRequestById,
  hasExistingOffer,
  OpenOffer,
  OpenRequest,
  rejectOffer,
} from '@/lib/firestore/openRequests';
import { TripLocation } from '@/lib/firestore/trips';
import { getUserProfile } from '@/lib/firestore/users';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function locDisplay(loc: TripLocation): { name: string; sub: string; flag: string } {
  const flag = loc.country_code ? getFlag(loc.country_code) : '';
  const sub = [loc.area, loc.country].filter(Boolean).join(', ');
  return { name: loc.city_name, sub, flag };
}

const OFFER_STATUS_COLORS: Record<string, string> = {
  pending: Colors.warning,
  accepted: Colors.success,
  rejected: '#E74C3C',
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Declined',
};

function OfferCard({
  offer,
  onAccept,
  onDecline,
  loading,
}: {
  offer: OpenOffer;
  onAccept: () => void;
  onDecline: () => void;
  loading: boolean;
}) {
  const isPending = offer.status === 'pending';
  const router = useRouter();

  return (
    <View style={styles.offerCard}>
      <View style={styles.offerRow}>
        <TouchableOpacity
          style={styles.offerTravelerRow}
          onPress={() => router.push(`/user/${offer.travelerId}` as any)}
        >
          <View style={styles.offerAvatar}>
            {offer.travelerAvatar ? (
              <Image source={{ uri: offer.travelerAvatar }} style={styles.offerAvatarImage} />
            ) : (
              <Text style={styles.offerAvatarText}>
                {offer.travelerName?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            )}
          </View>
          <Text style={styles.offerName}>{offer.travelerName}</Text>
        </TouchableOpacity>
        {!isPending && (
          <View style={[styles.offerBadge, { backgroundColor: (OFFER_STATUS_COLORS[offer.status] ?? Colors.textMuted) + '22' }]}>
            <Text style={[styles.offerBadgeText, { color: OFFER_STATUS_COLORS[offer.status] ?? Colors.textMuted }]}>
              {OFFER_STATUS_LABELS[offer.status] ?? offer.status}
            </Text>
          </View>
        )}
      </View>
      {isPending && (
        <View style={styles.offerActions}>
          <TouchableOpacity
            style={[styles.declineBtn, loading && styles.disabled]}
            onPress={onDecline}
            disabled={loading}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, loading && styles.disabled]}
            onPress={onAccept}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>Accept</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function OpenRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { confirm, showToast } = useUI();

  const [openRequest, setOpenRequest] = useState<OpenRequest | null>(null);
  const [offers, setOffers] = useState<OpenOffer[]>([]);
  const [alreadyOffered, setAlreadyOffered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [offering, setOffering] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [acceptedOffer, setAcceptedOffer] = useState<OpenOffer | null>(null);
  const [contactProfile, setContactProfile] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      getOpenRequestById(id).then(async (req) => {
        setOpenRequest(req);
        if (req) {
          const offered = await hasExistingOffer(id, user.uid);
          setAlreadyOffered(offered);

          if (req.requesterId === user.uid) {
            const allOffers = await getOffersByOpenRequest(id);
            setOffers(allOffers);
            
            // If taken, find the accepted one
            if (req.status === 'taken') {
              const accepted = allOffers.find(o => o.status === 'accepted');
              if (accepted) {
                setAcceptedOffer(accepted);
                // Fetch traveler profile
                getUserProfile(accepted.travelerId).then(setContactProfile);
                getOrCreateConversation(req.id, accepted.id, req.requesterId, accepted.travelerId, '', '').then(setConversationId);
              }
            }
          } else {
            // Check if current user is the accepted traveler
            const allOffers = await getOffersByOpenRequest(id);
            const myAcceptedOffer = allOffers.find(o => o.travelerId === user.uid && o.status === 'accepted');
            if (myAcceptedOffer) {
              setAcceptedOffer(myAcceptedOffer);
              // Fetch requester profile
              getUserProfile(req.requesterId).then(setContactProfile);
              getOrCreateConversation(req.id, myAcceptedOffer.id, req.requesterId, user.uid, '', '').then(setConversationId);
            }
          }
        }
        setLoading(false);
      });
    }, [id, user]),
  );

  const isOwner = openRequest?.requesterId === user?.uid;

  async function handleOffer() {
    if (!user || !openRequest) return;
    setOffering(true);
    try {
      const profile = await getUserProfile(user.uid);
      await createOffer({
        openRequestId: openRequest.id,
        travelerId: user.uid,
        travelerName: profile?.name ?? user.displayName ?? user.email ?? 'Unknown',
        travelerAvatar: profile?.avatarUrl ?? user.photoURL ?? null,
      });
      setAlreadyOffered(true);
      showToast('Offer sent!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send offer', 'error');
    } finally {
      setOffering(false);
    }
  }

  async function handleAcceptOffer(offer: OpenOffer) {
    if (!user || !openRequest) return;
    setActionLoadingId(offer.id);
    try {
      const profile = await getUserProfile(user.uid);
      const requesterName = profile?.name ?? user.displayName ?? user.email ?? 'Requester';
      const convId = await acceptOffer(offer.id, offer, openRequest, requesterName);
      setOpenRequest(prev => prev ? { ...prev, status: 'taken' } : prev);
      setOffers(prev => prev.map(o => ({
        ...o,
        status: o.id === offer.id ? 'accepted' : o.status === 'pending' ? 'rejected' : o.status,
      })));
      showToast('Offer accepted!', 'success');
      router.push(`/chat/${convId}` as any);
    } catch (err: any) {
      showToast(err.message || 'Failed to accept offer', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeclineOffer(offer: OpenOffer) {
    confirm({
      title: 'Decline Offer',
      message: `Decline offer from ${offer.travelerName}?`,
      dangerous: true,
      confirmText: 'Decline',
      onConfirm: async () => {
        setActionLoadingId(offer.id);
        try {
          await rejectOffer(offer.id);
          setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: 'rejected' } : o));
          showToast('Offer declined', 'info');
        } catch (err: any) {
          showToast(err.message || 'Failed to decline offer', 'error');
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  }

  async function handleCancel() {
    if (!openRequest) return;
    confirm({
      title: 'Cancel Request',
      message: 'Cancel this request? Travelers will no longer be able to offer.',
      dangerous: true,
      confirmText: 'Yes, Cancel',
      onConfirm: async () => {
        try {
          await cancelOpenRequest(openRequest.id);
          setOpenRequest(prev => prev ? { ...prev, status: 'cancelled' } : prev);
          showToast('Request cancelled', 'info');
        } catch (err: any) {
          showToast(err.message || 'Failed to cancel', 'error');
        }
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!openRequest) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Request not found</Text>
      </View>
    );
  }

  const from = locDisplay(openRequest.from);
  const to = locDisplay(openRequest.to);
  const statusCfg = openRequest.status === 'open' 
    ? { label: 'Pending', color: Colors.warning, bg: '#FFF8E1' }
    : openRequest.status === 'taken'
    ? { label: 'Accepted', color: Colors.success, bg: '#E8F8F0' }
    : { label: 'Cancelled', color: '#E74C3C', bg: '#FEE8E8' };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusCfg.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>

        {/* Route card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Route</Text>
          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <Text style={styles.flag}>{from.flag}</Text>
              <Text style={styles.routeCityName}>{from.name}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
            <View style={styles.routePoint}>
              <Text style={styles.flag}>{to.flag}</Text>
              <Text style={styles.routeCityName}>{to.name}</Text>
            </View>
          </View>
        </View>

        {/* Item card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Item</Text>
          <Text style={styles.itemNameText}>{openRequest.itemName}</Text>
          {openRequest.description ? (
            <Text style={styles.description}>{openRequest.description}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="scale-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaValue}>{openRequest.weightKg} kg</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} />
              <Text style={[styles.metaValue, { color: Colors.success }]}>{openRequest.reward} TND</Text>
            </View>
          </View>
        </View>

        {/* Contact/Action Section */}
        {openRequest.status === 'taken' && (contactProfile || acceptedOffer) ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>{isOwner ? 'Traveler' : 'Requester'}</Text>
            <View style={styles.personRow}>
              <View style={styles.avatarSmall}>
                {isOwner ? (
                  acceptedOffer?.travelerAvatar ? (
                    <Image source={{ uri: acceptedOffer.travelerAvatar }} style={styles.avatarImageSmall} />
                  ) : (
                    <Text style={styles.avatarTextSmall}>{acceptedOffer?.travelerName?.charAt(0) ?? '?'}</Text>
                  )
                ) : (
                  openRequest.requesterAvatar ? (
                    <Image source={{ uri: openRequest.requesterAvatar }} style={styles.avatarImageSmall} />
                  ) : (
                    <Text style={styles.avatarTextSmall}>{openRequest.requesterName?.charAt(0) ?? '?'}</Text>
                  )
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.personNameText}>
                  {isOwner ? acceptedOffer?.travelerName : openRequest.requesterName}
                </Text>
                <Text style={styles.personSubText}>{isOwner ? 'Traveler' : 'Requester'}</Text>
              </View>
            </View>
            
            {conversationId && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push(`/chat/${conversationId}`)}
              >
                <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
                <Text style={styles.chatBtnText}>Open Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : isOwner ? (
          // Requester view: list of offers
          <>
            {offers.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>Offers ({offers.length})</Text>
                {offers.map(offer => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onAccept={() => handleAcceptOffer(offer)}
                    onDecline={() => handleDeclineOffer(offer)}
                    loading={actionLoadingId === offer.id}
                  />
                ))}
              </View>
            ) : openRequest.status === 'open' ? (
              <View style={styles.noOffersBox}>
                <Ionicons name="time-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.noOffersText}>No offers yet</Text>
              </View>
            ) : null}

            {openRequest.status === 'open' && (
              <TouchableOpacity style={styles.cancelBtnStyled} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancel Post</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          // Visitor view
          openRequest.status === 'open' ? (
            <TouchableOpacity
              style={[styles.ctaButton, (alreadyOffered || offering) && styles.ctaDisabled]}
              onPress={handleOffer}
              disabled={alreadyOffered || offering}
            >
              {offering ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.ctaText}>
                  {alreadyOffered ? '✓ Offer Sent' : 'Offer to Deliver'}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.takenBox}>
              <Text style={styles.takenText}>This request is already taken</Text>
            </View>
          )
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
  itemNameText: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
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
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
  },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flag: { fontSize: 18 },
  routeCityName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
  },
  avatarSmall: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImageSmall: { width: 44, height: 44, borderRadius: 22 },
  avatarTextSmall: { fontSize: 18, fontWeight: '700', color: Colors.white },
  personNameText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  personSubText: { fontSize: 12, color: Colors.textSecondary },
  chatBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 24, marginTop: 8,
  },
  chatBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  ctaButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaDisabled: { backgroundColor: Colors.textMuted },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  cancelBtnStyled: {
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  // ... rest of the offer specific styles
  offerCard: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    gap: 10,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerTravelerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  offerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  offerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  offerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  offerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 10,
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
  noOffersBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  noOffersText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  takenBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  takenText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
