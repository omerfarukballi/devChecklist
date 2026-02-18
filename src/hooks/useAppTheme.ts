import { useThemeStore } from '../store/themeStore';
import { darkTheme, lightTheme } from '../constants/theme';

export function useAppTheme() {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const colors = isDark ? darkTheme : lightTheme;
    return { isDark, colors, colorMode };
}
