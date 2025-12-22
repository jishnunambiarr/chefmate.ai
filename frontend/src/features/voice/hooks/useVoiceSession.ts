import { useState, useCallback } from 'react';
import { auth } from '@/shared/config/firebase';
import { API_BASE_URL } from '@/shared/config/api';

interface VoiceSessionState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export type AgentType = 'discover' | 'cook';

export function useVoiceSession() {
  const [state, setState] = useState<VoiceSessionState>({
    token: null,
    isLoading: false,
    error: null,
  });

  const fetchConversationToken = useCallback(async (agentType: AgentType = 'discover'): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();
      
      // Use different endpoint based on agent type
      const endpoint = agentType === 'cook' ? 'conversation-token-cook' : 'conversation-token';
      const url = `${API_BASE_URL}/elevenlabs/${endpoint}`;
      console.log(`Fetching conversation token from: ${url} (agent: ${agentType})`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to get conversation token');
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('Invalid response: missing conversation token');
      }
      
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

