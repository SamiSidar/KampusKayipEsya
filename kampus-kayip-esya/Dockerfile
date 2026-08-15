# ═══════════════════════════════════════════════════
# Frontend — Multi-stage Dockerfile
# Stage 1: Expo web export (static files)
# Stage 2: nginx serve
# ═══════════════════════════════════════════════════

# --- BUILD ---
FROM node:20-alpine AS build

WORKDIR /app

# Bağımlılıkları kopyala ve yükle (cache layer)
COPY package.json package-lock.json ./
RUN npm ci

# Kaynak kodu kopyala
COPY . .

# API URL'i build-time arg olarak al
ARG EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL

# Expo web export — static dosyalar dist/ altına çıkar
RUN npx expo export --platform web

# --- SERVE ---
FROM nginx:alpine

# Özel nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static dosyaları kopyala
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
