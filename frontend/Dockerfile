# Этап 1: Сборка React-приложения
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build


# Этап 2: Подача статики через легкий веб-сервер Nginx
FROM nginx:stable-alpine

# Копируем результат сборки из предыдущей стадии
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем наш кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ===> ВОТ ОНА, ФИНАЛЬНАЯ ИСПРАВЛЯЮЩАЯ СТРОКА <===
# Меняем владельца всех файлов на пользователя, от имени которого работает nginx
RUN chown -R nginx:nginx /usr/share/nginx/html

# Открываем порт и запускаем Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]