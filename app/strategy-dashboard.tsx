import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Dimensions, Alert, NativeSyntheticEvent, NativeScrollEvent, useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFounderOSStore } from '../src/store/founderOSStore';
import { useThemeStore } from '../src/store/themeStore';
import { usePurchaseStore } from '../src/store/purchaseStore';
import {
  LIFECYCLE_STAGE_LABELS, BOTTLENECK_LABELS,
  LIFECYCLE_STAGES, type LifecycleStage,
  extractTasks, asDNAArray, dnaValueLabel,
} from '../src/types/founderOS';
import { theme } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useLocaleStore } from '../src/store/localeStore';
import { PremiumGate } from '../src/components/PremiumGate';
import { PaywallModal } from '../src/components/PaywallModal';
import { FloatingNavbar } from '../src/components/FloatingNavbar';

const { width: SCREEN_W } = Dimensions.get('window');

const CHIP_WIDTH = 92;
const CHIP_GAP = 4;
const CHIP_PAD = 16;

const RISK_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export default function StrategyDashboardScreen() {
  const { profiles, activeProfileId, getProfile, setActiveProfile, setStage, recalculateAll } = useFounderOSStore();
  const { colorMode } = useThemeStore();
  const { isPremium } = usePurchaseStore();
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale) ?? 'en';
  const isDark = colorMode === 'dark';
  const [paywallVisible, setPaywallVisible] = useState(false);
  const showPaywall = () => setPaywallVisible(true);
  const pagerRef = useRef<ScrollView>(null);
  const chipsScrollRef = useRef<ScrollView>(null);

  const prevLocale = useRef(locale);
  useEffect(() => {
    if (prevLocale.current !== locale && profiles.length > 0) {
      recalculateAll();
    }
    prevLocale.current = locale;
  }, [locale]);

  const activeId = activeProfileId ?? profiles[0]?.id ?? null;
  const activeIndex = profiles.findIndex((p) => p.id === activeId);

  const onSwipeEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    const target = profiles[idx];
    if (target && target.id !== activeId) {
      if (!isPremium && idx > 0) { showPaywall(); pagerRef.current?.scrollTo({ x: 0, animated: true }); return; }
      setActiveProfile(target.id);
    }
  }, [profiles, activeId, isPremium]);

  const scrollChipsToActive = useCallback(() => {
    if (profiles.length <= 1) return;
    const totalWidth = CHIP_PAD * 2 + profiles.length * CHIP_WIDTH + (profiles.length - 1) * CHIP_GAP;
    const chipLeft = CHIP_PAD + activeIndex * (CHIP_WIDTH + CHIP_GAP);
    const scrollX = Math.max(0, Math.min(totalWidth - SCREEN_W, chipLeft - SCREEN_W / 2 + CHIP_WIDTH / 2));
    chipsScrollRef.current?.scrollTo({ x: scrollX, animated: true });
  }, [profiles.length, activeIndex]);

  useEffect(() => {
    scrollChipsToActive();
  }, [activeIndex, scrollChipsToActive]);

  const onChipPress = useCallback((index: number) => {
    if (index === activeIndex) return;
    if (!isPremium && index > 0) {
      showPaywall();
      return;
    }
    const target = profiles[index];
    if (target) {
      setActiveProfile(target.id);
      pagerRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
    }
  }, [activeIndex, isPremium, profiles, showPaywall]);

  const [contentScrollY, setContentScrollY] = useState(0);
  const showProductMenu = contentScrollY <= 50;
  useEffect(() => {
    setContentScrollY(0);
  }, [activeIndex]);

  const colorScheme = useColorScheme();
  const isLight = colorScheme !== 'dark';
  const bg = isDark ? '#07050f' : '#f1f5f9';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const surfaceDark = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

  // Header & chips: dark = white for selected, light = black for selected; unselected = muted
  const headerLabelColor = isLight ? '#000000' : '#ffffff';
  const headerTitleColor = isLight ? '#000000' : '#ffffff';
  const chipSelectedText = isLight ? '#000000' : '#ffffff';
  const chipInactiveBg = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)';
  const chipInactiveText = isLight ? '#64748b' : '#94a3b8';
  const chipInactiveBorder = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)';
  const dotActiveColor = isLight ? '#000000' : '#ffffff';
  const dotInactiveColor = isLight ? '#94a3b8' : '#64748b';

  // Light mode: CTA text MUST be dark so it's visible (button can fail to render blue after orientation)
  const isLightMode = colorScheme === 'light';
  const emptyCtaBg = '#1d4ed8';
  const emptyCtaTextColor = isLightMode ? '#0f172a' : '#ffffff';

  // Empty state
  if (profiles.length === 0) {
    return (
      <SafeAreaView style={[st.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <View style={st.empty}>
          <View style={[st.emptyCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[st.emptyIconWrap, { backgroundColor: isDark ? 'rgba(29,78,216,0.2)' : 'rgba(29,78,216,0.12)' }]}>
              <MaterialCommunityIcons name="shield-half-full" size={64} color={theme.colors.accent} />
            </View>
            <Text style={[st.emptyLabel, { color: theme.colors.accent + '99' }]}>{t('founderOS')}</Text>
            <Text style={[st.emptyTitle, { color: textPrimary }]}>{t('emptyStateTitle')}</Text>
            <Text style={[st.emptySub, { color: textSecondary }]}>{t('emptyStateSubtitle')}</Text>
            <View style={st.emptySteps}>
              <EmptyStep icon="dna" text={t('emptyStep1')} color={textSecondary} />
              <EmptyStep icon="account-cog-outline" text={t('emptyStep2')} color={textSecondary} />
              <EmptyStep icon="target" text={t('emptyStep3')} color={textSecondary} />
            </View>
            <Pressable
              style={({ pressed }) => [
                st.emptyCta,
                {
                  backgroundColor: emptyCtaBg,
                  borderWidth: 2,
                  borderColor: emptyCtaBg,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              onPress={() => router.push('/configure')}
            >
              <View style={{ alignSelf: 'center', marginBottom: 6 }}>
                <MaterialCommunityIcons name="rocket-launch-outline" size={28} color={emptyCtaTextColor} />
              </View>
              <Text style={[st.emptyCtaText, { color: emptyCtaTextColor }]}>{t('emptyStateCta')}</Text>
            </Pressable>
          </View>
        </View>
        <FloatingNavbar onShowPaywall={showPaywall} />
        <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[st.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      {/* Centered header */}
      <View style={[st.header, {
        borderBottomColor: cardBorder,
        backgroundColor: isDark ? 'rgba(7,5,15,0.6)' : 'rgba(241,245,249,0.5)',
      }]}>
        <Text style={[st.headerLabel, { color: headerLabelColor }]}>{t('founderOS')}</Text>
        <Text
          style={[
            st.headerTitle,
            { color: headerTitleColor },
            !isLight && st.headerTitleShadow,
          ]}
          numberOfLines={1}
        >
          {getProfile(activeId!)?.name ?? ''}
        </Text>
        {/* Product switcher: chips + dots — hide when user scrolls down */}
        {profiles.length > 1 && showProductMenu && (
          <View style={st.chipWrap}>
            <ScrollView
              ref={chipsScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[st.chipStripContent, { paddingHorizontal: CHIP_PAD }]}
              style={st.chipStrip}
            >
              {profiles.map((p, i) => {
                const isActive = i === activeIndex;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => onChipPress(i)}
                    style={({ pressed }) => [
                      st.chip,
                      isActive && st.chipActive,
                      {
                        backgroundColor: isActive ? '#1d4ed8' : chipInactiveBg,
                        borderColor: isActive ? '#1d4ed8' : chipInactiveBorder,
                        opacity: pressed ? 0.9 : 1,
                      },
                      isActive && {
                        shadowColor: '#1d4ed8',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 4,
                      },
                    ]}
                  >
                    <Text
                      style={[st.chipText, { color: isActive ? chipSelectedText : chipInactiveText }]}
                      numberOfLines={1}
                    >
                      {p.name || t('productShort', { n: i + 1 })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={st.dotsRow}>
              {profiles.map((_, i) => {
                const isActive = i === activeIndex;
                return (
                  <View
                    key={profiles[i].id}
                    style={[
                      st.dot,
                      isActive && st.dotActive,
                      {
                        backgroundColor: isActive ? dotActiveColor : dotInactiveColor,
                        width: isActive ? 20 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Horizontal pager */}
      {profiles.length > 1 ? (
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onSwipeEnd}
          contentOffset={{ x: activeIndex * SCREEN_W, y: 0 }}
        >
          {profiles.map((p) => (
            <View key={p.id} style={{ width: SCREEN_W }}>
              <ProfilePage
                profileId={p.id}
                locale={locale}
                isDark={isDark}
                isPremium={isPremium}
                showPaywall={showPaywall}
                t={t}
                colors={{ bg, cardBg, cardBorder, textPrimary, textSecondary, textMuted, surfaceDark }}
                onScrollContent={setContentScrollY}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ProfilePage
          profileId={profiles[0].id}
          locale={locale}
          isDark={isDark}
          isPremium={isPremium}
          showPaywall={showPaywall}
          t={t}
          colors={{ bg, cardBg, cardBorder, textPrimary, textSecondary, textMuted, surfaceDark }}
          onScrollContent={setContentScrollY}
        />
      )}

      <FloatingNavbar onShowPaywall={showPaywall} />
      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </SafeAreaView>
  );
}

// ─── Profile Page (single profile content) ──────────────────────

interface ProfilePageProps {
  profileId: string;
  locale: string;
  isDark: boolean;
  isPremium: boolean;
  showPaywall: () => void;
  t: (key: string, opts?: any) => string;
  colors: Record<string, string>;
  onScrollContent?: (y: number) => void;
}

function ProfilePage({ profileId, locale, isDark, isPremium, showPaywall, t, colors, onScrollContent }: ProfilePageProps) {
  const profile = useFounderOSStore((state) => state.profiles.find((p) => p.id === profileId));
  const setStage = useFounderOSStore((state) => state.setStage);
  if (!profile) return null;

  const output = profile.strategicOutput;
  const riskColor = RISK_COLORS[output.riskCategory];
  const { cardBg, cardBorder, textPrimary, textSecondary, textMuted, surfaceDark } = colors;

  const stageIdx = LIFECYCLE_STAGES.indexOf(profile.stage);
  const isLastStage = stageIdx >= LIFECYCLE_STAGES.length - 1;
  const nextStage = isLastStage ? null : LIFECYCLE_STAGES[stageIdx + 1];

  function handleAdvancePhase() {
    if (!nextStage || !profile) return;
    const currentLabel = LIFECYCLE_STAGE_LABELS[profile.stage][locale];
    const nextLabel = LIFECYCLE_STAGE_LABELS[nextStage][locale];
    Alert.alert(
      t('advancePhase'),
      t('advancePhaseConfirm', { current: currentLabel, next: nextLabel }),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('advancePhase'), onPress: () => setStage(profile!.id, nextStage) },
      ],
    );
  }

  const allTasks = useMemo(() => extractTasks(output), [output]);
  const tc = profile.taskCompletions ?? {};
  const doneCount = allTasks.filter((t) => tc[t.id]).length;
  const totalCount = allTasks.length;
  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <ScrollView
      key={`${profileId}-${profile.stage}-${profile.updatedAt}`}
      contentContainerStyle={st.scroll}
      showsVerticalScrollIndicator={false}
      onScroll={(e) => onScrollContent?.(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
    >
      {/* Stage badge */}
      <View style={[st.stageBadge, {
        backgroundColor: theme.colors.accent + '22',
        borderWidth: 1,
        borderColor: theme.colors.accent + '50',
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
      }]}>
        <MaterialCommunityIcons name="flag-outline" size={16} color={theme.colors.accentLight} />
        <Text style={[st.stageText, { color: theme.colors.accentLight }]}>
          {LIFECYCLE_STAGE_LABELS[profile.stage][locale]}
        </Text>
      </View>

      {/* Minimal "based on your answers" — only key choices, not overwhelming */}
      {(() => {
        const dna = profile.productDNA;
        const platforms = asDNAArray(dna.platform).slice(0, 2).map(dnaValueLabel).join(', ');
        const audience = asDNAArray(dna.audienceBehaviorType).slice(0, 1).map(dnaValueLabel).join(', ');
        const channel = asDNAArray(dna.acquisitionChannelFit).slice(0, 1).map(dnaValueLabel).join(', ');
        const stageLabel = LIFECYCLE_STAGE_LABELS[profile.stage][locale];
        const parts = [platforms, audience, channel, stageLabel].filter(Boolean);
        if (parts.length === 0) return null;
        return (
          <Text style={[st.basedOnAnswers, { color: textMuted }]} numberOfLines={2}>
            {t('basedOnAnswers')}: {parts.join(' · ')}
          </Text>
        );
      })()}

      {/* Task progress card */}
      {totalCount > 0 && (
        <Pressable
          onPress={() => router.push('/focus')}
          style={[st.progressCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
          <View style={st.progressCardHeader}>
            <View style={[st.progressIconWrap, {
              backgroundColor: doneCount === totalCount ? '#10b981' + '18' : theme.colors.accent + '18',
            }]}>
              <MaterialCommunityIcons
                name={doneCount === totalCount ? 'check-circle' : 'fire'}
                size={20}
                color={doneCount === totalCount ? '#10b981' : theme.colors.accent}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.progressTitle, { color: textPrimary }]}>
                {t('strategicTasks')}
              </Text>
              <Text style={[st.progressSub, { color: textMuted }]}>
                {t('tasksCompleted', { count: doneCount, total: totalCount })}
              </Text>
            </View>
            <Text style={[st.progressPct, {
              color: doneCount === totalCount ? '#10b981' : theme.colors.accent,
            }]}>
              {Math.round(progressPct)}%
            </Text>
          </View>
          <View style={[st.progressBarBgDash, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <View style={[st.progressBarFillDash, {
              width: `${progressPct}%`,
              backgroundColor: doneCount === totalCount ? '#10b981' : theme.colors.accent,
            }]} />
          </View>
        </Pressable>
      )}

      {/* Primary Bottleneck */}
      <View style={[st.bottleneckCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.sectionLabel, { color: textMuted }]}>{t('primaryBottleneck')}</Text>
        {getSectionBasedOn(profile, locale, 'bottleneck') && (
          <Text style={[st.basedOnSection, { color: textMuted }]} numberOfLines={1}>
            {t('basedOnAnswers')}: {getSectionBasedOn(profile, locale, 'bottleneck')}
          </Text>
        )}
        <View style={st.bottleneckRow}>
          <MaterialCommunityIcons name="alert-decagram-outline" size={28} color="#f59e0b" />
          <Text style={[st.bottleneckTitle, { color: textPrimary }]}>
            {BOTTLENECK_LABELS[output.primaryBottleneck][locale]}
          </Text>
        </View>
        <Text style={[st.bottleneckDesc, { color: textSecondary }]}>{output.bottleneckDescription}</Text>
      </View>

      {/* Risk Score */}
      <View style={[st.riskCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.sectionLabel, { color: textMuted }]}>{t('riskScore')}</Text>
        {getSectionBasedOn(profile, locale, 'risk') && (
          <Text style={[st.basedOnSection, { color: textMuted }]} numberOfLines={1}>
            {t('basedOnAnswers')}: {getSectionBasedOn(profile, locale, 'risk')}
          </Text>
        )}
        <View style={st.riskRow}>
          <View style={st.riskGauge}>
            <View style={[st.riskGaugeBg, { backgroundColor: surfaceDark }]}>
              <View style={[st.riskGaugeFill, { width: `${output.riskScore}%`, backgroundColor: riskColor }]} />
            </View>
            <Text style={[st.riskScoreNum, { color: riskColor }]}>{output.riskScore}</Text>
          </View>
          <View style={[st.riskBadge, { backgroundColor: riskColor + '22' }]}>
            <Text style={[st.riskBadgeText, { color: riskColor }]}>{output.riskCategory.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Critical Risk Warning */}
      {(output.riskCategory === 'high' || output.riskCategory === 'critical') && (
        <View style={[st.warningCard, { backgroundColor: '#ef444412', borderColor: '#ef444433' }]}>
          <MaterialCommunityIcons name="alert-outline" size={20} color="#ef4444" />
          <Text style={[st.warningText, { color: textPrimary }]}>{output.criticalRiskWarning}</Text>
        </View>
      )}

      {/* Immediate Actions */}
      <Text style={[st.sectionTitle, { color: textPrimary }]}>{t('immediateActions')}</Text>
      {getSectionBasedOn(profile, locale, 'immediateActions') && (
        <Text style={[st.basedOnSection, { color: textMuted }]} numberOfLines={1}>
          {t('basedOnAnswers')}: {getSectionBasedOn(profile, locale, 'immediateActions')}
        </Text>
      )}
      {output.immediateActions.map((action, i) => {
        const card = (
          <View key={i} style={[st.actionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={st.actionHeader}>
              <View style={[st.actionNum, { backgroundColor: theme.colors.accent + '22' }]}>
                <Text style={[st.actionNumText, { color: theme.colors.accent }]}>{i + 1}</Text>
              </View>
              <Text style={[st.actionTitle, { color: textPrimary }]}>{action.title}</Text>
            </View>
            <Text style={[st.actionDesc, { color: textSecondary }]}>{action.description}</Text>
            {action.steps.map((step, j) => {
              const stepId = `${i}-${j}`;
              const done = !!tc[stepId];
              return (
                <View key={j} style={st.stepRow}>
                  {done ? (
                    <MaterialCommunityIcons name="check-circle" size={18} color="#22c55e" style={{ marginTop: 2 }} />
                  ) : (
                    <View style={[st.stepDot, { backgroundColor: theme.colors.accent }]} />
                  )}
                  <Text style={[st.stepText, { color: textSecondary }, done && st.stepTextDone]}>{step}</Text>
                </View>
              );
            })}
          </View>
        );
        if (i === 0) return card;
        return <PremiumGate key={i} locked={!isPremium} onUpgrade={showPaywall}>{card}</PremiumGate>;
      })}

      {/* Long-Term Focus */}
      <PremiumGate locked={!isPremium} onUpgrade={showPaywall}>
        <Text style={[st.sectionTitle, { color: textPrimary }]}>{t('longTermFocus')}</Text>
        {getSectionBasedOn(profile, locale, 'longTermFocus') && (
          <Text style={[st.basedOnSection, { color: textMuted }]} numberOfLines={1}>
            {t('basedOnAnswers')}: {getSectionBasedOn(profile, locale, 'longTermFocus')}
          </Text>
        )}
        <View style={[st.ltfCard, { backgroundColor: theme.colors.accent + '10', borderColor: theme.colors.accent + '33' }]}>
          <MaterialCommunityIcons name="compass-outline" size={24} color={theme.colors.accent} />
          <Text style={[st.ltfTitle, { color: textPrimary }]}>{output.longTermFocus.title}</Text>
          <Text style={[st.ltfDesc, { color: textSecondary }]}>{output.longTermFocus.description}</Text>
          {output.longTermFocus.steps.map((step, si) => {
            const stepId = `ltf-${si}`;
            const done = !!tc[stepId];
            return (
              <View key={si} style={st.stepRow}>
                {done ? (
                  <MaterialCommunityIcons name="check-circle" size={18} color="#22c55e" style={{ marginTop: 2 }} />
                ) : (
                  <View style={[st.stepDot, { backgroundColor: theme.colors.accent }]} />
                )}
                <Text style={[st.stepText, { color: textSecondary }, done && st.stepTextDone]}>{step}</Text>
              </View>
            );
          })}
        </View>
      </PremiumGate>

      {/* Core Metrics */}
      <PremiumGate locked={!isPremium} onUpgrade={showPaywall}>
        <Text style={[st.sectionTitle, { color: textPrimary }]}>{t('coreMetrics')}</Text>
        {getSectionBasedOn(profile, locale, 'coreMetrics') && (
          <Text style={[st.basedOnSection, { color: textMuted }]} numberOfLines={1}>
            {t('basedOnAnswers')}: {getSectionBasedOn(profile, locale, 'coreMetrics')}
          </Text>
        )}
        <View style={[st.metricsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {output.coreMetrics.map((m, i) => (
            <View key={i} style={[st.metricRow, i > 0 && { borderTopWidth: 1, borderTopColor: cardBorder }]}>
              <View style={{ flex: 1 }}>
                <Text style={[st.metricName, { color: textPrimary }]}>{m.name}</Text>
                <Text style={[st.metricDesc, { color: textSecondary }]}>{m.description}</Text>
              </View>
              {m.target && (
                <View style={[st.metricTarget, { backgroundColor: theme.colors.accent + '18' }]}>
                  <Text style={[st.metricTargetText, { color: theme.colors.accent }]}>{m.target}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </PremiumGate>

      {/* Distribution Priority */}
      <PremiumGate locked={!isPremium} onUpgrade={showPaywall}>
        <Text style={[st.sectionTitle, { color: textPrimary }]}>{t('distributionPriority')}</Text>
        {getSectionBasedOn(profile, locale, 'distributionPriority') && (
          <Text style={[st.basedOnSection, { color: textMuted }]} numberOfLines={1}>
            {t('basedOnAnswers')}: {getSectionBasedOn(profile, locale, 'distributionPriority')}
          </Text>
        )}
        <View style={[st.distCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={st.distHeader}>
            <MaterialCommunityIcons name="bullhorn-outline" size={22} color={theme.colors.accent} />
            <Text style={[st.distTitle, { color: textPrimary }]}>{output.distributionPriority}</Text>
          </View>
          <Text style={[st.distDesc, { color: textSecondary }]}>{output.distributionDescription}</Text>
        </View>
      </PremiumGate>

      {/* Monetization Strategy */}
      <PremiumGate locked={!isPremium} onUpgrade={showPaywall}>
        <Text style={[st.sectionTitle, { color: textPrimary }]}>{t('monetizationStrategy')}</Text>
        {getSectionBasedOn(profile, locale, 'monetizationStrategy') && (
          <Text style={[st.basedOnSection, { color: textMuted }]} numberOfLines={1}>
            {t('basedOnAnswers')}: {getSectionBasedOn(profile, locale, 'monetizationStrategy')}
          </Text>
        )}
        <View style={[st.distCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={st.distHeader}>
            <MaterialCommunityIcons name="currency-usd" size={22} color="#22c55e" />
            <Text style={[st.distTitle, { color: textPrimary }]}>{output.monetizationStrategy}</Text>
          </View>
          <Text style={[st.distDesc, { color: textSecondary }]}>{output.monetizationDescription}</Text>
        </View>
      </PremiumGate>

      {/* Edit configuration */}
      <PremiumGate locked={!isPremium} onUpgrade={showPaywall}>
        <Pressable
          style={[st.editBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={() => router.push({ pathname: '/configure-edit', params: { profileId: profile.id } })}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color={theme.colors.accent} />
          <Text style={[st.editBtnText, { color: theme.colors.accent }]}>{t('editConfiguration')}</Text>
        </Pressable>
      </PremiumGate>

      {/* Stage advancement */}
      {!isLastStage && nextStage && (
        <Pressable
          onPress={handleAdvancePhase}
          style={[st.advanceCard, {
            backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
            borderColor: isDark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)',
          }]}
        >
          <Text style={[st.advanceDesc, { color: textSecondary }]}>{t('advancePhaseDesc')}</Text>
          <View style={st.advanceRow}>
            <View style={[st.advanceBadge, { backgroundColor: theme.colors.accent + '22' }]}>
              <Text style={[st.advanceBadgeText, { color: theme.colors.accent }]}>
                {LIFECYCLE_STAGE_LABELS[profile.stage][locale]}
              </Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#10b981" />
            <View style={[st.advanceBadge, { backgroundColor: '#10b981' + '22' }]}>
              <Text style={[st.advanceBadgeText, { color: '#10b981' }]}>
                {LIFECYCLE_STAGE_LABELS[nextStage][locale]}
              </Text>
            </View>
          </View>
          <View style={st.advanceBtnRow}>
            <MaterialCommunityIcons name="rocket-launch-outline" size={18} color="#10b981" />
            <Text style={[st.advanceBtnText, { color: '#10b981' }]}>{t('advancePhase')}</Text>
          </View>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

type FounderOSProfile = import('../src/types/founderOS').FounderOSProfile;

function getSectionBasedOn(profile: FounderOSProfile, locale: string, section: string): string | null {
  const dna = profile.productDNA;
  const stageLabel = LIFECYCLE_STAGE_LABELS[profile.stage][locale];
  const platform = asDNAArray(dna.platform).slice(0, 2).map(dnaValueLabel).join(', ');
  const channel = asDNAArray(dna.acquisitionChannelFit).slice(0, 1).map(dnaValueLabel).join(', ');
  const audience = asDNAArray(dna.audienceBehaviorType).slice(0, 1).map(dnaValueLabel).join(', ');
  const dist = dnaValueLabel(profile.constraints.distributionAccess);
  const parts: string[] = [];
  switch (section) {
    case 'bottleneck':
      parts.push(stageLabel, dist);
      break;
    case 'risk':
      parts.push(dnaValueLabel(dna.trustRequirement), dnaValueLabel(dna.regulatoryRisk));
      break;
    case 'immediateActions':
      parts.push(platform, channel, audience);
      break;
    case 'longTermFocus':
      parts.push(dnaValueLabel(dna.scalabilityPattern), dnaValueLabel(dna.marketType));
      break;
    case 'coreMetrics':
      parts.push(dnaValueLabel(dna.productFormat), stageLabel);
      break;
    case 'distributionPriority':
      parts.push(platform, channel, dist);
      break;
    case 'monetizationStrategy':
      parts.push(dnaValueLabel(dna.revenueModel), dnaValueLabel(dna.pricingPower), dnaValueLabel(dna.marketType));
      break;
    default:
      return null;
  }
  const joined = parts.filter(Boolean).join(' · ');
  return joined || null;
}

function EmptyStep({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={st.emptyStep}>
      <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.accent} />
      <Text style={[st.emptyStepText, { color }]}>{text}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const st = StyleSheet.create({
  screen: { flex: 1 },

  // Header (centered)
  header: {
    alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 1,
  },
  headerLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  headerTitleShadow: {
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  chipWrap: { marginTop: 2 },
  chipStrip: { maxHeight: 36 },
  chipStripContent: { flexDirection: 'row', alignItems: 'center', gap: CHIP_GAP, paddingVertical: 0 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 },
  dot: { height: 3, borderRadius: 2 },
  dotActive: {},
  chip: {
    width: CHIP_WIDTH,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {},
  chipText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  scroll: { padding: 20, paddingBottom: 120 },

  // Stage
  stageBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 16,
  },
  stageText: { fontSize: 14, fontWeight: '700' },
  basedOnAnswers: { fontSize: 11, fontWeight: '500', marginBottom: 14, marginTop: 2 },
  basedOnSection: { fontSize: 11, fontWeight: '500', marginBottom: 8 },

  // Progress card
  progressCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  progressCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  progressIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  progressSub: { fontSize: 12, fontWeight: '500' },
  progressPct: { fontSize: 22, fontWeight: '800' },
  progressBarBgDash: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFillDash: { height: 6, borderRadius: 3 },

  // Bottleneck
  bottleneckCard: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  bottleneckRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  bottleneckTitle: { fontSize: 22, fontWeight: '800' },
  bottleneckDesc: { fontSize: 15, lineHeight: 22 },

  // Risk
  riskCard: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1 },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  riskGauge: { flex: 1 },
  riskGaugeBg: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  riskGaugeFill: { height: 10, borderRadius: 5 },
  riskScoreNum: { fontSize: 28, fontWeight: '800' },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  riskBadgeText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  // Warning
  warningCard: {
    flexDirection: 'row', gap: 12, padding: 16, borderRadius: 14,
    borderWidth: 1, marginBottom: 16, alignItems: 'flex-start',
  },
  warningText: { flex: 1, fontSize: 14, lineHeight: 21, fontWeight: '500' },

  // Actions
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, marginTop: 8 },
  actionCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  actionNum: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionNumText: { fontSize: 15, fontWeight: '800' },
  actionTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  actionDesc: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 6, alignItems: 'flex-start' },
  stepDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  stepTextDone: { textDecorationLine: 'line-through', opacity: 0.8 },

  // Long-term focus
  ltfCard: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1 },
  ltfTitle: { fontSize: 17, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  ltfDesc: { fontSize: 14, lineHeight: 21, marginBottom: 12 },

  // Metrics
  metricsCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  metricRow: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  metricName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  metricDesc: { fontSize: 13, lineHeight: 18 },
  metricTarget: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  metricTargetText: { fontSize: 12, fontWeight: '700' },

  // Distribution + Monetization
  distCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  distHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  distTitle: { fontSize: 17, fontWeight: '700' },
  distDesc: { fontSize: 14, lineHeight: 21 },

  // Edit button
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14, borderWidth: 1, marginTop: 8,
  },
  editBtnText: { fontSize: 16, fontWeight: '700' },

  // Stage advancement
  advanceCard: {
    borderRadius: 16, padding: 18, borderWidth: 1, marginTop: 20,
    alignItems: 'center', gap: 12,
  },
  advanceDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  advanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  advanceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  advanceBadgeText: { fontSize: 13, fontWeight: '700' },
  advanceBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  advanceBtnText: { fontSize: 15, fontWeight: '800' },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyCard: {
    width: '100%', maxWidth: 360, borderRadius: 28, paddingVertical: 36,
    paddingHorizontal: 28, borderWidth: 1, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  emptyIconWrap: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  emptyTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  emptySub: { fontSize: 15, textAlign: 'center', lineHeight: 23, marginBottom: 24 },
  emptySteps: { width: '100%', marginBottom: 28, gap: 12 },
  emptyStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emptyStepText: { fontSize: 14, flex: 1 },
  emptyCta: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, paddingHorizontal: 28, borderRadius: 16, width: '100%',
    backgroundColor: '#1d4ed8',
  },
  emptyCtaText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
