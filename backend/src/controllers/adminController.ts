// backend/src/controllers/adminController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import { supabaseAdmin } from '../supabaseClient';

// Validation schema for user creation
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().optional().default(''),
  organization_id: z.number().optional(),
  role: z.string().optional().default('EMPLOYEE'),
  phone: z.string().optional(),
  position: z.string().optional()
});

// Function to check email uniqueness
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Email check error:', error.message);
      res.status(500).json({ error: 'Database error checking email', details: error.message });
      return;
    }

    const isUnique = !data; // Email is unique if no data found
    res.json({ isUnique });
  } catch (err: any) {
    console.error('Email check unhandled error:', err.message);
    res.status(500).json({ error: 'Failed to check email uniqueness' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    console.log('=== Creating new user ===');
    const validatedData = createUserSchema.parse(req.body);
    console.log('Validated data:', { ...validatedData, password: '[HIDDEN]' });

    const { email, password, full_name, organization_id, role, phone, position } = validatedData;

    // Шаг 1: Создаем пользователя в Supabase Auth
    console.log('Step 1: Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '', // Можно хранить здесь для быстрого доступа, но основной источник - public.users
      }
    });

    if (authError || !authData?.user) {
      console.error('Supabase Auth error:', authError);
      return res.status(400).json({ 
        error: 'Failed to create authentication account',
        details: authError?.message || 'Unknown auth error' 
      });
    }

    const userId = authData.user.id;
    console.log('Step 1 successful. User created in Supabase Auth with ID:', userId);

    // Шаг 2: Создаем запись в таблице public.users
    console.log('Step 2: Creating user profile in public.users table...');
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: userId, // UUID из auth.users
        email,
        full_name: full_name || null,
        role: role || 'EMPLOYEE',
        organization_id: organization_id || null,
        // phone: phone || null, // Убрали, так как колонка отсутствует
        // position: position || null, // Убрали, так как колонка отсутствует
        is_active: true,
      }])
      .select()
      .single();

    // Обработка ошибок для Шага 2
    if (userError) {
      console.error('Database error creating user profile:', userError);
      
      // Откат: удаляем пользователя из Auth, если не удалось создать профиль
      console.log('Rolling back - deleting auth user...');
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return res.status(500).json({ 
        error: 'Failed to create user profile in public.users table.',
        details: userError.message 
      });
    }

    console.log('Step 2 successful. User profile created:', userData);

    // Финальный успешный ответ
    res.status(201).json({
      success: true,
      message: 'User created successfully in both Auth and database.',
      user: userData
    });

    console.log('=== User creation process completed successfully ===');

  } catch (error: any) {
    console.error('Error in createUser controller:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
