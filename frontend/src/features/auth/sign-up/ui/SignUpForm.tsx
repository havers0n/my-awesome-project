import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ICONS } from "@/helpers/icons";
import { Icon } from "@/shared/ui/Icon";
import Label from "@/shared/ui/form/Label";
import Input from "@/shared/ui/form/input/InputField";
import Checkbox from "@/shared/ui/form/input/Checkbox";
import { useAuth } from "../../../../context/AuthContext";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка согласия с условиями
    if (!isChecked) {
      setError("Вы должны согласиться с условиями использования");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await signUp(email, password);
      setSuccess("Регистрация успешна! Проверьте вашу электронную почту для подтверждения.");
      navigate('/signin');
    } catch (e: any) {
      console.error('Registration error:', e);
      setError(e.message || 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <Icon name="CHEVRON_LEFT" size={5} />
          Вернуться на главную
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Регистрация
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Введите e-mail и пароль для регистрации!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                {/* <!-- First Name --> */}
                <div className="sm:col-span-1">
                  <Label>
                    Имя<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="fname"
                    name="fname"
                    placeholder="Введите имя"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                {/* <!-- Last Name --> */}
                <div className="sm:col-span-1">
                  <Label>
                    Фамилия<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="lname"
                    name="lname"
                    placeholder="Введите фамилию"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>
              {/* <!-- Email --> */}
              <div className="mt-4">
                <Label>
                  E-mail<span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Введите e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              {/* <!-- Password --> */}
              <div className="mt-4">
                <Label>
                  Пароль<span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Введите пароль"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    <Icon name={showPassword ? 'EYE' : 'EYE_CLOSE'} size={5} className="fill-gray-500 dark:fill-gray-400" />
                  </span>
                </div>
              </div>
              {/* <!-- Checkbox --> */}
              <div className="flex items-center gap-3 mt-4">
                <Checkbox
                  className="w-5 h-5"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  Создавая аккаунт, вы соглашаетесь с нашими {" "}
                  <span className="text-gray-800 dark:text-white/90">
                    Условиями использования,
                  </span>{" "}
                  и нашей{" "}
                  <span className="text-gray-800 dark:text-white">
                    Политикой конфиденциальности
                  </span>
                </p>
              </div>
              {/* <!-- Error/Success --> */}
              {error && (
                <div className="text-red-500 text-sm text-center mt-4">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm text-center mt-4">{success}</div>
              )}
              {/* <!-- Button --> */}
              <div className="mt-6">
                <button
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Регистрация..." : "Зарегистрироваться"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
