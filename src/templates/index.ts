/**
 * Strategy templates — modular tagged modules aggregated for the strategy engine.
 * Engine filters by ContextProfile, stage, and injected tags.
 */
import type { StrategyItem } from '../types/strategy';
import { PRODUCTION_ITEMS } from './production';
import { LAUNCH_ITEMS } from './launch';
import { GROWTH_ITEMS } from './growth';
import { RETENTION_ITEMS } from './retention';
import { MONETIZATION_ITEMS } from './monetization';
import { SCALING_ITEMS } from './scaling';
import { RISK_ITEMS } from './risk';
import { OPTIMIZATION_ITEMS } from './optimization';
import { DISTRIBUTION_ITEMS } from './distribution';
import { DATA_ITEMS } from './data';
import { STAGE_ITEMS } from './stage-items';

export const ALL_STRATEGY_ITEMS: StrategyItem[] = [
  ...PRODUCTION_ITEMS,
  ...LAUNCH_ITEMS,
  ...GROWTH_ITEMS,
  ...RETENTION_ITEMS,
  ...MONETIZATION_ITEMS,
  ...SCALING_ITEMS,
  ...RISK_ITEMS,
  ...OPTIMIZATION_ITEMS,
  ...DISTRIBUTION_ITEMS,
  ...DATA_ITEMS,
  ...STAGE_ITEMS,
];

export { PRODUCTION_ITEMS, LAUNCH_ITEMS, GROWTH_ITEMS, RETENTION_ITEMS };
export { MONETIZATION_ITEMS, SCALING_ITEMS, RISK_ITEMS, OPTIMIZATION_ITEMS, DISTRIBUTION_ITEMS, DATA_ITEMS, STAGE_ITEMS };
