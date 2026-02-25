import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  FounderOSProfile,
  ProductDNA,
  FounderState,
  Constraints,
  LifecycleStage,
} from '../types/founderOS';
import { computeStrategicOutput } from '../engine/founderOS-engine';
import { getLocale } from './localeStore';

const STORAGE_KEY = 'founder-os-profiles-v1';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

interface FounderOSStore {
  profiles: FounderOSProfile[];
  activeProfileId: string | null;

  getProfile: (id: string) => FounderOSProfile | undefined;
  setActiveProfile: (id: string | null) => void;

  createProfile: (params: {
    name: string;
    dna: ProductDNA;
    founder: FounderState;
    constraints: Constraints;
    stage: LifecycleStage;
  }) => FounderOSProfile;

  updateDNA: (profileId: string, dna: ProductDNA) => void;
  updateFounderState: (profileId: string, founder: FounderState) => void;
  updateConstraints: (profileId: string, constraints: Constraints) => void;
  setStage: (profileId: string, stage: LifecycleStage) => void;
  updateName: (profileId: string, name: string) => void;

  toggleTask: (profileId: string, taskId: string) => void;
  clearTaskCompletions: (profileId: string) => void;
  deleteProfile: (id: string) => void;
  recalculateAll: () => void;
  resetAll: () => void;
}

function recalculate(profile: FounderOSProfile): FounderOSProfile {
  const output = computeStrategicOutput({
    dna: profile.productDNA,
    founder: profile.founderState,
    constraints: profile.constraints,
    stage: profile.stage,
    locale: getLocale(),
  });
  return { ...profile, strategicOutput: output, taskCompletions: {}, updatedAt: Date.now() };
}

export const useFounderOSStore = create<FounderOSStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      getProfile: (id) => get().profiles.find((p) => p.id === id),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      createProfile: ({ name, dna, founder, constraints, stage }) => {
        const now = Date.now();
        const id = genId();
        const output = computeStrategicOutput({ dna, founder, constraints, stage, locale: getLocale() });

        const profile: FounderOSProfile = {
          id,
          name,
          productDNA: dna,
          founderState: founder,
          constraints,
          stage,
          strategicOutput: output,
          taskCompletions: {},
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          profiles: [profile, ...state.profiles],
          activeProfileId: id,
        }));

        return profile;
      },

      updateDNA: (profileId, dna) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? recalculate({ ...p, productDNA: dna }) : p
          ),
        })),

      updateFounderState: (profileId, founder) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? recalculate({ ...p, founderState: founder }) : p
          ),
        })),

      updateConstraints: (profileId, constraints) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? recalculate({ ...p, constraints }) : p
          ),
        })),

      setStage: (profileId, stage) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? recalculate({ ...p, stage }) : p
          ),
        })),

      updateName: (profileId, name) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? { ...p, name, updatedAt: Date.now() } : p
          ),
        })),

      toggleTask: (profileId, taskId) =>
        set((state) => ({
          profiles: state.profiles.map((p) => {
            if (p.id !== profileId) return p;
            const tc = { ...p.taskCompletions };
            tc[taskId] = !tc[taskId];
            return { ...p, taskCompletions: tc };
          }),
        })),

      clearTaskCompletions: (profileId) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? { ...p, taskCompletions: {} } : p
          ),
        })),

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        })),

      recalculateAll: () =>
        set((state) => ({
          profiles: state.profiles.map((p) => recalculate(p)),
        })),

      resetAll: () => set({ profiles: [], activeProfileId: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
