import { Audio } from 'expo-av';

let completeSoundInstance: Audio.Sound | null = null;

export async function preloadSounds() {
    try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: false });
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/complete.wav'),
            { shouldPlay: false, volume: 0.7 }
        );
        completeSoundInstance = sound;
    } catch (_) {
        // silently ignore — sound is optional
    }
}

export async function playCompleteSound() {
    try {
        if (!completeSoundInstance) {
            await preloadSounds();
        }
        if (completeSoundInstance) {
            await completeSoundInstance.setPositionAsync(0);
            await completeSoundInstance.playAsync();
        }
    } catch (_) {
        // silently ignore
    }
}
