import { create } from 'zustand';
import { ProjectTypeId, Phase, Experience } from '../types';

interface OnboardingState {
    step: number;
    projectType: ProjectTypeId | null;
    phase: Phase | null;
    selectedStack: string[];
    experience: Experience;
    goal: string;

    // Actions
    setStep: (step: number) => void;
    setProjectType: (type: ProjectTypeId) => void;
    setPhase: (phase: Phase) => void;
    toggleStack: (stackId: string) => void;
    setExperience: (exp: Experience) => void;
    setGoal: (goal: string) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    step: 1,
    projectType: null,
    phase: null,
    selectedStack: [],
    experience: 'intermediate',
    goal: '',

    setStep: (step) => set({ step }),

    setProjectType: (projectType) => set({ projectType }),

    setPhase: (phase) => set({ phase }),

    toggleStack: (stackId) =>
        set((state) => {
            if (state.selectedStack.includes(stackId)) {
                return { selectedStack: state.selectedStack.filter((s) => s !== stackId) };
            }
            return { selectedStack: [...state.selectedStack, stackId] };
        }),

    setExperience: (experience) => set({ experience }),

    setGoal: (goal) => set({ goal }),

    reset: () => set({
        step: 1,
        projectType: null,
        phase: null,
        selectedStack: [],
        experience: 'intermediate',
        goal: ''
    }),
}));
