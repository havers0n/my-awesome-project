import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // <-- ШАГ 1: РАСКОММЕНТИРУЙТЕ ИЛИ ДОБАВЬТЕ ЭТОТ ИМПОРТ

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    // viteStaticCopy удалён — Vite сам копирует public/  <-- ЭТОТ КОММЕНТАРИЙ БОЛЬШЕ НЕ АКТУАЛЕН
    // ШАГ 2: ДОБАВЬТЕ ЭТОТ БЛОК ОБРАТНО
    viteStaticCopy({
      targets: [
        {
          src: 'public/images',
          dest: '' 
        }
      ]
    })
  ]
})