# 微信小程序合法域名配置清单

## request 合法域名（每月最多修改 5 次）

```
https://YOUR_DOMAIN.com
```

> 注意：必须是 HTTPS，不能带端口号，不能是 IP 地址。

## socket 合法域名（WebSocket）

```
wss://YOUR_DOMAIN.com
```

## uploadFile 合法域名

```
https://YOUR_DOMAIN.com
```

## downloadFile 合法域名

```
https://YOUR_DOMAIN.com
```

## 配置位置

微信公众平台 → 开发 → 开发管理 → 开发设置 → 服务器域名

## 注意事项

1. 备案通过前可以先填写，但域名必须已备案
2. 修改后需重新编译小程序才能生效
3. 开发版/体验版可跳过域名校验（需在开发者工具中关闭校验）
4. 正式版强制校验合法域名
