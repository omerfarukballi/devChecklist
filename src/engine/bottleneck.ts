import type { ProductDNA, FounderState, Constraints, LifecycleStage, BottleneckType } from '../types/founderOS';
import { asDNAArray } from '../types/founderOS';

interface BottleneckInput {
  dna: ProductDNA;
  founder: FounderState;
  constraints: Constraints;
  stage: LifecycleStage;
  locale: string;
}

interface BottleneckRule {
  type: BottleneckType;
  score: (input: BottleneckInput) => number;
}

const rules: BottleneckRule[] = [
  {
    type: 'product-market-fit',
    score: ({ stage, constraints, founder }) => {
      let s = 0;
      if (stage === 'idea-validation') s += 80;
      if (stage === 'mvp-live') s += 40;
      if (constraints.distributionAccess === 'none') s += 10;
      if (founder.timeCommitment === 'side-project') s += 5;
      return s;
    },
  },
  {
    type: 'acquisition',
    score: ({ dna, stage, constraints }) => {
      let s = 0;
      if (stage === 'early-traction') s += 35;
      if (stage === 'growth-optimization') s += 25;
      if (dna.viralityPotential === 'none') s += 15;
      if (constraints.distributionAccess === 'none') s += 15;
      if (asDNAArray(dna.acquisitionChannelFit).includes('paid-ads') && constraints.budget < 500) s += 20;
      if (dna.marketType === 'b2c' && dna.scalabilityPattern === 'ads-scale') s += 10;
      return s;
    },
  },
  {
    type: 'activation',
    score: ({ dna, stage, founder }) => {
      let s = 0;
      if (stage === 'mvp-live') s += 25;
      if (stage === 'early-traction') s += 20;
      if (dna.engagementModel === 'workflow-integrated') s += 15;
      if (dna.trustRequirement === 'high') s += 15;
      if (dna.productFormat === 'api' || dna.productFormat === 'ai-tool') s += 10;
      if (founder.technicalDepth === 'low') s += 5;
      return s;
    },
  },
  {
    type: 'retention',
    score: ({ dna, stage }) => {
      let s = 0;
      if (dna.retentionComplexity === 'high') s += 25;
      if (stage === 'growth-optimization') s += 20;
      if (stage === 'scaling') s += 15;
      if (dna.engagementModel === 'one-off') s += 20;
      if (asDNAArray(dna.userIntentType).includes('entertainment')) s += 10;
      return s;
    },
  },
  {
    type: 'monetization',
    score: ({ dna, stage, constraints }) => {
      let s = 0;
      if (dna.monetizationLatency === 'long-cycle') s += 25;
      if (dna.pricingPower === 'low') s += 15;
      if (stage === 'early-traction' || stage === 'growth-optimization') s += 15;
      if (dna.revenueModel === 'ads' && dna.marketType === 'b2c') s += 10;
      if (constraints.monthlyRunway < 3) s += 15;
      return s;
    },
  },
  {
    type: 'sales-process',
    score: ({ dna, founder }) => {
      let s = 0;
      if (dna.scalabilityPattern === 'sales-driven') s += 35;
      if (dna.marketType === 'b2b' && dna.pricingPower === 'high') s += 20;
      if (asDNAArray(dna.audienceBehaviorType).includes('enterprise-buyer')) s += 15;
      if (founder.experienceLevel === 'first-time') s += 10;
      return s;
    },
  },
  {
    type: 'distribution-access',
    score: ({ dna, constraints, stage }) => {
      let s = 0;
      if (constraints.distributionAccess === 'none') s += 30;
      if (dna.viralityPotential === 'none') s += 10;
      if (asDNAArray(dna.acquisitionChannelFit).includes('community') && constraints.distributionAccess === 'none') s += 20;
      if (stage === 'mvp-live' || stage === 'early-traction') s += 10;
      return s;
    },
  },
  {
    type: 'burn-rate',
    score: ({ constraints, founder }) => {
      let s = 0;
      if (constraints.monthlyRunway <= 2) s += 50;
      else if (constraints.monthlyRunway <= 4) s += 25;
      else if (constraints.monthlyRunway <= 6) s += 10;
      if (founder.availableCapital === 'none') s += 20;
      if (constraints.teamSize > 3 && constraints.monthlyRunway < 6) s += 15;
      if (founder.timeCommitment === 'side-project' && constraints.monthlyRunway < 12) s += 5;
      return s;
    },
  },
  {
    type: 'trust-barrier',
    score: ({ dna }) => {
      let s = 0;
      if (dna.trustRequirement === 'high') s += 35;
      if (dna.regulatoryRisk === 'heavy') s += 25;
      if (dna.regulatoryRisk === 'moderate') s += 10;
      if (asDNAArray(dna.audienceBehaviorType).includes('parents')) s += 10;
      if (asDNAArray(dna.userIntentType).includes('financial')) s += 15;
      return s;
    },
  },
];

const BOTTLENECK_DESCRIPTIONS: Record<BottleneckType, Record<string, string>> = {
  'acquisition': {
    en: 'Your primary challenge is getting users to discover and try your product. Focus on channel-market fit.',
    tr: 'Birincil zorluk, kullanıcıların ürününüzü keşfetmesi ve denemesi. Kanal-pazar uyumuna odaklanın.',
  },
  'activation': {
    en: 'Users are finding you but not reaching the "aha moment." Streamline your onboarding and time-to-value.',
    tr: 'Kullanıcılar sizi buluyor ama "aha anı"na ulaşamıyor. Kullanıcı deneyiminizi ve değere ulaşma sürenizi iyileştirin.',
  },
  'retention': {
    en: 'You are acquiring users but they are not coming back. Your retention mechanics need strengthening.',
    tr: 'Kullanıcı ediniyorsunuz ama geri dönmüyorlar. Elde tutma mekanizmalarınızı güçlendirmeniz gerekiyor.',
  },
  'monetization': {
    en: 'Usage is there but revenue is lagging. Your pricing, packaging, or payment conversion needs optimization.',
    tr: 'Kullanım var ama gelir geride kalıyor. Fiyatlandırma, paketleme veya ödeme dönüşümünüzü optimize etmeniz gerekiyor.',
  },
  'sales-process': {
    en: 'Your product requires a sales motion that is not yet repeatable. Build a scalable sales playbook.',
    tr: 'Ürününüz henüz tekrarlanabilir olmayan bir satış süreci gerektiriyor. Ölçeklenebilir bir satış rehberi oluşturun.',
  },
  'product-market-fit': {
    en: 'You have not yet validated that a meaningful market wants your product. Focus on discovery and validation.',
    tr: 'Anlamlı bir pazarın ürününüzü istediğini henüz doğrulamadınız. Keşif ve doğrulamaya odaklanın.',
  },
  'distribution-access': {
    en: 'You lack access to your target audience. Build distribution channels before scaling product.',
    tr: 'Hedef kitlenize erişiminiz yok. Ürünü ölçeklendirmeden önce dağıtım kanalları oluşturun.',
  },
  'burn-rate': {
    en: 'Your spending rate is unsustainable relative to your runway. Extend runway or accelerate revenue.',
    tr: 'Harcama hızınız pist sürenize göre sürdürülemez. Pistinizi uzatın veya geliri hızlandırın.',
  },
  'trust-barrier': {
    en: 'Your target market requires high trust before adopting. Invest in credibility signals and compliance.',
    tr: 'Hedef pazarınız benimseme öncesinde yüksek güven gerektiriyor. Güvenilirlik sinyalleri ve uyumluluk yatırımı yapın.',
  },
};

export function detectBottleneck(input: BottleneckInput): { type: BottleneckType; description: string } {
  const scored = rules.map((r) => ({
    type: r.type,
    score: r.score(input),
  }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored[0];
  return {
    type: top.type,
    description: BOTTLENECK_DESCRIPTIONS[top.type][input.locale] ?? BOTTLENECK_DESCRIPTIONS[top.type]['en'],
  };
}
