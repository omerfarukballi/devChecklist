import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../src/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_complete_v1';

const FEATURES = [
    { icon: 'format-list-checks', title: 'Smart Checklists', desc: 'Tailored to your stack & phase.' },
    { icon: 'brain', title: 'AI Ready', desc: 'Copy-paste prompts for LLMs.' },
    { icon: 'shield-check', title: 'Comprehensive', desc: 'Secure, scalable, and production-ready.' }
];

export default function OnboardingScreen() {
    const starOpacity = useSharedValue(0.3);

    useEffect(() => {
        checkOnboarding();
        starOpacity.value = withRepeat(
            withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const checkOnboarding = async () => {
        const complete = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (complete === 'true') {
            router.replace('/(tabs)/home');
        }
    };

    const handleGetStarted = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        router.replace('/(tabs)/home');
    };

    return (
        <SafeAreaView style={s.screen}>
            {/* Background Decor */}
            <View style={s.decorTopRight} />
            <View style={s.decorBottomLeft} />

            {/* Icon Cluster */}
            <Animated.View entering={FadeInUp.delay(200).springify()} style={s.iconCluster}>
                <View style={s.appIconWrapper}>
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={theme.colors.accent} />
                </View>
                <Text style={s.appTitle}>DevChecklist</Text>
                <Text style={s.appSubtitle}>Master every phase of development.</Text>
            </Animated.View>

            {/* Feature List */}
            <View style={s.featureList}>
                {FEATURES.map((item, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(500 + index * 100)}
                        style={s.featureRow}
                    >
                        <View style={s.featureIcon}>
                            <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
                        </View>
                        <View>
                            <Text style={s.featureTitle}>{item.title}</Text>
                            <Text style={s.featureDesc}>{item.desc}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* CTA Button */}
            <Animated.View entering={FadeInDown.delay(900)} style={s.ctaWrapper}>
                <Pressable onPress={handleGetStarted} style={s.ctaBtn}>
                    <Text style={s.ctaBtnText}>Get Started</Text>
                </Pressable>
                <Text style={s.offlineNote}>100% Offline • No API Calls</Text>
            </Animated.View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#07050f',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    decorTopRight: {
        position: 'absolute',
        top: 80,
        right: -50,
        width: 256,
        height: 256,
        backgroundColor: 'rgba(124,58,237,0.2)',
        borderRadius: 128,
    },
    decorBottomLeft: {
        position: 'absolute',
        bottom: 80,
        left: -50,
        width: 256,
        height: 256,
        backgroundColor: 'rgba(8,145,178,0.2)',
        borderRadius: 128,
    },
    iconCluster: {
        alignItems: 'center',
        marginBottom: 48,
    },
    appIconWrapper: {
        width: 96,
        height: 96,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    appTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8,
    },
    appSubtitle: {
        color: '#9ca3af',
        textAlign: 'center',
        fontSize: 18,
        maxWidth: '80%',
    },
    featureList: {
        width: '100%',
        gap: 24,
        marginBottom: 48,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    featureTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    featureDesc: {
        color: '#6b7280',
        fontSize: 14,
    },
    ctaWrapper: {
        width: '100%',
    },
    ctaBtn: {
        width: '100%',
        backgroundColor: '#7c3aed',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    offlineNote: {
        color: '#4b5563',
        textAlign: 'center',
        marginTop: 16,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
});
