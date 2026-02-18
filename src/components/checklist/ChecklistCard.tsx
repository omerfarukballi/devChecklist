import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
    onDelete?: () => void;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({ checklist, progress, index, onDelete }) => {
    const projectDef = PROJECT_TYPES.find(p => p.id === checklist.projectType);
    const iconName = projectDef?.icon || 'code-tags';
    const color = projectDef?.color || theme.colors.accent;

    return (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
            <Link href={`/checklist/${checklist.id}`} asChild>
                <Pressable style={s.card}>
                    <View style={s.iconWrapper}>
                        <MaterialCommunityIcons name={iconName} size={28} color={color} />
                    </View>

                    <View style={s.content}>
                        <Text style={s.title} numberOfLines={1}>{checklist.title}</Text>
                        <View style={s.metaRow}>
                            <View style={[s.dot, { backgroundColor: color }]} />
                            <Text style={s.meta}>{projectDef?.group} • {checklist.phase}</Text>
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
                                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#6b7280" />
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
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    content: { flex: 1 },
    title: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    meta: { color: '#9ca3af', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
    rightSide: { alignItems: 'center', gap: 6, marginLeft: 12 },
    deleteBtn: { padding: 4 },
});
