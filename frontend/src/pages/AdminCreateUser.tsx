import { useState } from "react";
import { useNavigate } from "react-router-dom";
  const navigate = useNavigate();
import { FaUserShield, FaUserPlus, FaCheckCircle, FaSpinner } from "react-icons/fa";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import { authAPI } from "@/services/api";

export default function AdminCreateUser() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailUnique, setEmailUnique] = useState<boolean | null>(null);

  // Организации для select
  const organizations = [
    { value: "", label: "Без организации" },
    { value: "1", label: 'ООО "ТехноСервис"' },
    { value: "2", label: "ИП Иванов И.И." },
    { value: "3", label: 'АО "Инновации"' },
  ];

  // Роли для select
  const roles = [
    { value: "employee", label: "Сотрудник" },
    { value: "franchisee", label: "Владелец/Управляющий" },
    { value: "admin", label: "Администратор" },
  ];

  // Для PhoneInput
  const countries = [
    { code: "RU", label: "+7" },
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (navigator.onLine === false) {
      setError("Нет соединения с интернетом. Проверьте подключение.");
      return;
    }

    // Валидация
    if (!email || !firstName || !password || !confirmPassword || !role) {
      setError("Пожалуйста, заполните все обязательные поля.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }
    // Валидация телефона (минимум 10 цифр)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phone && phoneDigits.length < 10) {
      setError("Введите корректный рабочий телефон (не менее 10 цифр)");
      return;
    }
    // Валидация должности (если указана, минимум 2 символа)
    if (position && position.trim().length < 2) {
      setError("Должность должна содержать минимум 2 символа");
      return;
    }

    // Проверка уникальности email
    setLoading(true);
    let isUnique = emailUnique;
    if (isUnique === null) {
      // если пользователь не выходил из поля email, проверим здесь
      try {
        isUnique = await authAPI.checkEmailUnique(email);
      } catch (e) {
        setError("Ошибка проверки email. Попробуйте позже.");
        setLoading(false);
        return;
      }
    }
    if (!isUnique) {
      setError("Пользователь с таким email уже существует.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Реальный вызов API для создания пользователя
      await authAPI.register({
        email,
        password,
        full_name: `${firstName} ${lastName}`.trim(),
        organization_id: organization ? Number(organization) : undefined,
        role: role || undefined,
        phone: phone || undefined,
        position: position || undefined
      });
      setSuccess(true);
      setEmail("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
      setOrganization("");
      setPhone("");
      setPosition("");
      setTimeout(() => {
        setSuccess(false);
        navigate("/admin/users");
      }, 1500); // редирект через 1.5 сек после успеха
    } catch (err: any) {
      if (err?.response?.status === 0 || err?.message?.includes('Network')) {
        setError("Ошибка сети. Проверьте подключение к интернету.");
      } else if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || "Ошибка запроса");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 transform hover:scale-[1.01]">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex items-center">
          <div className="bg-white text-blue-600 p-2 rounded-lg mr-4">
            <FaUserShield className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Создание пользователя</h1>
          </div>
        </div>
        {/* Form */}
        <div className="p-6">
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <Label htmlFor="email">Email<span className="text-error-500">*</span></Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={async e => {
                  setEmail(e.target.value);
                  setEmailUnique(null);
                  setError(null);
                }}
                onBlur={async () => {
                  if (!email) return;
                  setEmailChecking(true);
                  const unique = await authAPI.checkEmailUnique(email);
                  setEmailUnique(unique);
                  if (!unique) setError("Пользователь с таким email уже существует.");
                  setEmailChecking(false);
                }}
                placeholder="Введите email"
              />
              {emailChecking && <div className="text-xs text-gray-500 mt-1">Проверка email...</div>}
              {emailUnique === false && <div className="text-xs text-red-500 mt-1">Email уже занят</div>}
              {emailUnique === true && <div className="text-xs text-green-600 mt-1">Email свободен</div>}
            </div>
            <div>
              <Label htmlFor="firstName">Имя<span className="text-error-500">*</span></Label>
              <Input
                type="text"
                id="firstName"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Введите имя"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                type="text"
                id="lastName"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Введите фамилию"
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль<span className="text-error-500">*</span></Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введите пароль"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Подтверждение пароля<span className="text-error-500">*</span></Label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите пароль"
              />
            </div>
            <div>
              <Label htmlFor="role">Роль<span className="text-error-500">*</span></Label>
              <Select
                options={roles}
                placeholder="Выберите роль"
                onChange={setRole}
                defaultValue={role}
              />
            </div>
            <div>
              <Label htmlFor="organization">Организация</Label>
              <Select
                options={organizations}
                placeholder="Выберите организацию"
                onChange={setOrganization}
                defaultValue={organization}
              />
            </div>
            <div>
              <Label>Рабочий телефон</Label>
              <PhoneInput
                countries={countries}
                placeholder="+7 (999) 000-00-00"
                onChange={setPhone}
                selectPosition="start"
              />
            </div>
            <div>
              <Label htmlFor="position">Должность</Label>
              <Input
                type="text"
                id="position"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="Введите должность"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaUserPlus className="mr-2" />
              )}
              {loading ? "Создание..." : "Создать пользователя"}
            </button>
          </form>
          {/* Success/Error Message */}
          {success && (
            <div className="mt-4">
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center">
                <div className="text-green-500 mr-3">
                  <FaCheckCircle />
                </div>
                <div>
                  <p className="font-semibold">Пользователь успешно создан!</p>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center">
                <div className="text-red-500 mr-3">
                  <FaCheckCircle />
                </div>
                <div>
                  <p className="font-semibold">Ошибка!</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 