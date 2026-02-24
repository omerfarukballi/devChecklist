/**
 * Risk — stability, security, compliance, and crisis readiness.
 * Tags: risk, production, low-budget
 */
import type { StrategyItem } from '../types/strategy';

export const RISK_ITEMS: StrategyItem[] = [
  {
    id: 'risk-downtime-plan',
    title: 'Downtime and incident plan',
    description: 'Know how to respond when things break.',
    actionSteps: ['Document status page', 'Define on-call or owner', 'Post-mortem template'],
    tags: ['risk', 'production', 'universal', 'stage-pre-launch'],
    priority: 'critical',
    domain: 'risk',
  },
  {
    id: 'risk-data-backup',
    title: 'Data backup and recovery',
    description: 'Backups run and restore is tested.',
    actionSteps: ['Verify backup schedule', 'Test restore once', 'Document recovery steps'],
    tags: ['risk', 'production', 'universal', 'stage-just-launched'],
    priority: 'critical',
    domain: 'risk',
  },
  {
    id: 'risk-security-basics',
    title: 'Security basics',
    description: 'Auth, secrets, and basic hardening.',
    actionSteps: ['Review auth flow', 'Secrets in env/vault', 'HTTPS and headers'],
    tags: ['risk', 'production', 'universal', 'stage-just-launched'],
    priority: 'high',
    domain: 'risk',
  },
  {
    id: 'risk-legal-privacy',
    title: 'Privacy and terms',
    description: 'Privacy policy and terms; consent where required.',
    actionSteps: ['Publish privacy policy', 'Terms of service', 'Cookie/consent if needed'],
    tags: ['risk', 'legal', 'global', 'universal', 'stage-0-100'],
    priority: 'high',
    domain: 'risk',
  },
];
