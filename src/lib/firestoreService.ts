import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { TrainingData, GeneratedBid, BlockedKeyword, AISettings, OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'public',
      email: 'public@guest.com',
      emailVerified: true,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const PUBLIC_USER_ID = 'public';

export const firestoreService = {
  // Training Data
  async getTrainingData(): Promise<TrainingData[]> {
    const path = 'training_data';
    try {
      const q = query(collection(db, path), where('userId', '==', PUBLIC_USER_ID));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingData));
      return data.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      handleFirestoreError(error, 'list', path);
      return [];
    }
  },

  async addTrainingData(data: Omit<TrainingData, 'id' | 'userId'>) {
    const path = 'training_data';
    try {
      return await addDoc(collection(db, path), { ...data, userId: PUBLIC_USER_ID });
    } catch (error) {
      handleFirestoreError(error, 'create', path);
    }
  },

  async updateTrainingData(id: string, data: Partial<TrainingData>) {
    const path = 'training_data';
    try {
      return await updateDoc(doc(db, path, id), data);
    } catch (error) {
      handleFirestoreError(error, 'update', path);
    }
  },

  async deleteTrainingData(id: string) {
    const path = 'training_data';
    try {
      return await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, 'delete', path);
    }
  },

  // Generated Bids
  async getGeneratedBids(): Promise<GeneratedBid[]> {
    const path = 'generated_bids';
    try {
      const q = query(collection(db, path), where('userId', '==', PUBLIC_USER_ID), limit(50));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneratedBid));
      return data.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      handleFirestoreError(error, 'list', path);
      return [];
    }
  },

  async addGeneratedBid(data: Omit<GeneratedBid, 'id' | 'userId'>) {
    const path = 'generated_bids';
    try {
      return await addDoc(collection(db, path), { ...data, userId: PUBLIC_USER_ID });
    } catch (error) {
      handleFirestoreError(error, 'create', path);
    }
  },

  // Blocked Keywords
  async getBlockedKeywords(): Promise<BlockedKeyword[]> {
    const path = 'blocked_keywords';
    try {
      const q = query(collection(db, path), where('userId', '==', PUBLIC_USER_ID));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlockedKeyword));
    } catch (error) {
      handleFirestoreError(error, 'list', path);
      return [];
    }
  },

  async addBlockedKeyword(phrase: string) {
    const path = 'blocked_keywords';
    try {
      return await addDoc(collection(db, path), { userId: PUBLIC_USER_ID, phrase, createdAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, 'create', path);
    }
  },

  // AI Settings
  async getAISettings(): Promise<AISettings | null> {
    const path = 'ai_settings';
    try {
      const q = query(collection(db, path), where('userId', '==', PUBLIC_USER_ID), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return snapshot.docs[0].data() as AISettings;
    } catch (error) {
      handleFirestoreError(error, 'get', path);
      return null;
    }
  },

  async updateAISettings(settings: Partial<AISettings>) {
    const path = 'ai_settings';
    try {
      const q = query(collection(db, path), where('userId', '==', PUBLIC_USER_ID), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return await addDoc(collection(db, path), { userId: PUBLIC_USER_ID, ...settings });
      } else {
        return await updateDoc(doc(db, path, snapshot.docs[0].id), settings);
      }
    } catch (error) {
      handleFirestoreError(error, 'update', path);
    }
  }
};
