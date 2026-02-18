import React, { useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
    interpolateColor,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { playCompleteSound } from '../../utils/sound';

const SWIPE_THRESHOLD = 72;    // how far to drag before action triggers
const MAX_SWIPE = 90;           // max visible drag distance
const ACTION_WIDTH = 80;        // width of each action reveal

interface SwipeableItemProps {
    children: React.ReactNode;
    onComplete: () => void;    // swipe right → mark done / undo
    onDelete: () => void;      // swipe left → delete
    isCompleted: boolean;
    /** If true adds a bottom separator line */
    showSeparator?: boolean;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
    children,
    onComplete,
    onDelete,
    isCompleted,
    showSeparator,
}) => {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const rowBg = isDark ? '#07050f' : '#ffffff';
    const separatorColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);
    const isActionTriggered = useSharedValue(false);

    const snapBack = useCallback(() => {
        'worklet';
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
        isActionTriggered.value = false;
    }, []);

    const handleCompleteWithSound = useCallback(() => {
        // Play sound only when completing (not undoing)
        if (!isCompleted) {
            playCompleteSound();
        }
        onComplete();
    }, [onComplete, isCompleted]);

    const triggerComplete = useCallback(() => {
        // flash to full left then snap back
        translateX.value = withTiming(ACTION_WIDTH + 20, { duration: 80 }, () => {
            runOnJS(handleCompleteWithSound)();
            translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
            isActionTriggered.value = false;
        });
    }, [handleCompleteWithSound]);

    const triggerDelete = useCallback(() => {
        translateX.value = withTiming(-(ACTION_WIDTH + 20), { duration: 80 }, () => {
            runOnJS(onDelete)();
            translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
            isActionTriggered.value = false;
        });
    }, [onDelete]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-8, 8])
        .failOffsetY([-5, 5])
        .onStart(() => {
            startX.value = translateX.value;
            isActionTriggered.value = false;
        })
        .onUpdate((e) => {
            const newX = startX.value + e.translationX;
            // Clamp to [-MAX_SWIPE, MAX_SWIPE] with rubber band feel
            if (newX > 0) {
                translateX.value = Math.min(newX, MAX_SWIPE);
            } else {
                translateX.value = Math.max(newX, -MAX_SWIPE);
            }
        })
        .onEnd(() => {
            if (translateX.value > SWIPE_THRESHOLD) {
                runOnJS(triggerComplete)();
            } else if (translateX.value < -SWIPE_THRESHOLD) {
                runOnJS(triggerDelete)();
            } else {
                snapBack();
            }
        });

    // Animated row style
    const rowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    // Left (complete) action bg fades in when swiping right
    const leftBgStyle = useAnimatedStyle(() => {
        const progress = Math.max(0, translateX.value) / SWIPE_THRESHOLD;
        return {
            opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
            backgroundColor: isCompleted
                ? interpolateColor(progress, [0, 1], ['#1f2937', '#374151'])
                : interpolateColor(progress, [0, 1], ['#14532d', '#16a34a']),
        };
    });

    // Right (delete) action bg fades in when swiping left
    const rightBgStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
        backgroundColor: '#7f1d1d',
    }));

    // Icon scale for left action
    const leftIconStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    translateX.value,
                    [0, SWIPE_THRESHOLD],
                    [0.5, 1],
                    Extrapolation.CLAMP
                ),
            },
        ],
    }));

    // Icon scale for right action
    const rightIconStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    translateX.value,
                    [-SWIPE_THRESHOLD, 0],
                    [1, 0.5],
                    Extrapolation.CLAMP
                ),
            },
        ],
    }));

    return (
        <View style={[s.container, showSeparator && { borderBottomWidth: 1, borderBottomColor: separatorColor }]}>
            {/* Left action background (swipe right = complete) */}
            <Animated.View style={[s.leftAction, leftBgStyle]}>
                <Animated.View style={leftIconStyle}>
                    <MaterialCommunityIcons
                        name={isCompleted ? 'undo-variant' : 'check-bold'}
                        size={22}
                        color="white"
                    />
                    <Text style={s.actionLabel}>{isCompleted ? 'Undo' : 'Done'}</Text>
                </Animated.View>
            </Animated.View>

            {/* Right action background (swipe left = delete) */}
            <Animated.View style={[s.rightAction, rightBgStyle]}>
                <Animated.View style={rightIconStyle}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="white" />
                    <Text style={s.actionLabel}>Delete</Text>
                </Animated.View>
            </Animated.View>

            {/* Swipeable content */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[s.row, { backgroundColor: rowBg }, rowStyle]}>
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
    row: {},
});
