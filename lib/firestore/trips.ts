import firestore from '@react-native-firebase/firestore';

export interface TripLocation {
  city_id: string;
  city_name: string;
  country: string;
  country_code: string;
  area?: string;
}

export interface Trip {
  id: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
  travelerRating: number;
  from: TripLocation | string;
  to: TripLocation | string;
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
  from: TripLocation;
  to: TripLocation;
  date: string;
  capacityKg: number;
  notes: string;
}

export interface TripFilters {
  from?: string;
  to?: string;
}

function locationName(loc: TripLocation | string): string {
  return typeof loc === 'string' ? loc : loc.city_name;
}

export async function getTrips(filters?: TripFilters): Promise<Trip[]> {
  const snapshot = await firestore()
    .collection('trips')
    .where('status', '==', 'open')
    .get();

  let trips = (snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Trip[])
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });

  if (filters?.from) {
    const q = filters.from.toLowerCase();
    trips = trips.filter(t => locationName(t.from).toLowerCase().includes(q));
  }
  if (filters?.to) {
    const q = filters.to.toLowerCase();
    trips = trips.filter(t => locationName(t.to).toLowerCase().includes(q));
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
