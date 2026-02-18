import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    useSharedValue,
    Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTutorialStore } from '../../store/useTutorialStore';
import { useThemeStore } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

interface TutorialTooltipProps {
    id: string;
    title: string;
    description: string;
    /** Position for the point of interest (x, y) */
    targetPos?: { x: number; y: number };
    /** Arrow direction */
    arrowDirection?: 'up' | 'down' | 'left' | 'right';
    onClose?: () => void;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
    id,
    title,
    description,
    targetPos,
    arrowDirection = 'up',
    onClose
}) => {
    const { isViewed, markViewed } = useTutorialStore();
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
                withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
            ),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: 0.6 / pulse.value,
    }));

    const handleGotIt = () => {
        markViewed(id);
        if (onClose) onClose();
    };

    const cardBg = isDark ? '#1a1625' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#0f172a';
    const textMuted = isDark ? '#94a3b8' : '#64748b';

    // Hook calls must be above early return
    if (isViewed(id)) return null;

    return (
        <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={StyleSheet.absoluteFill}
        >
            <BlurView intensity={isDark ? 30 : 50} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />

            <View style={styles.overlay}>
                {targetPos && (
                    <View style={[styles.targetWrapper, { left: targetPos.x - 40, top: targetPos.y - 40 }]}>
                        <Animated.View style={[styles.pulseCircle, pulseStyle]} />
                        <View style={styles.targetDot} />
                    </View>
                )}

                <Animated.View
                    entering={FadeIn.delay(300).duration(500)}
                    style={[
                        styles.tooltipCard,
                        { backgroundColor: cardBg },
                        targetPos ? { position: 'absolute', top: targetPos.y + (arrowDirection === 'up' ? 60 : -200), left: 24, right: 24 } : styles.centeredCard
                    ]}
                >
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#1d4ed8" />
                            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                        </View>
                        <Text style={[styles.description, { color: textMuted }]}>{description}</Text>

                        <Pressable onPress={handleGotIt} style={styles.button}>
                            <Text style={styles.buttonText}>Got it!</Text>
                        </Pressable>
                    </View>

                    {targetPos && (
                        <View style={[
                            styles.arrow,
                            { borderBottomColor: cardBg },
                            arrowDirection === 'up' ? { top: -10, alignSelf: 'center' } : { bottom: -10, transform: [{ rotate: '180deg' }], alignSelf: 'center' }
                        ]} />
                    )}
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        padding: 24,
    },
    centeredCard: {
        alignSelf: 'center',
        marginTop: height * 0.3,
        width: width - 48,
    },
    tooltipCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    content: {
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#1d4ed8',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    targetWrapper: {
        position: 'absolute',
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    targetDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1d4ed8',
        borderWidth: 2,
        borderColor: 'white',
    },
    pulseCircle: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1d4ed8',
    },
    arrow: {
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    }
});
