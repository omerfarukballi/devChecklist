/**
 * Optimization — conversion, experimentation, and analytics.
 * Tags: optimization, analytics, growth
 */
import type { StrategyItem } from '../types/strategy';

export const OPTIMIZATION_ITEMS: StrategyItem[] = [
  {
    id: 'opt-conversion-funnel',
    title: 'Conversion funnel',
    description: 'Measure drop-off from visit → signup → activation → paid.',
    actionSteps: ['Define funnel steps', 'Track each step', 'Find biggest drop-off'],
    tags: ['optimization', 'analytics', 'growth', 'universal', 'stage-100-1000'],
    priority: 'high',
    domain: 'analytics',
  },
  {
    id: 'opt-ab-tests',
    title: 'A/B testing',
    description: 'Test one change at a time on signup or key flow.',
    actionSteps: ['Pick one metric', 'Run single test', 'Ship winner'],
    tags: ['optimization', 'analytics', 'growth', 'universal', 'stage-growth'],
    priority: 'medium',
    domain: 'optimization',
  },
  {
    id: 'opt-feedback-loops',
    title: 'User feedback loops',
    description: 'Collect and act on feedback systematically.',
    actionSteps: ['Add in-app feedback', 'Review weekly', 'Close loop with users'],
    tags: ['optimization', 'retention', 'universal', 'stage-plateau'],
    priority: 'medium',
    domain: 'optimization',
  },
];
