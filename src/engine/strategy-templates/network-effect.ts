import type { StrategyTemplate } from '../../types/founderOS';

export const NETWORK_EFFECT: StrategyTemplate = {
  id: 'network-effect',
  name: 'Network Effect Product',
  coreMetrics: [
    { name: 'Network Density', description: 'Connections per user or usage overlap ratio', target: 'Increasing weekly' },
    { name: 'Liquidity', description: 'Match rate or fulfillment rate on the platform', target: '> 70%' },
    { name: 'Time to Value', description: 'How quickly new users experience network benefit', target: '< 24 hours' },
    { name: 'DAU/MAU', description: 'Daily to monthly active user ratio (stickiness)', target: '> 40%' },
    { name: 'Organic Acquisition %', description: 'Percentage of users acquired through network effects', target: '> 50%' },
  ],
  primaryGrowthLever: 'Concentrated launch strategy — dominate one geography, niche, or use case before expanding. Solve chicken-and-egg with single-player utility.',
  mainRisk: 'Cold start problem — product is useless without critical mass. Multi-homing risk where users use competitors simultaneously.',
  monetizationStrategy: 'Take rate on transactions or freemium with premium features. Delay aggressive monetization until network effects are strong. Marketplace fees scale with volume.',
  retentionFocus: 'Network lock-in through social graph, reputation systems, and accumulated data. Make the product more valuable as usage grows.',
  distributionFocus: 'Geographic or vertical concentration. Invite-only or waitlist mechanics for exclusivity. Referral incentives that benefit both sides of the network.',
};
