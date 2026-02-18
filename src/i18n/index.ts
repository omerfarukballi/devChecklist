import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Define translations
const en = {
    // Basic keys for demonstration
    welcome: 'Welcome',
    projects: 'Projects',
    settings: 'Settings',
    archive: 'Archive',
    notes: 'Project Notes',
};

const tr = {
    welcome: 'Hoşgeldin',
    projects: 'Projeler',
    settings: 'Ayarlar',
    archive: 'Arşiv',
    notes: 'Proje Notları',
};

const i18n = new I18n({
    en,
    tr,
});

// Set locale
i18n.locale = Localization.getLocales()[0].languageCode ?? 'en';
i18n.enableFallback = true;

export default i18n;
