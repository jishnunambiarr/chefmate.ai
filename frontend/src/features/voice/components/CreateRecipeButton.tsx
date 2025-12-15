import { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { useAuth } from '@/shared/context/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { parseAgentRecipe, transformAgentRecipeToRecipe } from '../utils/recipeParser';

export function CreateRecipeButton() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const { fetchConversationToken, isLoading: isTokenLoading, error: tokenError } = useVoiceSession();
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs conversation');
      setConnectionStatus('connected');
      setConversationError(null);
      // Ensure microphone is unmuted after connection is established
      setTimeout(() => {
        conversation.setMicMuted(false);
        setIsMicMuted(false);
        console.log('Microphone unmuted after connection');
      }, 500);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs conversation');
      setConnectionStatus('disconnected');
      setIsModalVisible(false);
    },
    onMessage: (message: any) => {
      try {
        console.log('Message received:', JSON.stringify(message, null, 2));
        
        // Check if message contains JSON recipe
        // Message can be a string or an object with text property
        let messageText: string;
        if (typeof message === 'string') {
          messageText = message;
        } else if (message && typeof message === 'object') {
          // Try to extract text from various possible properties
          messageText = (message as any).text || (message as any).message || JSON.stringify(message);
        } else {
          messageText = String(message);
        }
        
        console.log('Extracted message text:', messageText.substring(0, 200));
        
        const agentRecipe = parseAgentRecipe(messageText);
        
        if (agentRecipe && user) {
          console.log('Recipe detected:', agentRecipe.name);
          
          // Transform agent recipe to frontend format
          const recipe = transformAgentRecipeToRecipe(agentRecipe, user.uid);
          
          // End the conversation session to prevent reading JSON
          // Do this asynchronously to not block the message handler
          conversation.endSession().catch((error: any) => {
            console.log('Session end (expected):', error?.message || error);
          });
          
          // Close modal
          setIsModalVisible(false);
          
          // Navigate to recipe display screen with recipe data
          router.push({
            pathname: '/(tabs)/recipe-display',
            params: {
              recipe: JSON.stringify(recipe),
            },
          });
        }
      } catch (error: any) {
        console.error('Error processing message:', error?.message || error);
      }
    },
    onError: (error: any) => {
      // Ignore WebSocket closure errors that occur during normal disconnection
      const errorMessage = (typeof error === 'object' && error?.message) 
        ? String(error.message) 
        : (typeof error === 'string' ? error : String(error));
      const isWebSocketClosureError = 
        errorMessage.includes('WebSocket') ||
        errorMessage.includes('websocket') ||
        errorMessage.includes('CLOSED') ||
        errorMessage.includes('CLOSING');
      
      // Only log non-closure errors
      if (!isWebSocketClosureError) {
        console.error('Conversation error:', error);
        setConversationError(errorMessage || 'An error occurred during the conversation');
      } else {
        // Silently ignore WebSocket closure errors during disconnection
        console.log('WebSocket closure (expected during disconnect)');
      }
    },
    onStatusChange: (prop) => {
      console.log('Conversation status changed:', prop.status);
      if (prop.status === 'connected') {
        setConnectionStatus('connected');
        // Ensure microphone is unmuted when status changes to connected
        setTimeout(() => {
          conversation.setMicMuted(false);
          setIsMicMuted(false);
          console.log('Microphone unmuted on status change');
        }, 500);
      } else if (prop.status === 'disconnected') {
        setConnectionStatus('disconnected');
      }
    },
    onModeChange: (mode) => {
      console.log('Conversation mode changed:', mode);
    },
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!isModalVisible && connectionStatus === 'disconnected') {
      setConversationError(null);
      setPermissionGranted(null);
    }
  }, [isModalVisible, connectionStatus]);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // First check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        
        if (checkResult) {
          console.log('Microphone permission already granted');
          return true;
        }
        
        // Small delay to ensure Activity is ready (especially after reload)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access to enable voice conversations.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('Microphone permission result:', granted, 'Granted:', isGranted);
        return isGranted;
      } catch (err: any) {
        console.error('Permission error:', err);
        // If it's the Activity not attached error, wait and retry once
        if (err?.message?.includes('not attached to an Activity')) {
          console.log('Activity not ready, waiting and retrying...');
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
              {
                title: 'Microphone Permission',
                message: 'This app needs microphone access to enable voice conversations.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
          } catch (retryErr) {
            console.error('Permission retry error:', retryErr);
            return false;
          }
        }
        return false;
      }
    }
    // iOS permissions are handled through Info.plist
    return true;
  };

  const handleStartConversation = async () => {
    setConversationError(null);
    
    // Request microphone permission
    const hasPermission = await requestMicrophonePermission();
    setPermissionGranted(hasPermission);
    
    if (!hasPermission) {
      setConversationError('Microphone permission is required to start a conversation');
      return;
    }

    setIsModalVisible(true);
    setConnectionStatus('connecting');

    // Fetch conversation token
    const token = await fetchConversationToken();
    if (!token) {
      setConnectionStatus('disconnected');
      return;
    }

    // Start the conversation session
    try {
      console.log('Starting conversation session with token...');
      await conversation.startSession({
        conversationToken: token,
      });
      console.log('Session started, waiting for connection...');
      // Don't set mic muted here - wait for onConnect callback
      // The microphone will be unmuted in onConnect/onStatusChange
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setConversationError(error.message || 'Failed to start conversation');
      setConnectionStatus('disconnected');
    }
  };

  const handleEndConversation = async () => {
    try {
      if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
        // Set status to disconnecting to prevent error state updates
        setConnectionStatus('disconnected');
        // End session - WebSocket closure errors are expected and will be ignored
        await conversation.endSession();
      }
    } catch (error: any) {
      // Ignore errors during disconnection - they're usually WebSocket cleanup
      const errorMessage = error?.message || error?.toString() || '';
      if (!errorMessage.includes('WebSocket') && !errorMessage.includes('websocket')) {
        console.error('Failed to end conversation:', error);
      }
    } finally {
      setConnectionStatus('disconnected');
      setIsModalVisible(false);
      setConversationError(null);
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMicMuted;
    console.log('Toggling microphone mute:', newMutedState);
    conversation.setMicMuted(newMutedState);
    setIsMicMuted(newMutedState);
  };

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleStartConversation}
        disabled={isConnecting || isConnected}
      >
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
            {isTokenLoading || isConnecting ? (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.statusText}>
                  {isTokenLoading ? 'Initializing session...' : 'Connecting...'}
                </Text>
              </View>
            ) : tokenError ? (
              <View style={styles.statusContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{tokenError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleStartConversation}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : conversationError ? (
              <View style={styles.statusContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{conversationError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleStartConversation}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.retryButton, styles.secondaryButton]} 
                  onPress={handleEndConversation}
                >
                  <Text style={styles.retryButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : permissionGranted === false ? (
              <View style={styles.statusContainer}>
                <Text style={styles.errorIcon}>🎤</Text>
                <Text style={styles.errorText}>Microphone permission is required</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleStartConversation}>
                  <Text style={styles.retryButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.conversationContainer}>
                <View style={[
                  styles.voiceIndicator,
                  conversation.isSpeaking && styles.voiceIndicatorActive,
                  isMicMuted && styles.voiceIndicatorMuted
                ]}>
                  <Text style={styles.voiceIndicatorIcon}>
                    {isMicMuted ? '🔇' : conversation.isSpeaking ? '🗣️' : '👂'}
                  </Text>
                </View>
                
                <Text style={styles.statusLabel}>
                  {isConnected 
                    ? (isMicMuted 
                        ? 'Microphone is muted' 
                        : conversation.isSpeaking 
                          ? 'Chef is speaking...' 
                          : 'Listening to you...')
                    : 'Connecting...'}
                </Text>

                {isConnected && (
                  <>
                    <Text style={styles.instructionText}>
                      Tell me what ingredients you have, and I'll help you create a delicious recipe!
                    </Text>

                    {/* Debug info */}
                    <View style={styles.debugContainer}>
                      <Text style={styles.debugText}>
                        Status: {conversation.status} | Mic: {isMicMuted ? 'Muted' : 'Active'} | Speaking: {conversation.isSpeaking ? 'Yes' : 'No'}
                      </Text>
                    </View>

                    <View style={styles.controlsContainer}>
                      <TouchableOpacity 
                        style={[styles.controlButton, isMicMuted && styles.controlButtonMuted]} 
                        onPress={handleToggleMute}
                      >
                        <Text style={styles.controlButtonIcon}>
                          {isMicMuted ? '🔇' : '🎤'}
                        </Text>
                        <Text style={styles.controlButtonText}>
                          {isMicMuted ? 'Unmute' : 'Mute'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.controlButton, styles.endButton]} 
                        onPress={handleEndConversation}
                      >
                        <Text style={styles.controlButtonIcon}>📞</Text>
                        <Text style={styles.controlButtonText}>End Call</Text>
                      </TouchableOpacity>
                    </View>
                  </>
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
    paddingHorizontal: Spacing.lg,
  },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  conversationContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
    width: '100%',
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
  voiceIndicatorMuted: {
    borderColor: Colors.error,
    opacity: 0.7,
  },
  voiceIndicatorIcon: {
    fontSize: 48,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  controlButtonMuted: {
    backgroundColor: Colors.error,
  },
  controlButtonIcon: {
    fontSize: 20,
  },
  controlButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: Colors.error,
  },
  debugContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  },
  debugText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
});
