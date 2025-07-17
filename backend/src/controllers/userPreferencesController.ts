import { Request, Response } from 'express';
import { supabaseAdmin } from '../supabaseClient';

interface SidebarPreferences {
  order: string[];
  hiddenItems: string[];
}

interface UserPreferences {
  sidebar?: SidebarPreferences;
  theme?: string;
  language?: string;
  [key: string]: any;
}

// Получить настройки пользователя
export const getUserPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ error: 'Failed to fetch preferences' });
      return;
    }

    const preferences = data?.preferences || {};
    res.json({ preferences });
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Сохранить настройки пользователя
export const saveUserPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { preferences } = req.body;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!preferences || typeof preferences !== 'object') {
      res.status(400).json({ error: 'Invalid preferences data' });
      return;
    }

    // Проверяем, существуют ли уже настройки для этого пользователя
    const { data: existingData } = await supabaseAdmin
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingData) {
      // Обновляем существующие настройки
      const { error } = await supabaseAdmin
        .from('user_preferences')
        .update({ 
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
        return;
      }
    } else {
      // Создаем новые настройки
      const { error } = await supabaseAdmin
        .from('user_preferences')
        .insert({
          user_id: userId,
          preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user preferences:', error);
        res.status(500).json({ error: 'Failed to create preferences' });
        return;
      }
    }

    res.json({ success: true, message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error in saveUserPreferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Сохранить настройки сайдбара
export const saveSidebarPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { order, hiddenItems } = req.body;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Получаем текущие настройки
    const { data: currentData } = await supabaseAdmin
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    const currentPreferences = currentData?.preferences || {};
    
    // Обновляем только настройки сайдбара
    const updatedPreferences = {
      ...currentPreferences,
      sidebar: {
        order: order || [],
        hiddenItems: hiddenItems || []
      }
    };

    // Проверяем, существуют ли уже настройки для этого пользователя
    if (currentData) {
      // Обновляем существующие настройки
      const { error } = await supabaseAdmin
        .from('user_preferences')
        .update({ 
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating sidebar preferences:', error);
        res.status(500).json({ error: 'Failed to update sidebar preferences' });
        return;
      }
    } else {
      // Создаем новые настройки
      const { error } = await supabaseAdmin
        .from('user_preferences')
        .insert({
          user_id: userId,
          preferences: updatedPreferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating sidebar preferences:', error);
        res.status(500).json({ error: 'Failed to create sidebar preferences' });
        return;
      }
    }

    res.json({ success: true, message: 'Sidebar preferences saved successfully' });
  } catch (error) {
    console.error('Error in saveSidebarPreferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 