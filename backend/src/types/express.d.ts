// backend/src/types/express.d.ts

// Расширяем глобальное пространство имен Express
declare namespace Express {
  export interface Request {
    user?: {
      id: string | number;
      email?: string;
      role?: string;
      authType: 'supabase' | 'legacy';
      organization_id: number | null;
      location_id: number | null;
      [key: string]: any;
    };
  }
} 