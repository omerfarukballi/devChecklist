/**
 * Strategy injection engine — filter StrategyItems by ContextProfile, stage, and injected tags.
 * Pure deterministic filtering; no AI.
 */
import type { ContextProfile, StrategyItem } from '../../types/strategy';
import { ALL_STRATEGY_ITEMS } from '../../templates';

/** Product type → tag hints so we can match template tags. Each type gets its tag + universal (common) items. */
const PRODUCT_TYPE_TAGS: Record<string, string[]> = {
  'web-app': ['web', 'post-launch', 'universal'],
  'mobile-app': ['mobile', 'post-launch', 'universal'],
  'web-mobile': ['web', 'mobile', 'post-launch', 'universal'],
  'desktop-app': ['desktop', 'post-launch', 'universal'],
  game: ['game', 'post-launch', 'universal'],
  'api-backend': ['b2b', 'post-launch', 'universal'],
  'data-product': ['data', 'b2b', 'post-launch', 'universal'],
  other: ['post-launch', 'universal'],
};

/** Stage → only items with this stage tag are shown (strong phase differentiation) */
const STAGE_TAG_BY_PHASE: Record<string, string> = {
  'pre-launch': 'stage-pre-launch',
  'just-launched': 'stage-just-launched',
  '0-100-users': 'stage-0-100',
  '100-1000-users': 'stage-100-1000',
  growth: 'stage-growth',
  scaling: 'stage-scaling',
  plateau: 'stage-plateau',
  pivoting: 'stage-pivoting',
};

/** Stage → preferred domains for weighting (used by context engine) */
export const STAGE_DOMAIN_PRIORITY: Record<string, string[]> = {
  'pre-launch': ['production', 'launch', 'risk'],
  'just-launched': ['production', 'launch', 'analytics', 'distribution'],
  '0-100-users': ['launch', 'distribution', 'growth', 'retention', 'analytics'],
  '100-1000-users': ['growth', 'retention', 'monetization', 'analytics'],
  growth: ['growth', 'retention', 'monetization', 'distribution', 'analytics'],
  scaling: ['scaling', 'production', 'risk', 'monetization'],
  plateau: ['retention', 'analytics', 'optimization', 'risk'],
  pivoting: ['analytics', 'growth', 'risk'],
};

/**
 * Tags that match "low budget" — prefer organic, avoid paid-ads unless explicitly in context.
 */
const LOW_BUDGET_TAGS = ['low-budget', 'organic'];

const PRODUCT_SPECIFIC_TAGS = new Set(['web', 'mobile', 'desktop', 'game', 'b2b', 'b2c', 'saas', 'steam', 'indie-game', 'ios', 'android', 'store', 'data', 'data-pipeline', 'data-analytics', 'data-api', 'universal']);

const STAGE_ITEM_TAGS = new Set([
  'stage-pre-launch', 'stage-just-launched', 'stage-0-100', 'stage-100-1000',
  'stage-growth', 'stage-scaling', 'stage-plateau', 'stage-pivoting',
]);

/**
 * Returns true if item should be included given context.
 * - Stage: item MUST have the stage tag for context.stage (e.g. stage-0-100 for 0-100 users).
 * - Product: item must match product type (web/mobile/data/universal).
 */
function itemMatchesContext(item: StrategyItem, context: ContextProfile): boolean {
  const stageTag = STAGE_TAG_BY_PHASE[context.stage];
  if (stageTag) {
    if (!item.tags.includes(stageTag)) return false;
  }

  const ctxTags = context.constraints ?? [];
  const productTags = PRODUCT_TYPE_TAGS[context.productType] ?? ['post-launch', 'universal'];
  const allContextTags = [...new Set([...ctxTags, ...productTags])];
  if (context.platforms?.length) {
    context.platforms.forEach((p) => allContextTags.push(p));
  } else if (context.platform) {
    allContextTags.push(context.platform);
  }
  if (context.subType) allContextTags.push(context.subType);
  if (context.monetizationModel) allContextTags.push(context.monetizationModel);

  const itemTags = item.tags;
  const hasProductTag = itemTags.some((t) => PRODUCT_SPECIFIC_TAGS.has(t));
  const matchesAnyContextTag = itemTags.some((t) => allContextTags.includes(t));
  if (hasProductTag && !matchesAnyContextTag) return false;
  if (!hasProductTag) return true;
  return matchesAnyContextTag;
}

/**
 * Filter strategy items by context. Returns items that match product type, stage hints, and injected tags.
 */
export function filterItemsByContext(context: ContextProfile): StrategyItem[] {
  return ALL_STRATEGY_ITEMS.filter(item => itemMatchesContext(item, context));
}

/**
 * Optional: exclude items that are budget-inappropriate (e.g. paid-ads when budget is none).
 */
export function applyBudgetFilter(items: StrategyItem[], context: ContextProfile): StrategyItem[] {
  const lowBudget = context.budgetRange === 'none' || context.budgetRange === 'bootstrapped' || context.budgetRange === 'low';
  if (!lowBudget) return items;
  return items.filter(item => !item.tags.includes('paid-ads') || context.constraints?.includes('paid-ads'));
}
