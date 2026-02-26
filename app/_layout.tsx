import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { useLocaleStore } from '../src/store/localeStore';
import { useFounderOSStore } from '../src/store/founderOSStore';
import { STRATEGY_ENGINE_VERSION_KEY, STRATEGY_ENGINE_VERSION } from '../src/store/founderOSStore';
import i18n from '../src/i18n';
import "../global.css";

export default function Layout() {
    const { initRevenueCat } = usePurchaseStore();
    const locale = useLocaleStore((s) => s.locale);

    if (locale) i18n.locale = locale;

    useEffect(() => {
        initRevenueCat();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            AsyncStorage.getItem(STRATEGY_ENGINE_VERSION_KEY).then((v) => {
                const saved = v ? parseInt(v, 10) : 0;
                const { profiles, recalculateAll } = useFounderOSStore.getState();
                if (saved < STRATEGY_ENGINE_VERSION && profiles.length > 0) {
                    recalculateAll();
                    AsyncStorage.setItem(STRATEGY_ENGINE_VERSION_KEY, String(STRATEGY_ENGINE_VERSION));
                }
            });
        }, 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="strategy-dashboard" />
                    <Stack.Screen name="configure" />
                    <Stack.Screen
                        name="configure-edit"
                        options={{ presentation: 'modal', headerShown: false }}
                    />
                    <Stack.Screen
                        name="settings"
                        options={{ presentation: 'modal', headerShown: false }}
                    />
                    <Stack.Screen
                        name="focus"
                        options={{ presentation: 'modal', headerShown: false }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}
