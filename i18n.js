import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ko from './locales/ko.json';

const defaultLang = 'en'; // Force English as default for new users

// Check localStorage first
// Clean up 'en-US' -> 'en' to match resource keys
const storedLang = localStorage.getItem('i18nextLng');
const initialLang = (storedLang ? storedLang.split('-')[0] : defaultLang);

i18n
    // detect user language
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: initialLang,
        resources: {
            en: { translation: en },
            ko: { translation: ko }
        },
        fallbackLng: 'en',
        load: 'languageOnly', // Critical: treats 'en-US' as 'en'
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            // caching options
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
