import { useEffect } from 'react';
import { useChecklistStore } from '../store/checklistStore';
import { useAchievementStore } from '../store/achievementStore';

/**
 * Checks achievement conditions and unlocks them automatically.
 * Call this hook once in the root layout or home screen.
 */
export function useAchievementChecker() {
    const { checklists, projects } = useChecklistStore();
    const { unlock, isUnlocked } = useAchievementStore();

    useEffect(() => {
        const allItems = checklists.flatMap(c => c.items);
        const completedItems = allItems.filter(i => i.completed);
        const itemsWithNotes = allItems.filter(i => i.notes && i.notes.trim().length > 0);

        // First Blood — complete any item
        if (completedItems.length >= 1) {
            unlock('first-blood');
        }

        // Note Taker — 10 items with notes
        if (itemsWithNotes.length >= 10) {
            unlock('note-taker');
        }

        // Serial Builder — 5+ projects
        if (projects.length >= 5) {
            unlock('serial-builder');
        }

        // Phase completions
        const phases = ['planning', 'coding', 'testing', 'deployment', 'scaling'];
        const phaseAchievements: Record<string, string> = {
            planning: 'planner',
            coding: 'mvp-striker',
            testing: 'bug-slayer',
            deployment: 'ship-it',
            scaling: 'scaling-master',
        };

        for (const phase of phases) {
            const phaseChecklists = checklists.filter(c => c.phase === phase);
            if (phaseChecklists.length === 0) continue;

            const allComplete = phaseChecklists.every(c =>
                c.items.length > 0 && c.items.every(i => i.completed)
            );

            if (allComplete) {
                unlock(phaseAchievements[phase]);
            }
        }

        // Per-project achievements
        for (const project of projects) {
            const projectChecklists = project.checklistIds
                .map(id => checklists.find(c => c.id === id))
                .filter(Boolean) as typeof checklists;

            if (projectChecklists.length === 0) continue;

            const totalItems = projectChecklists.reduce((acc, c) => acc + c.items.length, 0);
            const completedProjectItems = projectChecklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);

            if (totalItems === 0) continue;

            const progress = completedProjectItems / totalItems;

            // Half Way There
            if (progress >= 0.5) {
                unlock('half-way');
            }

            // Perfectionist — 100% complete
            if (progress === 1) {
                unlock('perfectionist');
            }
        }
    }, [checklists, projects]);
}
