import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GeneratedChecklist } from '../../types';
import { PROJECT_TYPES } from '../../data/projectTypes';
import { theme } from '../../constants/theme';
import { ProgressRing } from '../ui/ProgressRing';
import { useAppTheme } from '../../hooks/useAppTheme';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface ChecklistCardProps {
    checklist: GeneratedChecklist;
    progress: number;
    index: number;
    onDelete?: () => void;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ checklist, progress, index, onDelete }) => {
    const { isDark, colors } = useAppTheme();
    const projectDef = PROJECT_TYPES.find(p => p.id === checklist.projectType);
    const iconName = projectDef?.icon || 'code-tags';
    const color = projectDef?.color || theme.colors.accent;

    const tags = checklist.techStack && checklist.techStack.length > 0
        ? checklist.techStack.slice(0, 2).map(t => t.toUpperCase()).join(' • ')
        : checklist.phase.toUpperCase();

    return (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push(`/checklist/${checklist.id}`)}
                style={[s.card, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }]}
            >
                {/* Icon Box */}
                <View style={[s.iconWrapper, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                }]}>
                    <MaterialCommunityIcons name={iconName} size={24} color={color} />
                </View>

                {/* Title + Tags */}
                <View style={s.content}>
                    <Text style={[s.title, { color: colors.text.primary }]} numberOfLines={1}>
                        {checklist.title}
                    </Text>
                    <View style={s.metaRow}>
                        <View style={[s.dot, { backgroundColor: color }]} />
                        <Text style={[s.metaText, { color: colors.text.muted }]}>
                            {tags}
                        </Text>
                    </View>
                </View>

                {/* Progress Ring + Delete */}
                <View style={s.right}>
                    <ProgressRing
                        progress={progress}
                        size={44}
                        strokeWidth={4}
                        color={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}
                        activeColor={color}
                        showText={true}
                        textColor={isDark ? '#ffffff' : '#0f172a'}
                    />
                    {onDelete && (
                        <TouchableOpacity
                            onPress={onDelete}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={s.deleteBtn}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={15} color={colors.text.muted} />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const s = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    metaText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    right: {
        alignItems: 'center',
        gap: 4,
        marginLeft: 8,
    },
    deleteBtn: {
        opacity: 0.6,
    },
});
