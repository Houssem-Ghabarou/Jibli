import firestore from '@react-native-firebase/firestore';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl: string | null;
  createdAt: any;
}

export interface Conversation {
  id: string;
  tripId: string;
  requestId: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: any;
  unreadCounts: Record<string, number>;
}

export async function getOrCreateConversation(
  tripId: string,
  requestId: string,
  uid1: string,
  uid2: string,
  name1: string,
  name2: string,
): Promise<string> {
  const snapshot = await firestore()
    .collection('conversations')
    .where('requestId', '==', requestId)
    .get();

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  const ref = await firestore().collection('conversations').add({
    tripId,
    requestId,
    participants: [uid1, uid2],
    participantNames: { [uid1]: name1, [uid2]: name2 },
    lastMessage: '',
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
    unreadCounts: { [uid1]: 0, [uid2]: 0 },
  });

  return ref.id;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const doc = await firestore().collection('conversations').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Conversation;
}

export async function getConversations(uid: string): Promise<Conversation[]> {
  const snapshot = await firestore()
    .collection('conversations')
    .where('participants', 'array-contains', uid)
    .orderBy('lastMessageAt', 'desc')
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Conversation[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  text: string,
  imageUrl?: string
): Promise<void> {
  const batch = firestore().batch();

  const msgRef = firestore()
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .doc();

  batch.set(msgRef, {
    senderId,
    text,
    imageUrl: imageUrl ?? null,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  const convRef = firestore().collection('conversations').doc(conversationId);
  const updateData: any = {
    lastMessage: text || (imageUrl ? '📷 Photo' : ''),
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
  };

  if (recipientId) {
    updateData[`unreadCounts.${recipientId}`] = firestore.FieldValue.increment(1);
  }

  batch.update(convRef, updateData);

  await batch.commit();
}

export async function markConversationRead(conversationId: string, uid: string): Promise<void> {
  if (!uid) return;
  await firestore()
    .collection('conversations')
    .doc(conversationId)
    .update({ [`unreadCounts.${uid}`]: 0 });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  return firestore()
    .collection('conversations')
    .doc(conversationId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      snapshot => {
        if (!snapshot || !snapshot.docs) return;
        const messages = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        callback(messages);
      },
      error => {
        console.warn('subscribeToMessages error:', error);
      }
    );
}

export function subscribeToConversations(
  uid: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  return firestore()
    .collection('conversations')
    .where('participants', 'array-contains', uid)
    .orderBy('lastMessageAt', 'desc')
    .onSnapshot(
      snapshot => {
        if (!snapshot || !snapshot.docs) return;
        const conversations = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];
        callback(conversations);
      },
      error => {
        console.warn('subscribeToConversations error:', error);
      }
    );
}
