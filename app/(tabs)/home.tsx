import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, TextInput, Modal, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChecklistStore } from '../../src/store/checklistStore';
import { ChecklistCard } from '../../src/components/checklist/ChecklistCard';
import { theme } from '../../src/constants/theme';
import { PROJECT_TYPES } from '../../src/data/projectTypes';
import { Project } from '../../src/types';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Modal for editing project info (name + github url)
function ProjectEditModal({
    project,
    visible,
    onClose,
}: {
    project: Project | null;
    visible: boolean;
    onClose: () => void;
}) {
    const { updateProject } = useChecklistStore();
    const [name, setName] = useState('');
    const [github, setGithub] = useState('');

    React.useEffect(() => {
        if (project) {
            setName(project.name);
            setGithub(project.githubUrl ?? '');
        }
    }, [project]);

    const handleSave = () => {
        if (project) {
            updateProject(project.id, { name: name.trim() || project.name, githubUrl: github.trim() || undefined });
        }
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={m.overlay} onPress={onClose} />
            <View style={m.sheet}>
                <Text style={m.title}>Edit Project</Text>

                <Text style={m.label}>Project Name</Text>
                <TextInput
                    style={m.input}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#6b7280"
                    placeholder="Project name"
                />

                <Text style={m.label}>GitHub URL</Text>
                <View style={m.inputRow}>
                    <MaterialCommunityIcons name="github" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                    <TextInput
                        style={m.inputInline}
                        value={github}
                        onChangeText={setGithub}
                        placeholderTextColor="#6b7280"
                        placeholder="https://github.com/user/repo"
                        autoCapitalize="none"
                        keyboardType="url"
                    />
                </View>

                <Pressable style={m.saveBtn} onPress={handleSave}>
                    <Text style={m.saveBtnText}>Save</Text>
                </Pressable>
            </View>
        </Modal>
    );
}

export default function HomeScreen() {
    const { checklists, projects, getProgress, deleteChecklist, deleteProject } = useChecklistStore();
    const [editProject, setEditProject] = useState<Project | null>(null);

    useFocusEffect(useCallback(() => {}, []));

    const totalCompleted = checklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
    const totalItems = checklists.reduce((acc, c) => acc + c.items.length, 0);

    const handleDeleteChecklist = (id: string, title: string) => {
        Alert.alert('Delete Checklist', `Delete "${title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteChecklist(id) },
        ]);
    };

    const handleDeleteProject = (project: Project) => {
        const count = project.checklistIds.length;
        Alert.alert(
            'Delete Project',
            `Delete "${project.name}" and all ${count} checklist${count !== 1 ? 's' : ''}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteProject(project.id) },
            ]
        );
    };

    // Checklists not belonging to any project
    const orphanChecklists = checklists.filter(
        c => !projects.some(p => p.checklistIds.includes(c.id))
    );

    const isEmpty = projects.length === 0 && orphanChecklists.length === 0;

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
            </View>

            <ScrollView contentContainerStyle={s.listContent}>
                {isEmpty && (
                    <Animated.View entering={FadeInDown.delay(200)} style={s.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.text.muted} />
                        <Text style={s.emptyTitle}>No Projects Yet</Text>
                        <Text style={s.emptyDesc}>Create your first project to start tracking your development progress.</Text>
                        <Pressable onPress={() => router.push('/questionnaire')} style={s.createBtn}>
                            <Text style={s.createBtnText}>Create Project</Text>
                        </Pressable>
                    </Animated.View>
                )}

                {projects.map((project) => {
                    const projectChecklists = project.checklistIds
                        .map(id => checklists.find(c => c.id === id))
                        .filter(Boolean) as typeof checklists;
                    const projectDef = PROJECT_TYPES.find(p => p.id === project.projectType);
                    const color = projectDef?.color || theme.colors.accent;

                    const totalProjectItems = projectChecklists.reduce((a, c) => a + c.items.length, 0);
                    const completedProjectItems = projectChecklists.reduce((a, c) => a + c.items.filter(i => i.completed).length, 0);
                    const projectPct = totalProjectItems > 0 ? Math.round((completedProjectItems / totalProjectItems) * 100) : 0;

                    return (
                        <View key={project.id} style={s.projectCard}>
                            {/* Project header */}
                            <View style={s.projectHeader}>
                                <View style={[s.projectColorBar, { backgroundColor: color }]} />
                                <View style={s.projectHeaderContent}>
                                    <Text style={s.projectName} numberOfLines={1}>{project.name}</Text>
                                    <Text style={s.projectMeta}>{projectDef?.label} • {projectPct}% done</Text>
                                </View>
                                <View style={s.projectHeaderActions}>
                                    {project.githubUrl ? (
                                        <Pressable
                                            onPress={() => Linking.openURL(project.githubUrl!)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            style={s.iconBtn}
                                        >
                                            <MaterialCommunityIcons name="github" size={18} color="#9ca3af" />
                                        </Pressable>
                                    ) : null}
                                    <Pressable
                                        onPress={() => setEditProject(project)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        style={s.iconBtn}
                                    >
                                        <MaterialCommunityIcons name="pencil-outline" size={18} color="#9ca3af" />
                                    </Pressable>
                                    <Pressable
                                        onPress={() => handleDeleteProject(project)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        style={s.iconBtn}
                                    >
                                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Checklists in project */}
                            {projectChecklists.map((item, index) => (
                                <ChecklistCard
                                    key={item.id}
                                    checklist={item}
                                    progress={getProgress(item.id)}
                                    index={index}
                                    onDelete={() => handleDeleteChecklist(item.id, item.title)}
                                />
                            ))}

                            {/* Add phase button */}
                            <Pressable
                                style={s.addPhaseBtn}
                                onPress={() => router.push({ pathname: '/questionnaire', params: { projectId: project.id } })}
                            >
                                <MaterialCommunityIcons name="plus" size={16} color="#7c3aed" />
                                <Text style={s.addPhaseBtnText}>Add Phase</Text>
                            </Pressable>
                        </View>
                    );
                })}

                {/* Orphan checklists (not in any project — legacy data) */}
                {orphanChecklists.length > 0 && (
                    <View>
                        <Text style={s.sectionTitle}>Other Checklists</Text>
                        {orphanChecklists.map((item, index) => (
                            <ChecklistCard
                                key={item.id}
                                checklist={item}
                                progress={getProgress(item.id)}
                                index={index}
                                onDelete={() => handleDeleteChecklist(item.id, item.title)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {!isEmpty && (
                <Animated.View entering={FadeInDown.delay(500)} style={s.fab}>
                    <Pressable onPress={() => router.push('/questionnaire')} style={s.fabBtn}>
                        <MaterialCommunityIcons name="plus" size={32} color="white" />
                    </Pressable>
                </Animated.View>
            )}

            <ProjectEditModal
                project={editProject}
                visible={!!editProject}
                onClose={() => setEditProject(null)}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#07050f' },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLabel: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    headerProgress: { color: 'white', fontSize: 30, fontWeight: 'bold' },
    headerProgressSuffix: { fontSize: 18, color: '#6b7280', fontWeight: 'normal' },
    listContent: { padding: 24, paddingBottom: 120 },
    sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
    // Project card
    projectCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
    },
    projectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        paddingVertical: 14,
    },
    projectColorBar: { width: 4, height: '100%', minHeight: 48, marginRight: 14 },
    projectHeaderContent: { flex: 1 },
    projectName: { color: 'white', fontSize: 17, fontWeight: 'bold', marginBottom: 2 },
    projectMeta: { color: '#6b7280', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    projectHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconBtn: { padding: 6 },
    // Checklist cards inside project (add inner padding)
    addPhaseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(124,58,237,0.4)',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    addPhaseBtnText: { color: '#7c3aed', fontWeight: '600', fontSize: 14 },
    // Empty state
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed' },
    emptyTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
    emptyDesc: { color: '#6b7280', textAlign: 'center', marginTop: 8, maxWidth: 220 },
    createBtn: { marginTop: 32, backgroundColor: '#7c3aed', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    createBtnText: { color: 'white', fontWeight: 'bold' },
    // FAB
    fab: { position: 'absolute', bottom: 24, right: 24 },
    fabBtn: { backgroundColor: '#7c3aed', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});

const m = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { backgroundColor: '#0f0d1a', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
    label: { color: '#9ca3af', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        color: 'white',
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 32,
    },
    inputInline: { flex: 1, color: 'white', fontSize: 14, paddingVertical: 14 },
    saveBtn: { backgroundColor: '#7c3aed', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
