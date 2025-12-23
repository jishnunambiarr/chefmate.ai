import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { SavedRecipeCard } from './SavedRecipeCard';
import { Recipe } from '@/shared/types/recipe';
import { getUserRecipes } from '@/shared/services/recipeService';
import { VoiceChatModal } from './VoiceChatModal';

export function CreateRecipeButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<Date | null>(null);
  const [savedRecipe, setSavedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);
  
  const { user } = useAuth();

  // Check for recipe created within last 1 minute
  const checkForRecentRecipe = async () => {
    if (!user) return;

    try {
      const recipes = await getUserRecipes(user.uid);
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);

      // Filter recipes created within the last 1 minute and sort by createdAt descending
      const recentRecipes = recipes
        .filter((recipe) => {
          const recipeCreatedAt = recipe.createdAt;
          return recipeCreatedAt >= oneMinuteAgo && recipeCreatedAt <= now;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Get the latest recipe (first one after sorting)
      const recentRecipe = recentRecipes[0];

      if (recentRecipe) {
        console.log('Found recent recipe:', recentRecipe.title);
        setSavedRecipe(recentRecipe);
        setIsRecipeModalVisible(true);
      } else {
        console.log('No recent recipe found');
      }
    } catch (error) {
      console.error('Error checking for recent recipe:', error);
    }
  };

  // Set chat start time when modal opens
  useEffect(() => {
    if (isModalVisible && user) {
      setChatStartTime(new Date());
    }
  }, [isModalVisible, user]);

  const handleClose = async () => {
    setIsModalVisible(false);
    
    // Check for recently saved recipe when call ends
    if (user && chatStartTime) {
      await checkForRecentRecipe();
    }
  };

  const handleCloseRecipeModal = () => {
    setIsRecipeModalVisible(false);
    setSavedRecipe(null);
  };

  const handleRemoveRecipe = () => {
    setIsRecipeModalVisible(false);
    setSavedRecipe(null);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.buttonText}>Create New Recipe</Text>
      </TouchableOpacity>

      {/* Voice Conversation Modal */}
      <VoiceChatModal
        visible={isModalVisible}
        onClose={handleClose}
        agentType="discover"
        title="Voice Recipe Creation"
      />

      {/* Saved Recipe Modal */}
      <Modal
        visible={isRecipeModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseRecipeModal}
      >
        <View style={styles.recipeModalOverlay}>
          <View style={styles.recipeModalContent}>
            {savedRecipe && (
              <SavedRecipeCard
                recipe={savedRecipe}
                onRemove={handleRemoveRecipe}
                onClose={handleCloseRecipeModal}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  // Recipe Modal Styles
  recipeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  recipeModalContent: {
    width: '100%',
    maxWidth: 600,
  },
});
