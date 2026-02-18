import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TutorialState {
    viewedTooltips: string[];

    // Actions
    isViewed: (id: string) => boolean;
    markViewed: (id: string) => void;
    resetTutorials: () => void;
}

export const useTutorialStore = create<TutorialState>()(
    persist(
        (set, get) => ({
            viewedTooltips: [],

            isViewed: (id) => get().viewedTooltips.includes(id),

            markViewed: (id) => set((state) => ({
                viewedTooltips: state.viewedTooltips.includes(id)
                    ? state.viewedTooltips
                    : [...state.viewedTooltips, id]
            })),

            resetTutorials: () => set({ viewedTooltips: [] }),
        }),
        {
            name: 'tutorial-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
