import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Recipe } from '@/shared/types/recipe';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { deleteRecipe } from '@/shared/services/recipeService';
import { VoiceChatModal } from './VoiceChatModal';

interface SavedRecipeCardProps {
  recipe: Recipe;
  onRemove?: () => void;
}

export function SavedRecipeCard({ recipe, onRemove }: SavedRecipeCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCookModalVisible, setIsCookModalVisible] = useState(false);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleCookNow = () => {
    setIsCookModalVisible(true);
  };

  const handleRemove = () => {
    if (!recipe || !recipe.id) {
      Alert.alert('Error', 'Recipe ID is missing');
      return;
    }

    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteRecipe(recipe.id);
              // Close the modal after successful deletion
              onRemove?.();
            } catch (err) {
              console.error('Failed to delete recipe:', err);
              Alert.alert(
                'Error',
                'Failed to delete recipe. Please try again.'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={styles.card}>
        {/* Success message */}
        <Text style={styles.successMessage}>
          The recipe has been saved successfully!
        </Text>

        {/* Recipe Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          {recipe.description && (
            <Text style={styles.description}>
              {recipe.description}
            </Text>
          )}

         {recipe.ingredients.length > 0 && (
            <Text style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
              ))}
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
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.removeButtonText}>Remove from saved</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Cook Agent Voice Chat Modal */}
      <VoiceChatModal
        visible={isCookModalVisible}
        onClose={() => setIsCookModalVisible(false)}
        agentType="cook"
        recipe={recipe}
        title="Cook with AI Assistant"
      />
    </>
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
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  content: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: 18,
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
    fontSize: 16,
    color: Colors.text,
  },
  timeValue: {
    fontSize: 16,
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
    paddingVertical: Spacing.md,
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
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: Colors.accent,
  },
  removeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsList: {
    marginVertical: Spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
    marginTop: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    lineHeight: 24,
  },
});

