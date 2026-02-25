import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../hooks/useTranslation';

interface PremiumGateProps {
  children: React.ReactNode;
  locked: boolean;
  onUpgrade: () => void;
}

export function PremiumGate({ children, locked, onUpgrade }: PremiumGateProps) {
  const { colorMode } = useThemeStore();
  const { t } = useTranslation();
  const isDark = colorMode === 'dark';

  if (!locked) return <>{children}</>;

  return (
    <View style={s.wrapper}>
      <View style={s.contentContainer} pointerEvents="none">
        {children}
      </View>
      <BlurView intensity={isDark ? 25 : 35} tint={isDark ? 'dark' : 'light'} style={s.overlay}>
        <Pressable style={s.cta} onPress={onUpgrade}>
          <View style={[s.iconWrap, { backgroundColor: isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.12)' }]}>
            <MaterialCommunityIcons name="lock-outline" size={22} color="#f59e0b" />
          </View>
          <Text style={[s.ctaText, { color: isDark ? '#e2e8f0' : '#0f172a' }]}>
            {t('unlockPremium')}
          </Text>
          <MaterialCommunityIcons name="crown" size={16} color="#f59e0b" style={{ marginLeft: 6 }} />
        </Pressable>
      </BlurView>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { position: 'relative', overflow: 'hidden', borderRadius: 16 },
  contentContainer: { opacity: 0.4 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  ctaText: { fontSize: 15, fontWeight: '700' },
});
