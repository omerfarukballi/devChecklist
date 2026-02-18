import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useOnboardingStore } from '../src/store/onboardingStore';
import { useChecklistStore } from '../src/store/checklistStore';
import { generateChecklist } from '../src/engine/checklistEngine';
import { PROJECT_TYPES } from '../src/data/projectTypes';
import { TECH_STACKS } from '../src/data/techStack';
import { ProjectTypeCard } from '../src/components/questionnaire/ProjectTypeCard';
import { theme } from '../src/constants/theme';
import { useThemeStore } from '../src/store/themeStore';
import * as Haptics from 'expo-haptics';

const PHASES = [
    { id: 'planning', label: 'Planning', icon: 'clipboard-text-outline', desc: 'Requirements, Architecture, Stack' },
    { id: 'coding', label: 'Coding', icon: 'code-braces', desc: 'Implementation, Patterns, Logic' },
    { id: 'testing', label: 'Testing', icon: 'flask-outline', desc: 'Unit, Integration, E2E' },
    { id: 'deployment', label: 'Deployment', icon: 'rocket-launch-outline', desc: 'CI/CD, Hosting, Domain' },
    { id: 'scaling', label: 'Scaling', icon: 'chart-line-variant', desc: 'Performance, Optimization' },
] as const;

const TOTAL_STEPS_NEW_PROJECT = 4;  // project type → phase → tech → info
const TOTAL_STEPS_ADD_PHASE = 2;    // phase → tech

export default function QuestionnaireScreen() {
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();
    const { addChecklist, addProject, getProject } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const params = useLocalSearchParams<{ projectId?: string }>();
    const existingProjectId = params.projectId;
    const existingProject = existingProjectId ? getProject(existingProjectId) : undefined;

    const [generating, setGenerating] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    const isAddingPhase = !!existingProject;

    // Dynamic colors
    const bg = isDark ? '#07050f' : '#f1f5f9';
    const textPrimary = isDark ? '#ffffff' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#475569';
    const textMuted = isDark ? '#64748b' : '#94a3b8';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBg = isDark ? 'rgba(255,255,255,0.07)' : '#ffffff';
    const inputBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
    const iconBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';

    const handleBack = () => {
        if (store.step > 1) {
            store.setStep(store.step - 1);
        } else {
            router.back();
        }
    };

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const totalSteps = isAddingPhase ? TOTAL_STEPS_ADD_PHASE : TOTAL_STEPS_NEW_PROJECT;
        if (store.step === totalSteps) {
            setGenerating(true);
            setTimeout(() => {
                const projectTypeId = isAddingPhase ? existingProject!.projectType : store.projectType!;
                const techStack = isAddingPhase ? existingProject!.techStack : store.selectedStack;

                const items = generateChecklist({
                    projectType: projectTypeId,
                    phase: store.phase!,
                    techStack,
                    experience: 'intermediate',
                    goal: undefined,
                });

                const projectLabel = PROJECT_TYPES.find(p => p.id === projectTypeId)?.label || 'New Project';
                const newList = {
                    id: Date.now().toString(),
                    title: isAddingPhase
                        ? `${existingProject!.name} — ${store.phase}`
                        : (projectName.trim() || projectLabel),
                    projectType: projectTypeId,
                    phase: store.phase!,
                    techStack,
                    experience: 'intermediate' as const,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    items,
                };

                if (isAddingPhase) {
                    addChecklist(newList, existingProjectId);
                } else {
                    const newProject = {
                        id: `proj-${Date.now()}`,
                        name: projectName.trim() || projectLabel,
                        projectType: projectTypeId,
                        techStack,
                        githubUrl: githubUrl.trim() || undefined,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        checklistIds: [],
                    };
                    addProject(newProject);
                    addChecklist(newList, newProject.id);
                }

                store.reset();
                setGenerating(false);
                router.replace(`/checklist/${newList.id}`);
            }, 800);
        } else {
            store.setStep(store.step + 1);
        }
    };

    const isStepValid = () => {
        const totalSteps = isAddingPhase ? TOTAL_STEPS_ADD_PHASE : TOTAL_STEPS_NEW_PROJECT;
        if (!isAddingPhase && store.step === 1) return !!store.projectType;
        const phaseStep = isAddingPhase ? 1 : 2;
        if (store.step === phaseStep) return !!store.phase;
        if (!isAddingPhase && store.step === totalSteps) return projectName.trim().length > 0;
        return true;
    };

    const groupedProjectTypes = PROJECT_TYPES.reduce((acc, curr) => {
        const group = acc.find(g => g.title === curr.group);
        if (group) {
            group.data.push(curr);
        } else {
            acc.push({ title: curr.group, data: [curr] });
        }
        return acc;
    }, [] as { title: string; data: typeof PROJECT_TYPES }[]);

    const renderStep1 = () => (
        <View>
            <Text style={[s.heading, { color: textPrimary }]}>What are you building?</Text>
            {groupedProjectTypes.map((section) => (
                <View key={section.title} style={s.categorySection}>
                    <View style={s.categoryHeader}>
                        <View
                            style={[
                                s.categoryAccent,
                                { backgroundColor: theme.colors.group[section.title as keyof typeof theme.colors.group] || theme.colors.accent }
                            ]}
                        />
                        <Text style={[s.categoryTitle, { color: textPrimary }]}>{section.title}</Text>
                    </View>
                    <View style={s.gridRow}>
                        {section.data.map((type, index) => (
                            <View key={type.id} style={s.gridCell}>
                                <ProjectTypeCard
                                    typeId={type.id}
                                    selected={store.projectType === type.id}
                                    onPress={() => {
                                        store.setProjectType(type.id);
                                        Haptics.selectionAsync();
                                    }}
                                    compact
                                    index={index}
                                />
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );

    const renderPhaseStep = () => (
        <View>
            <Text style={[s.heading, { color: textPrimary }]}>Which phase?</Text>
            <Text style={[s.subHeading, { color: textSecondary }]}>Select the current stage of your project.</Text>
            {PHASES.map((phase, index) => {
                const selected = store.phase === phase.id;
                return (
                    <Animated.View entering={FadeInRight.delay(index * 100)} key={phase.id}>
                        <Pressable
                            onPress={() => {
                                store.setPhase(phase.id);
                                Haptics.selectionAsync();
                            }}
                            style={[
                                s.phaseRow,
                                {
                                    backgroundColor: selected
                                        ? 'rgba(29,78,216,0.15)'
                                        : cardBg,
                                    borderColor: selected ? '#1d4ed8' : borderColor,
                                }
                            ]}
                        >
                            <View style={[
                                s.phaseIcon,
                                { backgroundColor: selected ? '#1d4ed8' : iconBg }
                            ]}>
                                <MaterialCommunityIcons name={phase.icon as any} size={24} color={selected ? 'white' : (isDark ? '#94a3b8' : '#475569')} />
                            </View>
                            <View style={s.flex1}>
                                <Text style={[s.phaseLabel, { color: textPrimary }]}>{phase.label}</Text>
                                <Text style={[s.phaseDesc, { color: textSecondary }]}>{phase.desc}</Text>
                            </View>
                            {selected && <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.accent} />}
                        </Pressable>
                    </Animated.View>
                );
            })}
        </View>
    );

    const renderTechStep = () => {
        const projectTypeId = isAddingPhase ? existingProject!.projectType : store.projectType;
        const stacks = projectTypeId ? TECH_STACKS[projectTypeId] : [];
        return (
            <View>
                <Text style={[s.heading, { color: textPrimary }]}>Tech Stack</Text>
                <Text style={[s.subHeading, { color: textSecondary }]}>Select the technologies you're using (optional).</Text>
                <View style={s.chipRow}>
                    {stacks?.map((stack, index) => {
                        const selected = store.selectedStack.includes(stack.id);
                        return (
                            <Animated.View entering={FadeIn.delay(index * 50)} key={stack.id}>
                                <Pressable
                                    onPress={() => {
                                        store.toggleStack(stack.id);
                                        Haptics.selectionAsync();
                                    }}
                                    style={[
                                        s.chip,
                                        {
                                            backgroundColor: selected ? '#1d4ed8' : cardBg,
                                            borderColor: selected ? '#1d4ed8' : borderColor,
                                        }
                                    ]}
                                >
                                    <Text style={[s.chipText, { color: selected ? 'white' : textSecondary }]}>
                                        {stack.label}
                                    </Text>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </View>
                {(!stacks || stacks.length === 0) && (
                    <Text style={[s.emptyText, { color: textMuted }]}>No specific tech stacks for this type.</Text>
                )}
            </View>
        );
    };

    const renderProjectInfoStep = () => (
        <View>
            <Text style={[s.heading, { color: textPrimary }]}>Project Info</Text>
            <Text style={[s.subHeading, { color: textSecondary }]}>Give your project a name and optionally link a GitHub repo.</Text>

            <Text style={[s.fieldLabel, { color: textMuted }]}>Project Name *</Text>
            <TextInput
                style={[s.textInput, { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }]}
                placeholder="e.g. My SaaS App"
                placeholderTextColor={textMuted}
                value={projectName}
                onChangeText={setProjectName}
                autoFocus
            />

            <Text style={[s.fieldLabel, { color: textMuted, marginTop: 20 }]}>GitHub URL (optional)</Text>
            <View style={[s.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <MaterialCommunityIcons name="github" size={20} color={textMuted} style={s.inputIcon} />
                <TextInput
                    style={[s.textInputInline, { color: textPrimary }]}
                    placeholder="https://github.com/user/repo"
                    placeholderTextColor={textMuted}
                    value={githubUrl}
                    onChangeText={setGithubUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                />
            </View>
        </View>
    );

    const valid = isStepValid();
    const totalSteps = isAddingPhase ? TOTAL_STEPS_ADD_PHASE : TOTAL_STEPS_NEW_PROJECT;

    const renderContent = () => {
        if (isAddingPhase) {
            if (store.step === 1) return renderPhaseStep();
            if (store.step === 2) return renderTechStep();
            return null;
        } else {
            if (store.step === 1) return renderStep1();
            if (store.step === 2) return renderPhaseStep();
            if (store.step === 3) return renderTechStep();
            if (store.step === 4) return renderProjectInfoStep();
            return null;
        }
    };

    return (
        <View style={[s.screen, { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Header */}
            <View style={[s.header, { borderBottomColor: borderColor }]}>
                <Pressable onPress={handleBack} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
                </Pressable>
                <View style={[s.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                    <Animated.View style={[s.progressFill, { width: `${(store.step / totalSteps) * 100}%` as any }]} />
                </View>
                <Text style={[s.stepText, { color: textSecondary }]}>{store.step}/{totalSteps}</Text>
            </View>

            {/* Context banner */}
            {isAddingPhase && (
                <View style={[s.projectBanner, { backgroundColor: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)', borderBottomColor: 'rgba(124,58,237,0.3)' }]}>
                    <MaterialCommunityIcons name="folder-open-outline" size={16} color="#7c3aed" />
                    <Text style={[s.projectBannerText, { color: '#7c3aed' }]}>Adding phase to: {existingProject!.name}</Text>
                </View>
            )}

            {/* Content */}
            <ScrollView style={s.flex1} contentContainerStyle={s.scrollContent}>
                {renderContent()}
            </ScrollView>

            {/* Footer CTA */}
            <View style={s.footer}>
                <Pressable
                    onPress={handleNext}
                    disabled={!valid || generating}
                    style={[s.ctaBtn, valid ? s.ctaBtnActive : { backgroundColor: isDark ? '#1f2937' : '#e2e8f0', opacity: 0.6 }]}
                >
                    {generating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View style={s.ctaBtnInner}>
                            <Text style={[s.ctaBtnText, { color: valid ? 'white' : textSecondary }]}>
                                {store.step === totalSteps ? 'Generate Checklist' : 'Continue'}
                            </Text>
                            {store.step !== totalSteps && (
                                <MaterialCommunityIcons name="arrow-right" size={20} color={valid ? 'white' : textSecondary} />
                            )}
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1 },
    flex1: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 8, marginLeft: -8 },
    progressTrack: {
        flex: 1,
        marginHorizontal: 16,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#1d4ed8', borderRadius: 4 },
    stepText: { fontWeight: 'bold', fontVariant: ['tabular-nums'] },
    projectBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderBottomWidth: 1,
        gap: 8,
    },
    projectBannerText: { fontSize: 13, fontWeight: '600' },
    scrollContent: { padding: 24 },
    footer: { padding: 24, paddingTop: 0 },
    ctaBtn: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    ctaBtnActive: { backgroundColor: '#1d4ed8' },
    ctaBtnInner: { flexDirection: 'row', alignItems: 'center' },
    ctaBtnText: { fontWeight: 'bold', fontSize: 18, marginRight: 8 },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    subHeading: { marginBottom: 24 },
    categorySection: { marginBottom: 24 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    categoryAccent: { width: 4, height: 20, borderRadius: 2, marginRight: 10 },
    categoryTitle: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridCell: { width: '48%', marginBottom: 12 },
    phaseRow: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
    phaseIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    phaseLabel: { fontWeight: 'bold', fontSize: 17, marginBottom: 2 },
    phaseDesc: { fontSize: 13 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, borderWidth: 1 },
    chipText: { fontWeight: 'bold' },
    emptyText: { fontStyle: 'italic' },
    fieldLabel: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: { marginRight: 8 },
    textInputInline: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 14,
    },
});
