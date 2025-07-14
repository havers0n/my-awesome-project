import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { authAPI } from '../../services/api';
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

interface UserProfileData {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getProfile();
      setProfile(response);
      setFormData({
        ...formData,
        full_name: response.full_name || "",
        email: response.email || ""
      });
    } catch (e: any) {
      console.error("Error fetching profile:", e);
      setError(e.response?.data?.error || e.message || "Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(null);
    setUpdateError(null);

    // Проверка паролей, если пользователь хочет изменить пароль
    if (formData.new_password) {
      if (formData.new_password !== formData.confirm_password) {
        setUpdateError("Новые пароли не совпадают");
        return;
      }
      if (!formData.current_password) {
        setUpdateError("Для изменения пароля необходимо указать текущий пароль");
        return;
      }
    }

    try {
      const updateData: any = {
        full_name: formData.full_name
      };

      // Добавляем пароли только если пользователь хочет их изменить
      if (formData.new_password) {
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const response = await authAPI.updateProfile(updateData);
      
      if (response.success) {
        setUpdateSuccess("Профиль успешно обновлен");
        setEditMode(false);
        fetchUserProfile(); // Обновляем данные профиля
      } else {
        setUpdateError(response.message || "Не удалось обновить профиль");
      }
    } catch (e: any) {
      console.error("Error updating profile:", e);
      setUpdateError(e.response?.data?.error || e.message || "Произошла ошибка при обновлении профиля");
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate("/login");
    } catch (e: any) {
      console.error("Error logging out:", e);
      setError(e.response?.data?.error || e.message || "Не удалось выйти из системы");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-brand-500 border-b-brand-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Ошибка</h2>
          <p className="text-red-500">{error}</p>
          <Button
            onClick={fetchUserProfile}
            className="mt-4"
            variant="primary"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Профиль пользователя</h2>
        <div className="flex space-x-2">
          {!editMode ? (
            <Button
              onClick={() => setEditMode(true)}
              variant="primary"
            >
              Редактировать
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditMode(false);
                setFormData({
                  ...formData,
                  full_name: profile?.full_name || "",
                  email: profile?.email || "",
                  current_password: "",
                  new_password: "",
                  confirm_password: ""
                });
              }}
              variant="outline"
            >
              Отмена
            </Button>
          )}
          <Button
            onClick={handleLogout}
            variant="primary"
            className="bg-red-500 hover:bg-red-600"
          >
            Выйти
          </Button>
        </div>
      </div>

      {updateSuccess && (
        <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-300">
          {updateSuccess}
        </div>
      )}

      {updateError && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300">
          {updateError}
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label>Имя</Label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                placeholder="Ваш email"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email нельзя изменить
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">Изменить пароль</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <Label>Текущий пароль</Label>
                <Input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  placeholder="Введите текущий пароль"
                />
              </div>
              <div>
                <Label>Новый пароль</Label>
                <Input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  placeholder="Введите новый пароль"
                />
              </div>
              <div>
                <Label>Подтвердите пароль</Label>
                <Input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Подтвердите новый пароль"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Оставьте поля пароля пустыми, если не хотите менять пароль
            </p>
          </div>

          <div className="mt-6">
            <Button
              variant="primary"
              className="w-full md:w-auto"
            >
              Сохранить изменения
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Имя</h3>
            <p className="text-lg text-gray-800 dark:text-white">{profile?.full_name || "Не указано"}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
            <p className="text-lg text-gray-800 dark:text-white">{profile?.email}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Дата регистрации</h3>
            <p className="text-lg text-gray-800 dark:text-white">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Не указано"}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Последнее обновление</h3>
            <p className="text-lg text-gray-800 dark:text-white">
              {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Не указано"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 