import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

const BACKUP_FILE_NAME = 'devChecklist_backup.json';
const STORAGE_KEY = 'dev-checklist-storage';

/**
 * Export all app data to a JSON file and share it.
 */
export async function exportBackup(storeData: object): Promise<void> {
    try {
        const payload = {
            version: 1,
            exportedAt: new Date().toISOString(),
            data: storeData,
        };

        const json = JSON.stringify(payload, null, 2);
        const fileUri = FileSystem.documentDirectory + BACKUP_FILE_NAME;

        await FileSystem.writeAsStringAsync(fileUri, json, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
            Alert.alert('Error', 'Sharing is not available on this device.');
            return;
        }

        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Export DevChecklist Backup',
            UTI: 'public.json',
        });
    } catch (error) {
        Alert.alert('Export Failed', String(error));
    }
}

/**
 * Import a backup JSON file and return parsed store data.
 * Returns null if user cancelled or file is invalid.
 */
export async function importBackup(): Promise<object | null> {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        const fileUri = result.assets[0].uri;
        const json = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        const parsed = JSON.parse(json);

        if (!parsed.data || typeof parsed.data !== 'object') {
            Alert.alert('Invalid Backup', 'This file does not appear to be a valid DevChecklist backup.');
            return null;
        }

        return parsed.data;
    } catch (error) {
        Alert.alert('Import Failed', String(error));
        return null;
    }
}
