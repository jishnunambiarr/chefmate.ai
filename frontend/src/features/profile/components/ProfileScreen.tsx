import { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
// #region agent log
fetch('http://127.0.0.1:7242/ingest/05a29dec-4f79-4359-b311-1b867eb9c6b2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileScreen.tsx:10',message:'LinearGradient import check',data:{imported:!!LinearGradient,type:typeof LinearGradient,isFunction:typeof LinearGradient==='function'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion
import { signOut } from 'firebase/auth';
import { auth } from '@/shared/config/firebase';
import { useAuth } from '@/shared/context/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { getUserPreferences, saveUserPreferences } from '@/shared/services/preferencesService';
import { UserPreferences } from '@/shared/types/preferences';

export function ProfileScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  const [name, setName] = useState('');
  const [diet, setDiet] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState<UserPreferences['temperatureUnit']>('Celcius');

  const dietOptions = useMemo(
    () => ['Vegetarian', 'Vegan', 'Gluten-free', 'Lactose-free', 'High-protein', 'High-fiber'],
    []
  );

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setIsLoadingPreferences(true);
      try {
        const prefs = await getUserPreferences(user.uid);
        if (prefs) {
          setName(prefs.name || '');
          setDiet(prefs.diet || []);
          setAllergies(prefs.allergies || '');
          setTemperatureUnit((prefs.temperatureUnit as UserPreferences['temperatureUnit']) || 'Celcius');
        } else {
          setName(user.displayName || user.email?.split('@')[0] || '');
        }
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load preferences. Please try again.');
      } finally {
        setIsLoadingPreferences(false);
      }
    };

    load();
  }, [user]);

  const toggleDiet = (item: string) => {
    setDiet((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleSavePreferences = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to be logged in to save preferences.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: UserPreferences = {
        userId: user.uid,
        name: name.trim() || user.displayName || user.email || 'Unnamed',
        diet,
        allergies: allergies.trim(),
        temperatureUnit,
      };

      await saveUserPreferences(payload);
      Alert.alert('Success', 'Your preferences have been saved.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={styles.gradient}
      >
        <SafeAreaView style={{ flex: 1 }}  edges={['top']}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
              
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
             
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSavePreferences}
                disabled={isSaving || isLoadingPreferences}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Diet</Text>
              <View style={styles.chipsContainer}>
                {dietOptions.map((option) => {
                  const selected = diet.includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleDiet(option)}
                    >
                      <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                        {selected && <Text style={styles.checkboxTick}>✓</Text>}
                      </View>
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <TextInput
                style={styles.input}
                placeholder="List any allergies"
                placeholderTextColor={Colors.textMuted}
                value={allergies}
                onChangeText={setAllergies}
              />
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Temperature Unit</Text>
              <View style={styles.row}>
                {(['Celcius', 'Fahrenheit'] as UserPreferences['temperatureUnit'][]).map(
                  (unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitOption,
                        temperatureUnit === unit && styles.unitOptionSelected,
                      ]}
                      onPress={() => setTemperatureUnit(unit)}
                    >
                      <View
                        style={[
                          styles.radio,
                          temperatureUnit === unit && styles.radioSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.unitText,
                          temperatureUnit === unit && styles.unitTextSelected,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Account</Text>
              {isLoadingPreferences ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{user?.email || 'Not available'}</Text>
                  <Text style={styles.label}>Account ID</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {user?.uid || 'Not available'}
                  </Text>
                  <Text style={styles.label}>Member Since</Text>
                  <Text style={styles.value}>
                    {user?.metadata.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'Not available'}
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.logoutText}>Logout</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  avatarContainer: {
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
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  valueSmall: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.surface,
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surface,
    gap: Spacing.xs,
  },
  chipSelected: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.primary,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxTick: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  unitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surface,
    backgroundColor: Colors.surface,
    flex: 1,
  },
  unitOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  unitText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  unitTextSelected: {
    color: Colors.primary,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.surface,
    backgroundColor: Colors.background,
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});


