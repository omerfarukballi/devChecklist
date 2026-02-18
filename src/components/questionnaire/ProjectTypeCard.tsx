import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProjectTypeId } from '../../types';
import { PROJECT_TYPES } from '../../data/projectTypes';
import Animated, { ZoomIn } from 'react-native-reanimated';

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
                style={[
                    s.card,
                    compact ? s.cardCompact : s.cardFull,
                    {
                        backgroundColor: selected ? `${def.color}20` : 'rgba(255,255,255,0.05)',
                        borderColor: selected ? def.color : 'rgba(255,255,255,0.1)',
                        borderWidth: selected ? 2 : 1,
                    }
                ]}
            >
                <View
                    style={[
                        s.iconWrapper,
                        compact ? s.iconWrapperCompact : s.iconWrapperFull,
                        { backgroundColor: `${def.color}20` }
                    ]}
                >
                    <MaterialCommunityIcons name={def.icon} size={compact ? 20 : 28} color={def.color} />
                </View>

                <Text style={s.label} numberOfLines={2}>
                    {def.label}
                </Text>

                {!compact && (
                    <Text style={s.group}>
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
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
    },
    group: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 4,
        textTransform: 'uppercase',
    },
});
