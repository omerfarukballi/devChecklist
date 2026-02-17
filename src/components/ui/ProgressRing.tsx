import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';
import { theme } from '../../constants/theme';

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
    showText?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 60,
    strokeWidth = 6,
    color = theme.colors.accent,
    showText = true
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
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={theme.colors.border}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
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
                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-white text-xs font-bold font-[Inter]">
                        {Math.round(progress)}%
                    </Text>
                </View>
            )}
        </View>
    );
};
