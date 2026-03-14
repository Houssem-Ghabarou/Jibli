import firestore, {
    FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { getOrCreateConversation } from "./conversations";
import { createNotification } from "./notifications";
import { Paginated, TripLocation } from "./trips";

export type OpenRequestStatus = "open" | "taken" | "cancelled";
export type OfferStatus = "pending" | "accepted" | "rejected";

export interface OpenRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  itemName: string;
  description: string;
  weightKg: number;
  reward: number;
  photoUrl: string | null;
  from: TripLocation;
  to: TripLocation;
  fromCity: string;
  toCity: string;
  status: OpenRequestStatus;
  offerCount: number;
  createdAt: any;
}

export interface OpenOffer {
  id: string;
  openRequestId: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
  status: OfferStatus;
  createdAt: any;
}

export interface CreateOpenRequestData {
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  itemName: string;
  description: string;
  weightKg: number;
  reward: number;
  from: TripLocation;
  to: TripLocation;
}

export interface OpenRequestFilters {
  from?: string;
  to?: string;
}

const PAGE_SIZE = 20;

export async function createOpenRequest(
  data: CreateOpenRequestData,
): Promise<string> {
  const ref = await firestore()
    .collection("open_requests")
    .add({
      ...data,
      fromCity: data.from.city_name.toLowerCase(),
      toCity: data.to.city_name.toLowerCase(),
      photoUrl: null,
      status: "open",
      offerCount: 0,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  return ref.id;
}

export async function getOpenRequests(
  filters?: OpenRequestFilters,
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): Promise<Paginated<OpenRequest>> {
  let q: any = firestore()
    .collection("open_requests")
    .where("status", "==", "open");
  if (filters?.from) q = q.where("fromCity", "==", filters.from.toLowerCase());
  if (filters?.to) q = q.where("toCity", "==", filters.to.toLowerCase());
  q = q.orderBy("createdAt", "desc").limit(PAGE_SIZE);
  if (cursor) q = q.startAfter(cursor);

  const snapshot = await q.get();
  const docs = snapshot.docs;
  return {
    data: docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as OpenRequest[],
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === PAGE_SIZE,
  };
}

export function subscribeToOpenRequests(
  filters: OpenRequestFilters | undefined,
  onData: (requests: OpenRequest[]) => void,
  onError?: (err: Error) => void,
): () => void {
  let q: any = firestore()
    .collection("open_requests")
    .where("status", "==", "open");
  if (filters?.from) q = q.where("fromCity", "==", filters.from.toLowerCase());
  if (filters?.to) q = q.where("toCity", "==", filters.to.toLowerCase());
  q = q.orderBy("createdAt", "desc").limit(PAGE_SIZE);
  return q.onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
    onData(
      snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as OpenRequest[],
    );
  }, onError);
}

export async function getOpenRequestById(
  id: string,
): Promise<OpenRequest | null> {
  const doc = await firestore().collection("open_requests").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as OpenRequest;
}

export async function getOpenRequestsByRequester(
  uid: string,
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): Promise<Paginated<OpenRequest>> {
  let q: any = firestore()
    .collection("open_requests")
    .where("requesterId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE);
  if (cursor) q = q.startAfter(cursor);

  const snapshot = await q.get();
  const docs = snapshot.docs;
  return {
    data: docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as OpenRequest[],
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === PAGE_SIZE,
  };
}

export async function createOffer(data: {
  openRequestId: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
}): Promise<string> {
  const ref = await firestore()
    .collection("offers")
    .add({
      ...data,
      status: "pending",
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  await firestore()
    .collection("open_requests")
    .doc(data.openRequestId)
    .update({ offerCount: firestore.FieldValue.increment(1) });

  // Notify the requester
  const orSnap = await firestore().collection('open_requests').doc(data.openRequestId).get();
  const or = orSnap.data() as any;
  if (or) {
    const { createNotification } = await import('./notifications');
    await createNotification(
      or.requesterId,
      'new_offer',
      'New Offer!',
      `${data.travelerName} offered to bring "${or.itemName}"`,
      data.openRequestId,
    );
  }

  return ref.id;
}

export async function getOffersByOpenRequest(
  openRequestId: string,
): Promise<OpenOffer[]> {
  const snapshot = await firestore()
    .collection("offers")
    .where("openRequestId", "==", openRequestId)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as OpenOffer[];
}

export async function hasExistingOffer(
  openRequestId: string,
  travelerId: string,
): Promise<boolean> {
  const snapshot = await firestore()
    .collection("offers")
    .where("openRequestId", "==", openRequestId)
    .where("travelerId", "==", travelerId)
    .get();
  return snapshot.docs.some((doc: any) => doc.data().status !== "rejected");
}

export async function acceptOffer(
  offerId: string,
  offer: OpenOffer,
  openRequest: OpenRequest,
  requesterName: string,
): Promise<string> {
  const batch = firestore().batch();
  batch.update(firestore().collection("offers").doc(offerId), {
    status: "accepted",
  });
  batch.update(firestore().collection("open_requests").doc(openRequest.id), {
    status: "taken",
  });
  await batch.commit();

  // Reject all other pending offers
  const others = await firestore()
    .collection("offers")
    .where("openRequestId", "==", openRequest.id)
    .where("status", "==", "pending")
    .get();
  if (!others.empty) {
    const rejectBatch = firestore().batch();
    others.docs.forEach((doc: any) => {
      if (doc.id !== offerId)
        rejectBatch.update(doc.ref, { status: "rejected" });
    });
    await rejectBatch.commit();
  }

  // Create conversation (use offerId as requestId for unique lookup)
  const convId = await getOrCreateConversation(
    openRequest.id,
    offerId,
    openRequest.requesterId,
    offer.travelerId,
    requesterName || "Requester",
    offer.travelerName || "Traveler",
  );

  await createNotification(
    offer.travelerId,
    "offer_accepted",
    "Offer Accepted!",
    `Your offer for "${openRequest.itemName}" was accepted`,
    openRequest.id,
  );

  return convId;
}

export async function rejectOffer(offerId: string): Promise<void> {
  await firestore()
    .collection("offers")
    .doc(offerId)
    .update({ status: "rejected" });
}

export async function cancelOpenRequest(id: string): Promise<void> {
  await firestore()
    .collection("open_requests")
    .doc(id)
    .update({ status: "cancelled" });
}

export interface AcceptedOfferWithRequest {
  offerId: string;
  openRequestId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  itemName: string;
  weightKg: number;
  reward: number;
  from: TripLocation;
  to: TripLocation;
  createdAt: any;
}

export async function getAcceptedOffersByTraveler(
  travelerId: string,
): Promise<AcceptedOfferWithRequest[]> {
  const snapshot = await firestore()
    .collection("offers")
    .where("travelerId", "==", travelerId)
    .where("status", "==", "accepted")
    .get();

  if (snapshot.empty) return [];

  const offers = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as OpenOffer[];
  const openReqs = await Promise.all(
    offers.map((o) => getOpenRequestById(o.openRequestId)),
  );

  return offers
    .map((offer, i) => {
      const or = openReqs[i];
      if (!or) return null;
      return {
        offerId: offer.id,
        openRequestId: offer.openRequestId,
        requesterId: or.requesterId,
        requesterName: or.requesterName,
        requesterAvatar: or.requesterAvatar,
        itemName: or.itemName,
        weightKg: or.weightKg,
        reward: or.reward,
        from: or.from,
        to: or.to,
        createdAt: offer.createdAt,
      };
    })
    .filter(Boolean) as AcceptedOfferWithRequest[];
}

export function subscribeToOpenRequestsByRequester(
  uid: string,
  onData: (requests: OpenRequest[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return firestore()
    .collection("open_requests")
    .where("requesterId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE)
    .onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      onData(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as OpenRequest[]);
    }, onError);
}

export function subscribeToAcceptedOffersByTraveler(
  travelerId: string,
  onData: (offers: AcceptedOfferWithRequest[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return firestore()
    .collection("offers")
    .where("travelerId", "==", travelerId)
    .where("status", "==", "accepted")
    .onSnapshot(async (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const offers = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as OpenOffer[];
      const openReqs = await Promise.all(
        offers.map((o) => getOpenRequestById(o.openRequestId)),
      );
      const result = offers
        .map((offer, i) => {
          const or = openReqs[i];
          if (!or) return null;
          return {
            offerId: offer.id,
            openRequestId: offer.openRequestId,
            requesterId: or.requesterId,
            requesterName: or.requesterName,
            requesterAvatar: or.requesterAvatar,
            itemName: or.itemName,
            weightKg: or.weightKg,
            reward: or.reward,
            from: or.from,
            to: or.to,
            createdAt: offer.createdAt,
          };
        })
        .filter(Boolean) as AcceptedOfferWithRequest[];
      onData(result);
    }, onError);
}

export interface OfferWithRequest {
  offerId: string;
  openRequestId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  itemName: string;
  weightKg: number;
  reward: number;
  from: TripLocation;
  to: TripLocation;
  createdAt: any;
}

export function subscribeToOffersByTraveler(
  travelerId: string,
  onData: (offers: OfferWithRequest[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return firestore()
    .collection('offers')
    .where('travelerId', '==', travelerId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(async (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      if (snapshot.empty) { onData([]); return; }
      const offers = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as OpenOffer[];
      const openReqs = await Promise.all(offers.map(o => getOpenRequestById(o.openRequestId)));
      const result = offers
        .map((offer, i) => {
          const or = openReqs[i];
          if (!or) return null;
          return {
            offerId: offer.id,
            openRequestId: offer.openRequestId,
            status: offer.status as 'pending' | 'accepted' | 'rejected',
            requesterId: or.requesterId,
            requesterName: or.requesterName,
            requesterAvatar: or.requesterAvatar,
            itemName: or.itemName,
            weightKg: or.weightKg,
            reward: or.reward,
            from: or.from,
            to: or.to,
            createdAt: offer.createdAt,
          };
        })
        .filter(Boolean) as OfferWithRequest[];
      onData(result);
    }, onError);
}

/** Returns a Set of openRequestIds the traveler has non-rejected offers on. */
export async function getMyOfferedOpenRequestIds(
  travelerId: string,
): Promise<Set<string>> {
  const snapshot = await firestore()
    .collection("offers")
    .where("travelerId", "==", travelerId)
    .get();
  const activeIds = snapshot.docs
    .filter((doc: any) => doc.data().status !== "rejected")
    .map((doc: any) => doc.data().openRequestId as string);
  return new Set(activeIds);
}
