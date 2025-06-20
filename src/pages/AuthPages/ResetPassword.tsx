import { useState } from "react";
import { authAPI } from "../../services/api";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authAPI.requestPasswordReset(email);
      setSuccess(res.message || "Check your email for the password reset link.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Ошибка при сбросе пароля");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-center text-gray-800 dark:text-white">Забыли пароль?</h2>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">Введите ваш e-mail, и мы отправим ссылку для сброса пароля.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Введите e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:bg-brand-300"
            disabled={loading}
          >
            {loading ? "Отправка..." : "Отправить ссылку для сброса"}
          </button>
        </form>
      </div>
    </div>
  );
} 