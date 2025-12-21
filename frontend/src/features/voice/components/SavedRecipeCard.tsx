import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Recipe } from '@/shared/types/recipe';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { deleteRecipe } from '@/shared/services/recipeService';

interface SavedRecipeCardProps {
  recipe: Recipe;
  onRemove?: () => void;
}

export function SavedRecipeCard({ recipe, onRemove }: SavedRecipeCardProps) {
  const router = useRouter();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleCookNow = () => {
    router.push({
      pathname: '/(tabs)/recipe-display',
      params: {
        recipe: JSON.stringify(recipe),
      },
    });
  };

  const handleRemove = async () => {
    try {
      await deleteRecipe(recipe.id);
      onRemove?.();
    } catch (error) {
      console.error('Failed to remove recipe:', error);
    }
  };

  return (
    <View style={styles.card}>
      {/* Success message */}
      <Text style={styles.successMessage}>
        The recipe has been saved successfully!
      </Text>

      {/* Recipe Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        
        {recipe.description && (
          <Text style={styles.description} numberOfLines={2}>
            {recipe.description}
          </Text>
        )}

        {totalTime > 0 && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Total cooking time:</Text>
            <Text style={styles.timeValue}>{totalTime} min</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cookButton]}
          onPress={handleCookNow}
        >
          <Text style={styles.cookButtonText}>Cook now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.removeButton]}
          onPress={handleRemove}
        >
          <Text style={styles.removeButtonText}>Remove from saved</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  successMessage: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  content: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timeLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cookButton: {
    backgroundColor: Colors.primary,
  },
  cookButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: Colors.surfaceLight,
  },
  removeButtonText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});

