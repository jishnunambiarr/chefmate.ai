import { Recipe, NewRecipe } from '@/shared/types/recipe';

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

/**
 * Detects if a message contains JSON recipe data
 */
export function detectJsonInMessage(message: string): boolean {
  // Try to find JSON object in the message
  // Look for patterns like {...} or ```json {...} ```
  const jsonPattern = /\{[\s\S]*\}/;
  const jsonBlockPattern = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
  
  return jsonPattern.test(message) || jsonBlockPattern.test(message);
}

/**
 * Extracts JSON from a message string
 */
export function extractJsonFromMessage(message: string): string | null {
  // First try to find JSON in code blocks
  const jsonBlockMatch = message.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    return jsonBlockMatch[1].trim();
  }
  
  // Then try to find standalone JSON object
  const jsonMatch = message.match(/\{[\s\S]*\}/);
  if (jsonMatch && jsonMatch[0]) {
    return jsonMatch[0].trim();
  }
  
  return null;
}

/**
 * Parses and validates agent recipe JSON
 */
export function parseAgentRecipe(message: string): AgentRecipe | null {
  try {
    const jsonString = extractJsonFromMessage(message);
    if (!jsonString) {
      return null;
    }
    
    const parsed = JSON.parse(jsonString);
    
    // Validate required fields
    if (!parsed.name || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
      console.warn('Invalid recipe format: missing required fields');
      return null;
    }
    
    return parsed as AgentRecipe;
  } catch (error) {
    console.error('Failed to parse recipe JSON:', error);
    return null;
  }
}

/**
 * Transforms agent recipe format to frontend Recipe format
 */
export function transformAgentRecipeToRecipe(
  agentRecipe: AgentRecipe,
  userId: string
): NewRecipe {
  // Transform ingredients from {name, quantity} to string format
  const ingredients = agentRecipe.ingredients.map(
    (ing) => `${ing.quantity || ''} ${ing.name}`.trim()
  );
  
  return {
    userId,
    title: agentRecipe.name,
    description: agentRecipe.tags?.join(', ') || '',
    ingredients,
    instructions: agentRecipe.steps,
    prepTime: agentRecipe.prep_time,
    cookTime: agentRecipe.cook_time,
    servings: undefined, // Not provided by agent
    imageUrl: undefined, // Not provided by agent
  };
}
