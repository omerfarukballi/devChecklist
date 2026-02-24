/**
 * Stage transition — suggest next stage from user count, completion ratio, and time.
 * User can manually override; this is advisory only.
 */
import type { ProductStage } from '../../types/strategy';

export const STAGE_ORDER: ProductStage[] = [
  'pre-launch',
  'just-launched',
  '0-100-users',
  '100-1000-users',
  'growth',
  'scaling',
  'plateau',
  'pivoting',
];

export interface StageSuggestionInput {
  currentStage: ProductStage;
  userCount?: number;
  completionRatio: number;
  stageUpdatedAt: number;
  /** Manual override: do not suggest if user set stage manually */
  stageOverride?: ProductStage;
}

/**
 * Returns suggested stage and optional reason. Null if no change suggested.
 */
export function suggestStageTransition(input: StageSuggestionInput): {
  suggestedStage: ProductStage;
  reason: string;
} | null {
  if (input.stageOverride !== undefined) return null;

  const { currentStage, userCount, completionRatio, stageUpdatedAt } = input;
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1) return null;

  const daysSinceUpdate = (Date.now() - stageUpdatedAt) / (24 * 60 * 60 * 1000);

  if (userCount !== undefined) {
    if (userCount >= 1000 && currentIndex < STAGE_ORDER.indexOf('growth')) {
      return { suggestedStage: 'growth', reason: `You have ${userCount} users — consider moving to Growth.` };
    }
    if (userCount >= 100 && userCount < 1000 && currentStage === '0-100-users') {
      return { suggestedStage: '100-1000-users', reason: `You have ${userCount} users — consider 100–1K stage.` };
    }
    if (userCount >= 10000 && currentIndex < STAGE_ORDER.indexOf('scaling')) {
      return { suggestedStage: 'scaling', reason: `You have ${userCount} users — consider Scaling.` };
    }
  }

  if (completionRatio >= 0.9 && daysSinceUpdate >= 7 && currentIndex < STAGE_ORDER.length - 1) {
    const next = STAGE_ORDER[currentIndex + 1];
    if (next && next !== 'plateau' && next !== 'pivoting') {
      return { suggestedStage: next, reason: 'High completion and time in stage — consider advancing.' };
    }
  }

  return null;
}
