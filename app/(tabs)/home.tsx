import React, { useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChecklistStore } from '../../src/store/checklistStore';
import { ChecklistCard } from '../../src/components/checklist/ChecklistCard';
import { theme } from '../../src/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
    const { checklists, getProgress } = useChecklistStore();

    useFocusEffect(
        useCallback(() => {
            // Logic to refresh data if necessary
        }, [])
    );

    const activeChecklists = checklists;
    const totalCompleted = checklists.reduce((acc, c) => acc + (c.items.filter(i => i.completed).length), 0);
    const totalItems = checklists.reduce((acc, c) => acc + c.items.length, 0);

    return (
        <SafeAreaView style={s.screen} edges={['top'] as any}>
            <View style={s.header}>
                <View>
                    <Text style={s.headerLabel}>Total Progress</Text>
                    <Text style={s.headerProgress}>
                        {totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0}%{' '}
                        <Text style={s.headerProgressSuffix}>Done</Text>
                    </Text>
                </View>
                <Link href="/questionnaire" asChild>
                    <Pressable style={s.addBtn}>
                        <MaterialCommunityIcons name="plus" size={28} color="white" />
                    </Pressable>
                </Link>
            </View>

            <FlatList
                data={activeChecklists}
                keyExtractor={item => item.id}
                contentContainerStyle={s.listContent}
                ListHeaderComponent={() => (
                    <Text style={s.sectionTitle}>Active Projects</Text>
                )}
                ListEmptyComponent={() => (
                    <Animated.View entering={FadeInDown.delay(200)} style={s.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.text.muted} />
                        <Text style={s.emptyTitle}>No Active Checklists</Text>
                        <Text style={s.emptyDesc}>
                            Create a new checklist to start tracking your development progress.
                        </Text>
                        <Pressable
                            onPress={() => router.push('/questionnaire')}
                            style={s.createBtn}
                        >
                            <Text style={s.createBtnText}>Create Checklist</Text>
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
                <Animated.View entering={FadeInDown.delay(500)} style={s.fab}>
                    <Pressable
                        onPress={() => router.push('/questionnaire')}
                        style={s.fabBtn}
                    >
                        <MaterialCommunityIcons name="plus" size={32} color="white" />
                    </Pressable>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#07050f',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    headerProgress: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    headerProgressSuffix: {
        fontSize: 18,
        color: '#6b7280',
        fontWeight: 'normal',
    },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    listContent: {
        padding: 24,
        paddingBottom: 100,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        marginTop: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptyDesc: {
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
        maxWidth: 200,
    },
    createBtn: {
        marginTop: 32,
        backgroundColor: '#7c3aed',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fabBtn: {
        backgroundColor: '#7c3aed',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
