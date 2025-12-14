import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/shared/config/firebase';
import { Recipe, NewRecipe } from '@/shared/types/recipe';

const RECIPES_COLLECTION = 'recipes';

/**
 * Fetches all recipes for a specific user
 */
export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  const recipesRef = collection(db, RECIPES_COLLECTION);
  const q = query(
    recipesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
  })) as Recipe[];
}

/**
 * Subscribes to real-time updates for a user's recipes
 */
export function subscribeToUserRecipes(
  userId: string,
  onRecipesChange: (recipes: Recipe[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const recipesRef = collection(db, RECIPES_COLLECTION);
  const q = query(
    recipesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const recipes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
      })) as Recipe[];
      onRecipesChange(recipes);
    },
    onError
  );
}

/**
 * Adds a new recipe to Firestore
 */
export async function addRecipe(recipe: NewRecipe): Promise<string> {
  const recipesRef = collection(db, RECIPES_COLLECTION);
  const docRef = await addDoc(recipesRef, {
    ...recipe,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Deletes a recipe by ID
 */
export async function deleteRecipe(recipeId: string): Promise<void> {
  const recipeRef = doc(db, RECIPES_COLLECTION, recipeId);
  await deleteDoc(recipeRef);
}
