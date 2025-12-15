import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/shared/context/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { NewRecipe } from '@/shared/types/recipe';
import { saveRecipe } from '../services/recipeApi';

export function RecipeDisplayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<NewRecipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse recipe from route params
    try {
      const recipeParam = params.recipe as string;
      if (recipeParam) {
        const parsed = JSON.parse(recipeParam);
        setRecipe(parsed);
      } else {
        setError('No recipe data provided');
      }
    } catch (err) {
      console.error('Failed to parse recipe:', err);
      setError('Invalid recipe data');
    }
  }, [params]);

  const handleSave = async () => {
    if (!recipe || !user) {
      Alert.alert('Error', 'Missing recipe or user data');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      await saveRecipe(recipe, idToken);
      
      Alert.alert(
        'Success',
        'Recipe saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save recipe';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTryAgain = () => {
    router.back();
  };

  if (error && !recipe) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={handleTryAgain}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}
      </View>

      {/* Time Information */}
      {(recipe.prepTime || recipe.cookTime) && (
        <View style={styles.timeContainer}>
          {recipe.prepTime && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Prep</Text>
              <Text style={styles.timeValue}>{recipe.prepTime} min</Text>
            </View>
          )}
          {recipe.cookTime && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Cook</Text>
              <Text style={styles.timeValue}>{recipe.cookTime} min</Text>
            </View>
          )}
          {(recipe.prepTime || 0) + (recipe.cookTime || 0) > 0 && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Total</Text>
              <Text style={styles.timeValue}>
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>{ingredient}</Text>
          </View>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleTryAgain}
          disabled={isSaving}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Save Recipe</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 16,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  bullet: {
    fontSize: 18,
    color: Colors.primary,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorBanner: {
    backgroundColor: Colors.error + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.textMuted,
  },
});
