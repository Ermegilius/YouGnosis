# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app/backend

COPY backend/package.json ./
COPY package-lock.json ../
COPY common ../common

RUN npm install

COPY backend ./
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /app/backend
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/backend/src/main.js"]