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

    return (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
            <Link href={`/checklist/${checklist.id}`} asChild>
                <Pressable
                    style={[s.card, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    }]}
                >
                    <View style={[s.iconWrapper, {
                        backgroundColor: isDark ? 'rgba(111, 107, 107, 0.05)' : 'rgba(0,0,0,0.05)',
                    }]}>
                        <MaterialCommunityIcons name={iconName} size={32} color={color} />
                    </View>

                    <View style={s.content}>
                        <Text style={[s.title, { color: colors.text.primary }]} numberOfLines={1}>
                            {checklist.title}
                        </Text>
                        <View style={s.metaRow}>
                            <Text style={[s.techStack, { color: color }]}>
                                {projectDef?.label}
                            </Text>
                            <Text style={[s.metaSeparator, { color: colors.text.muted }]}> • </Text>
                            <Text style={[s.meta, { color: colors.text.secondary }]}>
                                {checklist.phase}
                            </Text>
                        </View>
                    </View>

                    <View style={s.rightSide}>
                        <ProgressRing progress={progress} size={44} strokeWidth={4} color={color} showText={true} />
                        {onDelete && (
                            <Pressable
                                onPress={(e) => { e.stopPropagation?.(); onDelete(); }}
                                style={s.deleteBtn}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
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
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: 16,
    },
    content: { flex: 1 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    techStack: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    metaSeparator: { fontSize: 13 },
    meta: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
    rightSide: { alignItems: 'center', gap: 6, marginLeft: 12 },
    deleteBtn: { padding: 4 },
});
