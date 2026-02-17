import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { theme } from '../src/constants/theme';
import "../global.css";

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" backgroundColor={theme.colors.bg} />
            <View className="flex-1" style={{ backgroundColor: theme.colors.bg }}>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="checklist/[id]" />
                    <Stack.Screen name="questionnaire" />
                </Stack>
            </View>
        </GestureHandlerRootView>
    );
}
