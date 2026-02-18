import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePurchaseStore } from '../store/purchaseStore';
import { useThemeStore } from '../store/themeStore';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
    const { purchasePremium, restorePurchases, isLoading } = usePurchaseStore();
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const bg = isDark ? '#07050f' : '#f8fafc';
    const textColor = isDark ? '#ffffff' : '#0f172a';
    const textMuted = isDark ? '#94a3b8' : '#64748b';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

    const features = [
        { icon: 'infinity', label: 'Unlimited Projects', desc: 'Create as many projects as you need' },
        { icon: 'lightning-bolt', label: 'All Tech Stacks', desc: 'Access Next.js, Expo, Prisma, and more' },
        { icon: 'brain', label: 'AI Powered Steps', desc: 'Generate precise implementation guides' },
        { icon: 'cloud-sync', label: 'Cloud Backup', desc: 'Sync your progress across devices' },
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
                <SafeAreaView style={styles.container}>
                    <Animated.View entering={FadeInDown.duration(400)} style={[styles.card, { backgroundColor: bg, borderColor: cardBorder }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Pressable onPress={onClose} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={24} color={textMuted} />
                            </Pressable>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name="crown" size={48} color="#f59e0b" />
                            </View>
                            <Text style={[styles.title, { color: textColor }]}>Get Premium</Text>
                            <Text style={[styles.subtitle, { color: textMuted }]}>Unlock lifetime access to all features</Text>
                        </View>

                        {/* Features */}
                        <ScrollView style={styles.featureList} showsVerticalScrollIndicator={false}>
                            {features.map((feature, index) => (
                                <Animated.View
                                    key={index}
                                    entering={FadeInDown.delay(200 + index * 100)}
                                    style={[styles.featureItem, { backgroundColor: cardBg, borderColor: cardBorder }]}
                                >
                                    <View style={styles.featureIcon}>
                                        <MaterialCommunityIcons name={feature.icon as any} size={24} color="#1d4ed8" />
                                    </View>
                                    <View style={styles.featureText}>
                                        <Text style={[styles.featureLabel, { color: textColor }]}>{feature.label}</Text>
                                        <Text style={[styles.featureDesc, { color: textMuted }]}>{feature.desc}</Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Pressable
                                onPress={handlePurchase}
                                style={[styles.purchaseBtn, isLoading && { opacity: 0.7 }]}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.purchaseBtnText}>Unlock Lifetime - $9.99</Text>
                                )}
                            </Pressable>
                            <Pressable onPress={handleRestore} style={styles.restoreBtn} disabled={isLoading}>
                                <Text style={styles.restoreBtnText}>Restore Purchases</Text>
                            </Pressable>
                            <Text style={styles.disclaimer}>One-time payment. No subscription required.</Text>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </BlurView>
        </Modal>
    );
}

import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
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
