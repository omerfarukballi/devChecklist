/**
 * Retention — keep users coming back and reduce churn.
 * Tags: retention, retention-problem, analytics, early-stage
 */
import type { StrategyItem } from '../types/strategy';

export const RETENTION_ITEMS: StrategyItem[] = [
  {
    id: 'retention-activation',
    title: 'Define and improve activation',
    description: 'Get users to "aha" moment fast; measure time-to-value.',
    actionSteps: ['Define activation event', 'Track % who activate', 'Shorten path (onboarding, defaults)'],
    tags: ['retention', 'analytics', 'early-stage', 'universal', 'stage-0-100'],
    priority: 'critical',
    domain: 'retention',
  },
  {
    id: 'retention-cohorts',
    title: 'Cohort retention analysis',
    description: 'See how retention changes by signup week; find drop-off points.',
    actionSteps: ['Build cohort view', 'Identify day 1, 7, 30 retention', 'Find biggest drop-off'],
    tags: ['retention', 'analytics', 'universal', 'stage-100-1000'],
    priority: 'high',
    domain: 'analytics',
  },
  {
    id: 'retention-churn-survey',
    title: 'Churn and cancellation survey',
    description: 'Ask why users leave; use feedback to fix top issues.',
    actionSteps: ['Add exit survey', 'Categorize reasons', 'Address top 1–2'],
    tags: ['retention', 'retention-problem', 'universal', 'stage-plateau'],
    priority: 'high',
    domain: 'retention',
  },
  {
    id: 'retention-email-reengage',
    title: 'Re-engagement emails',
    description: 'Win back dormant users with useful content or incentive.',
    actionSteps: ['Define "dormant"', 'Set up sequence', 'A/B test subject and offer'],
    tags: ['retention', 'organic', 'universal', 'stage-100-1000'],
    priority: 'medium',
    domain: 'retention',
  },
  {
    id: 'retention-notifications',
    title: 'In-app and push notifications',
    description: 'Bring users back with value, not noise.',
    actionSteps: ['Define key events to notify', 'Add in-app or push', 'Respect preferences'],
    tags: ['retention', 'mobile', 'stage-100-1000'],
    priority: 'medium',
    domain: 'retention',
  },
];
