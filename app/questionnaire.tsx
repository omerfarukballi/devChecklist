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
import * as Haptics from 'expo-haptics';

const PHASES = [
    { id: 'planning', label: 'Planning', icon: 'clipboard-text-outline', desc: 'Requirements, Architecture, Stack' },
    { id: 'coding', label: 'Coding', icon: 'code-braces', desc: 'Implementation, Patterns, Logic' },
    { id: 'testing', label: 'Testing', icon: 'flask-outline', desc: 'Unit, Integration, E2E' },
    { id: 'deployment', label: 'Deployment', icon: 'rocket-launch-outline', desc: 'CI/CD, Hosting, Domain' },
    { id: 'scaling', label: 'Scaling', icon: 'chart-line-variant', desc: 'Performance, Optimization' },
] as const;

// When projectId is passed in params, we are adding a new phase to an existing project
const TOTAL_STEPS = 3;

export default function QuestionnaireScreen() {
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();
    const { addChecklist, addProject, getProject, projects } = useChecklistStore();
    const params = useLocalSearchParams<{ projectId?: string }>();
    const existingProjectId = params.projectId;
    const existingProject = existingProjectId ? getProject(existingProjectId) : undefined;

    const [generating, setGenerating] = useState(false);
    // Step 4 (project info) fields — only shown when creating a NEW project
    const [projectName, setProjectName] = useState('');
    const [githubUrl, setGithubUrl] = useState('');

    // If we're adding a phase to an existing project, skip to step 1 directly
    // (project type is locked to the existing project's type)
    const isAddingPhase = !!existingProject;

    const handleBack = () => {
        if (store.step > 1) {
            store.setStep(store.step - 1);
        } else {
            router.back();
        }
    };

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const totalSteps = isAddingPhase ? TOTAL_STEPS : TOTAL_STEPS + 1;
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
                    // Add checklist and link to existing project
                    addChecklist(newList, existingProjectId);
                } else {
                    // Create a brand-new project with empty checklistIds,
                    // then addChecklist will append the id via projectId param
                    const newProject = {
                        id: `proj-${Date.now()}`,
                        name: projectName.trim() || projectLabel,
                        projectType: projectTypeId,
                        techStack,
                        githubUrl: githubUrl.trim() || undefined,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        checklistIds: [],  // empty — addChecklist will append
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
        const totalSteps = isAddingPhase ? TOTAL_STEPS : TOTAL_STEPS + 1;
        if (!isAddingPhase && store.step === 1) return !!store.projectType;
        const phaseStep = isAddingPhase ? 1 : 2;
        if (store.step === phaseStep) return !!store.phase;
        // project info step (only for new project): project name required
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
            <Text style={s.heading}>What are you building?</Text>
            {groupedProjectTypes.map((section) => (
                <View key={section.title} style={s.categorySection}>
                    <View style={s.categoryHeader}>
                        <View
                            style={[
                                s.categoryAccent,
                                { backgroundColor: theme.colors.group[section.title as keyof typeof theme.colors.group] || theme.colors.accent }
                            ]}
                        />
                        <Text style={s.categoryTitle}>{section.title}</Text>
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
            <Text style={s.heading}>Which phase?</Text>
            <Text style={s.subHeading}>Select the current stage of your project.</Text>
            {PHASES.map((phase, index) => {
                const selected = store.phase === phase.id;
                return (
                    <Animated.View entering={FadeInRight.delay(index * 100)} key={phase.id}>
                        <Pressable
                            onPress={() => {
                                store.setPhase(phase.id);
                                Haptics.selectionAsync();
                            }}
                            style={[s.phaseRow, selected ? s.phaseRowSelected : s.phaseRowDefault]}
                        >
                            <View style={[s.phaseIcon, selected ? s.phaseIconSelected : s.phaseIconDefault]}>
                                <MaterialCommunityIcons name={phase.icon as any} size={24} color="white" />
                            </View>
                            <View style={s.flex1}>
                                <Text style={s.phaseLabel}>{phase.label}</Text>
                                <Text style={s.phaseDesc}>{phase.desc}</Text>
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
                <Text style={s.heading}>Tech Stack</Text>
                <Text style={s.subHeading}>Select the technologies you're using (optional).</Text>
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
                                    style={[s.chip, selected ? s.chipSelected : s.chipDefault]}
                                >
                                    <Text style={[s.chipText, selected ? s.chipTextSelected : s.chipTextDefault]}>
                                        {stack.label}
                                    </Text>
                                </Pressable>
                            </Animated.View>
                        );
                    })}
                </View>
                {(!stacks || stacks.length === 0) && (
                    <Text style={s.emptyText}>No specific tech stacks for this type.</Text>
                )}
            </View>
        );
    };

    const renderProjectInfoStep = () => (
        <View>
            <Text style={s.heading}>Project Info</Text>
            <Text style={s.subHeading}>Give your project a name and optionally link a GitHub repo.</Text>

            <Text style={s.fieldLabel}>Project Name *</Text>
            <TextInput
                style={s.textInput}
                placeholder="e.g. My SaaS App"
                placeholderTextColor="#6b7280"
                value={projectName}
                onChangeText={setProjectName}
                autoFocus
                autoCapitalize="words"
            />


            <Text style={[s.fieldLabel, { marginTop: 20 }]}>GitHub URL (optional)</Text>
            <View style={s.inputRow}>
                <MaterialCommunityIcons name="github" size={20} color="#9ca3af" style={s.inputIcon} />
                <TextInput
                    style={s.textInputInline}
                    placeholder="https://github.com/user/repo"
                    placeholderTextColor="#6b7280"
                    value={githubUrl}
                    onChangeText={setGithubUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                />
            </View>
        </View>
    );

    const valid = isStepValid();
    const totalSteps = isAddingPhase ? TOTAL_STEPS : TOTAL_STEPS + 1;

    // Determine which content to show based on step + mode
    const renderContent = () => {
        if (isAddingPhase) {
            // Step 1: phase, Step 2: tech stack (project type locked)
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
        <View style={[s.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Header */}
            <View style={s.header}>
                <Pressable onPress={handleBack} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <View style={s.progressTrack}>
                    <Animated.View style={[s.progressFill, { width: `${(store.step / totalSteps) * 100}%` as any }]} />
                </View>
                <Text style={s.stepText}>{store.step}/{totalSteps}</Text>
            </View>

            {/* Context banner when adding phase to existing project */}
            {isAddingPhase && (
                <View style={s.projectBanner}>
                    <MaterialCommunityIcons name="folder-open-outline" size={16} color="#3b82f6" />
                    <Text style={s.projectBannerText}>Adding phase to: {existingProject!.name}</Text>
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
                    style={[s.ctaBtn, valid ? s.ctaBtnActive : s.ctaBtnDisabled]}
                >
                    {generating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View style={s.ctaBtnInner}>
                            <Text style={s.ctaBtnText}>
                                {store.step === totalSteps ? 'Generate Checklist' : 'Continue'}
                            </Text>
                            {store.step !== totalSteps && (
                                <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                            )}
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#07050f' },
    flex1: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: { padding: 8, marginLeft: -8 },
    progressTrack: {
        flex: 1,
        marginHorizontal: 16,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#0078d4', borderRadius: 4 },

    stepText: { color: '#94a3b8', fontWeight: 'bold', fontVariant: ['tabular-nums'] },
    projectBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,120,212,0.15)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,120,212,0.3)',
        gap: 8,
    },
    projectBannerText: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
    scrollContent: { padding: 24 },
    footer: { padding: 24, paddingTop: 0 },
    ctaBtn: { width: '100%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    ctaBtnActive: { backgroundColor: '#0078d4' },
    ctaBtnDisabled: { backgroundColor: '#1f2937', opacity: 0.5 },

    ctaBtnInner: { flexDirection: 'row', alignItems: 'center' },
    ctaBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginRight: 8 },
    heading: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
    subHeading: { color: '#94a3b8', marginBottom: 24 },
    // Step 1 — categories
    categorySection: { marginBottom: 24 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    categoryAccent: { width: 4, height: 20, borderRadius: 2, marginRight: 10 },
    categoryTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridCell: { width: '48%', marginBottom: 12 },
    // Phase step
    phaseRow: { padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
    phaseRowSelected: { backgroundColor: 'rgba(0,120,212,0.2)', borderColor: '#0078d4' },
    phaseRowDefault: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    phaseIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    phaseIconSelected: { backgroundColor: '#0078d4' },
    phaseIconDefault: { backgroundColor: 'rgba(255,255,255,0.1)' },

    phaseLabel: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    phaseDesc: { color: '#94a3b8', fontSize: 14 },
    // Tech stack step
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, borderWidth: 1 },
    chipSelected: { backgroundColor: '#0078d4', borderColor: '#0078d4' },

    chipDefault: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    chipText: { fontWeight: 'bold' },
    chipTextSelected: { color: 'white' },
    chipTextDefault: { color: '#94a3b8' },
    emptyText: { color: '#6b7280', fontStyle: 'italic' },
    // Project info step
    fieldLabel: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        color: 'white',
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: { marginRight: 8 },
    textInputInline: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        paddingVertical: 14,
    },
});
