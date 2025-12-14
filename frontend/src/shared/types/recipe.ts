export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  createdAt: Date;
}

export type NewRecipe = Omit<Recipe, 'id' | 'createdAt'>;
