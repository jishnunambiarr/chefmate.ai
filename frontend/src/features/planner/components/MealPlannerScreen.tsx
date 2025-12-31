import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, BorderRadius } from '@/shared/constants/theme';
import { useAuth } from '@/shared/context/AuthContext';
import { API_BASE_URL } from '@/shared/config/api';
import { VoiceChatModal } from '@/features/voice/components/VoiceChatModal';
import { useFocusEffect } from 'expo-router';

interface MealItem {
    id: string;
    name: string;
    emoji: string;
}

interface DayPlan {
    day: string;
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
}

export function MealPlannerScreen() {
    const { user } = useAuth();
    const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);

    const fetchPlan = useCallback(async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/planner`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.days && Array.isArray(data.days)) {
                    setWeekPlan(data.days);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchPlan();
        }, [fetchPlan])
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.background, Colors.surface]}
                style={styles.gradient}
            >
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    <View style={styles.header}>
                        <Text style={styles.title}>ChefMate.AI</Text>
                        <Text style={styles.subtitle}>Weekly Meal Planner</Text>

                        <View style={styles.createButtonContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => setIsVoiceModalVisible(true)}
                            >
                                <Text style={styles.buttonText}>Meal Plan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.headerRow}>
                            <Text style={styles.sectionTitle}>Your Weekly Plan</Text>
                        </View>

                        {weekPlan.length > 0 ? (
                            <FlatList
                                data={weekPlan}
                                keyExtractor={(item) => item.day}
                                renderItem={({ item }) => <DayCard dayPlan={item} />}
                                contentContainerStyle={styles.recipeList}
                                showsVerticalScrollIndicator={false}
                                refreshing={isLoading}
                                onRefresh={fetchPlan}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyEmoji}>🍽️</Text>
                                <Text style={styles.emptyTitle}>No Plan Yet</Text>
                                <Text style={styles.emptyText}>
                                    Tap the button above to start planning your week with AI!
                                </Text>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <VoiceChatModal
                visible={isVoiceModalVisible}
                onClose={() => {
                    setIsVoiceModalVisible(false);
                    fetchPlan();
                }}
                agentType="planner"
                title="Plan your meals"
            />
        </View>
    );
}

function DayCard({ dayPlan }: { dayPlan: DayPlan }) {
    return (
        <View style={styles.dayCard}>
            <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dayPlan.day}</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Image source={require('@/assets/images/icon-edit.png')} style={styles.editIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.mealSection}>
                <Text style={styles.mealLabel}>Breakfast</Text>
                <View style={styles.mealItems}>
                    {dayPlan.breakfast.map((meal) => (
                        <View key={meal.id} style={styles.mealItem}>
                            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                            <Text style={styles.mealName}>{meal.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.mealSection}>
                <Text style={styles.mealLabel}>Lunch</Text>
                <View style={styles.mealItems}>
                    {dayPlan.lunch.map((meal) => (
                        <View key={meal.id} style={styles.mealItem}>
                            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                            <Text style={styles.mealName}>{meal.name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.mealSection}>
                <Text style={styles.mealLabel}>Dinner</Text>
                <View style={styles.mealItems}>
                    {dayPlan.dinner.map((meal) => (
                        <View key={meal.id} style={styles.mealItem}>
                            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                            <Text style={styles.mealName}>{meal.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
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
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text,
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    createButtonContainer: {
        marginBottom: Spacing.lg,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
    },
    recipeList: {
        paddingBottom: Spacing.xl,
    },
    dayCard: {
        backgroundColor: Colors.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    dayHeader: {
        alignItems: 'center',
        marginBottom: Spacing.md,
        position: 'relative',
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    editButton: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    editIcon: {
        width: 20,
        height: 20,
        opacity: 0.3,
    },
    mealSection: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
        alignItems: 'flex-start',
    },
    mealLabel: {
        width: 80,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        opacity: 0.7,
        marginTop: 2,
    },
    mealItems: {
        flex: 1,
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    mealEmoji: {
        fontSize: 20,
        marginRight: Spacing.sm,
    },
    mealName: {
        fontSize: 16,
        color: Colors.text,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        fontSize: 15,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
});

