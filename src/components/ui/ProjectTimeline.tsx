import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming, withDelay } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { GeneratedChecklist } from '../../types';
import { router } from 'expo-router';

const PHASE_ORDER = ['planning', 'coding', 'testing', 'deployment', 'scaling'];
const PHASE_LABELS: Record<string, string> = {
    planning: 'Plan',
    coding: 'Build',
    testing: 'Test',
    deployment: 'Deploy',
    scaling: 'Scale',
};
const PHASE_ICONS: Record<string, string> = {
    planning: 'clipboard-text-outline',
    coding: 'code-braces',
    testing: 'bug-outline',
    deployment: 'rocket-launch-outline',
    scaling: 'chart-line',
};

interface PhaseNode {
    phase: string;
    checklists: GeneratedChecklist[];
    progress: number; // 0-100
    totalItems: number;
    completedItems: number;
}

interface ProjectTimelineProps {
    checklists: GeneratedChecklist[];
    getProgress: (id: string) => number;
    color: string;
}

export function ProjectTimeline({ checklists, getProgress, color }: ProjectTimelineProps) {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const trackBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    const phases = useMemo<PhaseNode[]>(() => {
        return PHASE_ORDER.map(phase => {
            const phaseLists = checklists.filter(c => c.phase === phase);
            const totalItems = phaseLists.reduce((acc, c) => acc + c.items.length, 0);
            const completedItems = phaseLists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            return { phase, checklists: phaseLists, progress, totalItems, completedItems };
        }).filter(p => p.checklists.length > 0);
    }, [checklists]);

    const overallProgress = useMemo(() => {
        const total = checklists.reduce((acc, c) => acc + c.items.length, 0);
        const completed = checklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }, [checklists]);

    if (phases.length === 0) return null;

    return (
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="map-marker-path" size={16} color={color} />
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Project Journey</Text>
                </View>
                <View style={[styles.overallBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                    <Text style={[styles.overallText, { color }]}>{overallProgress}% overall</Text>
                </View>
            </View>

            {/* Overall progress bar */}
            <View style={[styles.overallTrack, { backgroundColor: trackBg }]}>
                <Animated.View
                    style={[styles.overallFill, { width: `${overallProgress}%` as any, backgroundColor: color }]}
                />
            </View>

            {/* Phase nodes */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phasesRow}>
                {phases.map((node, index) => {
                    const isComplete = node.progress === 100;
                    const isActive = !isComplete && node.progress > 0;
                    const isLocked = node.progress === 0;

                    const nodeColor = isComplete ? color : isActive ? color : textMuted;
                    const nodeBg = isComplete
                        ? color + '22'
                        : isActive
                            ? color + '11'
                            : trackBg;

                    return (
                        <View key={node.phase} style={styles.phaseWrapper}>
                            {/* Connector line */}
                            {index > 0 && (
                                <View style={[styles.connector, { backgroundColor: trackBg }]}>
                                    <View style={[
                                        styles.connectorFill,
                                        {
                                            backgroundColor: color,
                                            width: phases[index - 1].progress === 100 ? '100%' : '0%',
                                        }
                                    ]} />
                                </View>
                            )}

                            <Pressable
                                onPress={() => {
                                    if (node.checklists[0]) {
                                        router.push(`/checklist/${node.checklists[0].id}`);
                                    }
                                }}
                                style={[styles.phaseNode, { backgroundColor: nodeBg, borderColor: nodeColor + '55' }]}
                            >
                                <MaterialCommunityIcons
                                    name={PHASE_ICONS[node.phase] as any}
                                    size={18}
                                    color={nodeColor}
                                />
                                {isComplete && (
                                    <View style={[styles.checkBadge, { backgroundColor: color }]}>
                                        <MaterialCommunityIcons name="check" size={8} color="white" />
                                    </View>
                                )}
                            </Pressable>

                            <Text style={[styles.phaseLabel, { color: isLocked ? textMuted : textPrimary }]}>
                                {PHASE_LABELS[node.phase] ?? node.phase}
                            </Text>
                            <Text style={[styles.phaseProgress, { color: nodeColor }]}>
                                {node.progress}%
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerTitle: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    overallBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    overallText: {
        fontSize: 12,
        fontWeight: '800',
    },
    overallTrack: {
        height: 4,
        borderRadius: 2,
        marginBottom: 16,
        overflow: 'hidden',
    },
    overallFill: {
        height: '100%',
        borderRadius: 2,
    },
    phasesRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 4,
        gap: 0,
    },
    phaseWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    connector: {
        width: 28,
        height: 2,
        marginTop: -18,
        overflow: 'hidden',
    },
    connectorFill: {
        height: '100%',
    },
    phaseNode: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    phaseLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 6,
        textAlign: 'center',
        position: 'absolute',
        bottom: -30,
        width: 44,
    },
    phaseProgress: {
        fontSize: 9,
        fontWeight: '700',
        position: 'absolute',
        bottom: -44,
        width: 44,
        textAlign: 'center',
    },
});
