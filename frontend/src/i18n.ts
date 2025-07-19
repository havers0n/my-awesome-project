import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

console.log('Initializing i18n...');

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  }).then(() => {
    console.log('i18n initialized successfully');
    console.log('Current language:', i18n.language);
    console.log('Available languages:', i18n.languages);
    console.log('Loaded namespaces:', i18n.reportNamespaces?.getUsedNamespaces() || 'No namespaces');
    
    // Принудительно устанавливаем английский язык
    i18n.changeLanguage('en').then(() => {
      console.log('Language changed to EN');
      console.log('Translation test:', i18n.t('inventory.management.title'));
    });
  });

export default i18n; 