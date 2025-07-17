import { Request, Response } from 'express';
import { supabaseAdmin } from '../supabaseClient';

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    if (!supabaseAdmin) {
      res.status(500).json({ error: 'Supabase admin client not initialized' });
      return;
    }
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ message: 'Password reset email sent', data });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
    return;
  }
};

export const getProfile = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.status(200).json(req.user);
  return;
}; 