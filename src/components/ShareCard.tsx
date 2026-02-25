import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';

export interface ShareCardData {
  type: 'session' | 'tasks' | 'allDone';
  sessions?: number;
  focusMinutes?: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  projectName?: string;
}

interface ShareCardProps {
  visible: boolean;
  onClose: () => void;
  data: ShareCardData;
  shareLabel: string;
  closeLabel: string;
}

export function ShareCard({ visible, onClose, data, shareLabel, closeLabel }: ShareCardProps) {
  const shotRef = useRef<ViewShot>(null);

  const handleShare = useCallback(async () => {
    try {
      if (!shotRef.current?.capture) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const uri = await shotRef.current.capture();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
      }
    } catch {}
  }, []);

  const isSession = data.type === 'session';
  const isAllDone = data.type === 'allDone';
  const accent = isAllDone ? '#10b981' : theme.colors.accent;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={st.overlay}>
        <View style={st.container}>
          {/* Capturable card */}
          <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
            <View style={[st.card, { backgroundColor: '#0a0a1a' }]}>
              {/* Top accent bar */}
              <View style={[st.accentBar, { backgroundColor: accent }]} />

              <View style={st.cardInner}>
                {/* Logo */}
                <View style={st.logoRow}>
                  <MaterialCommunityIcons name="shield-half-full" size={22} color={accent} />
                  <Text style={st.logoText}>FOUNDER OS</Text>
                </View>

                {/* Main icon */}
                <View style={[st.iconCircle, { backgroundColor: accent + '22' }]}>
                  <MaterialCommunityIcons
                    name={isSession ? 'fire' : isAllDone ? 'trophy' : 'check-circle'}
                    size={48}
                    color={accent}
                  />
                </View>

                {/* Headline */}
                <Text style={st.headline}>
                  {isSession
                    ? `${data.sessions} ${data.sessions === 1 ? 'Session' : 'Sessions'}`
                    : isAllDone
                      ? 'All Tasks Done!'
                      : `${data.tasksCompleted}/${data.tasksTotal} Tasks`}
                </Text>

                {/* Subtitle */}
                <Text style={st.subtitle}>
                  {isSession
                    ? `${data.focusMinutes} minutes of deep focus`
                    : isAllDone
                      ? 'Strategic action plan completed'
                      : 'Making progress on the action plan'}
                </Text>

                {/* Project badge */}
                {data.projectName && (
                  <View style={[st.projectBadge, { backgroundColor: accent + '18' }]}>
                    <Text style={[st.projectBadgeText, { color: accent }]}>{data.projectName}</Text>
                  </View>
                )}

                {/* Stats row (session card) */}
                {isSession && (
                  <View style={st.statsRow}>
                    <View style={st.statBox}>
                      <Text style={st.statNum}>{data.sessions}</Text>
                      <Text style={st.statDesc}>SESSIONS</Text>
                    </View>
                    <View style={[st.statDivider, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
                    <View style={st.statBox}>
                      <Text style={st.statNum}>{data.focusMinutes}m</Text>
                      <Text style={st.statDesc}>FOCUS TIME</Text>
                    </View>
                  </View>
                )}

                {/* Task progress (task card) */}
                {!isSession && data.tasksTotal && data.tasksTotal > 0 && (
                  <View style={st.progressWrap}>
                    <View style={st.progressBg}>
                      <View style={[st.progressFill, {
                        width: `${((data.tasksCompleted ?? 0) / data.tasksTotal) * 100}%`,
                        backgroundColor: accent,
                      }]} />
                    </View>
                    <Text style={st.progressPct}>
                      {Math.round(((data.tasksCompleted ?? 0) / data.tasksTotal) * 100)}%
                    </Text>
                  </View>
                )}

                {/* Footer */}
                <Text style={st.footer}>Built with Founder OS</Text>
              </View>
            </View>
          </ViewShot>

          {/* Action buttons */}
          <Pressable onPress={handleShare} style={[st.shareBtn, { backgroundColor: accent }]}>
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#fff" />
            <Text style={st.shareBtnText}>{shareLabel}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={st.closeBtn}>
            <Text style={st.closeBtnText}>{closeLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 28,
  },
  container: { width: '100%', maxWidth: 340, alignItems: 'center' },

  card: { width: '100%', borderRadius: 24, overflow: 'hidden' },
  accentBar: { height: 4, width: '100%' },
  cardInner: { padding: 28, alignItems: 'center' },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  logoText: { fontSize: 12, fontWeight: '800', letterSpacing: 2, color: '#64748b' },

  iconCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },

  headline: { fontSize: 28, fontWeight: '900', color: '#e2e8f0', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22, marginBottom: 16 },

  projectBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 20 },
  projectBadgeText: { fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 20, width: '100%' },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900', color: '#e2e8f0', marginBottom: 2 },
  statDesc: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: '#64748b' },
  statDivider: { width: 1, height: 36 },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 20 },
  progressBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  progressPct: { fontSize: 16, fontWeight: '800', color: '#e2e8f0' },

  footer: { fontSize: 11, fontWeight: '600', letterSpacing: 1, color: '#475569' },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', paddingVertical: 16, borderRadius: 16, marginTop: 16,
  },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  closeBtn: { paddingVertical: 12, marginTop: 4 },
  closeBtnText: { fontSize: 15, fontWeight: '600', color: '#94a3b8' },
});
