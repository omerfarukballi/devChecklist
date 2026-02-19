import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProjectTemplate, GeneratedChecklist, GeneratedChecklistItem, Project, Experience } from '../types';

export interface UserSettings {
    defaultExperience: Experience;
    hapticsEnabled: boolean;
    remindersEnabled: boolean;
    reminderTime: string; // HH:mm format
    appIcon: 'default' | 'classic' | 'dark' | 'premium';
}

interface ChecklistStore {
    checklists: GeneratedChecklist[];
    projects: Project[];
    activeChecklistId: string | null;
    templates: ProjectTemplate[];
    userName: string | null;
    settings: UserSettings;

    setUserName: (name: string) => void;
    updateSettings: (updates: Partial<UserSettings>) => void;
    resetApp: () => void;

    // Project actions
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'githubUrl'>>) => void;
    deleteProject: (id: string) => void;
    archiveProject: (id: string) => void;
    unarchiveProject: (id: string) => void;
    updateProjectNotes: (id: string, notes: string) => void;
    getProject: (id: string) => Project | undefined;
    getProjectForChecklist: (checklistId: string) => Project | undefined;
    addWorkSession: (projectId: string, session: any) => void; // Using any to avoid importing WorkSession here if it causes issues, but types/index.ts is fine
    addDevLogEntry: (projectId: string, entry: any) => void;
    setActivePhase: (projectId: string, phase: string) => void;

    // Checklist actions
    addChecklist: (checklist: GeneratedChecklist, projectId?: string) => void;
    deleteChecklist: (id: string) => void;
    setActiveChecklist: (id: string | null) => void;

    toggleItem: (checklistId: string, itemId: string) => void;
    updateItemNotes: (checklistId: string, itemId: string, notes: string) => void;
    addCustomItem: (checklistId: string, title: string) => void;
    deleteItem: (checklistId: string, itemId: string) => void;
    addTechToChecklist: (checklistId: string, newTechIds: string[], newItems: GeneratedChecklistItem[]) => void;

    // Template actions
    saveTemplate: (project: Project, name: string) => void;
    deleteTemplate: (id: string) => void;

    // Getters
    getChecklist: (id: string) => GeneratedChecklist | undefined;
    getProgress: (id: string) => number; // 0-100

    // Data cleanup — call on app mount to fix any corrupted persisted data
    cleanupDuplicates: () => void;
    loadBackup: (data: any) => void;
}

export const useChecklistStore = create<ChecklistStore>()(
    persist(
        (set, get) => ({
            checklists: [],
            projects: [],
            activeChecklistId: null,
            templates: [],
            userName: null,
            settings: {
                defaultExperience: 'intermediate',
                hapticsEnabled: true,
                remindersEnabled: false,
                reminderTime: '09:00',
                appIcon: 'default',
            },

            setUserName: (userName) => set({ userName }),

            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),

            resetApp: () =>
                set({
                    checklists: [],
                    projects: [],
                    activeChecklistId: null,
                    templates: [],
                    userName: null,
                    settings: {
                        defaultExperience: 'intermediate',
                        hapticsEnabled: true,
                        remindersEnabled: false,
                        reminderTime: '09:00',
                        appIcon: 'default',
                    },
                }),

            // ── Project actions ─────────────────────────────────────────
            addProject: (project) =>
                set((state) => ({ projects: [project, ...state.projects] })),

            updateProject: (id, updates) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
                    ),
                })),

            deleteProject: (id) =>
                set((state) => {
                    const project = state.projects.find((p) => p.id === id);
                    const idsToDelete = project?.checklistIds ?? [];
                    return {
                        projects: state.projects.filter((p) => p.id !== id),
                        checklists: state.checklists.filter((c) => !idsToDelete.includes(c.id)),
                    };
                }),

            getProject: (id) => get().projects.find((p) => p.id === id),

            getProjectForChecklist: (checklistId) =>
                get().projects.find((p) => p.checklistIds.includes(checklistId)),

            archiveProject: (id) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, archived: true, archivedAt: Date.now(), updatedAt: Date.now() } : p
                    ),
                })),

            unarchiveProject: (id) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, archived: false, archivedAt: undefined, updatedAt: Date.now() } : p
                    ),
                })),

            updateProjectNotes: (id, notes) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id ? { ...p, notes, updatedAt: Date.now() } : p
                    ),
                })),

            addWorkSession: (projectId, session) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? {
                                ...p,
                                workSessions: [...(p.workSessions || []), session],
                                updatedAt: Date.now(),
                            }
                            : p
                    ),
                })),

            addDevLogEntry: (projectId, entry) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? {
                                ...p,
                                devLog: [entry, ...(p.devLog || [])],
                                updatedAt: Date.now(),
                            }
                            : p
                    ),
                })),

            setActivePhase: (projectId, phase) =>
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? { ...p, activePhase: phase, updatedAt: Date.now() }
                            : p
                    ),
                })),

            // ── Checklist actions ────────────────────────────────────────
            addChecklist: (checklist, projectId) =>
                set((state) => {
                    // Guard: don't add if already exists
                    if (state.checklists.some((c) => c.id === checklist.id)) {
                        return state;
                    }
                    const newChecklists = [checklist, ...state.checklists];
                    let newProjects = state.projects;
                    if (projectId) {
                        newProjects = state.projects.map((p) => {
                            if (p.id !== projectId) return p;
                            // Deduplicate: only add if not already present
                            if (p.checklistIds.includes(checklist.id)) return p;
                            return { ...p, checklistIds: [...p.checklistIds, checklist.id], updatedAt: Date.now() };
                        });
                    }
                    return {
                        checklists: newChecklists,
                        projects: newProjects,
                        activeChecklistId: checklist.id,
                    };
                }),

            deleteChecklist: (id) =>
                set((state) => ({
                    checklists: state.checklists.filter((c) => c.id !== id),
                    projects: state.projects.map((p) =>
                        p.checklistIds.includes(id)
                            ? { ...p, checklistIds: p.checklistIds.filter((cid) => cid !== id), updatedAt: Date.now() }
                            : p
                    ),
                    activeChecklistId: state.activeChecklistId === id ? null : state.activeChecklistId,
                })),

            setActiveChecklist: (id) => set({ activeChecklistId: id }),

            toggleItem: (checklistId, itemId) =>
                set((state) => {
                    const checklist = state.checklists.find((c) => c.id === checklistId);
                    const phase = checklist?.phase;

                    // Update active phase for the project
                    const updatedProjects = state.projects.map(p => {
                        if (phase && p.checklistIds.includes(checklistId)) {
                            return { ...p, activePhase: phase, updatedAt: Date.now() };
                        }
                        return p;
                    });

                    return {
                        projects: updatedProjects,
                        checklists: state.checklists.map((list) => {
                            if (list.id !== checklistId) return list;
                            return {
                                ...list,
                                items: list.items.map((item) => {
                                    if (item.id !== itemId) return item;
                                    const completed = !item.completed;
                                    return {
                                        ...item,
                                        completed,
                                        completedAt: completed ? Date.now() : undefined,
                                    };
                                }),
                            };
                        }),
                    };
                }),

            updateItemNotes: (checklistId, itemId, notes) =>
                set((state) => ({
                    checklists: state.checklists.map((list) => {
                        if (list.id !== checklistId) return list;
                        return {
                            ...list,
                            items: list.items.map((item) =>
                                item.id === itemId ? { ...item, notes } : item
                            ),
                        };
                    }),
                })),

            addCustomItem: (checklistId, title) =>
                set((state) => ({
                    checklists: state.checklists.map((list) => {
                        if (list.id !== checklistId) return list;
                        const newItem: GeneratedChecklistItem = {
                            id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                            title,
                            description: '',
                            details: '',
                            prompt: '',
                            tags: ['custom'],
                            priority: 'medium',
                            estimatedMinutes: 30,
                            experienceLevels: ['beginner', 'intermediate', 'advanced'],
                            phaseSpecific: [list.phase],
                            projectTypeIds: [list.projectType],
                            completed: false,
                            notes: '',
                        };
                        return { ...list, items: [...list.items, newItem] };
                    }),
                })),

            deleteItem: (checklistId, itemId) =>
                set((state) => ({
                    checklists: state.checklists.map((list) => {
                        if (list.id !== checklistId) return list;
                        return { ...list, items: list.items.filter((i) => i.id !== itemId) };
                    }),
                })),

            addTechToChecklist: (checklistId, newTechIds, newItems) =>
                set((state) => ({
                    checklists: state.checklists.map((list) => {
                        if (list.id !== checklistId) return list;
                        const mergedStack = [...new Set([...list.techStack, ...newTechIds])];
                        return {
                            ...list,
                            techStack: mergedStack,
                            items: [...list.items, ...newItems],
                            updatedAt: Date.now(),
                        };
                    }),
                })),

            getChecklist: (id) => get().checklists.find((c) => c.id === id),

            getProgress: (id) => {
                const list = get().checklists.find((c) => c.id === id);
                if (!list || list.items.length === 0) return 0;
                const completedCount = list.items.filter((i) => i.completed).length;
                return Math.round((completedCount / list.items.length) * 100);
            },

            saveTemplate: (project, name) => {
                const state = get();
                const projectChecklists = project.checklistIds
                    .map((id) => state.checklists.find((c) => c.id === id))
                    .filter(Boolean) as GeneratedChecklist[];

                const newTemplate: ProjectTemplate = {
                    id: Date.now().toString(),
                    name,
                    description: `Template based on ${project.name}`,
                    projectType: project.projectType,
                    techStack: project.techStack,
                    checklists: projectChecklists.map((c) => ({
                        title: c.title,
                        phase: c.phase,
                        items: c.items.map(({ completed, completedAt, ...rest }) => rest), // Omit completed status
                    })),
                    createdAt: Date.now(),
                };

                set((state) => ({
                    templates: [newTemplate, ...state.templates],
                }));
            },

            deleteTemplate: (id) =>
                set((state) => ({
                    templates: state.templates.filter((t) => t.id !== id),
                })),

            cleanupDuplicates: () =>
                set((state) => {
                    // 1. Deduplicate checklists array (same id twice)
                    const seenChecklistIds = new Set<string>();
                    const cleanedChecklists = state.checklists.filter((c) => {
                        if (seenChecklistIds.has(c.id)) return false;
                        seenChecklistIds.add(c.id);
                        return true;
                    });

                    // 2. Deduplicate project.checklistIds arrays
                    const cleanedProjects = state.projects.map((p) => ({
                        ...p,
                        checklistIds: [...new Set(p.checklistIds)],
                    }));

                    // Only trigger re-render if something actually changed
                    const checklistsDirty = cleanedChecklists.length !== state.checklists.length;
                    const projectsDirty = cleanedProjects.some(
                        (p, i) => p.checklistIds.length !== state.projects[i]?.checklistIds.length
                    );

                    if (!checklistsDirty && !projectsDirty) return state;
                    return { checklists: cleanedChecklists, projects: cleanedProjects };
                }),

            loadBackup: (data) =>
                set((state) => ({
                    ...state,
                    ...data,
                })),
        }),
        {
            name: 'dev-checklist-storage',
            storage: createJSONStorage(() => AsyncStorage),
            version: 2,
            migrate: (persistedState: any, version: number) => {
                // Deduplicate any data corrupted by previous bug (duplicate checklistIds)
                const state = persistedState as ChecklistStore;
                const cleanedProjects = (state.projects ?? []).map((p: any) => ({
                    ...p,
                    checklistIds: [...new Set(p.checklistIds as string[])],
                }));
                const seenIds = new Set<string>();
                const cleanedChecklists = (state.checklists ?? []).filter((c: any) => {
                    if (seenIds.has(c.id)) return false;
                    seenIds.add(c.id);
                    return true;
                });
                return { ...state, projects: cleanedProjects, checklists: cleanedChecklists };
            },
        }
    )
);
