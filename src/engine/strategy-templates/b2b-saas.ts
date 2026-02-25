import type { StrategyTemplate } from '../../types/founderOS';

export const B2B_SAAS: StrategyTemplate = {
  id: 'b2b-saas',
  name: 'B2B SaaS + Subscription',
  coreMetrics: [
    { name: 'MRR', description: 'Monthly recurring revenue', target: 'Growing 15%+ MoM' },
    { name: 'Churn Rate', description: 'Monthly customer churn', target: '< 5%' },
    { name: 'CAC', description: 'Customer acquisition cost', target: '< 3x monthly ARPU' },
    { name: 'LTV:CAC', description: 'Lifetime value to acquisition cost ratio', target: '> 3:1' },
    { name: 'NPS', description: 'Net promoter score — leading indicator of churn', target: '> 40' },
  ],
  primaryGrowthLever: 'Content marketing + SEO — build authority in your niche through problem-solving content. Complement with product-led growth trials.',
  mainRisk: 'Long sales cycles and high churn during early traction. Unclear product-market fit masked by low volume.',
  monetizationStrategy: 'Tiered pricing with clear value differentiation. Annual plan incentives (20% discount) to reduce churn and improve cash flow. Usage-based expansion revenue.',
  retentionFocus: 'Onboarding activation milestones, customer success touchpoints at Day 7/30/90, and usage-based health scoring to predict churn.',
  distributionFocus: 'Inbound content + SEO as primary channel. LinkedIn outbound for ICP accounts. Product Hunt and community launches for initial traction.',
};
