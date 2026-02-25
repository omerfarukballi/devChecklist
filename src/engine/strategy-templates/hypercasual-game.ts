import type { StrategyTemplate } from '../../types/founderOS';

export const HYPERCASUAL_GAME: StrategyTemplate = {
  id: 'hypercasual-game',
  name: 'Hypercasual Game + Ad Scale',
  coreMetrics: [
    { name: 'CPI', description: 'Cost per install — must be ultra-low for ad-funded model', target: '< $0.30' },
    { name: 'D1 Retention', description: 'Day 1 retention rate', target: '> 35%' },
    { name: 'Play Time', description: 'Average session length and sessions per day', target: '> 6 min/session' },
    { name: 'Ad eCPM', description: 'Effective revenue per 1000 impressions', target: '> $10' },
    { name: 'LTV / CPI Ratio', description: 'Lifetime value relative to acquisition cost', target: '> 1.3' },
  ],
  primaryGrowthLever: 'Rapid creative iteration — test 10+ ad creatives per week. Kill or scale based on CPI within 48 hours.',
  mainRisk: 'Extremely short product lifecycle — most hypercasual titles peak in 2-4 weeks. Portfolio approach needed.',
  monetizationStrategy: 'Interstitial + rewarded video ads. Maximize impressions per session without destroying retention. Test ad frequency caps.',
  retentionFocus: 'Level progression pacing, difficulty curve tuning, and daily challenge systems to extend lifecycle beyond week 1.',
  distributionFocus: 'Paid UA on Meta, TikTok, and Unity Ads. App Store featuring requests. Cross-promote from existing titles if available.',
};
