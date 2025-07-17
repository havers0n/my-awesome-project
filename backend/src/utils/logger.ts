// backend/src/utils/logger.ts
import fs from 'fs';
import path from 'path';

const logFilePath = path.resolve(__dirname, '../../logs/admin-actions.log');

export function logAdminAction(action: string, details: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    ...details,
  };
  const line = JSON.stringify(logEntry) + '\n';
  fs.appendFile(logFilePath, line, (err) => {
    if (err) {
      // fallback: log to console
      console.error('Failed to write admin log:', err, logEntry);
    }
  });
}
