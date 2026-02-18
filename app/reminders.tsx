import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../src/store/themeStore';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const STORAGE_KEY = 'reminder_settings';

interface ReminderConfig {
    enabled: boolean;
    hour: number;
    minute: number;
    days: boolean[]; // 0=Sun..6=Sat
}

const DEFAULT_CONFIG: ReminderConfig = {
    enabled: false,
    hour: 9,
    minute: 0,
    days: [false, true, true, true, true, true, false], // Mon-Fri
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

async function requestPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

async function scheduleReminderNotifications(config: ReminderConfig) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!config.enabled) return;

    const activeDays = config.days
        .map((enabled, idx) => (enabled ? idx : -1))
        .filter(d => d >= 0);

    for (const weekday of activeDays) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📋 DevChecklist Reminder',
                body: "How's your project going? Check off today's tasks!",
                sound: false,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: weekday + 1, // expo uses 1=Sun..7=Sat
                hour: config.hour,
                minute: config.minute,
            },
        });
    }
}

export default function RemindersScreen() {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#07050f' : '#f1f5f9';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';

    const [config, setConfig] = useState<ReminderConfig>(DEFAULT_CONFIG);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            setHasPermission(status === 'granted');

            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) setConfig(JSON.parse(stored));
        })();
    }, []);

    const save = async (updated: ReminderConfig) => {
        setConfig(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        await scheduleReminderNotifications(updated);
    };

    const toggleEnabled = async (value: boolean) => {
        if (value && !hasPermission) {
            const granted = await requestPermission();
            if (!granted) {
                Alert.alert('Permission Required', 'Please enable notifications in Settings to use reminders.');
                return;
            }
            setHasPermission(true);
        }
        await save({ ...config, enabled: value });
    };

    const toggleDay = (idx: number) => {
        const newDays = [...config.days];
        newDays[idx] = !newDays[idx];
        save({ ...config, days: newDays });
    };

    const adjustHour = (delta: number) => {
        const newHour = (config.hour + delta + 24) % 24;
        save({ ...config, hour: newHour });
    };

    const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${display}:00 ${ampm}`;
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: bg }]} edges={['top']}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color={textPrimary} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerLabel, { color: textMuted }]}>SMART REMINDERS</Text>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>🔔 Daily Check-In</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Main Toggle */}
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
                            <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#6366f1" />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={[styles.cardTitle, { color: textPrimary }]}>Enable Reminders</Text>
                            <Text style={[styles.cardDesc, { color: textMuted }]}>
                                Get a daily nudge to keep your projects moving.
                            </Text>
                        </View>
                        <Switch
                            value={config.enabled}
                            onValueChange={toggleEnabled}
                            trackColor={{ false: '#374151', true: '#6366f1' }}
                            thumbColor="white"
                        />
                    </View>
                </View>

                {config.enabled && (
                    <>
                        {/* Time picker */}
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                            <Text style={[styles.sectionLabel, { color: textMuted }]}>REMINDER TIME</Text>
                            <View style={styles.timePicker}>
                                <Pressable
                                    onPress={() => adjustHour(-1)}
                                    style={[styles.timeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                                >
                                    <MaterialCommunityIcons name="chevron-left" size={24} color={textPrimary} />
                                </Pressable>
                                <Text style={[styles.timeDisplay, { color: textPrimary }]}>{formatHour(config.hour)}</Text>
                                <Pressable
                                    onPress={() => adjustHour(1)}
                                    style={[styles.timeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                                >
                                    <MaterialCommunityIcons name="chevron-right" size={24} color={textPrimary} />
                                </Pressable>
                            </View>
                        </View>

                        {/* Day picker */}
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                            <Text style={[styles.sectionLabel, { color: textMuted }]}>DAYS</Text>
                            <View style={styles.dayRow}>
                                {DAY_LABELS.map((day, idx) => (
                                    <Pressable
                                        key={day}
                                        onPress={() => toggleDay(idx)}
                                        style={[
                                            styles.dayBtn,
                                            {
                                                backgroundColor: config.days[idx] ? '#6366f1' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                                            }
                                        ]}
                                    >
                                        <Text style={[styles.dayText, { color: config.days[idx] ? 'white' : textMuted }]}>
                                            {day}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.infoBox, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }]}>
                            <MaterialCommunityIcons name="information-outline" size={16} color="#6366f1" />
                            <Text style={[styles.infoText, { color: '#6366f1' }]}>
                                Reminders are local and private — no server, no account required.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1 },
    headerLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 16, gap: 12, paddingBottom: 40 },
    card: { borderRadius: 16, borderWidth: 1, padding: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    cardDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
    timePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
    timeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    timeDisplay: { fontSize: 28, fontWeight: '900', minWidth: 120, textAlign: 'center' },
    dayRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
    dayBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, minWidth: 42, alignItems: 'center' },
    dayText: { fontSize: 12, fontWeight: '700' },
    infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
