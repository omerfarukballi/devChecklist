import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../src/store/themeStore';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { PaywallModal } from '../src/components/PaywallModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChecklistStore, UserSettings } from '../src/store/checklistStore';
import { useStrategyProfileStore } from '../src/store/strategyProfileStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportBackup, importBackup } from '../src/utils/backup';
import { scheduleDailyReminder, cancelAllReminders, registerForPushNotificationsAsync } from '../src/utils/notifications';

const CHECKLIST_STORAGE_KEY = 'dev-checklist-storage';
const STRATEGY_STORAGE_KEY = 'dev-checklist-strategy-v1';
const ONBOARDING_KEY = 'onboarding_complete_v3';
import { theme } from '../src/constants/theme';
import { TextInput, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Experience } from '../src/types';
import { useLocaleStore } from '../src/store/localeStore';
import { useTranslation } from '../src/hooks/useTranslation';

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
    const [isImporting, setIsImporting] = useState(false);

    const {
        checklists, projects, templates, userName, setUserName,
        settings, updateSettings, resetApp, loadBackup
    } = useChecklistStore();
    const resetStrategy = useStrategyProfileStore((s) => s.resetStrategy);

    const triggerHaptic = () => {
        if (settings.hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleExport = async () => {
        const checklistState = useChecklistStore.getState();
        const strategyState = useStrategyProfileStore.getState();
        const storeData = {
            checklists: checklistState.checklists,
            projects: checklistState.projects,
            templates: checklistState.templates,
            userName: checklistState.userName,
            settings: checklistState.settings,
            strategyProfiles: strategyState.strategyProfiles,
        };
        await exportBackup(storeData);
    };

    const handleReset = () => {
        Alert.alert(
            '⚠️ DANGER ZONE',
            'This will permanently delete ALL projects, checklists, strategy profiles, and settings. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Everything',
                    style: 'destructive',
                    onPress: async () => {
                        resetApp();
                        resetStrategy();
                        useLocaleStore.getState().setLocale(null);
                        try {
                            await AsyncStorage.multiRemove([
                                CHECKLIST_STORAGE_KEY,
                                STRATEGY_STORAGE_KEY,
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

    const handleImport = async () => {
        Alert.alert(
            'Restore Backup',
            'This will replace all your current data with the backup. This action cannot be undone. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Import',
                    style: 'destructive',
                    onPress: async () => {
                        setIsImporting(true);
                        try {
                            const data = await importBackup();
                            if (!data) { setIsImporting(false); return; }

                            const checklistData = {
                                checklists: data.checklists,
                                projects: data.projects,
                                templates: data.templates,
                                userName: data.userName,
                                settings: data.settings,
                            };
                            loadBackup(checklistData);
                            if (data.strategyProfiles && Array.isArray(data.strategyProfiles)) {
                                useStrategyProfileStore.getState().restoreFromBackup(data.strategyProfiles);
                            }

                            triggerHaptic();
                            Alert.alert(
                                'Data Restored ✅',
                                'Your backup has been successfully imported.',
                            );
                        } catch (error) {
                            Alert.alert('Import Error', 'Failed to process backup file.');
                        } finally {
                            setIsImporting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleToggleReminders = async (enabled: boolean) => {
        if (enabled) {
            const granted = await registerForPushNotificationsAsync();
            if (granted) {
                updateSettings({ remindersEnabled: true });
                scheduleDailyReminder(settings.reminderTime);
                Alert.alert("Success", "Daily reminders enabled!");
            } else {
                Alert.alert("Permission Denied", "Please enable notifications in your device settings to use this feature.");
                updateSettings({ remindersEnabled: false });
            }
        } else {
            updateSettings({ remindersEnabled: false });
            cancelAllReminders();
        }
    };

    const handleSetTime = () => {
        Alert.prompt(
            "Set Reminder Time",
            "Enter time in HH:mm format (e.g. 08:30 or 18:00)",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: (time?: string) => {
                        if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
                            updateSettings({ reminderTime: time });
                            if (settings.remindersEnabled) {
                                scheduleDailyReminder(time as string);
                            }
                            triggerHaptic();
                        } else {
                            Alert.alert("Invalid Format", "Please use HH:mm format.");
                        }
                    }
                }
            ],
            'plain-text',
            settings.reminderTime
        );
    };

    const SettingRow = ({
        icon, iconColor, label, rightEl, onPress, borderless, subtitle
    }: {
        icon: string; iconColor: string; label: string;
        rightEl?: React.ReactNode; onPress?: () => void; borderless?: boolean; subtitle?: string;
    }) => (
        <Pressable
            onPress={() => {
                triggerHaptic();
                onPress?.();
            }}
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

            <ScrollView showsVerticalScrollIndicator={false}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Personalization */}
                    <View style={[m.nameCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                        <Text style={[m.section, { marginTop: 0, marginBottom: 12, color: textMuted }]}>PROFILE</Text>
                        <View style={m.nameInputRow}>
                            <View style={[m.avatar, { backgroundColor: '#6366f1' }]}>
                                <Text style={m.avatarText}>{(userName || 'B')[0].toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[m.settingSub, { color: textMuted, marginBottom: 4 }]}>What should we call you?</Text>
                                <TextInput
                                    value={userName || ''}
                                    onChangeText={setUserName}
                                    placeholder="Builder Name"
                                    placeholderTextColor={textMuted}
                                    style={[m.nameInput, { color: textColor }]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Growth Preference */}
                    <Text style={[m.section, { color: textMuted }]}>GENERAL</Text>
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
                            icon="arm-flex-outline"
                            iconColor="#f59e0b"
                            label="Experience Level"
                            subtitle={settings.defaultExperience.charAt(0).toUpperCase() + settings.defaultExperience.slice(1)}
                            onPress={() => {
                                const levels: Experience[] = ['beginner', 'intermediate', 'advanced'];
                                const next = levels[(levels.indexOf(settings.defaultExperience) + 1) % 3];
                                updateSettings({ defaultExperience: next });
                            }}
                            rightEl={<MaterialCommunityIcons name="cached" size={18} color={textMuted} />}
                        />
                        <SettingRow
                            icon="vibrate"
                            iconColor="#ec4899"
                            label="Haptic Feedback"
                            rightEl={
                                <Switch
                                    value={settings.hapticsEnabled}
                                    onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
                                    trackColor={{ false: '#d1d5db', true: '#10b981' }}
                                />
                            }
                        />
                        <SettingRow
                            icon="theme-light-dark"
                            iconColor={isDark ? '#60a5fa' : '#f59e0b'}
                            label="Appearance"
                            subtitle={isDark ? 'Dark Mode' : 'Light Mode'}
                            onPress={toggleColorMode}
                            borderless
                            rightEl={<Switch value={isDark} onValueChange={toggleColorMode} />}
                        />
                    </View>

                    {/* Notifications */}
                    <Text style={[m.section, { color: textMuted }]}>NOTIFICATIONS</Text>
                    <View style={[m.settingGroup, { borderColor }]}>
                        <SettingRow
                            icon="bell-ring-outline"
                            iconColor="#8b5cf6"
                            label="Daily Reminders"
                            rightEl={
                                <Switch
                                    value={settings.remindersEnabled}
                                    onValueChange={handleToggleReminders}
                                />
                            }
                        />
                        <SettingRow
                            icon="clock-outline"
                            iconColor="#6366f1"
                            label="Reminder Time"
                            subtitle={settings.reminderTime}
                            borderless
                            onPress={handleSetTime}
                            rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                        />
                    </View>

                    {/* Premium Features */}
                    <Text style={[m.section, { color: textMuted }]}>PREMIUM</Text>
                    <View style={[m.settingGroup, { borderColor }]}>
                        <SettingRow
                            icon="crown"
                            iconColor="#f59e0b"
                            label={isPremium ? 'Premium Plan Unlocked' : 'Upgrade to Lifetime Pro'}
                            onPress={() => !isPremium && setPaywallVisible(true)}
                            rightEl={
                                isPremium ? (
                                    <View style={m.proBadge}><Text style={m.proBadgeText}>PRO</Text></View>
                                ) : (
                                    <MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />
                                )
                            }
                        />
                        <SettingRow
                            icon="apps"
                            iconColor="#6366f1"
                            label="Custom App Icons"
                            subtitle={settings.appIcon.charAt(0).toUpperCase() + settings.appIcon.slice(1)}
                            borderless
                            onPress={() => isPremium ? Alert.alert("Icons", "Custom icons are coming in the next build!") : setPaywallVisible(true)}
                            rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                        />
                    </View>

                    {/* Support & Legal */}
                    <Text style={[m.section, { color: textMuted }]}>SUPPORT & LEGAL</Text>
                    <View style={[m.settingGroup, { borderColor }]}>
                        <SettingRow
                            icon="email-outline"
                            iconColor="#10b981"
                            label="Send Feedback"
                            onPress={() => Linking.openURL('mailto:support@devchecklist.app')}
                        />
                        <SettingRow
                            icon="shield-check-outline"
                            iconColor="#6366f1"
                            label="Privacy Policy"
                            onPress={() => Linking.openURL('https://devchecklist.app/privacy')}
                        />
                        <SettingRow
                            icon="file-document-outline"
                            iconColor="#94a3b8"
                            label="Terms of Service"
                            onPress={() => Linking.openURL('https://devchecklist.app/terms')}
                            borderless
                        />
                    </View>

                    {/* Data Management */}
                    <Text style={[m.section, { color: textMuted }]}>DATA MANAGEMENT</Text>
                    <View style={[m.settingGroup, { borderColor }]}>
                        <SettingRow
                            icon="database-export-outline"
                            iconColor="#6366f1"
                            label="Export All Content"
                            onPress={handleExport}
                        />
                        <SettingRow
                            icon="database-import-outline"
                            iconColor="#10b981"
                            label="Restore from Backup"
                            onPress={handleImport}
                            borderless
                        />
                    </View>

                    {/* Danger Zone */}
                    <Text style={[m.section, { color: '#ef4444' }]}>DANGER ZONE</Text>
                    <Pressable
                        onPress={handleReset}
                        style={[m.settingRow, m.dangerRow, { backgroundColor: '#ef444410', borderColor: '#ef444430' }]}
                    >
                        <View style={m.settingLeft}>
                            <View style={[m.rowIcon, { backgroundColor: '#ef444420' }]}>
                                <MaterialCommunityIcons name="delete-forever-outline" size={20} color="#ef4444" />
                            </View>
                            <View>
                                <Text style={[m.settingLabel, { color: '#ef4444' }]}>Reset All Data</Text>
                                <Text style={[m.settingSub, { color: '#ef444499' }]}>Delete everything and start fresh</Text>
                            </View>
                        </View>
                    </Pressable>

                    <View style={m.versionInfo}>
                        <Text style={[m.versionText, { color: textMuted }]}>DevChecklist v1.0.0 (Build 42)</Text>
                        <Text style={[m.versionText, { color: textMuted, marginTop: 4 }]}>Handcrafted for builders 🚀</Text>
                    </View>
                </ScrollView>
            </ScrollView>

            <View style={m.footer}>
                <Pressable style={m.closeBtn} onPress={() => router.back()}>
                    <Text style={m.closeBtnText}>Done</Text>
                </Pressable>
            </View>

            <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
        </SafeAreaView>
    );
}

const m = StyleSheet.create({
    sheet: { padding: 24 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeBtnIcon: { padding: 4 },
    title: { fontSize: 24, fontWeight: 'bold' },
    section: {
        fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
        letterSpacing: 0.8, marginBottom: 4, marginTop: 20,
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingVertical: 14,
        borderBottomWidth: 1, paddingHorizontal: 4,
    },
    settingGroup: {
        borderWidth: 1, borderRadius: 16, overflow: 'hidden', paddingHorizontal: 12,
        backgroundColor: 'transparent',
    },
    rowIcon: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    settingLabel: { fontSize: 16, fontWeight: '600' },
    settingSub: { fontSize: 13, marginTop: 1 },
    footer: { paddingVertical: 20 },
    closeBtn: { backgroundColor: '#1d4ed8', borderRadius: 18, height: 56, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    proBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    proBadgeText: { color: '#f59e0b', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
    nameCard: { padding: 16, borderRadius: 20, marginBottom: 4 },
    nameInputRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    nameInput: { fontSize: 18, fontWeight: '700', padding: 0 },
    dangerRow: { marginTop: 8, borderRadius: 16, borderBottomWidth: 0, paddingHorizontal: 16, borderWidth: 1 },
    versionInfo: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
    versionText: { fontSize: 12, fontWeight: '500', opacity: 0.7 },
});
