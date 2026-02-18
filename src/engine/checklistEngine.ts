import { GeneratedChecklistItem, ProjectTypeId, Phase, Experience, ChecklistItemTemplate } from '../types';
import { CHECKLIST_TEMPLATES } from '../data/checklistTemplates';


interface GenerateConfig {
    projectType: ProjectTypeId;
    phase: Phase;
    techStack: string[];
    experience: Experience;
    goal?: string;
}

export function generateChecklist(config: GenerateConfig): GeneratedChecklistItem[] {
    const { projectType, phase, techStack, experience } = config;

    // 1. Filter templates
    let items = CHECKLIST_TEMPLATES.filter(item => {
        // Phase match
        if (!item.phaseSpecific.includes(phase)) return false;

        // Project Type match
        if (!item.projectTypeIds.includes(projectType)) return false;

        // Experience match (if template has experience levels defined, user exp must be in it)
        // If template has no exp levels (empty), it implies for all.
        if (item.experienceLevels.length > 0 && !item.experienceLevels.includes(experience)) {
            return false;
        }

        // Stack Specific match
        // If undefined or empty, it's generic for this project type -> Include
        // If defined, user's stack must contain at least one of the item's stacks
        if (item.stackSpecific && item.stackSpecific.length > 0) {
            const hasStackMatch = item.stackSpecific.some(stack => techStack.includes(stack));
            if (!hasStackMatch) return false;
        }

        return true;
    });

    // 2. Sort by Priority
    const priorityMap = {
        'critical': 0,
        'high': 1,
        'medium': 2,
        'low': 3
    };

    items.sort((a, b) => {
        // Primary sort: Priority
        const pA = priorityMap[a.priority];
        const pB = priorityMap[b.priority];
        if (pA !== pB) return pA - pB;

        // Secondary sort: Stack specific items come first (more relevant)
        const aIsSpecific = a.stackSpecific && a.stackSpecific.length > 0;
        const bIsSpecific = b.stackSpecific && b.stackSpecific.length > 0;
        if (aIsSpecific && !bIsSpecific) return -1;
        if (!aIsSpecific && bIsSpecific) return 1;

        return 0;
    });

    // 3. Allow up to 40 items for richer checklists
    const cappedItems = items.slice(0, 40);

    // 4. Map to GeneratedChecklistItem
    return cappedItems.map(item => ({
        ...item,
        id: `${item.id}-${Math.random().toString(36).substring(2, 9)}`, // Unique instance ID
        completed: false,
        notes: ''
    }));
}

/**
 * Generate items for a new tech stack added to an existing checklist.
 * Only returns items that are stack-specific to the new techs (avoids duplicating generic items).
 */
export function generateItemsForNewTech(config: {
    projectType: ProjectTypeId;
    phase: Phase;
    newTechIds: string[];
    existingItemTemplateIds: string[]; // base template IDs already in the checklist
}): GeneratedChecklistItem[] {
    const { projectType, phase, newTechIds, existingItemTemplateIds } = config;

    const items = CHECKLIST_TEMPLATES.filter(item => {
        if (!item.phaseSpecific.includes(phase)) return false;
        if (!item.projectTypeIds.includes(projectType)) return false;

        // Must be stack-specific to one of the new techs
        if (!item.stackSpecific || item.stackSpecific.length === 0) return false;
        const matchesNewTech = item.stackSpecific.some(s => newTechIds.includes(s));
        if (!matchesNewTech) return false;

        // Skip items whose base template ID is already in the checklist
        const baseId = item.id;
        const alreadyExists = existingItemTemplateIds.some(existing => existing.startsWith(baseId));
        if (alreadyExists) return false;

        return true;
    });

    return items.map(item => ({
        ...item,
        id: `${item.id}-${Math.random().toString(36).substring(2, 9)}`,
        completed: false,
        notes: ''
    }));
}
