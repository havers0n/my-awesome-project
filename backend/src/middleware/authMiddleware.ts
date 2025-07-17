import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const verifySupabaseJWT = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    console.log('\n\n--- [START] verifySupabaseJWT ---');

    try {
        const authHeader = req.headers['authorization'];
        console.log(`[1] Auth Header: |${authHeader}|`);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[DEBUG] No Bearer token found. Passing to next middleware.');
            return next();
        }

        const token = authHeader.split(' ')[1];
        console.log(`[2] Extracted Token (first 30 chars): |${token.substring(0, 30)}...|`);

        console.log('[3] Attempting to get user with Supabase client...');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            console.error('[4] !!! SUPABASE GETUSER FAILED !!!');
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            // НЕ отправляем 401, а просто логируем и идем дальше для теста
        } else if (!user) {
            console.error('[4] !!! SUPABASE GETUSER RETURNED NO USER !!!');
        } else {
            console.log('[4] SUPABASE GETUSER SUCCESSFUL!');
            console.log('User found:', user.email);
            req.user = user; // Присваиваем пользователя для последующих обработчиков
        }
        
        console.log('[5] Passing control to the next handler regardless of auth outcome...');
        next();

    } catch (e: any) {
        console.error('[FATAL] A critical error occurred inside verifySupabaseJWT:', e.message);
        next(e); // Передаем ошибку в глобальный обработчик
    }
}; 