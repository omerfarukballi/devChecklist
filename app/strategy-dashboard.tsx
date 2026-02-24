/**
 * V2 Strategy Dashboard — Ana sayfa: takip odaklı, net yapı.
 * Overview kartı, progress ring, Next Best Actions, haftalık takip, hızlı aksiyonlar.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStrategyProfileStore } from '../src/store/strategyProfileStore';
import { useChecklistStore } from '../src/store/checklistStore';
import { useThemeStore } from '../src/store/themeStore';
import { suggestStageTransition, STAGE_ORDER } from '../src/core/stage-transition/suggestStage';
import { ProgressRing } from '../src/components/ui/ProgressRing';
import { theme } from '../src/constants/theme';
import type { ProductStage } from '../src/types/strategy';
import { useTranslation } from '../src/hooks/useTranslation';

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

export default function StrategyDashboardScreen() {
  const {
    strategyProfiles,
    activeStrategyProfileId,
    getStrategyProfile,
    setActiveStrategyProfile,
    setStageOverride,
    setStageDisplayOnly,
    addItemsFromStage,
    addNextStageToPlan,
  } = useStrategyProfileStore();
  const userName = useChecklistStore((s) => s.userName);
  const { colorMode } = useThemeStore();
  const { t } = useTranslation();
  const [showPhasePicker, setShowPhasePicker] = useState(false);
  const isDark = colorMode === 'dark';

  const activeId = activeStrategyProfileId ?? strategyProfiles.find((p) => !p.archived)?.id ?? null;
  const profile = activeId ? getStrategyProfile(activeId) : null;

  const bg = isDark ? '#07050f' : '#f1f5f9';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';

  if (strategyProfiles.length === 0) {
    const emptyCardBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
    const emptyCardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';
    const iconCircleBg = isDark ? 'rgba(29,78,216,0.2)' : 'rgba(29,78,216,0.12)';
    const accentMuted = isDark ? theme.colors.accent + '99' : '#1d4ed8';
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <View style={s.empty}>
          <View style={[s.emptyCard, { backgroundColor: emptyCardBg, borderColor: emptyCardBorder }]}>
            <View style={[s.emptyIconWrap, { backgroundColor: iconCircleBg }]}>
              <MaterialCommunityIcons name="compass-outline" size={64} color={theme.colors.accent} />
            </View>
            <Text style={[s.emptyLabel, { color: accentMuted }]}>{t('emptyStateLabel')}</Text>
            <Text style={[s.emptyTitle, { color: textPrimary }]}>{t('emptyStateTitle')}</Text>
            <Text style={[s.emptySub, { color: textSecondary }]}>
              {t('emptyStateSubtitle')}
            </Text>
            <View style={s.emptySteps}>
              <View style={s.emptyStep}>
                <MaterialCommunityIcons name="sitemap-outline" size={20} color={theme.colors.accent} />
                <Text style={[s.emptyStepText, { color: textSecondary }]}>{t('emptyStateStep1')}</Text>
              </View>
              <View style={s.emptyStep}>
                <MaterialCommunityIcons name="format-list-checks" size={20} color={theme.colors.accent} />
                <Text style={[s.emptyStepText, { color: textSecondary }]}>{t('emptyStateStep2')}</Text>
              </View>
              <View style={s.emptyStep}>
                <MaterialCommunityIcons name="chart-line" size={20} color={theme.colors.accent} />
                <Text style={[s.emptyStepText, { color: textSecondary }]}>{t('emptyStateStep3')}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                s.emptyCta,
                { backgroundColor: theme.colors.accent, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => router.push('/strategy-builder')}
            >
              <MaterialCommunityIcons name="rocket-launch-outline" size={22} color="#fff" />
              <Text style={s.emptyCtaText}>{t('emptyStateCta')}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalItems = profile?.plan.prioritizedItems.length ?? 0;
  const completedCount = profile?.plan.prioritizedItems.filter((i) => i.completed).length ?? 0;
  const completionPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  const stageLabel = profile ? STAGE_LABELS[profile.context.stage] ?? profile.context.stage : '—';

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyCompleted =
    profile?.plan.prioritizedItems.filter((i) => i.completed && i.completedAt && i.completedAt > oneWeekAgo).length ?? 0;

  const nextBest = profile?.plan.prioritizedItems.filter((i) => !i.completed).slice(0, 5) ?? [];
  const topTodo = profile?.plan.prioritizedItems.find((i) => !i.completed) ?? null;
  const weeklyFocus = profile?.plan.weeklyFocus ?? [];
  const riskAlerts = profile?.plan.riskAlerts ?? [];

  const incompleteByDomain: Record<string, number> = {};
  profile?.plan.prioritizedItems
    .filter((i) => !i.completed && (i.priority === 'critical' || i.priority === 'high'))
    .forEach((i) => {
      incompleteByDomain[i.domain] = (incompleteByDomain[i.domain] ?? 0) + 1;
    });
  const bottleneckDomain =
    Object.keys(incompleteByDomain).length > 0
      ? Object.entries(incompleteByDomain).sort((a, b) => b[1] - a[1])[0]
      : null;

  const stageSuggestion = profile
    ? suggestStageTransition({
        currentStage: profile.context.stage,
        userCount: profile.userCount,
        completionRatio: profile.completionRatio,
        stageUpdatedAt: profile.stageUpdatedAt,
        stageOverride: profile.stageOverride,
      })
    : null;

  const currentStageIndex = profile ? STAGE_ORDER.indexOf(profile.context.stage) : -1;
  const nextStage: ProductStage | null =
    profile && currentStageIndex >= 0 && currentStageIndex < STAGE_ORDER.length - 1
      ? (() => {
          const next = STAGE_ORDER[currentStageIndex + 1];
          return next === 'plateau' || next === 'pivoting' ? null : next;
        })()
      : null;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      {/* Header: greeting + actions */}
      <View style={[s.header, { borderBottomColor: cardBorder }]}>
        <View>
          <Text style={[s.greeting, { color: textMuted }]}>
            {userName ? `Hi ${userName}` : 'Strategy'}
          </Text>
          <Text style={[s.title, { color: textPrimary }]}>
            {userName ? "Here's your plan" : 'Post-launch plan'}
          </Text>
        </View>
        <View style={s.headerActions}>
          <Pressable onPress={() => router.push('/achievements')} style={[s.headerIconBtn, { backgroundColor: cardBg }]}>
            <MaterialCommunityIcons name="trophy-outline" size={22} color="#f59e0b" />
          </Pressable>
          <Pressable onPress={() => router.push('/settings')} style={[s.headerIconBtn, { backgroundColor: cardBg }]}>
            <MaterialCommunityIcons name="cog-outline" size={22} color={textSecondary} />
          </Pressable>
          <Pressable onPress={() => router.push('/strategy-builder')} style={[s.headerIconBtn, { backgroundColor: theme.colors.accent }]}>
            <MaterialCommunityIcons name="plus" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile picker */}
        {strategyProfiles.filter((p) => !p.archived).length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.profileRow}>
            {strategyProfiles.filter((p) => !p.archived).map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setActiveStrategyProfile(p.id)}
                style={[
                  s.profileChip,
                  { backgroundColor: p.id === activeId ? theme.colors.accent : cardBg, borderColor: cardBorder },
                ]}
              >
                <Text style={[s.profileChipText, { color: p.id === activeId ? '#fff' : textPrimary }]} numberOfLines={1}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {profile && (
          <>
            {/* Overview: progress ring + stage + counts */}
            <View style={[s.overviewCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={s.overviewTop}>
                <ProgressRing
                  progress={completionPct}
                  size={88}
                  strokeWidth={8}
                  color={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
                  activeColor={theme.colors.accent}
                  showText
                  textColor={textPrimary}
                />
                <View style={s.overviewRight}>
                  <Text style={[s.overviewName, { color: textPrimary }]} numberOfLines={1}>{profile.name}</Text>
                  <View style={[s.stageBadge, { backgroundColor: theme.colors.accent + '22' }]}>
                    <MaterialCommunityIcons name="flag-outline" size={14} color={theme.colors.accent} />
                    <Text style={[s.stageText, { color: theme.colors.accent }]}>{stageLabel}</Text>
                  </View>
                  <Text style={[s.overviewCounts, { color: textSecondary }]}>
                    {completedCount} / {totalItems} actions done
                  </Text>
                  <Text style={[s.overviewWeek, { color: textMuted }]}>
                    {weeklyCompleted} completed this week
                  </Text>
                </View>
              </View>
            </View>

            {/* Top priority single to-do */}
            {topTodo && (
              <Pressable
                style={[s.topTodoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => router.push({ pathname: '/execution-board', params: { profileId: profile.id } })}
              >
                <Text style={[s.topTodoLabel, { color: textMuted }]}>Top priority</Text>
                <Text style={[s.topTodoTitle, { color: textPrimary }]} numberOfLines={1}>{topTodo.title}</Text>
                {topTodo.description ? (
                  <Text style={[s.topTodoDesc, { color: textSecondary }]} numberOfLines={2}>{topTodo.description}</Text>
                ) : null}
                <View style={s.topTodoRow}>
                  <View style={[s.priorityDot, { backgroundColor: topTodo.priority === 'critical' ? '#ef4444' : topTodo.priority === 'high' ? '#f59e0b' : '#64748b' }]} />
                  <Text style={[s.topTodoCta, { color: theme.colors.accent }]}>Open Execution →</Text>
                </View>
              </Pressable>
            )}

            {/* Add phase: next stage + pick any phase */}
            <View style={s.addPhaseRow}>
              {nextStage && (
                <Pressable
                  style={[s.addPhaseBtn, { backgroundColor: theme.colors.accent + '22', borderColor: theme.colors.accent + '44' }]}
                  onPress={() => {
                    const result = addNextStageToPlan(profile.id);
                    if (result) {
                      setStageDisplayOnly(profile.id, result.stage);
                      const phaseName = STAGE_LABELS[result.stage] ?? result.stage;
                      if (result.added > 0) {
                        Alert.alert(
                          t('added'),
                          result.added === 1
                            ? t('addedOneAction', { phase: phaseName })
                            : t('addedActions', { count: result.added, phase: phaseName })
                        );
                      }
                    }
                  }}
                >
                  <MaterialCommunityIcons name="arrow-right-circle-outline" size={20} color={theme.colors.accent} />
                  <Text style={[s.addPhaseBtnText, { color: theme.colors.accent }]}>
                    {t('addNext')}: {STAGE_LABELS[nextStage] ?? nextStage}
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[s.addPhaseBtn, s.addPhaseBtnSecondary, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => setShowPhasePicker(true)}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color={textSecondary} />
                <Text style={[s.addPhaseBtnText, { color: textSecondary }]}>{t('addPhase')}</Text>
              </Pressable>
            </View>

            {/* Quick actions */}
            <View style={s.quickActionsRow}>
              <Pressable
                style={[s.quickActionBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}
                onPress={() => router.push({ pathname: '/execution-board', params: { profileId: profile.id } })}
              >
                <MaterialCommunityIcons name="format-list-checks" size={24} color={theme.colors.accent} />
                <Text style={[s.quickActionLabel, { color: textPrimary }]}>Execution</Text>
              </Pressable>
              <Pressable
                style={[s.quickActionBtn, { backgroundColor: theme.colors.accent + '18', borderColor: theme.colors.accent + '44' }]}
                onPress={() => router.push({ pathname: '/focus', params: { profileId: profile.id } })}
              >
                <MaterialCommunityIcons name="timer-outline" size={24} color={theme.colors.accent} />
                <Text style={[s.quickActionLabel, { color: textPrimary }]}>Focus</Text>
              </Pressable>
            </View>

            {/* Next best actions */}
            <Text style={[s.sectionTitle, { color: textPrimary }]}>Next best actions</Text>
            <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {nextBest.length === 0 ? (
                <Text style={[s.muted, { color: textSecondary }]}>All caught up. Open Execution board or regenerate plan.</Text>
              ) : (
                nextBest.map((item) => (
                  <Pressable
                    key={item.instanceId}
                    style={s.actionRow}
                    onPress={() => router.push({ pathname: '/execution-board', params: { profileId: profile.id } })}
                  >
                    <View style={[s.priorityDot, { backgroundColor: item.priority === 'critical' ? '#ef4444' : item.priority === 'high' ? '#f59e0b' : '#64748b' }]} />
                    <Text style={[s.actionTitle, { color: textPrimary }]} numberOfLines={1}>{item.title}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />
                  </Pressable>
                ))
              )}
            </View>

            {/* Tracking: velocity + bottleneck */}
            <Text style={[s.sectionTitle, { color: textPrimary }]}>Tracking</Text>
            <View style={[s.trackingRow, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={s.trackingBlock}>
                <MaterialCommunityIcons name="chart-line-variant" size={20} color={theme.colors.accent} />
                <Text style={[s.trackingValue, { color: textPrimary }]}>{weeklyCompleted}</Text>
                <Text style={[s.trackingLabel, { color: textMuted }]}>This week</Text>
              </View>
              {bottleneckDomain && (
                <View style={[s.trackingBlock, s.trackingBlockBorder, { borderLeftColor: cardBorder }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#f59e0b" />
                  <Text style={[s.trackingValue, s.trackingDomain, { color: '#f59e0b' }]}>{bottleneckDomain[0]}</Text>
                  <Text style={[s.trackingLabel, { color: textMuted }]}>{bottleneckDomain[1]} high-priority left</Text>
                </View>
              )}
            </View>

            {/* This week */}
            {weeklyFocus.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { color: textPrimary }]}>This week</Text>
                <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                  {weeklyFocus.slice(0, 5).map((item) => (
                    <View key={item.instanceId} style={s.actionRow}>
                      <View style={[s.priorityDot, { backgroundColor: '#64748b' }]} />
                      <Text style={[s.actionTitle, { color: textPrimary }]} numberOfLines={1}>{item.title}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Stage suggestion */}
            {stageSuggestion && (
              <>
                <Text style={[s.sectionTitle, { color: textPrimary }]}>Stage suggestion</Text>
                <View style={[s.card, { backgroundColor: theme.colors.accent + '12', borderColor: theme.colors.accent + '33' }]}>
                  <Text style={[s.actionTitle, { color: textPrimary }]}>{stageSuggestion.reason}</Text>
                  <Text style={[s.muted, { color: textSecondary, marginTop: 4 }]}>
                    → {STAGE_LABELS[stageSuggestion.suggestedStage] ?? stageSuggestion.suggestedStage}
                  </Text>
                  <Pressable
                    onPress={() => setStageOverride(profile.id, stageSuggestion!.suggestedStage)}
                    style={[s.cta, { backgroundColor: theme.colors.accent, marginTop: 12 }]}
                  >
                    <Text style={s.ctaText}>Apply</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* Risk alerts */}
            {riskAlerts.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { color: textPrimary }]}>Risk alerts</Text>
                <View style={[s.card, s.riskCard, { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }]}>
                  {riskAlerts.slice(0, 3).map((item) => (
                    <View key={item.instanceId} style={s.actionRow}>
                      <MaterialCommunityIcons name="alert-outline" size={18} color="#ef4444" />
                      <Text style={[s.actionTitle, { color: textPrimary }]} numberOfLines={1}>{item.title}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

          </>
        )}
      </ScrollView>

      {/* Phase picker modal: add items from any stage */}
      <Modal visible={showPhasePicker} transparent animationType="slide">
        <View style={s.phasePickerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowPhasePicker(false)} />
          <View style={[s.phasePickerCard, { backgroundColor: isDark ? '#16142a' : '#fff' }]}>
            <View style={[s.phasePickerHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
            <View style={s.phasePickerHeader}>
              <Text style={[s.phasePickerTitle, { color: textPrimary }]}>Add phase to plan</Text>
              <Pressable onPress={() => setShowPhasePicker(false)} hitSlop={16} style={s.phasePickerClose}>
                <MaterialCommunityIcons name="close" size={24} color={textSecondary} />
              </Pressable>
            </View>
            <Text style={[s.phasePickerSub, { color: textSecondary }]}>
              Tap a phase to merge its actions into your list. Already existing items are skipped.
            </Text>
            <ScrollView style={s.phasePickerList} showsVerticalScrollIndicator={false}>
              {STAGE_ORDER.map((stage) => (
                <Pressable
                  key={stage}
                  style={({ pressed }) => [
                    s.phasePickerItem,
                    { borderColor: cardBorder, backgroundColor: pressed ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : 'transparent' },
                  ]}
                  onPress={() => {
                    if (!profile) return;
                    const added = addItemsFromStage(profile.id, stage);
                    setShowPhasePicker(false);
                    const phaseName = STAGE_LABELS[stage] ?? stage;
                    if (added === 0) {
                      Alert.alert(t('noNewActions'), t('allActionsAlreadyInPlan', { phase: phaseName }));
                    } else {
                      Alert.alert(
                        t('added'),
                        added === 1
                          ? t('addedOneAction', { phase: phaseName })
                          : t('addedActions', { count: added, phase: phaseName })
                      );
                    }
                  }}
                >
                  <MaterialCommunityIcons name="flag-outline" size={22} color={theme.colors.accent} />
                  <Text style={[s.phasePickerItemText, { color: textPrimary }]}>{STAGE_LABELS[stage] ?? stage}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={textMuted} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingBottom: 40 },
  profileRow: { marginBottom: 16, marginHorizontal: -4 },
  profileChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  profileChipText: { fontSize: 14, fontWeight: '600' },

  overviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  overviewTop: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  overviewRight: { flex: 1 },
  overviewName: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  stageBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  stageText: { fontSize: 12, fontWeight: '700' },
  overviewCounts: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  overviewWeek: { fontSize: 12, marginTop: 2 },

  topTodoCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  topTodoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  topTodoTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  topTodoDesc: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  topTodoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topTodoCta: { fontSize: 14, fontWeight: '600' },
  addPhaseRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  addPhaseBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1 },
  addPhaseBtnSecondary: {},
  addPhaseBtnText: { fontSize: 14, fontWeight: '700' },
  quickActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickActionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionLabel: { fontSize: 14, fontWeight: '700' },

  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10, letterSpacing: 0.3 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  actionTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  muted: { fontSize: 14 },

  trackingRow: { flexDirection: 'row', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  trackingBlock: { flex: 1, alignItems: 'center', gap: 4 },
  trackingBlockBorder: { borderLeftWidth: 1 },
  trackingValue: { fontSize: 22, fontWeight: '800' },
  trackingLabel: { fontSize: 12 },
  trackingDomain: { textTransform: 'capitalize' as const },

  riskCard: {},
  cta: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  emptyTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 23, paddingHorizontal: 4, marginBottom: 20 },
  emptySteps: { width: '100%', marginBottom: 28, gap: 12 },
  emptyStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyStepText: { fontSize: 14, flex: 1 },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    width: '100%',
  },
  emptyCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  phasePickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  phasePickerCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 32, maxHeight: '85%' },
  phasePickerHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  phasePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  phasePickerTitle: { fontSize: 20, fontWeight: '800' },
  phasePickerClose: { padding: 4 },
  phasePickerSub: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  phasePickerList: { maxHeight: 360 },
  phasePickerItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 4, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  phasePickerItemText: { flex: 1, fontSize: 17, fontWeight: '600' },
});
