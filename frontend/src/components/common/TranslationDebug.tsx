import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationDebug: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="font-bold text-sm mb-2">Translation Debug</h3>
      <div className="text-xs space-y-1">
        <div>Language: {i18n.language}</div>
        <div>Fallback: {i18n.options.fallbackLng as string}</div>
        <div>Debug: {i18n.options.debug ? '✅' : '❌'}</div>
        <div>Initialized: {i18n.isInitialized ? '✅' : '❌'}</div>
        <div>Resources loaded: {Object.keys(i18n.store.data).length > 0 ? '✅' : '❌'}</div>
        <div>Available languages: {Object.keys(i18n.store.data).join(', ')}</div>
        <hr className="my-2" />
        <div>Test translations:</div>
        <div>page.inventory.management.title: {t('page.inventory.management.title')}</div>
        <div>page.inventory.management.subtitle: {t('page.inventory.management.subtitle')}</div>
        <div>page.inventory.management.stats.totalSKU: {t('page.inventory.management.stats.totalSKU')}</div>
        <hr className="my-2" />
        <div>Raw resources:</div>
        <pre className="text-xs bg-gray-100 p-1 rounded overflow-auto max-h-20">
          {JSON.stringify(i18n.store.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TranslationDebug; 