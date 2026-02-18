import { useMemo } from 'react';
import { GeneratedChecklist } from '../types';

export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface RiskItem {
    message: string;
    phase: string;
    priority: string;
}

export interface RiskReport {
    healthScore: number; // 0-100
    level: RiskLevel;
    risks: RiskItem[];
}

const PRIORITY_WEIGHTS: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
};

const CRITICAL_KEYWORDS = [
    'security', 'auth', 'https', 'ssl', 'tls', 'backup', 'monitoring',
    'error', 'logging', 'rate limit', 'validation', 'sanitize', 'encrypt',
    'secret', 'env', 'environment', 'cors', 'csrf', 'xss', 'injection',
    'password', 'token', 'jwt', 'oauth', 'permission', 'access control',
];

function isCriticalItem(title: string): boolean {
    const lower = title.toLowerCase();
    return CRITICAL_KEYWORDS.some(kw => lower.includes(kw));
}

export function useRiskRadar(checklists: GeneratedChecklist[]): RiskReport {
    return useMemo(() => {
        if (checklists.length === 0) {
            return { healthScore: 100, level: 'safe', risks: [] };
        }

        let totalWeight = 0;
        let completedWeight = 0;
        const risks: RiskItem[] = [];

        for (const checklist of checklists) {
            for (const item of checklist.items) {
                const weight = PRIORITY_WEIGHTS[item.priority] ?? 1;
                totalWeight += weight;
                if (item.completed) {
                    completedWeight += weight;
                } else {
                    // Flag skipped critical/security items as risks
                    if (item.priority === 'critical' || isCriticalItem(item.title)) {
                        risks.push({
                            message: `"${item.title}" is incomplete`,
                            phase: checklist.phase,
                            priority: item.priority,
                        });
                    }
                }
            }
        }

        const healthScore = totalWeight > 0
            ? Math.round((completedWeight / totalWeight) * 100)
            : 100;

        let level: RiskLevel = 'safe';
        if (healthScore < 40 || risks.some(r => r.priority === 'critical')) {
            level = 'danger';
        } else if (healthScore < 70 || risks.length > 0) {
            level = 'warning';
        }

        return { healthScore, level, risks: risks.slice(0, 5) };
    }, [checklists]);
}
