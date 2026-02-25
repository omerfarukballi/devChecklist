// ─── Product DNA ───────────────────────────────────────────────

export type ProductFormat =
  | 'mobile-app' | 'web-app' | 'game' | 'saas'
  | 'ai-tool' | 'extension' | 'desktop' | 'api';

export type Platform =
  | 'ios' | 'android' | 'web' | 'multi-platform';

export type RevenueModel =
  | 'ads' | 'subscription' | 'freemium' | 'one-time'
  | 'enterprise' | 'iap' | 'usage-based';

export type MarketType = 'b2c' | 'b2b' | 'b2b2c';

export type PricingPower = 'low' | 'medium' | 'high';

export type UserIntentType =
  | 'entertainment' | 'utility' | 'productivity'
  | 'financial' | 'social' | 'educational'
  | 'health' | 'communication' | 'creative' | 'shopping';

export type EngagementModel =
  | 'one-off' | 'session-based' | 'daily-habit' | 'workflow-integrated';

export type RetentionComplexity = 'low' | 'medium' | 'high';

export type AcquisitionChannelFit =
  | 'paid-ads' | 'content' | 'community' | 'outbound'
  | 'app-store' | 'viral';

export type ViralityPotential =
  | 'none' | 'loop-based' | 'social-driven' | 'ugc-driven';

export type TrustRequirement = 'low' | 'medium' | 'high';

export type RegulatoryRisk = 'none' | 'moderate' | 'heavy';

export type AudienceBehaviorType =
  | 'mass-consumer' | 'niche-consumer' | 'professional'
  | 'enterprise-buyer' | 'parents' | 'students'
  | 'gamers' | 'developers' | 'creators' | 'freelancers'
  | 'small-business' | 'healthcare-workers';

export type MonetizationLatency = 'instant' | 'short-cycle' | 'long-cycle';

export type ScalabilityPattern =
  | 'linear' | 'network-effect' | 'content-driven'
  | 'ads-scale' | 'sales-driven';

export interface ProductDNA {
  productFormat: ProductFormat;
  platform: Platform;
  revenueModel: RevenueModel;
  marketType: MarketType;
  pricingPower: PricingPower;
  userIntentType: UserIntentType;
  engagementModel: EngagementModel;
  retentionComplexity: RetentionComplexity;
  acquisitionChannelFit: AcquisitionChannelFit;
  viralityPotential: ViralityPotential;
  trustRequirement: TrustRequirement;
  regulatoryRisk: RegulatoryRisk;
  audienceBehaviorType: AudienceBehaviorType;
  monetizationLatency: MonetizationLatency;
  scalabilityPattern: ScalabilityPattern;
}

// ─── Founder State ─────────────────────────────────────────────

export type ExperienceLevel = 'first-time' | 'indie-hacker' | 'experienced-founder';
export type AvailableCapital = 'none' | 'limited' | 'funded';
export type TimeCommitment = 'side-project' | 'full-time';
export type TechnicalDepth = 'low' | 'medium' | 'high';
export type RiskTolerance = 'low' | 'medium' | 'high';

export interface FounderState {
  experienceLevel: ExperienceLevel;
  availableCapital: AvailableCapital;
  timeCommitment: TimeCommitment;
  technicalDepth: TechnicalDepth;
  riskTolerance: RiskTolerance;
}

// ─── Constraints ───────────────────────────────────────────────

export type DistributionAccess = 'none' | 'small-audience' | 'large-audience';

export interface Constraints {
  budget: number;
  monthlyRunway: number;
  teamSize: number;
  distributionAccess: DistributionAccess;
}

// ─── Lifecycle Stage ───────────────────────────────────────────

export type LifecycleStage =
  | 'idea-validation'
  | 'mvp-live'
  | 'early-traction'
  | 'growth-optimization'
  | 'scaling';

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  'idea-validation',
  'mvp-live',
  'early-traction',
  'growth-optimization',
  'scaling',
];

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, Record<string, string>> = {
  'idea-validation': { en: 'Idea Validation', tr: 'Fikir Doğrulama' },
  'mvp-live': { en: 'MVP Live', tr: 'MVP Yayında' },
  'early-traction': { en: 'Early Traction', tr: 'Erken Çekiş' },
  'growth-optimization': { en: 'Growth Optimization', tr: 'Büyüme Optimizasyonu' },
  'scaling': { en: 'Scaling', tr: 'Ölçeklendirme' },
};

// ─── Bottleneck Types ──────────────────────────────────────────

export type BottleneckType =
  | 'acquisition'
  | 'activation'
  | 'retention'
  | 'monetization'
  | 'sales-process'
  | 'product-market-fit'
  | 'distribution-access'
  | 'burn-rate'
  | 'trust-barrier';

export const BOTTLENECK_LABELS: Record<BottleneckType, Record<string, string>> = {
  'acquisition': { en: 'Acquisition', tr: 'Kullanıcı Edinme' },
  'activation': { en: 'Activation', tr: 'Aktivasyon' },
  'retention': { en: 'Retention', tr: 'Elde Tutma' },
  'monetization': { en: 'Monetization', tr: 'Gelir Elde Etme' },
  'sales-process': { en: 'Sales Process', tr: 'Satış Süreci' },
  'product-market-fit': { en: 'Product-Market Fit', tr: 'Ürün-Pazar Uyumu' },
  'distribution-access': { en: 'Distribution Access', tr: 'Dağıtım Erişimi' },
  'burn-rate': { en: 'Burn Rate', tr: 'Yakma Oranı' },
  'trust-barrier': { en: 'Trust Barrier', tr: 'Güven Engeli' },
};

// ─── Risk Categories ───────────────────────────────────────────

export type RiskCategory = 'low' | 'moderate' | 'high' | 'critical';

// ─── Strategic Output ──────────────────────────────────────────

export interface StrategicAction {
  title: string;
  description: string;
  steps: string[];
}

export interface CoreMetric {
  name: string;
  description: string;
  target?: string;
}

export interface StrategicOutput {
  primaryBottleneck: BottleneckType;
  bottleneckDescription: string;
  riskScore: number;
  riskCategory: RiskCategory;
  immediateActions: [StrategicAction, StrategicAction, StrategicAction];
  longTermFocus: StrategicAction;
  criticalRiskWarning: string;
  coreMetrics: CoreMetric[];
  distributionPriority: string;
  distributionDescription: string;
  monetizationStrategy: string;
  monetizationDescription: string;
}

// ─── Strategy Template ─────────────────────────────────────────

export interface StrategyTemplate {
  id: string;
  name: string;
  coreMetrics: CoreMetric[];
  primaryGrowthLever: string;
  mainRisk: string;
  monetizationStrategy: string;
  retentionFocus: string;
  distributionFocus: string;
}

// ─── Founder OS Profile ────────────────────────────────────────

export interface FounderOSProfile {
  id: string;
  name: string;
  productDNA: ProductDNA;
  founderState: FounderState;
  constraints: Constraints;
  stage: LifecycleStage;
  strategicOutput: StrategicOutput;
  /** Keys are "actionIdx-stepIdx" (e.g. "0-2"), true means completed */
  taskCompletions: Record<string, boolean>;
  createdAt: number;
  updatedAt: number;
}

/** Extracts all steps from immediate actions + long-term focus as a flat task list */
export function extractTasks(output: StrategicOutput): { id: string; text: string; actionTitle: string; actionIdx: number; stepIdx: number }[] {
  const tasks: { id: string; text: string; actionTitle: string; actionIdx: number; stepIdx: number }[] = [];
  output.immediateActions.forEach((action, ai) => {
    action.steps.forEach((step, si) => {
      tasks.push({ id: `${ai}-${si}`, text: step, actionTitle: action.title, actionIdx: ai, stepIdx: si });
    });
  });
  output.longTermFocus.steps.forEach((step, si) => {
    tasks.push({ id: `ltf-${si}`, text: step, actionTitle: output.longTermFocus.title, actionIdx: -1, stepIdx: si });
  });
  return tasks;
}
