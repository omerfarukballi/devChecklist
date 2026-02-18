import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useChecklistStore } from '../src/store/checklistStore';
import { useThemeStore } from '../src/store/themeStore';
import { PROJECT_TYPES } from '../src/data/projectTypes';

export default function ShareCardScreen() {
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
    const { checklists, projects, getProgress } = useChecklistStore();
    const { colorMode } = useThemeStore();
    const viewShotRef = useRef<ViewShot>(null);
    const [sharing, setSharing] = useState(false);

    const isDark = colorMode === 'dark'; // Force dark mode for card usually looks better, but let's respect theme or force specific style for card
    // Actually social cards often look best with a specific brand style. Let's make a "Vibecoder" dark theme card.

    // Data preparation
    const data = useMemo(() => {
        if (projectId) {
            const project = projects.find(p => p.id === projectId);
            if (!project) return null;

            const uniqueIds = [...new Set(project.checklistIds)];
            const projectChecklists = uniqueIds
                .map(id => checklists.find(c => c.id === id))
                .filter(Boolean) as typeof checklists;

            const totalItems = projectChecklists.reduce((acc, c) => acc + c.items.length, 0);
            const completedItems = projectChecklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

            const projectDef = PROJECT_TYPES.find(p => p.id === project.projectType);

            return {
                title: project.name,
                subtitle: projectDef?.label || 'Project',
                progress,
                total: totalItems,
                completed: completedItems,
                stacks: project.techStack.slice(0, 4), // show up to 4 icons logic
                type: 'project',
                color: projectDef?.color || '#6366f1'
            };
        } else {
            // Overall stats
            const totalItems = checklists.reduce((acc, c) => acc + c.items.length, 0);
            const completedItems = checklists.reduce((acc, c) => acc + c.items.filter(i => i.completed).length, 0);
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            const activeProjects = projects.filter(p => !p.archived).length;

            return {
                title: 'My Dev Journey',
                subtitle: `${activeProjects} Active Projects`,
                progress,
                total: totalItems,
                completed: completedItems,
                stacks: [],
                type: 'overall',
                color: '#6366f1'
            };
        }
    }, [projectId, checklists, projects]);

    const handleShare = async () => {
        if (!viewShotRef.current) return;
        setSharing(true);
        try {
            const uri = await viewShotRef.current.capture?.();
            if (uri) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Share Progress',
                    UTI: 'public.png'
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate image');
        } finally {
            setSharing(false);
        }
    };

    if (!data) return null;

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: '#0f0d1a' }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="white" />
                </Pressable>
                <Text style={styles.headerTitle}>Share Progress</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.instruction}>Preview your social card:</Text>

                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'png', quality: 1.0 }}
                    style={styles.cardContainer}
                >
                    <View style={[styles.card, { borderColor: data.color }]}>
                        {/* Background decoration */}
                        <View style={[styles.bgCircle, { backgroundColor: data.color }]} />

                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardSubtitle}>{data.subtitle.toUpperCase()}</Text>
                                    <Text style={styles.cardTitle}>{data.title}</Text>
                                </View>
                                <MaterialCommunityIcons name="trophy" size={32} color={data.color} />
                            </View>

                            <View style={styles.progressSection}>
                                <Text style={[styles.progressText, { color: data.color }]}>{data.progress}%</Text>
                                <Text style={styles.progressLabel}>COMPLETED</Text>
                            </View>

                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${data.progress}%`, backgroundColor: data.color }]} />
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Text style={styles.statVal}>{data.completed}</Text>
                                    <Text style={styles.statLabel}>DONE</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Text style={styles.statVal}>{data.total}</Text>
                                    <Text style={styles.statLabel}>TOTAL</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.brand}>
                                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={16} color="#94a3b8" />
                                    <Text style={styles.brandText}>DevChecklist</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ViewShot>

                <Pressable style={[styles.shareBtn, { backgroundColor: data.color }]} onPress={handleShare} disabled={sharing}>
                    {sharing ? (
                        <Text style={styles.shareBtnText}>Generating...</Text>
                    ) : (
                        <>
                            <MaterialCommunityIcons name="share-variant" size={20} color="white" />
                            <Text style={styles.shareBtnText}>Share Image</Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#0f0d1a' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 24, alignItems: 'center' },
    instruction: { color: '#94a3b8', marginBottom: 24 },
    cardContainer: {
        width: 320,
        height: 480,
        backgroundColor: '#1e1b2e',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    card: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'space-between',
    },
    bgCircle: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.1,
    },
    cardContent: { flex: 1, gap: 32 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 },
    cardSubtitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    cardTitle: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 4, maxWidth: 200 },
    progressSection: { alignItems: 'center', marginTop: 20 },
    progressText: { fontSize: 80, fontWeight: '900' },
    progressLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '700', letterSpacing: 2, marginTop: -10 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingBottom: 16 },
    stat: { alignItems: 'center' },
    statVal: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    statLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '700' },
    divider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    brandText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
    shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 56, borderRadius: 16, marginTop: 40 },
    shareBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
