#!/bin/bash
# ============================================================
# 服务器初始化脚本
# 用途：在腾讯云 CVM 首次登录后运行，安装所有依赖
# 使用：sudo bash setup-server.sh
# 注意：需以 root 或 sudo 权限运行
# ============================================================

set -e

echo "========================================"
echo "  我的老师我的班 — 服务器初始化"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# ---- 系统更新 ----
echo "[1/5] 系统包更新..."
yum update -y

# ---- Node.js (LTS) ----
echo "[2/5] 安装 Node.js 22 LTS..."
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
yum install -y nodejs
node --version
npm --version

# ---- Nginx ----
echo "[3/5] 安装 Nginx..."
yum install -y nginx
systemctl enable nginx
nginx -v

# ---- PM2 ----
echo "[4/5] 安装 PM2 进程管理器..."
npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 --version

# ---- Git ----
echo "[5/5] 确认 Git 可用..."
yum install -y git
git --version

# ---- 创建目录 ----
echo ""
echo "创建应用目录..."
mkdir -p /home/ubuntu/class-pet-garden/server/data
mkdir -p /home/ubuntu/logs
chown -R ubuntu:ubuntu /home/ubuntu/class-pet-garden
chown -R ubuntu:ubuntu /home/ubuntu/logs

# ---- 防火墙 ----
echo ""
echo "配置安全组建议（请在腾讯云控制台操作）："
echo "  - 22 (SSH)：限制为您的 IP"
echo "  - 80 (HTTP)：备案通过后开放"
echo "  - 443 (HTTPS)：备案通过后开放"
echo ""
echo "========================================"
echo "  基础环境安装完成"
echo "========================================"
echo ""
echo "下一步："
echo "  1. 配置 .env.production 环境变量"
echo "  2. 上传项目代码（git clone 或 scp）"
echo "  3. npm install（安装依赖）"
echo "  4. npm run build:client（构建前端）"
echo "  5. 复制 Nginx 配置：cp deploy/nginx/nginx-http.conf /etc/nginx/conf.d/class-pet-garden.conf"
echo "  6. 启动服务：pm2 start deploy/pm2/ecosystem.config.js"
echo "  7. 运行健康检查：bash deploy/scripts/health-check.sh"
