import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export interface TripLocation {
  city_id: string;
  city_name: string;
  country: string;
  country_code: string;
  area?: string;
}

export interface Trip {
  id: string;
  tripCode: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
  from: TripLocation | string;
  to: TripLocation | string;
  fromCity: string; // lowercase, top-level — used for server-side filter
  toCity: string; // lowercase, top-level — used for server-side filter
  date: string;
  capacityKg: number;
  notes: string;
  status: "open" | "closed";
  createdAt: any;
}

export interface CreateTripData {
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
  from: TripLocation;
  to: TripLocation;
  date: string;
  capacityKg: number;
  notes: string;
}

export interface TripFilters {
  from?: string; // exact city name (from LocationPicker)
  to?: string; // exact city name (from LocationPicker)
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
}

export interface Paginated<T> {
  data: T[];
  lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

/** Generate a short unique trip code like "JBL-3K8F" */
function generateTripCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JBL-${code}`;
}

function isValidRoute(_trip: Trip): boolean {
  return true;
}

export async function getTrips(
  filters?: TripFilters,
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): Promise<Paginated<Trip>> {
  const hasDateFilter = !!(filters?.dateFrom || filters?.dateTo);

  function buildQuery(
    cur: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
  ) {
    let q: any = firestore().collection("trips").where("status", "==", "open");
    if (filters?.from)
      q = q.where("fromCity", "==", filters.from.toLowerCase());
    if (filters?.to) q = q.where("toCity", "==", filters.to.toLowerCase());
    if (filters?.dateFrom) q = q.where("date", ">=", filters.dateFrom);
    if (filters?.dateTo) q = q.where("date", "<=", filters.dateTo);
    q = hasDateFilter
      ? q.orderBy("date", "asc")
      : q.orderBy("createdAt", "desc");
    q = q.limit(PAGE_SIZE);
    if (cur) q = q.startAfter(cur);
    return q;
  }

  const results: Trip[] = [];
  let currentCursor = cursor ?? null;
  let lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null = null;
  let collectionExhausted = false;

  // Keep fetching until we have a full page of valid trips or nothing left
  while (results.length < PAGE_SIZE && !collectionExhausted) {
    const snapshot = await buildQuery(currentCursor).get();
    const docs = snapshot.docs;

    if (docs.length === 0) {
      collectionExhausted = true;
      break;
    }

    lastDoc = docs[docs.length - 1];
    const valid = (
      docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Trip[]
    ).filter(isValidRoute);
    results.push(...valid);

    if (docs.length < PAGE_SIZE) {
      collectionExhausted = true;
    } else {
      currentCursor = lastDoc;
    }
  }

  return {
    data: results.slice(0, PAGE_SIZE),
    lastDoc,
    hasMore: !collectionExhausted,
  };
}

export function subscribeToTrips(
  filters: TripFilters | undefined,
  onData: (trips: Trip[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const hasDateFilter = !!(filters?.dateFrom || filters?.dateTo);
  let q: any = firestore().collection("trips").where("status", "==", "open");
  if (filters?.from) q = q.where("fromCity", "==", filters.from.toLowerCase());
  if (filters?.to) q = q.where("toCity", "==", filters.to.toLowerCase());
  if (filters?.dateFrom) q = q.where("date", ">=", filters.dateFrom);
  if (filters?.dateTo) q = q.where("date", "<=", filters.dateTo);
  q = hasDateFilter ? q.orderBy("date", "asc") : q.orderBy("createdAt", "desc");
  q = q.limit(PAGE_SIZE);
  return q.onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
    onData(
      snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Trip[],
    );
  }, onError);
}

export async function getTripById(id: string): Promise<Trip | null> {
  const doc = await firestore().collection("trips").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Trip;
}

export async function getTripsByUser(
  uid: string,
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): Promise<Paginated<Trip>> {
  let query: any = firestore()
    .collection("trips")
    .where("travelerId", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE);

  if (cursor) query = query.startAfter(cursor);

  const snapshot = await query.get();
  const docs = snapshot.docs;

  return {
    data: docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Trip[],
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === PAGE_SIZE,
  };
}

export async function createTrip(data: CreateTripData): Promise<string> {
  const tripCode = generateTripCode();
  const ref = await firestore()
    .collection("trips")
    .add({
      ...data,
      tripCode,
      // Denormalized flat fields for server-side filtering
      fromCity: data.from.city_name.toLowerCase(),
      toCity: data.to.city_name.toLowerCase(),
      status: "open",
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  return ref.id;
}

export async function closeTrip(id: string): Promise<void> {
  await firestore().collection("trips").doc(id).update({ status: "closed" });
}
