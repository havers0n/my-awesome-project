# Stage 1: Build TypeScript and install all dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Set environment variable for build stage
ENV NODE_ENV=production

COPY package*.json ./
# Install dependencies. In production mode, devDependencies will not be installed
RUN npm install
COPY . .
# This command will compile your TS to JS in the /app/dist folder
RUN npm run build

# Stage 2: Creating a minimalistic final image
FROM node:20-alpine
WORKDIR /app

# Set environment variable for the final image
ENV NODE_ENV=production

# Copy only the files necessary for startup
COPY package*.json ./

# Copy production dependencies from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
