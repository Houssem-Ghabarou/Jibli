import firestore from '@react-native-firebase/firestore';

export interface Trip {
  id: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
  travelerRating: number;
  from: string;
  to: string;
  date: string;
  capacityKg: number;
  notes: string;
  status: 'open' | 'closed';
  createdAt: any;
}

export interface CreateTripData {
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
  travelerRating: number;
  from: string;
  to: string;
  date: string;
  capacityKg: number;
  notes: string;
}

export interface TripFilters {
  from?: string;
  to?: string;
}

export async function getTrips(filters?: TripFilters): Promise<Trip[]> {
  let query: any = firestore()
    .collection('trips')
    .where('status', '==', 'open')
    .orderBy('createdAt', 'desc');

  const snapshot = await query.get();
  const trips = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Trip[];

  if (filters?.from) {
    return trips.filter(t =>
      t.from.toLowerCase().includes(filters.from!.toLowerCase())
    );
  }
  if (filters?.to) {
    return trips.filter(t =>
      t.to.toLowerCase().includes(filters.to!.toLowerCase())
    );
  }

  return trips;
}

export async function getTripById(id: string): Promise<Trip | null> {
  const doc = await firestore().collection('trips').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Trip;
}

export async function getTripsByUser(uid: string): Promise<Trip[]> {
  const snapshot = await firestore()
    .collection('trips')
    .where('travelerId', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Trip[];
}

export async function createTrip(data: CreateTripData): Promise<string> {
  const ref = await firestore().collection('trips').add({
    ...data,
    status: 'open',
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function closeTrip(id: string): Promise<void> {
  await firestore().collection('trips').doc(id).update({ status: 'closed' });
}
