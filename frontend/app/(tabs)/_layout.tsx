import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/shared/context/AuthContext';
import { Colors } from '@/shared/constants/theme';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: 8 + (insets.bottom || 0),
            height: 65 + (insets.bottom || 0),
          },
        ],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/icon-recipe.png')}
              style={[styles.icon, focused && styles.iconActive]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/icon-chef.png')}
              style={[styles.icon, focused && styles.iconActive]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.surfaceLight,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 65,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  icon: {
    width: 24,
    height: 24,
    opacity: 0.7,
  },
  iconActive: {
    opacity: 1,
  },
});

