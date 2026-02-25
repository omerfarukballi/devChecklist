import type { StrategyTemplate } from '../../types/founderOS';

export const B2C_ADS_VIRAL: StrategyTemplate = {
  id: 'b2c-ads-viral',
  name: 'B2C + Ads + High Virality',
  coreMetrics: [
    { name: 'CPI', description: 'Cost per install — keep below LTV threshold', target: '< $0.50' },
    { name: 'D1 Retention', description: 'Day 1 retention rate', target: '> 40%' },
    { name: 'D7 Retention', description: 'Day 7 retention rate', target: '> 20%' },
    { name: 'K-Factor', description: 'Viral coefficient — invites × conversion', target: '> 0.6' },
    { name: 'ARPDAU', description: 'Average revenue per daily active user', target: 'Trending up' },
  ],
  primaryGrowthLever: 'Creative testing at scale — iterate ad creatives weekly, optimize for lowest CPI with highest D1 retention cohort.',
  mainRisk: 'Low monetization depth — ad revenue per user is thin; requires massive volume to sustain. CPMs fluctuate seasonally.',
  monetizationStrategy: 'Maximize ad impressions per session through interstitial placement optimization. Layer rewarded video for power users. Test subscription upsell for ad-free experience.',
  retentionFocus: 'Push notification loops, streak mechanics, and social comparison features to drive daily return visits.',
  distributionFocus: 'Paid acquisition via Meta/TikTok with viral loop amplification. Optimize creatives for hook rate in first 3 seconds.',
};
