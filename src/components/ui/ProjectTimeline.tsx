import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Alert, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { GeneratedChecklist, Phase } from '../../types';
import { router } from 'expo-router';
import { useChecklistStore } from '../../store/checklistStore';
import { PROJECT_TYPES } from '../../data/projectTypes';
import { generateChecklist } from '../../engine/checklistEngine';
import * as Haptics from 'expo-haptics';

const GROWTH_PHASE_GROUPS = ['Web', 'Mobile', 'Desktop', 'AI/ML', 'Game', 'Other'];

const PHASE_ORDER = ['planning', 'coding', 'testing', 'deployment', 'scaling', 'growth'];
const PHASE_LABELS: Record<string, string> = {
    planning: 'Plan',
    coding: 'Build',
    testing: 'Test',
    deployment: 'Deploy',
    scaling: 'Scale',
    growth: 'Grow',
};
const PHASE_ICONS: Record<string, string> = {
    planning: 'clipboard-text-outline',
    coding: 'code-braces',
    testing: 'bug-outline',
    deployment: 'rocket-launch-outline',
    scaling: 'chart-line',
    growth: 'trending-up',
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
    projectId: string;
}

export function ProjectTimeline({ checklists, getProgress, color, projectId }: ProjectTimelineProps) {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const [isManageVisible, setIsManageVisible] = useState(false);
    const [generatingPhase, setGeneratingPhase] = useState<string | null>(null);

    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const trackBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const { getProject, addChecklist, deleteChecklist } = useChecklistStore();
    const project = useMemo(() => getProject(projectId), [projectId, getProject]);
    const projectDef = useMemo(() => PROJECT_TYPES.find(t => t.id === project?.projectType), [project]);

    const phases = useMemo<PhaseNode[]>(() => {
        return PHASE_ORDER.map(phase => {
            const phaseLists = checklists.filter(c => c.phase === phase);
            const totalItems = phaseLists.reduce((acc, c) => acc + c.items.length, 0);
            const completedItems = phaseLists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            return { phase, checklists: phaseLists, progress, totalItems, completedItems };
        });
    }, [checklists]);

    const overallProgress = useMemo(() => {
        const total = checklists.reduce((acc, c) => acc + c.items.length, 0);
        const completed = checklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }, [checklists]);

    const handleAutoGenerate = async (targetPhase: string) => {
        if (!project) return;

        setGeneratingPhase(targetPhase);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
            const items = generateChecklist({
                projectType: project.projectType,
                phase: targetPhase as Phase,
                techStack: project.techStack,
                experience: 'intermediate',
            });

            const newList: GeneratedChecklist = {
                id: Date.now().toString(),
                title: `${project.name} — ${PHASE_LABELS[targetPhase] || targetPhase}`,
                projectType: project.projectType,
                phase: targetPhase as Phase,
                techStack: project.techStack,
                experience: 'intermediate',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                items,
            };

            addChecklist(newList, projectId);
            setGeneratingPhase(null);
            Alert.alert("Success", `${PHASE_LABELS[targetPhase]} checklist generated with your tech stack!`);
        }, 800);
    };

    const handleDeletePhase = (checklistId: string, phaseName: string) => {
        Alert.alert(
            "Delete Phase",
            `Are you sure you want to delete the ${phaseName} phase? All tasks and progress will be lost.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteChecklist(checklistId);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                }
            ]
        );
    };

    if (checklists.length === 0) return null;

    return (
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {/* Header */}
            <Pressable style={styles.header} onPress={() => setIsManageVisible(true)}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="map-marker-path" size={16} color={color} />
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Project Journey</Text>
                    <MaterialCommunityIcons name="cog-outline" size={14} color={textMuted} style={{ marginLeft: 4 }} />
                </View>
                <View style={[styles.overallBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
                    <Text style={[styles.overallText, { color }]}>{overallProgress}% overall</Text>
                </View>
            </Pressable>

            {/* Overall progress bar */}
            <View style={[styles.overallTrack, { backgroundColor: trackBg }]}>
                <Animated.View
                    style={[styles.overallFill, { width: `${overallProgress}%` as any, backgroundColor: color }]}
                />
            </View>

            {/* Phase nodes */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.phasesRow}>
                {phases.map((node, index) => {
                    const isLocked = node.checklists.length === 0;
                    const isComplete = !isLocked && node.progress === 100;
                    const isActive = !isLocked && !isComplete && node.progress > 0;
                    const isStarted = !isLocked;

                    const nodeColor = isComplete ? color : isStarted ? color : textMuted;
                    const strokeWidth = 3;
                    const radius = 24;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (circumference * node.progress) / 100;

                    return (
                        <View key={node.phase} style={styles.phaseWrapper}>
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

                            <View style={styles.nodeWithLabel}>
                                <Pressable
                                    onPress={() => {
                                        if (isLocked) {
                                            handleAutoGenerate(node.phase);
                                        } else if (node.checklists[0]) {
                                            router.push(`/checklist/${node.checklists[0].id}`);
                                        }
                                    }}
                                    style={styles.nodeContainer}
                                >
                                    {!isLocked && (
                                        <View style={styles.progressSvg}>
                                            <Svg width={54} height={54} viewBox="0 0 54 54">
                                                <Circle
                                                    cx="27"
                                                    cy="27"
                                                    r={radius}
                                                    stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                                                    strokeWidth={strokeWidth}
                                                    fill="none"
                                                />
                                                <Circle
                                                    cx="27"
                                                    cy="27"
                                                    r={radius}
                                                    stroke={isComplete ? '#10b981' : color}
                                                    strokeWidth={strokeWidth}
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={strokeDashoffset}
                                                    strokeLinecap="round"
                                                    fill="none"
                                                    transform="rotate(-90 27 27)"
                                                />
                                            </Svg>
                                        </View>
                                    )}

                                    <View style={[
                                        styles.phaseNode,
                                        {
                                            backgroundColor: isComplete ? '#10b981' : isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                            borderColor: isLocked ? cardBorder : 'transparent'
                                        }
                                    ]}>
                                        {generatingPhase === node.phase ? (
                                            <ActivityIndicator size="small" color={color} />
                                        ) : (
                                            <MaterialCommunityIcons
                                                name={isLocked ? 'plus' : (isComplete ? 'check' : PHASE_ICONS[node.phase]) as any}
                                                size={isLocked ? 20 : 18}
                                                color={isComplete ? '#fff' : isLocked ? textMuted : textPrimary}
                                            />
                                        )}
                                    </View>
                                </Pressable>

                                <Text
                                    style={[
                                        styles.phaseLabel,
                                        {
                                            color: isLocked ? textMuted : textPrimary,
                                            fontWeight: isStarted ? '700' : '500',
                                            opacity: isLocked ? 0.6 : 1
                                        }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {PHASE_LABELS[node.phase] ?? node.phase}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Manage Journey Modal */}
            <Modal
                visible={isManageVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsManageVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsManageVisible(false)}>
                    <Animated.View entering={FadeInUp} style={[styles.modalContent, { backgroundColor: isDark ? '#111827' : '#ffffff' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textPrimary }]}>Manage Journey</Text>
                            <Pressable onPress={() => setIsManageVisible(false)} style={styles.modalClose}>
                                <MaterialCommunityIcons name="close" size={24} color={textMuted} />
                            </Pressable>
                        </View>

                        <Text style={[styles.modalSubtitle, { color: textMuted }]}>
                            Edit or remove active phases from your project.
                        </Text>

                        <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                            {phases.filter(p => p.checklists.length > 0).map((p) => (
                                <View key={p.phase} style={[styles.modalItem, { borderColor: cardBorder }]}>
                                    <View style={[styles.modalItemIcon, { backgroundColor: color + '15' }]}>
                                        <MaterialCommunityIcons name={PHASE_ICONS[p.phase] as any} size={20} color={color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.modalItemName, { color: textPrimary }]}>{PHASE_LABELS[p.phase]}</Text>
                                        <Text style={[styles.modalItemMeta, { color: textMuted }]}>{p.progress}% Complete • {p.totalItems} Tasks</Text>
                                    </View>
                                    <Pressable
                                        onPress={() => handleDeletePhase(p.checklists[0].id, PHASE_LABELS[p.phase])}
                                        style={styles.modalDeleteBtn}
                                    >
                                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                                    </Pressable>
                                </View>
                            ))}
                        </ScrollView>

                        <Pressable style={[styles.modalDoneBtn, { backgroundColor: color }]} onPress={() => setIsManageVisible(false)}>
                            <Text style={styles.modalDoneText}>Done</Text>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
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
        paddingHorizontal: 8,
        paddingBottom: 30,
        alignItems: 'flex-start',
    },
    phaseWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    connector: {
        width: 20,
        height: 2,
        marginTop: -32,
        marginHorizontal: -4,
        overflow: 'hidden',
    },
    connectorFill: {
        height: '100%',
    },
    nodeWithLabel: {
        alignItems: 'center',
        width: 65,
    },
    nodeContainer: {
        width: 54,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    progressSvg: {
        position: 'absolute',
    },
    phaseNode: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    activeNodeGlow: {
        shadowOpacity: 0.3,
        shadowRadius: 12,
        borderWidth: 2.5,
    },
    pulseRing: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        opacity: 0.4,
    },
    textContainer: {
        position: 'absolute',
        top: 60,
        alignItems: 'center',
        width: 80,
    },
    phaseLabel: {
        fontSize: 12,
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalClose: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    modalList: {
        flex: 1,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    modalItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalItemName: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalItemMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    modalDeleteBtn: {
        padding: 8,
    },
    modalDoneBtn: {
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    modalDoneText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
