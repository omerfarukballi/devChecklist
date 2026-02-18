import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '../src/store/themeStore';

interface PlaybookItem {
    id: string;
    title: string;
    description: string;
    tip?: string;
    link?: string;
    done: boolean;
}

interface PlaybookSection {
    id: string;
    title: string;
    icon: string;
    color: string;
    items: PlaybookItem[];
}

const INITIAL_PLAYBOOK: PlaybookSection[] = [
    {
        id: 'first-100',
        title: 'First 100 Users',
        icon: 'account-group-outline',
        color: '#6366f1',
        items: [
            {
                id: 'ph-launch',
                title: 'Launch on Product Hunt',
                description: 'Schedule your launch for Tuesday–Thursday. Prepare a compelling tagline, GIF demo, and first comment.',
                tip: 'Ask friends to upvote in the first hour — it determines your ranking.',
                link: 'https://producthunt.com',
                done: false,
            },
            {
                id: 'hn-show',
                title: 'Post "Show HN" on Hacker News',
                description: 'Share what you built and why. Be honest, technical, and ready to answer questions.',
                tip: 'Post between 9–11am EST on weekdays for maximum visibility.',
                link: 'https://news.ycombinator.com/submit',
                done: false,
            },
            {
                id: 'reddit-post',
                title: 'Find relevant subreddits',
                description: 'Post in r/SideProject, r/IndieHackers, and niche subreddits related to your product.',
                tip: 'Read subreddit rules first. Provide value, not just self-promotion.',
                done: false,
            },
            {
                id: 'indie-hackers',
                title: 'Share on Indie Hackers',
                description: 'Write a milestone post about your launch. The community loves transparency and numbers.',
                link: 'https://indiehackers.com',
                done: false,
            },
            {
                id: 'twitter-launch',
                title: 'Twitter/X launch thread',
                description: 'Write a 5-tweet thread: problem, solution, how it works, who it\'s for, call to action.',
                tip: 'Pin the tweet and reply to everyone who engages.',
                done: false,
            },
            {
                id: 'personal-network',
                title: 'Tell your personal network',
                description: 'Email or message 20 people who might benefit from your product. Personal outreach converts best.',
                done: false,
            },
        ],
    },
    {
        id: 'analytics',
        title: 'Analytics Setup',
        icon: 'chart-line',
        color: '#10b981',
        items: [
            {
                id: 'define-metrics',
                title: 'Define your North Star metric',
                description: 'Choose ONE metric that best represents value delivered to users (e.g., DAU, revenue, activations).',
                tip: 'Don\'t track everything. Focus on 3-5 key metrics.',
                done: false,
            },
            {
                id: 'setup-analytics',
                title: 'Install analytics tool',
                description: 'Set up Mixpanel, Amplitude, or PostHog. Track user actions, not just page views.',
                tip: 'PostHog is open-source and free to self-host.',
                done: false,
            },
            {
                id: 'track-retention',
                title: 'Set up retention tracking',
                description: 'Track Day 1, Day 7, and Day 30 retention. This is the most important metric for growth.',
                done: false,
            },
            {
                id: 'funnel-analysis',
                title: 'Build a conversion funnel',
                description: 'Map the steps from signup to activation. Find where users drop off.',
                done: false,
            },
            {
                id: 'error-tracking',
                title: 'Set up error tracking',
                description: 'Install Sentry or similar. Know about crashes before users report them.',
                done: false,
            },
        ],
    },
    {
        id: 'monetization',
        title: 'Monetization',
        icon: 'currency-usd',
        color: '#f59e0b',
        items: [
            {
                id: 'pricing-page',
                title: 'Create a clear pricing page',
                description: 'Show 2-3 tiers. Highlight the most popular plan. Use annual pricing to increase LTV.',
                tip: 'Show the value, not just the features. "Save 10 hours/week" beats "Unlimited exports".',
                done: false,
            },
            {
                id: 'free-trial',
                title: 'Offer a free trial or freemium tier',
                description: 'Let users experience value before paying. 14-day trial or a limited free tier works best.',
                done: false,
            },
            {
                id: 'stripe-setup',
                title: 'Set up Stripe or RevenueCat',
                description: 'Use Stripe for web, RevenueCat for mobile. Never build your own payment system.',
                done: false,
            },
            {
                id: 'churn-prevention',
                title: 'Set up churn prevention',
                description: 'Email users before their trial ends. Offer a discount for annual plans.',
                done: false,
            },
        ],
    },
    {
        id: 'seo',
        title: 'SEO & Content',
        icon: 'magnify',
        color: '#ef4444',
        items: [
            {
                id: 'landing-page',
                title: 'Optimize your landing page',
                description: 'Clear headline (what it does), subheadline (who it\'s for), social proof, CTA.',
                tip: 'Use the words your users use, not your internal jargon.',
                done: false,
            },
            {
                id: 'meta-tags',
                title: 'Add proper meta tags',
                description: 'Title, description, og:image, og:title for social sharing. Use tools like metatags.io to preview.',
                done: false,
            },
            {
                id: 'blog-post',
                title: 'Write a launch blog post',
                description: 'Tell the story of why you built it. This ranks in search and builds trust.',
                done: false,
            },
            {
                id: 'submit-directories',
                title: 'Submit to directories',
                description: 'List your product on: Product Hunt, Crunchbase, G2, Capterra, AlternativeTo.',
                done: false,
            },
        ],
    },
];

export default function GrowthPlaybookScreen() {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const [playbook, setPlaybook] = useState(INITIAL_PLAYBOOK);
    const [expandedSection, setExpandedSection] = useState<string | null>('first-100');

    const bg = isDark ? '#07050f' : '#f1f5f9';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';

    const toggleItem = (sectionId: string, itemId: string) => {
        setPlaybook(prev => prev.map(section =>
            section.id === sectionId
                ? {
                    ...section,
                    items: section.items.map(item =>
                        item.id === itemId ? { ...item, done: !item.done } : item
                    ),
                }
                : section
        ));
    };

    const totalItems = playbook.reduce((acc, s) => acc + s.items.length, 0);
    const completedItems = playbook.reduce((acc, s) => acc + s.items.filter(i => i.done).length, 0);
    const progress = Math.round((completedItems / totalItems) * 100);

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: bg }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color={textPrimary} />
                </Pressable>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerLabel, { color: textMuted }]}>PREMIUM FEATURE</Text>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Growth Playbook 📈</Text>
                </View>
                <View style={[styles.progressBadge, { backgroundColor: '#10b98122', borderColor: '#10b98144' }]}>
                    <Text style={[styles.progressText, { color: '#10b981' }]}>{progress}%</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.intro, { color: textMuted }]}>
                    You shipped your app. Now what? Follow these steps to get your first 100 users and beyond.
                </Text>

                {playbook.map((section, sIndex) => {
                    const isExpanded = expandedSection === section.id;
                    const sectionCompleted = section.items.filter(i => i.done).length;

                    return (
                        <Animated.View key={section.id} entering={FadeInDown.delay(sIndex * 80)}>
                            <Pressable
                                onPress={() => setExpandedSection(isExpanded ? null : section.id)}
                                style={[styles.sectionHeader, { backgroundColor: cardBg, borderColor: cardBorder }]}
                            >
                                <View style={[styles.sectionIcon, { backgroundColor: section.color + '22' }]}>
                                    <MaterialCommunityIcons name={section.icon as any} size={20} color={section.color} />
                                </View>
                                <View style={styles.sectionInfo}>
                                    <Text style={[styles.sectionTitle, { color: textPrimary }]}>{section.title}</Text>
                                    <Text style={[styles.sectionMeta, { color: textMuted }]}>
                                        {sectionCompleted}/{section.items.length} completed
                                    </Text>
                                </View>
                                <MaterialCommunityIcons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={textMuted}
                                />
                            </Pressable>

                            {isExpanded && section.items.map((item, iIndex) => (
                                <Animated.View key={item.id} entering={FadeInDown.delay(iIndex * 50)}>
                                    <Pressable
                                        onPress={() => toggleItem(section.id, item.id)}
                                        style={[styles.itemCard, {
                                            backgroundColor: item.done ? section.color + '11' : cardBg,
                                            borderColor: item.done ? section.color + '33' : cardBorder,
                                        }]}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                                            size={22}
                                            color={item.done ? section.color : textMuted}
                                        />
                                        <View style={styles.itemContent}>
                                            <Text style={[styles.itemTitle, {
                                                color: item.done ? textMuted : textPrimary,
                                                textDecorationLine: item.done ? 'line-through' : 'none',
                                            }]}>
                                                {item.title}
                                            </Text>
                                            {!item.done && (
                                                <>
                                                    <Text style={[styles.itemDesc, { color: textMuted }]}>{item.description}</Text>
                                                    {item.tip && (
                                                        <View style={[styles.tipBox, { backgroundColor: section.color + '11', borderColor: section.color + '33' }]}>
                                                            <MaterialCommunityIcons name="lightbulb-outline" size={12} color={section.color} />
                                                            <Text style={[styles.tipText, { color: section.color }]}>{item.tip}</Text>
                                                        </View>
                                                    )}
                                                    {item.link && (
                                                        <Pressable onPress={() => Linking.openURL(item.link!)} style={styles.linkBtn}>
                                                            <MaterialCommunityIcons name="open-in-new" size={12} color="#6366f1" />
                                                            <Text style={styles.linkText}>Open Link</Text>
                                                        </Pressable>
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            ))}
                        </Animated.View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1 },
    headerLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    progressBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    progressText: { fontSize: 14, fontWeight: '900' },
    progressTrack: { height: 3, marginHorizontal: 16, borderRadius: 2, overflow: 'hidden', marginBottom: 16 },
    progressFill: { height: '100%', borderRadius: 2, backgroundColor: '#10b981' },
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    intro: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 8,
    },
    sectionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    sectionInfo: { flex: 1 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    sectionMeta: { fontSize: 12, marginTop: 2 },
    itemCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8, marginLeft: 8,
    },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    itemDesc: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
    tipBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 8, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
    tipText: { flex: 1, fontSize: 12, lineHeight: 16 },
    linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    linkText: { fontSize: 12, color: '#6366f1', fontWeight: '600' },
});
