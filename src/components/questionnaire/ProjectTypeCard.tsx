import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProjectTypeId } from '../../types';
import { PROJECT_TYPES } from '../../data/projectTypes';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';

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
    const { isDark, colors } = useAppTheme();
    const def = PROJECT_TYPES.find(p => p.id === typeId);
    if (!def) return null;

    const cardBg = selected
        ? `${def.color}20`
        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)');
    const cardBorder = selected
        ? def.color
        : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

    return (
        <Animated.View entering={ZoomIn.delay(index * 50).duration(300)}>
            <Pressable
                onPress={onPress}
                style={[
                    s.card,
                    compact ? s.cardCompact : s.cardFull,
                    {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        borderWidth: selected ? 2 : 1,
                    }
                ]}
            >
                <View
                    style={[
                        s.iconWrapper,
                        compact ? s.iconWrapperCompact : s.iconWrapperFull,
                        { backgroundColor: `${def.color}25` }
                    ]}
                >
                    <MaterialCommunityIcons name={def.icon} size={compact ? 20 : 28} color={def.color} />
                </View>

                <Text style={[s.label, { color: colors.text.primary }]} numberOfLines={2}>
                    {def.label}
                </Text>

                {!compact && (
                    <Text style={[s.group, { color: colors.text.muted }]}>
                        {def.group}
                    </Text>
                )}
            </Pressable>
        </Animated.View>
    );
};

const s = StyleSheet.create({
    card: {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardCompact: {
        padding: 12,
    },
    cardFull: {
        padding: 20,
    },
    iconWrapper: {
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconWrapperCompact: {
        width: 40,
        height: 40,
    },
    iconWrapperFull: {
        width: 56,
        height: 56,
    },
    label: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
    },
    group: {
        fontSize: 12,
        marginTop: 4,
        textTransform: 'uppercase',
    },
});
