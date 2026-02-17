import React, { useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChecklistStore } from '../../src/store/checklistStore';
import { ChecklistCard } from '../../src/components/checklist/ChecklistCard';
import { theme } from '../../src/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
    const router = useRouter();
    const { checklists, getProgress } = useChecklistStore();

    // Force re-render on focus if needed
    useFocusEffect(
        useCallback(() => {
            // Logic to refresh data if necessary
        }, [])
    );

    const activeChecklists = checklists;
    const totalCompleted = checklists.reduce((acc, c) => acc + (c.items.filter(i => i.completed).length), 0);
    const totalItems = checklists.reduce((acc, c) => acc + c.items.length, 0);

    return (
        <SafeAreaView className="flex-1 bg-[#07050f]" edges={['top']}>
            <View className="p-6 pb-2 flex-row justify-between items-center">
                <View>
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Progress</Text>
                    <Text className="text-white text-3xl font-bold">
                        {totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0}% <Text className="text-lg text-gray-500 font-normal">Done</Text>
                    </Text>
                </View>
                <Link href="/questionnaire" asChild>
                    <Pressable className="bg-white/10 w-12 h-12 rounded-full items-center justify-center border border-white/20 active:bg-white/20">
                        <MaterialCommunityIcons name="plus" size={28} color="white" />
                    </Pressable>
                </Link>
            </View>

            <FlatList
                data={activeChecklists}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListHeaderComponent={() => (
                    <Text className="text-white text-xl font-bold mb-6 mt-2">Active Projects</Text>
                )}
                ListEmptyComponent={() => (
                    <Animated.View entering={FadeInDown.delay(200)} className="items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
                        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.text.muted} />
                        <Text className="text-white text-lg font-bold mt-4">No Active Checklists</Text>
                        <Text className="text-gray-500 text-center mt-2 max-w-[200px]">
                            Create a new checklist to start tracking your development progress.
                        </Text>
                        <Pressable
                            onPress={() => router.push('/questionnaire')}
                            className="mt-8 bg-violet-600 px-6 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold">Create Checklist</Text>
                        </Pressable>
                    </Animated.View>
                )}
                renderItem={({ item, index }) => (
                    <ChecklistCard
                        checklist={item}
                        progress={getProgress(item.id)}
                        index={index}
                    />
                )}
            />

            {/* FAB (Floating Action Button) */}
            {checklists.length > 0 && (
                <Animated.View
                    entering={FadeInDown.delay(500)}
                    className="absolute bottom-6 right-6"
                >
                    <Pressable
                        onPress={() => router.push('/questionnaire')}
                        className="bg-violet-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-violet-600/50"
                    >
                        <MaterialCommunityIcons name="plus" size={32} color="white" />
                    </Pressable>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

// Temporary Link helper to avoid circular dep issues in some setups, but here imported from Expo Router
import { Link } from 'expo-router';
