import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert, ScrollView,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn, Layout as RNLayout } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../src/store/themeStore';
import { usePurchaseStore } from '../src/store/purchaseStore';
import { useFounderOSStore } from '../src/store/founderOSStore';
import { extractTasks } from '../src/types/founderOS';
import { theme } from '../src/constants/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { PaywallModal } from '../src/components/PaywallModal';
import { ShareCard, type ShareCardData } from '../src/components/ShareCard';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';
const DURATIONS: Record<TimerMode, number> = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };

interface CustomTask { id: string; text: string; done: boolean; }
const CUSTOM_TASKS_KEY = 'focus-tasks-v1';

export default function FocusModeScreen() {
  const { colorMode } = useThemeStore();
  const { isPremium } = usePurchaseStore();
  const { t } = useTranslation();
  const isDark = colorMode === 'dark';
  const [paywallVisible, setPaywallVisible] = useState(false);

  const [shareVisible, setShareVisible] = useState(false);
  const [shareData, setShareData] = useState<ShareCardData>({ type: 'session', sessions: 0, focusMinutes: 0 });

  useEffect(() => {
    if (!isPremium) setPaywallVisible(true);
  }, []);

  // Strategic tasks from active profile
  const { profiles, activeProfileId, getProfile, toggleTask } = useFounderOSStore();
  const activeId = activeProfileId ?? profiles[0]?.id ?? null;
  const profile = activeId ? getProfile(activeId) : null;

  const strategicTasks = useMemo(() => {
    if (!profile) return [];
    return extractTasks(profile.strategicOutput);
  }, [profile?.strategicOutput]);

  const taskCompletions = profile?.taskCompletions ?? {};
  const strategicDone = strategicTasks.filter((t) => taskCompletions[t.id]).length;
  const strategicTotal = strategicTasks.length;

  // Group strategic tasks by action title
  const groupedTasks = useMemo(() => {
    const groups: { title: string; tasks: typeof strategicTasks }[] = [];
    strategicTasks.forEach((task) => {
      let group = groups.find((g) => g.title === task.actionTitle);
      if (!group) {
        group = { title: task.actionTitle, tasks: [] };
        groups.push(group);
      }
      group.tasks.push(task);
    });
    return groups;
  }, [strategicTasks]);

  const prevStrategicDone = useRef(strategicDone);
  useEffect(() => {
    if (
      strategicTotal > 0 &&
      strategicDone === strategicTotal &&
      prevStrategicDone.current < strategicTotal
    ) {
      setShareData({
        type: 'allDone',
        tasksCompleted: strategicDone,
        tasksTotal: strategicTotal,
        projectName: profile?.name,
      });
      setShareVisible(true);
    }
    prevStrategicDone.current = strategicDone;
  }, [strategicDone, strategicTotal]);

  function handleToggleStrategic(taskId: string) {
    if (!activeId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTask(activeId, taskId);
  }

  // Timer
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  // Custom tasks
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(CUSTOM_TASKS_KEY).then((raw) => {
      if (raw) setCustomTasks(JSON.parse(raw));
    });
  }, []);

  const saveCustomTasks = useCallback((updated: CustomTask[]) => {
    setCustomTasks(updated);
    AsyncStorage.setItem(CUSTOM_TASKS_KEY, JSON.stringify(updated));
  }, []);

  const bg = isDark ? '#07050f' : '#f1f5f9';
  const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc';
  const color = mode === 'work' ? theme.colors.accent : '#10b981';

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  function handleTimerComplete() {
    setIsRunning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      const nextBreak: TimerMode = newSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
      Alert.alert(t('sessionComplete'), t('sessionCompleteMsg', { count: newSessions }), [
        {
          text: t('shareProgress'),
          onPress: () => {
            setShareData({
              type: 'session',
              sessions: newSessions,
              focusMinutes: newSessions * 25,
              projectName: profile?.name,
            });
            setShareVisible(true);
            switchMode(nextBreak);
          },
        },
        { text: t('startBreak'), onPress: () => switchMode(nextBreak) },
      ]);
    } else {
      Alert.alert(t('breakOver'), t('breakOverMsg'), [
        { text: t('startWorking'), onPress: () => switchMode('work') },
      ]);
    }
  }

  function switchMode(m: TimerMode) { setMode(m); setTimeLeft(DURATIONS[m]); setIsRunning(false); }
  function toggleTimer() { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsRunning(!isRunning); }
  function resetTimer() { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsRunning(false); setTimeLeft(DURATIONS[mode]); }

  function addCustomTask() {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveCustomTasks([...customTasks, { id: Date.now().toString(), text: trimmed, done: false }]);
    setNewTask('');
  }
  function toggleCustomTask(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveCustomTasks(customTasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }
  function deleteCustomTask(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveCustomTasks(customTasks.filter((t) => t.id !== id));
  }
  function clearCompletedCustom() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveCustomTasks(customTasks.filter((t) => !t.done));
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const progress = 1 - timeLeft / DURATIONS[mode];
  const customDoneCount = customTasks.filter((t) => t.done).length;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={[s.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={textPrimary} />
        </Pressable>
        <Text style={[s.headerLabel, { color: textMuted }]}>{t('focusMode')}</Text>
        <Pressable
          onPress={() => {
            setShareData({
              type: strategicDone === strategicTotal && strategicTotal > 0 ? 'allDone' : 'tasks',
              sessions,
              focusMinutes: sessions * 25,
              tasksCompleted: strategicDone,
              tasksTotal: strategicTotal,
              projectName: profile?.name,
            });
            setShareVisible(true);
          }}
          style={[s.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
        >
          <MaterialCommunityIcons name="share-variant-outline" size={20} color={textPrimary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Timer */}
          <Animated.View entering={FadeInDown.delay(100)} style={[s.timerCard, { borderColor: color + '44', backgroundColor: color + '10' }]}>
            <View style={s.modeRow}>
              <MaterialCommunityIcons name={mode === 'work' ? 'brain' : 'coffee-outline'} size={20} color={color} />
              <Text style={[s.modeText, { color }]}>{mode === 'work' ? t('focus') : mode === 'shortBreak' ? t('shortBreak') : t('longBreak')}</Text>
            </View>
            <View style={s.ringWrap}>
              <View style={[s.ringBg, { borderColor: color + '22' }]}>
                <Text style={[s.timerText, { color: textPrimary }]}>{timeStr}</Text>
              </View>
              <View style={[s.progressArc, { borderColor: color, transform: [{ rotate: `${progress * 360}deg` }] }]} />
            </View>
            <View style={s.actions}>
              <Pressable onPress={toggleTimer} style={[s.mainBtn, { backgroundColor: color }]}>
                <MaterialCommunityIcons name={isRunning ? 'pause' : 'play'} size={32} color="#fff" />
              </Pressable>
              <Pressable onPress={resetTimer} style={[s.resetBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <MaterialCommunityIcons name="refresh" size={22} color={textMuted} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Stats + Mode */}
          <View style={s.statsRow}>
            <View style={[s.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[s.statValue, { color: textPrimary }]}>{sessions}</Text>
              <Text style={[s.statLabel, { color: textMuted }]}>{t('sessions')}</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <Text style={[s.statValue, { color: textPrimary }]}>{sessions * 25}m</Text>
              <Text style={[s.statLabel, { color: textMuted }]}>{t('focusTime')}</Text>
            </View>
          </View>

          <View style={s.modeSwitcher}>
            {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
              <Pressable key={m} onPress={() => switchMode(m)} style={[s.modeChip, { backgroundColor: mode === m ? color + '22' : 'transparent', borderColor: mode === m ? color + '44' : cardBorder }]}>
                <Text style={[s.modeChipText, { color: mode === m ? color : textMuted }]}>
                  {m === 'work' ? '25 min' : m === 'shortBreak' ? '5 min' : '15 min'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ═══ Strategic Tasks (auto-generated) ═══ */}
          <Animated.View entering={FadeInDown.delay(200)} style={[s.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconWrap, { backgroundColor: theme.colors.accent + '18' }]}>
                <MaterialCommunityIcons name="target" size={18} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.sectionTitle, { color: textPrimary }]}>{t('strategicTasks')}</Text>
                <Text style={[s.sectionSub, { color: textMuted }]}>{t('strategicTasksDesc')}</Text>
              </View>
            </View>

            {!profile ? (
              <View style={s.emptyTasks}>
                <MaterialCommunityIcons name="alert-circle-outline" size={28} color={textMuted} />
                <Text style={[s.emptyTasksText, { color: textMuted }]}>{t('noActiveProfile')}</Text>
              </View>
            ) : (
              <>
                {/* Progress bar */}
                {strategicTotal > 0 && (
                  <View style={{ marginBottom: 14 }}>
                    <View style={[s.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                      <View style={[s.progressBarFill, { width: `${(strategicDone / strategicTotal) * 100}%`, backgroundColor: strategicDone === strategicTotal ? '#10b981' : theme.colors.accent }]} />
                    </View>
                    <Text style={[s.progressLabel, { color: textMuted }]}>
                      {t('tasksCompleted', { count: strategicDone, total: strategicTotal })}
                    </Text>
                  </View>
                )}

                {strategicDone === strategicTotal && strategicTotal > 0 && (
                  <View style={[s.allDoneBanner, { backgroundColor: '#10b981' + '18' }]}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                    <Text style={[s.allDoneText, { color: '#10b981' }]}>{t('allTasksDone')}</Text>
                  </View>
                )}

                {groupedTasks.map((group, gi) => (
                  <View key={gi} style={s.taskGroup}>
                    <Text style={[s.taskGroupTitle, { color: textSecondary }]} numberOfLines={1}>{group.title}</Text>
                    {group.tasks.map((task) => {
                      const done = !!taskCompletions[task.id];
                      return (
                        <Animated.View key={task.id} entering={FadeIn.duration(200)} layout={RNLayout.duration(200)} style={[s.taskRow, { borderColor: cardBorder }]}>
                          <Pressable onPress={() => handleToggleStrategic(task.id)} style={s.taskCheck}>
                            <View style={[s.checkbox, { borderColor: done ? '#10b981' : textMuted, backgroundColor: done ? '#10b981' : 'transparent' }]}>
                              {done && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                            </View>
                          </Pressable>
                          <Text style={[s.taskText, { color: done ? textMuted : textPrimary, textDecorationLine: done ? 'line-through' : 'none' }]} numberOfLines={3}>
                            {task.text}
                          </Text>
                        </Animated.View>
                      );
                    })}
                  </View>
                ))}
              </>
            )}
          </Animated.View>

          {/* ═══ Custom Tasks ═══ */}
          <Animated.View entering={FadeInDown.delay(300)} style={[s.section, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconWrap, { backgroundColor: '#10b981' + '18' }]}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.sectionTitle, { color: textPrimary }]}>{t('customTasks')}</Text>
                {customTasks.length > 0 && (
                  <Text style={[s.sectionSub, { color: textMuted }]}>
                    {t('tasksCompleted', { count: customDoneCount, total: customTasks.length })}
                  </Text>
                )}
              </View>
              {customDoneCount > 0 && (
                <Pressable onPress={clearCompletedCustom} style={s.clearBtn}>
                  <Text style={[s.clearBtnText, { color: theme.colors.accent }]}>{t('clearCompleted')}</Text>
                </Pressable>
              )}
            </View>

            {customTasks.length === 0 ? (
              <View style={s.emptyTasks}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={28} color={textMuted} />
                <Text style={[s.emptyTasksText, { color: textMuted }]}>{t('noTasks')}</Text>
              </View>
            ) : (
              customTasks.map((task) => (
                <Animated.View key={task.id} entering={FadeIn.duration(200)} layout={RNLayout.duration(200)} style={[s.taskRow, { borderColor: cardBorder }]}>
                  <Pressable onPress={() => toggleCustomTask(task.id)} style={s.taskCheck}>
                    <View style={[s.checkbox, { borderColor: task.done ? '#10b981' : textMuted, backgroundColor: task.done ? '#10b981' : 'transparent' }]}>
                      {task.done && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                    </View>
                  </Pressable>
                  <Text style={[s.taskText, { color: task.done ? textMuted : textPrimary, textDecorationLine: task.done ? 'line-through' : 'none' }]} numberOfLines={2}>
                    {task.text}
                  </Text>
                  <Pressable onPress={() => deleteCustomTask(task.id)} hitSlop={8} style={s.taskDelete}>
                    <MaterialCommunityIcons name="close" size={16} color={textMuted} />
                  </Pressable>
                </Animated.View>
              ))
            )}

            <View style={[s.addTaskRow, { borderColor: cardBorder, backgroundColor: inputBg }]}>
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.colors.accent} />
              <TextInput
                style={[s.addTaskInput, { color: textPrimary }]}
                placeholder={t('addTask')}
                placeholderTextColor={textMuted}
                value={newTask}
                onChangeText={setNewTask}
                onSubmitEditing={addCustomTask}
                returnKeyType="done"
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PaywallModal visible={paywallVisible} onClose={() => { setPaywallVisible(false); if (!isPremium) router.back(); }} />
      <ShareCard
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        data={shareData}
        shareLabel={t('shareProgress')}
        closeLabel={t('close')}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },

  timerCard: { width: '100%', borderRadius: 28, borderWidth: 1, padding: 28, alignItems: 'center', marginBottom: 20 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  modeText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  ringWrap: { marginBottom: 24, position: 'relative' },
  ringBg: { width: 160, height: 160, borderRadius: 80, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  progressArc: { position: 'absolute', top: 0, left: 0, width: 160, height: 160, borderRadius: 80, borderWidth: 4, borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  timerText: { fontSize: 42, fontWeight: '900', fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  mainBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  resetBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '600' },

  modeSwitcher: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  modeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  modeChipText: { fontSize: 14, fontWeight: '700' },

  // Sections
  section: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  sectionIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  sectionSub: { fontSize: 13, lineHeight: 18 },
  clearBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  clearBtnText: { fontSize: 13, fontWeight: '600' },

  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 12, fontWeight: '500' },

  allDoneBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 12 },
  allDoneText: { fontSize: 14, fontWeight: '700' },

  taskGroup: { marginBottom: 8 },
  taskGroupTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6, paddingLeft: 2 },

  emptyTasks: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyTasksText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 12 },
  taskCheck: { padding: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  taskText: { flex: 1, fontSize: 15, lineHeight: 21 },
  taskDelete: { padding: 4 },

  addTaskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginTop: 12 },
  addTaskInput: { flex: 1, fontSize: 15, fontWeight: '500', padding: 0 },
});
