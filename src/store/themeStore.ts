import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorMode = 'dark' | 'light';

interface ThemeStore {
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
    toggleColorMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            colorMode: 'dark',
            setColorMode: (mode) => set({ colorMode: mode }),
            toggleColorMode: () =>
                set({ colorMode: get().colorMode === 'dark' ? 'light' : 'dark' }),
        }),
        {
            name: 'app-theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
