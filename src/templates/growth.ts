/**
 * Growth — acquisition, channels, experimentation.
 * Tags: growth, distribution, organic, paid-ads, b2b, b2c, early-stage
 */
import type { StrategyItem } from '../types/strategy';

export const GROWTH_ITEMS: StrategyItem[] = [
  {
    id: 'growth-seo-basics',
    title: 'SEO basics',
    description: 'Indexable pages, meta tags, sitemap, and one focus keyword per key page.',
    actionSteps: ['Add meta title/description', 'Submit sitemap', 'Pick 1–2 keywords to track'],
    tags: ['growth', 'organic', 'distribution', 'web', 'stage-0-100'],
    priority: 'high',
    domain: 'growth',
  },
  {
    id: 'growth-content-first',
    title: 'Content for acquisition',
    description: 'Blog, docs, or use-case content that attracts your audience.',
    actionSteps: ['List 5 topics your users search for', 'Publish 1–2 pieces', 'Link from product'],
    tags: ['growth', 'organic', 'content', 'web', 'stage-100-1000'],
    priority: 'high',
    domain: 'growth',
  },
  {
    id: 'growth-referral-loop',
    title: 'Referral or invite loop',
    description: 'Let users invite others; reward both sides to grow organically.',
    actionSteps: ['Design invite flow', 'Add incentive (credit, feature)', 'Track referral signups'],
    tags: ['growth', 'organic', 'retention', 'universal', 'stage-growth'],
    priority: 'high',
    domain: 'growth',
  },
  {
    id: 'growth-email-list',
    title: 'Build email list',
    description: 'Capture leads before and after signup; use for launch and re-engagement.',
    actionSteps: ['Add signup form', 'Welcome sequence', 'Segment by behavior'],
    tags: ['growth', 'retention', 'organic', 'universal', 'stage-0-100'],
    priority: 'medium',
    domain: 'growth',
  },
  {
    id: 'growth-partnerships',
    title: 'Partnerships and integrations',
    description: 'Integrate with tools your users use; co-marketing or listings.',
    actionSteps: ['List 3–5 complementary products', 'Reach out for integration or listing', 'Add integration'],
    tags: ['growth', 'b2b', 'distribution', 'stage-growth'],
    priority: 'medium',
    domain: 'growth',
  },
  {
    id: 'growth-paid-test',
    title: 'Paid channel test',
    description: 'Run a small paid test to learn CAC and channel fit.',
    actionSteps: ['Pick one channel', 'Set budget and goal', 'Measure signup cost and quality'],
    tags: ['growth', 'paid-ads', 'universal', 'stage-100-1000'],
    priority: 'medium',
    domain: 'distribution',
  },
];
