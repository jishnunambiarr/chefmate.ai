import { StyleSheet, View, Text, FlatList, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
// #region agent log
fetch('http://127.0.0.1:7242/ingest/05a29dec-4f79-4359-b311-1b867eb9c6b2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeScreen.tsx:2',message:'LinearGradient import check',data:{imported:!!LinearGradient,type:typeof LinearGradient,isFunction:typeof LinearGradient==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { useRecipes } from '@/shared/hooks/useRecipes';
import { Recipe } from '@/shared/types/recipe';
import { CreateRecipeButton } from '@/features/voice/components/CreateRecipeButton';
import { useState, useMemo } from 'react';

export function HomeScreen() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/05a29dec-4f79-4359-b311-1b867eb9c6b2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomeScreen.tsx:15',message:'HomeScreen rendering',data:{hasLinearGradient:!!LinearGradient},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const { recipes, isLoading, error } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort recipes based on search query
  const filteredAndSortedRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return recipes;
    }

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(word => word.length > 0);

    // Score each recipe based on how well it matches the search
    const scoredRecipes = recipes.map(recipe => {
      let score = 0;
      const titleLower = recipe.title.toLowerCase();
      const descriptionLower = recipe.description?.toLowerCase() || '';
      const ingredientsLower = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');

      // Check each query word
      queryWords.forEach(word => {
        // Title matches get highest score (10 points per word)
        if (titleLower.includes(word)) {
          score += 10;
          // Exact title match gets bonus
          if (titleLower === query) {
            score += 20;
          }
        }
        
        // Description matches get medium score (5 points per word)
        if (descriptionLower.includes(word)) {
          score += 5;
        }
        
        // Ingredient matches get lower score (3 points per word)
        if (ingredientsLower.includes(word)) {
          score += 3;
        }
      });

      return { recipe, score };
    });

    // Separate recipes into matches and non-matches
    const matches = scoredRecipes.filter(item => item.score > 0);
    const nonMatches = scoredRecipes.filter(item => item.score === 0);

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    // Combine: best matches first, then all other recipes
    return [
      ...matches.map(item => item.recipe),
      ...nonMatches.map(item => item.recipe)
    ];
  }, [recipes, searchQuery]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>ChefMate.AI</Text>
            <Text style={styles.subtitle}>Your personal AI cooking assistant</Text>
            
            <View style={styles.createButtonContainer}>
              <CreateRecipeButton />
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Your Recipes</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search recipes..."
                  placeholderTextColor={Colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            
            {isLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading recipes...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load recipes</Text>
                <Text style={styles.errorSubtext}>{error.message}</Text>
                
                {(() => {
                  console.log('Error:', error.message);
                  return null;
                })()}
              
              </View>
            ) : filteredAndSortedRecipes.length === 0 ? (
              <EmptyState />
            ) : (
              <FlatList
                data={filteredAndSortedRecipes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                contentContainerStyle={styles.recipeList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </SafeAreaView>
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
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  return (
    <Pressable
      style={styles.recipeCard}
      onPress={() =>
        router.push({
          // Cast to relax strict route typing for this dynamic screen
          pathname: '/recipe-detail' as any,
          params: {
            // Serialize date for navigation; parsed back in RecipeDetailScreen
            recipe: JSON.stringify({
              ...recipe,
              createdAt: recipe.createdAt.toISOString(),
            }),
          },
        })
      }
    >
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
        {totalTime > 0 && (
          <Text style={styles.recipeTime}>⏰ {totalTime} min</Text>
        )}
      </View>
      <Text style={styles.recipeDescription} numberOfLines={2}>
        {recipe.description}
      </Text>
      <View style={styles.recipeFooter}>
        {recipe.servings && (
          <Text style={styles.recipeMeta}>👤 {recipe.servings} servings</Text>
        )}
        <Text style={styles.recipeMeta}>
        🥘 {recipe.ingredients.length} ingredients
        </Text>
      </View>
    </Pressable>
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
    paddingTop: Spacing.lg,
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
    color: Colors.text,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: 16,
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
    color: Colors.text,
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
    backgroundColor: Colors.accent,
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
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
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
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  recipeTime: {
    fontSize: 13,
    color: Colors.text,
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
