import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useThemeStore } from '../../store/themeStore';
import { SnippetEntry } from '../../data/snippetVault';

interface SnippetSheetProps {
    entry: SnippetEntry;
    visible: boolean;
    onClose: () => void;
}

const LANG_COLORS: Record<string, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    python: '#3572a5',
    yaml: '#cb171e',
    dockerfile: '#2496ed',
    bash: '#4eaa25',
    prisma: '#2d3748',
    default: '#6366f1',
};

export function SnippetSheet({ entry, visible, onClose }: SnippetSheetProps) {
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';
    const [activeTab, setActiveTab] = useState(0);
    const [copied, setCopied] = useState(false);

    const textPrimary = isDark ? '#e2e8f0' : '#0f172a';
    const textMuted = isDark ? '#64748b' : '#94a3b8';
    const modalBg = isDark ? '#0f0d1a' : '#ffffff';
    const codeBg = isDark ? '#1a1625' : '#f8fafc';
    const codeBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tabActiveBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';

    const activeSnippet = entry.snippets[activeTab];
    const langColor = LANG_COLORS[activeSnippet?.language ?? 'default'] ?? LANG_COLORS.default;

    const handleCopy = async () => {
        if (!activeSnippet) return;
        await Clipboard.setStringAsync(activeSnippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose} />
            <View style={[styles.sheet, { backgroundColor: modalBg }]}>
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.header}>
                    <MaterialCommunityIcons name="code-braces" size={20} color="#6366f1" />
                    <Text style={[styles.title, { color: textPrimary }]}>Code Snippets</Text>
                    <Pressable onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={22} color={textMuted} />
                    </Pressable>
                </View>

                {/* Tab selector */}
                {entry.snippets.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                        {entry.snippets.map((s, i) => (
                            <Pressable
                                key={i}
                                onPress={() => setActiveTab(i)}
                                style={[
                                    styles.tab,
                                    i === activeTab && { backgroundColor: tabActiveBg },
                                ]}
                            >
                                <Text style={[styles.tabText, { color: i === activeTab ? textPrimary : textMuted }]}>
                                    {s.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}

                {/* Code block */}
                {activeSnippet && (
                    <View style={[styles.codeContainer, { backgroundColor: codeBg, borderColor: codeBorder }]}>
                        <View style={styles.codeHeader}>
                            <View style={[styles.langBadge, { backgroundColor: langColor + '22' }]}>
                                <Text style={[styles.langText, { color: langColor }]}>{activeSnippet.language}</Text>
                            </View>
                            <Pressable onPress={handleCopy} style={styles.copyBtn}>
                                <MaterialCommunityIcons
                                    name={copied ? 'check' : 'content-copy'}
                                    size={16}
                                    color={copied ? '#22c55e' : textMuted}
                                />
                                <Text style={[styles.copyText, { color: copied ? '#22c55e' : textMuted }]}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </Text>
                            </Pressable>
                        </View>
                        <ScrollView style={styles.codeScroll} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.code, { color: isDark ? '#a5b4fc' : '#1e1b4b' }]}>
                                {activeSnippet.code}
                            </Text>
                        </ScrollView>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: { padding: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#374151', alignSelf: 'center', marginBottom: 16 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    title: { flex: 1, fontSize: 18, fontWeight: 'bold' },
    tabs: { marginBottom: 12 },
    tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
    tabText: { fontSize: 13, fontWeight: '600' },
    codeContainer: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    codeHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    langBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    langText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    copyText: { fontSize: 13, fontWeight: '600' },
    codeScroll: { maxHeight: 280 },
    code: { fontFamily: 'monospace', fontSize: 12, lineHeight: 20, padding: 14 },
});
