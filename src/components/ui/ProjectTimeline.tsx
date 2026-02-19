import React, { useMemo, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Modal, ActivityIndicator, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, withRepeat, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
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
import { TutorialTooltip } from './TutorialTooltip';

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

function ActivePhasePulse({ color, variant = 'breathing' }: { color: string, variant?: 'dashed' | 'breathing' }) {
    const pulse = useSharedValue(0.6);
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        if (variant === 'breathing') {
            pulse.value = withRepeat(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
            scale.value = withRepeat(
                withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        } else {
            rotation.value = withRepeat(
                withTiming(360, { duration: 8000, easing: Easing.linear }),
                -1
            );
        }
    }, [variant]);

    const animatedStyle = useAnimatedStyle(() => {
        if (variant === 'breathing') {
            return {
                opacity: pulse.value,
                transform: [{ scale: scale.value }],
            };
        } else {
            return {
                transform: [{ rotate: `${rotation.value}deg` }],
            };
        }
    });

    return (
        <Animated.View style={[styles.pulseContainer, { width: 54, height: 54, top: 0, left: 0 }, animatedStyle]}>
            <View style={{ width: 54, height: 54, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={54} height={54} viewBox="0 0 54 54">
                    {variant === 'breathing' ? (
                        <>
                            {/* Breathing Solid Glow Layer (No dashes) */}
                            <Circle
                                cx="27"
                                cy="27"
                                r="24"
                                stroke={color}
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                                opacity={0.4}
                            />
                            {/* Inner Highlight */}
                            <Circle
                                cx="27"
                                cy="27"
                                r="24"
                                stroke={color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                fill="none"
                                opacity={0.8}
                            />
                        </>
                    ) : (
                        <>
                            {/* Rotating Dashed Ring for 0% progress */}
                            <Circle
                                cx="27"
                                cy="27"
                                r="25"
                                stroke={color}
                                strokeWidth="2"
                                strokeDasharray="4 6"
                                strokeLinecap="round"
                                fill="none"
                                opacity={0.8}
                            />
                        </>
                    )}
                </Svg>
            </View>
        </Animated.View>
    );
}

export function ProjectTimeline({ checklists, getProgress, color, projectId }: ProjectTimelineProps) {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const [isManageVisible, setIsManageVisible] = useState(false);
    const [generatingPhase, setGeneratingPhase] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const trackBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
    const { getProject, addChecklist, deleteChecklist, setActivePhase } = useChecklistStore();
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

    const activePhaseIndex = useMemo(() => {
        // If user manually selected a phase, try to find its index
        if (project?.activePhase) {
            const idx = phases.findIndex(p => p.phase === project.activePhase);
            // Only respect it if it's unlocked (checklists > 0)
            if (idx !== -1 && phases[idx].checklists.length > 0) {
                return idx;
            }
        }
        // Default: Find first incomplete started phase
        const firstIncomplete = phases.findIndex(p => p.checklists.length > 0 && p.progress < 100);
        if (firstIncomplete !== -1) return firstIncomplete;

        // If all started phases are complete, show the next locked/empty phase as active? Or last complete?
        // Let's stick to last started if all complete
        const lastStarted = [...phases].reverse().findIndex(p => p.checklists.length > 0);
        if (lastStarted !== -1) return phases.length - 1 - lastStarted;

        return 0;
    }, [phases, project?.activePhase]);

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

    React.useEffect(() => {
        if (activePhaseIndex >= 0 && scrollRef.current) {
            // Estimate item width: Node (65) + Connector (~20) = ~85px
            // Center alignment: ItemCenter - (ContainerWidth / 2)
            // Assuming container width ~340px (Screen - 32px padding) -> Half is 170
            const itemWidth = 85;
            const centerOffset = 150; // Approximated half-width adjustment
            const x = (activePhaseIndex * itemWidth) - centerOffset + (itemWidth / 2);

            setTimeout(() => {
                scrollRef.current?.scrollTo({
                    x: Math.max(0, x),
                    animated: true
                });
            }, 500); // Small delay to allow layout
        }
    }, [activePhaseIndex]);

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
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.phasesRow}
            >
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
                                            setActivePhase(projectId, node.phase);
                                            router.push(`/checklist/${node.checklists[0].id}`);
                                        }
                                    }}
                                    style={styles.nodeContainer}
                                >
                                    {!isLocked && (
                                        <View style={styles.progressSvg}>
                                            {index === activePhaseIndex && (
                                                <ActivePhasePulse
                                                    color={isComplete ? '#10b981' : color}
                                                    variant={node.progress > 0 ? 'breathing' : 'dashed'}
                                                />
                                            )}
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
            {/* Tutorial Tooltip */}
            <TutorialTooltip
                id="timeline-guide"
                title="Start Here! 📍"
                description="This is your active phase. Tap to view your roadmap and begin tasks."
                arrowDirection="down"
                targetPos={{ x: Dimensions.get('window').width / 2, y: 80 }}
            />
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
        marginBottom: 4,
        overflow: 'hidden',
    },
    overallFill: {
        height: '100%',
        borderRadius: 2,
    },
    phasesRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingTop: 12,
        paddingBottom: 40,
        alignItems: 'flex-start',
    },
    phaseWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    connector: {
        width: 24,
        height: 4,
        marginHorizontal: -2,
        borderRadius: 2,
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
    pulseContainer: {
        position: 'absolute',
        top: -3,
        left: -3,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
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
        textAlign: 'center',
        position: 'absolute',
        bottom: -38,
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
