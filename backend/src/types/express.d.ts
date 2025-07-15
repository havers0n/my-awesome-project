// backend/src/types/express.d.ts

// Расширяем глобальное пространство имен Express
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      // Добавьте другие поля, которые могут быть в объекте user
      // например, email, role, organization_id
      [key: string]: any;
    };
  }
} 