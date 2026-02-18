import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';
import { BlurView } from 'expo-blur';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.bg,
                    borderTopColor: theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.colors.accent,
                tabBarInactiveTintColor: theme.colors.text.muted,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "home" : "home-outline"}
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "telescope" : "compass-outline"}
                            size={28}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
