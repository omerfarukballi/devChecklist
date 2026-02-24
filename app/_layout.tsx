import { useRef, useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { useStrategyProfileStore } from '../src/store/strategyProfileStore';
import { useChecklistStore } from '../src/store/checklistStore';
import { useLocaleStore } from '../src/store/localeStore';
import i18n from '../src/i18n';
import "../global.css";

export default function Layout() {
    const { initRevenueCat } = usePurchaseStore();
    const locale = useLocaleStore((s) => s.locale);

    // Sync i18n.locale on every render so children always see correct language (fixes rehydration delay)
    if (locale) i18n.locale = locale;

    useEffect(() => {
        initRevenueCat();
    }, []);

    // V2: Migrate legacy projects to Strategy Profiles once (no data loss)
    useEffect(() => {
        const { projects, checklists } = useChecklistStore.getState();
        useStrategyProfileStore.getState().migrateFromLegacy(projects, checklists);
    }, []);

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="questionnaire" />
                    <Stack.Screen name="strategy-dashboard" />
                    <Stack.Screen name="strategy-builder" />
                    <Stack.Screen name="execution-board" />
                    <Stack.Screen name="checklist/[id]" />
                    <Stack.Screen
                        name="settings"
                        options={{
                            presentation: 'modal',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="focus"
                        options={{
                            presentation: 'modal',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="growth"
                        options={{
                            presentation: 'modal',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="achievements"
                        options={{
                            presentation: 'modal',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="analytics"
                        options={{
                            presentation: 'modal',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="reminders"
                        options={{
                            presentation: 'modal',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="share-card"
                        options={{
                            presentation: 'modal',
                            headerShown: false,
                        }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}
