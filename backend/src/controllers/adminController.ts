// backend/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { logAdminAction } from '../utils/logger';
import { supabaseAdmin } from '../supabaseAdminClient';

// Функция для проверки уникальности email
export const checkEmail = async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
      throw error;
    }
    
    // Если data не null, значит email найден и он не уникален
    res.json({ unique: data === null });

  } catch (err: any) {
    logAdminAction('check_email_error', { adminId: req.user?.id, error: err.message, email });
    res.status(500).json({ error: 'Failed to check email uniqueness' });
  }
};


export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, organization_id, role, phone, position } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password и роль обязательны' });
    }
    
    // 1. Создать пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Сразу подтверждаем email
      user_metadata: {
        full_name,
        // Мы не будем хранить organization_id и role в user_metadata,
        // так как для этого есть наша таблица `users`.
      },
    });

    if (authError) {
      logAdminAction('create_user_auth_error', { adminId: req.user?.id, error: authError.message, email });
      // Возвращаем более понятную ошибку на фронтенд
      return res.status(400).json({ error: authError.message.includes('unique constraint') ? 'Пользователь с таким email уже существует.' : authError.message });
    }

    if (!authData.user) {
        throw new Error("Supabase returned no user data.");
    }

    const newUser = authData.user;

    // 2. Сохранить пользователя в нашей публичной таблице `users`
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.id, // Используем ID из Supabase Auth
        organization_id: organization_id || null,
        full_name: full_name,
        role: role,
        phone: phone,
        position: position,
      })
      .select()
      .single();

    if (dbError) {
      // Если не удалось вставить пользователя в нашу таблицу, нужно откатить создание в Auth
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);
      logAdminAction('create_user_db_error', { adminId: req.user?.id, error: dbError.message, email });
      return res.status(500).json({ error: 'Failed to save user profile', details: dbError.message });
    }

    logAdminAction('create_user_success', { adminId: req.user?.id, email, userId: newUser.id });
    res.status(201).json({ message: 'Пользователь успешно создан', user: dbUser });

  } catch (err: any) {
    logAdminAction('create_user_unhandled_error', { adminId: req.user?.id, error: err.message, email: req.body.email });
    res.status(500).json({ error: 'Ошибка создания пользователя' });
  }
};
