import React from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PROJECT_TYPES, ProjectTypeDefinition } from '../../src/data/projectTypes';
import { ProjectTypeCard } from '../../src/components/questionnaire/ProjectTypeCard';
import { theme } from '../../src/constants/theme';
import { useOnboardingStore } from '../../src/store/onboardingStore';

export default function ExploreScreen() {
    const { setProjectType, setStep, reset } = useOnboardingStore();

    const handleSelectType = (typeId: string) => {
        reset();
        setProjectType(typeId as any);
        setStep(2);
        router.push('/questionnaire');
    };

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
        <SafeAreaView style={s.screen} edges={['top'] as any}>
            <View style={s.headerBox}>
                <Text style={s.heading}>Explore</Text>
                <Text style={s.subHeading}>Discover checklists for any project.</Text>
            </View>

            <SectionList
                sections={groupedData}
                keyExtractor={(item) => item.id}
                contentContainerStyle={s.listContent}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={s.sectionHeader}>
                        <View
                            style={[
                                s.sectionAccent,
                                { backgroundColor: theme.colors.group[title as keyof typeof theme.colors.group] || theme.colors.accent }
                            ]}
                        />
                        <Text style={s.sectionTitle}>{title}</Text>
                    </View>
                )}
                renderItem={({ item, index }) => {
                    if (index % 2 !== 0) return null;

                    const sectionData = groupedData.find(g => g.title === item.group)?.data ?? [];
                    const nextItem = sectionData[index + 1];

                    return (
                        <View style={s.gridRow}>
                            <View style={s.gridCell}>
                                <ProjectTypeCard
                                    typeId={item.id}
                                    onPress={() => handleSelectType(item.id)}
                                    index={index}
                                />
                            </View>
                            <View style={s.gridCell}>
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

const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#07050f',
    },
    headerBox: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 8,
    },
    heading: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    subHeading: {
        color: '#9ca3af',
        marginTop: 4,
    },
    listContent: {
        padding: 24,
        paddingBottom: 100,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 24,
    },
    sectionAccent: {
        width: 4,
        height: 24,
        borderRadius: 2,
        marginRight: 12,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gridCell: {
        flex: 1,
        marginHorizontal: 4,
    },
});
