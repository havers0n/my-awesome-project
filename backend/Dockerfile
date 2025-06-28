# Этап 1: Сборка TypeScript и установка всех зависимостей
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Эта команда скомпилирует ваш TS в JS в папку /app/dist
RUN npm run build

# Этап 2: Создание минималистичного финального образа
FROM node:18-alpine
WORKDIR /app

# Копируем ТОЛЬКО package.json, чтобы команда npm start работала
COPY package.json .

# Копируем node_modules с УЖЕ установленными production-зависимостями из builder'а
COPY --from=builder /app/node_modules ./node_modules

# Копируем скомпилированный код из builder'а
COPY --from=builder /app/dist ./dist

EXPOSE 3000
# Команда "npm start" прочитает "scripts" из package.json и запустит "node dist/app.js"
CMD ["npm", "start"]