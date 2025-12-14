import { useState, useCallback } from 'react';
import { auth } from '@/shared/config/firebase';
import { API_BASE_URL } from '@/shared/config/api';

interface VoiceSessionState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useVoiceSession() {
  const [state, setState] = useState<VoiceSessionState>({
    token: null,
    isLoading: false,
    error: null,
  });

  const fetchConversationToken = useCallback(async (): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/elevenlabs/conversation-token`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to get conversation token');
      }

      const data = await response.json();
      setState(prev => ({ ...prev, token: data.token, isLoading: false }));
      return data.token;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initialize voice session';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchConversationToken,
    clearError,
  };
}

