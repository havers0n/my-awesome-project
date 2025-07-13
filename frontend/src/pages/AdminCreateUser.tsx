import { useState } from "react";
import { useNavigate } from "react-router-dom";
  const navigate = useNavigate();
import { FaUserShield, FaSpinner } from "react-icons/fa";
import { Alert, AlertTitle, AlertDescription } from "@/components/molecules/Alert";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { SelectField } from "@/components/molecules/SelectField";
import { SelectItem } from "@/components/molecules/Select";
import { PhoneField } from '@/components/molecules/PhoneField';
import { authAPI } from "@/services/api";

export default function AdminCreateUser() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState<string | undefined>('');
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
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
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
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Ошибка!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
                <Alert>
                    <AlertTitle>Успех!</AlertTitle>
                    <AlertDescription>Пользователь успешно создан. Вы будете перенаправлены...</AlertDescription>
                </Alert>
            )}

            <FormField
              label="Email*"
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Введите email"
            />

            <FormField
              label="Имя*"
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Введите имя"
            />

            <FormField
              label="Фамилия"
              id="lastName"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Введите фамилию"
            />

            <FormField
              label="Пароль*"
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />

            <FormField
              label="Подтверждение пароля*"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Подтвердите пароль"
            />

            <SelectField
              label="Роль*"
              placeholder="Выберите роль"
              onValueChange={setRole}
              value={role}
            >
              {roles.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectField>

            <SelectField
              label="Организация"
              placeholder="Выберите организацию"
              onValueChange={setOrganization}
              value={organization}
            >
              {organizations.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectField>
            
            <PhoneField
              id="phone"
              label="Рабочий телефон"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onValueChange={setPhone}
            />
            
            <FormField
              label="Должность"
              id="position"
              type="text"
              value={position}
              onChange={e => setPosition(e.target.value)}
              placeholder="Введите должность"
            />
            
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate("/admin/users")}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading || success}>
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Создание...
                  </>
                ) : (
                  'Создать пользователя'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 