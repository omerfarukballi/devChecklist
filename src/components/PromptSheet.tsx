import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { theme } from '../../constants/theme';
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
        await Clipboard.setStringAsync(prompt); // Auto copy before opening
        Haptics.selectionAsync();

        // Attempt to open IDE (simplified mainly implies copying and switching app manually for now as deep links vary)
        // Cursor/VSCode url schemes: vscode:// 
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
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
            </Pressable>

            <Animated.View
                entering={FadeInUp.springify()}
                exiting={FadeOutDown}
                style={{
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
                    maxHeight: '80%'
                }}
            >
                <View className="items-center mb-4">
                    <View className="w-12 h-1 bg-gray-600 rounded-full" />
                </View>

                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-xl font-bold">AI Prompt</Text>
                    <Pressable onPress={onClose}>
                        <Ionicons name="close-circle" size={28} color={theme.colors.text.muted} />
                    </Pressable>
                </View>

                <View className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
                    <Text className="text-gray-300 font-mono text-sm leading-6" numberOfLines={10}>
                        {prompt}
                    </Text>
                </View>

                <View className="gap-3">
                    <Pressable
                        onPress={handleCopy}
                        className={`flex-row items-center justify-center p-4 rounded-xl ${copied ? 'bg-green-600' : 'bg-violet-600'}`}
                    >
                        <Ionicons name={copied ? "checkmark" : "copy-outline"} size={20} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-base">
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </Text>
                    </Pressable>

                    <Text className="text-gray-500 text-center text-xs mt-2 uppercase tracking-widest">Open in IDE</Text>

                    <View className="flex-row gap-2 justify-center">
                        <Pressable onPress={() => openInIDE('vscode')} className="bg-slate-800 px-4 py-3 rounded-lg flex-1 items-center">
                            <Text className="text-white font-bold">VS Code</Text>
                        </Pressable>
                        <Pressable onPress={() => openInIDE('cursor')} className="bg-slate-800 px-4 py-3 rounded-lg flex-1 items-center">
                            <Text className="text-white font-bold">Cursor</Text>
                        </Pressable>
                        <Pressable onPress={() => openInIDE('gnome-calculator')} className="bg-slate-800 px-4 py-3 rounded-lg flex-1 items-center opacity-50">
                            {/* Placeholder/Joke for Zed/Windsurf if no URL scheme known */}
                            <Text className="text-white font-bold">Zed</Text>
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
};
