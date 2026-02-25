import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../src/store/themeStore';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { PaywallModal } from '../src/components/PaywallModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFounderOSStore } from '../src/store/founderOSStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../src/constants/theme';
import { Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocaleStore } from '../src/store/localeStore';
import { useTranslation } from '../src/hooks/useTranslation';

const FOUNDER_OS_STORAGE_KEY = 'founder-os-profiles-v1';
const ONBOARDING_KEY = 'onboarding_complete_v4';

export default function SettingsScreen() {
    const { colorMode, toggleColorMode } = useThemeStore();
    const locale = useLocaleStore((s) => s.locale);
    const setLocale = useLocaleStore((s) => s.setLocale);
    const { t } = useTranslation();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#0f0d1a' : '#ffffff';
    const textColor = isDark ? 'white' : '#0f172a';
    const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
    const textMuted = isDark ? '#94a3b8' : '#64748b';
    const { isPremium } = usePurchaseStore();
    const [paywallVisible, setPaywallVisible] = useState(false);
    const resetAll = useFounderOSStore((s) => s.resetAll);
    const profiles = useFounderOSStore((s) => s.profiles);
    const deleteProfile = useFounderOSStore((s) => s.deleteProfile);

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleReset = () => {
        Alert.alert(
            t('resetAllDataConfirmTitle'),
            t('resetAllDataConfirmMsg'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('resetEverything'),
                    style: 'destructive',
                    onPress: async () => {
                        resetAll();
                        useLocaleStore.getState().setLocale(null);
                        try {
                            await AsyncStorage.multiRemove([
                                FOUNDER_OS_STORAGE_KEY,
                                ONBOARDING_KEY,
                                'app-locale-storage',
                            ]);
                        } catch (_) {}
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const SettingRow = ({
        icon, iconColor, label, rightEl, onPress, borderless, subtitle
    }: {
        icon: string; iconColor: string; label: string;
        rightEl?: React.ReactNode; onPress?: () => void; borderless?: boolean; subtitle?: string;
    }) => (
        <Pressable
            onPress={() => { triggerHaptic(); onPress?.(); }}
            style={[m.settingRow, { borderBottomColor: borderColor }, borderless && { borderBottomWidth: 0 }]}
        >
            <View style={m.settingLeft}>
                <View style={[m.rowIcon, { backgroundColor: iconColor + '15' }]}>
                    <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
                </View>
                <View>
                    <Text style={[m.settingLabel, { color: textColor }]}>{label}</Text>
                    {subtitle && <Text style={[m.settingSub, { color: textMuted }]}>{subtitle}</Text>}
                </View>
            </View>
            {rightEl}
        </Pressable>
    );

    return (
        <SafeAreaView style={[m.sheet, { backgroundColor: bg, flex: 1 }]}>
            <View style={m.header}>
                <Text style={[m.title, { color: textColor }]}>{t('settings')}</Text>
                <Pressable onPress={() => router.back()} style={m.closeBtnIcon}>
                    <MaterialCommunityIcons name="close" size={24} color={textColor} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={[m.section, { color: textMuted }]}>{t('general')}</Text>
                <View style={[m.settingGroup, { borderColor }]}>
                    <SettingRow
                        icon="translate"
                        iconColor={theme.colors.accent}
                        label={t('chooseLanguage')}
                        subtitle={locale === 'tr' ? 'Türkçe' : 'English'}
                        onPress={() => {
                            Alert.alert(
                                t('chooseLanguage'),
                                undefined,
                                [
                                    { text: t('cancel'), style: 'cancel' },
                                    { text: 'Türkçe', onPress: () => setLocale('tr') },
                                    { text: 'English', onPress: () => setLocale('en') },
                                ]
                            );
                        }}
                        rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                    />
                    <SettingRow
                        icon="theme-light-dark"
                        iconColor={isDark ? '#60a5fa' : '#f59e0b'}
                        label={t('appearance')}
                        subtitle={isDark ? t('darkMode') : t('lightMode')}
                        onPress={toggleColorMode}
                        borderless
                        rightEl={<Switch value={isDark} onValueChange={toggleColorMode} />}
                    />
                </View>

                <Text style={[m.section, { color: textMuted }]}>{t('premium')}</Text>
                <View style={[m.settingGroup, { borderColor }]}>
                    <SettingRow
                        icon="crown"
                        iconColor="#f59e0b"
                        label={isPremium ? t('premiumUnlocked') : t('upgradePro')}
                        onPress={() => !isPremium && setPaywallVisible(true)}
                        borderless
                        rightEl={
                            isPremium ? (
                                <View style={m.proBadge}><Text style={m.proBadgeText}>PRO</Text></View>
                            ) : (
                                <MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />
                            )
                        }
                    />
                </View>

                <Text style={[m.section, { color: textMuted }]}>{t('yourProducts')}</Text>
                <View style={[m.settingGroup, { borderColor }]}>
                    {profiles.length === 0 ? (
                        <View style={m.settingRow}>
                            <Text style={[m.settingLabel, { color: textMuted }]}>{t('noProducts')}</Text>
                        </View>
                    ) : (
                        profiles.map((p, idx) => (
                            <SettingRow
                                key={p.id}
                                icon="briefcase-outline"
                                iconColor={theme.colors.accent}
                                label={p.name}
                                borderless={idx === profiles.length - 1}
                                onPress={() => {
                                    if (!isPremium) { setPaywallVisible(true); return; }
                                    Alert.alert(
                                        t('deleteProfile'),
                                        t('deleteProductConfirm'),
                                        [
                                            { text: t('cancel'), style: 'cancel' },
                                            { text: t('delete'), style: 'destructive', onPress: () => deleteProfile(p.id) },
                                        ]
                                    );
                                }}
                                rightEl={
                                    <MaterialCommunityIcons
                                        name={isPremium ? 'delete-outline' : 'lock-outline'}
                                        size={20}
                                        color={isPremium ? '#ef4444' : textMuted}
                                    />
                                }
                            />
                        ))
                    )}
                </View>

                <Text style={[m.section, { color: textMuted }]}>{t('supportLegal')}</Text>
                <View style={[m.settingGroup, { borderColor }]}>
                    <SettingRow
                        icon="email-outline"
                        iconColor="#10b981"
                        label={t('sendFeedback')}
                        onPress={() => Linking.openURL('mailto:support@founderos.app')}
                    />
                    <SettingRow
                        icon="shield-check-outline"
                        iconColor="#6366f1"
                        label={t('privacyPolicy')}
                        onPress={() => Linking.openURL('https://founderos.app/privacy')}
                    />
                    <SettingRow
                        icon="file-document-outline"
                        iconColor="#94a3b8"
                        label={t('termsOfService')}
                        onPress={() => Linking.openURL('https://founderos.app/terms')}
                        borderless
                    />
                </View>

                <Text style={[m.section, { color: '#ef4444' }]}>{t('dangerZone')}</Text>
                <Pressable
                    onPress={handleReset}
                    style={[m.settingRow, m.dangerRow, { backgroundColor: '#ef444410', borderColor: '#ef444430' }]}
                >
                    <View style={m.settingLeft}>
                        <View style={[m.rowIcon, { backgroundColor: '#ef444420' }]}>
                            <MaterialCommunityIcons name="delete-forever-outline" size={20} color="#ef4444" />
                        </View>
                        <View>
                            <Text style={[m.settingLabel, { color: '#ef4444' }]}>{t('resetAllData')}</Text>
                            <Text style={[m.settingSub, { color: '#ef444499' }]}>{t('resetAllDataDesc')}</Text>
                        </View>
                    </View>
                </Pressable>

                <View style={m.versionInfo}>
                    <Text style={[m.versionText, { color: textMuted }]}>{t('versionLabel')}</Text>
                    <Text style={[m.versionText, { color: textMuted, marginTop: 4 }]}>{t('versionSub')}</Text>
                </View>
            </ScrollView>

            <View style={m.footer}>
                <Pressable style={m.closeBtn} onPress={() => router.back()}>
                    <Text style={m.closeBtnText}>{t('done')}</Text>
                </Pressable>
            </View>

            <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
        </SafeAreaView>
    );
}

const m = StyleSheet.create({
    sheet: { padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    closeBtnIcon: { padding: 4 },
    title: { fontSize: 24, fontWeight: 'bold' },
    section: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, marginTop: 20 },
    settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, paddingHorizontal: 4 },
    settingGroup: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', paddingHorizontal: 12, backgroundColor: 'transparent' },
    rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    settingLabel: { fontSize: 16, fontWeight: '600' },
    settingSub: { fontSize: 13, marginTop: 1 },
    footer: { paddingVertical: 20 },
    closeBtn: { backgroundColor: '#1d4ed8', borderRadius: 18, height: 56, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    proBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    proBadgeText: { color: '#f59e0b', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    dangerRow: { marginTop: 8, borderRadius: 16, borderBottomWidth: 0, paddingHorizontal: 16, borderWidth: 1 },
    versionInfo: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
    versionText: { fontSize: 12, fontWeight: '500', opacity: 0.7 },
});
