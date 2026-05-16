# 我的老师我的班 — 部署指南

## 目录结构

```
deploy/
├── README.md                        # 本文件
├── nginx/
│   ├── nginx-http.conf              # 备案等待期 Nginx 配置（仅 127.0.0.1）
│   └── nginx-https.conf             # 备案通过后 Nginx 配置（正式上线）
├── pm2/
│   └── ecosystem.config.js          # PM2 进程管理配置
├── env/
│   └── .env.production.template     # 生产环境变量模板 → 复制为 .env
├── db/
│   ├── init-sqlite.sql              # [占位] SQLite 增量迁移（当前已有10个迁移）
│   └── init-mysql.sql               # MySQL 建表语句（备用迁移方案）
├── ssl/
│   └── certbot-init.sh              # [待生成] Let's Encrypt 证书申请脚本
├── scripts/
│   ├── setup-server.sh              # 服务器初始化脚本（安装 Node.js/Nginx/PM2）
│   ├── health-check.sh              # 健康检查脚本（部署验证）
│   └── go-live.sh                   # 备案通过后一键上线脚本
├── compliance/
│   ├── facility-description.md      # 项目功能简述（备案用）
│   ├── network-topology.md          # 网络拓扑说明（含端口清单）
│   └── company-info-template.md     # 企业信息填空模板（备案用）
└── miniprogram/
    ├── domain-checklist.md          # 小程序合法域名配置清单
    ├── review-materials.md          # 小程序审核提交材料清单
    └── wechat-login-guide.md        # [待生成] 微信登录对接指南
```

## 部署流程

### 阶段 A：备案等待期

1. **获取服务器 SSH 凭据**（需用户提供）
2. **运行 setup-server.sh** → 安装基础环境
3. **配置 .env.production** → 填写 JWT_SECRET 等
4. **上传代码** → `git clone` 或 `scp`
5. **构建前端** → `npm install && npm run build`
6. **配置 Nginx** → 使用 `nginx-http.conf`（绑定 127.0.0.1）
7. **启动服务** → `pm2 start deploy/pm2/ecosystem.config.js`
8. **运行健康检查** → `bash deploy/scripts/health-check.sh`
9. **本地 hosts 修改** → 指向服务器 IP，内测验证

### 阶段 B：备案通过后

1. **DNS 解析** → 域名 A 记录指向服务器 IP
2. **运行 go-live.sh** → 一键申请 SSL + 更新 Nginx + 开放端口
3. **提交小程序审核** → 使用 `review-materials.md` 的材料
4. **网站正式上线**

## 待用户提供

| 信息 | 用途 | 优先级 |
|------|------|--------|
| 腾讯云 CVM 公网 IP | SSH 连接 | 🔴 高 |
| SSH 用户名/密码或密钥 | 服务器操作 | 🔴 高 |
| 正式域名 | Nginx/SSL | 🔴 高 |
| 微信小程序 AppID | 小程序开发 | 🟡 中 |
| 微信开放平台账号 | UnionID 获取 | 🟡 中 |
| 营业执照信息 | 备案材料 | 🟢 低（阶段后期） |
