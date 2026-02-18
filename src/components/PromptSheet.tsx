import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useThemeStore } from '../store/themeStore';

interface PromptSheetProps {
    visible: boolean;
    onClose: () => void;
    prompt: string;
}

export const PromptSheet: React.FC<PromptSheetProps> = ({ visible, onClose, prompt }) => {
    const [copied, setCopied] = useState(false);
    const { colorMode } = useThemeStore();
    const isDark = colorMode === 'dark';

    const sheetBg = isDark ? '#0f0d1a' : '#ffffff';
    const promptBoxBg = isDark ? '#0f172a' : '#f1f5f9';
    const promptBoxBorder = isDark ? '#1e293b' : '#e2e8f0';
    const promptTextColor = isDark ? '#d1d5db' : '#334155';
    const titleColor = isDark ? 'white' : '#0f172a';
    const dragBarColor = isDark ? '#4b5563' : '#cbd5e1';
    const borderColor = isDark ? theme.colors.border : 'rgba(0,0,0,0.08)';

    const handleCopy = async () => {
        await Clipboard.setStringAsync(prompt);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                <View style={s.backdrop} />
            </Pressable>

            <Animated.View
                entering={FadeInUp.springify()}
                exiting={FadeOutDown}
                style={[s.sheet, { backgroundColor: sheetBg, borderColor }]}
            >
                <View style={s.dragHandle}>
                    <View style={[s.dragBar, { backgroundColor: dragBarColor }]} />
                </View>

                <View style={s.sheetHeader}>
                    <Text style={[s.sheetTitle, { color: titleColor }]}>AI Prompt</Text>
                    <Pressable onPress={onClose}>
                        <Ionicons name="close-circle" size={28} color={theme.colors.text.muted} />
                    </Pressable>
                </View>

                <View style={[s.promptBox, { backgroundColor: promptBoxBg, borderColor: promptBoxBorder }]}>
                    <Text style={[s.promptText, { color: promptTextColor }]} numberOfLines={10}>
                        {prompt}
                    </Text>
                </View>

                <Pressable
                    onPress={handleCopy}
                    style={[s.copyBtn, copied ? s.copyBtnSuccess : s.copyBtnDefault]}
                >
                    <Ionicons name={copied ? "checkmark" : "copy-outline"} size={20} color="white" style={s.copyIcon} />
                    <Text style={s.copyBtnText}>
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </Text>
                </Pressable>
            </Animated.View>
        </Modal>
    );
};

const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    dragHandle: {
        alignItems: 'center',
        marginBottom: 16,
    },
    dragBar: {
        width: 48,
        height: 4,
        borderRadius: 2,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    promptBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    promptText: {
        fontFamily: 'monospace',
        fontSize: 14,
        lineHeight: 24,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    copyBtnDefault: {
        backgroundColor: '#1d4ed8',
    },
    copyBtnSuccess: {
        backgroundColor: '#16a34a',
    },
    copyIcon: {
        marginRight: 8,
    },
    copyBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
