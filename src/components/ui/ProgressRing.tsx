import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { theme } from '../../constants/theme';

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;        // background ring color
    activeColor?: string;  // progress ring color
    showText?: boolean;
    textColor?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 60,
    strokeWidth = 6,
    color = 'rgba(255,255,255,0.1)',
    activeColor = theme.colors.accent,
    showText = true,
    textColor = 'white',
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progressValue = useSharedValue(0);

    useEffect(() => {
        progressValue.value = withTiming(progress / 100, { duration: 1000 });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: circumference * (1 - progressValue.value),
        };
    });

    return (
        <View style={[s.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={activeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeLinecap="round"
                    animatedProps={animatedProps}
                    fill="transparent"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            {showText && (
                <View style={s.textOverlay}>
                    <Text style={[s.percentText, { color: textColor }]}>
                        {Math.round(progress)}%
                    </Text>
                </View>
            )}
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentText: {
        fontSize: 10,
        fontWeight: '800',
    },
});
