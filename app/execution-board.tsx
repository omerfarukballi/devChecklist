/**
 * V2 Execution Board — prioritized strategy items; swipe to complete.
 * Checkbox = mark done; tap row = open detail popup.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStrategyProfileStore } from '../src/store/strategyProfileStore';
import { useThemeStore } from '../src/store/themeStore';
import { SwipeableItem } from '../src/components/ui/SwipeableItem';
import type { StrategyItemInstance, StrategyDomain, ProductStage } from '../src/types/strategy';
import { STAGE_ORDER } from '../src/core/stage-transition/suggestStage';
import { theme } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';

/** Implementation plan order: domain-based (production → launch → … → optimization) */
const DOMAIN_ORDER: StrategyDomain[] = [
  'production',
  'launch',
  'distribution',
  'growth',
  'retention',
  'monetization',
  'analytics',
  'scaling',
  'risk',
  'optimization',
];
const DOMAIN_LABELS: Record<string, string> = {
  production: 'Production & reliability',
  launch: 'Launch',
  distribution: 'Distribution',
  growth: 'Growth',
  retention: 'Retention',
  monetization: 'Monetization',
  analytics: 'Analytics',
  scaling: 'Scaling',
  risk: 'Risk & compliance',
  optimization: 'Optimization',
};
/** Priority order for grouping (critical → high → medium → low) */
const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#64748b',
  low: '#94a3b8',
};

const STAGE_LABELS: Record<string, string> = {
  'pre-launch': 'Pre-launch',
  'just-launched': 'Just launched',
  '0-100-users': '0–100 users',
  '100-1000-users': '100–1K users',
  growth: 'Growth',
  scaling: 'Scaling',
  plateau: 'Plateau',
  pivoting: 'Pivoting',
};

export default function ExecutionBoardScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const { getStrategyProfile, toggleStrategyItem } = useStrategyProfileStore();
  const { colorMode } = useThemeStore();
  const { t } = useTranslation();
  const [detailItem, setDetailItem] = useState<StrategyItemInstance | null>(null);
  const isDark = colorMode === 'dark';

  const profile = profileId ? getStrategyProfile(profileId) : null;

  const bg = isDark ? '#07050f' : '#f1f5f9';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const modalBg = isDark ? '#0f0d1a' : '#ffffff';
  const overlayBg = 'rgba(0,0,0,0.5)';

  if (!profile) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: bg }]}>
        <View style={s.empty}>
          <Text style={[s.emptyText, { color: textPrimary }]}>{t('profileNotFound')}</Text>
          <Pressable onPress={() => router.back()} style={[s.btn, { backgroundColor: cardBg }]}>
            <Text style={[s.btnText, { color: textPrimary }]}>{t('back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStage = profile.context.stage;
  const getPhase = (item: StrategyItemInstance): ProductStage => item.phase ?? currentStage;
  const byPhase = new Map<ProductStage, StrategyItemInstance[]>();
  for (const item of profile.plan.prioritizedItems) {
    const phase = getPhase(item);
    if (!byPhase.has(phase)) byPhase.set(phase, []);
    byPhase.get(phase)!.push(item);
  }
  const phasesInOrder = STAGE_ORDER.filter((p) => byPhase.has(p) && (byPhase.get(p)?.length ?? 0) > 0);

  const renderItem = (item: StrategyItemInstance) => (
    <SwipeableItem
      key={item.instanceId}
      isCompleted={item.completed}
      onComplete={() => toggleStrategyItem(profile.id, item.instanceId)}
      onDelete={() => {}}
      showSeparator={false}
    >
      <View style={[s.row, { backgroundColor: cardBg, borderColor }]}>
        <Pressable
          onPress={() => toggleStrategyItem(profile.id, item.instanceId)}
          style={s.checkboxWrap}
          hitSlop={8}
        >
          <View style={[s.checkbox, item.completed && s.checkboxDone, { borderColor: PRIORITY_COLORS[item.priority] }]}>
            {item.completed && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
          </View>
        </Pressable>
        <Pressable style={s.rowContent} onPress={() => setDetailItem(item)}>
          <Text style={[s.rowTitle, { color: textPrimary }, item.completed && s.strikethrough]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={[s.rowDesc, { color: textSecondary }]} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </Pressable>
      </View>
    </SwipeableItem>
  );

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
        </Pressable>
        <Text style={[s.title, { color: textPrimary }]} numberOfLines={1}>{profile.name}</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {phasesInOrder.map((phase) => {
          const phaseItems = byPhase.get(phase)!;
          const completedInPhase = phaseItems.filter((i) => i.completed).length;
          const totalInPhase = phaseItems.length;
          const byDomain = DOMAIN_ORDER.reduce<Record<string, StrategyItemInstance[]>>((acc, d) => {
            acc[d] = phaseItems.filter((i) => i.domain === d);
            return acc;
          }, {});
          const otherInPhase = phaseItems.filter((i) => !DOMAIN_ORDER.includes(i.domain as StrategyDomain));
          return (
            <View key={phase} style={s.phaseBlock}>
              <View style={[s.phaseBlockHeader, { backgroundColor: theme.colors.accent + '18', borderColor: theme.colors.accent + '44' }]}>
                <MaterialCommunityIcons name="flag-outline" size={20} color={theme.colors.accent} />
                <Text style={[s.phaseBlockTitle, { color: textPrimary }]}>{STAGE_LABELS[phase] ?? phase}</Text>
                <Text style={[s.phaseBlockCount, { color: textSecondary }]}>
                  {completedInPhase}/{totalInPhase}
                </Text>
                {completedInPhase < totalInPhase ? (
                  <Pressable
                    onPress={() => phaseItems.filter((i) => !i.completed).forEach((i) => toggleStrategyItem(profile.id, i.instanceId))}
                    style={[s.phaseBlockDoneAll, { backgroundColor: theme.colors.accent + '33' }]}
                  >
                    <MaterialCommunityIcons name="check-all" size={18} color={theme.colors.accent} />
                    <Text style={[s.phaseBlockDoneAllText, { color: theme.colors.accent }]}>{t('completeAll')}</Text>
                  </Pressable>
                ) : null}
              </View>
              {DOMAIN_ORDER.map((domain) => {
                const items = byDomain[domain];
                if (!items?.length) return null;
                return (
                  <View key={domain} style={s.section}>
                    <View style={[s.sectionHeader, { borderBottomColor: borderColor }]}>
                      <Text style={[s.domainLabel, { color: textPrimary }]}>{DOMAIN_LABELS[domain] ?? domain}</Text>
                    </View>
                    {items.map(renderItem)}
                  </View>
                );
              })}
              {otherInPhase.length > 0 && (
                <View style={s.section}>
                  <View style={[s.sectionHeader, { borderBottomColor: borderColor }]}>
                    <Text style={[s.domainLabel, { color: textPrimary }]}>Other</Text>
                  </View>
                  {otherInPhase.map(renderItem)}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Detail modal: tap row opens this */}
      <Modal visible={!!detailItem} transparent animationType="fade">
        <Pressable style={[s.modalOverlay, { backgroundColor: overlayBg }]} onPress={() => setDetailItem(null)}>
          <Pressable style={[s.modalCard, { backgroundColor: modalBg }]} onPress={(e) => e.stopPropagation()}>
            {detailItem && (
              <>
                <View style={s.modalHeader}>
                  <View style={[s.modalPriorityBadge, { backgroundColor: PRIORITY_COLORS[detailItem.priority] + '22' }]}>
                    <Text style={[s.modalPriorityText, { color: PRIORITY_COLORS[detailItem.priority] }]}>
                      {DOMAIN_LABELS[detailItem.domain] ?? detailItem.domain}
                    </Text>
                  </View>
                  <Pressable onPress={() => setDetailItem(null)} hitSlop={12}>
                    <MaterialCommunityIcons name="close" size={24} color={textSecondary} />
                  </Pressable>
                </View>
                <Text style={[s.modalTitle, { color: textPrimary }]}>{detailItem.title}</Text>
                {detailItem.description ? (
                  <Text style={[s.modalDesc, { color: textSecondary }]}>{detailItem.description}</Text>
                ) : null}
                {detailItem.actionSteps?.length > 0 && (
                  <View style={s.modalSteps}>
                    <Text style={[s.modalStepsTitle, { color: textPrimary }]}>Steps</Text>
                    {detailItem.actionSteps.map((step, i) => (
                      <View key={i} style={s.modalStepRow}>
                        <Text style={[s.modalStepNum, { color: theme.colors.accent }]}>{i + 1}.</Text>
                        <Text style={[s.modalStepText, { color: textSecondary }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Pressable
                  style={[s.modalDoneBtn, { backgroundColor: theme.colors.accent }]}
                  onPress={() => {
                    toggleStrategyItem(profile!.id, detailItem.instanceId);
                    setDetailItem(null);
                  }}
                >
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  <Text style={s.modalDoneBtnText}>{t('markDone')}</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { marginRight: 12 },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  phaseBlock: { marginBottom: 28 },
  phaseBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  phaseBlockTitle: { fontSize: 16, fontWeight: '800', flex: 1 },
  phaseBlockCount: { fontSize: 14, fontWeight: '700' },
  phaseBlockDoneAll: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  phaseBlockDoneAllText: { fontSize: 13, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionHeader: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1 },
  domainLabel: { fontSize: 14, fontWeight: '800', textTransform: 'capitalize' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  checkboxWrap: { marginRight: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#10b981', borderColor: '#10b981' },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowDesc: { fontSize: 13, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.7 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { fontSize: 16 },
  btn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalPriorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modalPriorityText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  modalDesc: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  modalSteps: { marginBottom: 20 },
  modalStepsTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  modalStepRow: { flexDirection: 'row', marginBottom: 6, gap: 6 },
  modalStepNum: { fontSize: 14, fontWeight: '600', minWidth: 20 },
  modalStepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  modalDoneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  modalDoneBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
