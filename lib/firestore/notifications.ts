import firestore, {
    FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { Paginated } from "./trips";

export type NotificationType =
  | "new_request"
  | "request_accepted"
  | "new_message"
  | "delivery_confirmed"
  | "offer_accepted"
  | "new_offer";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedId: string;
  read: boolean;
  createdAt: any;
}

const PAGE_SIZE = 30;

export async function getNotifications(
  uid: string,
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot | null,
): Promise<Paginated<Notification>> {
  let query = firestore()
    .collection("notifications")
    .doc(uid)
    .collection("items")
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE);

  if (cursor) query = query.startAfter(cursor) as any;

  const snapshot = await query.get();
  const docs = snapshot.docs;

  return {
    data: docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[],
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore: docs.length === PAGE_SIZE,
  };
}

export async function markAsRead(
  uid: string,
  notificationId: string,
): Promise<void> {
  await firestore()
    .collection("notifications")
    .doc(uid)
    .collection("items")
    .doc(notificationId)
    .update({ read: true });
}

export async function markAllAsRead(uid: string): Promise<void> {
  const snapshot = await firestore()
    .collection("notifications")
    .doc(uid)
    .collection("items")
    .where("read", "==", false)
    .get();

  const batch = firestore().batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();
}

export async function createNotification(
  uid: string,
  type: NotificationType,
  title: string,
  body: string,
  relatedId: string,
): Promise<void> {
  await firestore()
    .collection("notifications")
    .doc(uid)
    .collection("items")
    .add({
      type,
      title,
      body,
      relatedId,
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
}

export function subscribeToNotifications(
  uid: string,
  callback: (notifications: Notification[]) => void,
): () => void {
  return firestore()
    .collection("notifications")
    .doc(uid)
    .collection("items")
    .where("read", "==", false)
    .onSnapshot(
      (snapshot) => {
        if (!snapshot || !snapshot.docs) return;
        const notifications = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        callback(notifications);
      },
      (error) => {
        console.warn("subscribeToNotifications error:", error);
      },
    );
}
