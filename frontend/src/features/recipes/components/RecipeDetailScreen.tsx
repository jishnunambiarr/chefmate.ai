import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { Recipe } from '@/shared/types/recipe';

export function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const recipeParam = params.recipe as string;
      if (recipeParam) {
        const parsed = JSON.parse(recipeParam);
        setRecipe({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
        });
      } else {
        setError('No recipe data provided');
      }
    } catch (err) {
      console.error('Failed to parse recipe:', err);
      setError('Invalid recipe data');
    }
  }, [params]);

  const handleCookNow = () => {
    // TODO: Implement cook now functionality
  };

  const handleUnsave = () => {
    // TODO: Implement unsave functionality
  };

  const handleGoBack = () => {
    router.back();
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const formattedDate = recipe.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={handleGoBack}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title & Description */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}
          <Text style={styles.createdDate}>Created on {formattedDate}</Text>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.infoCardsContainer}>
          {recipe.prepTime !== undefined && recipe.prepTime > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>⏱️</Text>
              <Text style={styles.infoCardValue}>{recipe.prepTime} min</Text>
              <Text style={styles.infoCardLabel}>Prep Time</Text>
            </View>
          )}
          {recipe.cookTime !== undefined && recipe.cookTime > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>🍳</Text>
              <Text style={styles.infoCardValue}>{recipe.cookTime} min</Text>
              <Text style={styles.infoCardLabel}>Cook Time</Text>
            </View>
          )}
          {totalTime > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>⏰</Text>
              <Text style={styles.infoCardValue}>{totalTime} min</Text>
              <Text style={styles.infoCardLabel}>Total Time</Text>
            </View>
          )}
          {recipe.servings !== undefined && recipe.servings > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>🍽️</Text>
              <Text style={styles.infoCardValue}>{recipe.servings}</Text>
              <Text style={styles.infoCardLabel}>Servings</Text>
            </View>
          )}
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🥗</Text>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.sectionCount}>{recipe.ingredients.length} items</Text>
          </View>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.sectionCount}>{recipe.instructions.length} steps</Text>
          </View>
          <View style={styles.instructionsList}>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer for buttons */}
        <View style={styles.buttonSpacer} />
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.unsaveButton]}
          onPress={handleUnsave}
        >
          <Text style={styles.unsaveButtonText}>Unsave</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cookNowButton]}
          onPress={handleCookNow}
        >
          <Text style={styles.cookNowButtonText}>🍳 Cook Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backArrow: {
    padding: Spacing.sm,
  },
  backArrowText: {
    fontSize: 24,
    color: Colors.white,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  titleSection: {
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
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  createdDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  infoCardIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  infoCardLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textMuted,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  ingredientsList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
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
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
  },
  instructionsList: {
    gap: Spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
  },
  buttonSpacer: {
    height: 100,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  unsaveButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  unsaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  cookNowButton: {
    backgroundColor: Colors.primary,
  },
  cookNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
