import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFounderOSStore } from '../src/store/founderOSStore';
import { useThemeStore } from '../src/store/themeStore';
import { usePurchaseStore } from '../src/store/purchaseStore';
import type {
  ProductDNA, FounderState, Constraints, LifecycleStage,
} from '../src/types/founderOS';
import { LIFECYCLE_STAGE_LABELS, LIFECYCLE_STAGES } from '../src/types/founderOS';
import { theme } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useLocaleStore } from '../src/store/localeStore';
import { PaywallModal } from '../src/components/PaywallModal';

type Section = 'dna' | 'founder' | 'constraints' | 'stage';

interface OptionItem<T extends string> { value: T; label: string; }
type L10nOption = [string, string, string]; // value, en, tr

function localizedOptions(items: L10nOption[], locale: string): OptionItem<string>[] {
  const isTr = locale === 'tr';
  return items.map(([value, en, tr]) => ({ value, label: isTr ? tr : en }));
}

const SECTIONS: { key: Section; i18nKey: string; icon: string }[] = [
  { key: 'dna', i18nKey: 'productDNA', icon: 'dna' },
  { key: 'founder', i18nKey: 'founderContext', icon: 'account-cog-outline' },
  { key: 'constraints', i18nKey: 'constraints', icon: 'tune-vertical' },
  { key: 'stage', i18nKey: 'lifecycleStage', icon: 'flag-outline' },
];

type FieldDef = { key: string; i18nKey: string; descKey: string; data: L10nOption[] };

const DNA_FIELDS: FieldDef[] = [
  { key: 'productFormat', i18nKey: 'productFormat', descKey: 'productFormatDesc', data: [['mobile-app','Mobile App','Mobil Uygulama'],['web-app','Web App','Web Uygulaması'],['game','Game','Oyun'],['saas','SaaS','SaaS'],['ai-tool','AI Tool','AI Tool'],['extension','Extension','Eklenti'],['desktop','Desktop','Masaüstü'],['api','API','API']] },
  { key: 'platform', i18nKey: 'platform', descKey: 'platformDesc', data: [['ios','iOS','iOS'],['android','Android','Android'],['web','Web','Web'],['multi-platform','Multi-Platform','Çoklu Platform']] },
  { key: 'revenueModel', i18nKey: 'revenueModel', descKey: 'revenueModelDesc', data: [['ads','Ads','Reklam'],['subscription','Subscription','Abonelik'],['freemium','Freemium','Freemium'],['one-time','One-Time','Tek Seferlik'],['enterprise','Enterprise','Kurumsal'],['iap','IAP','IAP'],['usage-based','Usage-Based','Kullanıma Dayalı']] },
  { key: 'marketType', i18nKey: 'marketType', descKey: 'marketTypeDesc', data: [['b2c','B2C','B2C'],['b2b','B2B','B2B'],['b2b2c','B2B2C','B2B2C']] },
  { key: 'pricingPower', i18nKey: 'pricingPower', descKey: 'pricingPowerDesc', data: [['low','Low','Düşük'],['medium','Medium','Orta'],['high','High','Yüksek']] },
  { key: 'userIntentType', i18nKey: 'userIntent', descKey: 'userIntentDesc', data: [['entertainment','Entertainment','Eğlence'],['utility','Utility','Fayda'],['productivity','Productivity','Verimlilik'],['financial','Financial','Finans'],['social','Social','Sosyal'],['educational','Educational','Eğitim'],['health','Health & Wellness','Sağlık ve Yaşam'],['communication','Communication','İletişim'],['creative','Creative Tools','Yaratıcı Araçlar'],['shopping','Shopping','Alışveriş']] },
  { key: 'engagementModel', i18nKey: 'engagementModel', descKey: 'engagementModelDesc', data: [['one-off','One-Off','Tek Kullanım'],['session-based','Session-Based','Oturum Bazlı'],['daily-habit','Daily Habit','Günlük Alışkanlık'],['workflow-integrated','Workflow Integrated','İş Akışına Entegre']] },
  { key: 'retentionComplexity', i18nKey: 'retentionComplexity', descKey: 'retentionComplexityDesc', data: [['low','Low','Düşük'],['medium','Medium','Orta'],['high','High','Yüksek']] },
  { key: 'acquisitionChannelFit', i18nKey: 'acquisitionChannel', descKey: 'acquisitionChannelDesc', data: [['paid-ads','Paid Ads','Ücretli Reklam'],['content','Content','İçerik'],['community','Community','Topluluk'],['outbound','Outbound','Outbound'],['app-store','App Store','App Store'],['viral','Viral','Viral']] },
  { key: 'viralityPotential', i18nKey: 'viralityPotential', descKey: 'viralityPotentialDesc', data: [['none','None','Yok'],['loop-based','Loop-Based','Döngü Bazlı'],['social-driven','Social-Driven','Sosyal Yayılım'],['ugc-driven','UGC-Driven','Kullanıcı İçerikli']] },
  { key: 'trustRequirement', i18nKey: 'trustRequirement', descKey: 'trustRequirementDesc', data: [['low','Low','Düşük'],['medium','Medium','Orta'],['high','High','Yüksek']] },
  { key: 'regulatoryRisk', i18nKey: 'regulatoryRisk', descKey: 'regulatoryRiskDesc', data: [['none','None','Yok'],['moderate','Moderate','Orta'],['heavy','Heavy','Ağır']] },
  { key: 'audienceBehaviorType', i18nKey: 'audienceType', descKey: 'audienceTypeDesc', data: [['mass-consumer','Mass Consumer','Kitlesel Tüketici'],['niche-consumer','Niche Consumer','Niş Tüketici'],['professional','Professional','Profesyonel'],['enterprise-buyer','Enterprise Buyer','Kurumsal Alıcı'],['parents','Parents','Ebeveynler'],['students','Students','Öğrenciler'],['gamers','Gamers','Oyuncular'],['developers','Developers','Geliştiriciler'],['creators','Content Creators','İçerik Üreticileri'],['freelancers','Freelancers','Serbest Çalışanlar'],['small-business','Small Business','Küçük İşletmeler'],['healthcare-workers','Healthcare Workers','Sağlık Çalışanları']] },
  { key: 'monetizationLatency', i18nKey: 'monetizationLatency', descKey: 'monetizationLatencyDesc', data: [['instant','Instant','Anlık'],['short-cycle','Short Cycle','Kısa Döngü'],['long-cycle','Long Cycle','Uzun Döngü']] },
  { key: 'scalabilityPattern', i18nKey: 'scalabilityPattern', descKey: 'scalabilityPatternDesc', data: [['linear','Linear','Doğrusal'],['network-effect','Network Effect','Ağ Etkisi'],['content-driven','Content-Driven','İçerik Odaklı'],['ads-scale','Ads Scale','Reklam Ölçeği'],['sales-driven','Sales-Driven','Satış Odaklı']] },
];

const FOUNDER_FIELDS: FieldDef[] = [
  { key: 'experienceLevel', i18nKey: 'experienceLevel', descKey: 'experienceLevelDesc', data: [['first-time','First-Time Founder','İlk Kez Girişimci'],['indie-hacker','Indie Hacker','Indie Hacker'],['experienced-founder','Experienced Founder','Deneyimli Girişimci']] },
  { key: 'availableCapital', i18nKey: 'availableCapital', descKey: 'availableCapitalDesc', data: [['none','None','Yok'],['limited','Limited','Sınırlı'],['funded','Funded','Yatırım Almış']] },
  { key: 'timeCommitment', i18nKey: 'timeCommitment', descKey: 'timeCommitmentDesc', data: [['side-project','Side Project','Yan Proje'],['full-time','Full-Time','Tam Zamanlı']] },
  { key: 'technicalDepth', i18nKey: 'technicalDepth', descKey: 'technicalDepthDesc', data: [['low','Low','Düşük'],['medium','Medium','Orta'],['high','High','Yüksek']] },
  { key: 'riskTolerance', i18nKey: 'riskTolerance', descKey: 'riskToleranceDesc', data: [['low','Low','Düşük'],['medium','Medium','Orta'],['high','High','Yüksek']] },
];

export default function ConfigureEditScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const { getProfile, updateDNA, updateFounderState, updateConstraints, setStage, updateName, deleteProfile } = useFounderOSStore();
  const { colorMode } = useThemeStore();
  const { isPremium } = usePurchaseStore();
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale) ?? 'en';
  const isDark = colorMode === 'dark';
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    if (!isPremium) setPaywallVisible(true);
  }, []);

  const profile = profileId ? getProfile(profileId) : null;
  const [activeSection, setActiveSection] = useState<Section>('dna');

  if (!profile) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: isDark ? '#07050f' : '#f1f5f9' }]}>
        <View style={s.emptyState}>
          <Text style={{ color: isDark ? '#e2e8f0' : '#0f172a', fontSize: 16 }}>{t('profileNotFound')}</Text>
          <Pressable onPress={() => router.back()} style={s.backBtnWrap}>
            <Text style={{ color: theme.colors.accent, fontWeight: '600' }}>{t('goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const bg = isDark ? '#07050f' : '#f1f5f9';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc';

  const [localName, setLocalName] = useState(profile.name);
  const [localDNA, setLocalDNA] = useState<ProductDNA>({ ...profile.productDNA });
  const [localFounder, setLocalFounder] = useState<FounderState>({ ...profile.founderState });
  const [localConstraints, setLocalConstraints] = useState<Constraints>({ ...profile.constraints });
  const [localStage, setLocalStage] = useState<LifecycleStage>(profile.stage);

  function handleSave() {
    if (localName !== profile!.name) updateName(profile!.id, localName);
    updateDNA(profile!.id, localDNA);
    updateFounderState(profile!.id, localFounder);
    updateConstraints(profile!.id, localConstraints);
    if (localStage !== profile!.stage) setStage(profile!.id, localStage);
    router.back();
  }

  function handleDelete() {
    Alert.alert(t('deleteProfile'), t('deleteProfileConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => { deleteProfile(profile!.id); router.replace('/strategy-dashboard'); } },
    ]);
  }

  function renderChips<T extends string>(items: OptionItem<T>[], selected: T, onSelect: (v: T) => void) {
    return (
      <View style={s.chipRow}>
        {items.map((item) => {
          const active = selected === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => onSelect(item.value)}
              style={[s.chip, {
                borderColor: active ? theme.colors.accent : borderColor,
                backgroundColor: active ? theme.colors.accent + '22' : cardBg,
              }]}
            >
              <Text style={[s.chipText, { color: active ? theme.colors.accent : textPrimary }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderDNASection() {
    return DNA_FIELDS.map((field) => (
      <View key={field.key} style={s.fieldGroup}>
        <Text style={[s.fieldLabel, { color: textSecondary }]}>{t(field.i18nKey)}</Text>
        <Text style={[s.fieldDesc, { color: textMuted }]}>{t(field.descKey)}</Text>
        {renderChips(localizedOptions(field.data, locale), localDNA[field.key as keyof ProductDNA] as string, (v) => setLocalDNA({ ...localDNA, [field.key]: v }))}
      </View>
    ));
  }

  function renderFounderSection() {
    return FOUNDER_FIELDS.map((field) => (
      <View key={field.key} style={s.fieldGroup}>
        <Text style={[s.fieldLabel, { color: textSecondary }]}>{t(field.i18nKey)}</Text>
        <Text style={[s.fieldDesc, { color: textMuted }]}>{t(field.descKey)}</Text>
        {renderChips(localizedOptions(field.data, locale), localFounder[field.key as keyof FounderState] as string, (v) => setLocalFounder({ ...localFounder, [field.key]: v }))}
      </View>
    ));
  }

  function renderConstraintsSection() {
    return (
      <>
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('monthlyBudget')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={String(localConstraints.budget)}
            onChangeText={(v) => setLocalConstraints({ ...localConstraints, budget: parseInt(v, 10) || 0 })}
            keyboardType="numeric"
          />
        </View>
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('monthlyRunway')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={String(localConstraints.monthlyRunway)}
            onChangeText={(v) => setLocalConstraints({ ...localConstraints, monthlyRunway: parseInt(v, 10) || 0 })}
            keyboardType="numeric"
          />
        </View>
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('teamSize')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={String(localConstraints.teamSize)}
            onChangeText={(v) => setLocalConstraints({ ...localConstraints, teamSize: parseInt(v, 10) || 1 })}
            keyboardType="numeric"
          />
        </View>
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('distributionAccess')}</Text>
          {renderChips(
            localizedOptions([['none','None','Yok'],['small-audience','Small Audience','Küçük Kitle'],['large-audience','Large Audience','Büyük Kitle']], locale),
            localConstraints.distributionAccess,
            (v) => setLocalConstraints({ ...localConstraints, distributionAccess: v as any }),
          )}
        </View>
      </>
    );
  }

  function renderStageSection() {
    return (
      <>
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('projectName')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
            value={localName}
            onChangeText={setLocalName}
          />
        </View>
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: textSecondary }]}>{t('lifecycleStage')}</Text>
          {LIFECYCLE_STAGES.map((st) => {
            const active = localStage === st;
            return (
              <Pressable
                key={st}
                onPress={() => setLocalStage(st)}
                style={[s.stageCard, {
                  borderColor: active ? theme.colors.accent : borderColor,
                  backgroundColor: active ? theme.colors.accent + '15' : cardBg,
                }]}
              >
                <View style={s.stageRow}>
                  <View style={[s.radio, active && s.radioActive]} />
                  <Text style={[s.stageLabel, { color: active ? theme.colors.accent : textPrimary }]}>
                    {LIFECYCLE_STAGE_LABELS[st][locale]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  }

  const sectionRenderers: Record<Section, () => React.ReactNode> = {
    dna: renderDNASection,
    founder: renderFounderSection,
    constraints: renderConstraintsSection,
    stage: renderStageSection,
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <View style={[s.header, { borderBottomColor: borderColor }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: textPrimary }]}>{t('editConfigurationTitle')}</Text>
      </View>

      {/* Section tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.tabRow, { borderBottomColor: borderColor }]}>
        {SECTIONS.map((sec) => {
          const active = activeSection === sec.key;
          return (
            <Pressable key={sec.key} onPress={() => setActiveSection(sec.key)} style={[s.tab, active && s.tabActive]}>
              <MaterialCommunityIcons name={sec.icon as any} size={18} color={active ? theme.colors.accent : textMuted} />
              <Text style={[s.tabText, { color: active ? theme.colors.accent : textMuted }]}>{t(sec.i18nKey)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {sectionRenderers[activeSection]()}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { borderTopColor: borderColor, backgroundColor: bg }]}>
        <Pressable onPress={handleDelete} style={[s.deleteBtn, { borderColor: '#ef444444' }]}>
          <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
        </Pressable>
        <Pressable onPress={handleSave} style={[s.saveBtn, { backgroundColor: theme.colors.accent }]}>
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={s.saveBtnText}>{t('saveAndRecalculate')}</Text>
        </Pressable>
      </View>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => {
          setPaywallVisible(false);
          if (!isPremium) router.back();
        }}
      />
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
  tabRow: { borderBottomWidth: 1, maxHeight: 52 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1d4ed8' },
  tabText: { fontSize: 13, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  fieldDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 14, fontWeight: '600' },
  input: { fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, fontWeight: '600' },
  stageCard: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(148,163,184,0.4)' },
  radioActive: { borderColor: '#1d4ed8', backgroundColor: '#1d4ed8' },
  stageLabel: { fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  deleteBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  backBtnWrap: { paddingVertical: 8, paddingHorizontal: 16 },
});
