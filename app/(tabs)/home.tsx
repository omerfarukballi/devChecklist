import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, TextInput, Modal, ScrollView, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChecklistStore } from '../../src/store/checklistStore';
import { useThemeStore } from '../../src/store/themeStore';
import { ChecklistCard } from '../../src/components/checklist/ChecklistCard';
import { theme } from '../../src/constants/theme';
import { PROJECT_TYPES } from '../../src/data/projectTypes';
import { Project } from '../../src/types';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ─── Settings Modal ──────────────────────────────────────────────────────────
function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { colorMode, toggleColorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={m.overlay} onPress={onClose} />
            <View style={m.sheet}>
                <View style={m.sheetHandle} />
                <Text style={m.title}>Settings</Text>

                {/* Dark / Light mode toggle */}
                <View style={m.settingRow}>
                    <View style={m.settingLeft}>
                        <MaterialCommunityIcons
                            name={isDark ? 'weather-night' : 'white-balance-sunny'}
                            size={22}
                            color={isDark ? '#3b82f6' : '#f59e0b'}
                        />
                        <Text style={m.settingLabel}>
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleColorMode}
                        trackColor={{ false: '#d1d5db', true: '#0078d4' }}
                        thumbColor={isDark ? '#3b82f6' : '#f3f4f6'}
                    />
                </View>

                <Pressable style={m.closeBtn} onPress={onClose}>
                    <Text style={m.closeBtnText}>Done</Text>
                </Pressable>
            </View>
        </Modal>
    );
}


// ─── Project Edit Modal ───────────────────────────────────────────────────────
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
                <View style={m.sheetHandle} />
                <Text style={m.title}>Edit Project</Text>

                <Text style={m.label}>Project Name</Text>
                <TextInput
                    style={m.input}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#6b7280"
                    placeholder="Project name"
                    autoCapitalize="words"
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
    const { checklists, projects, getProgress, deleteChecklist, deleteProject, cleanupDuplicates } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Run cleanup every time screen is focused — fixes any duplicated data immediately
    useFocusEffect(useCallback(() => {
        cleanupDuplicates();
    }, [cleanupDuplicates]));

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

    // Dynamic colors based on color mode
    const screenBg = isDark ? '#07050f' : '#f1f5f9';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
    const textPrimary = isDark ? '#ffffff' : '#0f172a';
    const textMuted = isDark ? '#9ca3af' : '#64748b';
    const textSecondary = isDark ? '#6b7280' : '#94a3b8';

    // Global set of rendered checklist ids — prevents duplicate React keys across all projects
    const renderedChecklistIds = new Set<string>();
    const safeRenderChecklist = (item: typeof checklists[0], projectId: string, index: number) => {
        const key = `${projectId}-${item.id}`;
        if (renderedChecklistIds.has(item.id)) return null; // skip true duplicate
        renderedChecklistIds.add(item.id);
        return (
            <ChecklistCard
                key={key}
                checklist={item}
                progress={getProgress(item.id)}
                index={index}
                onDelete={() => handleDeleteChecklist(item.id, item.title)}
            />
        );
    };

    return (
        <SafeAreaView style={[s.screen, { backgroundColor: screenBg }]} edges={['top'] as any}>
            <View style={[s.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }]}>
                <View>
                    <Text style={[s.headerLabel, { color: textMuted }]}>Total Progress</Text>

                    <View style={s.headerProgressRow}>
                        <Text style={[s.headerProgress, { color: textPrimary }]}>
                            {totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0}%
                        </Text>
                        <Text style={[s.headerProgressDone, { color: textMuted }]}>Done</Text>
                    </View>
                </View>

                {/* Settings button */}
                <Pressable
                    onPress={() => setSettingsVisible(true)}
                    style={[s.settingsBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialCommunityIcons name="cog-outline" size={22} color={textMuted} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={s.listContent}>
                {isEmpty && (
                    <Animated.View entering={FadeInDown.delay(200)} style={[s.emptyContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }]}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.text.muted} />
                        <Text style={[s.emptyTitle, { color: textPrimary }]}>No Projects Yet</Text>
                        <Text style={[s.emptyDesc, { color: textMuted }]}>Create your first project to start tracking your development progress.</Text>
                        <Pressable onPress={() => router.push('/questionnaire')} style={[s.createBtn, { backgroundColor: theme.colors.accent }]}>
                            <Text style={s.createBtnText}>Create Project</Text>
                        </Pressable>

                    </Animated.View>
                )}

                {projects.map((project) => {
                    const uniqueIds = [...new Set(project.checklistIds)];
                    const projectChecklists = uniqueIds
                        .map(id => checklists.find(c => c.id === id))
                        .filter(Boolean) as typeof checklists;
                    const projectDef = PROJECT_TYPES.find(p => p.id === project.projectType);
                    const color = projectDef?.color || theme.colors.accent;

                    return (
                        <View key={project.id} style={[s.projectCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                            {/* Accent indicator */}
                            <View style={[s.projectAccent, { backgroundColor: color }]} />

                            {/* Project Section Header */}
                            <View style={s.sectionHeader}>
                                <View style={s.sectionHeaderTop}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.sectionTitleText, { color: textPrimary }]}>{project.name}</Text>
                                        <View style={s.sectionHeaderMeta}>
                                            <Text style={[s.sectionSubtext, { color: textMuted }]}>
                                                {project.techStack && project.techStack.length > 0
                                                    ? project.techStack.slice(0, 3).map(t => t.toUpperCase()).join(' / ')
                                                    : projectDef?.label
                                                }{' • '}{Math.round(projectChecklists.reduce((acc, c) => acc + getProgress(c.id), 0) / (projectChecklists.length || 1))}% DONE
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={s.sectionActions}>
                                        <Pressable onPress={() => setEditProject(project)} style={s.actionIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <MaterialCommunityIcons name="pencil-outline" size={18} color={textMuted} />
                                        </Pressable>
                                        <Pressable onPress={() => handleDeleteProject(project)} style={s.actionIconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>

                            <View style={s.checklistsContainer}>
                                {/* Checklist cards for this project */}
                                {projectChecklists.map((item, index) =>
                                    safeRenderChecklist(item, project.id, index)
                                )}
                            </View>

                            {/* Add Phase Action */}
                            <Pressable
                                style={[s.addPhaseInline]}
                                onPress={() => router.push({ pathname: '/questionnaire', params: { projectId: project.id } })}
                            >
                                <MaterialCommunityIcons name="plus" size={18} color="#8b5cf6" />
                                <Text style={[s.addPhaseText, { color: '#8b5cf6' }]}>Add Phase</Text>
                            </Pressable>
                        </View>
                    );

                })}

                {/* Orphan checklists (not in any project — legacy data) */}
                {orphanChecklists.length > 0 && (
                    <View>
                        <Text style={[s.sectionTitle, { color: textPrimary }]}>Other Checklists</Text>
                        {orphanChecklists.map((item, index) =>
                            safeRenderChecklist(item, 'orphan', index)
                        )}
                    </View>
                )}
            </ScrollView>

            {!isEmpty && (
                <Animated.View entering={FadeInDown.delay(500)} style={s.fab}>
                    <Pressable onPress={() => router.push('/questionnaire')} style={[s.fabBtn, { backgroundColor: theme.colors.accent }]}>
                        <MaterialCommunityIcons name="plus" size={32} color="white" />
                    </Pressable>
                </Animated.View>

            )}

            <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

            <ProjectEditModal
                project={editProject}
                visible={!!editProject}
                onClose={() => setEditProject(null)}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0,
    },

    headerLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },

    headerProgressRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    headerProgress: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    headerProgressDone: { fontSize: 16, fontWeight: '600', marginLeft: 4 },

    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: { padding: 20, paddingBottom: 120 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
    // Project Cards (Grouped UI)
    projectCard: {
        marginBottom: 24,
        borderRadius: 24,
        borderWidth: 1.5,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    projectAccent: {
        position: 'absolute',
        left: 0,
        top: 24,
        bottom: 24,
        width: 4,
        borderRadius: 2,
    },
    sectionHeader: {
        marginBottom: 20,
        paddingLeft: 12,
    },
    sectionHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitleText: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    sectionHeaderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    sectionSubtext: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
    },

    sectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconBtn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    checklistsContainer: {
        gap: 2,
    },
    // Add Phase Inline
    addPhaseInline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        marginTop: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: 'rgba(139,92,246,0.45)',
        borderRadius: 20,
    },

    addPhaseText: {
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 1,
    },


    // Empty state
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
    emptyDesc: { textAlign: 'center', marginTop: 8, maxWidth: 220 },
    createBtn: { marginTop: 32, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    createBtnText: { color: 'white', fontWeight: 'bold' },
    // FAB
    fab: { position: 'absolute', bottom: 24, right: 24 },
    fabBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});



const m = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { backgroundColor: '#0f0d1a', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
    // Settings row
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
        marginBottom: 24,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { color: 'white', fontSize: 16, fontWeight: '500' },
    closeBtn: { backgroundColor: '#0078d4', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Edit project fields
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
    saveBtn: { backgroundColor: '#0078d4', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

