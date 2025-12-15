import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { AuthProvider } from '@/shared/context/AuthContext';

// #region agent log
try {
  const LinearGradientModule = require('expo-linear-gradient');
  fetch('http://127.0.0.1:7242/ingest/05a29dec-4f79-4359-b311-1b867eb9c6b2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/_layout.tsx:9',message:'LinearGradient module import check',data:{moduleExists:!!LinearGradientModule,hasLinearGradient:!!LinearGradientModule?.LinearGradient,keys:Object.keys(LinearGradientModule||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
} catch (e: any) {
  fetch('http://127.0.0.1:7242/ingest/05a29dec-4f79-4359-b311-1b867eb9c6b2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/_layout.tsx:9',message:'LinearGradient module import error',data:{error:e?.message,stack:e?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
}
// #endregion

export default function RootLayout() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/05a29dec-4f79-4359-b311-1b867eb9c6b2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/_layout.tsx:22',message:'RootLayout rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
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
