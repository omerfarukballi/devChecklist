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
import { ActivityHeatmap } from '../../src/components/ui/ActivityHeatmap';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { generateChecklist } from '../../src/engine/checklistEngine';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Phase } from '../../src/types';

// Phase ordering mirrors ProjectTimeline
const PHASE_ORDER = ['planning', 'coding', 'testing', 'deployment', 'scaling', 'growth'];
const PHASE_LABELS: Record<string, string> = {
    planning: 'Planning',
    coding: 'Building',
    testing: 'Testing',
    deployment: 'Deployment',
    scaling: 'Scaling',
    growth: 'Growth',
};
const PHASE_ICONS: Record<string, string> = {
    planning: 'clipboard-text-outline',
    coding: 'code-braces',
    testing: 'bug-outline',
    deployment: 'rocket-launch-outline',
    scaling: 'chart-line',
    growth: 'trending-up',
};

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
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
    projectId,
}: {
    checklists: import('../../src/types').GeneratedChecklist[];
    getProgress: (id: string) => number;
    color: string;
    projectName: string;
    projectId: string;
}) {
    const riskReport = useRiskRadar(checklists);
    return (
        <>
            <ProjectTimeline checklists={checklists} getProgress={getProgress} color={color} projectId={projectId} />
            <StandupGenerator checklists={checklists} projectName={projectName} />
        </>
    );
}

function HealthInsightsModal({
    project,
    visible,
    onClose,
    checklists,
}: {
    project: Project | null;
    visible: boolean;
    onClose: () => void;
    checklists: import('../../src/types').GeneratedChecklist[];
}) {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const riskReport = useRiskRadar(checklists);

    if (!project) return null;

    const bg = isDark ? '#0f0d1a' : '#ffffff';
    const textPrimary = isDark ? '#ffffff' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#475569';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={m.overlay}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <View style={[m.sheet, { backgroundColor: bg, maxHeight: '85%' }]}>
                    <View style={m.sheetHandle} />
                    <View style={s.notesModalHeader}>
                        <View style={[s.activePhaseIcon, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
                            <MaterialCommunityIcons name="heart-pulse" size={18} color="#a855f7" />
                        </View>
                        <Text style={[m.title, { color: textPrimary, marginBottom: 0 }]}>Health & Insights</Text>
                    </View>
                    <Text style={[s.notesModalSub, { color: textSecondary, marginBottom: 20 }]}>{project.name}</Text>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <RiskRadarCard report={riskReport} />
                    </ScrollView>

                    <Pressable style={m.closeBtn} onPress={onClose}>
                        <Text style={m.closeBtnText}>Done</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
function ActivityInsightsModal({
    project,
    visible,
    onClose,
    checklists,
    color
}: {
    project: Project | null;
    visible: boolean;
    onClose: () => void;
    checklists: import('../../src/types').GeneratedChecklist[];
    color: string;
}) {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const viewShotRef = React.useRef<any>(null);

    const handleShare = async () => {
        try {
            const uri = await (viewShotRef.current as any).capture();
            await Sharing.shareAsync(uri, { dialogTitle: 'Share Activity Intensity' });
        } catch (error) {
            Alert.alert('Error', 'Failed to share activity stats');
        }
    };

    if (!project) return null;

    const bg = isDark ? '#0f0d1a' : '#ffffff';
    const textPrimary = isDark ? '#ffffff' : '#0f172a';

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={m.overlay}>
                <Pressable style={{ flex: 1 }} onPress={onClose} />
                <View style={[m.sheet, { backgroundColor: bg, maxHeight: '85%' }]}>
                    <View style={m.sheetHandle} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ flex: 1 }}>
                            <View style={s.notesModalHeader}>
                                <View style={[s.activePhaseIcon, { backgroundColor: color + '15' }]}>
                                    <MaterialCommunityIcons name="clock-outline" size={18} color={color} />
                                </View>
                                <Text style={[m.title, { color: textPrimary, marginBottom: 0 }]}>Activity Stats</Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={handleShare}
                            style={[s.settingsBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }]}
                        >
                            <MaterialCommunityIcons name="share-variant" size={18} color={textPrimary} />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                            <View style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: color + '11', borderWidth: 1, borderColor: color + '22' }}>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: isDark ? '#94a3b8' : '#64748b', letterSpacing: 1 }}>TOTAL FOCUS</Text>
                                <Text style={{ fontSize: 24, fontWeight: '900', color: textPrimary, marginTop: 4 }}>
                                    {formatDuration(project.workSessions?.reduce((acc, s) => acc + s.duration, 0) || 0)}
                                </Text>
                            </View>
                            <View style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: isDark ? '#94a3b8' : '#64748b', letterSpacing: 1 }}>SESSIONS</Text>
                                <Text style={{ fontSize: 24, fontWeight: '900', color: textPrimary, marginTop: 4 }}>
                                    {project.workSessions?.length || 0}
                                </Text>
                            </View>
                        </View>

                        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
                            <View style={{ backgroundColor: bg, padding: 4 }}>
                                <ActivityHeatmap checklists={checklists} color={color} />
                            </View>
                        </ViewShot>
                    </ScrollView>

                    <Pressable style={[m.closeBtn, { backgroundColor: color }]} onPress={onClose}>
                        <Text style={m.closeBtnText}>Done</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

function UserInfoModal({ visible, onSave }: { visible: boolean; onSave: (name: string) => void }) {
    const [name, setName] = useState('');
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#0f0d1a' : '#ffffff';
    const textPrimary = isDark ? '#ffffff' : '#0f172a';
    const textMuted = isDark ? '#9ca3af' : '#64748b';

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={[m.overlay, { backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 }]}>
                <View style={[m.sheet, { backgroundColor: bg, borderRadius: 24, padding: 32, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
                    <Text style={[m.title, { color: textPrimary, textAlign: 'center', fontSize: 24 }]}>Welcome! 👋</Text>
                    <Text style={{ color: textMuted, textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
                        What should we call you?
                    </Text>

                    <TextInput
                        style={[m.input, { textAlign: 'center', fontSize: 20, height: 64, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }]}
                        placeholder="Your Name"
                        placeholderTextColor={textMuted}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                    />

                    <Pressable
                        style={[m.closeBtn, { opacity: name.trim() ? 1 : 0.5, marginTop: 24 }]}
                        onPress={() => name.trim() && onSave(name.trim())}
                        disabled={!name.trim()}
                    >
                        <Text style={m.closeBtnText}>Start Building</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

export default function HomeScreen() {
    const {
        projects, checklists, updateProject, deleteProject, archiveProject, unarchiveProject,
        updateProjectNotes, addProject, setUserName, userName, addDevLogEntry,
        getProgress, deleteChecklist, cleanupDuplicates, addChecklist
    } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const { isPremium } = usePurchaseStore();
    const isDark = colorMode === 'dark';
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [notesProject, setNotesProject] = useState<Project | null>(null);
    const [notesText, setNotesText] = useState('');
    const [insightsProject, setInsightsProject] = useState<Project | null>(null);
    const [activityProject, setActivityProject] = useState<Project | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    // Achievement system
    useAchievementChecker();
    const { getUnlocked } = useAchievementStore();
    const unlockedCount = getUnlocked().length;
    const [logText, setLogText] = useState('');
    const [wikiTab, setWikiTab] = useState<'wiki' | 'log'>('wiki');

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

    const handleAutoGenerate = async (projectId: string, targetPhase: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const items = generateChecklist({
            projectType: project.projectType,
            phase: targetPhase as Phase,
            techStack: project.techStack,
            experience: 'intermediate',
        });

        const newList: import('../../src/types').GeneratedChecklist = {
            id: Date.now().toString(),
            title: `${project.name} — ${PHASE_LABELS[targetPhase] || targetPhase}`,
            projectType: project.projectType,
            phase: targetPhase as Phase,
            techStack: project.techStack,
            experience: 'intermediate',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            items,
        };

        addChecklist(newList, projectId);
        Alert.alert("Success", `${PHASE_LABELS[targetPhase]} checklist generated!`);
    };

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

    const handleUnarchiveProject = (project: Project) => {
        unarchiveProject(project.id);
        setActiveTab('active');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Welcome Back! 👋", `"${project.name}" is now active.`);
    };

    const handleOpenNotes = (project: Project) => {
        setNotesProject(project);
        setNotesText(project.notes ?? '');
        setLogText(''); // Clear log input when opening
        setWikiTab('wiki'); // Default to wiki tab
    };

    const handleSaveNotes = () => {
        if (notesProject) {
            updateProjectNotes(notesProject.id, notesText);
            setNotesProject(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleAddLogEntry = () => {
        if (notesProject && logText.trim()) {
            const entry = {
                id: `log-${Date.now()}`,
                date: Date.now(),
                content: logText.trim()
            };
            addDevLogEntry(notesProject.id, entry);
            setLogText('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };
    const handleExportMarkdown = async (project: Project) => {
        const projectChecklists = project.checklistIds
            .map(id => checklists.find(c => c.id === id))
            .filter(Boolean) as import('../../src/types').GeneratedChecklist[];

        let md = `# ${project.name}\n\n`;
        md += `**Type**: ${PROJECT_TYPES.find(t => t.id === project.projectType)?.label || project.projectType}\n\n`;
        md += `**Stack**: ${project.techStack.join(', ')}\n\n`;

        if (project.notes) {
            md += `## 📝 Project Wiki\n${project.notes}\n\n`;
        }

        projectChecklists.forEach(cl => {
            md += `## 🏁 ${cl.title} (${PHASE_LABELS[cl.phase] || cl.phase})\n`;
            cl.items.forEach(item => {
                md += `- [${item.completed ? 'x' : ' '}] ${item.title}\n`;
                if (item.notes) md += `  - *Notes*: ${item.notes}\n`;
            });
            md += `\n`;
        });

        if (project.devLog && project.devLog.length > 0) {
            md += `## 📜 Development Log\n`;
            [...project.devLog].reverse().forEach(log => {
                md += `### ${new Date(log.date).toLocaleDateString()}\n${log.content}\n\n`;
            });
        }

        md += `---\n*Generated by DevChecklist*`;

        await Clipboard.setStringAsync(md);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Exported 🚀', 'Project details copied to clipboard as Markdown.');
    };

    const activeProjects = projects.filter(p => !p.archived);
    const orphanChecklists = checklists.filter(
        c => !projects.some(p => p.checklistIds.includes(c.id))
    );

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'active' ? !p.archived : p.archived;
        return matchesSearch && matchesTab;
    });

    const isEmpty = activeProjects.length === 0 && !searchQuery;

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
                    <Text style={[s.headerTitle, { color: textPrimary }]}>Ready to ship, {userName || 'Builder'}? 🚢</Text>
                    <View style={s.headerStatRow}>
                        <View style={[s.headerStatDot, { backgroundColor: '#10b981' }]} />
                        <Text style={[s.headerStatText, { color: textSecondary }]}>
                            {totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0}% Complete
                            <Text style={{ opacity: 0.5 }}> • </Text>
                            {totalCompleted}/{totalItems} Done
                        </Text>
                    </View>
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
                        onPress={() => router.push('/settings')}
                        style={[s.settingsBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialCommunityIcons name="cog-outline" size={22} color={textMuted} />
                    </Pressable>
                </View>
            </View>

            {(projects.length > 1 || projects.some(p => p.archived)) && (
                <View style={s.searchContainer}>
                    {projects.length > 1 && (
                        <View style={[s.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', marginBottom: projects.some(p => p.archived) ? 12 : 0 }]}>
                            <MaterialCommunityIcons name="magnify" size={20} color={textMuted} />
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <TextInput
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search projects..."
                                    placeholderTextColor={textMuted}
                                    style={[s.searchInput, { color: textPrimary }]}
                                />
                            </View>
                            {searchQuery.length > 0 && (
                                <Pressable onPress={() => setSearchQuery('')}>
                                    <MaterialCommunityIcons name="close-circle" size={18} color={textMuted} />
                                </Pressable>
                            )}
                        </View>
                    )}

                    {projects.some(p => p.archived) && (
                        <View style={[s.tabRow, { marginTop: projects.length > 1 ? 0 : 4 }]}>
                            <Pressable
                                onPress={() => setActiveTab('active')}
                                style={s.tab}
                            >
                                <Text style={[s.tabText, { color: activeTab === 'active' ? '#1d4ed8' : textMuted }]}>
                                    Active ({activeProjects.length})
                                </Text>
                                {activeTab === 'active' && <View style={s.activeIndicator} />}
                            </Pressable>
                            <Pressable
                                onPress={() => setActiveTab('archived')}
                                style={s.tab}
                            >
                                <Text style={[s.tabText, { color: activeTab === 'archived' ? '#1d4ed8' : textMuted }]}>
                                    Archived ({projects.filter(p => p.archived).length})
                                </Text>
                                {activeTab === 'archived' && <View style={s.activeIndicator} />}
                            </Pressable>
                        </View>
                    )}
                </View>
            )}

            <ScrollView contentContainerStyle={s.listContent}>
                {filteredProjects.length === 0 ? (
                    <Animated.View entering={FadeInDown.delay(200)} style={[s.emptyContainer, { marginTop: 40, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }]}>
                        <MaterialCommunityIcons
                            name={searchQuery ? 'magnify-close' : (activeTab === 'archived' ? 'archive-off-outline' : 'clipboard-text-outline')}
                            size={64}
                            color={textMuted}
                        />
                        <Text style={[s.emptyTitle, { color: textPrimary }]}>
                            {searchQuery ? 'No results found' : (activeTab === 'archived' ? 'No archived projects' : 'No Projects Yet')}
                        </Text>
                        <Text style={[s.emptyDesc, { color: textMuted }]}>
                            {searchQuery ? `We couldn't find any results for "${searchQuery}"` : (activeTab === 'archived' ? 'Projects you archive will appear here.' : 'Create your first project to start tracking your development progress.')}
                        </Text>
                        {!searchQuery && activeTab === 'active' && (
                            <Pressable onPress={handleNewProject} style={s.createBtn}>
                                <Text style={s.createBtnText}>Create Project</Text>
                            </Pressable>
                        )}
                    </Animated.View>
                ) : (
                    filteredProjects.map((project) => {
                        const uniqueIds = [...new Set(project.checklistIds)];
                        const projectChecklists = uniqueIds
                            .map(id => checklists.find(c => c.id === id))
                            .filter(Boolean) as typeof checklists;
                        const projectDef = PROJECT_TYPES.find(p => p.id === project.projectType);
                        const color = projectDef?.color || theme.colors.accent;

                        return (
                            <View key={project.id} style={s.projectSection}>
                                <View style={s.sectionHeader}>
                                    <View style={s.sectionHeaderTop}>
                                        <View style={[s.sectionIndicator, { backgroundColor: color }]} />
                                        {projectDef?.icon && (
                                            <View style={[s.sectionIconWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                                <MaterialCommunityIcons name={projectDef.icon} size={24} color={color} />
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={[s.sectionTitleText, { color: textPrimary }]} numberOfLines={1}>{project.name}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={[s.sectionSubtext, { color: textMuted }]}>{projectDef?.label}</Text>
                                                {project.workSessions && project.workSessions.length > 0 && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                                        <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: textMuted, opacity: 0.5 }} />
                                                        <MaterialCommunityIcons name="clock-outline" size={10} color={textMuted} />
                                                        <Text style={[s.sectionSubtext, { color: textMuted, fontSize: 11 }]}>
                                                            {formatDuration(project.workSessions.reduce((acc, sess) => acc + sess.duration, 0))}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
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

                                    <View style={s.sectionActions}>
                                        {!project.archived && (
                                            <Pressable
                                                onPress={() => router.push({ pathname: '/share-card', params: { projectId: project.id } })}
                                                style={s.actionBtn}
                                            >
                                                <MaterialCommunityIcons name="share-variant-outline" size={18} color="#6366f1" />
                                            </Pressable>
                                        )}
                                        {project.githubUrl && (
                                            <Pressable onPress={() => Linking.openURL(project.githubUrl!)} style={s.actionBtn}>
                                                <MaterialCommunityIcons name="github" size={18} color={textMuted} />
                                            </Pressable>
                                        )}
                                        <Pressable onPress={() => setActivityProject(project)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="clock-outline" size={18} color={color} />
                                        </Pressable>
                                        <Pressable onPress={() => setInsightsProject(project)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="heart-pulse" size={18} color="#a855f7" />
                                        </Pressable>
                                        <Pressable onPress={() => handleOpenNotes(project)} style={s.actionBtn}>
                                            <MaterialCommunityIcons
                                                name={project.notes ? 'book-open-variant' : 'book-outline'}
                                                size={18}
                                                color="#84cc16"
                                            />
                                        </Pressable>
                                        <Pressable onPress={() => handleExportMarkdown(project)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="file-export-outline" size={18} color="#6366f1" />
                                        </Pressable>
                                        {!project.archived ? (
                                            <Pressable onPress={() => handleArchiveProject(project)} style={s.actionBtn}>
                                                <MaterialCommunityIcons name="archive-outline" size={18} color="#f59e0b" />
                                            </Pressable>
                                        ) : (
                                            <Pressable onPress={() => handleUnarchiveProject(project)} style={s.actionBtn}>
                                                <MaterialCommunityIcons name="archive-arrow-up-outline" size={18} color='#10b981' />
                                            </Pressable>
                                        )}
                                        <Pressable onPress={() => setEditProject(project)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="pencil-outline" size={18} color="#38bdf8" />
                                        </Pressable>
                                        <Pressable onPress={() => handleDeleteProject(project)} style={s.actionBtn}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                                        </Pressable>
                                    </View>
                                </View>

                                {project.notes ? (
                                    <Pressable onPress={() => handleOpenNotes(project)} style={[s.notesPreview, { backgroundColor: isDark ? 'rgba(132,204,22,0.08)' : 'rgba(132,204,22,0.07)', borderColor: isDark ? 'rgba(132,204,22,0.2)' : 'rgba(132,204,22,0.25)' }]}>
                                        <MaterialCommunityIcons name="note-text" size={13} color="#84cc16" />
                                        <Text style={s.notesPreviewText} numberOfLines={2}>{project.notes}</Text>
                                    </Pressable>
                                ) : null}

                                {!project.archived && (
                                    <ProjectSectionWithRisk
                                        checklists={projectChecklists}
                                        getProgress={getProgress}
                                        color={color}
                                        projectName={project.name}
                                        projectId={project.id}
                                    />
                                )}

                                {project.archived && (
                                    <View style={{ marginTop: 16 }}>
                                        <Text style={{ color: textMuted, fontStyle: 'italic', fontSize: 13 }}>Project archived.</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}

                {activeTab === 'active' && !searchQuery && orphanChecklists.length > 0 && (
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text style={[s.sectionTitle, { color: textPrimary }]}>Other Checklists</Text>
                        {orphanChecklists.map((item, index) =>
                            safeRenderChecklist(item, 'orphan', index)
                        )}
                    </View>
                )}
            </ScrollView>

            {!isEmpty && activeTab === 'active' && (
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

            {/* Project Wiki & Dev-Log Modal */}
            <Modal visible={!!notesProject} transparent animationType="slide" onRequestClose={handleSaveNotes}>
                <Pressable style={{ flex: 1 }} onPress={() => setNotesProject(null)} />
                <View style={[s.notesModal, { backgroundColor: isDark ? '#0f0d1a' : '#ffffff', minHeight: '80%' }]}>
                    <View style={s.notesModalHandle} />

                    <View style={s.notesModalHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.notesModalTitle, { color: textPrimary }]}>{notesProject?.name}</Text>
                            <Text style={[s.notesModalSub, { color: textMuted }]}>Project Wiki & Dev-Log</Text>
                        </View>
                        <Pressable onPress={() => setNotesProject(null)} style={s.closeModalBtn}>
                            <MaterialCommunityIcons name="close" size={24} color={textMuted} />
                        </Pressable>
                    </View>

                    <View style={[s.wikiTabRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <Pressable onPress={() => setWikiTab('wiki')} style={[s.wikiTab, wikiTab === 'wiki' && [s.wikiTabActive, { backgroundColor: isDark ? '#1e1b2e' : 'white' }]]}>
                            <MaterialCommunityIcons name="book-open-variant" size={18} color={wikiTab === 'wiki' ? '#84cc16' : textMuted} />
                            <Text style={[s.wikiTabText, { color: wikiTab === 'wiki' ? textPrimary : textMuted }]}>Wiki</Text>
                        </Pressable>
                        <Pressable onPress={() => setWikiTab('log')} style={[s.wikiTab, wikiTab === 'log' && [s.wikiTabActive, { backgroundColor: isDark ? '#1e1b2e' : 'white' }]]}>
                            <MaterialCommunityIcons name="playlist-edit" size={18} color={wikiTab === 'log' ? '#f59e0b' : textMuted} />
                            <Text style={[s.wikiTabText, { color: wikiTab === 'log' ? textPrimary : textMuted }]}>Dev-Log</Text>
                        </Pressable>
                    </View>

                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {wikiTab === 'wiki' ? (
                            <View style={{ padding: 20 }}>
                                <Text style={[s.wikiLabel, { color: textMuted }]}>MAIN WIKI / PROJECT NOTES</Text>
                                <TextInput
                                    style={[s.wikiInput, { color: textPrimary }]}
                                    placeholder="Write project goals, architecture notes, ideas..."
                                    placeholderTextColor={textMuted}
                                    value={notesText}
                                    onChangeText={setNotesText}
                                    multiline
                                    textAlignVertical="top"
                                />
                                <Pressable style={[s.notesSaveBtn, { backgroundColor: '#84cc16' }]} onPress={handleSaveNotes}>
                                    <Text style={s.notesSaveBtnText}>Save Wiki</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View style={{ padding: 20 }}>
                                <Text style={[s.wikiLabel, { color: textMuted }]}>DAILY PROGRESS LOG</Text>

                                <View style={[s.logEntryInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderColor: cardBorder }]}>
                                    <TextInput
                                        style={[s.logInput, { color: textPrimary }]}
                                        placeholder="What did you achieve today?"
                                        placeholderTextColor={textMuted}
                                        value={logText}
                                        onChangeText={setLogText}
                                        multiline
                                    />
                                    <Pressable
                                        style={[s.addLogBtn, { backgroundColor: logText.trim() ? '#f59e0b' : textMuted + '44' }]}
                                        onPress={handleAddLogEntry}
                                        disabled={!logText.trim()}
                                    >
                                        <MaterialCommunityIcons name="send" size={20} color="white" />
                                    </Pressable>
                                </View>

                                <View style={{ marginTop: 20 }}>
                                    {notesProject?.devLog?.map((log) => (
                                        <View key={log.id} style={[s.logEntryCard, { borderLeftColor: '#f59e0b' }]}>
                                            <Text style={[s.logDate, { color: textMuted }]}>
                                                {new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            <Text style={[s.logContent, { color: textPrimary }]}>{log.content}</Text>
                                        </View>
                                    ))}
                                    {(!notesProject?.devLog || notesProject.devLog.length === 0) && (
                                        <Text style={[s.emptyLogText, { color: textMuted }]}>No log entries yet. Start tracking your progress!</Text>
                                    )}
                                </View>
                            </View>
                        )}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </Modal>

            <HealthInsightsModal
                project={insightsProject}
                visible={!!insightsProject}
                onClose={() => setInsightsProject(null)}
                checklists={insightsProject ? checklists.filter(c => insightsProject.checklistIds.includes(c.id)) : []}
            />

            <ActivityInsightsModal
                project={activityProject}
                visible={!!activityProject}
                onClose={() => setActivityProject(null)}
                color={activityProject ? PROJECT_TYPES.find(t => t.id === activityProject.projectType)?.color || theme.colors.accent : theme.colors.accent}
                checklists={activityProject ? checklists.filter(c => activityProject.checklistIds.includes(c.id)) : []}
            />

            <UserInfoModal
                visible={!userName && activeProjects.length > 0}
                onSave={setUserName}
            />

            <TutorialTooltip
                id="home-welcome"
                title="Welcome! 🚀"
                description="Track your projects with precision. Build faster with structured checklists for every tech stack."
            />
        </SafeAreaView >
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
    headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
    headerStatRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerStatDot: { width: 6, height: 6, borderRadius: 3 },
    headerStatText: { fontSize: 13, fontWeight: '600' },
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
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginTop: 4,
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
    activePhaseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    activePhaseIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activePhaseTitle: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    notesPreviewText: { flex: 1, fontSize: 12, color: '#84cc16', lineHeight: 16 },
    // Notes modal
    notesModal: {
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
    },
    notesModalHandle: { width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    notesModalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    notesModalTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
    notesModalSub: { fontSize: 13, marginTop: 2 },
    wikiTabRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 10, padding: 4, borderRadius: 12 },
    wikiTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
    wikiTabActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    wikiTabText: { fontSize: 13, fontWeight: '700' },
    wikiLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
    wikiInput: { fontSize: 16, minHeight: 150, padding: 0, marginBottom: 20 },
    logEntryInputContainer: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 16, borderWidth: 1 },
    logInput: { flex: 1, fontSize: 15, paddingVertical: 5, minHeight: 40 },
    addLogBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    logEntryCard: { paddingLeft: 12, borderLeftWidth: 3, marginBottom: 20 },
    logDate: { fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
    logContent: { fontSize: 14, lineHeight: 20 },
    emptyLogText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
    closeModalBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
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
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchInput: {
        fontSize: 15,
        fontWeight: '500',
        padding: 0,
    },
    tabRow: {
        flexDirection: 'row',
        gap: 24,
        paddingHorizontal: 4,
    },
    tab: {
        paddingBottom: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
    },
    activeIndicator: {
        height: 3,
        backgroundColor: '#1d4ed8',
        borderRadius: 2,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});

const m = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'transparent' },
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
