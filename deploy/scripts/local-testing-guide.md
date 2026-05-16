# 本地自测指南

## 前提条件

- 服务器已初始化（已运行 `setup-server.sh`）
- 代码已部署，服务已启动
- Nginx 配置使用 `nginx-http.conf`（绑定 127.0.0.1:80）
- **备案未通过，域名不能解析**

## Step-by-Step 操作

### Step 1：修改本机 hosts 文件

**Windows**
1. 以管理员身份打开记事本
2. 打开文件：`C:\Windows\System32\drivers\etc\hosts`
3. 在文件末尾添加一行：
   ```
   <服务器公网IP>  YOUR_DOMAIN.com
   ```
   例如：`123.45.67.89  myclass.app`
4. 保存文件

**Mac**
1. 终端运行：`sudo nano /etc/hosts`
2. 添加一行：`<服务器公网IP>  YOUR_DOMAIN.com`
3. `Ctrl+O` 保存，`Ctrl+X` 退出

### Step 2：验证 hosts 生效

```bash
ping YOUR_DOMAIN.com
# 应该返回服务器公网 IP
```

### Step 3：运行健康检查脚本

在服务器上运行：
```bash
bash /home/ubuntu/class-pet-garden/deploy/scripts/health-check.sh
```

期望输出：所有 7 项检查均显示 `[PASS]`

### Step 4：浏览器访问测试

在本机浏览器访问：`http://YOUR_DOMAIN.com`

期望结果：
- 能看到登录页面
- 能注册新账号
- 能登录并使用所有功能

### Step 5：API 直连测试

```bash
# 健康检查
curl http://YOUR_DOMAIN.com/api/health

# 登录测试
curl -X POST http://YOUR_DOMAIN.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"505694933@qq.com","password":"123456"}'
```

### Step 6：测试完成后恢复 hosts

测试完成后，记得删除或注释掉 hosts 中新增的那一行。

---

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 浏览器无法访问 | Nginx 未启动 | `sudo systemctl restart nginx` |
| API 返回 502 | 后端未启动 | `pm2 restart class-pet-garden` |
| 数据库报错 | DB 文件路径不对 | 检查 `.env` 中 `DB_PATH` 配置 |
| 登录后跳转失败 | 前端 API base URL 配置错误 | 确认 `VITE_API_URL` 环境变量 |
