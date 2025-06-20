// src/app.ts
import path from 'path';
import dotenv from 'dotenv';

// --- НАЧАЛО БЛОКА ДЛЯ ЯВНОЙ ЗАГРУЗКИ .ENV И ОТЛАДКИ ---
// Формируем абсолютный путь к .env файлу в корне проекта
const envPath = path.resolve(__dirname, '../.env'); // Если src/app.ts, то .env на один уровень выше
console.log(`Attempting to load .env file from: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully.'); // Можно убрать result.parsed, если там много чувствительных данных
  // console.log('Parsed variables from .env:', result.parsed); // Раскомментируйте, если хотите видеть, что именно загрузилось
}

// Теперь проверяем, что попало в process.env СРАЗУ ПОСЛЕ загрузки
console.log('DB_HOST directly after dotenv.config attempt:', process.env.DB_HOST);
console.log('DB_PORT directly after dotenv.config attempt:', process.env.DB_PORT);
console.log('DB_NAME directly after dotenv.config attempt:', process.env.DB_NAME);
console.log('DB_USER directly after dotenv.config attempt:', process.env.DB_USER);
console.log('DB_PASSWORD exists directly after dotenv.config attempt?:', !!process.env.DB_PASSWORD);
console.log('JWT_SECRET exists directly after dotenv.config attempt?:', !!process.env.JWT_SECRET);
// --- КОНЕЦ БЛОКА ДЛЯ ЯВНОЙ ЗАГРУЗКИ .ENV И ОТЛАДКИ ---

// --- Далее ваши обычные импорты ---
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import monetizationRoutes from './routes/monetizationRoutes';
import { authenticateSupabaseToken } from './middleware/supabaseAuthMiddleware';

// НЕ НУЖНО: import './config'; (если это было для console.log в config.ts, они сработают при импорте config.ts в других файлах)

// НЕ НУЖНО: dotenv.config(); // Этот вызов УЖЕ НЕ НУЖЕН ЗДЕСЬ, он был выше с явным путем

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/auth', authRoutes);
app.use('/monetization', authenticateSupabaseToken, monetizationRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error Handler Caught:', err.stack); // Добавил префикс для ясности
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000; // PORT тоже может быть в .env
console.log('PORT from process.env:', process.env.PORT); // Проверим и его

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;