import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>👨‍🍳</Text>
          </View>
          
          <Text style={styles.title}>ChefMate.AI</Text>
          <Text style={styles.subtitle}>Your personal AI cooking assistant</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome!</Text>
            <Text style={styles.cardText}>
              Discover recipes, get cooking tips, and let AI help you create 
              delicious meals with whatever ingredients you have.
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <FeatureItem icon="🍳" text="Smart Recipes" />
            <FeatureItem icon="🥗" text="Meal Planning" />
            <FeatureItem icon="🛒" text="Shopping Lists" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  cardText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 100,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  featureText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
});

