import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, StyleSheet } from 'react-native';
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
        if (!checklist) return { critical: [], high: [], medium: [], low: [] };
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
            <SafeAreaView style={s.screen}>
                <View style={s.notFoundContainer}>
                    <Text style={s.notFoundText}>Checklist not found.</Text>
                    <Pressable onPress={() => router.back()} style={s.goBackBtn}>
                        <Text style={s.goBackBtnText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const renderItemGroup = (priority: string, items: typeof checklist.items) => {
        if (items.length === 0) return null;

        const priorityColor = theme.colors.priority[priority as keyof typeof theme.colors.priority];

        return (
            <View key={priority} style={s.group}>
                <View style={s.groupHeader}>
                    <View style={[s.groupDot, { backgroundColor: priorityColor }]} />
                    <Text style={s.groupLabel}>{priority}</Text>
                </View>

                <View style={s.itemsContainer}>
                    {items.map((item, index) => (
                        <View key={item.id}>
                            <Pressable
                                style={[s.itemRow, index !== items.length - 1 && s.itemBorder]}
                                onLongPress={() => setEditingNote({ itemId: item.id, text: item.notes || '' })}
                            >
                                <AnimatedCheckbox
                                    checked={item.completed}
                                    onToggle={() => toggleItem(checklist.id, item.id)}
                                    priority={item.priority as any}
                                />

                                <View style={s.itemContent}>
                                    <Text style={[s.itemTitle, item.completed && s.itemTitleCompleted]}>
                                        {item.title}
                                    </Text>

                                    {item.description && (
                                        <Text style={s.itemDesc}>{item.description}</Text>
                                    )}

                                    {/* Chips: Prompt & Notes */}
                                    <View style={s.chipsRow}>
                                        {item.prompt && (
                                            <Pressable
                                                onPress={() => setActivePrompt(item.prompt)}
                                                style={s.promptChip}
                                            >
                                                <MaterialCommunityIcons name="brain" size={14} color={theme.colors.accent} />
                                                <Text style={s.promptChipText}>AI PROMPT</Text>
                                            </Pressable>
                                        )}

                                        <Pressable
                                            onPress={() => setEditingNote({ itemId: item.id, text: item.notes || '' })}
                                            style={[s.noteChip, item.notes ? s.noteChipActive : s.noteChipInactive]}
                                        >
                                            <MaterialCommunityIcons
                                                name="note-text-outline"
                                                size={14}
                                                color={item.notes ? theme.colors.priority.medium : '#94a3b8'}
                                            />
                                            {item.notes && <Text style={s.noteChipText}>NOTES</Text>}
                                        </Pressable>
                                    </View>

                                    {/* Note Preview */}
                                    {item.notes && (
                                        <View style={s.notePreview}>
                                            <Text style={s.notePreviewText}>{item.notes}</Text>
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
        <SafeAreaView style={s.screen} edges={['top'] as any}>
            {/* Header */}
            <View style={s.header}>
                <Pressable onPress={() => router.back()} style={s.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                </Pressable>
                <View style={s.headerCenter}>
                    <Text style={s.headerTitle} numberOfLines={1}>
                        {checklist.title}
                    </Text>
                    <Text style={s.headerSubtitle}>
                        {projectDef?.label} • {checklist.phase}
                    </Text>
                </View>
                <View>
                    <ProgressRing progress={progress} size={40} strokeWidth={4} color={color} showText={true} />
                </View>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent}>
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

            {/* Note Edit Modal */}
            <Modal visible={!!editingNote} transparent animationType="fade" onRequestClose={() => setEditingNote(null)}>
                <View style={s.modalOverlay}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>Edit Note</Text>
                        <TextInput
                            style={s.modalInput}
                            multiline
                            textAlignVertical="top"
                            placeholder="Add specific implementation details..."
                            placeholderTextColor="#666"
                            value={editingNote?.text}
                            onChangeText={(text) => setEditingNote(prev => prev ? { ...prev, text } : null)}
                            autoFocus
                        />
                        <View style={s.modalBtnRow}>
                            <Pressable onPress={() => setEditingNote(null)} style={s.modalCancelBtn}>
                                <Text style={s.modalBtnText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    if (editingNote) updateItemNotes(checklist.id, editingNote.itemId, editingNote.text);
                                    setEditingNote(null);
                                }}
                                style={s.modalSaveBtn}
                            >
                                <Text style={s.modalBtnText}>Save Note</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#07050f',
    },
    notFoundContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFoundText: {
        color: 'white',
    },
    goBackBtn: {
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    goBackBtnText: {
        color: 'white',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#07050f',
        zIndex: 10,
    },
    backBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    headerCenter: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    headerSubtitle: {
        color: '#6b7280',
        fontSize: 12,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    group: {
        marginBottom: 24,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginLeft: 8,
    },
    groupDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    groupLabel: {
        color: '#9ca3af',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 2,
    },
    itemsContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    itemRow: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    itemContent: {
        flex: 1,
        marginLeft: 12,
        paddingTop: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e2e8f0',
    },
    itemTitleCompleted: {
        color: '#6b7280',
        textDecorationLine: 'line-through',
    },
    itemDesc: {
        color: '#6b7280',
        fontSize: 14,
        marginTop: 4,
    },
    chipsRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    promptChip: {
        backgroundColor: 'rgba(124,58,237,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(124,58,237,0.2)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    promptChipText: {
        color: '#a78bfa',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    noteChip: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteChipActive: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        borderColor: 'rgba(245,158,11,0.2)',
    },
    noteChipInactive: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    noteChipText: {
        color: '#f59e0b',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    notePreview: {
        marginTop: 8,
        backgroundColor: 'rgba(120,53,15,0.1)',
        padding: 8,
        borderRadius: 4,
        borderLeftWidth: 2,
        borderLeftColor: '#ca8a04',
    },
    notePreviewText: {
        color: '#9ca3af',
        fontSize: 12,
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: '#1a1625',
        width: '100%',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: 'white',
        padding: 16,
        borderRadius: 12,
        minHeight: 120,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalBtnRow: {
        flexDirection: 'row',
        gap: 16,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        alignItems: 'center',
    },
    modalSaveBtn: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#7c3aed',
        borderRadius: 12,
        alignItems: 'center',
    },
    modalBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
