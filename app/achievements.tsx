import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '../src/store/themeStore';
import { useAchievementStore, ALL_ACHIEVEMENTS } from '../src/store/achievementStore';

const RARITY_COLORS = {
    common: '#94a3b8',
    rare: '#60a5fa',
    epic: '#a78bfa',
    legendary: '#f59e0b',
};

const RARITY_LABELS = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
};

export default function AchievementsScreen() {
    const { colorMode } = useThemeStore();
    const { isUnlocked } = useAchievementStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#07050f' : '#f1f5f9';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';

    const unlockedCount = ALL_ACHIEVEMENTS.filter(a => isUnlocked(a.id)).length;
    const progress = Math.round((unlockedCount / ALL_ACHIEVEMENTS.length) * 100);

    const grouped = {
        legendary: ALL_ACHIEVEMENTS.filter(a => a.rarity === 'legendary'),
        epic: ALL_ACHIEVEMENTS.filter(a => a.rarity === 'epic'),
        rare: ALL_ACHIEVEMENTS.filter(a => a.rarity === 'rare'),
        common: ALL_ACHIEVEMENTS.filter(a => a.rarity === 'common'),
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: bg }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color={textPrimary} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerLabel, { color: textMuted }]}>DEVELOPER ACHIEVEMENTS</Text>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>🏆 Hall of Fame</Text>
                </View>
            </View>

            {/* Progress summary */}
            <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryCount, { color: '#f59e0b' }]}>{unlockedCount}</Text>
                    <Text style={[styles.summaryTotal, { color: textMuted }]}>/ {ALL_ACHIEVEMENTS.length} unlocked</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
                    <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
                </View>
                <Text style={[styles.progressLabel, { color: textMuted }]}>{progress}% complete</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {(Object.entries(grouped) as [keyof typeof grouped, typeof ALL_ACHIEVEMENTS][]).map(([rarity, achievements]) => (
                    <View key={rarity}>
                        <View style={styles.rarityHeader}>
                            <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[rarity] }]} />
                            <Text style={[styles.rarityLabel, { color: RARITY_COLORS[rarity] }]}>
                                {RARITY_LABELS[rarity]}
                            </Text>
                        </View>
                        {achievements.map((achievement, index) => {
                            const unlocked = isUnlocked(achievement.id);
                            return (
                                <Animated.View
                                    key={achievement.id}
                                    entering={FadeInDown.delay(index * 60).duration(300)}
                                >
                                    <View style={[
                                        styles.achievementCard,
                                        {
                                            backgroundColor: unlocked ? achievement.color + '11' : cardBg,
                                            borderColor: unlocked ? achievement.color + '44' : cardBorder,
                                            opacity: unlocked ? 1 : 0.5,
                                        }
                                    ]}>
                                        <View style={[
                                            styles.iconWrapper,
                                            { backgroundColor: unlocked ? achievement.color + '22' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={unlocked ? achievement.icon as any : 'lock-outline'}
                                                size={24}
                                                color={unlocked ? achievement.color : textMuted}
                                            />
                                        </View>
                                        <View style={styles.achievementInfo}>
                                            <Text style={[styles.achievementTitle, { color: unlocked ? textPrimary : textMuted }]}>
                                                {achievement.title}
                                            </Text>
                                            <Text style={[styles.achievementDesc, { color: textMuted }]}>
                                                {achievement.description}
                                            </Text>
                                        </View>
                                        {unlocked && (
                                            <MaterialCommunityIcons name="check-circle" size={20} color={achievement.color} />
                                        )}
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                ))}
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
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    summaryCard: {
        marginHorizontal: 16, marginBottom: 20,
        padding: 16, borderRadius: 16, borderWidth: 1,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 },
    summaryCount: { fontSize: 36, fontWeight: '900' },
    summaryTotal: { fontSize: 16 },
    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
    progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#f59e0b' },
    progressLabel: { fontSize: 12 },
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    rarityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 16 },
    rarityDot: { width: 8, height: 8, borderRadius: 4 },
    rarityLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    achievementCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8,
    },
    iconWrapper: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    achievementInfo: { flex: 1 },
    achievementTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    achievementDesc: { fontSize: 12, lineHeight: 16 },
});
