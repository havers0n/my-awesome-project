import React, { useState } from 'react';
import { fetchForecastData, postForecast, fetchForecastHistory } from '../api/forecast';
import ForecastResults from '../components/forecast/ForecastResults';
import FileUploadProgress from '../components/common/FileUploadProgress';

const TestForecastAPI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: string; data: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testGetForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchForecastData(14);
      setResult({ type: 'GET Forecast', data });
      console.log('GET forecast result:', data);
    } catch (err) {
      setError(`GET Forecast Error: ${err}`);
      console.error('GET forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testPostForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postForecast();
      setResult({ type: 'POST Forecast', data });
      console.log('POST forecast result:', data);
    } catch (err) {
      setError(`POST Forecast Error: ${err}`);
      console.error('POST forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchForecastHistory(1, 5, '', '');
      setResult({ type: 'Forecast History', data });
      console.log('History result:', data);
    } catch (err) {
      setError(`History Error: ${err}`);
      console.error('History error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      // Получаем токен из localStorage
      const raw = localStorage.getItem('sb-uxcsziylmyogvcqyyuiw-auth-token');
      let token = '';
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          token = parsed.access_token || '';
        } catch {
          token = raw;
        }
      }

      const response = await fetch('/api/predictions/forecast?days=14', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult({ type: 'Direct API Call', data });
      console.log('Direct API result:', data);
    } catch (err) {
      setError(`Direct API Error: ${err}`);
      console.error('Direct API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<unknown> => {
    // Симуляция загрузки файла для тестирования
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve({
            success: true,
            filename: file.name,
            size: file.size,
            type: file.type,
            content: content.substring(0, 100) // Первые 100 символов для предварительного просмотра
          });
        } catch {
          reject(new Error('Ошибка при чтении файла'));
        }
      };
      reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
      reader.readAsText(file);
    });
  };

  const handleUploadComplete = (result: unknown) => {
    console.log('File upload completed:', result);
    setResult({ type: 'File Upload', data: result });
  };

  const handleUploadError = (error: string) => {
    console.error('File upload error:', error);
    setError(`File Upload Error: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Test Forecast API</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <button
              onClick={testGetForecast}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test GET Forecast
            </button>
            <button
              onClick={testPostForecast}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test POST Forecast
            </button>
            <button
              onClick={testHistory}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test History
            </button>
            <button
              onClick={testDirectAPI}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Direct API
            </button>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}
        </div>

        <ForecastResults 
          loading={loading}
          error={error}
          data={result?.data}
          onRefresh={testGetForecast}
        />

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">File Upload Test</h2>
          <FileUploadProgress
            onFileUpload={handleFileUpload}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            acceptedTypes={['.csv', '.json', '.txt']}
            className="mb-4"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Authentication Info</h3>
          <div className="text-sm text-gray-600">
            <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
            <p><strong>Auth Token Exists:</strong> {localStorage.getItem('sb-uxcsziylmyogvcqyyuiw-auth-token') ? 'Yes' : 'No'}</p>
            <p><strong>Backend URL:</strong> /api/predictions (proxied to localhost:3000)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestForecastAPI;
