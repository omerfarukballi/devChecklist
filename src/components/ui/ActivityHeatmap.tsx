import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { useAppTheme } from '../../hooks/useAppTheme';
import { GeneratedChecklist } from '../../types';

interface ActivityHeatmapProps {
    checklists: GeneratedChecklist[];
    color: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ checklists, color }) => {
    const { isDark, colors } = useAppTheme();

    // Calculate activity data
    const activityData = useMemo(() => {
        const stats: Record<string, number> = {};
        const hourly: number[] = new Array(24).fill(0);

        checklists.forEach(list => {
            list.items.forEach(item => {
                if (item.completed && item.completedAt) {
                    const date = new Date(item.completedAt);
                    const dateStr = date.toISOString().split('T')[0];
                    stats[dateStr] = (stats[dateStr] || 0) + 1;

                    const hour = date.getHours();
                    hourly[hour]++;
                }
            });
        });

        return { stats, hourly };
    }, [checklists]);

    // Generate grid for last 14 weeks (98 days)
    const gridData = useMemo(() => {
        const days = [];
        const now = new Date();
        // Start from the Sunday of 13 weeks ago
        const startDate = new Date();
        startDate.setDate(now.getDate() - 97);
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        for (let i = 0; i < 98; i++) {
            const current = new Date(startDate);
            current.setDate(startDate.getDate() + i);
            const dateStr = current.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                count: activityData.stats[dateStr] || 0,
            });
        }
        return days;
    }, [activityData.stats]);

    const maxCount = Math.max(...Object.values(activityData.stats), 1);
    const maxHourCount = Math.max(...activityData.hourly, 1);

    const ITEM_SIZE = 12;
    const GAP = 3;

    return (
        <View style={s.container}>
            <View style={s.section}>
                <View style={s.header}>
                    <Text style={[s.title, { color: colors.text.primary }]}>Activity Intensity</Text>
                    <Text style={[s.subtitle, { color: colors.text.muted }]}>Last 14 Weeks</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gridScroll}>
                    <Svg width={(ITEM_SIZE + GAP) * 14} height={(ITEM_SIZE + GAP) * 7}>
                        {gridData.map((day, i) => {
                            const week = Math.floor(i / 7);
                            const dow = i % 7;
                            const opacity = day.count === 0 ? 0.05 : Math.max(0.2, (day.count / maxCount));

                            return (
                                <Rect
                                    key={day.date}
                                    x={week * (ITEM_SIZE + GAP)}
                                    y={dow * (ITEM_SIZE + GAP)}
                                    width={ITEM_SIZE}
                                    height={ITEM_SIZE}
                                    rx={2}
                                    fill={color}
                                    opacity={opacity}
                                />
                            );
                        })}
                    </Svg>
                </ScrollView>
            </View>

            <View style={[s.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />

            <View style={s.section}>
                <View style={s.header}>
                    <Text style={[s.title, { color: colors.text.primary }]}>Focus Hours</Text>
                    <Text style={[s.subtitle, { color: colors.text.muted }]}>Daily Hourly Distribution</Text>
                </View>

                <View style={s.hourlyChart}>
                    {activityData.hourly.map((count, hour) => {
                        const height = (count / maxHourCount) * 40;
                        const isActive = count > 0;
                        return (
                            <View key={hour} style={s.hourCol}>
                                <View
                                    style={[
                                        s.hourBar,
                                        {
                                            height: Math.max(height, 2),
                                            backgroundColor: isActive ? color : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                            opacity: isActive ? 1 : 0.3
                                        }
                                    ]}
                                />
                                {hour % 6 === 0 && (
                                    <Text style={[s.hourLabel, { color: colors.text.muted }]}>{hour}h</Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    container: {
        padding: 4,
    },
    section: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    gridScroll: {
        paddingRight: 20,
    },
    divider: {
        height: 1,
        marginBottom: 20,
    },
    hourlyChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 4,
    },
    hourCol: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    hourBar: {
        width: '70%',
        borderRadius: 2,
    },
    hourLabel: {
        fontSize: 8,
        fontWeight: '700',
        position: 'absolute',
        bottom: -14,
    },
});
