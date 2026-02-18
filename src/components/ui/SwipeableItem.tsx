import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete?: () => void;
    onComplete?: () => void;
    isCompleted?: boolean;
    showSeparator?: boolean;
}

const MAX_SWIPE = 80;

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
    children,
    onDelete,
    onComplete,
    isCompleted,
    showSeparator = true,
}) => {
    const translateX = useSharedValue(0);

    const gesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            // Only allow right swipe for complete if not already completed
            // Only allow left swipe for delete
            const val = event.translationX;
            if (val > 0 && !onComplete) translateX.value = 0;
            else if (val < 0 && !onDelete) translateX.value = 0;
            else translateX.value = val;
        })
        .onEnd((event) => {
            if (event.translationX > MAX_SWIPE && onComplete) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                if (onComplete) runOnJS(onComplete)();
                translateX.value = withSpring(0);
            } else if (event.translationX < -MAX_SWIPE && onDelete) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                if (onDelete) runOnJS(onDelete)();
                translateX.value = withSpring(0);
            } else {
                translateX.value = withSpring(0);
            }
        });


    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const leftActionStyle = useAnimatedStyle(() => ({
        opacity: translateX.value > 20 ? 1 : 0,
        transform: [{ scale: translateX.value > MAX_SWIPE ? 1.2 : 1 }],
    }));

    const rightActionStyle = useAnimatedStyle(() => ({
        opacity: translateX.value < -20 ? 1 : 0,
        transform: [{ scale: translateX.value < -MAX_SWIPE ? 1.2 : 1 }],
    }));

    return (
        <View style={[s.container, showSeparator && s.separator]}>
            {/* Background Actions */}
            {onComplete && (
                <Animated.View style={[s.leftAction, leftActionStyle]}>
                    <MaterialCommunityIcons
                        name={isCompleted ? "undo-variant" : "check-circle-outline"}
                        size={24}
                        color={isCompleted ? "#94a3b8" : "#22c55e"}
                    />
                    <Text style={s.actionLabel}>{isCompleted ? "UNDO" : "DONE"}</Text>
                </Animated.View>
            )}

            {onDelete && (
                <Animated.View style={[s.rightAction, rightActionStyle]}>
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
                    <Text style={s.actionLabel}>DELETE</Text>
                </Animated.View>
            )}

            <GestureDetector gesture={gesture}>
                <Animated.View style={[s.row, rStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'transparent',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    leftAction: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: MAX_SWIPE + 40,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingLeft: 24,
    },
    rightAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: MAX_SWIPE + 40,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 24,
    },
    actionLabel: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 3,
        letterSpacing: 0.5,
    },
    row: {
        backgroundColor: '#07050f',
    },
});
