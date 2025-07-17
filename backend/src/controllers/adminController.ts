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

    // 1. First, create user in Supabase Auth
    console.log('Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        role: role || 'EMPLOYEE'
      }
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return res.status(400).json({ 
        error: 'Failed to create authentication account',
        details: authError.message 
      });
    }

    if (!authData?.user) {
      console.error('No user data returned from Supabase Auth');
      return res.status(500).json({ 
        error: 'Authentication account created but no user data returned' 
      });
    }

    const userId = authData.user.id;
    console.log('User created in Supabase Auth with ID:', userId);

    // 2. Then, create user profile in users table
    console.log('Creating user profile in database...');
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: userId, // Use the Auth user ID
        email,
        full_name,
        role: role || 'EMPLOYEE',
        organization_id: organization_id || null,
        phone: phone || null,
        position: position || null,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (userError) {
      console.error('Database error creating user profile:', userError);
      
      // Rollback: Delete the auth user if profile creation failed
      console.log('Rolling back - deleting auth user...');
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return res.status(500).json({ 
        error: 'Failed to create user profile',
        details: userError.message 
      });
    }

    console.log('User profile created successfully:', userData);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        full_name,
        role: role || 'EMPLOYEE',
        organization_id: organization_id || null,
        is_active: true
      }
    });

    console.log('=== User creation completed successfully ===');

  } catch (error: any) {
    console.error('Error creating user:', error);
    
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
