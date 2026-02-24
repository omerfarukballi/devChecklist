/**
 * Data products — pipelines, quality, governance, API, post-launch.
 * Tags: data, b2b, data-pipeline, data-analytics, early-stage, post-launch
 */
import type { StrategyItem } from '../types/strategy';

export const DATA_ITEMS: StrategyItem[] = [
  {
    id: 'data-quality-basics',
    title: 'Data quality checks',
    description: 'Define and run quality rules on key datasets (completeness, freshness, validity).',
    actionSteps: ['List critical tables/sources', 'Add freshness checks', 'Document quality SLA'],
    tags: ['data', 'post-launch', 'b2b', 'stage-0-100'],
    priority: 'critical',
    domain: 'analytics',
  },
  {
    id: 'data-lineage-docs',
    title: 'Lineage and documentation',
    description: 'Document where data comes from and how it flows so teams can trust and debug.',
    actionSteps: ['Document main pipelines', 'Add column-level lineage if possible', 'Publish data dictionary'],
    tags: ['data', 'b2b', 'post-launch', 'stage-100-1000'],
    priority: 'high',
    domain: 'analytics',
  },
  {
    id: 'data-pipeline-monitoring',
    title: 'Pipeline monitoring and alerts',
    description: 'Know when pipelines fail or slow down; get alerts on SLA breaches.',
    actionSteps: ['Set up pipeline run monitoring', 'Alert on failure and latency', 'Dashboard for key metrics'],
    tags: ['data', 'data-pipeline', 'production', 'post-launch', 'stage-pre-launch'],
    priority: 'critical',
    domain: 'production',
  },
  {
    id: 'data-access-governance',
    title: 'Access and governance',
    description: 'Control who can see what data; audit access for compliance.',
    actionSteps: ['Define roles and permissions', 'Audit log for sensitive access', 'Document governance policy'],
    tags: ['data', 'b2b', 'risk', 'post-launch', 'stage-100-1000'],
    priority: 'high',
    domain: 'risk',
  },
  {
    id: 'data-api-docs',
    title: 'Data API and developer experience',
    description: 'If you expose data via API, document it and provide a good DX for consumers.',
    actionSteps: ['OpenAPI/Swagger for data endpoints', 'Examples and SDK if applicable', 'Rate limits and quotas'],
    tags: ['data', 'data-api', 'b2b', 'post-launch', 'stage-growth'],
    priority: 'high',
    domain: 'distribution',
  },
  {
    id: 'data-cost-usage',
    title: 'Cost and usage visibility',
    description: 'Track storage and compute cost per pipeline or team; optimize spend.',
    actionSteps: ['Tag resources by team/pipeline', 'Set up cost dashboards', 'Review and set budgets'],
    tags: ['data', 'data-pipeline', 'post-launch', 'stage-scaling'],
    priority: 'medium',
    domain: 'monetization',
  },
  {
    id: 'data-retention-policy',
    title: 'Retention and archival policy',
    description: 'Define how long to keep data and how to archive or delete safely.',
    actionSteps: ['Document retention by dataset', 'Implement archival where needed', 'Comply with privacy rules'],
    tags: ['data', 'risk', 'post-launch', 'stage-0-100'],
    priority: 'high',
    domain: 'risk',
  },
  {
    id: 'data-onboarding',
    title: 'Customer/team onboarding for data',
    description: 'Make it easy for new teams or customers to discover and use your data.',
    actionSteps: ['Onboarding doc or checklist', 'Sample queries or notebooks', 'Support channel for data questions'],
    tags: ['data', 'b2b', 'post-launch', 'stage-100-1000'],
    priority: 'medium',
    domain: 'growth',
  },
];
