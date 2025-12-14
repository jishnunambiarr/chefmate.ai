import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { Recipe } from '@/shared/types/recipe';
import {
  subscribeToUserRecipes,
  getUserRecipes,
  deleteRecipe as deleteRecipeService,
} from '@/shared/services/recipeService';

interface UseRecipesResult {
  recipes: Recipe[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
}

export function useRecipes(): UseRecipesResult {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserRecipes(
      user.uid,
      (newRecipes) => {
        setRecipes(newRecipes);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedRecipes = await getUserRecipes(user.uid);
      setRecipes(fetchedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Delete recipe function
  const deleteRecipe = useCallback(async (recipeId: string) => {
    await deleteRecipeService(recipeId);
    // Real-time subscription will automatically update the list
  }, []);

  return { recipes, isLoading, error, refetch, deleteRecipe };
}
