#!/bin/bash
# ============================================================
# 健康检查脚本
# 用途：验证服务器部署是否正常
# 使用：bash health-check.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "========================================"
echo "  我的老师我的班 — 健康检查"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

check_pass() { echo -e "  ${GREEN}[PASS]${NC} $1"; }
check_fail() { echo -e "  ${RED}[FAIL]${NC} $1"; }

# 1. Node.js 环境
echo "[1/7] Node.js 环境检查"
if command -v node &>/dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js $NODE_VERSION 已安装"
else
    check_fail "Node.js 未安装或不在 PATH 中"
fi

# 2. Nginx
echo "[2/7] Nginx 状态检查"
if systemctl is-active --quiet nginx 2>/dev/null; then
    check_pass "Nginx 运行中"
elif command -v nginx &>/dev/null; then
    check_fail "Nginx 已安装但未运行"
else
    check_fail "Nginx 未安装"
fi

# 3. PM2
echo "[3/7] PM2 状态检查"
if command -v pm2 &>/dev/null; then
    check_pass "PM2 已安装"
    if pm2 list 2>/dev/null | grep -q "class-pet-garden"; then
        check_pass "  → class-pet-garden 进程运行中"
    else
        check_fail "  → class-pet-garden 进程未在 PM2 中运行"
    fi
else
    check_fail "PM2 未安装"
fi

# 4. API 端口监听
echo "[4/7] 端口监听检查"
if ss -tlnp 2>/dev/null | grep -q ":3001" || netstat -tlnp 2>/dev/null | grep -q ":3001"; then
    check_pass "端口 3001 正在监听"
else
    check_fail "端口 3001 未监听"
fi

# 5. API 健康端点
echo "[5/7] API 健康端点检查"
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/health 2>/dev/null | grep -q "200"; then
    check_pass "API /api/health 返回 200"
else
    check_fail "API /api/health 无法访问"
fi

# 6. 数据库文件
echo "[6/7] 数据库文件检查"
DB_PATH="/home/ubuntu/class-pet-garden/server/data/class-pet-garden.db"
if [ -f "$DB_PATH" ]; then
    DB_SIZE=$(du -h "$DB_PATH" 2>/dev/null | cut -f1)
    check_pass "SQLite 数据库存在 (${DB_SIZE})"
else
    check_fail "数据库文件不存在: $DB_PATH"
fi

# 7. Nginx 测试页（通过 nginx 代理访问）
echo "[7/7] Nginx 代理检查"
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ 2>/dev/null | grep -q "200"; then
    check_pass "Nginx 代理 → 前端正常访问"
else
    check_fail "Nginx 代理 → 前端无法访问"
fi

echo ""
echo "========================================"
echo "  检查完成"
echo "========================================"
