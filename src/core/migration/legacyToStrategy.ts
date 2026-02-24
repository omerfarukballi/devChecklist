/**
 * Migrate legacy Projects + checklists to Strategy Profiles.
 * One StrategyProfile per Project; context inferred from project type; stage default "growth".
 */
import type { Project } from '../../types';
import type { StrategyProfile, ContextProfile, ProductStage } from '../../types/strategy';
import { buildStrategicPlan } from '../context-engine';

/** Map legacy ProjectTypeId to V2 productType + optional tags */
function inferProductType(projectType: string): { productType: string; tags: string[] } {
  if (projectType.startsWith('web-')) return { productType: 'web-app', tags: ['web', 'post-launch'] };
  if (projectType.startsWith('mobile-')) return { productType: 'mobile-app', tags: ['mobile', 'post-launch'] };
  if (projectType.startsWith('desktop-') || projectType === 'cli-tool') return { productType: 'desktop-app', tags: ['desktop', 'post-launch'] };
  if (projectType.startsWith('game')) return { productType: 'game', tags: ['game', 'post-launch'] };
  if (projectType.startsWith('backend-') || projectType === 'microservices' || projectType === 'realtime')
    return { productType: 'api-backend', tags: ['b2b', 'post-launch'] };
  if (projectType.startsWith('ai-') || projectType.startsWith('ml')) return { productType: 'api-backend', tags: ['b2b', 'post-launch'] };
  if (projectType.startsWith('data-')) return { productType: 'api-backend', tags: ['b2b', 'post-launch'] };
  if (projectType.startsWith('devops')) return { productType: 'api-backend', tags: ['b2b', 'post-launch'] };
  return { productType: 'other', tags: ['post-launch'] };
}

/**
 * Compute completion ratio from legacy checklists: completed items / total items.
 */
function completionFromChecklists(
  project: Project,
  checklists: Array<{ id: string; items: Array<{ completed?: boolean }> }>
): number {
  let total = 0;
  let completed = 0;
  for (const cid of project.checklistIds) {
    const cl = checklists.find(c => c.id === cid);
    if (!cl) continue;
    for (const item of cl.items) {
      total++;
      if (item.completed) completed++;
    }
  }
  return total > 0 ? completed / total : 0;
}

/**
 * Create one StrategyProfile from one legacy Project.
 */
export function migrateProjectToStrategyProfile(
  project: Project,
  checklists: Array<{ id: string; items: Array<{ completed?: boolean }> }>,
  now: number = Date.now()
): StrategyProfile {
  const { productType, tags } = inferProductType(project.projectType);
  const context: ContextProfile = {
    id: `ctx-${project.id}`,
    productType,
    stage: 'growth',
    constraints: tags,
    createdAt: now,
    updatedAt: now,
  };
  const plan = buildStrategicPlan(context, project.id, undefined);
  const completionRatio = completionFromChecklists(project, checklists);

  return {
    id: project.id,
    name: project.name,
    context,
    plan,
    completionRatio,
    stageUpdatedAt: now,
    createdAt: project.createdAt,
    updatedAt: now,
    archived: project.archived,
    archivedAt: project.archivedAt,
  };
}

/**
 * Migrate all legacy projects to strategy profiles. Does not remove legacy data.
 */
export function migrateAllLegacyToStrategy(
  projects: Project[],
  checklists: Array<{ id: string; items: Array<{ completed?: boolean }> }>
): StrategyProfile[] {
  const now = Date.now();
  return projects.map(p => migrateProjectToStrategyProfile(p, checklists, now));
}
