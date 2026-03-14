import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  location: string | null;
  phone?: string;
  bio?: string;
  createdAt: any;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const doc = await firestore().collection("users").doc(uid).get();
  if (!doc.exists) return null;
  return { uid: doc.id, ...doc.data() } as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> {
  await firestore().collection("users").doc(uid).update(data);
}

export async function uploadAvatar(uid: string, uri: string): Promise<string> {
  const ref = storage().ref(`avatars/${uid}`);
  await ref.putFile(uri);
  const url = await ref.getDownloadURL();
  await firestore().collection("users").doc(uid).update({ avatarUrl: url });
  return url;
}
