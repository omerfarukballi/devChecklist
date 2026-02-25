import type { StrategyTemplate } from '../../types/founderOS';

export const NICHE_HIGH_TRUST: StrategyTemplate = {
  id: 'niche-high-trust',
  name: 'Niche Consumer + High Trust Requirement',
  coreMetrics: [
    { name: 'Trust Signals', description: 'Reviews, testimonials, certifications collected', target: '> 50 verified reviews' },
    { name: 'Conversion Rate', description: 'Visitor to paid user conversion', target: '> 5%' },
    { name: 'Referral Rate', description: 'Percentage of users who refer others', target: '> 15%' },
    { name: 'CSAT', description: 'Customer satisfaction score', target: '> 4.5 / 5' },
    { name: 'Monthly Active Users', description: 'Consistent usage in niche segment', target: 'Stable or growing' },
  ],
  primaryGrowthLever: 'Community authority and social proof — become the trusted name in your niche through expertise, transparency, and user success stories.',
  mainRisk: 'Slow growth due to trust-building requirement. Small TAM limits scale ceiling. Regulatory compliance costs in sensitive verticals.',
  monetizationStrategy: 'Premium pricing justified by trust and expertise. Subscription with high-touch onboarding. Certifications or compliance features as upsell.',
  retentionFocus: 'Personal relationships and white-glove support. Community forums and expert access. Compliance and data security as retention moats.',
  distributionFocus: 'Niche communities, professional forums, and word-of-mouth. SEO for long-tail trust-related queries. Partnerships with industry authorities.',
};
