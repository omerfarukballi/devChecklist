import React, { useEffect } from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../src/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_complete_v1';

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
        <SafeAreaView className="flex-1 bg-[#07050f] items-center justify-center p-6 relative">
            {/* Background Decor */}
            <View className="absolute top-20 right-[-50] w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
            <View className="absolute bottom-20 left-[-50] w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl" />

            {/* Icon Cluster */}
            <Animated.View entering={FadeInUp.delay(200).springify()} className="items-center mb-12">
                <View className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl items-center justify-center mb-6 shadow-2xl shadow-violet-500/20">
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={theme.colors.accent} />
                </View>
                <Text className="text-4xl font-extrabold text-white text-center mb-2">DevChecklist</Text>
                <Text className="text-gray-400 text-center text-lg max-w-[80%]">Master every phase of development.</Text>
            </Animated.View>

            {/* Feature List */}
            <View className="w-full gap-6 mb-12">
                {[
                    { icon: 'format-list-checks', title: 'Smart Checklists', desc: 'Tailored to your stack & phase.' },
                    { icon: 'brain', title: 'AI Ready', desc: 'Copy-paste prompts for LLMs.' },
                    { icon: 'shield-check', title: 'Comprehensive', desc: 'Secure, scalable, and production-ready.' }
                ].map((item, index) => (
                    <Animated.View
                        key={index}
                        entering={FadeInDown.delay(500 + index * 100)}
                        className="flex-row items-center bg-white/5 p-4 rounded-xl border border-white/5"
                    >
                        <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4">
                            <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
                        </View>
                        <View>
                            <Text className="text-white font-bold text-base">{item.title}</Text>
                            <Text className="text-gray-500 text-sm">{item.desc}</Text>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* CTA Button */}
            <Animated.View entering={FadeInDown.delay(900)} className="w-full">
                <Pressable
                    onPress={handleGetStarted}
                    className="w-full bg-violet-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-violet-600/40 active:scale-95 transition-transform"
                >
                    <Text className="text-white font-bold text-lg tracking-wide">Get Started</Text>
                </Pressable>
                <Text className="text-gray-600 text-center mt-4 text-xs uppercase tracking-widest">100% Offline • No API Calls</Text>
            </Animated.View>
        </SafeAreaView>
    );
}
