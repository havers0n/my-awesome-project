import { Request } from 'express';

declare global {
  namespace Express {
    export interface User {
      id: string | number;
      email?: string;
      role?: string;
      authType: 'supabase' | 'legacy';
      organization_id: number | null;
      location_id: number | null;
    }
    
    export interface Request {
      user?: User;
    }
  }
} 