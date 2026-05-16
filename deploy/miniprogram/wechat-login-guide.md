# 微信登录对接指南

## 账号体系设计（修正后）

当前项目使用**邮箱+密码+JWT**认证。微信登录作为**快捷绑定方式**，不替代邮箱体系。

### 用户登录流程

1. 用户可通过**邮箱+密码**注册/登录（现有流程不变）
2. 已登录用户可在"设置"中**绑定微信**（小程序扫码或网页扫码）
3. 绑定后，用户可通过**微信扫码**快速登录
4. UnionID 作为关联标识，映射到已有邮箱账号

## 数据库改动

`teachers` 表新增字段：
```sql
ALTER TABLE teachers ADD COLUMN unionid TEXT;
ALTER TABLE teachers ADD COLUMN wechat_nickname TEXT;
ALTER TABLE teachers ADD COLUMN login_type TEXT NOT NULL DEFAULT 'email';
-- login_type: 'email' | 'wechat' | 'both'
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_unionid ON teachers(unionid);
```

## 后端 API 新增接口

### POST /api/auth/wechat-bind
已登录用户绑定微信

```
Request:
  Header: Authorization: Bearer <token>
  Body: { "code": "wx.login()返回的code" }

Response:
  { "success": true, "wechat_nickname": "用户昵称" }
```

### POST /api/auth/wechat-login-web
网站端微信扫码登录

```
Request:
  Body: { "code": "微信OAuth回调返回的code" }

Response:
  { "token": "jwt_token", "teacher": {...} }
```

### POST /api/auth/wechat-login-mini
小程序端微信登录

```
Request:
  Body: { "code": "wx.login()返回的code" }

Response:
  { "token": "jwt_token", "teacher": {...}, "is_new_user": false }
```

## 后端逻辑

1. 收到微信 code → 调用微信接口换取 openid + unionid
2. `https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code`
3. 根据 unionid 查找已有账号
4. 找到 → 生成 JWT，返回 token
5. 未找到 → 创建新账号（用 unionid 登录），引导用户绑定邮箱

## 所需微信平台

| 平台 | 用途 | 认证费用 |
|------|------|---------|
| 微信开放平台 | 获取 UnionID（网站端+小程序端统一） | 300元/年 |
| 微信小程序 | 小程序端运行 | 免费 |
| 微信公众平台 | 网站端扫码登录（可选，可用开放平台替代） | 300元/年 |

## 前端改动

### 网站端
- 登录页新增"微信扫码登录"按钮
- 设置页新增"绑定微信"按钮
- 使用开放平台 JS SDK 或生成二维码

### 小程序端
- `app.js` 中调用 `wx.login()` 获取 code
- 将 code 发送到后端 `/api/auth/wechat-login-mini`
- 获取 token 后存储到本地
- 后续 API 请求携带 Bearer token（与网站端一致）
