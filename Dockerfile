# syntax=docker/dockerfile:1

# ---------- Etapa 1: build ----------
FROM node:24-slim AS builder
WORKDIR /app

# OpenSSL es requerido por Prisma para conectarse a PostgreSQL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# ---------- Etapa 2: imagen final, más liviana ----------
FROM node:24-slim AS production
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Usuario sin privilegios de root — buena práctica de seguridad
RUN groupadd -r nodejs && useradd -r -g nodejs nodeuser

COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodeuser:nodejs /app/src ./src
COPY --from=builder --chown=nodeuser:nodejs /app/package.json ./package.json

USER nodeuser

EXPOSE 3000

CMD ["node", "src/index.js"]