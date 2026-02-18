// Accent color: dark blue (replaces all purple/violet)
export const ACCENT = '#1d4ed8';
export const ACCENT_LIGHT = '#3b82f6';   // lighter blue for text/icons on dark bg
export const ACCENT_DARK = '#1e3a8a';    // deeper blue for dark backgrounds

export const theme = {
    colors: {
        bg: '#07050f',
        surface: 'rgba(255,255,255,0.04)',
        surfaceHighlight: 'rgba(255,255,255,0.08)',
        border: 'rgba(255,255,255,0.08)',
        accent: ACCENT,
        accentLight: ACCENT_LIGHT,
        accent2: '#1e40af',
        glow: 'rgba(29,78,216,0.25)',
        text: {
            primary: '#ffffff',
            secondary: '#94a3b8',
            muted: '#475569',
            inverse: '#000000'
        },
        priority: {
            critical: '#ef4444',
            high: '#f97316',
            medium: '#eab308',
            low: '#22c55e'
        },
        group: {
            Web: '#61dafb',
            Mobile: '#3ddc84',
            Desktop: '#999999',
            Backend: '#6366f1',
            'AI/ML': '#60a5fa',
            Data: '#0ea5e9',
            Infra: '#64748b',
            Game: '#f97316',
            Other: '#fbbf24'
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48
    },
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999
    },
};

// Light mode colors
export const lightTheme = {
    bg: '#f1f5f9',
    surface: 'rgba(0,0,0,0.04)',
    surfaceHighlight: 'rgba(0,0,0,0.08)',
    border: 'rgba(0,0,0,0.1)',
    card: '#ffffff',
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
    },
};

// Dark mode colors (default)
export const darkTheme = {
    bg: '#07050f',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHighlight: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.08)',
    card: '#0f0d1a',
    text: {
        primary: '#ffffff',
        secondary: '#94a3b8',
        muted: '#475569',
    },
};

export type AppTheme = typeof darkTheme;

export function getAppTheme(colorMode: 'dark' | 'light'): AppTheme {
    return colorMode === 'dark' ? darkTheme : lightTheme;
}
