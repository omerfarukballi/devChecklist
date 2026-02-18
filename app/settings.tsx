import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../src/store/themeStore';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { PaywallModal } from '../src/components/PaywallModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChecklistStore } from '../src/store/checklistStore';
import { exportBackup, importBackup } from '../src/utils/backup';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
    const { colorMode, toggleColorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#0f0d1a' : '#ffffff';
    const textColor = isDark ? 'white' : '#0f172a';
    const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
    const textMuted = isDark ? '#94a3b8' : '#64748b';
    const { isPremium } = usePurchaseStore();
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const store = useChecklistStore();

    const handleExport = async () => {
        const storeData = {
            checklists: store.checklists,
            projects: store.projects,
            templates: store.templates,
        };
        await exportBackup(storeData);
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

                            // Write data into AsyncStorage with the store key, then reload
                            const existing = await AsyncStorage.getItem('dev-checklist-storage');
                            const parsed = existing ? JSON.parse(existing) : {};
                            const merged = { ...parsed, state: data };
                            await AsyncStorage.setItem('dev-checklist-storage', JSON.stringify(merged));

                            Alert.alert(
                                'Restore Complete ✅',
                                'Your data has been restored. Please restart the app to see the changes.',
                            );
                        } finally {
                            setIsImporting(false);
                        }
                    },
                },
            ]
        );
    };

    const SettingRow = ({
        icon, iconColor, label, rightEl, onPress, borderless,
    }: {
        icon: string; iconColor: string; label: string;
        rightEl: React.ReactNode; onPress?: () => void; borderless?: boolean;
    }) => (
        <Pressable
            onPress={onPress}
            style={[m.settingRow, { borderBottomColor: borderColor }, borderless && { borderBottomWidth: 0 }]}
        >
            <View style={m.settingLeft}>
                <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
                <Text style={[m.settingLabel, { color: textColor }]}>{label}</Text>
            </View>
            {rightEl}
        </Pressable>
    );

    return (
        <SafeAreaView style={[m.sheet, { backgroundColor: bg, flex: 1 }]}>
            <View style={m.header}>
                <Text style={[m.title, { color: textColor }]}>Settings</Text>
                <Pressable onPress={() => router.back()} style={m.closeBtnIcon}>
                    <MaterialCommunityIcons name="close" size={24} color={textColor} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Appearance */}
                <Text style={[m.section, { color: textMuted }]}>APPEARANCE</Text>
                <SettingRow
                    icon={isDark ? 'weather-night' : 'white-balance-sunny'}
                    iconColor={isDark ? '#60a5fa' : '#f59e0b'}
                    label={isDark ? 'Dark Mode' : 'Light Mode'}
                    rightEl={
                        <Switch
                            value={isDark}
                            onValueChange={toggleColorMode}
                            trackColor={{ false: '#d1d5db', true: '#1d4ed8' }}
                            thumbColor={isDark ? '#60a5fa' : '#f3f4f6'}
                        />
                    }
                />

                {/* Premium */}
                <Text style={[m.section, { color: textMuted }]}>ACCOUNT</Text>
                <SettingRow
                    icon={isPremium ? 'crown' : 'crown-outline'}
                    iconColor={isPremium ? '#f59e0b' : textMuted}
                    label={isPremium ? 'Premium Active' : 'Upgrade to Pro'}
                    onPress={() => !isPremium && setPaywallVisible(true)}
                    rightEl={
                        isPremium ? (
                            <View style={m.proBadge}><Text style={m.proBadgeText}>LIFETIME</Text></View>
                        ) : (
                            <MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />
                        )
                    }
                />

                {/* Data */}
                <Text style={[m.section, { color: textMuted }]}>DATA</Text>
                <SettingRow
                    icon="database-export-outline"
                    iconColor="#6366f1"
                    label="Export Backup"
                    onPress={handleExport}
                    rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                />
                <SettingRow
                    icon="database-import-outline"
                    iconColor="#10b981"
                    label={isImporting ? 'Importing...' : 'Restore Backup'}
                    onPress={handleImport}
                    borderless
                    rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                />

                {/* Navigation shortcuts */}
                <Text style={[m.section, { color: textMuted }]}>FEATURES</Text>
                <SettingRow
                    icon="trophy-outline"
                    iconColor="#f59e0b"
                    label="Achievements"
                    onPress={() => router.push('/achievements')}
                    rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                />
                <SettingRow
                    icon="chart-line"
                    iconColor="#10b981"
                    label="Growth Playbook"
                    onPress={() => router.push('/growth')}
                    rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                />
                <SettingRow
                    icon="chart-bar"
                    iconColor="#6366f1"
                    label="Analytics"
                    onPress={() => router.push('/analytics')}
                    rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                />
                <SettingRow
                    icon="bell-ring-outline"
                    iconColor="#ec4899"
                    label="Smart Reminders"
                    onPress={() => router.push('/reminders')}
                    rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                />
                <SettingRow
                    icon="share-variant-outline"
                    iconColor="#8b5cf6"
                    label="Share Progress"
                    onPress={() => router.push('/share-card')} // No params = overall
                    borderless
                    rightEl={<MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />}
                />
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
        justifyContent: 'space-between', paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { fontSize: 16, fontWeight: '500' },
    footer: { marginTop: 'auto', paddingTop: 24 },
    closeBtn: { backgroundColor: '#1d4ed8', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    proBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    proBadgeText: { color: '#f59e0b', fontSize: 11, fontWeight: '900' },
});
