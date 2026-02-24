/**
 * Decision tree definition — adaptive question flow that builds ContextProfile.
 * Root: product type → stage → constraints → distribution → growth focus.
 */
import type { DecisionNode } from '../../types/strategy';

export const DECISION_TREE: Record<string, DecisionNode> = {
  root: {
    id: 'root',
    question: 'What did you build?',
    description: 'Choose the category that best fits your product.',
    options: [
      { id: 'web-app', label: 'Web App / SaaS', nextNodeId: 'product-web', contextMutations: { productType: 'web-app' }, injectTags: ['web', 'post-launch'] },
      { id: 'mobile-app', label: 'Mobile App', nextNodeId: 'product-mobile', contextMutations: { productType: 'mobile-app' }, injectTags: ['mobile', 'post-launch'] },
      { id: 'web-mobile', label: 'Web + Mobile (both)', nextNodeId: 'product-web-mobile', contextMutations: { productType: 'web-mobile' }, injectTags: ['web', 'mobile', 'post-launch'] },
      { id: 'desktop-app', label: 'Desktop App', nextNodeId: 'product-desktop', contextMutations: { productType: 'desktop-app' }, injectTags: ['desktop', 'post-launch'] },
      { id: 'game', label: 'Game', nextNodeId: 'product-game', contextMutations: { productType: 'game' }, injectTags: ['game', 'post-launch'] },
      { id: 'api-backend', label: 'API / Backend / DevTool', nextNodeId: 'product-api', contextMutations: { productType: 'api-backend' }, injectTags: ['b2b', 'post-launch'] },
      { id: 'data-product', label: 'Data Product / Platform', nextNodeId: 'product-data', contextMutations: { productType: 'data-product' }, injectTags: ['data', 'b2b', 'post-launch'] },
      { id: 'other', label: 'Other', nextNodeId: 'stage', contextMutations: { productType: 'other' }, injectTags: ['post-launch'] },
    ],
  },
  'product-web-mobile': {
    id: 'product-web-mobile',
    question: 'What kind of product?',
    options: [
      { id: 'saas-hybrid', label: 'SaaS (web + mobile app)', nextNodeId: 'stage', contextMutations: { subType: 'saas', monetizationModel: 'subscription', platforms: ['web', 'mobile'] }, injectTags: ['saas', 'subscription'] },
      { id: 'content-hybrid', label: 'Content / Community', nextNodeId: 'stage', contextMutations: { subType: 'content', platforms: ['web', 'mobile'] }, injectTags: ['content'] },
      { id: 'other-hybrid', label: 'Other', nextNodeId: 'stage', contextMutations: { platforms: ['web', 'mobile'] } },
    ],
  },
  'product-data': {
    id: 'product-data',
    question: 'What type of data product?',
    options: [
      { id: 'data-pipeline', label: 'Data pipelines / ETL', nextNodeId: 'stage', contextMutations: { subType: 'data-pipeline' }, injectTags: ['data', 'data-pipeline'] },
      { id: 'data-analytics', label: 'Analytics / BI platform', nextNodeId: 'stage', contextMutations: { subType: 'data-analytics' }, injectTags: ['data', 'analytics'] },
      { id: 'data-api', label: 'Data API / DevTool', nextNodeId: 'stage', contextMutations: { subType: 'data-api' }, injectTags: ['data', 'b2b'] },
      { id: 'data-other', label: 'Other data product', nextNodeId: 'stage', contextMutations: {}, injectTags: ['data'] },
    ],
  },
  'product-web': {
    id: 'product-web',
    question: 'What kind of web product?',
    options: [
      { id: 'saas', label: 'SaaS / Subscription', nextNodeId: 'stage', contextMutations: { subType: 'saas', monetizationModel: 'subscription' }, injectTags: ['saas', 'subscription'] },
      { id: 'marketplace', label: 'Marketplace / Platform', nextNodeId: 'stage', contextMutations: { subType: 'marketplace' }, injectTags: ['marketplace'] },
      { id: 'content', label: 'Content / Community', nextNodeId: 'stage', contextMutations: { subType: 'content' }, injectTags: ['content'] },
      { id: 'other-web', label: 'Other', nextNodeId: 'stage', contextMutations: {} },
    ],
  },
  'product-mobile': {
    id: 'product-mobile',
    question: 'Primary platform?',
    options: [
      { id: 'ios', label: 'iOS', nextNodeId: 'stage', contextMutations: { platform: 'ios' }, injectTags: ['mobile', 'ios'] },
      { id: 'android', label: 'Android', nextNodeId: 'stage', contextMutations: { platform: 'android' }, injectTags: ['mobile', 'android'] },
      { id: 'both', label: 'Both', nextNodeId: 'stage', contextMutations: { platform: 'cross-platform' }, injectTags: ['mobile'] },
    ],
  },
  'product-desktop': {
    id: 'product-desktop',
    question: 'Distribution?',
    options: [
      { id: 'app-store', label: 'Mac / Windows Store', nextNodeId: 'stage', contextMutations: { platform: 'store', distributionModel: 'store' }, injectTags: ['desktop', 'store'] },
      { id: 'direct', label: 'Direct Download', nextNodeId: 'stage', contextMutations: { distributionModel: 'direct' }, injectTags: ['desktop'] },
    ],
  },
  'product-game': {
    id: 'product-game',
    question: 'What type of game?',
    options: [
      { id: 'indie-game', label: 'Indie / Solo', nextNodeId: 'stage', contextMutations: { subType: 'indie-game' }, injectTags: ['indie-game', 'post-launch'] },
      { id: 'mobile-game', label: 'Mobile Game', nextNodeId: 'stage', contextMutations: { subType: 'mobile-game', platform: 'mobile' }, injectTags: ['mobile', 'game'] },
      { id: 'steam', label: 'PC / Steam', nextNodeId: 'stage', contextMutations: { platform: 'steam' }, injectTags: ['steam', 'post-launch'] },
      { id: 'other-game', label: 'Other', nextNodeId: 'stage', contextMutations: {} },
    ],
  },
  'product-api': {
    id: 'product-api',
    question: 'Who is it for?',
    options: [
      { id: 'b2b', label: 'B2B / Developers', nextNodeId: 'stage', contextMutations: {}, injectTags: ['b2b'] },
      { id: 'b2c', label: 'Consumers', nextNodeId: 'stage', contextMutations: {}, injectTags: ['b2c'] },
    ],
  },
  stage: {
    id: 'stage',
    question: "Where are you right now?",
    description: "This drives what we'll focus on first.",
    options: [
      { id: 'pre-launch', label: 'Pre-launch (building)', nextNodeId: 'budget', contextMutations: { stage: 'pre-launch' }, injectTags: ['early-stage'] },
      { id: 'just-launched', label: 'Just launched', nextNodeId: 'budget', contextMutations: { stage: 'just-launched' }, injectTags: ['early-stage', 'post-launch'] },
      { id: '0-100', label: '0–100 users', nextNodeId: 'budget', contextMutations: { stage: '0-100-users', userCountRange: '1-100' }, injectTags: ['early-stage', 'post-launch'] },
      { id: '100-1000', label: '100–1K users', nextNodeId: 'budget', contextMutations: { stage: '100-1000-users', userCountRange: '101-1000' }, injectTags: ['post-launch'] },
      { id: 'growth', label: 'Growth phase', nextNodeId: 'budget', contextMutations: { stage: 'growth', userCountRange: '1001-10k' }, injectTags: ['post-launch'] },
      { id: 'scaling', label: 'Scaling', nextNodeId: 'budget', contextMutations: { stage: 'scaling', userCountRange: '10k-100k' }, injectTags: ['post-launch'] },
      { id: 'plateau', label: 'Plateau / Stuck', nextNodeId: 'budget', contextMutations: { stage: 'plateau' }, injectTags: ['retention-problem', 'post-launch'] },
      { id: 'pivoting', label: 'Pivoting', nextNodeId: 'budget', contextMutations: { stage: 'pivoting' }, injectTags: ['post-launch'] },
    ],
  },
  budget: {
    id: 'budget',
    question: 'What\'s your marketing/ops budget?',
    options: [
      { id: 'none', label: 'Zero / Bootstrapped', nextNodeId: 'growth-focus', contextMutations: { budgetRange: 'none' }, injectTags: ['low-budget'] },
      { id: 'bootstrapped', label: 'Small (bootstrapped)', nextNodeId: 'growth-focus', contextMutations: { budgetRange: 'bootstrapped' }, injectTags: ['low-budget'] },
      { id: 'low', label: 'Low', nextNodeId: 'growth-focus', contextMutations: { budgetRange: 'low' }, injectTags: [] },
      { id: 'medium', label: 'Medium', nextNodeId: 'growth-focus', contextMutations: { budgetRange: 'medium' }, injectTags: [] },
      { id: 'high', label: 'High', nextNodeId: 'growth-focus', contextMutations: { budgetRange: 'high' }, injectTags: [] },
    ],
  },
  'growth-focus': {
    id: 'growth-focus',
    question: 'What do you want to focus on first?',
    description: 'We\'ll prioritize actions in these areas.',
    options: [
      { id: 'acquisition', label: 'Acquisition (get more users)', nextNodeId: 'end', contextMutations: { growthFocus: ['acquisition'] }, injectTags: ['organic', 'distribution'] },
      { id: 'retention', label: 'Retention (keep users)', nextNodeId: 'end', contextMutations: { growthFocus: ['retention'] }, injectTags: ['retention'] },
      { id: 'monetization', label: 'Monetization', nextNodeId: 'end', contextMutations: { growthFocus: ['monetization'] }, injectTags: ['monetization'] },
      { id: 'stability', label: 'Stability & production', nextNodeId: 'end', contextMutations: { growthFocus: ['production'] }, injectTags: ['production'] },
      { id: 'multiple', label: 'A bit of everything', nextNodeId: 'end', contextMutations: { growthFocus: ['acquisition', 'retention', 'monetization'] }, injectTags: [] },
    ],
  },
  end: {
    id: 'end',
    question: "You're all set.",
    description: "We'll build your strategic execution plan.",
    options: [],
  },
};

export const ROOT_NODE_ID = 'root';
export const END_NODE_ID = 'end';
