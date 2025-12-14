import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { AuthProvider } from '@/shared/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ElevenLabsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="light" />
      </ElevenLabsProvider>
    </AuthProvider>
  );
}
