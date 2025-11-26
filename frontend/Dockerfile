# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy necessary files
COPY frontend/package.json ./
COPY package-lock.json ../
COPY common ../common
COPY .env.development ../.env.development

# Install dependencies
RUN npm install

COPY frontend ./
# Build frontend (in dev mode for now. It will use .env.development)
RUN npm run build -- --mode development

# --- Production Stage ---
FROM nginx:alpine

# Copy built frontend assets to nginx
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]