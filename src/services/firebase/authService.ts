import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { UserProfile } from "@/types/User";

import { auth } from "./firebaseConfig";

const mapUser = (): UserProfile | null => {
  if (!auth.currentUser) return null;
  return {
    id: auth.currentUser.uid,
    email: auth.currentUser.email ?? "",
    displayName: auth.currentUser.displayName ?? "Traveler",
    photoURL: auth.currentUser.photoURL ?? undefined,
    createdAt: new Date().toISOString(),
  };
};

export const authService = {
  async login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    return mapUser();
  },
  async register(name: string, email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    return mapUser();
  },
  async logout() {
    await signOut(auth);
  },
  subscribe(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, () => callback(mapUser()));
  },
};
