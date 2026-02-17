import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProjectTypeId } from '../../types';
import { PROJECT_TYPES } from '../../data/projectTypes';
import { theme } from '../../constants/theme';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface ProjectTypeCardProps {
    typeId: ProjectTypeId;
    onPress: () => void;
    selected?: boolean;
    compact?: boolean;
    index?: number;
}

export const ProjectTypeCard: React.FC<ProjectTypeCardProps> = ({
    typeId,
    onPress,
    selected = false,
    compact = false,
    index = 0
}) => {
    const def = PROJECT_TYPES.find(p => p.id === typeId);
    if (!def) return null;

    return (
        <Animated.View entering={ZoomIn.delay(index * 50).duration(300)}>
            <Pressable
                onPress={onPress}
                style={{
                    backgroundColor: selected ? `${def.color}20` : 'rgba(255,255,255,0.05)',
                    borderColor: selected ? def.color : 'rgba(255,255,255,0.1)',
                    borderWidth: selected ? 2 : 1,
                }}
                className={`rounded-2xl ${compact ? 'p-3' : 'p-5'} items-center justify-center mb-0`} // Using margin in parent grid
            >
                <View
                    style={{ backgroundColor: `${def.color}20` }}
                    className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-full items-center justify-center mb-3`}
                >
                    <MaterialCommunityIcons name={def.icon} size={compact ? 20 : 28} color={def.color} />
                </View>

                <Text className="text-white text-center font-bold text-sm" numberOfLines={2}>
                    {def.label}
                </Text>

                {!compact && (
                    <Text className="text-gray-500 text-xs mt-1 uppercase">
                        {def.group}
                    </Text>
                )}
            </Pressable>
        </Animated.View>
    );
};
