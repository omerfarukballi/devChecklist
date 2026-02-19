import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import { useChecklistStore } from '../src/store/checklistStore';
import { useThemeStore } from '../src/store/themeStore';
import { useTimerStore } from '../src/store/timerStore';
import { theme } from '../src/constants/theme';
import { PROJECT_TYPES } from '../src/data/projectTypes';

export default function FocusModeScreen() {
    const { projectId, phase: initialPhase } = useLocalSearchParams<{ projectId: string; phase?: string }>();
    const [selectedPhase, setSelectedPhase] = useState<string | null>(initialPhase || null);
    const { projects, checklists, toggleItem, getProgress } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#07050f' : '#f1f5f9';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';

    const project = projects.find(p => p.id === projectId);
    const projectDef = project ? PROJECT_TYPES.find(p => p.id === project.projectType) : null;
    const color = projectDef?.color || theme.colors.accent;

    const projectChecklists = useMemo(() => {
        if (!project) return [];
        return project.checklistIds
            .map(id => checklists.find(c => c.id === id))
            .filter(Boolean) as typeof checklists;
    }, [project, checklists]);

    // Flatten all incomplete items across all checklists
    const allIncomplete = useMemo(() => {
        const items: Array<{ item: typeof projectChecklists[0]['items'][0]; checklistId: string; phase: string }> = [];
        for (const cl of projectChecklists) {
            // Filter by phase if selected
            if (selectedPhase && cl.phase !== selectedPhase) continue;

            for (const item of cl.items) {
                if (!item.completed) {
                    items.push({ item, checklistId: cl.id, phase: cl.phase });
                }
            }
        }
        // Sort by priority
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return items.sort((a, b) => (order[a.item.priority] ?? 4) - (order[b.item.priority] ?? 4));
    }, [projectChecklists, selectedPhase]);

    const todayTop3 = allIncomplete.slice(0, 3);
    const rest = allIncomplete.slice(3);

    const totalItems = projectChecklists.reduce((acc, c) => acc + c.items.length, 0);
    const completedItems = projectChecklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const {
        isRunning, timeLeft, mode, startTimer, pauseTimer, resumeTimer, stopTimer, resetTimer: storeResetTimer, tick, setMode
    } = useTimerStore();
    const { addWorkSession } = useChecklistStore();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                tick();
                if (timeLeft === 0) {
                    handleTimerComplete();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const handleTimerComplete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (mode === 'work') {
            const session = stopTimer();
            if (session && projectId) {
                addWorkSession(projectId, session);
            }
            Alert.alert('Work Session Complete!', 'Great job! Time for a short break.', [
                { text: 'Start Break', onPress: () => setMode('shortBreak') }
            ]);
        } else {
            storeResetTimer();
            Alert.alert('Break Over!', 'Ready to get back to work?', [
                { text: 'Start Working', onPress: () => setMode('work') }
            ]);
        }
    };

    const toggleTimer = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isRunning) {
            pauseTimer();
        } else {
            if (timeLeft === (mode === 'work' ? 25 * 60 : 5 * 60)) {
                startTimer(projectId, null);
            } else {
                resumeTimer();
            }
        }
    };

    const resetTimer = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        storeResetTimer();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const totalWorkSeconds = useMemo(() => {
        return (project?.workSessions || []).reduce((acc, s) => acc + s.duration, 0);
    }, [project]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const handleToggle = async (checklistId: string, itemId: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        toggleItem(checklistId, itemId);
    };

    if (!project) {
        return (
            <SafeAreaView style={[styles.screen, { backgroundColor: bg }]}>
                <Text style={[styles.notFound, { color: textPrimary }]}>Project not found.</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={{ color: color }}>Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: bg }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
                    <MaterialCommunityIcons name="arrow-left" size={22} color={textPrimary} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerLabel, { color: textMuted }]}>FOCUS MODE</Text>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>{project.name}</Text>
                    <View style={styles.headerStats}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color={textMuted} />
                        <Text style={[styles.headerSubtext, { color: textMuted }]}>{formatDuration(totalWorkSeconds)} focused</Text>
                    </View>
                </View>
                <View style={[styles.progressBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                    <Text style={[styles.progressText, { color }]}>{overallProgress}%</Text>
                </View>
            </View>

            {/* Overall progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
                <Animated.View style={[styles.progressFill, { width: `${overallProgress}%` as any, backgroundColor: color }]} />
            </View>

            {selectedPhase && (
                <View style={styles.filterBar}>
                    <View style={[styles.filterChip, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                        <Text style={[styles.filterText, { color }]}>
                            Phase: {selectedPhase.charAt(0).toUpperCase() + selectedPhase.slice(1)}
                        </Text>
                        <Pressable onPress={() => setSelectedPhase(null)} style={styles.filterClose}>
                            <MaterialCommunityIcons name="close" size={14} color={color} />
                        </Pressable>
                    </View>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {allIncomplete.length === 0 ? (
                    <Animated.View entering={FadeInDown} style={[styles.doneCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <MaterialCommunityIcons name="party-popper" size={48} color={color} />
                        <Text style={[styles.doneTitle, { color: textPrimary }]}>All Done! 🎉</Text>
                        <Text style={[styles.doneSubtitle, { color: textMuted }]}>You've completed all tasks in this project.</Text>
                    </Animated.View>
                ) : (
                    <>
                        {/* Pomodoro Timer */}
                        <Animated.View entering={FadeInDown.delay(100)} style={[styles.pomoCard, { backgroundColor: mode !== 'work' ? '#10b98115' : color + '15', borderColor: mode !== 'work' ? '#10b98144' : color + '44' }]}>
                            <View style={styles.pomoHeader}>
                                <MaterialCommunityIcons name={mode !== 'work' ? "coffee-outline" : "brain"} size={20} color={mode !== 'work' ? "#10b981" : color} />
                                <Text style={[styles.pomoStatus, { color: mode !== 'work' ? "#10b981" : color }]}>{mode.toUpperCase()}</Text>
                            </View>
                            <Text style={[styles.pomoTime, { color: textPrimary }]}>{formatTime(timeLeft)}</Text>
                            <View style={styles.pomoActions}>
                                <Pressable onPress={toggleTimer} style={[styles.pomoBtn, { backgroundColor: mode !== 'work' ? '#10b98122' : color + '22' }]}>
                                    <MaterialCommunityIcons name={isRunning ? "pause" : "play"} size={24} color={mode !== 'work' ? "#10b981" : color} />
                                </Pressable>
                                <Pressable onPress={resetTimer} style={styles.pomoReset}>
                                    <MaterialCommunityIcons name="refresh" size={20} color={textMuted} />
                                </Pressable>
                            </View>
                        </Animated.View>

                        {/* Today's Top 3 */}
                        <Text style={[styles.sectionLabel, { color: textMuted }]}>🎯 TODAY'S TOP 3</Text>
                        {todayTop3.map(({ item, checklistId, phase }, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInRight.delay(index * 80).duration(300)}
                            >
                                <Pressable
                                    onPress={() => handleToggle(checklistId, item.id)}
                                    style={[styles.focusItem, styles.focusItemHighlight, { backgroundColor: color + '11', borderColor: color + '33' }]}
                                >
                                    <View style={[styles.priorityDot, { backgroundColor: theme.colors.priority[item.priority as keyof typeof theme.colors.priority] }]} />
                                    <View style={styles.itemContent}>
                                        <Text style={[styles.itemTitle, { color: textPrimary }]}>{item.title}</Text>
                                        <Text style={[styles.itemMeta, { color: textMuted }]}>{phase} · {item.priority}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color={color} />
                                </Pressable>
                            </Animated.View>
                        ))}

                        {/* Remaining items */}
                        {rest.length > 0 && (
                            <>
                                <Text style={[styles.sectionLabel, { color: textMuted, marginTop: 20 }]}>📋 REMAINING ({rest.length})</Text>
                                {rest.map(({ item, checklistId, phase }, index) => (
                                    <Animated.View
                                        key={item.id}
                                        entering={FadeInDown.delay(index * 40).duration(250)}
                                    >
                                        <Pressable
                                            onPress={() => handleToggle(checklistId, item.id)}
                                            style={[styles.focusItem, { backgroundColor: cardBg, borderColor: cardBorder }]}
                                        >
                                            <View style={[styles.priorityDot, { backgroundColor: theme.colors.priority[item.priority as keyof typeof theme.colors.priority] }]} />
                                            <View style={styles.itemContent}>
                                                <Text style={[styles.itemTitle, { color: textPrimary }]}>{item.title}</Text>
                                                <Text style={[styles.itemMeta, { color: textMuted }]}>{phase} · {item.priority}</Text>
                                            </View>
                                            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={22} color={textMuted} />
                                        </Pressable>
                                    </Animated.View>
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { flex: 1 },
    headerLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    headerStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    headerSubtext: { fontSize: 11, fontWeight: '600' },
    progressBadge: {
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1,
    },
    progressText: { fontSize: 14, fontWeight: '900' },
    progressTrack: {
        height: 3,
        marginHorizontal: 16,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressFill: { height: '100%', borderRadius: 2 },
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 11, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 0.5,
        marginBottom: 12,
    },
    focusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    focusItemHighlight: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    priorityDot: { width: 8, height: 8, borderRadius: 4 },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    itemMeta: { fontSize: 12 },
    doneCard: {
        alignItems: 'center',
        padding: 40,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
        marginTop: 40,
    },
    doneTitle: { fontSize: 24, fontWeight: 'bold' },
    doneSubtitle: { fontSize: 15, textAlign: 'center' },
    notFound: { fontSize: 16, textAlign: 'center', marginTop: 40 },
    pomoCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    pomoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    pomoStatus: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    pomoTime: {
        fontSize: 48,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        marginBottom: 16,
    },
    pomoActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    pomoBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pomoReset: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '700',
    },
    filterClose: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
