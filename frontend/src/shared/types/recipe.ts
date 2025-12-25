export interface Ingredient {
  name: string;
  amount?: number;
  unit?: string;
}

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  createdAt: Date;
}

export type NewRecipe = Omit<Recipe, 'id' | 'createdAt'>;

/**
 * Agent recipe format (as received from ElevenLabs agent)
 */
export interface AgentRecipe {
  name: string;
  ingredients: Array<{ name: string; quantity: string }>;
  steps: string[];
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  tags?: string[];
}
