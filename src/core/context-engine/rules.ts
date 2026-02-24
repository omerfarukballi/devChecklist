/**
 * Context engine — rule-based engine: ContextProfile → StrategicExecutionPlan.
 * Rules: stage determines domain weight; budget affects paid vs organic; user count affects retention vs acquisition.
 */

import type {
  ContextProfile,
  StrategicExecutionPlan,
  StrategyItem,
  StrategyItemInstance,
} from '../../types/strategy';
import { filterItemsByContext, applyBudgetFilter, STAGE_DOMAIN_PRIORITY } from '../strategy-engine';

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Stable instance id for persistence and merging completed state on regenerate */
function toInstance(item: StrategyItem, index: number, profileId: string): StrategyItemInstance {
  return {
    ...item,
    instanceId: `${profileId}-${item.id}-${index}`,
    completed: false,
  };
}

/**
 * Score item for ordering: higher = more important.
 * - Domain weight by stage: first domain in domainOrder gets highest score.
 * - Priority (critical > high > medium > low).
 * - growthFocus: boost matching domains (acquisition → growth/distribution, retention → retention, etc.).
 */
function scoreItem(
  item: StrategyItem,
  context: ContextProfile,
  domainOrder: string[]
): number {
  const order = Array.isArray(domainOrder) ? domainOrder : [];
  const domain = item?.domain ?? 'optimization';
  const domainRank = order.indexOf(domain);
  const domainScore = domainRank === -1 ? 0 : (order.length - domainRank);
  const priorityScore = 10 * (4 - (PRIORITY_ORDER[item?.priority ?? 'medium'] ?? 2));
  const growthBoost = context.growthFocus?.some(
    focus =>
      focus === domain ||
      (focus === 'production' && domain === 'production') ||
      (focus === 'acquisition' && (domain === 'growth' || domain === 'distribution'))
  )
    ? 50
    : 0;
  return domainScore * 10 + priorityScore + growthBoost;
}

/**
 * Build StrategicExecutionPlan from ContextProfile.
 * 1. Filter items by context (and budget).
 * 2. Sort by stage-based domain weight + priority + growthFocus.
 * 3. Dedupe by item id (keep first).
 * 4. Build instances; merge completed state from existing plan when regenerating.
 * 5. Set criticalFocusAreas, weeklyFocus (top 7), riskAlerts (risk domain).
 */
export function buildStrategicPlan(
  context: ContextProfile,
  profileId: string,
  existingPlan?: StrategicExecutionPlan
): StrategicExecutionPlan {
  const now = Date.now();
  let items = filterItemsByContext(context);
  items = applyBudgetFilter(items, context);

  const defaultOrder = [
    'production', 'launch', 'growth', 'retention', 'monetization', 'analytics', 'scaling', 'risk', 'optimization', 'distribution',
  ];
  const domainOrder = Array.isArray(STAGE_DOMAIN_PRIORITY[context?.stage]) ? STAGE_DOMAIN_PRIORITY[context.stage] : defaultOrder;

  items = items.filter((i): i is StrategyItem => i != null && typeof i.domain === 'string');
  items.sort((a, b) => scoreItem(b, context, domainOrder) - scoreItem(a, context, domainOrder));

  const seen = new Set<string>();
  const deduped: StrategyItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    deduped.push(item);
  }

  const completedByItemId = new Map<string, { completed: boolean; completedAt?: number; notes?: string }>();
  if (existingPlan?.prioritizedItems) {
    for (const inst of existingPlan.prioritizedItems) {
      if (inst.completed) {
        completedByItemId.set(inst.id, {
          completed: true,
          completedAt: inst.completedAt,
          notes: inst.notes,
        });
      }
    }
  }

  const instances: StrategyItemInstance[] = deduped.map((item, i) => {
    const inst = toInstance(item, i, profileId);
    const existing = completedByItemId.get(item.id);
    const withPhase = { ...inst, phase: context.stage };
    if (existing) {
      return { ...withPhase, completed: existing.completed, completedAt: existing.completedAt, notes: existing.notes };
    }
    return withPhase;
  });

  const criticalFocusAreas = [...new Set(instances.slice(0, 15).map(i => i.domain))].slice(0, 5);
  const weeklyFocus = instances.filter(i => !i.completed).slice(0, 7);
  const riskAlerts = instances.filter(i => i.domain === 'risk' && !i.completed).slice(0, 5);

  return {
    prioritizedItems: instances,
    criticalFocusAreas,
    weeklyFocus,
    riskAlerts,
    generatedAt: now,
  };
}
