/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { supabaseAdmin } from '../supabaseAdminClient';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { fullName, phone, position } = req.body;
    const userId = String(req.user.id); // Ensure userId is always a string

    if (!supabaseAdmin) {
      res.status(500).json({ error: 'Supabase admin client not initialized' });
      return;
    }

    // Update user metadata in Supabase Auth
    const updateData: any = {};
    if (fullName !== undefined) {
      updateData.full_name = fullName;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: updateData }
      );

      if (authError) {
        res.status(400).json({ error: authError.message });
        return;
      }
    }

    // Update additional profile data in profiles table if it exists
    const profileUpdateData: any = {};
    if (phone !== undefined) profileUpdateData.phone = phone;
    if (position !== undefined) profileUpdateData.position = position;
    if (fullName !== undefined) profileUpdateData.full_name = fullName;

    if (Object.keys(profileUpdateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId);

      if (profileError) {
        console.warn('Profile table update failed:', profileError.message);
        // Don't return error here as auth update might have succeeded
      }
    }

    // Return updated user data
    const { data: updatedUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (fetchError) {
      res.status(500).json({ error: 'Failed to fetch updated user data' });
      return;
    }

    res.status(200).json({
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      full_name: updatedUser.user.user_metadata?.full_name || '',
      phone: updatedUser.user.user_metadata?.phone || '',
      position: updatedUser.user.user_metadata?.position || '',
      role: updatedUser.user.user_metadata?.role || 'user',
      organization_id: updatedUser.user.user_metadata?.organization_id || null,
      location_id: updatedUser.user.user_metadata?.location_id || null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}; 