import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function UpdatePassword() {
  const { user } = useAuth();
  console.log('[UpdatePassword] render', { href: window.location.href, user });
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMessage(error.message);
    else {
      setMessage('Пароль обновлён!');
      setTimeout(() => navigate('/sign-in'), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-center text-gray-800 dark:text-white">Установите новый пароль</h2>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">Введите новый пароль ниже.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Новый пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {message && <div className="text-green-500 text-sm text-center">{message}</div>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:bg-brand-300"
          >
            Обновить пароль
          </button>
        </form>
      </div>
    </div>
  );
} 