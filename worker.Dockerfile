# worker.Dockerfile
FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend ./

CMD ["node", "src/worker.js"]

