import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  FlatList,
} from 'react-native';
import { useConversation } from '@elevenlabs/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
} from 'react-native-reanimated';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { useAuth } from '@/shared/context/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { Recipe } from '@/shared/types/recipe';
import { getUserPreferences } from '@/shared/services/preferencesService';
import { getUserRecipes } from '@/shared/services/recipeService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
}

interface VoiceChatModalProps {
  visible: boolean;
  onClose: () => void;
  agentType: 'discover' | 'cook';
  recipe?: Recipe | null;
  title?: string;
}

export function VoiceChatModal({ 
  visible, 
  onClose, 
  agentType,
  recipe,
  title = 'Voice Recipe Creation'
}: VoiceChatModalProps) {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const { user } = useAuth();
  const { fetchConversationToken, isLoading: isTokenLoading, error: tokenError } = useVoiceSession();
  const messagesEndRef = useRef<FlatList>(null);
  const scale = useSharedValue(1);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log(`Connected to ElevenLabs conversation (${agentType})`);
      setConnectionStatus('connected');
      setConversationError(null);
      setTimeout(() => {
        conversation.setMicMuted(false);
        setIsMicMuted(false);
        console.log('Microphone unmuted after connection');
      }, 500);
    },
    onDisconnect: async () => {
      console.log(`Disconnected from ElevenLabs conversation (${agentType})`);
      setConnectionStatus('disconnected');
      onClose();
    },
    onMessage: (message: any) => {
      try {
        console.log('Message received:', JSON.stringify(message, null, 2));
        
        let messageText: string;
        if (typeof message === 'string') {
          messageText = message;
        } else if (message && typeof message === 'object') {
          messageText = (message as any).text || (message as any).message || JSON.stringify(message);
        } else {
          messageText = String(message);
        }
        
        console.log('Extracted message text:', messageText.substring(0, 200));

        // Try to infer sender more reliably. Some payloads return "user" | "agent",
        // others use "role"/"participant" fields. Default to agent if unknown.
        const rawSender = (message as any)?.sender || (message as any)?.role || (message as any)?.participant;
        const senderStr =
          typeof rawSender === 'string'
            ? rawSender.toLowerCase().trim()
            : '';
        const sender: 'user' | 'agent' = senderStr.includes('user') ? 'user' : 'agent';
        
        const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          text: messageText,
          sender,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        setTimeout(() => {
          messagesEndRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error: any) {
        console.error('Error processing message:', error?.message || error);
      }
    },
    onError: (error: any) => {
      const errorMessage = (typeof error === 'object' && error?.message) 
        ? String(error.message) 
        : (typeof error === 'string' ? error : String(error));
      
      const isWebSocketClosureError = 
        errorMessage.includes('WebSocket') ||
        errorMessage.includes('websocket') ||
        errorMessage.includes('CLOSED') ||
        errorMessage.includes('CLOSING');
      
      if (!isWebSocketClosureError) {
        console.error('Conversation error:', error);
        setConversationError(errorMessage || 'An error occurred during the conversation');
      } else {
        console.log('WebSocket closure (expected during disconnect)');
      }
    },
    onStatusChange: (prop) => {
      console.log('Conversation status changed:', prop.status);
      if (prop.status === 'connected') {
        setConnectionStatus('connected');
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
    if (!visible && connectionStatus === 'disconnected') {
      setConversationError(null);
      setPermissionGranted(null);
      setMessages([]);
    }
  }, [visible, connectionStatus]);

  // Animate voice icon when agent is speaking
  useEffect(() => {
    if (conversation.isSpeaking) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 500 }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [conversation.isSpeaking]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        
        if (checkResult) {
          console.log('Microphone permission already granted');
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
    return true;
  };

  const handleStartConversation = async () => {
    setConversationError(null);
    
    const hasPermission = await requestMicrophonePermission();
    setPermissionGranted(hasPermission);
    
    if (!hasPermission) {
      setConversationError('Microphone permission is required to start a conversation');
      return;
    }

    setConnectionStatus('connecting');

    const token = await fetchConversationToken(agentType);
    if (!token) {
      setConnectionStatus('disconnected');
      return;
    }

    try {
      console.log(`Starting conversation session with token (${agentType})...`);
      const userPreferences = await getUserPreferences(user?.uid || '');
      const name = userPreferences?.name || '';
      console.log('Allergies:', userPreferences?.allergies);
      // Prepare dynamic variables
      const dynamicVariables: Record<string, any> = {
        user_id: user?.uid || '',
        diet: userPreferences?.diet.join(',') || 'None',
        temperatur: userPreferences?.temperatureUnit || 'Celcius',
        allergies: userPreferences?.allergies || 'None',
      };

      // Add recipe history if this is the discover agent
      if (agentType === 'discover' && user?.uid) {
        try {
          const userRecipes = await getUserRecipes(user.uid);
          const recipeNames = userRecipes.map((r) => r.title);
          dynamicVariables.recipeHistory = JSON.stringify(recipeNames);
          console.log('Recipe history:', recipeNames);
        } catch (error) {
          console.error('Error fetching recipe history:', error);
          dynamicVariables.recipeHistory = JSON.stringify([]);
        }
      }

      // Add recipe data if this is the cook agent
      if (agentType === 'cook' && recipe) {
        dynamicVariables.recipe = JSON.stringify({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
        });
      }

      await conversation.startSession({
        conversationToken: token,
        dynamicVariables,
      });
      console.log('Session started, waiting for connection...');
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setConversationError(error.message || 'Failed to start conversation');
      setConnectionStatus('disconnected');
    }
  };

  const handleEndConversation = async () => {
    try {
      if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
        await conversation.endSession();
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || '';
      if (!errorMessage.includes('WebSocket') && !errorMessage.includes('websocket')) {
        console.error('Failed to end conversation:', error);
      }
    } finally {
      setConnectionStatus('disconnected');
      onClose();
      setConversationError(null);
    }
  };

  // Auto-start conversation when modal opens
  useEffect(() => {
    if (visible && connectionStatus === 'disconnected' && !isTokenLoading && permissionGranted !== false) {
      handleStartConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleEndConversation}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
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

                <View style={styles.messagesContainer}>
                  <FlatList
                    ref={messagesEndRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={[
                        styles.messageBubble,
                        item.sender === 'user' ? styles.userMessage : styles.agentMessage
                      ]}>
                        <Text style={[
                          styles.messageText,
                          item.sender === 'user' ? styles.userMessageText : styles.agentMessageText
                        ]}>
                          {item.text}
                        </Text>
                      </View>
                    )}
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={() => {
                      messagesEndRef.current?.scrollToEnd({ animated: true });
                    }}
                  />
                </View>

                {isConnected && (
                  <TouchableOpacity 
                    style={styles.endButton} 
                    onPress={handleEndConversation}
                  >
                    <Text style={styles.endButtonText}>End Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    // paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.textMuted,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
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
    flex: 1,
    width: '100%',
  },
  voiceIconContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg,
  },
  voiceIcon: {
    fontSize: 48,
  },
  messagesContainer: {
    flex: 1,
    width: '100%',
    // paddingHorizontal: Spacing.md,
  },
  messagesContent: {
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.secondary,
  },
  agentMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.text,
  },
  agentMessageText: {
    color: Colors.white,
  },
  endButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    // marginHorizontal: Spacing.md,
    // marginBottom: Spacing.sm,
  },
  endButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

