import type { StrategyTemplate } from '../../types/founderOS';

export const ENTERPRISE_SALES: StrategyTemplate = {
  id: 'enterprise-sales',
  name: 'Enterprise Sales Product',
  coreMetrics: [
    { name: 'Sales Cycle Length', description: 'Average time from first contact to closed deal', target: '< 90 days' },
    { name: 'ACV', description: 'Average contract value', target: '> $25K' },
    { name: 'Pipeline Coverage', description: 'Pipeline value vs. quota ratio', target: '> 3x' },
    { name: 'Win Rate', description: 'Percentage of qualified opportunities won', target: '> 25%' },
    { name: 'Logo Retention', description: 'Annual customer logo retention', target: '> 90%' },
  ],
  primaryGrowthLever: 'Outbound sales process optimization — build repeatable playbook with ICP targeting, multi-threading, and champion enablement.',
  mainRisk: 'Long monetization latency and high dependency on founder-led sales. Difficult to scale without dedicated sales hires.',
  monetizationStrategy: 'Annual contracts with upfront payment. Land-and-expand with departmental entry point. Professional services layer for implementation revenue.',
  retentionFocus: 'Dedicated customer success managers, quarterly business reviews, and expansion playbooks to grow accounts 20%+ annually.',
  distributionFocus: 'Outbound prospecting to ICP accounts via LinkedIn + email sequences. Industry events and analyst relations. Partner channel development.',
};
