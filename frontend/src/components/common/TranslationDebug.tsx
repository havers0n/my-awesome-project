import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const TranslationDebug: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      currentLanguage: i18n.language,
      availableLanguages: i18n.languages,
      loadedNamespaces: i18n.reportNamespaces?.getUsedNamespaces() || [],
      isInitialized: i18n.isInitialized,
      hasLoadedNamespace: i18n.hasLoadedNamespace('translation'),
      store: i18n.store?.data,
    };
    setDebugInfo(info);
  }, [i18n]);

  const testKeys = [
    'page.inventory.management.productDetails.title',
    'page.inventory.management.productDetails.information',
    'page.inventory.management.productDetails.operationsHistory',
    'page.inventory.management.productDetails.suppliers',
    'page.inventory.management.productDetails.mlForecast',
    'page.inventory.management.productDetails.sku',
    'page.inventory.management.productDetails.code',
    'page.inventory.management.productDetails.price',
    'page.inventory.management.productDetails.stockByLocation',
    'page.inventory.management.productDetails.location',
    'page.inventory.management.productDetails.stock',
    'page.inventory.management.productDetails.close',
  ];

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="font-bold text-lg mb-2">Translation Debug</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">i18n Status:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Test Translations:</h4>
        <div className="space-y-1">
          {testKeys.map(key => (
            <div key={key} className="text-xs">
              <span className="font-mono">{key}:</span>
              <span className="ml-2 text-blue-600">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Actions:</h4>
        <div className="space-y-2">
          <button
            onClick={() => i18n.changeLanguage('en')}
            className="block w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Switch to EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('ru')}
            className="block w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Switch to RU
          </button>
          <button
            onClick={() => window.location.reload()}
            className="block w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationDebug; 