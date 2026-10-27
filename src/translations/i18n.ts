import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/translations/en';
import rw from '@/translations/rw';
import fr from '@/translations/fr';

const resources = {
  en: { translation: en },
  rw: { translation: rw },
  fr: { translation: fr },
} as const;

const installPlugin = i18n.use.bind(i18n);

void installPlugin(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
