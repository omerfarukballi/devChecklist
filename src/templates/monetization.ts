/**
 * Monetization — pricing, payments, expansion.
 * Tags: monetization, subscription, b2b, b2c, low-budget
 */
import type { StrategyItem } from '../types/strategy';

export const MONETIZATION_ITEMS: StrategyItem[] = [
  {
    id: 'monet-pricing-page',
    title: 'Clear pricing page',
    description: 'Users should understand plans and value in under 30 seconds.',
    actionSteps: ['List plans and features', 'Add FAQ', 'Add CTA to signup'],
    tags: ['monetization', 'subscription', 'b2b', 'b2c', 'universal', 'stage-100-1000'],
    priority: 'critical',
    domain: 'monetization',
  },
  {
    id: 'monet-payment-flow',
    title: 'Payment and checkout',
    description: 'Friction-free payment; support cards and preferred methods.',
    actionSteps: ['Integrate Stripe/payment provider', 'Test checkout end-to-end', 'Handle failures and receipts'],
    tags: ['monetization', 'subscription', 'universal', 'stage-100-1000'],
    priority: 'critical',
    domain: 'monetization',
  },
  {
    id: 'monet-free-trial',
    title: 'Free trial or freemium',
    description: 'Let users try before paying; set clear upgrade path.',
    actionSteps: ['Define trial length or free tier', 'Surface upgrade triggers', 'Measure trial-to-paid conversion'],
    tags: ['monetization', 'subscription', 'early-stage', 'universal', 'stage-0-100'],
    priority: 'high',
    domain: 'monetization',
  },
  {
    id: 'monet-expansion',
    title: 'Expansion revenue',
    description: 'Upsell and cross-sell; increase LTV per account.',
    actionSteps: ['List upgrade triggers', 'Add upgrade prompts', 'Track expansion MRR'],
    tags: ['monetization', 'b2b', 'scaling', 'universal', 'stage-growth'],
    priority: 'medium',
    domain: 'monetization',
  },
];
