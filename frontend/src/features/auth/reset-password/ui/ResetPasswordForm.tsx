import { useState } from "react";
import { Link } from "react-router";
import { Icon } from "@/shared/ui/Icon";
import Label from "@/shared/ui/form/Label";
import Input from "@/shared/ui/form/input/InputField";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Здесь будет логика сброса пароля
      // await resetPassword(email);
      setSuccess("Инструкции по сбросу пароля отправлены на вашу почту");
    } catch (e: any) {
      setError(e.message || 'Произошла ошибка при сбросе пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Icon name="CHEVRON_LEFT" size={5} />
          Вернуться к входу
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Сброс пароля
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Введите ваш e-mail для получения инструкций по сбросу пароля
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  E-mail <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm text-center">{success}</div>
              )}
              <div>
                <button
                  className="w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Отправка..." : "Отправить инструкции"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
