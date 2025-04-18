# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 1. 先复制依赖清单和 Prisma 文件
COPY package*.json ./
COPY prisma ./prisma/

# 2. 安装依赖（此时 prisma/schema.prisma 已存在）
RUN npm install

# 3. 生成 Prisma 客户端（如果 package.json 的 postinstall 已包含，可省略此行）
# RUN npx prisma generate

# 4. 复制其他文件并构建
COPY . .
RUN npm run build


# 运行阶段
FROM node:18-alpine AS runner
WORKDIR /app

# 复制必要文件
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制 Prisma 相关文件（精简版）
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 安装 OpenSSL（Prisma 需要）
RUN apk add --no-cache openssl

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]