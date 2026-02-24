/**
 * Production & launch sanity — minimal build/deploy checklist (V2 lightweight).
 * Tags: production, launch, early-stage, post-launch, low-budget
 */
import type { StrategyItem } from '../types/strategy';

export const PRODUCTION_ITEMS: StrategyItem[] = [
  {
    id: 'prod-deploy-check',
    title: 'Deployment verification',
    description: 'Confirm app is live and reachable; run smoke checks.',
    actionSteps: ['Verify production URL', 'Check SSL', 'Test critical path (signup/login)'],
    tags: ['production', 'launch', 'post-launch', 'web', 'stage-just-launched'],
    priority: 'critical',
    domain: 'production',
  },
  {
    id: 'prod-basic-qa',
    title: 'Basic QA on production',
    description: 'Run core user flows on production to catch env-specific bugs.',
    actionSteps: ['Test signup/login', 'Test main feature', 'Test payment if applicable'],
    tags: ['production', 'launch', 'web', 'stage-just-launched'],
    priority: 'critical',
    domain: 'production',
  },
  {
    id: 'prod-analytics-installed',
    title: 'Analytics installed and firing',
    description: 'Ensure events are tracked so you can measure growth and retention.',
    actionSteps: ['Install analytics (e.g. PostHog, Mixpanel, GA4)', 'Track signup, activation, key actions', 'Verify in dashboard'],
    tags: ['production', 'analytics', 'post-launch', 'web', 'stage-just-launched'],
    priority: 'critical',
    domain: 'analytics',
  },
  {
    id: 'prod-monitoring-active',
    title: 'Monitoring and error tracking',
    description: 'Know when things break; get alerts on errors and downtime.',
    actionSteps: ['Set up error tracking (e.g. Sentry)', 'Set up uptime check', 'Configure alerts'],
    tags: ['production', 'risk', 'post-launch', 'universal', 'stage-pre-launch'],
    priority: 'critical',
    domain: 'production',
  },
  {
    id: 'prod-backup-recovery',
    title: 'Backup and recovery',
    description: 'Ensure data is backed up and you can restore if needed.',
    actionSteps: ['Confirm DB backups run', 'Test restore once', 'Document recovery steps'],
    tags: ['production', 'risk', 'universal', 'stage-pre-launch'],
    priority: 'high',
    domain: 'risk',
  },
  {
    id: 'prod-mobile-deploy',
    title: 'App build and store readiness',
    description: 'Confirm build works on device; TestFlight / Internal testing or Play internal track.',
    actionSteps: ['Run on real device', 'TestFlight or Play internal', 'Smoke test critical flows'],
    tags: ['production', 'launch', 'mobile', 'post-launch', 'stage-pre-launch'],
    priority: 'critical',
    domain: 'production',
  },
  {
    id: 'prod-mobile-analytics',
    title: 'Mobile analytics and events',
    description: 'Track installs, sessions, and key events in your app (e.g. Firebase, Mixpanel SDK).',
    actionSteps: ['Add analytics SDK', 'Track install, open, key actions', 'Verify in dashboard'],
    tags: ['production', 'analytics', 'mobile', 'post-launch', 'stage-pre-launch'],
    priority: 'critical',
    domain: 'analytics',
  },
];
