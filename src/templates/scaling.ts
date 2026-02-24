/**
 * Scaling — performance, infra, and operational maturity.
 * Tags: scaling, production, risk, b2b
 */
import type { StrategyItem } from '../types/strategy';

export const SCALING_ITEMS: StrategyItem[] = [
  {
    id: 'scale-reliability',
    title: 'Reliability and uptime',
    description: 'Minimize downtime; add redundancy where it matters.',
    actionSteps: ['Set uptime target', 'Add health checks', 'Document runbooks'],
    tags: ['scaling', 'production', 'risk', 'universal', 'stage-scaling'],
    priority: 'critical',
    domain: 'scaling',
  },
  {
    id: 'scale-performance',
    title: 'Performance under load',
    description: 'Ensure core flows stay fast as usage grows.',
    actionSteps: ['Define latency targets', 'Load test critical paths', 'Add caching if needed'],
    tags: ['scaling', 'production', 'universal', 'stage-scaling'],
    priority: 'high',
    domain: 'scaling',
  },
  {
    id: 'scale-cost-monitor',
    title: 'Cost monitoring',
    description: 'Track infra and tooling cost; avoid surprise bills.',
    actionSteps: ['List main cost drivers', 'Set alerts', 'Review monthly'],
    tags: ['scaling', 'risk', 'low-budget', 'universal', 'stage-scaling'],
    priority: 'high',
    domain: 'scaling',
  },
  {
    id: 'scale-support',
    title: 'Support and escalation',
    description: 'Handle support at scale; document and automate where possible.',
    actionSteps: ['Define support channels', 'Create FAQ/docs', 'Set escalation path'],
    tags: ['scaling', 'b2b', 'universal', 'stage-scaling'],
    priority: 'medium',
    domain: 'scaling',
  },
];
