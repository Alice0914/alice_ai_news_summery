import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ko from './locales/ko.json';

const defaultLang = 'en';

const storedLang = localStorage.getItem('i18nextLng');
const initialLang = (storedLang ? storedLang.split('-')[0] : defaultLang);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: initialLang,
        resources: {
            en: { translation: en },
            ko: { translation: ko }
        },
        fallbackLng: 'en',
        load: 'languageOnly',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
