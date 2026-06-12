#!/bin/bash
# 启明科技管理平台 启动脚本
# 用法: bash start.sh

set -e

echo "[启动] 启明科技管理平台..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
  echo "[错误] 未安装 Node.js，请先安装 Node.js 20.x 或更高版本"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "[错误] Node.js 版本过低，需要 20.x 或更高版本，当前版本: $(node -v)"
  exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
  echo "[安装] 正在安装依赖..."
  npm install
  cd src/frontend && npm install && cd ../..
fi

# 检查前端构建产物
if [ ! -d "dist/public" ] || [ ! -f "dist/public/index.html" ]; then
  echo "[构建] 正在构建前端..."
  npm run build:frontend
fi

# 检查数据库目录
if [ ! -d "data" ]; then
  echo "[初始化] 创建数据目录..."
  mkdir -p data
fi

# 启动服务
echo "[启动] 服务将运行在 http://localhost:${PORT:-3001}"
NODE_ENV=production PORT=${PORT:-3001} npx tsx src/backend/index.ts
