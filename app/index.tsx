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
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../src/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = 'onboarding_complete_v2';

interface Slide {
    id: string;
    icon: string;
    iconColor: string;
    bgColor: string;
    title: string;
    subtitle: string;
    tips: { icon: string; text: string }[];
}

const SLIDES: Slide[] = [
    {
        id: 'welcome',
        icon: 'checkbox-marked-circle-outline',
        iconColor: '#60a5fa',
        bgColor: 'rgba(29,78,216,0.15)',
        title: 'Welcome to\nDevChecklist',
        subtitle: 'Your smart dev companion for every project phase.',
        tips: [
            { icon: 'folder-outline', text: 'Organize projects with folders' },
            { icon: 'layers-outline', text: 'Add multiple phases per project' },
            { icon: 'github', text: 'Link your GitHub repo' },
        ],
    },
    {
        id: 'projects',
        icon: 'folder-star-outline',
        iconColor: '#34d399',
        bgColor: 'rgba(16,185,129,0.15)',
        title: 'Create Projects',
        subtitle: 'Start with + then pick type, phase & tech stack.',
        tips: [
            { icon: 'code-tags', text: 'Choose from 30+ project types' },
            { icon: 'rocket-launch-outline', text: 'Planning → Coding → Testing → Deploy → Scale' },
            { icon: 'layers-plus', text: 'Add new phases anytime from the project card' },
        ],
    },
    {
        id: 'swipe',
        icon: 'gesture-swipe-horizontal',
        iconColor: '#60a5fa',
        bgColor: 'rgba(59,130,246,0.15)',
        title: 'Swipe to Action',
        subtitle: 'Quickly complete or delete items with a swipe.',
        tips: [
            { icon: 'arrow-right-bold', text: 'Swipe RIGHT → Mark as Done (or Undo)' },
            { icon: 'arrow-left-bold', text: 'Swipe LEFT → Delete item' },
            { icon: 'note-text-outline', text: 'Tap item → add notes or copy AI prompt' },
        ],
    },
    {
        id: 'tips',
        icon: 'lightbulb-on-outline',
        iconColor: '#fbbf24',
        bgColor: 'rgba(245,158,11,0.15)',
        title: 'Pro Tips',
        subtitle: 'Get the most out of every checklist.',
        tips: [
            { icon: 'plus-circle-outline', text: 'Add custom tasks to any checklist' },
            { icon: 'pencil-outline', text: 'Edit project name & GitHub from home screen' },
            { icon: 'brain', text: 'Use AI prompts for guided implementation' },
        ],
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        checkOnboarding();
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

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            handleGetStarted();
        }
    };

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const isLast = currentIndex === SLIDES.length - 1;

    const renderSlide = ({ item }: { item: Slide }) => (
        <View style={slide.container}>
            {/* Glow blob */}
            <View style={[slide.glow, { backgroundColor: item.bgColor }]} />

            {/* Icon */}
            <Animated.View entering={FadeInUp.delay(100).springify()} style={[slide.iconWrapper, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon as any} size={52} color={item.iconColor} />
            </Animated.View>

            {/* Title & subtitle */}
            <Animated.View entering={FadeInDown.delay(150)} style={slide.titleBlock}>
                <Text style={slide.title}>{item.title}</Text>
                <Text style={slide.subtitle}>{item.subtitle}</Text>
            </Animated.View>

            {/* Tips */}
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
            {/* Slides */}
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

            {/* Dot indicators */}
            <View style={s.dots}>
                {SLIDES.map((_, i) => (
                    <Pressable
                        key={i}
                        onPress={() => flatListRef.current?.scrollToIndex({ index: i, animated: true })}
                        style={[s.dot, i === currentIndex && s.dotActive]}
                    />
                ))}
            </View>

            {/* CTA button */}
            <View style={s.footer}>
                <Pressable onPress={handleNext} style={[s.ctaBtn, isLast && s.ctaBtnLast]}>
                    <Text style={s.ctaBtnText}>
                        {isLast ? "Let's Go!" : 'Next'}
                    </Text>
                    {!isLast && (
                        <MaterialCommunityIcons name="arrow-right" size={20} color="white" style={{ marginLeft: 8 }} />
                    )}
                </Pressable>

                {!isLast && (
                    <Pressable onPress={handleGetStarted} style={s.skipBtn}>
                        <Text style={s.skipBtnText}>Skip</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#07050f' },
    flatList: { flex: 1 },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dotActive: {
        width: 24,
        backgroundColor: '#1d4ed8',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 12,
    },
    ctaBtn: {
        height: 56,
        backgroundColor: '#1d4ed8',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaBtnLast: {
        backgroundColor: '#059669',
    },
    ctaBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        letterSpacing: 0.3,
    },
    skipBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    skipBtnText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '500',
    },
});

const slide = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingTop: 20,
    },
    glow: {
        position: 'absolute',
        top: -60,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.4,
    },
    iconWrapper: {
        width: 108,
        height: 108,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    titleBlock: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '85%',
    },
    tipsList: {
        width: '100%',
        gap: 12,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        gap: 14,
    },
    tipIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    tipText: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
        lineHeight: 20,
    },
});
