import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
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
    const router = useRouter();
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
            // Generate
            setGenerating(true);

            // Simulate generic "thinking" time for UX
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

    // Render Steps
    const renderStep1 = () => (
        <View>
            <Text className="text-white text-2xl font-bold mb-6">What are you building?</Text>
            <View className="flex-row flex-wrap justify-between">
                {PROJECT_TYPES.map((type, index) => (
                    <View key={type.id} className="w-[48%] mb-4">
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
            <Text className="text-white text-2xl font-bold mb-2">Which phase?</Text>
            <Text className="text-gray-400 mb-6">Select the current stage of your project.</Text>

            {PHASES.map((phase, index) => (
                <Animated.View entering={FadeInRight.delay(index * 100)} key={phase.id}>
                    <Pressable
                        onPress={() => {
                            store.setPhase(phase.id);
                            Haptics.selectionAsync();
                        }}
                        className={`p-4 rounded-xl mb-4 border flex-row items-center ${store.phase === phase.id
                            ? 'bg-violet-600/20 border-violet-500'
                            : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${store.phase === phase.id ? 'bg-violet-600' : 'bg-white/10'}`}>
                            <MaterialCommunityIcons name={phase.icon as any} size={24} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-bold text-lg">{phase.label}</Text>
                            <Text className="text-gray-400 text-sm">{phase.desc}</Text>
                        </View>
                        {store.phase === phase.id && (
                            <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.accent} />
                        )}
                    </Pressable>
                </Animated.View>
            ))}
        </View>
    );

    const renderStep3 = () => {
        const stacks = store.projectType ? TECH_STACKS[store.projectType] : [];
        return (
            <View>
                <Text className="text-white text-2xl font-bold mb-2">Tech Stack</Text>
                <Text className="text-gray-400 mb-6">Select the technologies you are using.</Text>

                <View className="flex-row flex-wrap gap-3">
                    {stacks?.map((stack, index) => (
                        <Animated.View entering={FadeIn.delay(index * 50)} key={stack.id}>
                            <Pressable
                                onPress={() => {
                                    store.toggleStack(stack.id);
                                    Haptics.selectionAsync();
                                }}
                                className={`px-4 py-3 rounded-full border ${store.selectedStack.includes(stack.id)
                                    ? 'bg-violet-600 border-violet-500'
                                    : 'bg-white/5 border-white/10'
                                    }`}
                            >
                                <Text className={`font-bold ${store.selectedStack.includes(stack.id) ? 'text-white' : 'text-gray-400'}`}>
                                    {stack.label}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>

                {(!stacks || stacks.length === 0) && (
                    <Text className="text-gray-500 italic">No specific recommendations for this project type. You can proceed.</Text>
                )}

                <View className="mt-8 bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                    <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="information-outline" size={20} color="#60a5fa" />
                        <Text className="text-blue-400 font-bold ml-2">Why this matters?</Text>
                    </View>
                    <Text className="text-blue-200/80 text-sm">
                        We use your stack to filter checklist items. For example, selecting "Tailwind" will add utility-class specific tasks.
                    </Text>
                </View>
            </View>
        );
    };

    const renderStep4 = () => (
        <View>
            <Text className="text-white text-2xl font-bold mb-2">Final Details</Text>
            <Text className="text-gray-400 mb-6">Customize your experience.</Text>

            <Text className="text-white font-bold mb-3">Experience Level</Text>
            <View className="flex-row gap-4 mb-8">
                {['beginner', 'intermediate', 'advanced'].map((exp) => (
                    <Pressable
                        key={exp}
                        onPress={() => store.setExperience(exp as any)}
                        className={`flex-1 py-4 items-center rounded-xl border ${store.experience === exp
                            ? 'bg-violet-600 border-transparent'
                            : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <Text className={`font-bold capitalize ${store.experience === exp ? 'text-white' : 'text-gray-500'}`}>{exp}</Text>
                    </Pressable>
                ))}
            </View>

            <Text className="text-white font-bold mb-3">Project Goal (Optional)</Text>
            <TextInput
                placeholder="e.g. Build a portfolio website..."
                placeholderTextColor="#64748b"
                value={store.goal}
                onChangeText={store.setGoal}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white min-h-[100px]"
                multiline
                textAlignVertical="top"
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#07050f]" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="flex-row items-center px-6 py-4 border-b border-white/5">
                <Pressable onPress={handleBack} className="p-2 -ml-2">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <View className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <Animated.View
                        className="h-full bg-violet-600"
                        style={{ width: `${(store.step / 4) * 100}%` }}
                    />
                </View>
                <Text className="text-gray-400 font-bold tabular-nums">{store.step}/4</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {store.step === 1 && renderStep1()}
                {store.step === 2 && renderStep2()}
                {store.step === 3 && renderStep3()}
                {store.step === 4 && renderStep4()}
            </ScrollView>

            {/* Footer */}
            <View className="p-6 pt-0">
                <Pressable
                    onPress={handleNext}
                    disabled={!isStepValid() || generating}
                    className={`w-full h-14 rounded-2xl items-center justify-center flex-row ${isStepValid() ? 'bg-violet-600 shadow-lg shadow-violet-600/20' : 'bg-gray-800 opacity-50'
                        }`}
                >
                    {generating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">
                                {store.step === 4 ? 'Generate Checklist' : 'Continue'}
                            </Text>
                            {store.step !== 4 && <MaterialCommunityIcons name="arrow-right" size={20} color="white" />}
                        </>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
