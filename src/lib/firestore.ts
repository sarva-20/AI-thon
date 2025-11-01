import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Artifact } from './types';

export const createUserProfile = async (user: FirebaseUser) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { uid, email, displayName, photoURL } = user;
    try {
      await setDoc(userRef, {
        uid,
        email,
        displayName,
        photoURL,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }
};

export const saveArtifact = async (userId: string, artifact: Omit<Artifact, 'id' | 'createdAt'> & { createdAt: Date }) => {
    try {
        const artifactsCollectionRef = collection(db, 'users', userId, 'artifacts');
        await addDoc(artifactsCollectionRef, {
            ...artifact,
            createdAt: Timestamp.fromDate(artifact.createdAt),
        });
    } catch (error) {
        console.error("Error saving artifact: ", error);
        throw new Error("Failed to save artifact to database.");
    }
};

export const getArtifacts = async (userId: string): Promise<Artifact[]> => {
    try {
        const artifactsCollectionRef = collection(db, 'users', userId, 'artifacts');
        const q = query(artifactsCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artifact));
    } catch (error) {
        console.error("Error fetching artifacts: ", error);
        return [];
    }
};
