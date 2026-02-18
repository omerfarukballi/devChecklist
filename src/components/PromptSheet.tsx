import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { theme } from '../constants/theme';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

interface PromptSheetProps {
    visible: boolean;
    onClose: () => void;
    prompt: string;
}

export const PromptSheet: React.FC<PromptSheetProps> = ({ visible, onClose, prompt }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await Clipboard.setStringAsync(prompt);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openInIDE = async (scheme: string) => {
        await Clipboard.setStringAsync(prompt);
        Haptics.selectionAsync();
        try {
            if (await Linking.canOpenURL(`${scheme}://`)) {
                Linking.openURL(`${scheme}://`);
            } else {
                alert(`Could not open ${scheme}. Prompt is copied to clipboard.`);
            }
        } catch (e) {
            console.log("Error opening link", e);
        }
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
                style={s.sheet}
            >
                <View style={s.dragHandle}>
                    <View style={s.dragBar} />
                </View>

                <View style={s.sheetHeader}>
                    <Text style={s.sheetTitle}>AI Prompt</Text>
                    <Pressable onPress={onClose}>
                        <Ionicons name="close-circle" size={28} color={theme.colors.text.muted} />
                    </Pressable>
                </View>

                <View style={s.promptBox}>
                    <Text style={s.promptText} numberOfLines={10}>
                        {prompt}
                    </Text>
                </View>

                <View style={s.actions}>
                    <Pressable
                        onPress={handleCopy}
                        style={[s.copyBtn, copied ? s.copyBtnSuccess : s.copyBtnDefault]}
                    >
                        <Ionicons name={copied ? "checkmark" : "copy-outline"} size={20} color="white" style={s.copyIcon} />
                        <Text style={s.copyBtnText}>
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </Text>
                    </Pressable>

                    <Text style={s.ideLabel}>Open in IDE</Text>

                    <View style={s.ideRow}>
                        <Pressable onPress={() => openInIDE('vscode')} style={s.ideBtn}>
                            <Text style={s.ideBtnText}>VS Code</Text>
                        </Pressable>
                        <Pressable onPress={() => openInIDE('cursor')} style={s.ideBtn}>
                            <Text style={s.ideBtnText}>Cursor</Text>
                        </Pressable>
                        <Pressable onPress={() => openInIDE('gnome-calculator')} style={[s.ideBtn, s.ideBtnDim]}>
                            <Text style={s.ideBtnText}>Zed</Text>
                        </Pressable>
                    </View>
                </View>
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
        backgroundColor: theme.colors.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        backgroundColor: '#4b5563',
        borderRadius: 2,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sheetTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    promptBox: {
        backgroundColor: '#0f172a',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginBottom: 24,
    },
    promptText: {
        color: '#d1d5db',
        fontFamily: 'monospace',
        fontSize: 14,
        lineHeight: 24,
    },
    actions: {
        gap: 12,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    copyBtnDefault: {
        backgroundColor: '#7c3aed',
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
    ideLabel: {
        color: '#6b7280',
        textAlign: 'center',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 8,
    },
    ideRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    ideBtn: {
        backgroundColor: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    ideBtnDim: {
        opacity: 0.5,
    },
    ideBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
