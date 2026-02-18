import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChecklistStore } from '../../src/store/checklistStore';
import { AnimatedCheckbox } from '../../src/components/ui/AnimatedCheckbox';
import { PromptSheet } from '../../src/components/PromptSheet';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { SwipeableItem } from '../../src/components/ui/SwipeableItem';
import { theme } from '../../src/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PROJECT_TYPES } from '../../src/data/projectTypes';

export default function ChecklistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getChecklist, toggleItem, updateItemNotes, getProgress, addCustomItem, deleteItem, deleteChecklist, getProjectForChecklist } = useChecklistStore();

    const checklist = getChecklist(id);
    const progress = checklist ? getProgress(id) : 0;
    const project = checklist ? getProjectForChecklist(id) : undefined;

    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<{ itemId: string; text: string } | null>(null);
    const [addingItem, setAddingItem] = useState(false);
    const [newItemText, setNewItemText] = useState('');

    const projectDef = checklist ? PROJECT_TYPES.find(p => p.id === checklist.projectType) : null;
    const color = projectDef?.color || theme.colors.accent;

    const groupedItems = useMemo(() => {
        if (!checklist) return { critical: [], high: [], medium: [], low: [] };
        const groups: Record<string, typeof checklist.items> = { critical: [], high: [], medium: [], low: [] };
        checklist.items.forEach(item => {
            if (groups[item.priority]) groups[item.priority].push(item);
        });
        return groups;
    }, [checklist]);

    const handleAddItem = () => {
        const title = newItemText.trim();
        if (!title) return;
        addCustomItem(id, title);
        setNewItemText('');
        setAddingItem(false);
    };

    const handleDeleteChecklist = () => {
        Alert.alert(
            'Delete Checklist',
            'This will permanently delete this checklist and all its items.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: () => {
                        deleteChecklist(id);
                        router.back();
                    }
                },
            ]
        );
    };

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
                        <SwipeableItem
                            key={item.id}
                            isCompleted={item.completed}
                            onComplete={() => toggleItem(checklist.id, item.id)}
                            onDelete={() => deleteItem(id, item.id)}
                            showSeparator={index !== items.length - 1}
                        >
                            <Pressable
                                style={s.itemRow}
                                onPress={() => toggleItem(checklist.id, item.id)}
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
                                    {item.description ? (
                                        <Text style={s.itemDesc}>{item.description}</Text>
                                    ) : null}
                                    <View style={s.chipsRow}>
                                        {item.prompt ? (
                                            <Pressable onPress={() => setActivePrompt(item.prompt)} style={s.promptChip}>
                                                <MaterialCommunityIcons name="brain" size={14} color={theme.colors.accent} />
                                                <Text style={s.promptChipText}>AI PROMPT</Text>
                                            </Pressable>
                                        ) : null}
                                        <Pressable
                                            onPress={() => setEditingNote({ itemId: item.id, text: item.notes || '' })}
                                            style={[s.noteChip, item.notes ? s.noteChipActive : s.noteChipInactive]}
                                        >
                                            <MaterialCommunityIcons
                                                name="note-text-outline"
                                                size={14}
                                                color={item.notes ? theme.colors.priority.medium : '#94a3b8'}
                                            />
                                            {item.notes ? <Text style={s.noteChipText}>NOTE</Text> : null}
                                        </Pressable>
                                    </View>
                                    {item.notes ? (
                                        <View style={s.notePreview}>
                                            <Text style={s.notePreviewText}>{item.notes}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </Pressable>
                        </SwipeableItem>
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
                    {project && (
                        <Text style={s.headerProject} numberOfLines={1}>
                            {project.name}
                        </Text>
                    )}
                    <Text style={s.headerTitle} numberOfLines={1}>{checklist.phase}</Text>
                    <Text style={s.headerSubtitle}>{projectDef?.label}</Text>
                </View>
                <View style={s.headerRight}>
                    {project?.githubUrl ? (
                        <Pressable
                            onPress={() => Linking.openURL(project.githubUrl!)}
                            style={s.githubBtn}
                        >
                            <MaterialCommunityIcons name="github" size={20} color="#9ca3af" />
                        </Pressable>
                    ) : null}
                    <ProgressRing progress={progress} size={36} strokeWidth={3} color={color} showText={true} />
                    <Pressable onPress={handleDeleteChecklist} style={s.deleteListBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent}>
                {renderItemGroup('critical', groupedItems.critical)}
                {renderItemGroup('high', groupedItems.high)}
                {renderItemGroup('medium', groupedItems.medium)}
                {renderItemGroup('low', groupedItems.low)}

                {/* Custom Items section */}
                {checklist.items.filter(i => i.tags?.includes('custom')).length > 0 && (
                    renderItemGroup('medium', [])  // already rendered above in medium
                )}

                {/* Add Item Button */}
                {addingItem ? (
                    <Animated.View entering={FadeInDown} style={s.addItemBox}>
                        <TextInput
                            style={s.addItemInput}
                            placeholder="Task title..."
                            placeholderTextColor="#4b5563"
                            value={newItemText}
                            onChangeText={setNewItemText}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleAddItem}
                        />
                        <View style={s.addItemBtnRow}>
                            <Pressable onPress={() => { setAddingItem(false); setNewItemText(''); }} style={s.addItemCancel}>
                                <Text style={s.addItemCancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAddItem}
                                style={[s.addItemConfirm, !newItemText.trim() && s.addItemConfirmDisabled]}
                                disabled={!newItemText.trim()}
                            >
                                <Text style={s.addItemConfirmText}>Add</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                ) : (
                    <Pressable onPress={() => setAddingItem(true)} style={s.addItemTrigger}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.colors.accent} />
                        <Text style={s.addItemTriggerText}>Add custom item</Text>
                    </Pressable>
                )}

                {/* Add new phase to the same project */}
                {project && (
                    <Pressable
                        style={s.addPhaseBtn}
                        onPress={() => router.push({ pathname: '/questionnaire', params: { projectId: project.id } })}
                    >
                        <MaterialCommunityIcons name="layers-plus" size={18} color="#1d4ed8" />
                        <Text style={s.addPhaseBtnText}>Add Another Phase to {project.name}</Text>
                    </Pressable>
                )}
            </ScrollView>

            <PromptSheet visible={!!activePrompt} onClose={() => setActivePrompt(null)} prompt={activePrompt || ''} />

            {/* Note Edit Modal */}
            <Modal visible={!!editingNote} transparent animationType="fade" onRequestClose={() => setEditingNote(null)}>
                <View style={s.modalOverlay}>
                    <View style={s.modalCard}>
                        <Text style={s.modalTitle}>Edit Note</Text>
                        <TextInput
                            style={s.modalInput}
                            multiline
                            textAlignVertical="top"
                            placeholder="Add implementation details..."
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
                                <Text style={s.modalBtnText}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#07050f' },
    notFoundContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFoundText: { color: 'white' },
    goBackBtn: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    goBackBtnText: { color: 'white' },
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
    backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
    headerCenter: { flex: 1, paddingHorizontal: 12 },
    headerProject: { color: '#60a5fa', fontSize: 11, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.5, marginBottom: 2 },
    headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 15, textAlign: 'center', textTransform: 'capitalize' },
    headerSubtitle: { color: '#6b7280', fontSize: 11, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    githubBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8 },
    deleteListBtn: { padding: 6, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    addPhaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(29,78,216,0.35)', borderStyle: 'dashed' },
    addPhaseBtnText: { color: '#1d4ed8', fontWeight: '600', fontSize: 14 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    group: { marginBottom: 24 },
    groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 8 },
    groupDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    groupLabel: { color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, letterSpacing: 2 },
    itemsContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    itemRow: { padding: 16, flexDirection: 'row', alignItems: 'flex-start' },
    itemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    itemContent: { flex: 1, marginLeft: 12, paddingTop: 4 },
    itemTitle: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },
    itemTitleCompleted: { color: '#6b7280', textDecorationLine: 'line-through' },
    itemDesc: { color: '#6b7280', fontSize: 13, marginTop: 4 },
    chipsRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
    promptChip: { backgroundColor: 'rgba(29,78,216,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(29,78,216,0.2)', flexDirection: 'row', alignItems: 'center' },
    promptChipText: { color: '#60a5fa', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    noteChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
    noteChipActive: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' },
    noteChipInactive: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    noteChipText: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    notePreview: { marginTop: 6, backgroundColor: 'rgba(120,53,15,0.1)', padding: 8, borderRadius: 4, borderLeftWidth: 2, borderLeftColor: '#ca8a04' },
    notePreviewText: { color: '#9ca3af', fontSize: 12, fontStyle: 'italic' },
    // Add item
    addItemTrigger: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(29,78,216,0.3)', borderStyle: 'dashed', marginTop: 8 },
    addItemTriggerText: { color: '#1d4ed8', fontWeight: '600', fontSize: 15 },
    addItemBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(29,78,216,0.3)' },
    addItemInput: { color: 'white', fontSize: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
    addItemBtnRow: { flexDirection: 'row', gap: 12 },
    addItemCancel: { flex: 1, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, alignItems: 'center' },
    addItemCancelText: { color: '#9ca3af', fontWeight: '600' },
    addItemConfirm: { flex: 1, paddingVertical: 10, backgroundColor: '#1d4ed8', borderRadius: 8, alignItems: 'center' },
    addItemConfirmDisabled: { opacity: 0.4 },
    addItemConfirmText: { color: 'white', fontWeight: 'bold' },
    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalCard: { backgroundColor: '#1a1625', width: '100%', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', padding: 16, borderRadius: 12, minHeight: 120, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalBtnRow: { flexDirection: 'row', gap: 16 },
    modalCancelBtn: { flex: 1, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, alignItems: 'center' },
    modalSaveBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#1d4ed8', borderRadius: 12, alignItems: 'center' },
    modalBtnText: { color: 'white', fontWeight: 'bold' },
});
