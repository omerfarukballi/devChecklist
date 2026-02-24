/**
 * Distribution — app stores, platforms, and channels.
 * Tags: steam, mobile, ios, android, store, indie-game, b2b
 */
import type { StrategyItem } from '../types/strategy';

export const DISTRIBUTION_ITEMS: StrategyItem[] = [
  {
    id: 'dist-app-store-optimization',
    title: 'App Store / Play Store optimization',
    description: 'Improve listing for discoverability and conversion.',
    actionSteps: ['Optimize title and subtitle', 'Screenshots and video', 'Keywords and description'],
    tags: ['mobile', 'ios', 'android', 'distribution', 'stage-0-100'],
    priority: 'high',
    domain: 'distribution',
  },
  {
    id: 'dist-steam-page',
    title: 'Steam page and visibility',
    description: 'Strong store page and wishlists drive launch visibility.',
    actionSteps: ['Capsule art and trailer', 'Description and tags', 'Wishlist goal before launch'],
    tags: ['steam', 'indie-game', 'distribution', 'stage-growth'],
    priority: 'high',
    domain: 'distribution',
  },
  {
    id: 'dist-saas-direct',
    title: 'Direct distribution (SaaS)',
    description: 'SEO, content, and signup flow for direct traffic.',
    actionSteps: ['Landing page clarity', 'Signup flow', 'Track conversion by source'],
    tags: ['saas', 'b2b', 'distribution', 'web', 'stage-100-1000'],
    priority: 'high',
    domain: 'distribution',
  },
];
