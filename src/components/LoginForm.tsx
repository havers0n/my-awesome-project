
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('aleshkatokareff@yandex.ru');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      if (result.error === 'Invalid credentials') {
        setError('Неверное имя пользователя или пароль');
      } else {
        setError(result.error || 'Произошла ошибка входа');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">a</span>
            </div>
            <span className="text-2xl font-semibold text-foreground tracking-wider">éza</span>
          </div>
        </div>

        {/* Форма входа */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-card">
          <h1 className="text-2xl font-semibold text-center text-foreground mb-8">
            Вход в aéza
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="flex justify-center space-x-4 mt-6 text-sm">
            <button className="text-muted-foreground hover:text-foreground">
              Создать аккаунт
            </button>
            <span className="text-muted-foreground">•</span>
            <button className="text-muted-foreground hover:text-foreground">
              Забыли пароль?
            </button>
          </div>
        </div>

        {/* Нижние ссылки */}
        <div className="flex justify-center space-x-6 mt-8 text-sm text-muted-foreground">
          <button className="hover:text-foreground">
            Условия использования
          </button>
          <button className="hover:text-foreground">
            Политика конфиденциальности
          </button>
        </div>
      </div>
    </div>
  );
}
