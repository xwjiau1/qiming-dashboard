#!/bin/bash
# 部署验证脚本
# 用法: bash deploy-verify.sh

BASE_URL=${BASE_URL:-http://localhost:3001}

echo "=== 1. 健康检查 ==="
curl -s "$BASE_URL/api/health" | jq .

echo -e "\n=== 2. API 数据检查 ==="
curl -s "$BASE_URL/api/dashboard" | jq '.data.kpi'

echo -e "\n=== 3. SPA 内容类型 ==="
curl -sI "$BASE_URL/projects" | grep -i content-type

echo -e "\n=== 4. HTML JS Hash ==="
curl -s "$BASE_URL/" | grep -o 'src="/assets/[^"]*"'

echo -e "\n=== 5. 服务状态 ==="
ps aux | grep 'tsx src/backend/index.ts' | grep -v grep | head -2

echo -e "\n=== 6. 检查错误日志 ==="
tail -5 /tmp/company-platform.log

echo -e "\n✅ 验证完成"
