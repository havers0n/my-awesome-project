import express, { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import stream from 'stream';
import { getSupabaseUserClient } from '../supabaseUserClient';

const router = express.Router();

// Настройка multer для загрузки файлов в память
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Проверяем, что файл является CSV
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Только CSV файлы разрешены'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB максимум
  }
});

// POST /api/upload-csv - загрузка CSV файла
router.post('/upload-csv', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не был загружен' });
      return;
    }

    const csvData: any[] = [];
    
    // Создаем readable stream из буфера
    const bufferStream = new stream.Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    // Парсим CSV
    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csv())
        .on('data', (data: any) => csvData.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (csvData.length === 0) {
      res.status(400).json({ error: 'CSV файл пуст или содержит некорректные данные' });
      return;
    }

    // Простая валидация данных
    const requiredFields = ['date', 'product', 'sales_amount', 'quantity'];
    const firstRow = csvData[0];
    const hasRequiredFields = requiredFields.every(field => firstRow.hasOwnProperty(field));

    if (!hasRequiredFields) {
      res.status(400).json({ 
        error: 'CSV файл должен содержать обязательные поля: date, product, sales_amount, quantity',
        receivedFields: Object.keys(firstRow)
      });
      return;
    }

    // Здесь можно добавить логику сохранения данных в базу
    // Для демонстрации возвращаем успешный ответ
    res.json({
      success: true,
      message: `Успешно обработан CSV файл с ${csvData.length} записями`,
      data: {
        totalRecords: csvData.length,
        sampleData: csvData.slice(0, 3), // Первые 3 записи для демонстрации
        fields: Object.keys(firstRow)
      }
    });

  } catch (error) {
    console.error('Ошибка при загрузке CSV:', error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: 'Ошибка при обработке CSV файла', details: message });
  }
});

// GET /api/upload-status - проверка статуса загрузки
router.get('/upload-status', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Сервис загрузки CSV файлов доступен',
    supportedFormats: ['CSV'],
    maxFileSize: '10MB'
  });
});

export default router;
