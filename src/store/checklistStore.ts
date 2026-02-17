import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneratedChecklist } from '../types';

interface ChecklistStore {
    checklists: GeneratedChecklist[];
    activeChecklistId: string | null;

    // Actions
    addChecklist: (checklist: GeneratedChecklist) => void;
    deleteChecklist: (id: string) => void;
    setActiveChecklist: (id: string | null) => void;

    toggleItem: (checklistId: string, itemId: string) => void;
    updateItemNotes: (checklistId: string, itemId: string, notes: string) => void;

    // Getters
    getChecklist: (id: string) => GeneratedChecklist | undefined;
    getProgress: (id: string) => number; // 0-100
}

export const useChecklistStore = create<ChecklistStore>()(
    persist(
        (set, get) => ({
            checklists: [],
            activeChecklistId: null,

            addChecklist: (checklist) =>
                set((state) => ({ checklists: [checklist, ...state.checklists], activeChecklistId: checklist.id })),

            deleteChecklist: (id) =>
                set((state) => ({
                    checklists: state.checklists.filter((c) => c.id !== id),
                    activeChecklistId: state.activeChecklistId === id ? null : state.activeChecklistId
                })),

            setActiveChecklist: (id) => set({ activeChecklistId: id }),

            toggleItem: (checklistId, itemId) =>
                set((state) => ({
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
                })),

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

            getChecklist: (id) => get().checklists.find((c) => c.id === id),

            getProgress: (id) => {
                const list = get().checklists.find((c) => c.id === id);
                if (!list || list.items.length === 0) return 0;
                const completedCount = list.items.filter((i) => i.completed).length;
                return Math.round((completedCount / list.items.length) * 100);
            },
        }),
        {
            name: 'dev-checklist-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
