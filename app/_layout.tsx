import { Stack } from 'expo-router';
import { theme } from '../src/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

export default function Layout() {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: theme.colors.bg },
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="questionnaire" />
                    <Stack.Screen name="checklist/[id]" />
                </Stack>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}
