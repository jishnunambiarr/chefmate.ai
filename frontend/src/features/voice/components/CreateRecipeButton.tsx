import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useConversation } from '@elevenlabs/react-native';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';

export function CreateRecipeButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  
  const { fetchConversationToken, isLoading: isTokenLoading, error: tokenError } = useVoiceSession();
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs conversation');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs conversation');
    },
    onMessage: (message) => {
      console.log('Message received:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
    },
  });

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'ChefMate needs microphone access to have a voice conversation with you.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled through Info.plist
    return true;
  };

  const handleStartConversation = async () => {
    // Request microphone permission
    const hasPermission = await requestMicrophonePermission();
    setPermissionGranted(hasPermission);
    
    if (!hasPermission) {
      return;
    }

    setIsModalVisible(true);

    // Fetch conversation token
    const token = await fetchConversationToken();
    if (!token) {
      return;
    }

    // Start the conversation session
    try {
      await conversation.startSession({
        conversationToken: token,
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
    setIsModalVisible(false);
  };

  const isConnected = conversation.status === 'connected';

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={handleStartConversation}>
        <Text style={styles.buttonIcon}>🎙️</Text>
        <Text style={styles.buttonText}>Create New Recipe</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleEndConversation}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Voice Recipe Creation</Text>
            <TouchableOpacity onPress={handleEndConversation} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {isTokenLoading ? (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.statusText}>Initializing session...</Text>
              </View>
            ) : tokenError ? (
              <View style={styles.statusContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{tokenError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleStartConversation}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : permissionGranted === false ? (
              <View style={styles.statusContainer}>
                <Text style={styles.errorIcon}>🎤</Text>
                <Text style={styles.errorText}>Microphone permission is required</Text>
              </View>
            ) : (
              <View style={styles.conversationContainer}>
                <View style={[
                  styles.voiceIndicator,
                  conversation.isSpeaking && styles.voiceIndicatorActive
                ]}>
                  <Text style={styles.voiceIndicatorIcon}>
                    {conversation.isSpeaking ? '🗣️' : '👂'}
                  </Text>
                </View>
                
                <Text style={styles.statusLabel}>
                  {isConnected 
                    ? (conversation.isSpeaking ? 'Chef is speaking...' : 'Listening to you...')
                    : 'Connecting...'}
                </Text>

                <Text style={styles.instructionText}>
                  Tell me what ingredients you have, and I'll help you create a delicious recipe!
                </Text>

                {isConnected && (
                  <TouchableOpacity 
                    style={styles.endButton} 
                    onPress={handleEndConversation}
                  >
                    <Text style={styles.endButtonText}>End Conversation</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statusContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  conversationContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  voiceIndicator: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.surfaceLight,
  },
  voiceIndicatorActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  voiceIndicatorIcon: {
    fontSize: 48,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
  endButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  endButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

