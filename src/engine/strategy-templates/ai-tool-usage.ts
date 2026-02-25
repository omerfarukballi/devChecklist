import type { StrategyTemplate } from '../../types/founderOS';

export const AI_TOOL_USAGE: StrategyTemplate = {
  id: 'ai-tool-usage',
  name: 'AI Tool + Usage-Based Pricing',
  coreMetrics: [
    { name: 'API Calls / User', description: 'Average usage volume per active user', target: 'Growing weekly' },
    { name: 'Revenue per API Call', description: 'Effective revenue per unit of usage', target: 'Stable or increasing' },
    { name: 'Gross Margin', description: 'Revenue minus compute/inference costs', target: '> 60%' },
    { name: 'Activation Rate', description: 'Percentage of signups making first API call', target: '> 50%' },
    { name: 'Net Revenue Retention', description: 'Existing customer revenue growth YoY', target: '> 120%' },
  ],
  primaryGrowthLever: 'Developer experience and documentation — reduce time-to-first-value. Community building around use cases and integrations.',
  mainRisk: 'Margin compression from inference costs. Commoditization risk as foundation model providers add similar features natively.',
  monetizationStrategy: 'Usage-based pricing with generous free tier for activation. Volume discounts for commitments. Premium tier with SLA, priority support, and advanced features.',
  retentionFocus: 'Integration depth — once users embed the API in their workflows, switching cost is high. Provide SDKs, webhooks, and workflow templates.',
  distributionFocus: 'Developer communities (GitHub, HackerNews, Reddit). Technical content marketing. API marketplace listings. Open-source wrapper or SDK for organic discovery.',
};
