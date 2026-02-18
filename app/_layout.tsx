import { useRef, useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePurchaseStore } from '../src/store/purchaseStore';
import "../global.css";

export default function Layout() {
    const { initRevenueCat } = usePurchaseStore();

    useEffect(() => {
        initRevenueCat();
    }, []);

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="questionnaire" />
                    <Stack.Screen name="checklist/[id]" />
                </Stack>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}
