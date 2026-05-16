#!/bin/bash
# ============================================================
# Let's Encrypt SSL 证书申请脚本
# 用途：备案通过后申请免费 SSL 证书
# 使用：sudo bash certbot-init.sh
# ============================================================

set -e

# ---- 配置变量（请修改）----
DOMAIN="${1:-YOUR_DOMAIN.com}"
EMAIL="${2:-505694933@qq.com}"

if [ "$DOMAIN" = "YOUR_DOMAIN.com" ]; then
  echo "用法: sudo bash certbot-init.sh <你的域名> [邮箱]"
  echo "示例: sudo bash certbot-init.sh myclass.app 505694933@qq.com"
  exit 1
fi

echo "========================================"
echo "  SSL 证书申请"
echo "  域名: $DOMAIN"
echo "  邮箱: $EMAIL"
echo "========================================"
echo ""

# ---- 1. 安装 Certbot ----
if ! command -v certbot &>/dev/null; then
  echo "[1/4] 安装 Certbot..."
  yum install -y epel-release
  yum install -y certbot
else
  echo "[1/4] Certbot 已安装"
fi

# ---- 2. 创建验证目录 ----
mkdir -p /var/www/certbot

# ---- 3. 申请证书（standalone 模式）----
echo "[2/4] 申请证书..."
systemctl stop nginx 2>/dev/null || true

certbot certonly --standalone \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --non-interactive

systemctl start nginx

echo "[3/4] 证书申请完成"
ls -la /etc/letsencrypt/live/"$DOMAIN"/

# ---- 4. 设置自动续期 ----
echo "[4/4] 配置自动续期..."
# certbot 自动续期已通过 systemd timer 设置
# 可以通过以下命令测试自动续期：
# certbot renew --dry-run

echo ""
echo "========================================"
echo "  SSL 证书已就绪"
echo "========================================"
echo ""
echo "  证书路径：/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  私钥路径：/etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
echo "  下一步：将证书路径填入 Nginx HTTPS 配置"
echo "  cp deploy/nginx/nginx-https.conf /etc/nginx/conf.d/class-pet-garden.conf"
echo "  sed -i 's/YOUR_DOMAIN.com/$DOMAIN/g' /etc/nginx/conf.d/class-pet-garden.conf"
echo "  nginx -t && systemctl reload nginx"
