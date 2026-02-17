import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GeneratedChecklist } from '../../types';
import { PROJECT_TYPES } from '../../data/projectTypes';
import { theme } from '../../constants/theme';
import { ProgressRing } from '../ui/ProgressRing';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface ChecklistCardProps {
    checklist: GeneratedChecklist;
    progress: number;
    index: number;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ checklist, progress, index }) => {
    const projectDef = PROJECT_TYPES.find(p => p.id === checklist.projectType);
    const iconName = projectDef?.icon || 'code-tags';
    const color = projectDef?.color || theme.colors.accent;

    return (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
            <Link href={`/checklist/${checklist.id}`} asChild>
                <Pressable className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 flex-row items-center active:bg-white/10">
                    <View className="mr-4 items-center justify-center bg-white/5 w-12 h-12 rounded-xl">
                        <MaterialCommunityIcons name={iconName} size={28} color={color} />
                    </View>

                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1" numberOfLines={1}>
                            {checklist.title}
                        </Text>
                        <View className="flex-row items-center">
                            <View className={`w-2 h-2 rounded-full mr-2`} style={{ backgroundColor: color }} />
                            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                                {projectDef?.group} • {checklist.phase}
                            </Text>
                        </View>
                    </View>

                    <View className="ml-2">
                        <ProgressRing progress={progress} size={48} strokeWidth={4} color={color} showText={true} />
                    </View>
                </Pressable>
            </Link>
        </Animated.View>
    );
};
