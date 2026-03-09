import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Paginated } from './trips';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'bought' | 'delivered' | 'completed';

export interface Request {
  id: string;
  tripId: string;
  travelerId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  itemName: string;
  description: string;
  weightKg: number;
  reward: number;
  photoUrl: string | null;
  status: RequestStatus;
  createdAt: any;
}

export interface CreateRequestData {
  tripId: string;
  travelerId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string | null;
  itemName: string;
  description: string;
  weightKg: number;
  reward: number;
  photoUri?: string;
}

const PAGE_SIZE = 20;

export async function createRequest(data: CreateRequestData): Promise<string> {
  let photoUrl: string | null = null;

  if (data.photoUri) {
    const ref = storage().ref(`request-photos/${Date.now()}`);
    await ref.putFile(data.photoUri);
    photoUrl = await ref.getDownloadURL();
  }

  const { photoUri, ...rest } = data;
  const docRef = await firestore().collection('requests').add({
    ...rest,
    photoUrl,
    status: 'pending',
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return docRef.id;
}

export async function getRequestById(id: string): Promise<Request | null> {
  const doc = await firestore().collection('requests').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Request;
}

export async function hasExistingRequest(tripId: string, requesterId: string): Promise<boolean> {
  const snapshot = await firestore()
    .collection('requests')
    .where('tripId', '==', tripId)
    .where('requesterId', '==', requesterId)
    .get();
  return !snapshot.empty;
}

export async function getRequestsByTrip(tripId: string): Promise<Request[]> {
  const snapshot = await firestore()
    .collection('requests')
    .where('tripId', '==', tripId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Request[];
}

export async function getSentRequests(
  requesterId: string,
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): Promise<Paginated<Request>> {
  let query = firestore()
    .collection('requests')
    .where('requesterId', '==', requesterId)
    .orderBy('createdAt', 'desc')
    .limit(PAGE_SIZE);

  if (cursor) query = query.startAfter(cursor) as any;

  const snapshot = await query.get();
  const docs = snapshot.docs;

  return {
    data: docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Request[],
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === PAGE_SIZE,
  };
}

export async function getReceivedRequests(
  travelerId: string,
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): Promise<Paginated<Request>> {
  let query = firestore()
    .collection('requests')
    .where('travelerId', '==', travelerId)
    .orderBy('createdAt', 'desc')
    .limit(PAGE_SIZE);

  if (cursor) query = query.startAfter(cursor) as any;

  const snapshot = await query.get();
  const docs = snapshot.docs;

  return {
    data: docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Request[],
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === PAGE_SIZE,
  };
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<void> {
  await firestore().collection('requests').doc(id).update({ status });
}

/** Returns a Set of tripIds the user has already requested on (for feed badges). */
export async function getMyRequestedTripIds(requesterId: string): Promise<Set<string>> {
  const snapshot = await firestore()
    .collection('requests')
    .where('requesterId', '==', requesterId)
    .get();
  return new Set(snapshot.docs.map((doc: any) => doc.data().tripId as string));
}
