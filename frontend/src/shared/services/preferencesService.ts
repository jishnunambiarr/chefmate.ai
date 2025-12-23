import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { UserPreferences } from '@/shared/types/preferences';

const PREFERENCES_COLLECTION = 'preferences';

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const prefRef = doc(db, PREFERENCES_COLLECTION, userId);

  const snapshot = await getDoc(prefRef);
  if (!snapshot.exists()) {
    return null;
  }
  const data = snapshot.data();
  return {
    userId: data.userId || userId,
    name: data.name || '',
    diet: Array.isArray(data.diet) ? data.diet : [],
    allergies: data.allergies || '',
    temperatureUnit: (data.temperatureUnit as UserPreferences['temperatureUnit']) || 'Celcius',
    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
  };
}

export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  const prefRef = doc(db, PREFERENCES_COLLECTION, preferences.userId);
  await setDoc(
    prefRef,
    {
      ...preferences,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}


