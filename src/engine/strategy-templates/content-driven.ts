import type { StrategyTemplate } from '../../types/founderOS';

export const CONTENT_DRIVEN: StrategyTemplate = {
  id: 'content-driven',
  name: 'Content-Driven Product',
  coreMetrics: [
    { name: 'Content Volume', description: 'New content pieces created per period', target: 'Growing weekly' },
    { name: 'Engagement Rate', description: 'Likes, comments, shares per content piece', target: '> 5%' },
    { name: 'SEO Traffic', description: 'Organic search traffic volume', target: 'Growing 20%+ MoM' },
    { name: 'Creator Retention', description: 'Monthly active creator retention', target: '> 60%' },
    { name: 'Time on Platform', description: 'Average session duration', target: '> 8 minutes' },
  ],
  primaryGrowthLever: 'SEO and content flywheel — user-generated or editorial content drives organic traffic, which drives more users, which drives more content.',
  mainRisk: 'Content quality dilution at scale. Platform dependency if distribution relies on social algorithms. Creator churn if monetization path is unclear.',
  monetizationStrategy: 'Advertising revenue from content consumption. Premium subscriptions for ad-free or exclusive content. Creator monetization tools with platform take rate.',
  retentionFocus: 'Personalized content feed and recommendations. Creator tools and analytics to keep producers engaged. Notification optimization for content updates.',
  distributionFocus: 'SEO as primary channel. Social sharing mechanics built into content consumption. Creator-driven distribution through their own audiences.',
};
