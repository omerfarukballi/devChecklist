import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: number;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-blood',
        title: 'First Blood',
        description: 'Complete your first checklist item.',
        icon: 'sword',
        color: '#ef4444',
        rarity: 'common',
    },
    {
        id: 'planner',
        title: 'The Planner',
        description: 'Complete the Planning phase of a project.',
        icon: 'clipboard-check-outline',
        color: '#6366f1',
        rarity: 'common',
    },
    {
        id: 'mvp-striker',
        title: 'MVP Striker',
        description: 'Complete the Development (Coding) phase.',
        icon: 'rocket-launch-outline',
        color: '#f59e0b',
        rarity: 'rare',
    },
    {
        id: 'bug-slayer',
        title: 'Bug Slayer',
        description: 'Complete the Testing phase.',
        icon: 'bug-check-outline',
        color: '#10b981',
        rarity: 'rare',
    },
    {
        id: 'ship-it',
        title: 'Ship It!',
        description: 'Complete the Deployment phase.',
        icon: 'package-variant-closed',
        color: '#60a5fa',
        rarity: 'epic',
    },
    {
        id: 'scaling-master',
        title: 'Scaling Master',
        description: 'Complete the Scaling phase.',
        icon: 'chart-line',
        color: '#a78bfa',
        rarity: 'epic',
    },
    {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Complete 100% of all items in a project.',
        icon: 'star-circle',
        color: '#f59e0b',
        rarity: 'legendary',
    },
    {
        id: 'serial-builder',
        title: 'Serial Builder',
        description: 'Create 5 or more projects.',
        icon: 'layers-triple',
        color: '#ec4899',
        rarity: 'legendary',
    },
    {
        id: 'note-taker',
        title: 'Note Taker',
        description: 'Add notes to 10 checklist items.',
        icon: 'note-text',
        color: '#84cc16',
        rarity: 'common',
    },
    {
        id: 'half-way',
        title: 'Half Way There',
        description: 'Complete 50% of a project.',
        icon: 'progress-check',
        color: '#06b6d4',
        rarity: 'common',
    },
];

interface AchievementStore {
    unlockedIds: string[];
    unlock: (id: string) => void;
    isUnlocked: (id: string) => boolean;
    getUnlocked: () => Achievement[];
    resetAchievements: () => void;
}

export const useAchievementStore = create<AchievementStore>()(
    persist(
        (set, get) => ({
            unlockedIds: [],

            unlock: (id) => {
                if (get().unlockedIds.includes(id)) return;
                set(state => ({
                    unlockedIds: [...state.unlockedIds, id],
                }));
            },

            isUnlocked: (id) => get().unlockedIds.includes(id),

            getUnlocked: () =>
                ALL_ACHIEVEMENTS.filter(a => get().unlockedIds.includes(a.id)),

            resetAchievements: () => set({ unlockedIds: [] }),
        }),
        {
            name: 'achievement-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
