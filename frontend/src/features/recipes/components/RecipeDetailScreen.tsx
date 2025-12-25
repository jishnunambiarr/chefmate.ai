import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { Recipe } from '@/shared/types/recipe';
import { deleteRecipe } from '@/shared/services/recipeService';
import { VoiceChatModal } from '@/features/voice/components/VoiceChatModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCookModalVisible, setIsCookModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    try {
      const recipeParam = params.recipe as string | undefined;
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
  }, [params.recipe]);

  const handleCookNow = () => {
    setIsCookModalVisible(true);
  };

  const handleUnsave = () => {
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
              // Navigate back after successful deletion
              router.back();
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

  const formatInstruction = (text: string) => text.replace(/^\s*\d+[.)-]?\s*/, '');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title & Description */}
        <View style={styles.titleSection}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {recipe.title}
            </Text>
            <TouchableOpacity style={styles.backArrow} onPress={handleGoBack}>
              <Text style={styles.backArrowText}>✕</Text>
            </TouchableOpacity>
          </View>
        
          {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
          )}
          <Text style={styles.createdDate}>Created on {formattedDate}</Text>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.infoCardsContainer}>
          {recipe.prepTime !== undefined && recipe.prepTime > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardIcon}>🔪</Text>
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
              <Text style={styles.infoCardIcon}>👤</Text>
              <Text style={styles.infoCardValue}>{recipe.servings}</Text>
              <Text style={styles.infoCardLabel}>Servings</Text>
            </View>
          )}
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.sectionCount}>{recipe.ingredients.length} items</Text>
          </View>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.ingredientBullet} />
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                {(ingredient.amount || ingredient.unit) && (
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount ? ingredient.amount : ''}
                    {ingredient.amount && ingredient.unit ? ' ' : ''}
                    {ingredient.unit || ''}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.sectionCount}>{recipe.instructions.length} steps</Text>
          </View>
          <View style={styles.instructionsList}>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style= {styles.instructionTextContainer}>
                  <Text style={styles.instructionText}>{formatInstruction(instruction)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer for buttons */}
        <View style={styles.buttonSpacer} />
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={[styles.actionsContainer, { paddingBottom: insets.bottom + Spacing.sm}]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.unsaveButton]}
          onPress={handleUnsave}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.unsaveButtonText}>Unsave</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cookNowButton]}
          onPress={handleCookNow}
        >
          <Text style={styles.cookNowButtonText}>Cook Now</Text>
        </TouchableOpacity>
      </View>

      {/* Cook Agent Voice Chat Modal */}
      {recipe && (
        <VoiceChatModal
          visible={isCookModalVisible}
          onClose={() => setIsCookModalVisible(false)}
          agentType="cook"
          recipe={recipe}
          title="Cook with AI Assistant"
        />
      )}
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
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backArrow: {
    padding: Spacing.sm,
  },
  backArrowText: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'left',
    maxWidth: '90%',
  },
  
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
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
    backgroundColor: Colors.surfaceOrange,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  infoCardIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  infoCardLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
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
    color: Colors.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: 16,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  ingredientsList: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  ingredientName: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    lineHeight: 24,
  },
  ingredientAmount: {
    fontSize: 18,
    color: Colors.textMuted,
    lineHeight: 24,
    marginLeft: Spacing.sm,
  },
  instructionsList: {
    gap: Spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
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
    color: Colors.text,
  },
  instructionText: {
    fontSize: 18,
    color: Colors.text,
    lineHeight: 24,
  },
  instructionTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
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
    backgroundColor: Colors.accent,
  },
  unsaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
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
