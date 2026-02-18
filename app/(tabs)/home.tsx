import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, TextInput, Modal, ScrollView, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChecklistStore } from '../../src/store/checklistStore';
import { useThemeStore } from '../../src/store/themeStore';
import { TutorialTooltip } from '../../src/components/ui/TutorialTooltip';
import { useTutorialStore } from '../../src/store/useTutorialStore';
import { ChecklistCard } from '../../src/components/checklist/ChecklistCard';
import { theme } from '../../src/constants/theme';
import { PROJECT_TYPES } from '../../src/data/projectTypes';
import { Project } from '../../src/types';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePurchaseStore } from '../../src/store/purchaseStore';
import { PaywallModal } from '../../src/components/PaywallModal';
import { ProjectTimeline } from '../../src/components/ui/ProjectTimeline';
import { RiskRadarCard } from '../../src/components/ui/RiskRadarCard';
import { useRiskRadar } from '../../src/hooks/useRiskRadar';
import { StandupGenerator } from '../../src/components/ui/StandupGenerator';
import { useAchievementChecker } from '../../src/hooks/useAchievementChecker';
import { useAchievementStore } from '../../src/store/achievementStore';

// Phase ordering mirrors ProjectTimeline
const PHASE_ORDER = ['planning', 'coding', 'testing', 'deployment', 'scaling'];
const PHASE_LABELS: Record<string, string> = {
    planning: 'Planning',
    coding: 'Building',
    testing: 'Testing',
    deployment: 'Deployment',
    scaling: 'Scaling',
};
const PHASE_ICONS: Record<string, string> = {
    planning: 'clipboard-text-outline',
    coding: 'code-braces',
    testing: 'bug-outline',
    deployment: 'rocket-launch-outline',
    scaling: 'chart-line',
};


function ProjectEditModal({
    project,
    visible,
    onClose,
}: {
    project: Project | null;
    visible: boolean;
    onClose: () => void;
}) {
    const { updateProject, saveTemplate } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
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

    const handleSaveTemplate = () => {
        if (!project) return;
        Alert.alert(
            'Save as Template',
            `Save "${project.name}" as a template? This will save the structure and uncompleted items.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: () => {
                        saveTemplate(project, name.trim() || project.name);
                        Alert.alert('Success', 'Template saved!');
                    }
                }
            ]
        );
    };

    const sheetBg = isDark ? '#0f0d1a' : '#ffffff';
    const textColor = isDark ? 'white' : '#0f172a';
    const handleColor = isDark ? '#374151' : '#e2e8f0';
    const labelColor = isDark ? '#9ca3af' : '#64748b';
    const inputBg = isDark ? 'rgba(255,255,255,0.07)' : '#f8fafc';
    const inputBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
    const placeholderColor = isDark ? '#6b7280' : '#94a3b8';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={m.overlay} onPress={onClose} />
            <View style={[m.sheet, { backgroundColor: sheetBg }]}>
                <View style={[m.sheetHandle, { backgroundColor: handleColor }]} />
                <Text style={[m.title, { color: textColor }]}>Edit Project</Text>

                <Text style={[m.label, { color: labelColor }]}>Project Name</Text>
                <TextInput
                    style={[m.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={placeholderColor}
                    placeholder="Project name"
                />

                <Text style={[m.label, { color: labelColor }]}>GitHub URL</Text>
                <View style={[m.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                    <MaterialCommunityIcons name="github" size={18} color={labelColor} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[m.inputInline, { color: textColor }]}
                        value={github}
                        onChangeText={setGithub}
                        placeholderTextColor={placeholderColor}
                        placeholder="https://github.com/user/repo"
                        autoCapitalize="none"
                        keyboardType="url"
                    />
                </View>

                <Pressable style={[m.saveBtn, { marginBottom: 12 }]} onPress={handleSave}>
                    <Text style={m.saveBtnText}>Save Changes</Text>
                </Pressable>

                <Pressable
                    style={[m.saveBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#f1f5f9' }]}
                    onPress={handleSaveTemplate}
                >
                    <Text style={[m.saveBtnText, { color: textColor }]}>Save as Template</Text>
                </Pressable>
            </View>
        </Modal>
    );
}

// Separate component so useRiskRadar hook is called at the top level (React rules of hooks)
function ProjectSectionWithRisk({
    checklists,
    getProgress,
    color,
    projectName,
}: {
    checklists: import('../../src/types').GeneratedChecklist[];
    getProgress: (id: string) => number;
    color: string;
    projectName: string;
}) {
    const riskReport = useRiskRadar(checklists);
    return (
        <>
            {checklists.length > 1 && (
                <ProjectTimeline checklists={checklists} getProgress={getProgress} color={color} />
            )}
            <RiskRadarCard report={riskReport} />
            <StandupGenerator checklists={checklists} projectName={projectName} />
        </>
    );
}

export default function HomeScreen() {
    const { checklists, projects, getProgress, deleteChecklist, deleteProject, cleanupDuplicates, archiveProject, unarchiveProject, updateProjectNotes } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const { isPremium } = usePurchaseStore();
    const isDark = colorMode === 'dark';
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [notesProject, setNotesProject] = useState<Project | null>(null);
    const [notesText, setNotesText] = useState('');

    // Achievement system
    useAchievementChecker();
    const { getUnlocked } = useAchievementStore();
    const unlockedCount = getUnlocked().length;

    const handleNewProject = () => {
        if (!isPremium && projects.filter(p => !p.archived).length >= 1) {
            setPaywallVisible(true);
        } else {
            router.push('/questionnaire');
        }
    };

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

    const handleArchiveProject = (project: Project) => {
        Alert.alert('Archive Project', `Archive "${project.name}"? You can restore it later.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Archive', onPress: () => archiveProject(project.id) },
        ]);
    };

    const handleOpenNotes = (project: Project) => {
        setNotesProject(project);
        setNotesText(project.notes ?? '');
    };

    const handleSaveNotes = () => {
        if (notesProject) {
            updateProjectNotes(notesProject.id, notesText);
        }
        setNotesProject(null);
    };

    // Split active vs archived projects
    const activeProjects = projects.filter(p => !p.archived);
    const archivedProjects = projects.filter(p => p.archived);
    const visibleProjects = showArchived ? archivedProjects : activeProjects;

    // Checklists not belonging to any project
    const orphanChecklists = checklists.filter(
        c => !projects.some(p => p.checklistIds.includes(c.id))
    );

    const isEmpty = activeProjects.length === 0 && orphanChecklists.length === 0;

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
                    <Text style={[s.headerProgress, { color: textPrimary }]}>
                        {totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0}%{' '}
                        <Text style={[s.headerProgressSuffix, { color: textSecondary }]}>Done</Text>
                    </Text>
                </View>
                {/* Header actions */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable
                        onPress={() => router.push('/achievements')}
                        style={[s.settingsBtn, { backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.1)' }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons name="trophy-outline" size={20} color="#f59e0b" />
                        {unlockedCount > 0 && (
                            <View style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 9, fontWeight: '900' }}>{unlockedCount}</Text>
                            </View>
                        )}
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/growth')}
                        style={[s.settingsBtn, { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)' }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons name="chart-line" size={20} color="#10b981" />
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/settings')}
                        style={[s.settingsBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons name="cog-outline" size={22} color={textMuted} />
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={s.listContent}>
                {isEmpty && (
                    <Animated.View entering={FadeInDown.delay(200)} style={[s.emptyContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }]}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.text.muted} />
                        <Text style={[s.emptyTitle, { color: textPrimary }]}>No Projects Yet</Text>
                        <Text style={[s.emptyDesc, { color: textMuted }]}>Create your first project to start tracking your development progress.</Text>
                        <Pressable onPress={handleNewProject} style={s.createBtn}>
                            <Text style={s.createBtnText}>Create Project</Text>
                        </Pressable>
                    </Animated.View>
                )}

                {/* Archive toggle row */}
                {archivedProjects.length > 0 && (
                    <Pressable
                        onPress={() => setShowArchived(v => !v)}
                        style={[s.archiveToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }]}
                    >
                        <MaterialCommunityIcons name={showArchived ? 'archive-arrow-up-outline' : 'archive-outline'} size={16} color={textMuted} />
                        <Text style={[s.archiveToggleText, { color: textMuted }]}>
                            {showArchived ? `← Back to Active Projects` : `🗄️ Archived Projects (${archivedProjects.length})`}
                        </Text>
                    </Pressable>
                )}

                {visibleProjects.map((project) => {
                    const uniqueIds = [...new Set(project.checklistIds)];
                    const projectChecklists = uniqueIds
                        .map(id => checklists.find(c => c.id === id))
                        .filter(Boolean) as typeof checklists;
                    const projectDef = PROJECT_TYPES.find(p => p.id === project.projectType);
                    const color = projectDef?.color || theme.colors.accent;

                    return (
                        <View key={project.id} style={s.projectSection}>
                            {/* Project Section Header */}
                            <View style={s.sectionHeader}>
                                {/* Row 1: Icon + Title */}
                                <View style={s.sectionHeaderTop}>
                                    <View style={[s.sectionIndicator, { backgroundColor: color }]} />
                                    {projectDef?.icon && (
                                        <View style={[s.sectionIconWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                            <MaterialCommunityIcons name={projectDef.icon} size={24} color={color} />
                                        </View>
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.sectionTitleText, { color: textPrimary }]} numberOfLines={1}>{project.name}</Text>
                                        <Text style={[s.sectionSubtext, { color: textMuted }]}>{projectDef?.label}</Text>
                                    </View>
                                    {/* Primary: Focus button only */}
                                    {!project.archived && (
                                        <Pressable
                                            onPress={() => router.push({ pathname: '/focus', params: { projectId: project.id } })}
                                            style={[s.focusBtn, { backgroundColor: color + '22' }]}
                                        >
                                            <MaterialCommunityIcons name="target" size={18} color={color} />
                                            <Text style={[s.focusBtnText, { color }]}>Focus</Text>
                                        </Pressable>
                                    )}
                                </View>

                                {/* Row 2: Secondary Actions Toolbar */}
                                <View style={s.sectionActions}>
                                    {!project.archived && (
                                        <Pressable
                                            onPress={() => router.push({ pathname: '/share-card', params: { projectId: project.id } })}
                                            style={s.actionBtn}
                                        >
                                            <MaterialCommunityIcons name="share-variant-outline" size={18} color={textMuted} />
                                        </Pressable>
                                    )}
                                    {project.githubUrl && (
                                        <Pressable onPress={() => Linking.openURL(project.githubUrl!)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="github" size={18} color={textMuted} />
                                        </Pressable>
                                    )}
                                    <Pressable onPress={() => handleOpenNotes(project)} style={s.actionBtn}>
                                        <MaterialCommunityIcons
                                            name={project.notes ? 'note-text' : 'note-text-outline'}
                                            size={18}
                                            color={project.notes ? '#84cc16' : textMuted}
                                        />
                                    </Pressable>
                                    {!project.archived ? (
                                        <Pressable onPress={() => handleArchiveProject(project)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="archive-outline" size={18} color={textMuted} />
                                        </Pressable>
                                    ) : (
                                        <Pressable onPress={() => unarchiveProject(project.id)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="archive-arrow-up-outline" size={18} color='#10b981' />
                                        </Pressable>
                                    )}
                                    <Pressable onPress={() => setEditProject(project)} style={s.actionBtn}>
                                        <MaterialCommunityIcons name="pencil-outline" size={18} color={textMuted} />
                                    </Pressable>
                                    <Pressable onPress={() => handleDeleteProject(project)} style={s.actionBtn}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.colors.priority.critical} />
                                    </Pressable>
                                </View>
                            </View>

                            {/* Notes preview */}
                            {project.notes ? (
                                <Pressable onPress={() => handleOpenNotes(project)} style={[s.notesPreview, { backgroundColor: isDark ? 'rgba(132,204,22,0.08)' : 'rgba(132,204,22,0.07)', borderColor: isDark ? 'rgba(132,204,22,0.2)' : 'rgba(132,204,22,0.25)' }]}>
                                    <MaterialCommunityIcons name="note-text" size={13} color="#84cc16" />
                                    <Text style={s.notesPreviewText} numberOfLines={2}>{project.notes}</Text>
                                </Pressable>
                            ) : null}

                            {/* Timeline + Risk Radar + Standup — only for active projects */}
                            {!project.archived && (
                                <ProjectSectionWithRisk
                                    checklists={projectChecklists}
                                    getProgress={getProgress}
                                    color={color}
                                    projectName={project.name}
                                />
                            )}

                            {/* Checklist cards — active phase only */}
                            {(() => {
                                // Determine the active phase: first phase with incomplete items.
                                // Falls back to the last phase with any checklists if all are complete.
                                const phaseGroups = PHASE_ORDER.map(ph => ({
                                    phase: ph,
                                    lists: projectChecklists.filter(c => c.phase === ph),
                                })).filter(g => g.lists.length > 0);

                                // Active = first group that has any incomplete item
                                const activeGroup = phaseGroups.find(g =>
                                    g.lists.some(c => c.items.some(i => !i.completed))
                                ) ?? phaseGroups[phaseGroups.length - 1];

                                // Next upcoming phase (no checklists yet)
                                const activePhaseIndex = PHASE_ORDER.indexOf(activeGroup?.phase ?? '');
                                const nextPhaseName = PHASE_ORDER[activePhaseIndex + 1];
                                const nextPhaseHasChecklists = nextPhaseName
                                    ? projectChecklists.some(c => c.phase === nextPhaseName)
                                    : false;

                                return (
                                    <>
                                        {/* Current phase checklists */}
                                        {activeGroup?.lists.map((item, index) =>
                                            safeRenderChecklist(item, project.id, index)
                                        )}

                                        {/* Next phase teaser — only when there is a next phase with no checklists yet */}
                                        {nextPhaseName && !nextPhaseHasChecklists && (
                                            <Pressable
                                                onPress={() => router.push({ pathname: '/questionnaire', params: { projectId: project.id } })}
                                                style={[s.nextPhaseCard, {
                                                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                }]}
                                            >
                                                <View style={[s.nextPhaseIcon, { backgroundColor: color + '15' }]}>
                                                    <MaterialCommunityIcons
                                                        name={PHASE_ICONS[nextPhaseName] as any ?? 'lock-outline'}
                                                        size={20}
                                                        color={color}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[s.nextPhaseLabel, { color: textMuted }]}>NEXT PHASE</Text>
                                                    <Text style={[s.nextPhaseTitle, { color: textPrimary }]}>
                                                        {PHASE_LABELS[nextPhaseName] ?? nextPhaseName}
                                                    </Text>
                                                </View>
                                                <View style={[s.nextPhaseBtn, { backgroundColor: color + '22' }]}>
                                                    <MaterialCommunityIcons name="plus" size={16} color={color} />
                                                    <Text style={[s.nextPhaseBtnText, { color }]}>Start</Text>
                                                </View>
                                            </Pressable>
                                        )}
                                    </>
                                );
                            })()}

                            {/* Add Phase Action — only for active projects */}
                            {!project.archived && (
                                <Pressable
                                    style={[s.addPhaseInline, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
                                    onPress={() => router.push({ pathname: '/questionnaire', params: { projectId: project.id } })}
                                >
                                    <View style={s.addPhaseCircle}>
                                        <MaterialCommunityIcons name="plus" size={20} color={theme.colors.accent} />
                                    </View>
                                    <Text style={s.addPhaseText}>Add New Phase</Text>
                                </Pressable>
                            )}
                        </View>
                    );
                })}

                {/* Orphan checklists (not in any project — legacy data) */}
                {!showArchived && orphanChecklists.length > 0 && (
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
                    <Pressable onPress={handleNewProject} style={s.fabBtn}>
                        <MaterialCommunityIcons name="plus" size={32} color="white" />
                    </Pressable>
                </Animated.View>
            )}

            <ProjectEditModal
                project={editProject}
                visible={!!editProject}
                onClose={() => setEditProject(null)}
            />

            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
            />

            {/* Project Notes Modal */}
            <Modal visible={!!notesProject} transparent animationType="slide" onRequestClose={handleSaveNotes}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={handleSaveNotes} />
                <View style={[s.notesModal, { backgroundColor: isDark ? '#0f0d1a' : '#ffffff' }]}>
                    <View style={s.notesModalHandle} />
                    <View style={s.notesModalHeader}>
                        <MaterialCommunityIcons name="note-text" size={20} color="#84cc16" />
                        <Text style={[s.notesModalTitle, { color: textPrimary }]}>Project Notes</Text>
                        <Text style={[s.notesModalSub, { color: textMuted }]}>{notesProject?.name}</Text>
                    </View>
                    <TextInput
                        style={[s.notesInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textPrimary }]}
                        placeholder="Write your project notes, decisions, ideas..."
                        placeholderTextColor={textMuted}
                        value={notesText}
                        onChangeText={setNotesText}
                        multiline
                        autoFocus
                    />
                    <Pressable style={s.notesSaveBtn} onPress={handleSaveNotes}>
                        <Text style={s.notesSaveBtnText}>Save Notes</Text>
                    </Pressable>
                </View>
            </Modal>

            <TutorialTooltip
                id="home-welcome"
                title="Welcome! 🚀"
                description="Track your projects with precision. Build faster with structured checklists for every tech stack."
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    headerLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    headerProgress: { fontSize: 30, fontWeight: 'bold' },
    headerProgressSuffix: { fontSize: 18, fontWeight: 'normal' },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: { padding: 20, paddingBottom: 120 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
    // Project Sections
    projectSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    sectionIndicator: {
        width: 4,
        height: 38,
        borderRadius: 2,
    },
    sectionIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitleText: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    sectionSubtext: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    focusBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    focusBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    sectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 14,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Add Phase Inline
    addPhaseInline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        marginTop: 4,
        marginHorizontal: 4,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 16,
    },
    addPhaseCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(29,78,216,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addPhaseText: {
        color: '#1d4ed8',
        fontWeight: '700',
        fontSize: 15,
    },
    // Next phase teaser card
    nextPhaseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 8,
        marginHorizontal: 4,
    },
    nextPhaseIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextPhaseLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    nextPhaseTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 2,
    },
    nextPhaseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    nextPhaseBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    // Archive toggle
    archiveToggle: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
        borderWidth: 1, marginBottom: 12,
    },
    archiveToggleText: { fontSize: 14, fontWeight: '600' },
    // Notes preview
    notesPreview: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 8, marginHorizontal: 4,
    },
    notesPreviewText: { flex: 1, fontSize: 12, color: '#84cc16', lineHeight: 16 },
    // Notes modal
    notesModal: {
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
    },
    notesModalHandle: { width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    notesModalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    notesModalTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    notesModalSub: { fontSize: 13 },
    notesInput: {
        borderWidth: 1, borderRadius: 12, padding: 14,
        fontSize: 14, lineHeight: 20, minHeight: 140,
        textAlignVertical: 'top', marginBottom: 16,
    },
    notesSaveBtn: { backgroundColor: '#84cc16', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
    notesSaveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
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
    createBtn: { marginTop: 32, backgroundColor: '#1d4ed8', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    createBtnText: { color: 'white', fontWeight: 'bold' },
    // FAB
    fab: { position: 'absolute', bottom: 24, right: 24 },
    fabBtn: { backgroundColor: '#1d4ed8', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
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
    closeBtn: { backgroundColor: '#1d4ed8', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
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
    saveBtn: { backgroundColor: '#1d4ed8', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    proBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    proBadgeText: { color: '#f59e0b', fontSize: 10, fontWeight: '900' },
});
