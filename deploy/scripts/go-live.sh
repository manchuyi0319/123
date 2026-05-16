#!/bin/bash
# ============================================================
# 备案通过后 — 一键上线脚本
# 用途：申请 SSL 证书、更新 Nginx、重启服务
# 使用前：替换 YOUR_DOMAIN.com 为正式域名
# 使用：sudo bash go-live.sh
# ============================================================

set -e

# ---- 配置变量（请修改为你的实际域名）----
DOMAIN="YOUR_DOMAIN.com"
EMAIL="505694933@qq.com"
NGINX_CONF="/etc/nginx/conf.d/class-pet-garden.conf"
DEPLOY_DIR="/home/ubuntu/class-pet-garden/deploy"

echo "========================================"
echo "  我的老师我的班 — 正式上线"
echo "  域名: $DOMAIN"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# ---- 1. 申请 SSL 证书 ----
echo "[1/5] 申请 SSL 证书 (Let's Encrypt)..."
if command -v certbot &>/dev/null; then
    echo "  Certbot 已安装"
else
    echo "  安装 Certbot..."
    yum install -y certbot python3-certbot-nginx
fi

# 停止 nginx 以释放 80 端口（certbot standalone 模式）
systemctl stop nginx
certbot certonly --standalone \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive
systemctl start nginx
echo "  SSL 证书申请完成"

# ---- 2. 更新 Nginx 配置 ----
echo "[2/5] 更新 Nginx 配置（HTTP → HTTPS）..."
cp "$DEPLOY_DIR/nginx/nginx-https.conf" "$NGINX_CONF"
sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" "$NGINX_CONF"
nginx -t && systemctl reload nginx
echo "  Nginx 配置已更新为重定向 HTTPS"

# ---- 3. 开放防火墙 ----
echo "[3/5] 开放 80/443 端口..."
firewall-cmd --permanent --add-service=http 2>/dev/null || true
firewall-cmd --permanent --add-service=https 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
echo "  端口已开放（或请在腾讯云控制台配置安全组）"

# ---- 4. 重启服务 ----
echo "[4/5] 重启应用服务..."
pm2 restart class-pet-garden
echo "  服务已重启"

# ---- 5. 验证 ----
echo "[5/5] 验证 HTTPS 访问..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "  [PASS] HTTPS 访问正常 (HTTP $HTTP_CODE)"
else
    echo "  [WARN] HTTPS 返回 $HTTP_CODE，请检查 DNS 解析和防火墙"
fi

echo ""
echo "========================================"
echo "  上线完成！"
echo "========================================"
echo ""
echo "  网站地址: https://$DOMAIN"
echo "  检查清单:"
echo "  □ 浏览器访问网站正常"
echo "  □ 微信小程序服务器域名已更新为 https://$DOMAIN"
echo "  □ 提交小程序审核"
