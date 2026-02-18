import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { RiskReport, RiskLevel } from '../../hooks/useRiskRadar';

const LEVEL_CONFIG: Record<RiskLevel, { color: string; icon: string; label: string; bg: string }> = {
    safe: { color: '#22c55e', icon: 'shield-check', label: 'Healthy', bg: 'rgba(34,197,94,0.12)' },
    warning: { color: '#f59e0b', icon: 'shield-alert', label: 'Needs Attention', bg: 'rgba(245,158,11,0.12)' },
    danger: { color: '#ef4444', icon: 'shield-off', label: 'At Risk', bg: 'rgba(239,68,68,0.12)' },
};

const PRIORITY_COLORS: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#f59e0b',
    low: '#22c55e',
};

interface RiskRadarCardProps {
    report: RiskReport;
}

export function RiskRadarCard({ report }: RiskRadarCardProps) {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const [modalVisible, setModalVisible] = useState(false);

    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';
    const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const modalBg = isDark ? '#0f0d1a' : '#ffffff';

    const cfg = LEVEL_CONFIG[report.level];

    return (
        <>
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                    <View style={[styles.iconWrapper, { backgroundColor: cfg.bg }]}>
                        <MaterialCommunityIcons name={cfg.icon as any} size={20} color={cfg.color} />
                    </View>

                    <View style={styles.info}>
                        <Text style={[styles.label, { color: textMuted }]}>Health Score</Text>
                        <View style={styles.scoreRow}>
                            <Text style={[styles.score, { color: cfg.color }]}>{report.healthScore}</Text>
                            <Text style={[styles.scoreMax, { color: textMuted }]}>/100</Text>
                            <View style={[styles.levelBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                                <Text style={[styles.levelText, { color: cfg.color }]}>{cfg.label}</Text>
                            </View>
                        </View>
                    </View>

                    {report.risks.length > 0 && (
                        <View style={[styles.riskCount, { backgroundColor: '#ef444422' }]}>
                            <Text style={styles.riskCountText}>{report.risks.length}</Text>
                        </View>
                    )}

                    <MaterialCommunityIcons name="chevron-right" size={18} color={textMuted} />
                </Pressable>
            </Animated.View>

            {/* Risk Detail Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <Pressable style={styles.overlay} onPress={() => setModalVisible(false)} />
                <View style={[styles.sheet, { backgroundColor: modalBg }]}>
                    <View style={styles.handle} />
                    <View style={styles.sheetHeader}>
                        <MaterialCommunityIcons name={cfg.icon as any} size={24} color={cfg.color} />
                        <Text style={[styles.sheetTitle, { color: textPrimary }]}>Risk Radar</Text>
                        <View style={[styles.levelBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                            <Text style={[styles.levelText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                    </View>

                    {/* Score bar */}
                    <View style={styles.scoreSection}>
                        <View style={[styles.scoreTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
                            <View style={[styles.scoreFill, { width: `${report.healthScore}%` as any, backgroundColor: cfg.color }]} />
                        </View>
                        <Text style={[styles.scoreLabel, { color: textMuted }]}>{report.healthScore}% healthy</Text>
                    </View>

                    {report.risks.length === 0 ? (
                        <View style={styles.emptyRisks}>
                            <MaterialCommunityIcons name="check-circle-outline" size={40} color="#22c55e" />
                            <Text style={[styles.emptyText, { color: textPrimary }]}>No critical issues found!</Text>
                            <Text style={[styles.emptySubtext, { color: textMuted }]}>Keep completing your checklist items.</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.risksTitle, { color: textMuted }]}>ISSUES TO ADDRESS</Text>
                            {report.risks.map((risk, i) => (
                                <View key={i} style={[styles.riskRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                                    <View style={[styles.riskDot, { backgroundColor: PRIORITY_COLORS[risk.priority] ?? '#f59e0b' }]} />
                                    <View style={styles.riskInfo}>
                                        <Text style={[styles.riskMessage, { color: textPrimary }]}>⚠️ {risk.message}</Text>
                                        <Text style={[styles.riskMeta, { color: textMuted }]}>{risk.phase} phase · {risk.priority} priority</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <Pressable style={[styles.closeBtn, { backgroundColor: cfg.color }]} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeBtnText}>Got it</Text>
                    </Pressable>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 12,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: { flex: 1 },
    label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    score: { fontSize: 22, fontWeight: '900' },
    scoreMax: { fontSize: 14, fontWeight: '500', marginTop: 4 },
    levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
    levelText: { fontSize: 11, fontWeight: '700' },
    riskCount: {
        width: 24, height: 24, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    riskCountText: { color: '#ef4444', fontSize: 12, fontWeight: '900' },
    // Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#374151', alignSelf: 'center', marginBottom: 20 },
    sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    sheetTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
    scoreSection: { marginBottom: 24 },
    scoreTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
    scoreFill: { height: '100%', borderRadius: 4 },
    scoreLabel: { fontSize: 12, fontWeight: '600' },
    emptyRisks: { alignItems: 'center', paddingVertical: 32, gap: 8 },
    emptyText: { fontSize: 17, fontWeight: 'bold' },
    emptySubtext: { fontSize: 14 },
    risksTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
    riskDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
    riskInfo: { flex: 1 },
    riskMessage: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    riskMeta: { fontSize: 12 },
    closeBtn: { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
