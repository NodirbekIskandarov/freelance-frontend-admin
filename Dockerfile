# syntax=docker/dockerfile:1

# ─── deps ─────────────────────────────────────────────────────────────────────
# Bog'liqliklar alohida qatlamda: package*.json o'zgarmasa, cache ishlatiladi.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── dev ──────────────────────────────────────────────────────────────────────
# Vite dev server. MSW mock'lari faqat shu rejimda ishlaydi (main.tsx: import.meta.env.DEV).
FROM node:22-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8091
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8091"]

# ─── build ────────────────────────────────────────────────────────────────────
# Vite `VITE_*` o'zgaruvchilarni build paytida bundle'ga yozadi —
# shuning uchun ular runtime env emas, build arg sifatida keladi.
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_ENABLE_MOCKS=false
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENABLE_MOCKS=$VITE_ENABLE_MOCKS
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ─── prod ─────────────────────────────────────────────────────────────────────
# Statik build nginx orqali beriladi.
FROM nginx:1.27-alpine AS prod
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8091
CMD ["nginx", "-g", "daemon off;"]
