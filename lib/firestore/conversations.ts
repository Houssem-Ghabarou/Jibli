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
  lastMessage: string;
  lastMessageAt: any;
}

export async function getOrCreateConversation(
  tripId: string,
  requestId: string,
  uid1: string,
  uid2: string
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
    lastMessage: '',
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
  });

  return ref.id;
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
  batch.update(convRef, {
    lastMessage: text,
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
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
    .onSnapshot(snapshot => {
      const messages = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      callback(messages);
    });
}

export function subscribeToConversations(
  uid: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  return firestore()
    .collection('conversations')
    .where('participants', 'array-contains', uid)
    .orderBy('lastMessageAt', 'desc')
    .onSnapshot(snapshot => {
      const conversations = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];
      callback(conversations);
    });
}
