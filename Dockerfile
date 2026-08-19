# syntax=docker/dockerfile:1

# ─── deps ─────────────────────────────────────────────────────────────────────
# Bog'liqliklar alohida qatlamda: package*.json o'zgarmasa, cache ishlatiladi.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── dev ──────────────────────────────────────────────────────────────────────
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
# Nisbiy manzil: so'rov admin domeniga ketadi va nginx uni backendga
# uzatadi (docker/default.conf.template). Shunda CORS umuman kerak emas.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ─── prod ─────────────────────────────────────────────────────────────────────
# Statik build nginx orqali beriladi.
FROM nginx:1.27-alpine AS prod
# `/etc/nginx/templates/*.template` — nginx image'ining o'z mexanizmi:
# konteyner ishga tushganda envsubst bilan `/etc/nginx/conf.d/` ga
# yoziladi. Shu sababli backend manzili build'ga qotib qolmaydi.
#
# `DOLLAR` — nginx'ning o'z `$uri` kabi o'zgaruvchilarini envsubst
# yeb qo'ymasligi uchun; shablonda ular `${DOLLAR}uri` ko'rinishida.
ENV API_UPSTREAM=https://api.yopamiz.uz
ENV DOLLAR=$
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8091
CMD ["nginx", "-g", "daemon off;"]
