import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeStore } from '../store/themeStore';
import { usePurchaseStore } from '../store/purchaseStore';
import { useFounderOSStore } from '../store/founderOSStore';

interface FloatingNavbarProps {
  onShowPaywall: () => void;
}

export function FloatingNavbar({ onShowPaywall }: FloatingNavbarProps) {
  const { colorMode } = useThemeStore();
  const { isPremium } = usePurchaseStore();
  const profileCount = useFounderOSStore((s) => s.profiles.length);
  const isDark = colorMode === 'dark';

  const iconColor = isDark ? '#cbd5e1' : '#475569';

  return (
    <View style={s.wrapper}>
      <BlurView
        intensity={isDark ? 22 : 26}
        tint={isDark ? 'dark' : 'light'}
        style={s.bar}
      >
        <View style={[s.inner, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.18)',
          borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.4)',
          borderWidth: 1,
        }]}>
          {/* Settings */}
          <Pressable
            onPress={() => router.push('/settings')}
            style={s.sideBtn}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color={iconColor} />
          </Pressable>

          {/* Focus — center, large, accent + neon */}
          <Pressable
            onPress={() => router.push('/focus')}
            style={s.centerBtn}
          >
            <View style={s.centerBtnInner}>
              <MaterialCommunityIcons name="fire" size={28} color="#fff" />
            </View>
          </Pressable>

          {/* Add product */}
          <Pressable
            onPress={() => {
              if (profileCount >= 1 && !isPremium) { onShowPaywall(); return; }
              router.push('/configure');
            }}
            style={s.sideBtn}
          >
            <MaterialCommunityIcons name="plus" size={24} color={iconColor} />
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  bar: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 14,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderRadius: 28,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtn: {
    marginHorizontal: 8,
  },
  centerBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.95)',
    shadowColor: '#fb923c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 18,
    elevation: 14,
  },
});
