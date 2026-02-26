import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFounderOSStore } from '../src/store/founderOSStore';
import { useThemeStore } from '../src/store/themeStore';
import type {
  ProductDNA, FounderState, Constraints, LifecycleStage,
  ProductFormat, RevenueModel, MarketType, PricingPower,
  UserIntentType, EngagementModel, RetentionComplexity,
  AcquisitionChannelFit, ViralityPotential, TrustRequirement,
  RegulatoryRisk, AudienceBehaviorType, MonetizationLatency,
  ScalabilityPattern, ExperienceLevel, AvailableCapital,
  TimeCommitment, TechnicalDepth, RiskTolerance, DistributionAccess,
} from '../src/types/founderOS';
import type { Platform as PlatformType } from '../src/types/founderOS';
import { LIFECYCLE_STAGE_LABELS, LIFECYCLE_STAGES } from '../src/types/founderOS';
import { theme } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useLocaleStore } from '../src/store/localeStore';

const TOTAL_STEPS = 4;

interface OptionItem<T extends string> { value: T; label: string; }

type L10nOption<T extends string> = [T, string, string]; // value, en, tr

function localizedOptions<T extends string>(items: L10nOption<T>[], locale: string): OptionItem<T>[] {
  const isTr = locale === 'tr';
  return items.map(([value, en, tr]) => ({ value, label: isTr ? tr : en }));
}

const PRODUCT_FORMAT_DATA: L10nOption<ProductFormat>[] = [
  ['mobile-app', 'Mobile App', 'Mobil Uygulama'], ['web-app', 'Web App', 'Web Uygulaması'], ['game', 'Game', 'Oyun'],
  ['saas', 'SaaS', 'SaaS'], ['ai-tool', 'AI Tool', 'AI Tool'], ['extension', 'Extension', 'Eklenti'],
  ['desktop', 'Desktop', 'Masaüstü'], ['api', 'API', 'API'],
];
const PLATFORM_DATA: L10nOption<PlatformType>[] = [
  ['ios', 'iOS', 'iOS'], ['android', 'Android', 'Android'], ['web', 'Web', 'Web'], ['multi-platform', 'Multi-Platform', 'Çoklu Platform'],
];
const REVENUE_DATA: L10nOption<RevenueModel>[] = [
  ['ads', 'Ads', 'Reklam'], ['subscription', 'Subscription', 'Abonelik'], ['freemium', 'Freemium', 'Freemium'],
  ['one-time', 'One-Time', 'Tek Seferlik'], ['enterprise', 'Enterprise', 'Kurumsal'], ['iap', 'IAP', 'IAP'],
  ['usage-based', 'Usage-Based', 'Kullanıma Dayalı'],
];
const MARKET_DATA: L10nOption<MarketType>[] = [['b2c', 'B2C', 'B2C'], ['b2b', 'B2B', 'B2B'], ['b2b2c', 'B2B2C', 'B2B2C']];
const PRICING_POWER_DATA: L10nOption<PricingPower>[] = [['low', 'Low', 'Düşük'], ['medium', 'Medium', 'Orta'], ['high', 'High', 'Yüksek']];
const INTENT_DATA: L10nOption<UserIntentType>[] = [
  ['entertainment', 'Entertainment', 'Eğlence'], ['utility', 'Utility', 'Fayda'],
  ['productivity', 'Productivity', 'Verimlilik'], ['financial', 'Financial', 'Finans'],
  ['social', 'Social', 'Sosyal'], ['educational', 'Educational', 'Eğitim'],
  ['health', 'Health & Wellness', 'Sağlık ve Yaşam'], ['communication', 'Communication', 'İletişim'],
  ['creative', 'Creative Tools', 'Yaratıcı Araçlar'], ['shopping', 'Shopping', 'Alışveriş'],
];
const ENGAGEMENT_DATA: L10nOption<EngagementModel>[] = [
  ['one-off', 'One-Off', 'Tek Kullanım'], ['session-based', 'Session-Based', 'Oturum Bazlı'],
  ['daily-habit', 'Daily Habit', 'Günlük Alışkanlık'], ['workflow-integrated', 'Workflow Integrated', 'İş Akışına Entegre'],
];
const RETENTION_DATA: L10nOption<RetentionComplexity>[] = [['low', 'Low', 'Düşük'], ['medium', 'Medium', 'Orta'], ['high', 'High', 'Yüksek']];
const CHANNEL_DATA: L10nOption<AcquisitionChannelFit>[] = [
  ['paid-ads', 'Paid Ads', 'Ücretli Reklam'], ['content', 'Content', 'İçerik'], ['community', 'Community', 'Topluluk'],
  ['outbound', 'Outbound', 'Outbound'], ['app-store', 'App Store', 'App Store'], ['viral', 'Viral', 'Viral'],
];
const VIRALITY_DATA: L10nOption<ViralityPotential>[] = [
  ['none', 'None', 'Yok'], ['loop-based', 'Loop-Based', 'Döngü Bazlı'],
  ['social-driven', 'Social-Driven', 'Sosyal Yayılım'], ['ugc-driven', 'UGC-Driven', 'Kullanıcı İçerikli'],
];
const TRUST_DATA: L10nOption<TrustRequirement>[] = [['low', 'Low', 'Düşük'], ['medium', 'Medium', 'Orta'], ['high', 'High', 'Yüksek']];
const REGULATORY_DATA: L10nOption<RegulatoryRisk>[] = [['none', 'None', 'Yok'], ['moderate', 'Moderate', 'Orta'], ['heavy', 'Heavy', 'Ağır']];
const AUDIENCE_DATA: L10nOption<AudienceBehaviorType>[] = [
  ['mass-consumer', 'Mass Consumer', 'Kitlesel Tüketici'], ['niche-consumer', 'Niche Consumer', 'Niş Tüketici'],
  ['professional', 'Professional', 'Profesyonel'], ['enterprise-buyer', 'Enterprise Buyer', 'Kurumsal Alıcı'],
  ['parents', 'Parents', 'Ebeveynler'], ['students', 'Students', 'Öğrenciler'],
  ['gamers', 'Gamers', 'Oyuncular'], ['developers', 'Developers', 'Geliştiriciler'],
  ['creators', 'Content Creators', 'İçerik Üreticileri'], ['freelancers', 'Freelancers', 'Serbest Çalışanlar'],
  ['small-business', 'Small Business', 'Küçük İşletmeler'], ['healthcare-workers', 'Healthcare Workers', 'Sağlık Çalışanları'],
];
const LATENCY_DATA: L10nOption<MonetizationLatency>[] = [
  ['instant', 'Instant', 'Anlık'], ['short-cycle', 'Short Cycle', 'Kısa Döngü'], ['long-cycle', 'Long Cycle', 'Uzun Döngü'],
];
const SCALABILITY_DATA: L10nOption<ScalabilityPattern>[] = [
  ['linear', 'Linear', 'Doğrusal'], ['network-effect', 'Network Effect', 'Ağ Etkisi'], ['content-driven', 'Content-Driven', 'İçerik Odaklı'],
  ['ads-scale', 'Ads Scale', 'Reklam Ölçeği'], ['sales-driven', 'Sales-Driven', 'Satış Odaklı'],
];
const EXPERIENCE_DATA: L10nOption<ExperienceLevel>[] = [
  ['first-time', 'First-Time Founder', 'İlk Kez Girişimci'], ['indie-hacker', 'Indie Hacker', 'Indie Hacker'], ['experienced-founder', 'Experienced Founder', 'Deneyimli Girişimci'],
];
const CAPITAL_DATA: L10nOption<AvailableCapital>[] = [['none', 'None', 'Yok'], ['limited', 'Limited', 'Sınırlı'], ['funded', 'Funded', 'Yatırım Almış']];
const TIME_DATA: L10nOption<TimeCommitment>[] = [['side-project', 'Side Project', 'Yan Proje'], ['full-time', 'Full-Time', 'Tam Zamanlı']];
const DEPTH_DATA: L10nOption<TechnicalDepth>[] = [['low', 'Low', 'Düşük'], ['medium', 'Medium', 'Orta'], ['high', 'High', 'Yüksek']];
const RISK_TOL_DATA: L10nOption<RiskTolerance>[] = [['low', 'Low', 'Düşük'], ['medium', 'Medium', 'Orta'], ['high', 'High', 'Yüksek']];
const DIST_ACCESS_DATA: L10nOption<DistributionAccess>[] = [
  ['none', 'None', 'Yok'], ['small-audience', 'Small Audience', 'Küçük Kitle'], ['large-audience', 'Large Audience', 'Büyük Kitle'],
];

export default function ConfigureScreen() {
  const { colorMode } = useThemeStore();
  const createProfile = useFounderOSStore((s) => s.createProfile);
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale) ?? 'en';
  const isDark = colorMode === 'dark';
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('');

  const [dna, setDna] = useState<Partial<ProductDNA>>({});
  const [founder, setFounder] = useState<Partial<FounderState>>({});
  const [constraints, setConstraints] = useState<Partial<Constraints>>({ budget: 0, monthlyRunway: 12, teamSize: 1 });
  const [stage, setStage] = useState<LifecycleStage | null>(null);

  const bg = isDark ? '#07050f' : '#f1f5f9';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc';

  function toArr<T>(v: T | T[] | undefined): T[] {
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!(
        dna.productFormat && toArr(dna.platform).length >= 1 && dna.revenueModel && dna.marketType &&
        dna.pricingPower && toArr(dna.userIntentType).length >= 1 && dna.engagementModel && dna.retentionComplexity &&
        toArr(dna.acquisitionChannelFit).length >= 1 && dna.viralityPotential && dna.trustRequirement &&
        dna.regulatoryRisk && toArr(dna.audienceBehaviorType).length >= 1 && dna.monetizationLatency && dna.scalabilityPattern
      );
      case 1: return !!(
        founder.experienceLevel && founder.availableCapital && founder.timeCommitment &&
        founder.technicalDepth && founder.riskTolerance
      );
      case 2: return constraints.budget !== undefined && constraints.monthlyRunway !== undefined &&
        constraints.teamSize !== undefined && !!constraints.distributionAccess;
      case 3: return !!stage && projectName.trim().length > 0;
      default: return false;
    }
  }

  function handleFinish() {
    if (!stage || !canAdvance()) return;
    createProfile({
      name: projectName.trim() || 'My Project',
      dna: dna as ProductDNA,
      founder: founder as FounderState,
      constraints: constraints as Constraints,
      stage,
    });
    router.replace('/strategy-dashboard');
  }

  function renderChipGroup<T extends string>(
    label: string,
    items: OptionItem<T>[],
    selected: T | undefined,
    onSelect: (v: T) => void,
    desc?: string,
  ) {
    return (
      <View style={s.fieldGroup}>
        <Text style={[s.fieldLabel, { color: textSecondary }]}>{label}</Text>
        {desc ? <Text style={[s.fieldDesc, { color: textMuted }]}>{desc}</Text> : null}
        <View style={s.chipRow}>
          {items.map((item) => {
            const active = selected === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => onSelect(item.value)}
                style={[
                  s.chip,
                  { borderColor: active ? theme.colors.accent : borderColor,
                    backgroundColor: active ? theme.colors.accent + '22' : cardBg },
                ]}
              >
                <Text style={[s.chipText, { color: active ? theme.colors.accent : textPrimary }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  /** Multi-select: user can pick several options; at least one required. */
  function renderMultiChipGroup<T extends string>(
    label: string,
    items: OptionItem<T>[],
    selected: T[],
    onToggle: (v: T) => void,
    desc?: string,
  ) {
    return (
      <View style={s.fieldGroup}>
        <Text style={[s.fieldLabel, { color: textSecondary }]}>{label}</Text>
        {desc ? <Text style={[s.fieldDesc, { color: textMuted }]}>{desc}</Text> : null}
        <View style={s.chipRow}>
          {items.map((item) => {
            const active = selected.includes(item.value);
            return (
              <Pressable
                key={item.value}
                onPress={() => onToggle(item.value)}
                style={[
                  s.chip,
                  { borderColor: active ? theme.colors.accent : borderColor,
                    backgroundColor: active ? theme.colors.accent + '22' : cardBg },
                ]}
              >
                <Text style={[s.chipText, { color: active ? theme.colors.accent : textPrimary }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderStep0() {
    const platforms = toArr(dna.platform);
    const intents = toArr(dna.userIntentType);
    const channels = toArr(dna.acquisitionChannelFit);
    const audiences = toArr(dna.audienceBehaviorType);
    const togglePlatform = (v: PlatformType) => setDna({ ...dna, platform: platforms.includes(v) ? platforms.filter((x) => x !== v) : [...platforms, v] });
    const toggleIntent = (v: UserIntentType) => setDna({ ...dna, userIntentType: intents.includes(v) ? intents.filter((x) => x !== v) : [...intents, v] });
    const toggleChannel = (v: AcquisitionChannelFit) => setDna({ ...dna, acquisitionChannelFit: channels.includes(v) ? channels.filter((x) => x !== v) : [...channels, v] });
    const toggleAudience = (v: AudienceBehaviorType) => setDna({ ...dna, audienceBehaviorType: audiences.includes(v) ? audiences.filter((x) => x !== v) : [...audiences, v] });
    return (
      <>
        <Text style={[s.stepTitle, { color: textPrimary }]}>{t('productDNA')}</Text>
        <Text style={[s.stepSub, { color: textSecondary }]}>{t('productDNADesc')}</Text>
        {renderChipGroup(t('productFormat'), localizedOptions(PRODUCT_FORMAT_DATA, locale), dna.productFormat, (v) => setDna({ ...dna, productFormat: v }), t('productFormatDesc'))}
        {renderMultiChipGroup(t('platform'), localizedOptions(PLATFORM_DATA, locale), platforms, togglePlatform, t('platformDesc'))}
        {renderChipGroup(t('revenueModel'), localizedOptions(REVENUE_DATA, locale), dna.revenueModel, (v) => setDna({ ...dna, revenueModel: v }), t('revenueModelDesc'))}
        {renderChipGroup(t('marketType'), localizedOptions(MARKET_DATA, locale), dna.marketType, (v) => setDna({ ...dna, marketType: v }), t('marketTypeDesc'))}
        {renderChipGroup(t('pricingPower'), localizedOptions(PRICING_POWER_DATA, locale), dna.pricingPower, (v) => setDna({ ...dna, pricingPower: v }), t('pricingPowerDesc'))}
        {renderMultiChipGroup(t('userIntent'), localizedOptions(INTENT_DATA, locale), intents, toggleIntent, t('userIntentDesc'))}
        {renderChipGroup(t('engagementModel'), localizedOptions(ENGAGEMENT_DATA, locale), dna.engagementModel, (v) => setDna({ ...dna, engagementModel: v }), t('engagementModelDesc'))}
        {renderChipGroup(t('retentionComplexity'), localizedOptions(RETENTION_DATA, locale), dna.retentionComplexity, (v) => setDna({ ...dna, retentionComplexity: v }), t('retentionComplexityDesc'))}
        {renderMultiChipGroup(t('acquisitionChannel'), localizedOptions(CHANNEL_DATA, locale), channels, toggleChannel, t('acquisitionChannelDesc'))}
        {renderChipGroup(t('viralityPotential'), localizedOptions(VIRALITY_DATA, locale), dna.viralityPotential, (v) => setDna({ ...dna, viralityPotential: v }), t('viralityPotentialDesc'))}
        {renderChipGroup(t('trustRequirement'), localizedOptions(TRUST_DATA, locale), dna.trustRequirement, (v) => setDna({ ...dna, trustRequirement: v }), t('trustRequirementDesc'))}
        {renderChipGroup(t('regulatoryRisk'), localizedOptions(REGULATORY_DATA, locale), dna.regulatoryRisk, (v) => setDna({ ...dna, regulatoryRisk: v }), t('regulatoryRiskDesc'))}
        {renderMultiChipGroup(t('audienceType'), localizedOptions(AUDIENCE_DATA, locale), audiences, toggleAudience, t('audienceTypeDesc'))}
        {renderChipGroup(t('monetizationLatency'), localizedOptions(LATENCY_DATA, locale), dna.monetizationLatency, (v) => setDna({ ...dna, monetizationLatency: v }), t('monetizationLatencyDesc'))}
        {renderChipGroup(t('scalabilityPattern'), localizedOptions(SCALABILITY_DATA, locale), dna.scalabilityPattern, (v) => setDna({ ...dna, scalabilityPattern: v }), t('scalabilityPatternDesc'))}
      </>
    );
  }

  function renderStep1() {
    return (
      <>
        <Text style={[s.stepTitle, { color: textPrimary }]}>{t('founderContext')}</Text>
        <Text style={[s.stepSub, { color: textSecondary }]}>{t('founderContextDesc')}</Text>
        {renderChipGroup(t('experienceLevel'), localizedOptions(EXPERIENCE_DATA, locale), founder.experienceLevel, (v) => setFounder({ ...founder, experienceLevel: v }), t('experienceLevelDesc'))}
        {renderChipGroup(t('availableCapital'), localizedOptions(CAPITAL_DATA, locale), founder.availableCapital, (v) => setFounder({ ...founder, availableCapital: v }), t('availableCapitalDesc'))}
        {renderChipGroup(t('timeCommitment'), localizedOptions(TIME_DATA, locale), founder.timeCommitment, (v) => setFounder({ ...founder, timeCommitment: v }), t('timeCommitmentDesc'))}
        {renderChipGroup(t('technicalDepth'), localizedOptions(DEPTH_DATA, locale), founder.technicalDepth, (v) => setFounder({ ...founder, technicalDepth: v }), t('technicalDepthDesc'))}
        {renderChipGroup(t('riskTolerance'), localizedOptions(RISK_TOL_DATA, locale), founder.riskTolerance, (v) => setFounder({ ...founder, riskTolerance: v }), t('riskToleranceDesc'))}
      </>
    );
  }

  function renderStep2() {
    return (
      <>
        <Text style={[s.stepTitle, { color: textPrimary }]}>{t('constraints')}</Text>
        <Text style={[s.stepSub, { color: textSecondary }]}>{t('constraintsDesc')}</Text>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('monthlyBudget')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={String(constraints.budget ?? 0)}
            onChangeText={(v) => setConstraints({ ...constraints, budget: parseInt(v, 10) || 0 })}
            keyboardType="numeric"
            placeholderTextColor={textMuted}
            placeholder="0"
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('monthlyRunway')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={String(constraints.monthlyRunway ?? 12)}
            onChangeText={(v) => setConstraints({ ...constraints, monthlyRunway: parseInt(v, 10) || 0 })}
            keyboardType="numeric"
            placeholderTextColor={textMuted}
            placeholder="12"
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('teamSize')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={String(constraints.teamSize ?? 1)}
            onChangeText={(v) => setConstraints({ ...constraints, teamSize: parseInt(v, 10) || 1 })}
            keyboardType="numeric"
            placeholderTextColor={textMuted}
            placeholder="1"
          />
        </View>

        {renderChipGroup(t('distributionAccess'), localizedOptions(DIST_ACCESS_DATA, locale), constraints.distributionAccess, (v) => setConstraints({ ...constraints, distributionAccess: v }))}
      </>
    );
  }

  function renderStep3() {
    return (
      <>
        <Text style={[s.stepTitle, { color: textPrimary }]}>{t('stageAndName')}</Text>
        <Text style={[s.stepSub, { color: textSecondary }]}>{t('stageAndNameDesc')}</Text>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('projectName')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={projectName}
            onChangeText={setProjectName}
            placeholderTextColor={textMuted}
            placeholder="My Product"
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('lifecycleStage')}</Text>
          {LIFECYCLE_STAGES.map((s_) => {
            const active = stage === s_;
            return (
              <Pressable
                key={s_}
                onPress={() => setStage(s_)}
                style={[
                  s.stageCard,
                  { borderColor: active ? theme.colors.accent : borderColor,
                    backgroundColor: active ? theme.colors.accent + '15' : cardBg },
                ]}
              >
                <View style={s.stageRow}>
                  <View style={[s.radio, active && s.radioActive]} />
                  <Text style={[s.stageLabel, { color: active ? theme.colors.accent : textPrimary }]}>
                    {LIFECYCLE_STAGE_LABELS[s_][locale]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <View style={[s.header, { borderBottomColor: borderColor }]}>
        <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: textPrimary }]}>{t('configure')}</Text>
        <Text style={[s.headerStep, { color: textMuted }]}>{step + 1} / {TOTAL_STEPS}</Text>
      </View>

      {/* Progress bar */}
      <View style={[s.progressBar, { backgroundColor: borderColor }]}>
        <View style={[s.progressFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%`, backgroundColor: theme.colors.accent }]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {stepRenderers[step]()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { borderTopColor: borderColor, backgroundColor: bg }]}>
        {step < TOTAL_STEPS - 1 ? (
          <Pressable
            onPress={() => setStep(step + 1)}
            disabled={!canAdvance()}
            style={[s.nextBtn, { backgroundColor: canAdvance() ? theme.colors.accent : borderColor }]}
          >
            <Text style={[s.nextBtnText, { color: canAdvance() ? '#fff' : textMuted }]}>{t('next')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={canAdvance() ? '#fff' : textMuted} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleFinish}
            disabled={!canAdvance()}
            style={[s.nextBtn, { backgroundColor: canAdvance() ? theme.colors.accent : borderColor }]}
          >
            <MaterialCommunityIcons name="rocket-launch-outline" size={20} color={canAdvance() ? '#fff' : textMuted} />
            <Text style={[s.nextBtnText, { color: canAdvance() ? '#fff' : textMuted }]}>{t('generateStrategy')}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  headerStep: { fontSize: 14, fontWeight: '600' },
  progressBar: { height: 3 },
  progressFill: { height: 3, borderRadius: 2 },
  scroll: { padding: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  stepSub: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  fieldDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  input: {
    fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, fontWeight: '600',
  },
  stageCard: {
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, marginBottom: 8,
  },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  radioActive: {
    borderColor: '#1d4ed8', backgroundColor: '#1d4ed8',
  },
  stageLabel: { fontSize: 16, fontWeight: '600' },
  footer: {
    paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1,
  },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700' },
});
