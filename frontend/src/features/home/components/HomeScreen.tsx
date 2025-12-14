import { StyleSheet, View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { useRecipes } from '@/shared/hooks/useRecipes';
import { Recipe } from '@/shared/types/recipe';
import { CreateRecipeButton } from '@/features/voice/components/CreateRecipeButton';

export function HomeScreen() {
  const { recipes, isLoading, error } = useRecipes();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>👨‍🍳</Text>
          </View>
          <Text style={styles.title}>ChefMate.AI</Text>
          <Text style={styles.subtitle}>Your personal AI cooking assistant</Text>
          
          <View style={styles.createButtonContainer}>
            <CreateRecipeButton />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Your Recipes</Text>
          
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading recipes...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Failed to load recipes</Text>
              <Text style={styles.errorSubtext}>{error.message}</Text>
            </View>
          ) : recipes.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={recipes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
              contentContainerStyle={styles.recipeList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>No recipes yet</Text>
      <Text style={styles.emptyText}>
        Tap the button above to start a voice conversation and create your first recipe!
      </Text>
      <View style={styles.featuresContainer}>
        <FeatureItem icon="🍳" text="Smart Recipes" />
        <FeatureItem icon="🥗" text="Meal Planning" />
        <FeatureItem icon="🛒" text="Shopping Lists" />
      </View>
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  return (
    <Pressable style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
        {totalTime > 0 && (
          <Text style={styles.recipeTime}>⏱️ {totalTime} min</Text>
        )}
      </View>
      <Text style={styles.recipeDescription} numberOfLines={2}>
        {recipe.description}
      </Text>
      <View style={styles.recipeFooter}>
        {recipe.servings && (
          <Text style={styles.recipeMeta}>🍽️ {recipe.servings} servings</Text>
        )}
        <Text style={styles.recipeMeta}>
          🥘 {recipe.ingredients.length} ingredients
        </Text>
      </View>
    </Pressable>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  createButtonContainer: {
    marginBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  errorSubtext: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 100,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  recipeList: {
    paddingBottom: Spacing.xl,
  },
  recipeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
    marginRight: Spacing.sm,
  },
  recipeTime: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '500',
  },
  recipeDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  recipeFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  recipeMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
