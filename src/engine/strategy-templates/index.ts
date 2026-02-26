import type { ProductDNA, StrategyTemplate } from '../../types/founderOS';
import { asDNAArray } from '../../types/founderOS';
import { B2C_ADS_VIRAL } from './b2c-ads-viral';
import { HYPERCASUAL_GAME } from './hypercasual-game';
import { B2B_SAAS } from './b2b-saas';
import { ENTERPRISE_SALES } from './enterprise-sales';
import { AI_TOOL_USAGE } from './ai-tool-usage';
import { NICHE_HIGH_TRUST } from './niche-high-trust';
import { NETWORK_EFFECT } from './network-effect';
import { CONTENT_DRIVEN } from './content-driven';

export const ALL_TEMPLATES: StrategyTemplate[] = [
  B2C_ADS_VIRAL,
  HYPERCASUAL_GAME,
  B2B_SAAS,
  ENTERPRISE_SALES,
  AI_TOOL_USAGE,
  NICHE_HIGH_TRUST,
  NETWORK_EFFECT,
  CONTENT_DRIVEN,
];

interface TemplateScore {
  template: StrategyTemplate;
  score: number;
}

/**
 * Match the best-fitting strategy template based on ProductDNA.
 * Uses weighted scoring across multiple DNA dimensions.
 * Returns the best match and the sorted list for composability.
 */
export function matchTemplate(dna: ProductDNA): { best: StrategyTemplate; ranked: StrategyTemplate[] } {
  const scored: TemplateScore[] = ALL_TEMPLATES.map((t) => ({
    template: t,
    score: scoreTemplate(t, dna),
  }));

  scored.sort((a, b) => b.score - a.score);

  return {
    best: scored[0].template,
    ranked: scored.map((s) => s.template),
  };
}

function scoreTemplate(t: StrategyTemplate, dna: ProductDNA): number {
  let score = 0;
  const audiences = asDNAArray(dna.audienceBehaviorType);
  const intents = asDNAArray(dna.userIntentType);

  switch (t.id) {
    case 'b2c-ads-viral':
      if (dna.marketType === 'b2c') score += 30;
      if (dna.revenueModel === 'ads') score += 30;
      if (dna.viralityPotential !== 'none') score += 20;
      if (audiences.includes('mass-consumer')) score += 10;
      if (dna.scalabilityPattern === 'ads-scale') score += 10;
      break;

    case 'hypercasual-game':
      if (dna.productFormat === 'game') score += 40;
      if (dna.revenueModel === 'ads') score += 20;
      if (dna.engagementModel === 'session-based') score += 15;
      if (intents.includes('entertainment')) score += 15;
      if (audiences.includes('gamers')) score += 10;
      break;

    case 'b2b-saas':
      if (dna.marketType === 'b2b') score += 25;
      if (dna.revenueModel === 'subscription') score += 25;
      if (dna.productFormat === 'saas' || dna.productFormat === 'web-app') score += 20;
      if (dna.engagementModel === 'workflow-integrated') score += 15;
      if (audiences.includes('professional')) score += 10;
      if (dna.scalabilityPattern !== 'sales-driven') score += 5;
      break;

    case 'enterprise-sales':
      if (dna.marketType === 'b2b') score += 20;
      if (dna.pricingPower === 'high') score += 20;
      if (dna.scalabilityPattern === 'sales-driven') score += 25;
      if (audiences.includes('enterprise-buyer')) score += 20;
      if (dna.monetizationLatency === 'long-cycle') score += 15;
      break;

    case 'ai-tool-usage':
      if (dna.productFormat === 'ai-tool') score += 35;
      if (dna.revenueModel === 'usage-based') score += 25;
      if (dna.productFormat === 'api') score += 15;
      if (audiences.includes('developers')) score += 15;
      if (intents.includes('productivity')) score += 10;
      break;

    case 'niche-high-trust':
      if (dna.trustRequirement === 'high') score += 35;
      if (audiences.includes('niche-consumer')) score += 25;
      if (dna.regulatoryRisk !== 'none') score += 15;
      if (dna.viralityPotential === 'none') score += 10;
      if (dna.pricingPower === 'high') score += 15;
      break;

    case 'network-effect':
      if (dna.scalabilityPattern === 'network-effect') score += 40;
      if (dna.viralityPotential !== 'none') score += 15;
      if (intents.includes('social')) score += 15;
      if (dna.engagementModel === 'daily-habit') score += 15;
      if (dna.marketType === 'b2c' || dna.marketType === 'b2b2c') score += 15;
      break;

    case 'content-driven':
      if (dna.scalabilityPattern === 'content-driven') score += 35;
      if (intents.includes('entertainment') || intents.includes('educational')) score += 20;
      if (dna.engagementModel === 'session-based' || dna.engagementModel === 'daily-habit') score += 15;
      if (dna.revenueModel === 'ads' || dna.revenueModel === 'freemium') score += 15;
      if (dna.viralityPotential === 'ugc-driven') score += 15;
      break;
  }

  return score;
}

export {
  B2C_ADS_VIRAL,
  HYPERCASUAL_GAME,
  B2B_SAAS,
  ENTERPRISE_SALES,
  AI_TOOL_USAGE,
  NICHE_HIGH_TRUST,
  NETWORK_EFFECT,
  CONTENT_DRIVEN,
};
