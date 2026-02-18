import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChecklistStore } from '../../src/store/checklistStore';
import { AnimatedCheckbox } from '../../src/components/ui/AnimatedCheckbox';
import { PromptSheet } from '../../src/components/PromptSheet';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { theme } from '../../src/constants/theme';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { PROJECT_TYPES } from '../../src/data/projectTypes';

export default function ChecklistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { getChecklist, toggleItem, updateItemNotes, getProgress } = useChecklistStore();

    const checklist = getChecklist(id);
    const progress = checklist ? getProgress(id) : 0;

    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<{ itemId: string; text: string } | null>(null);

    const projectDef = checklist ? PROJECT_TYPES.find(p => p.id === checklist.projectType) : null;
    const color = projectDef?.color || theme.colors.accent;

    // Group items by priority
    const groupedItems = useMemo(() => {
        if (!checklist) return {};
        const groups: Record<string, typeof checklist.items> = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };
        checklist.items.forEach(item => {
            if (groups[item.priority]) {
                groups[item.priority].push(item);
            }
        });
        return groups;
    }, [checklist]);

    if (!checklist) {
        return (
            <SafeAreaView className="flex-1 bg-[#07050f] items-center justify-center">
                <Text className="text-white">Checklist not found.</Text>
                <Pressable onPress={() => router.back()} className="mt-4 bg-white/10 px-4 py-2 rounded-lg">
                    <Text className="text-white">Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const renderItemGroup = (priority: string, items: typeof checklist.items) => {
        if (items.length === 0) return null;

        const priorityColor = theme.colors.priority[priority as keyof typeof theme.colors.priority];

        return (
            <View key={priority} className="mb-6">
                <View className="flex-row items-center mb-3 ml-2">
                    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: priorityColor }} />
                    <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest">{priority}</Text>
                </View>

                <View className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    {items.map((item, index) => (
                        <View key={item.id}>
                            <Pressable
                                className={`p-4 flex-row items-start ${index !== items.length - 1 ? 'border-b border-white/5' : ''}`}
                                onLongPress={() => setEditingNote({ itemId: item.id, text: item.notes || '' })}
                            >
                                <AnimatedCheckbox
                                    checked={item.completed}
                                    onToggle={() => toggleItem(checklist.id, item.id)}
                                    priority={item.priority as any}
                                />

                                <View className="flex-1 ml-3 pt-1">
                                    <Text
                                        className={`text-base font-semibold ${item.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}
                                    >
                                        {item.title}
                                    </Text>

                                    {item.description && (
                                        <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>
                                    )}

                                    {/* Chips: Prompt & Notes */}
                                    <View className="flex-row mt-3 gap-2">
                                        {item.prompt && (
                                            <Pressable
                                                onPress={() => setActivePrompt(item.prompt)}
                                                className="bg-violet-500/10 px-3 py-1 rounded-md border border-violet-500/20 flex-row items-center"
                                            >
                                                <MaterialCommunityIcons name="brain" size={14} color={theme.colors.accent} />
                                                <Text className="text-violet-400 text-xs font-bold ml-1">AI PROMPT</Text>
                                            </Pressable>
                                        )}

                                        <Pressable
                                            onPress={() => setEditingNote({ itemId: item.id, text: item.notes || '' })}
                                            className={`px-3 py-1 rounded-md border flex-row items-center ${item.notes ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10'}`}
                                        >
                                            <MaterialCommunityIcons name="note-text-outline" size={14} color={item.notes ? theme.colors.priority.medium : '#94a3b8'} />
                                            {item.notes && <Text className="text-amber-500 text-xs font-bold ml-1">NOTES</Text>}
                                        </Pressable>
                                    </View>

                                    {/* Render Note Preview if exists */}
                                    {item.notes && (
                                        <View className="mt-2 bg-yellow-900/10 p-2 rounded border-l-2 border-yellow-600">
                                            <Text className="text-gray-400 text-xs italic">{item.notes}</Text>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#07050f]" edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 flex-row items-center justify-between border-b border-white/5 bg-[#07050f] z-10">
                <Pressable onPress={() => router.back()} className="p-2 bg-white/5 rounded-full">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <View className="flex-1 px-4">
                    <Text className="text-white font-bold text-lg text-center" numberOfLines={1}>
                        {checklist.title}
                    </Text>
                    <Text className="text-gray-500 text-xs text-center uppercase tracking-wider">
                        {projectDef?.label} • {checklist.phase}
                    </Text>
                </View>
                <View>
                    <ProgressRing progress={progress} size={40} strokeWidth={4} color={color} showText={true} />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {renderItemGroup('critical', groupedItems.critical)}
                {renderItemGroup('high', groupedItems.high)}
                {renderItemGroup('medium', groupedItems.medium)}
                {renderItemGroup('low', groupedItems.low)}
            </ScrollView>

            {/* Prompt Sheet */}
            <PromptSheet
                visible={!!activePrompt}
                onClose={() => setActivePrompt(null)}
                prompt={activePrompt || ''}
            />

            {/* Note Edit Modal (Simple implementation) */}
            <Modal visible={!!editingNote} transparent animationType="fade" onRequestClose={() => setEditingNote(null)}>
                <View className="flex-1 bg-black/80 justify-center items-center p-6">
                    <View className="bg-[#1a1625] w-full rounded-2xl p-6 border border-white/10">
                        <Text className="text-white text-lg font-bold mb-4">Edit Note</Text>
                        <TextInput
                            className="bg-white/5 text-white p-4 rounded-xl min-h-[120px] mb-6 border border-white/10"
                            multiline
                            textAlignVertical="top"
                            placeholder="Add specific implementation details..."
                            placeholderTextColor="#666"
                            value={editingNote?.text}
                            onChangeText={(text) => setEditingNote(prev => prev ? { ...prev, text } : null)}
                            autoFocus
                        />
                        <View className="flex-row gap-4">
                            <Pressable
                                onPress={() => setEditingNote(null)}
                                className="flex-1 py-3 bg-white/10 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    if (editingNote) updateItemNotes(checklist.id, editingNote.itemId, editingNote.text);
                                    setEditingNote(null);
                                }}
                                className="flex-1 py-3 bg-violet-600 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold">Save Note</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
