import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { useLocaleStore } from '../src/store/localeStore';
import i18n from '../src/i18n';
import "../global.css";

export default function Layout() {
    const { initRevenueCat } = usePurchaseStore();
    const locale = useLocaleStore((s) => s.locale);

    if (locale) i18n.locale = locale;

    useEffect(() => {
        initRevenueCat();
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
