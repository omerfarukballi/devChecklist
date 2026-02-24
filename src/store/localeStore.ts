import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export type AppLocale = 'tr' | 'en';

interface LocaleStore {
  /** null = user has not chosen yet (first launch) */
  locale: AppLocale | null;
  setLocale: (locale: AppLocale | null) => void;
}

function applyLocale(locale: AppLocale | null) {
  if (locale) i18n.locale = locale;
  else i18n.locale = 'en';
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: null,
      setLocale: (locale) => {
        applyLocale(locale);
        set({ locale });
      },
    }),
    {
      name: 'app-locale-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) applyLocale(state.locale);
      },
    }
  )
);

export function getLocale(): AppLocale {
  return useLocaleStore.getState().locale ?? 'en';
}
