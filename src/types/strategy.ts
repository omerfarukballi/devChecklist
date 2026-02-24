/**
 * V2 Strategy System — Decision-Tree-Driven Post-Launch Product Strategy
 * Core data models for ContextProfile, Decision Tree, and Strategy Execution.
 */

export type ProductStage =
  | 'pre-launch'
  | 'just-launched'
  | '0-100-users'
  | '100-1000-users'
  | 'growth'
  | 'scaling'
  | 'plateau'
  | 'pivoting';

export type UserRange =
  | '0'
  | '1-100'
  | '101-1000'
  | '1001-10k'
  | '10k-100k'
  | '100k+';

export type BudgetRange =
  | 'none'
  | 'bootstrapped'
  | 'low'
  | 'medium'
  | 'high';

export interface ContextProfile {
  id: string;
  productType: string;
  subType?: string;
  /** Single platform (legacy); use platforms when multiple */
  platform?: string;
  /** Multiple platforms e.g. ['web', 'mobile'] for web + mobile products */
  platforms?: string[];
  monetizationModel?: string;
  stage: ProductStage;
  userCountRange?: UserRange;
  budgetRange?: BudgetRange;
  distributionModel?: string;
  growthFocus?: string[];
  constraints?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  nextNodeId?: string;
  contextMutations?: Partial<ContextProfile>;
  injectTags?: string[];
}

export interface DecisionNode {
  id: string;
  question: string;
  description?: string;
  options: DecisionOption[];
}

export type StrategyDomain =
  | 'production'
  | 'launch'
  | 'distribution'
  | 'growth'
  | 'retention'
  | 'monetization'
  | 'analytics'
  | 'scaling'
  | 'risk'
  | 'optimization';

export type StrategyPriority = 'critical' | 'high' | 'medium' | 'low';

export interface StrategyItem {
  id: string;
  title: string;
  description: string;
  actionSteps: string[];
  tags: string[];
  priority: StrategyPriority;
  domain: StrategyDomain;
}

/** Instance of a strategy item with completion state (for execution board) */
export interface StrategyItemInstance extends StrategyItem {
  instanceId: string;
  completed: boolean;
  completedAt?: number;
  notes?: string;
  /** Which phase (stage) this item belongs to — so Execution can group by phase */
  phase?: ProductStage;
}

export interface StrategicExecutionPlan {
  prioritizedItems: StrategyItemInstance[];
  criticalFocusAreas: string[];
  weeklyFocus: StrategyItemInstance[];
  riskAlerts: StrategyItemInstance[];
  generatedAt: number;
}

/** Product Strategy Profile — replaces "Project" in V2 */
export interface StrategyProfile {
  id: string;
  name: string;
  context: ContextProfile;
  plan: StrategicExecutionPlan;
  /** Completion ratio 0–1; used for stage transition suggestions */
  completionRatio: number;
  /** User-reported or inferred user count (for stage logic) */
  userCount?: number;
  /** Last time stage was updated (manually or by suggestion) */
  stageUpdatedAt: number;
  /** Manual stage override; if set, auto-suggestions are not applied */
  stageOverride?: ProductStage;
  createdAt: number;
  updatedAt: number;
  archived?: boolean;
  archivedAt?: number;
}
