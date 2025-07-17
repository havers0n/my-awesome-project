// backend/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { logAdminAction } from '../utils/logger';
import { supabaseAdmin } from '../supabaseAdminClient';

// Пример: создание пользователя (заглушка, интегрируйте с вашей реальной логикой)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, organization_id, role, phone, position } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: 'Email, password и роль обязательны' });
      return;
    }
    // 1. Создать пользователя в Supabase
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
    if (error) {
      logAdminAction('create_user_error', {
        adminId: req.user?.id,
        error: error.message,
        email,
        ip: req.ip,
      });
      res.status(400).json({ error: error.message });
      return;
    }
    // 2. Сохранить пользователя в своей БД
    // Важно: пароль в БД хранить только как hash! Здесь для примера — используйте bcrypt в реальном проекте
    const { pool } = require('../db');
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (organization_id, email, password_hash, full_name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
      RETURNING id, email, full_name, role, organization_id, created_at
    `;
    const values = [organization_id || null, email, password_hash, full_name, role];
    const dbResult = await pool.query(insertQuery, values);
    logAdminAction('create_user', {
      adminId: req.user?.id,
      email,
      organization_id,
      role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json({ message: 'Пользователь создан', user: data.user });
  } catch (err: any) {
    logAdminAction('create_user_error', {
      adminId: req.user?.id,
      error: err.message,
      email: req.body.email,
      ip: req.ip,
    });
    res.status(500).json({ error: 'Ошибка создания пользователя' });
  }
};
