import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Dimensions,
    FlatList,
    ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../src/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocaleStore } from '../src/store/localeStore';
import { useTranslation } from '../src/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = 'onboarding_complete_v4';

interface Slide {
    id: string;
    icon: string;
    iconColor: string;
    bgColor: string;
    title: string;
    subtitle: string;
    tips: { icon: string; text: string }[];
}

function getSlides(t: (key: string) => string): Slide[] {
    return [
        {
            id: 'welcome',
            icon: 'shield-half-full',
            iconColor: '#60a5fa',
            bgColor: 'rgba(29,78,216,0.15)',
            title: t('onboardingWelcomeTitle'),
            subtitle: t('onboardingWelcomeSubtitle'),
            tips: [
                { icon: 'rocket-launch-outline', text: t('onboardingWelcomeTip1') },
                { icon: 'chart-line', text: t('onboardingWelcomeTip2') },
                { icon: 'shield-check-outline', text: t('onboardingWelcomeTip3') },
            ],
        },
        {
            id: 'configure',
            icon: 'dna',
            iconColor: '#34d399',
            bgColor: 'rgba(16,185,129,0.15)',
            title: t('onboardingConfigTitle'),
            subtitle: t('onboardingConfigSubtitle'),
            tips: [
                { icon: 'tune-vertical', text: t('onboardingConfigTip1') },
                { icon: 'account-cog-outline', text: t('onboardingConfigTip2') },
                { icon: 'target', text: t('onboardingConfigTip3') },
            ],
        },
        {
            id: 'engine',
            icon: 'cog-outline',
            iconColor: '#f59e0b',
            bgColor: 'rgba(245,158,11,0.15)',
            title: t('onboardingEngineTitle'),
            subtitle: t('onboardingEngineSubtitle'),
            tips: [
                { icon: 'alert-decagram-outline', text: t('onboardingEngineTip1') },
                { icon: 'speedometer', text: t('onboardingEngineTip2') },
                { icon: 'format-list-numbered', text: t('onboardingEngineTip3') },
            ],
        },
        {
            id: 'cockpit',
            icon: 'view-dashboard-outline',
            iconColor: '#a78bfa',
            bgColor: 'rgba(139,92,246,0.15)',
            title: t('onboardingCockpitTitle'),
            subtitle: t('onboardingCockpitSubtitle'),
            tips: [
                { icon: 'bullhorn-outline', text: t('onboardingCockpitTip1') },
                { icon: 'currency-usd', text: t('onboardingCockpitTip2') },
                { icon: 'chart-areaspline', text: t('onboardingCockpitTip3') },
            ],
        },
    ];
}

export default function OnboardingScreen() {
    const { t } = useTranslation();
    const locale = useLocaleStore((s) => s.locale);
    const setLocale = useLocaleStore((s) => s.setLocale);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;
    const SLIDES = getSlides(t);

    useEffect(() => {
        if (locale !== null) {
            const checkOnboarding = async () => {
                const complete = await AsyncStorage.getItem(ONBOARDING_KEY);
                if (complete === 'true') router.replace('/strategy-dashboard');
            };
            checkOnboarding();
        }
    }, [locale]);

    const handleGetStarted = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        router.replace('/strategy-dashboard');
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            handleGetStarted();
        }
    };

    const isLast = currentIndex === SLIDES.length - 1;

    if (locale === null) {
        return (
            <SafeAreaView style={[s.screen, langS.langScreen]} edges={['top', 'bottom'] as any}>
                <View style={langS.langGlow} />
                <Animated.View entering={FadeInDown.duration(500).springify()} style={langS.langCard}>
                    <View style={langS.langIconWrap}>
                        <MaterialCommunityIcons name="translate" size={48} color={theme.colors.accent} />
                    </View>
                    <Text style={langS.langLabel}>FOUNDER OS</Text>
                    <Text style={langS.langTitle}>{t('chooseLanguage')}</Text>
                    <Text style={langS.langSubtitle}>{t('languageSubtitle')}</Text>
                    <View style={langS.langButtons}>
                        <Pressable
                            onPress={() => setLocale('tr')}
                            style={({ pressed }) => [
                                langS.langBtn,
                                langS.langBtnPrimary,
                                { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                            ]}
                        >
                            <View style={langS.langBtnInner}>
                                <Text style={langS.langBtnEmoji}>🇹🇷</Text>
                                <Text style={langS.langBtnText}>Türkçe</Text>
                            </View>
                        </Pressable>
                        <Pressable
                            onPress={() => setLocale('en')}
                            style={({ pressed }) => [
                                langS.langBtn,
                                langS.langBtnSecondary,
                                { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                            ]}
                        >
                            <View style={langS.langBtnInner}>
                                <Text style={langS.langBtnEmoji}>🇬🇧</Text>
                                <Text style={[langS.langBtnText, langS.langBtnTextSecondary]}>English</Text>
                            </View>
                        </Pressable>
                    </View>
                </Animated.View>
            </SafeAreaView>
        );
    }

    const renderSlide = ({ item }: { item: Slide }) => (
        <View style={slide.container}>
            <View style={[slide.glow, { backgroundColor: item.bgColor }]} />
            <Animated.View entering={FadeInUp.delay(100).springify()} style={[slide.iconWrapper, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon as any} size={52} color={item.iconColor} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(150)} style={slide.titleBlock}>
                <Text style={slide.title}>{item.title}</Text>
                <Text style={slide.subtitle}>{item.subtitle}</Text>
            </Animated.View>
            <View style={slide.tipsList}>
                {item.tips.map((tip, i) => (
                    <Animated.View key={i} entering={FadeIn.delay(200 + i * 80)} style={slide.tipRow}>
                        <View style={[slide.tipIcon, { backgroundColor: item.bgColor }]}>
                            <MaterialCommunityIcons name={tip.icon as any} size={18} color={item.iconColor} />
                        </View>
                        <Text style={slide.tipText}>{tip.text}</Text>
                    </Animated.View>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={s.screen} edges={['top', 'bottom'] as any}>
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
                style={s.flatList}
            />
            <View style={s.dots}>
                {SLIDES.map((_, i) => (
                    <Pressable
                        key={i}
                        onPress={() => flatListRef.current?.scrollToIndex({ index: i, animated: true })}
                        style={[s.dot, i === currentIndex && s.dotActive]}
                    />
                ))}
            </View>
            <View style={s.footer}>
                <Pressable onPress={handleNext} style={[s.ctaBtn, isLast && s.ctaBtnLast]}>
                    <Text style={s.ctaBtnText}>
                        {isLast ? t('letsGo') : t('next')}
                    </Text>
                    {!isLast && (
                        <MaterialCommunityIcons name="arrow-right" size={20} color="white" style={{ marginLeft: 8 }} />
                    )}
                </Pressable>
                {!isLast && (
                    <Pressable onPress={handleGetStarted} style={s.skipBtn}>
                        <Text style={s.skipBtnText}>{t('skip')}</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const langS = StyleSheet.create({
    langScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
    langGlow: {
        position: 'absolute', top: -100, width: 320, height: 320, borderRadius: 160,
        backgroundColor: 'rgba(29,78,216,0.2)', opacity: 0.7,
    },
    langCard: {
        width: '100%', maxWidth: 380,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 32,
        paddingVertical: 40, paddingHorizontal: 32,
        alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#0f172a', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 32,
        elevation: 12, overflow: 'hidden',
    },
    langIconWrap: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: 'rgba(29,78,216,0.2)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    langLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, marginBottom: 8 },
    langTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 10 },
    langSubtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 23, marginBottom: 32, paddingHorizontal: 4 },
    langButtons: { width: '100%', gap: 16 },
    langBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 20, paddingHorizontal: 24,
        borderRadius: 20, borderWidth: 1,
        overflow: 'hidden',
    },
    langBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    langBtnPrimary: {
        backgroundColor: theme.colors.accent,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    langBtnSecondary: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(255,255,255,0.14)',
    },
    langBtnEmoji: { fontSize: 26 },
    langBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
    langBtnTextSecondary: { color: '#e2e8f0' },
});

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#07050f' },
    flatList: { flex: 1 },
    dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 20 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
    dotActive: { width: 24, backgroundColor: '#1d4ed8' },
    footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 12 },
    ctaBtn: { height: 56, backgroundColor: '#1d4ed8', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    ctaBtnLast: { backgroundColor: '#059669' },
    ctaBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 0.3 },
    skipBtn: { alignItems: 'center', paddingVertical: 8 },
    skipBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
});

const slide = StyleSheet.create({
    container: { width: SCREEN_WIDTH, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: 20 },
    glow: { position: 'absolute', top: -60, width: 300, height: 300, borderRadius: 150, opacity: 0.4 },
    iconWrapper: { width: 108, height: 108, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    titleBlock: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 40, marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center', lineHeight: 24, maxWidth: '85%' },
    tipsList: { width: '100%', gap: 12 },
    tipRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 14 },
    tipIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    tipText: { color: '#e2e8f0', fontSize: 14, fontWeight: '500', flex: 1, lineHeight: 20 },
});
