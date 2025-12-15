import { API_BASE_URL } from '@/shared/config/api';
import { NewRecipe, Recipe } from '@/shared/types/recipe';

/**
 * Saves a recipe to the backend
 */
export async function saveRecipe(
  recipe: NewRecipe,
  authToken: string
): Promise<Recipe> {
  const response = await fetch(`${API_BASE_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to save recipe');
  }

  const data = await response.json();
  
  // Convert createdAt string to Date
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  } as Recipe;
}
