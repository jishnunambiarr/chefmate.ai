import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { AuthProvider } from '@/shared/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

// Suppress warnings for demo recording
LogBox.ignoreAllLogs(true);



export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ElevenLabsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="dark" />
        </ElevenLabsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
