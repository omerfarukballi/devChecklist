/**
 * V2 Strategy Builder — decision tree flow that builds ContextProfile and creates StrategyProfile.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DECISION_TREE, ROOT_NODE_ID, buildContextFromTree, getNextNode, getOptionEffect } from '../src/core/decision-tree';
import { useStrategyProfileStore } from '../src/store/strategyProfileStore';
import { useThemeStore } from '../src/store/themeStore';
import { buildStrategicPlan } from '../src/core/context-engine';
import type { ContextProfile, StrategyProfile } from '../src/types/strategy';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

export default function StrategyBuilderScreen() {
  const [currentNodeId, setCurrentNodeId] = useState(ROOT_NODE_ID);
  const [context, setContext] = useState<Partial<ContextProfile> & { stage?: string }>({});
  const [injectedTags, setInjectedTags] = useState<string[]>([]);
  const addStrategyProfile = useStrategyProfileStore((s) => s.addStrategyProfile);
  const { colorMode } = useThemeStore();
  const isDark = colorMode === 'dark';

  const node = DECISION_TREE[currentNodeId];

  const bg = isDark ? '#07050f' : '#f1f5f9';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const handleOption = (optionId: string) => {
    const { contextMutations, injectTags } = getOptionEffect(currentNodeId, optionId);
    const newContext = { ...context, ...contextMutations };
    const newTags = [...injectedTags, ...(injectTags ?? [])];
    setContext(newContext);
    setInjectedTags(newTags);
    const nextId = getNextNode(currentNodeId, optionId);
    if (nextId) setCurrentNodeId(nextId);
    else {
      const stage = (newContext.stage ?? 'growth') as import('../src/types/strategy').ProductStage;
      const profileId = genId();
      const now = Date.now();
      const fullContext = buildContextFromTree(
        { ...newContext, stage },
        newTags,
        `ctx-${profileId}`,
        now
      );
      const plan = buildStrategicPlan(fullContext, profileId, undefined);
      const profile: StrategyProfile = {
        id: profileId,
        name: `${fullContext.productType} · ${stage}`,
        context: fullContext,
        plan,
        completionRatio: 0,
        stageUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      addStrategyProfile(profile);
      router.replace('/strategy-dashboard');
    }
  };

  if (!node) return null;

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
        </Pressable>
        <Text style={[s.step, { color: textSecondary }]}>Strategy builder</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.question, { color: textPrimary }]}>{node.question}</Text>
        {node.description ? (
          <Text style={[s.desc, { color: textSecondary }]}>{node.description}</Text>
        ) : null}
        <View style={s.options}>
          {node.options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => handleOption(opt.id)}
              style={[s.option, { backgroundColor: cardBg, borderColor }]}
            >
              <Text style={[s.optionLabel, { color: textPrimary }]}>{opt.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { marginRight: 12 },
  step: { fontSize: 14 },
  scroll: { padding: 20, paddingBottom: 40 },
  question: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  desc: { fontSize: 16, marginBottom: 24 },
  options: { gap: 12 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderRadius: 16, borderWidth: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600', flex: 1 },
});
