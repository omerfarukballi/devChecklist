import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
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

    const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const iconBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

    return (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()} style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Link href={`/checklist/${checklist.id}`} asChild>
                <Pressable style={s.pressable}>
                    {/* Icon Box */}
                    <View style={[s.iconWrapper, { backgroundColor: iconBg }]}>
                        <MaterialCommunityIcons name={iconName} size={24} color={color} />
                    </View>

                    {/* Text Content */}
                    <View style={s.content}>
                        <Text style={[s.title, { color: colors.text.primary }]} numberOfLines={1}>
                            {checklist.title}
                        </Text>
                        <View style={s.metaRow}>
                            <View style={[s.priorityDot, { backgroundColor: color }]} />
                            <Text style={[s.metaText, { color: colors.text.muted }]}>
                                {tags}
                            </Text>
                        </View>
                    </View>

                    {/* Right: Progress Ring + Delete */}
                    <View style={s.rightSide}>
                        <ProgressRing
                            progress={progress}
                            size={44}
                            strokeWidth={4}
                            color={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                            activeColor={color}
                            showText={true}
                        />
                        {onDelete && (
                            <Pressable
                                onPress={(e) => { e.stopPropagation?.(); onDelete(); }}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={s.deleteBtn}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={15} color={colors.text.muted} />
                            </Pressable>
                        )}
                    </View>
                </Pressable>
            </Link>
        </Animated.View>
    );
};

const s = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 16,
        marginBottom: 8,
        overflow: 'hidden',
    },
    pressable: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    metaText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    rightSide: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        marginLeft: 10,
    },
    deleteBtn: {
        opacity: 0.6,
    },
});
