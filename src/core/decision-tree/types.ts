/**
 * Decision tree types — re-export from central strategy types and add flow state.
 */
import type { ContextProfile, DecisionNode, DecisionOption, ProductStage } from '../../types/strategy';

export type { ContextProfile, DecisionNode, DecisionOption, ProductStage };

export interface DecisionTreeState {
  currentNodeId: string;
  context: Partial<ContextProfile>;
  visitedNodeIds: string[];
  injectedTags: string[];
}
