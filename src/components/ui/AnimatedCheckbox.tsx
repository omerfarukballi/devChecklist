import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { playCompleteSound } from '../../utils/sound';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolateColor } from 'react-native-reanimated';

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
        // Play sound only when marking as done (not unchecking)
        if (!checked) {
            playCompleteSound();
        }
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
        <Pressable onPress={handlePress} style={s.pressable}>
            <Animated.View style={[s.box, animatedContainerStyle]}>
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

const s = StyleSheet.create({
    pressable: {
        padding: 8,
    },
    box: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
