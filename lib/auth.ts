import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type User = FirebaseAuthTypes.User;

export async function register(name: string, email: string, password: string): Promise<User> {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  const user = credential.user;

  await user.updateProfile({ displayName: name });

  await firestore().collection('users').doc(user.uid).set({
    name,
    email,
    avatarUrl: null,
    location: null,
    rating: 0,
    deliveryCount: 0,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return user;
}

export async function login(email: string, password: string): Promise<User> {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  return credential.user;
}

export async function logout(): Promise<void> {
  await auth().signOut();
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return auth().onAuthStateChanged(callback);
}

export function currentUser(): User | null {
  return auth().currentUser;
}
