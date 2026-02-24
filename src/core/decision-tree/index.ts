/**
 * Decision tree — adaptive question flow that builds ContextProfile.
 */
export { DECISION_TREE, ROOT_NODE_ID, END_NODE_ID } from './nodes';
export type { DecisionTreeState, ContextProfile, DecisionNode, DecisionOption, ProductStage } from './types';

import type { ContextProfile, ProductStage } from '../../types/strategy';
import { DECISION_TREE, END_NODE_ID } from './nodes';

/**
 * Build a full ContextProfile from decision tree state (partial context + injected tags).
 * Call when user reaches "end" node. id, createdAt, updatedAt are set by caller.
 */
export function buildContextFromTree(
  partial: Partial<ContextProfile> & { stage: ProductStage },
  injectedTags: string[],
  id: string,
  now: number = Date.now()
): ContextProfile {
  return {
    id,
    productType: partial.productType ?? 'other',
    subType: partial.subType,
    platform: partial.platform,
    platforms: partial.platforms,
    monetizationModel: partial.monetizationModel,
    stage: partial.stage,
    userCountRange: partial.userCountRange,
    budgetRange: partial.budgetRange,
    distributionModel: partial.distributionModel,
    growthFocus: partial.growthFocus?.length ? partial.growthFocus : undefined,
    constraints: injectedTags.length ? injectedTags : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get next node after an option selection. Returns null if flow ended.
 */
export function getNextNode(currentNodeId: string, selectedOptionId: string): string | null {
  const node = DECISION_TREE[currentNodeId];
  if (!node) return null;
  const option = node.options.find((o) => o.id === selectedOptionId);
  if (!option?.nextNodeId) return null;
  return option.nextNodeId === END_NODE_ID ? null : option.nextNodeId;
}

/**
 * Get context mutations and inject tags for an option.
 */
export function getOptionEffect(currentNodeId: string, selectedOptionId: string): {
  contextMutations: Partial<ContextProfile>;
  injectTags: string[];
} {
  const node = DECISION_TREE[currentNodeId];
  const option = node?.options.find((o) => o.id === selectedOptionId);
  return {
    contextMutations: option?.contextMutations ?? {},
    injectTags: option?.injectTags ?? [],
  };
}
