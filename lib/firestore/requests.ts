import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

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

export async function getRequestsByTrip(tripId: string): Promise<Request[]> {
  const snapshot = await firestore()
    .collection('requests')
    .where('tripId', '==', tripId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Request[];
}

export async function getSentRequests(requesterId: string): Promise<Request[]> {
  const snapshot = await firestore()
    .collection('requests')
    .where('requesterId', '==', requesterId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Request[];
}

export async function getReceivedRequests(travelerId: string): Promise<Request[]> {
  const snapshot = await firestore()
    .collection('requests')
    .where('travelerId', '==', travelerId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Request[];
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<void> {
  await firestore().collection('requests').doc(id).update({ status });
}
