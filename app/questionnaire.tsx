import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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

export default function QuestionnaireScreen() {
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();
    const { addChecklist } = useChecklistStore();
    const [generating, setGenerating] = useState(false);

    const handleBack = () => {
        if (store.step > 1) {
            store.setStep(store.step - 1);
        } else {
            router.back();
        }
    };

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (store.step === 4) {
            setGenerating(true);
            setTimeout(() => {
                const items = generateChecklist({
                    projectType: store.projectType!,
                    phase: store.phase!,
                    techStack: store.selectedStack,
                    experience: store.experience,
                    goal: store.goal
                });

                const newList = {
                    id: Date.now().toString(),
                    title: store.goal || PROJECT_TYPES.find(p => p.id === store.projectType)?.label || 'New Project',
                    projectType: store.projectType!,
                    phase: store.phase!,
                    techStack: store.selectedStack,
                    experience: store.experience,
                    goal: store.goal,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    items
                };

                addChecklist(newList);
                store.reset();
                setGenerating(false);
                router.replace(`/checklist/${newList.id}`);
            }, 800);
        } else {
            store.setStep(store.step + 1);
        }
    };

    const isStepValid = () => {
        if (store.step === 1) return !!store.projectType;
        if (store.step === 2) return !!store.phase;
        if (store.step === 3) return store.selectedStack.length > 0;
        return true;
    };

    const renderStep1 = () => (
        <View>
            <Text style={s.heading}>What are you building?</Text>
            <View style={s.gridRow}>
                {PROJECT_TYPES.map((type, index) => (
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
    );

    const renderStep2 = () => (
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

    const renderStep3 = () => {
        const stacks = store.projectType ? TECH_STACKS[store.projectType] : [];
        return (
            <View>
                <Text style={s.heading}>Tech Stack</Text>
                <Text style={s.subHeading}>Select the technologies you are using.</Text>
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
                    <Text style={s.emptyText}>No specific recommendations for this project type. You can proceed.</Text>
                )}
                <View style={s.infoBox}>
                    <View style={s.infoBoxHeader}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#60a5fa" />
                        <Text style={s.infoBoxTitle}>Why this matters?</Text>
                    </View>
                    <Text style={s.infoBoxText}>We use your stack to filter checklist items.</Text>
                </View>
            </View>
        );
    };

    const renderStep4 = () => (
        <View>
            <Text style={s.heading}>Final Details</Text>
            <Text style={s.subHeading}>Customize your experience.</Text>
            <Text style={s.label}>Experience Level</Text>
            <View style={s.expRow}>
                {['beginner', 'intermediate', 'advanced'].map((exp) => {
                    const selected = store.experience === exp;
                    return (
                        <Pressable
                            key={exp}
                            onPress={() => store.setExperience(exp as any)}
                            style={[s.expBtn, selected ? s.expBtnSelected : s.expBtnDefault]}
                        >
                            <Text style={[s.expBtnText, selected ? s.expBtnTextSelected : s.expBtnTextDefault]}>
                                {exp}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
            <Text style={s.label}>Project Goal (Optional)</Text>
            <TextInput
                placeholder="e.g. Build a portfolio website..."
                placeholderTextColor="#64748b"
                value={store.goal}
                onChangeText={store.setGoal}
                style={s.textInput}
                multiline
                textAlignVertical="top"
            />
        </View>
    );

    const valid = isStepValid();

    return (
        <View style={[s.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* Header */}
            <View style={s.header}>
                <Pressable onPress={handleBack} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <View style={s.progressTrack}>
                    <Animated.View style={[s.progressFill, { width: `${(store.step / 4) * 100}%` as any }]} />
                </View>
                <Text style={s.stepText}>{store.step}/4</Text>
            </View>

            {/* Content */}
            <ScrollView style={s.flex1} contentContainerStyle={s.scrollContent}>
                {store.step === 1 && renderStep1()}
                {store.step === 2 && renderStep2()}
                {store.step === 3 && renderStep3()}
                {store.step === 4 && renderStep4()}
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
                                {store.step === 4 ? 'Generate Checklist' : 'Continue'}
                            </Text>
                            {store.step !== 4 && (
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
    screen: {
        flex: 1,
        backgroundColor: '#07050f',
    },
    flex1: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    progressTrack: {
        flex: 1,
        marginHorizontal: 16,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#7c3aed',
        borderRadius: 4,
    },
    stepText: {
        color: '#94a3b8',
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    scrollContent: {
        padding: 24,
    },
    footer: {
        padding: 24,
        paddingTop: 0,
    },
    ctaBtn: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaBtnActive: {
        backgroundColor: '#7c3aed',
    },
    ctaBtnDisabled: {
        backgroundColor: '#1f2937',
        opacity: 0.5,
    },
    ctaBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ctaBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 8,
    },
    // Step 1
    heading: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    subHeading: {
        color: '#94a3b8',
        marginBottom: 24,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridCell: {
        width: '48%',
        marginBottom: 16,
    },
    // Step 2
    phaseRow: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    phaseRowSelected: {
        backgroundColor: 'rgba(124,58,237,0.2)',
        borderColor: '#7c3aed',
    },
    phaseRowDefault: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    phaseIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    phaseIconSelected: {
        backgroundColor: '#7c3aed',
    },
    phaseIconDefault: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    phaseLabel: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    phaseDesc: {
        color: '#94a3b8',
        fontSize: 14,
    },
    // Step 3
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 999,
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
    },
    chipDefault: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    chipText: {
        fontWeight: 'bold',
    },
    chipTextSelected: {
        color: 'white',
    },
    chipTextDefault: {
        color: '#94a3b8',
    },
    emptyText: {
        color: '#6b7280',
        fontStyle: 'italic',
    },
    infoBox: {
        marginTop: 32,
        backgroundColor: 'rgba(30,58,138,0.2)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.3)',
    },
    infoBoxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoBoxTitle: {
        color: '#60a5fa',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    infoBoxText: {
        color: 'rgba(191,219,254,0.8)',
        fontSize: 14,
    },
    // Step 4
    label: {
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 12,
    },
    expRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    expBtn: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
    },
    expBtnSelected: {
        backgroundColor: '#7c3aed',
        borderColor: 'transparent',
    },
    expBtnDefault: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    expBtnText: {
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    expBtnTextSelected: {
        color: 'white',
    },
    expBtnTextDefault: {
        color: '#6b7280',
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        color: 'white',
        minHeight: 100,
    },
});
