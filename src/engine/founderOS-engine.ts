import type {
  ProductDNA,
  FounderState,
  Constraints,
  LifecycleStage,
  StrategicOutput,
} from '../types/founderOS';
import { detectBottleneck } from './bottleneck';
import { calculateRiskScore } from './risk-scorer';
import { matchStrategy } from './strategy-matcher';

export interface EngineInput {
  dna: ProductDNA;
  founder: FounderState;
  constraints: Constraints;
  stage: LifecycleStage;
  locale: string;
}

/**
 * Deterministic decision engine.
 * Takes 4 structured inputs and produces a complete StrategicOutput.
 * No LLM, no AI, no network calls. Pure rule-based logic.
 */
export function computeStrategicOutput(input: EngineInput): StrategicOutput {
  const { dna, founder, constraints, stage, locale } = input;

  const bottleneck = detectBottleneck({ dna, founder, constraints, stage, locale });
  const risk = calculateRiskScore({ dna, founder, constraints, locale });
  const strategy = matchStrategy({
    dna,
    founder,
    constraints,
    stage,
    bottleneck: bottleneck.type,
    locale,
  });

  // Adjust risk based on founder context
  let adjustedRiskScore = risk.score;
  if (founder.riskTolerance === 'low' && risk.score < 50) {
    adjustedRiskScore = Math.min(risk.score + 10, 100);
  }
  if (founder.experienceLevel === 'first-time') {
    adjustedRiskScore = Math.min(adjustedRiskScore + 5, 100);
  }

  const finalCategory =
    adjustedRiskScore >= 75 ? 'critical' :
    adjustedRiskScore >= 50 ? 'high' :
    adjustedRiskScore >= 30 ? 'moderate' : 'low';

  return {
    primaryBottleneck: bottleneck.type,
    bottleneckDescription: bottleneck.description,
    riskScore: adjustedRiskScore,
    riskCategory: finalCategory,
    immediateActions: strategy.immediateActions,
    longTermFocus: strategy.longTermFocus,
    criticalRiskWarning: risk.warning,
    coreMetrics: strategy.coreMetrics,
    distributionPriority: strategy.distributionPriority,
    distributionDescription: strategy.distributionDescription,
    monetizationStrategy: strategy.monetizationStrategy,
    monetizationDescription: strategy.monetizationDescription,
  };
}
