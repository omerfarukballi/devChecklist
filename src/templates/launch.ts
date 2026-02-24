/**
 * Launch — first 100 users, distribution, awareness.
 * Tags: launch, distribution, organic, paid-ads, low-budget, early-stage
 */
import type { StrategyItem } from '../types/strategy';

export const LAUNCH_ITEMS: StrategyItem[] = [
  {
    id: 'launch-product-hunt',
    title: 'Launch on Product Hunt',
    description: 'Schedule launch for Tuesday–Thursday; prepare tagline, GIF, first comment.',
    actionSteps: ['Create PH page', 'Prepare assets', 'Line up supporters for day-one upvotes'],
    tags: ['launch', 'distribution', 'organic', 'early-stage', 'universal', 'stage-just-launched'],
    priority: 'high',
    domain: 'launch',
  },
  {
    id: 'launch-hn',
    title: 'Post "Show HN" on Hacker News',
    description: 'Share what you built; be technical and ready for questions.',
    actionSteps: ['Draft post', 'Post 9–11am EST weekday', 'Respond to comments'],
    tags: ['launch', 'distribution', 'organic', 'b2b', 'early-stage', 'universal', 'stage-just-launched'],
    priority: 'high',
    domain: 'distribution',
  },
  {
    id: 'launch-reddit',
    title: 'Relevant subreddits',
    description: 'Post in r/SideProject, r/IndieHackers, and niche subreddits.',
    actionSteps: ['Read subreddit rules', 'Post value-first', 'Avoid pure self-promo'],
    tags: ['launch', 'distribution', 'organic', 'low-budget', 'universal', 'stage-0-100'],
    priority: 'medium',
    domain: 'distribution',
  },
  {
    id: 'launch-indie-hackers',
    title: 'Share on Indie Hackers',
    description: 'Milestone post about launch; community values transparency.',
    actionSteps: ['Write milestone', 'Share metrics if possible', 'Engage in comments'],
    tags: ['launch', 'distribution', 'organic', 'early-stage', 'universal', 'stage-0-100'],
    priority: 'medium',
    domain: 'distribution',
  },
  {
    id: 'launch-twitter-x',
    title: 'Build in public on Twitter/X',
    description: 'Share progress and launch; tap into builder audience.',
    actionSteps: ['Announce launch thread', 'Tag relevant accounts', 'Reply and engage'],
    tags: ['launch', 'distribution', 'organic', 'low-budget', 'universal', 'stage-0-100'],
    priority: 'medium',
    domain: 'distribution',
  },
  {
    id: 'launch-paid-ads',
    title: 'Paid acquisition (if budget allows)',
    description: 'Run small tests on Meta, Google, or LinkedIn based on audience.',
    actionSteps: ['Set budget cap', 'Define audience', 'Measure signup cost'],
    tags: ['distribution', 'paid-ads', 'universal', 'stage-100-1000'],
    priority: 'medium',
    domain: 'distribution',
  },
];
