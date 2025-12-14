import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/shared/context/AuthContext';
import { HomeScreen } from '@/features/home/components/HomeScreen';
import { LoginScreen } from '@/features/auth/components/LoginScreen';
import { Colors } from '@/shared/constants/theme';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return user ? <HomeScreen /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
