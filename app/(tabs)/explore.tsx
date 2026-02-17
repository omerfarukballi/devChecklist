import React from 'react';
import { View, Text, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PROJECT_TYPES, ProjectTypeDefinition } from '../../src/data/projectTypes';
import { ProjectTypeCard } from '../../src/components/questionnaire/ProjectTypeCard';
import { theme } from '../../src/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useOnboardingStore } from '../../src/store/onboardingStore';

export default function ExploreScreen() {
    const router = useRouter();
    const { setProjectType, setStep, reset } = useOnboardingStore();

    const handleSelectType = (typeId: string) => {
        reset();
        setProjectType(typeId as any);
        setStep(2); // Skip step 1 (selection) since we selected here
        router.push('/questionnaire');
    };

    // Group by category
    const groupedData = PROJECT_TYPES.reduce((acc, curr) => {
        const group = acc.find(g => g.title === curr.group);
        if (group) {
            group.data.push(curr);
        } else {
            acc.push({ title: curr.group, data: [curr] });
        }
        return acc;
    }, [] as { title: string, data: ProjectTypeDefinition[] }[]);

    return (
        <SafeAreaView className="flex-1 bg-[#07050f]" edges={['top']}>
            <View className="p-6 pb-2">
                <Text className="text-white text-3xl font-bold">Explore</Text>
                <Text className="text-gray-400 mt-1">Discover checklists for any project.</Text>
            </View>

            <SectionList
                sections={groupedData}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="flex-row items-center mb-4 mt-6">
                        <View className={`w-1 h-6 mr-3 rounded-full`} style={{ backgroundColor: theme.colors.group[title] || theme.colors.accent }} />
                        <Text className="text-white text-xl font-bold">{title}</Text>
                    </View>
                )}
                renderItem={({ item, index }) => {
                    // Grid layout simulation: We actually render items in specific way or just list them? 
                    // The design requested a grid in questionnaire, but explore list might be better as detailed cards.
                    // Let's use the ProjectTypeCard but full width or grid?
                    // SectionList doesn't support numColumns safely with heterogeneous sections. 
                    // We will render simple rows here or custom wrap.
                    // To make it look good, let's wrap logic to render rows of 2.
                    // Actually, keep it simple list for Explore, maybe horizontal scroll per section?
                    // No, vertical list of grid items is standard.
                    // Let's just render the Card and maybe style it to look good in a list.
                    if (index % 2 !== 0) return null; // We handle pairs

                    const nextItem = groupedData.find(g => g.title === item.group)?.data.find((_, i) => i === index + 1);

                    return (
                        <View className="flex-row justify-between mb-4">
                            <View className="flex-1 mr-2">
                                <ProjectTypeCard
                                    typeId={item.id}
                                    onPress={() => handleSelectType(item.id)}
                                    index={index}
                                />
                            </View>
                            <View className="flex-1 ml-2">
                                {nextItem && (
                                    <ProjectTypeCard
                                        typeId={nextItem.id}
                                        onPress={() => handleSelectType(nextItem.id)}
                                        index={index + 1}
                                    />
                                )}
                            </View>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
}
