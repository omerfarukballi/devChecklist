import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        return null;
    }

    return true;
}

export async function scheduleDailyReminder(time: string) {
    // Clear existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    const [hours, minutes] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Time to build! 🚀",
            body: "Check your active projects and keep the momentum going.",
            sound: true,
        },
        trigger: {
            hour: hours,
            minute: minutes,
            repeats: true,
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        } as Notifications.CalendarTriggerInput,
    });
}

export async function cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
