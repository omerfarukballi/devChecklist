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
import { useThemeStore } from '../../src/store/themeStore';
import { TECH_STACKS } from '../../src/data/techStack';
import { generateItemsForNewTech } from '../../src/engine/checklistEngine';
import { ProjectTypeId } from '../../src/types';
import { usePurchaseStore } from '../../src/store/purchaseStore';
import { PaywallModal } from '../../src/components/PaywallModal';
import { TutorialTooltip } from '../../src/components/ui/TutorialTooltip';

export default function ChecklistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getChecklist, toggleItem, updateItemNotes, getProgress, addCustomItem, deleteItem, deleteChecklist, getProjectForChecklist, addTechToChecklist } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const { isPremium } = usePurchaseStore();
    const isDark = colorMode === 'dark';

    const checklist = getChecklist(id);
    const progress = checklist ? getProgress(id) : 0;
    const project = checklist ? getProjectForChecklist(id) : undefined;

    const [activePrompt, setActivePrompt] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<{ itemId: string; text: string } | null>(null);
    const [addingItem, setAddingItem] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [showAddTech, setShowAddTech] = useState(false);
    const [selectedNewTechs, setSelectedNewTechs] = useState<string[]>([]);
    const [showPaywall, setShowPaywall] = useState(false);

    const projectDef = checklist ? PROJECT_TYPES.find(p => p.id === checklist.projectType) : null;
    const color = projectDef?.color || theme.colors.accent;

    // Dynamic theme colors
    const bg = isDark ? '#07050f' : '#f1f5f9';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#475569';
    const textMuted = isDark ? '#6b7280' : '#94a3b8';
    const headerBg = isDark ? '#07050f' : '#f1f5f9';
    const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
    const btnBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const modalCardBg = isDark ? '#1a1625' : '#ffffff';

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

    const handleAddTech = () => {
        if (!checklist || selectedNewTechs.length === 0) return;
        const existingTemplateIds = checklist.items.map(i => i.id.split('-').slice(0, -1).join('-'));
        const newItems = generateItemsForNewTech({
            projectType: checklist.projectType as ProjectTypeId,
            phase: checklist.phase as any,
            newTechIds: selectedNewTechs,
            existingItemTemplateIds: existingTemplateIds,
        });
        addTechToChecklist(checklist.id, selectedNewTechs, newItems);
        setSelectedNewTechs([]);
        setShowAddTech(false);
        Alert.alert('Done!', `Added ${newItems.length} new items for ${selectedNewTechs.join(', ')}.`);
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
            <SafeAreaView style={[s.screen, { backgroundColor: bg }]}>
                <View style={s.notFoundContainer}>
                    <Text style={[s.notFoundText, { color: textPrimary }]}>Checklist not found.</Text>
                    <Pressable onPress={() => router.back()} style={[s.goBackBtn, { backgroundColor: btnBg }]}>
                        <Text style={[s.goBackBtnText, { color: textPrimary }]}>Go Back</Text>
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
                    <Text style={[s.groupLabel, { color: textMuted }]}>{priority}</Text>
                </View>
                <View style={[s.itemsContainer, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    {items.map((item, index) => (
                        <SwipeableItem
                            key={item.id}
                            isCompleted={item.completed}
                            onComplete={() => toggleItem(checklist.id, item.id)}
                            onDelete={() => {
                                if (isPremium) {
                                    deleteItem(id, item.id);
                                } else {
                                    setShowPaywall(true);
                                }
                            }}
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
                                    <Text style={[
                                        s.itemTitle,
                                        { color: item.completed ? textMuted : textPrimary },
                                        item.completed && s.itemTitleCompleted
                                    ]}>
                                        {item.title}
                                    </Text>
                                    {item.description ? (
                                        <Text style={[s.itemDesc, { color: textMuted }]}>{item.description}</Text>
                                    ) : null}
                                    <View style={s.chipsRow}>
                                        {item.prompt ? (
                                            <Pressable onPress={() => setActivePrompt(item.prompt)} style={s.promptChip}>
                                                <MaterialCommunityIcons name="brain" size={14} color={theme.colors.accent} />
                                                <Text style={s.promptChipText}>AI PROMPT</Text>
                                            </Pressable>
                                        ) : null}
                                        <Pressable
                                            onPress={() => {
                                                if (isPremium) {
                                                    setEditingNote({ itemId: item.id, text: item.notes || '' });
                                                } else {
                                                    setShowPaywall(true);
                                                }
                                            }}
                                            style={[s.noteChip, item.notes ? s.noteChipActive : { backgroundColor: btnBg, borderColor: cardBorder }]}
                                        >
                                            <MaterialCommunityIcons
                                                name="note-text-outline"
                                                size={14}
                                                color={item.notes ? theme.colors.priority.medium : textMuted}
                                            />
                                            {item.notes ? <Text style={s.noteChipText}>NOTE</Text> : null}
                                        </Pressable>
                                    </View>
                                    {item.notes ? (
                                        <View style={s.notePreview}>
                                            <Text style={[s.notePreviewText, { color: textSecondary }]}>{item.notes}</Text>
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
        <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top'] as any}>
            {/* Header */}
            <View style={[s.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <Pressable onPress={() => router.back()} style={[s.backBtn, { backgroundColor: btnBg }]}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
                </Pressable>
                <View style={s.headerCenter}>
                    {project && (
                        <Text style={[s.headerProject, { color: color }]} numberOfLines={1}>
                            {project.name}
                        </Text>
                    )}
                    <Text style={[s.headerTitle, { color: textPrimary }]} numberOfLines={1}>{checklist.phase}</Text>
                    <Text style={[s.headerSubtitle, { color: textMuted }]}>{projectDef?.label}</Text>
                </View>
                <View style={s.headerRight}>
                    {project?.githubUrl ? (
                        <Pressable
                            onPress={() => Linking.openURL(project.githubUrl!)}
                            style={[s.githubBtn, { backgroundColor: btnBg }]}
                        >
                            <MaterialCommunityIcons name="github" size={20} color={textSecondary} />
                        </Pressable>
                    ) : null}
                    <ProgressRing
                        progress={progress}
                        size={36}
                        strokeWidth={3}
                        color={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}
                        activeColor={color}
                        showText={true}
                        textColor={isDark ? '#ffffff' : '#0f172a'}
                    />
                    <Pressable
                        onPress={() => {
                            if (isPremium) {
                                setSelectedNewTechs([]);
                                setShowAddTech(true);
                            } else {
                                setShowPaywall(true);
                            }
                        }}
                        style={[s.addTechBtn, { backgroundColor: btnBg }]}
                    >
                        <MaterialCommunityIcons name="plus-circle-outline" size={18} color={theme.colors.accent} />
                        <Text style={[s.addTechBtnText, { color: theme.colors.accent }]}>Tech</Text>
                        {!isPremium && <MaterialCommunityIcons name="crown" size={10} color="#f59e0b" style={{ marginLeft: 2 }} />}
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            if (isPremium) {
                                handleDeleteChecklist();
                            } else {
                                setShowPaywall(true);
                            }
                        }}
                        style={s.deleteListBtn}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent}>
                {renderItemGroup('critical', groupedItems.critical)}
                {renderItemGroup('high', groupedItems.high)}
                {renderItemGroup('medium', groupedItems.medium)}
                {renderItemGroup('low', groupedItems.low)}

                {/* Add Item Button */}
                {addingItem ? (
                    <Animated.View entering={FadeInDown} style={[s.addItemBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <TextInput
                            style={[s.addItemInput, { color: textPrimary, borderBottomColor: borderColor }]}
                            placeholder="Task title..."
                            placeholderTextColor={textMuted}
                            value={newItemText}
                            onChangeText={setNewItemText}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleAddItem}
                        />
                        <View style={s.addItemBtnRow}>
                            <Pressable onPress={() => { setAddingItem(false); setNewItemText(''); }} style={[s.addItemCancel, { backgroundColor: btnBg }]}>
                                <Text style={[s.addItemCancelText, { color: textSecondary }]}>Cancel</Text>
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
                    <Pressable
                        onPress={() => {
                            if (isPremium) {
                                setAddingItem(true);
                            } else {
                                setShowPaywall(true);
                            }
                        }}
                        style={[s.addItemTrigger, { borderColor: 'rgba(29,78,216,0.35)' }]}
                    >
                        <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.colors.accent} />
                        <Text style={s.addItemTriggerText}>Add custom item</Text>
                        {!isPremium && <MaterialCommunityIcons name="crown" size={14} color="#f59e0b" style={{ marginLeft: 4 }} />}
                    </Pressable>
                )}

                {project && (
                    <Pressable
                        style={[s.addPhaseBtn, { borderColor: 'rgba(139,92,246,0.4)' }]}
                        onPress={() => router.push({ pathname: '/questionnaire', params: { projectId: project.id } })}
                    >
                        <MaterialCommunityIcons name="layers-plus" size={18} color="#8b5cf6" />
                        <Text style={[s.addPhaseBtnText, { color: '#8b5cf6' }]}>Add Another Phase to {project.name}</Text>
                    </Pressable>
                )}
            </ScrollView>

            <PromptSheet visible={!!activePrompt} onClose={() => setActivePrompt(null)} prompt={activePrompt || ''} />

            <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />

            {/* Note Edit Modal */}
            <Modal visible={!!editingNote} transparent animationType="fade" onRequestClose={() => setEditingNote(null)}>
                <View style={s.modalOverlay}>
                    <View style={[s.modalCard, { backgroundColor: modalCardBg, borderColor: cardBorder }]}>
                        <Text style={[s.modalTitle, { color: textPrimary }]}>Edit Note</Text>
                        <TextInput
                            style={[s.modalInput, { backgroundColor: inputBg, color: textPrimary, borderColor: inputBorder }]}
                            multiline
                            textAlignVertical="top"
                            placeholder="Add implementation details..."
                            placeholderTextColor={textMuted}
                            value={editingNote?.text}
                            onChangeText={(text) => setEditingNote(prev => prev ? { ...prev, text } : null)}
                            autoFocus
                        />
                        <View style={s.modalBtnRow}>
                            <Pressable onPress={() => setEditingNote(null)} style={[s.modalCancelBtn, { backgroundColor: btnBg }]}>
                                <Text style={[s.modalBtnText, { color: textSecondary }]}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    if (editingNote) updateItemNotes(checklist.id, editingNote.itemId, editingNote.text);
                                    setEditingNote(null);
                                }}
                                style={s.modalSaveBtn}
                            >
                                <Text style={[s.modalBtnText, { color: 'white' }]}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Tech Modal */}
            <Modal visible={showAddTech} transparent animationType="slide" onRequestClose={() => setShowAddTech(false)}>
                <View style={s.modalOverlay}>
                    <View style={[s.modalCard, { backgroundColor: modalCardBg, borderColor: cardBorder }]}>
                        <Text style={[s.modalTitle, { color: textPrimary }]}>Add Technology</Text>
                        <Text style={[s.modalSubtitle, { color: textSecondary }]}>Select techs to add stack-specific checklist items</Text>
                        <ScrollView style={s.addTechModalScroll} showsVerticalScrollIndicator={false}>
                            <View style={s.techChipGrid}>
                                {(TECH_STACKS[checklist.projectType as ProjectTypeId] ?? []).map(tech => {
                                    const alreadyIn = checklist.techStack.includes(tech.id);
                                    const isSelected = selectedNewTechs.includes(tech.id);
                                    return (
                                        <Pressable
                                            key={tech.id}
                                            disabled={alreadyIn}
                                            onPress={() => setSelectedNewTechs(prev =>
                                                prev.includes(tech.id)
                                                    ? prev.filter(t => t !== tech.id)
                                                    : [...prev, tech.id]
                                            )}
                                            style={[
                                                s.techChip,
                                                isSelected && s.techChipSelected,
                                                alreadyIn && { opacity: 0.35 },
                                                { borderColor: isSelected ? theme.colors.accent : cardBorder, backgroundColor: isSelected ? 'rgba(29,78,216,0.12)' : cardBg }
                                            ]}
                                        >
                                            <Text style={[s.techChipText, { color: isSelected ? theme.colors.accent : textSecondary }]}>
                                                {alreadyIn ? '✓ ' : ''}{tech.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </ScrollView>
                        <View style={[s.modalBtnRow, { marginTop: 20 }]}>
                            <Pressable onPress={() => setShowAddTech(false)} style={[s.modalCancelBtn, { backgroundColor: btnBg }]}>
                                <Text style={[s.modalBtnText, { color: textSecondary }]}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleAddTech}
                                disabled={selectedNewTechs.length === 0}
                                style={[s.modalSaveBtn, selectedNewTechs.length === 0 && { opacity: 0.4 }]}
                            >
                                <Text style={[s.modalBtnText, { color: 'white' }]}>Add {selectedNewTechs.length > 0 ? `(${selectedNewTechs.length})` : ''}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <TutorialTooltip
                id="checklist-gestures"
                title="Master Gestures ⚡"
                description="Swipe RIGHT to mark as completed. Swipe LEFT to delete or edit. Long press for deeper details."
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1 },
    notFoundContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFoundText: { fontSize: 16, marginBottom: 16 },
    goBackBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    goBackBtnText: { fontWeight: '600' },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        zIndex: 10,
    },
    backBtn: { padding: 8, borderRadius: 20 },
    headerCenter: { flex: 1, paddingHorizontal: 12 },
    headerProject: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.5, marginBottom: 2 },
    headerTitle: { fontWeight: 'bold', fontSize: 15, textAlign: 'center', textTransform: 'capitalize' },
    headerSubtitle: { fontSize: 11, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    githubBtn: { padding: 6, borderRadius: 8 },
    deleteListBtn: { padding: 6, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    addPhaseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed' },
    addPhaseBtnText: { fontWeight: '600', fontSize: 14 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    group: { marginBottom: 24 },
    groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 8 },
    groupDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    groupLabel: { fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12, letterSpacing: 2 },
    itemsContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
    itemRow: { padding: 16, flexDirection: 'row', alignItems: 'flex-start' },
    itemContent: { flex: 1, marginLeft: 12, paddingTop: 4 },
    itemTitle: { fontSize: 15, fontWeight: '600' },
    itemTitleCompleted: { textDecorationLine: 'line-through' },
    itemDesc: { fontSize: 13, marginTop: 4 },
    chipsRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
    promptChip: { backgroundColor: 'rgba(29,78,216,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(29,78,216,0.2)', flexDirection: 'row', alignItems: 'center' },
    promptChipText: { color: '#60a5fa', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    noteChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
    noteChipActive: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' },
    noteChipText: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    notePreview: { marginTop: 6, backgroundColor: 'rgba(120,53,15,0.1)', padding: 8, borderRadius: 4, borderLeftWidth: 2, borderLeftColor: '#ca8a04' },
    notePreviewText: { fontSize: 12, fontStyle: 'italic' },
    addItemTrigger: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', marginTop: 8 },
    addItemTriggerText: { color: '#1d4ed8', fontWeight: '600', fontSize: 15 },
    addItemBox: { borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1 },
    addItemInput: { fontSize: 16, paddingVertical: 8, borderBottomWidth: 1, marginBottom: 16 },
    addItemBtnRow: { flexDirection: 'row', gap: 12 },
    addItemCancel: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    addItemCancelText: { fontWeight: '600' },
    addItemConfirm: { flex: 1, paddingVertical: 10, backgroundColor: '#1d4ed8', borderRadius: 8, alignItems: 'center' },
    addItemConfirmDisabled: { opacity: 0.4 },
    addItemConfirmText: { color: 'white', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalCard: { width: '100%', borderRadius: 16, padding: 24, borderWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    modalInput: { padding: 16, borderRadius: 12, minHeight: 120, marginBottom: 24, borderWidth: 1 },
    modalBtnRow: { flexDirection: 'row', gap: 16 },
    modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    modalSaveBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#1d4ed8', borderRadius: 12, alignItems: 'center' },
    modalBtnText: { fontWeight: 'bold' },
    addTechBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    addTechBtnText: { fontSize: 12, fontWeight: '700' },
    addTechModalScroll: { maxHeight: 260, marginTop: 12 },
    techChipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    techChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
    techChipSelected: {},
    techChipText: { fontSize: 13, fontWeight: '600' },
    modalSubtitle: { fontSize: 13, marginTop: -8, marginBottom: 4 },
});
