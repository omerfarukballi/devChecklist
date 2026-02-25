import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { usePurchaseStore } from '../store/purchaseStore';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../hooks/useTranslation';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { purchasePremium, restorePurchases, isLoading } = usePurchaseStore();
  const { colorMode } = useThemeStore();
  const { t } = useTranslation();
  const isDark = colorMode === 'dark';

  const bg = isDark ? '#07050f' : '#f8fafc';
  const textColor = isDark ? '#ffffff' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

  const features = [
    { icon: 'infinity' as const, label: t('paywallFeature1'), desc: t('paywallFeature1Desc') },
    { icon: 'chart-box-outline' as const, label: t('paywallFeature2'), desc: t('paywallFeature2Desc') },
    { icon: 'pencil-outline' as const, label: t('paywallFeature3'), desc: t('paywallFeature3Desc') },
    { icon: 'timer-outline' as const, label: t('paywallFeature4'), desc: t('paywallFeature4Desc') },
    { icon: 'trophy-outline' as const, label: t('paywallFeature5'), desc: t('paywallFeature5Desc') },
  ];

  const handlePurchase = async () => {
    const success = await purchasePremium();
    if (success) onClose();
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={isDark ? 40 : 60} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'}>
        <SafeAreaView style={s.container}>
          <Animated.View entering={FadeInDown.duration(400)} style={[s.card, { backgroundColor: bg, borderColor: cardBorder }]}>
            <View style={s.header}>
              <Pressable onPress={onClose} style={s.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={textMuted} />
              </Pressable>
              <View style={s.iconContainer}>
                <MaterialCommunityIcons name="crown" size={48} color="#f59e0b" />
              </View>
              <Text style={[s.title, { color: textColor }]}>{t('getPremium')}</Text>
              <Text style={[s.subtitle, { color: textMuted }]}>{t('paywallSubtitle')}</Text>
            </View>

            <ScrollView style={s.featureList} showsVerticalScrollIndicator={false}>
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(200 + index * 100)}
                  style={[s.featureItem, { backgroundColor: cardBg, borderColor: cardBorder }]}
                >
                  <View style={s.featureIcon}>
                    <MaterialCommunityIcons name={feature.icon} size={24} color="#1d4ed8" />
                  </View>
                  <View style={s.featureText}>
                    <Text style={[s.featureLabel, { color: textColor }]}>{feature.label}</Text>
                    <Text style={[s.featureDesc, { color: textMuted }]}>{feature.desc}</Text>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>

            <View style={s.footer}>
              <Pressable
                onPress={handlePurchase}
                style={[s.purchaseBtn, isLoading && { opacity: 0.7 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={s.purchaseBtnText}>{t('unlockLifetime')}</Text>
                )}
              </Pressable>
              <Pressable onPress={handleRestore} style={s.restoreBtn} disabled={isLoading}>
                <Text style={s.restoreBtnText}>{t('restorePurchases')}</Text>
              </Pressable>
              <Text style={s.disclaimer}>{t('paywallDisclaimer')}</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    position: 'absolute',
    right: -8,
    top: -8,
    padding: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245,158,11,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  featureList: {
    marginBottom: 24,
    maxHeight: 320,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(29,78,216,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    gap: 12,
  },
  purchaseBtn: {
    backgroundColor: '#1d4ed8',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreBtn: {
    alignItems: 'center',
  },
  restoreBtnText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
