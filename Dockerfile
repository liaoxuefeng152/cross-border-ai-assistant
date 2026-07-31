# ============================================================
# 龙掌柜 AI 助手 - Dockerfile
# 多阶段构建：依赖安装 → 构建 → 生产镜像（含 Playwright）
# ============================================================

# ---- Stage 1: 依赖安装 ----
FROM node:20-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 先复制依赖描述文件，利用 Docker 缓存层
COPY package.json pnpm-lock.yaml* .npmrc* ./

# 安装生产依赖
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# ---- Stage 2: 构建 ----
FROM node:20-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制源码和配置
COPY package.json pnpm-lock.yaml* .npmrc* ./
COPY tsconfig.json next.config.ts ./
COPY src/ src/
COPY public/ public/
COPY assets/ assets/
COPY scripts/ scripts/

# 安装全部依赖（含 devDependencies）
RUN pnpm install --frozen-lockfile

# 构建 Next.js
RUN pnpm next build

# 打包 server.ts 为 CJS
RUN pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

# ---- Stage 3: 生产运行 ----
FROM node:20-slim AS runner

# 安装基础工具
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 从 deps 阶段复制生产依赖（含 playwright）
COPY --from=deps /app/node_modules ./node_modules

# 从 builder 阶段复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# 安装 Playwright Chromium 浏览器及其系统依赖（npx 自带）
RUN npx playwright install --with-deps chromium

# 创建非 root 用户运行
RUN groupadd -r appuser && useradd -r -g appuser -G audio,video appuser \
    && mkdir -p /home/appuser && chown -R appuser:appuser /home/appuser \
    && chown -R appuser:appuser /app

USER appuser

# 暴露 5000 端口
EXPOSE 5000

ENV NODE_ENV=production
ENV COZE_PROJECT_ENV=PROD
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
