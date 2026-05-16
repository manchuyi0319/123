// 微信 API 调用工具
// 支持：网站扫码登录（OAuth 2.0）+ 小程序登录（wx.login）

interface WechatTokenResponse {
  access_token?: string;
  openid?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatUserInfo {
  openid: string;
  unionid?: string;
  nickname?: string;
  headimgurl?: string;
}

const WECHAT_API = 'https://api.weixin.qq.com';

// 网站扫码登录：用 code 换 access_token + openid + unionid
export async function getWebAccessToken(
  code: string,
  appId: string,
  appSecret: string,
): Promise<WechatTokenResponse> {
  const url = `${WECHAT_API}/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;
  const res = await fetch(url);
  const data: WechatTokenResponse = await res.json();
  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg || '未知错误'}`);
  }
  return data;
}

// 获取微信用户信息（网站端）
export async function getWebUserInfo(accessToken: string, openid: string): Promise<WechatUserInfo> {
  const url = `${WECHAT_API}/sns/userinfo?access_token=${accessToken}&openid=${openid}`;
  const res = await fetch(url);
  return res.json();
}

// 小程序登录：用 code 换 openid + unionid
export async function getMiniSession(
  code: string,
  appId: string,
  appSecret: string,
): Promise<WechatTokenResponse> {
  const url = `${WECHAT_API}/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
  const res = await fetch(url);
  const data: WechatTokenResponse = await res.json();
  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg || '未知错误'}`);
  }
  return data;
}

// 判断 UnionID 是否可用（需开放平台绑定）
export function isUnionIdAvailable(): boolean {
  return !!(process.env.WECHAT_OPEN_APP_ID && process.env.WECHAT_OPEN_APP_SECRET);
}
