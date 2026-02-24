/**
 * V2 Strategy Profile store — Product Strategy Profiles replace Projects.
 * Persisted; migrates from legacy projects on first load when needed.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StrategyProfile, ContextProfile, ProductStage, StrategyItemInstance } from '../types/strategy';
import { buildStrategicPlan } from '../core/context-engine';
import { migrateAllLegacyToStrategy } from '../core/migration/legacyToStrategy';
import { STAGE_ORDER } from '../core/stage-transition/suggestStage';
import type { Project } from '../types';
import type { GeneratedChecklist } from '../types';

const STRATEGY_STORAGE_KEY = 'dev-checklist-strategy-v1';

interface StrategyProfileStore {
  strategyProfiles: StrategyProfile[];
  activeStrategyProfileId: string | null;

  getStrategyProfile: (id: string) => StrategyProfile | undefined;
  setActiveStrategyProfile: (id: string | null) => void;
  addStrategyProfile: (profile: StrategyProfile) => void;
  updateStrategyProfile: (id: string, updates: Partial<Pick<StrategyProfile, 'name' | 'archived' | 'archivedAt' | 'userCount' | 'stageOverride' | 'completionRatio' | 'stageUpdatedAt'>>) => void;
  updateContext: (profileId: string, contextUpdates: Partial<ContextProfile>) => void;
  regeneratePlan: (profileId: string) => void;
  toggleStrategyItem: (profileId: string, instanceId: string) => void;
  updateStrategyItemNotes: (profileId: string, instanceId: string, notes: string) => void;
  deleteStrategyProfile: (id: string) => void;
  archiveStrategyProfile: (id: string) => void;
  unarchiveStrategyProfile: (id: string) => void;
  updateProfileUserCount: (profileId: string, userCount: number) => void;
  setStageOverride: (profileId: string, stage: ProductStage | undefined) => void;
  /** Update only displayed stage (for "Add next" label). Does NOT rebuild plan — keeps all phases' items. */
  setStageDisplayOnly: (profileId: string, stage: ProductStage) => void;
  /** Add items from a given stage to the plan (merge, no duplicates by item id). Returns number of items added. */
  addItemsFromStage: (profileId: string, stage: ProductStage) => number;
  /** Add items from the next stage in order (e.g. 0-100 → 100-1000). Returns stage and count added. */
  addNextStageToPlan: (profileId: string) => { stage: ProductStage; added: number } | null;

  /** Run once when app has legacy projects but no strategy profiles */
  migrateFromLegacy: (projects: Project[], checklists: GeneratedChecklist[]) => void;
  /** Restore strategy profiles from backup (e.g. after import) */
  restoreFromBackup: (profiles: StrategyProfile[]) => void;
  resetStrategy: () => void;
}

export const useStrategyProfileStore = create<StrategyProfileStore>()(
  persist(
    (set, get) => ({
      strategyProfiles: [],
      activeStrategyProfileId: null,

      getStrategyProfile: (id) => get().strategyProfiles.find((p) => p.id === id),

      setActiveStrategyProfile: (id) => set({ activeStrategyProfileId: id }),

      addStrategyProfile: (profile) =>
        set((state) => ({
          strategyProfiles: [profile, ...state.strategyProfiles],
          activeStrategyProfileId: profile.id,
        })),

      updateStrategyProfile: (id, updates) =>
        set((state) => ({
          strategyProfiles: state.strategyProfiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        })),

      updateContext: (profileId, contextUpdates) =>
        set((state) => {
          const profile = state.strategyProfiles.find((p) => p.id === profileId);
          if (!profile) return state;
          const now = Date.now();
          const context: ContextProfile = {
            ...profile.context,
            ...contextUpdates,
            updatedAt: now,
          };
          const plan = buildStrategicPlan(context, profileId, profile.plan);
          return {
            strategyProfiles: state.strategyProfiles.map((p) =>
              p.id === profileId
                ? { ...p, context, plan, updatedAt: now }
                : p
            ),
          };
        }),

      regeneratePlan: (profileId) =>
        set((state) => {
          const profile = state.strategyProfiles.find((p) => p.id === profileId);
          if (!profile) return state;
          const plan = buildStrategicPlan(profile.context, profileId, profile.plan);
          return {
            strategyProfiles: state.strategyProfiles.map((p) =>
              p.id === profileId ? { ...p, plan, updatedAt: Date.now() } : p
            ),
          };
        }),

      toggleStrategyItem: (profileId, instanceId) =>
        set((state) => ({
          strategyProfiles: state.strategyProfiles.map((p) => {
            if (p.id !== profileId) return p;
            const now = Date.now();
            const items = p.plan.prioritizedItems.map((item) =>
              item.instanceId === instanceId
                ? {
                    ...item,
                    completed: !item.completed,
                    completedAt: item.completed ? undefined : now,
                  }
                : item
            );
            const completedCount = items.filter((i) => i.completed).length;
            const completionRatio = items.length > 0 ? completedCount / items.length : 0;
            return {
              ...p,
              plan: {
                ...p.plan,
                prioritizedItems: items,
                weeklyFocus: items.filter((i) => !i.completed).slice(0, 7),
                riskAlerts: items.filter((i) => i.domain === 'risk' && !i.completed).slice(0, 5),
              },
              completionRatio,
              updatedAt: now,
            };
          }),
        })),

      updateStrategyItemNotes: (profileId, instanceId, notes) =>
        set((state) => ({
          strategyProfiles: state.strategyProfiles.map((p) => {
            if (p.id !== profileId) return p;
            return {
              ...p,
              plan: {
                ...p.plan,
                prioritizedItems: p.plan.prioritizedItems.map((item) =>
                  item.instanceId === instanceId ? { ...item, notes } : item
                ),
                weeklyFocus: p.plan.weeklyFocus.map((item) =>
                  item.instanceId === instanceId ? { ...item, notes } : item
                ),
                riskAlerts: p.plan.riskAlerts.map((item) =>
                  item.instanceId === instanceId ? { ...item, notes } : item
                ),
              },
              updatedAt: Date.now(),
            };
          }),
        })),

      deleteStrategyProfile: (id) =>
        set((state) => ({
          strategyProfiles: state.strategyProfiles.filter((p) => p.id !== id),
          activeStrategyProfileId: state.activeStrategyProfileId === id ? null : state.activeStrategyProfileId,
        })),

      archiveStrategyProfile: (id) =>
        set((state) => {
          const now = Date.now();
          return {
            strategyProfiles: state.strategyProfiles.map((p) =>
              p.id === id ? { ...p, archived: true, archivedAt: now, updatedAt: now } : p
            ),
          };
        }),

      unarchiveStrategyProfile: (id) =>
        set((state) => {
          const profile = state.strategyProfiles.find((p) => p.id === id);
          if (!profile) return state;
          const updated = { ...profile, archived: false, archivedAt: undefined, updatedAt: Date.now() };
          const rest = state.strategyProfiles.filter((p) => p.id !== id);
          return { strategyProfiles: [updated, ...rest] };
        }),

      updateProfileUserCount: (profileId, userCount) =>
        set((state) => ({
          strategyProfiles: state.strategyProfiles.map((p) =>
            p.id === profileId ? { ...p, userCount, updatedAt: Date.now() } : p
          ),
        })),

      setStageOverride: (profileId, stage) =>
        set((state) => {
          const now = Date.now();
          const profile = state.strategyProfiles.find((p) => p.id === profileId);
          if (!profile) return state;
          const context: ContextProfile = { ...profile.context, stage: stage ?? profile.context.stage, updatedAt: now };
          const plan = buildStrategicPlan(context, profileId, profile.plan);
          return {
            strategyProfiles: state.strategyProfiles.map((p) =>
              p.id === profileId
                ? { ...p, context, plan, stageOverride: stage, stageUpdatedAt: now, updatedAt: now }
                : p
            ),
          };
        }),

      setStageDisplayOnly: (profileId, stage) =>
        set((state) => {
          const now = Date.now();
          return {
            strategyProfiles: state.strategyProfiles.map((p) =>
              p.id === profileId
                ? {
                    ...p,
                    context: { ...p.context, stage, updatedAt: now },
                    stageOverride: stage,
                    stageUpdatedAt: now,
                    updatedAt: now,
                  }
                : p
            ),
          };
        }),

      addItemsFromStage: (profileId, stage) => {
        let added = 0;
        set((state) => {
          const profile = state.strategyProfiles.find((p) => p.id === profileId);
          if (!profile) return state;
          const existingIds = new Set(profile.plan.prioritizedItems.map((i) => i.id));
          const ctxForStage: ContextProfile = { ...profile.context, stage, updatedAt: profile.context.updatedAt };
          const planForStage = buildStrategicPlan(ctxForStage, profileId, undefined);
          const stageSlug = stage.replace(/-/g, '_');
          const newInstances: StrategyItemInstance[] = planForStage.prioritizedItems
            .filter((i) => !existingIds.has(i.id))
            .map((item, i) => ({
              ...item,
              instanceId: `${profileId}-${item.id}-add-${stageSlug}-${i}`,
              completed: false,
              phase: stage,
            }));
          added = newInstances.length;
          if (newInstances.length === 0) return state;
          const mergedItems = [...profile.plan.prioritizedItems, ...newInstances];
          const weeklyFocus = mergedItems.filter((i) => !i.completed).slice(0, 7);
          const riskAlerts = mergedItems.filter((i) => i.domain === 'risk' && !i.completed).slice(0, 5);
          const criticalFocusAreas = [...new Set(mergedItems.slice(0, 15).map((i) => i.domain))].slice(0, 5);
          const plan = {
            ...profile.plan,
            prioritizedItems: mergedItems,
            weeklyFocus,
            riskAlerts,
            criticalFocusAreas,
            generatedAt: Date.now(),
          };
          const completedCount = mergedItems.filter((i) => i.completed).length;
          const completionRatio = mergedItems.length > 0 ? completedCount / mergedItems.length : 0;
          return {
            strategyProfiles: state.strategyProfiles.map((p) =>
              p.id === profileId ? { ...p, plan, completionRatio, updatedAt: Date.now() } : p
            ),
          };
        });
        return added;
      },

      addNextStageToPlan: (profileId): { stage: ProductStage; added: number } | null => {
        const profile = get().strategyProfiles.find((p) => p.id === profileId);
        if (!profile) return null;
        const idx = STAGE_ORDER.indexOf(profile.context.stage);
        if (idx === -1 || idx >= STAGE_ORDER.length - 1) return null;
        const next = STAGE_ORDER[idx + 1];
        if (next === 'plateau' || next === 'pivoting') return null;
        const added = get().addItemsFromStage(profileId, next);
        return { stage: next, added };
      },

      migrateFromLegacy: (projects, checklists) => {
        const { strategyProfiles } = get();
        if (strategyProfiles.length > 0 || projects.length === 0) return;
        const migrated = migrateAllLegacyToStrategy(projects, checklists);
        set((state) => ({ strategyProfiles: [...migrated, ...state.strategyProfiles] }));
      },

      restoreFromBackup: (profiles) =>
        set((state) => {
          const ids = new Set(profiles.map((p) => p.id));
          const activeStillExists = state.activeStrategyProfileId && ids.has(state.activeStrategyProfileId);
          return {
            strategyProfiles: profiles,
            activeStrategyProfileId: activeStillExists ? state.activeStrategyProfileId : (profiles[0]?.id ?? null),
          };
        }),

      resetStrategy: () => set({ strategyProfiles: [], activeStrategyProfileId: null }),
    }),
    {
      name: STRATEGY_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
