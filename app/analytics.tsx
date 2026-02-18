import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useChecklistStore } from '../src/store/checklistStore';
import { useThemeStore } from '../src/store/themeStore';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AnalyticsScreen() {
    const { checklists, projects } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#07050f' : '#f1f5f9';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';

    // --- Stats Logic ---
    const stats = useMemo(() => {
        const allItems = checklists.flatMap(c => c.items);
        const totalItems = allItems.length;
        const completedItems = allItems.filter(i => i.completed).length;
        const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const activeProjects = projects.filter(p => !p.archived);
        const totalProjects = projects.length;

        // Calculate "velocity" (items completed in last 7 days)
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const weeklyVelocity = allItems.filter(i => i.completed && i.completedAt && i.completedAt > oneWeekAgo).length;

        // Project progress data for bar chart
        const projectProgress = activeProjects.map(p => {
            const checklistIds = p.checklistIds;
            const pChecklists = checklistIds.map(id => checklists.find(c => c.id === id)).filter(Boolean);
            const pItems = pChecklists.flatMap(c => c?.items || []);
            const pCompleted = pItems.filter(i => i.completed).length;
            const pTotal = pItems.length;
            const progress = pTotal > 0 ? (pCompleted / pTotal) : 0;
            return { name: p.name, progress };
        }).slice(0, 5); // Take top 5

        return { totalItems, completedItems, completionRate, totalProjects, weeklyVelocity, projectProgress };
    }, [checklists, projects]);

    // Donut Chart
    const renderDonut = () => {
        const size = 160;
        const strokeWidth = 16;
        const radius = (size - strokeWidth) / 2;
        const checkum = 2 * Math.PI * radius;
        const dashoffset = checkum * (1 - stats.completionRate / 100);

        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Svg width={size} height={size}>
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke={isDark ? '#334155' : '#e2e8f0'} strokeWidth={strokeWidth} fill="none" />
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#10b981"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={checkum}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${size / 2}, ${size / 2}`}
                    />
                </Svg>
                <View style={{ position: 'absolute', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, fontWeight: '900', color: textPrimary }}>{stats.completionRate}%</Text>
                    <Text style={{ fontSize: 13, color: textMuted, fontWeight: '600' }}>COMPLETED</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: bg }]} edges={['top']}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color={textPrimary} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerLabel, { color: textMuted }]}>PREMIUM FEATURE</Text>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Analytics Dashboard 📊</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                    <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <Text style={[styles.statValue, { color: '#6366f1' }]}>{stats.completedItems}</Text>
                        <Text style={[styles.statLabel, { color: textMuted }]}>Tasks Done</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.weeklyVelocity}</Text>
                        <Text style={[styles.statLabel, { color: textMuted }]}>Velocity (7d)</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <Text style={[styles.statValue, { color: '#ec4899' }]}>{stats.totalProjects}</Text>
                        <Text style={[styles.statLabel, { color: textMuted }]}>Total Projects</Text>
                    </View>
                </View>

                {/* Overall Progress Donut */}
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, alignItems: 'center' }]}>
                    <Text style={[styles.cardTitle, { color: textPrimary, alignSelf: 'flex-start' }]}>Overall Completion</Text>
                    {renderDonut()}
                </View>

                {/* Project Breakdown Bar Chart */}
                {stats.projectProgress.length > 0 && (
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                        <Text style={[styles.cardTitle, { color: textPrimary }]}>Project Breakdown</Text>
                        <View style={{ marginTop: 16, gap: 12 }}>
                            {stats.projectProgress.map((p, i) => (
                                <View key={i}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text style={{ fontSize: 13, color: textPrimary, fontWeight: '600' }} numberOfLines={1}>{p.name}</Text>
                                        <Text style={{ fontSize: 12, color: textMuted }}>{Math.round(p.progress * 100)}%</Text>
                                    </View>
                                    <View style={{ height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                                        <Animated.View
                                            style={{
                                                height: '100%',
                                                width: `${p.progress * 100}%`,
                                                backgroundColor: i % 2 === 0 ? '#6366f1' : '#8b5cf6',
                                                borderRadius: 4
                                            }}
                                            entering={FadeInDown.delay(i * 100).springify()}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1 },
    headerLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 16, paddingBottom: 40, gap: 16 },
    summaryGrid: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
    statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    card: { padding: 20, borderRadius: 20, borderWidth: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});
