import firestore from '@react-native-firebase/firestore';

export type NotificationType = 'new_request' | 'request_accepted' | 'new_message' | 'delivery_confirmed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedId: string;
  read: boolean;
  createdAt: any;
}

export async function getNotifications(uid: string): Promise<Notification[]> {
  const snapshot = await firestore()
    .collection('notifications')
    .doc(uid)
    .collection('items')
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Notification[];
}

export async function markAsRead(uid: string, notificationId: string): Promise<void> {
  await firestore()
    .collection('notifications')
    .doc(uid)
    .collection('items')
    .doc(notificationId)
    .update({ read: true });
}

export async function createNotification(
  uid: string,
  type: NotificationType,
  title: string,
  body: string,
  relatedId: string
): Promise<void> {
  await firestore()
    .collection('notifications')
    .doc(uid)
    .collection('items')
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
  callback: (notifications: Notification[]) => void
): () => void {
  return firestore()
    .collection('notifications')
    .doc(uid)
    .collection('items')
    .where('read', '==', false)
    .onSnapshot(snapshot => {
      const notifications = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      callback(notifications);
    });
}
