import type { ProductDNA, FounderState, Constraints, RiskCategory } from '../types/founderOS';
import { asDNAArray } from '../types/founderOS';

interface RiskInput {
  dna: ProductDNA;
  founder: FounderState;
  constraints: Constraints;
  locale: string;
}

interface RiskFactor {
  name: string;
  weight: number;
  score: (input: RiskInput) => number;
}

const FACTORS: RiskFactor[] = [
  {
    name: 'Regulatory Risk',
    weight: 0.18,
    score: ({ dna }) => {
      if (dna.regulatoryRisk === 'heavy') return 90;
      if (dna.regulatoryRisk === 'moderate') return 45;
      return 5;
    },
  },
  {
    name: 'Monetization Latency',
    weight: 0.15,
    score: ({ dna }) => {
      if (dna.monetizationLatency === 'long-cycle') return 80;
      if (dna.monetizationLatency === 'short-cycle') return 35;
      return 10;
    },
  },
  {
    name: 'Capital Adequacy',
    weight: 0.18,
    score: ({ founder, constraints }) => {
      let s = 0;
      if (founder.availableCapital === 'none') s += 70;
      else if (founder.availableCapital === 'limited') s += 35;
      else s += 5;
      if (constraints.monthlyRunway <= 2) s += 25;
      else if (constraints.monthlyRunway <= 6) s += 10;
      return Math.min(s, 100);
    },
  },
  {
    name: 'Burn Rate',
    weight: 0.15,
    score: ({ constraints }) => {
      if (constraints.monthlyRunway <= 2) return 95;
      if (constraints.monthlyRunway <= 4) return 65;
      if (constraints.monthlyRunway <= 6) return 40;
      if (constraints.monthlyRunway <= 12) return 20;
      return 5;
    },
  },
  {
    name: 'Market Complexity',
    weight: 0.12,
    score: ({ dna }) => {
      let s = 0;
      if (dna.marketType === 'b2b') s += 20;
      if (asDNAArray(dna.audienceBehaviorType).includes('enterprise-buyer')) s += 25;
      if (dna.trustRequirement === 'high') s += 20;
      if (dna.scalabilityPattern === 'sales-driven') s += 15;
      return Math.min(s, 100);
    },
  },
  {
    name: 'Pricing Weakness',
    weight: 0.10,
    score: ({ dna }) => {
      if (dna.pricingPower === 'low') return 70;
      if (dna.pricingPower === 'medium') return 30;
      return 5;
    },
  },
  {
    name: 'Retention Difficulty',
    weight: 0.12,
    score: ({ dna }) => {
      let s = 0;
      if (dna.retentionComplexity === 'high') s += 55;
      else if (dna.retentionComplexity === 'medium') s += 25;
      if (dna.engagementModel === 'one-off') s += 30;
      else if (dna.engagementModel === 'session-based') s += 10;
      return Math.min(s, 100);
    },
  },
];

function categorize(score: number): RiskCategory {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'moderate';
  return 'low';
}

function buildWarning(score: number, category: RiskCategory, input: RiskInput): string {
  const isEn = input.locale !== 'tr';
  const warnings: string[] = [];

  if (input.constraints.monthlyRunway <= 3) {
    warnings.push(isEn
      ? `Runway is critically low (${input.constraints.monthlyRunway} months). Prioritize revenue or fundraising immediately.`
      : `Pist kritik derecede düşük (${input.constraints.monthlyRunway} ay). Gelir veya yatırım toplamayı hemen önceliklendirin.`);
  }
  if (input.dna.regulatoryRisk === 'heavy') {
    warnings.push(isEn
      ? 'Heavy regulatory environment increases compliance costs and slows iteration speed.'
      : 'Ağır düzenleyici ortam uyumluluk maliyetlerini artırır ve yenilenme hızını yavaşlatır.');
  }
  if (input.dna.monetizationLatency === 'long-cycle' && input.founder.availableCapital === 'none') {
    warnings.push(isEn
      ? 'Long monetization cycle with no capital is unsustainable. Revenue will take time but runway will not wait.'
      : 'Sermayesiz uzun monetizasyon döngüsü sürdürülemez. Gelir zaman alacak ama pist beklemeyecek.');
  }
  if (input.dna.pricingPower === 'low' && input.dna.retentionComplexity === 'high') {
    warnings.push(isEn
      ? 'Low pricing power combined with high retention complexity creates a value capture gap.'
      : 'Düşük fiyatlama gücü ile yüksek elde tutma karmaşıklığı bir değer yakalama açığı oluşturur.');
  }
  if (input.founder.experienceLevel === 'first-time' && category === 'critical') {
    warnings.push(isEn
      ? 'First-time founder with critical risk profile — seek mentorship and consider de-risking the business model.'
      : 'Kritik risk profiline sahip ilk kez girişimci — mentorluk arayın ve iş modelini risksizleştirmeyi düşünün.');
  }

  if (warnings.length === 0) {
    if (category === 'critical') return isEn ? 'Multiple high-severity risk factors detected. Review constraints and business model urgently.' : 'Birden fazla yüksek şiddetli risk faktörü tespit edildi. Kısıtları ve iş modelini acilen gözden geçirin.';
    if (category === 'high') return isEn ? 'Elevated risk profile. Monitor burn rate and validate assumptions before scaling.' : 'Yüksek risk profili. Ölçeklendirmeden önce yakma oranını izleyin ve varsayımları doğrulayın.';
    if (category === 'moderate') return isEn ? 'Moderate risk level. Stay disciplined on spending and validate key metrics.' : 'Orta risk seviyesi. Harcamalarda disiplinli olun ve temel metrikleri doğrulayın.';
    return isEn ? 'Risk profile is manageable. Continue executing with standard monitoring.' : 'Risk profili yönetilebilir. Standart izleme ile uygulamaya devam edin.';
  }

  return warnings[0];
}

export function calculateRiskScore(input: RiskInput): {
  score: number;
  category: RiskCategory;
  warning: string;
} {
  let weighted = 0;
  for (const factor of FACTORS) {
    weighted += factor.weight * factor.score(input);
  }

  const score = Math.round(Math.min(Math.max(weighted, 0), 100));
  const category = categorize(score);
  const warning = buildWarning(score, category, input);

  return { score, category, warning };
}
