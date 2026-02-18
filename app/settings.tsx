import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../src/store/themeStore';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { PaywallModal } from '../src/components/PaywallModal';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { colorMode, toggleColorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#0f0d1a' : '#ffffff';
    const textColor = isDark ? 'white' : '#0f172a';
    const handleColor = isDark ? '#374151' : '#e2e8f0';
    const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
    const textMuted = isDark ? '#94a3b8' : '#64748b';
    const { isPremium } = usePurchaseStore();
    const [paywallVisible, setPaywallVisible] = useState(false);

    return (
        <SafeAreaView style={[m.sheet, { backgroundColor: bg, flex: 1 }]}>
            <View style={m.header}>
                <Text style={[m.title, { color: textColor }]}>Settings</Text>
                <Pressable onPress={() => router.back()} style={m.closeBtnIcon}>
                    <MaterialCommunityIcons name="close" size={24} color={textColor} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Dark / Light mode toggle */}
                <View style={[m.settingRow, { borderBottomColor: borderColor }]}>
                    <View style={m.settingLeft}>
                        <MaterialCommunityIcons
                            name={isDark ? 'weather-night' : 'white-balance-sunny'}
                            size={22}
                            color={isDark ? '#60a5fa' : '#f59e0b'}
                        />
                        <Text style={[m.settingLabel, { color: textColor }]}>
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleColorMode}
                        trackColor={{ false: '#d1d5db', true: '#1d4ed8' }}
                        thumbColor={isDark ? '#60a5fa' : '#f3f4f6'}
                    />
                </View>

                {/* Premium Status */}
                <Pressable
                    onPress={() => !isPremium && setPaywallVisible(true)}
                    style={[m.settingRow, { borderBottomWidth: 0 }]}
                >
                    <View style={m.settingLeft}>
                        <MaterialCommunityIcons
                            name={isPremium ? 'crown' : 'crown-outline'}
                            size={22}
                            color={isPremium ? '#f59e0b' : textMuted}
                        />
                        <Text style={[m.settingLabel, { color: textColor }]}>
                            {isPremium ? 'Premium Active' : 'Upgrade to Pro'}
                        </Text>
                    </View>
                    {isPremium ? (
                        <View style={m.proBadge}>
                            <Text style={m.proBadgeText}>LIFETIME</Text>
                        </View>
                    ) : (
                        <MaterialCommunityIcons name="chevron-right" size={20} color={textMuted} />
                    )}
                </Pressable>
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
        marginBottom: 24,
    },
    closeBtnIcon: {
        padding: 4,
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    // Settings row
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        borderBottomWidth: 1,
        marginBottom: 8,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { fontSize: 16, fontWeight: '500' },
    footer: {
        marginTop: 'auto',
        paddingTop: 24,
    },
    closeBtn: { backgroundColor: '#1d4ed8', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    proBadge: { backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    proBadgeText: { color: '#f59e0b', fontSize: 11, fontWeight: '900' },
});
