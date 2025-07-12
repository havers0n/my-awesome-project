# Supabase: фиксация изменений по созданию пользователей (2025-07-05)

## Что реализовано
- Создание пользователя через Supabase Admin API (`supabaseAdmin.auth.admin.createUser`) с передачей email, пароля, роли, организации, телефона, должности.
- Пользователь сразу подтверждён (`email_confirm: true`).
- Все дополнительные поля сохраняются в user_metadata.
- После создания пользователь также сохраняется в собственной таблице users (Postgres) с хешированным паролем.
- Все действия логируются в файл `logs/admin-actions.log`.

## Пример кода (контроллер)
```ts
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name,
    organization_id,
    role,
    phone,
    position,
  },
});
```

## Важно
- Для работы требуется переменные окружения `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`.
- Для безопасности пароли в БД хешируются через bcrypt.
- Вся логика вынесена в контроллер `adminController.ts` и вызывается через POST `/admin/users`.

## Следующие шаги
- Добавить удаление и обновление пользователя с синхронизацией в Supabase и Postgres.
- Добавить проверки уникальности email на уровне Supabase и БД.
- Провести тестирование через Postman/фронтенд.
