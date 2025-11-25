# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json and package-lock.json for workspace install
COPY package.json package-lock.json ./
COPY frontend ./frontend
COPY common ./common
COPY .env.development .env.development

# Install dependencies for all workspaces
RUN npm install

# Build frontend (Vite)
RUN npm run build:frontend

# --- Production Stage ---
FROM nginx:alpine

# Copy built frontend assets to nginx
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]