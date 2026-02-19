
import { CHECKLIST_TEMPLATES } from './src/data/checklistTemplates';

const countsByProjectType: Record<string, number> = {};
const countsByStack: Record<string, number> = {};

CHECKLIST_TEMPLATES.forEach(item => {
    item.projectTypeIds.forEach(id => {
        countsByProjectType[id] = (countsByProjectType[id] || 0) + 1;
    });
    if (item.stackSpecific) {
        item.stackSpecific.forEach(stack => {
            countsByStack[stack] = (countsByStack[stack] || 0) + 1;
        });
    }
});

console.log('--- Counts by Project Type ---');
Object.entries(countsByProjectType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([id, count]) => {
        console.log(`${id}: ${count}`);
    });

console.log('\n--- Counts by Stack Specific ---');
Object.entries(countsByStack)
    .sort((a, b) => b[1] - a[1])
    .forEach(([stack, count]) => {
        console.log(`${stack}: ${count}`);
    });
