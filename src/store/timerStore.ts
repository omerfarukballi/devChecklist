import { create } from 'zustand';
import { WorkSession } from '../types';

interface TimerState {
    isRunning: boolean;
    timeLeft: number; // in seconds
    mode: 'work' | 'shortBreak' | 'longBreak';
    activeProjectId: string | null;
    activeTaskId: string | null;
    startTime: number | null;

    // Config
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;

    // Actions
    startTimer: (projectId: string | null, taskId: string | null) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    stopTimer: () => WorkSession | null;
    resetTimer: () => void;
    tick: () => void;
    setMode: (mode: 'work' | 'shortBreak' | 'longBreak') => void;
    setTimeLeft: (seconds: number) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'work',
    activeProjectId: null,
    activeTaskId: null,
    startTime: null,

    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,

    startTimer: (projectId, taskId) => {
        set({
            isRunning: true,
            activeProjectId: projectId,
            activeTaskId: taskId,
            startTime: Date.now(),
        });
    },

    pauseTimer: () => set({ isRunning: false }),

    resumeTimer: () => set({ isRunning: true }),

    stopTimer: () => {
        const { startTime, timeLeft, workDuration, isRunning, activeProjectId, activeTaskId, mode } = get();
        if (!startTime || mode !== 'work') {
            set({ isRunning: false, startTime: null, timeLeft: workDuration });
            return null;
        }

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);

        const session: WorkSession = {
            id: `session-${Date.now()}`,
            startTime,
            endTime,
            duration,
            taskId: activeTaskId || undefined,
        };

        set({
            isRunning: false,
            startTime: null,
            timeLeft: workDuration,
            activeProjectId: null,
            activeTaskId: null,
        });

        return session;
    },

    resetTimer: () => {
        const { mode, workDuration, shortBreakDuration, longBreakDuration } = get();
        let nextTime = workDuration;
        if (mode === 'shortBreak') nextTime = shortBreakDuration;
        if (mode === 'longBreak') nextTime = longBreakDuration;

        set({
            isRunning: false,
            timeLeft: nextTime,
            startTime: null,
        });
    },

    tick: () => {
        const { timeLeft, isRunning } = get();
        if (isRunning && timeLeft > 0) {
            set({ timeLeft: timeLeft - 1 });
        }
    },

    setMode: (mode) => {
        const { workDuration, shortBreakDuration, longBreakDuration } = get();
        let nextTime = workDuration;
        if (mode === 'shortBreak') nextTime = shortBreakDuration;
        if (mode === 'longBreak') nextTime = longBreakDuration;

        set({
            mode,
            timeLeft: nextTime,
            isRunning: false,
            startTime: null,
        });
    },

    setTimeLeft: (timeLeft) => set({ timeLeft }),
}));
