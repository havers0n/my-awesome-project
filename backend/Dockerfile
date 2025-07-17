# Этап 1: Сборка TypeScript и установка всех зависимостей
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Эта команда скомпилирует ваш TS в JS в папку /app/dist

RUN npm run build

# Этап 2: Создание минималистичного финального образа
FROM node:20-alpine
WORKDIR /app

# Копируем только необходимые для запуска файлы
COPY package.json .

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
