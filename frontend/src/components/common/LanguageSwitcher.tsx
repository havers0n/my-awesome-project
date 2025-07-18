import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const isLanguageActive = (lang: string) => {
    return i18n.language.startsWith(lang);
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${isLanguageActive('en') ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        disabled={isLanguageActive('en')}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${isLanguageActive('ru') ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        disabled={isLanguageActive('ru')}
      >
        RU
      </button>
    </div>
  );
};

export default LanguageSwitcher; 