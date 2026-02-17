import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolateColor, withTiming } from 'react-native-reanimated';

interface AnimatedCheckboxProps {
    checked: boolean;
    onToggle: () => void;
    priority?: 'critical' | 'high' | 'medium' | 'low';
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({ checked, onToggle, priority = 'low' }) => {
    const scale = useSharedValue(1);
    const checkProgress = useSharedValue(checked ? 1 : 0);

    useEffect(() => {
        checkProgress.value = withSpring(checked ? 1 : 0, { damping: 15, stiffness: 200 });
    }, [checked]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSpring(0.8, {}, () => {
            scale.value = withSpring(1);
        });
        onToggle();
    };

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            borderColor: interpolateColor(
                checkProgress.value,
                [0, 1],
                [theme.colors.border, theme.colors.priority[priority] || theme.colors.accent]
            ),
            backgroundColor: interpolateColor(
                checkProgress.value,
                [0, 1],
                ['transparent', theme.colors.priority[priority] || theme.colors.accent]
            )
        };
    });

    return (
        <Pressable onPress={handlePress} className="p-2">
            <Animated.View
                className="w-6 h-6 rounded-md border-2 items-center justify-center"
                style={[animatedContainerStyle]}
            >
                <MotiView
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
                    transition={{ type: 'timing', duration: 200 }}
                >
                    <Ionicons name="checkmark" size={16} color="white" />
                </MotiView>
            </Animated.View>
        </Pressable>
    );
};
