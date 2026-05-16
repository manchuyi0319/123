import crypto from 'crypto';
import { teacherRepo } from '../repositories/teacher.repo';
import { signToken } from '../utils/jwt';
import { getWebAccessToken, getWebUserInfo, getMiniSession } from '../utils/wechat';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import type { AuthResponse } from 'shared';

function getOpenAppConfig() {
  return {
    appId: process.env.WECHAT_OPEN_APP_ID || '',
    appSecret: process.env.WECHAT_OPEN_APP_SECRET || '',
  };
}

function getMiniConfig() {
  return {
    appId: process.env.WECHAT_MINI_APP_ID || '',
    appSecret: process.env.WECHAT_MINI_APP_SECRET || '',
  };
}

export const wechatAuthService = {
  // 网站端微信扫码登录
  async webLogin(code: string): Promise<AuthResponse> {
    const { appId, appSecret } = getOpenAppConfig();
    if (!appId || !appSecret) {
      throw new Error('微信开放平台未配置');
    }

    const tokenData = await getWebAccessToken(code, appId, appSecret);
    const unionid = tokenData.unionid || tokenData.openid;
    if (!unionid) {
      throw new Error('无法获取微信用户标识');
    }

    // 查找已绑定微信的账号
    const existing = teacherRepo.findByUnionid(unionid);
    if (existing) {
      const token = signToken(existing.id, existing.role);
      return { token, teacher: existing };
    }

    // 获取微信用户信息
    const userInfo = await getWebUserInfo(tokenData.access_token!, tokenData.openid!);

    // 创建新账号（微信登录，未绑定邮箱）
    const id = crypto.randomUUID();
    const nickname = userInfo.nickname || `微信用户${Date.now().toString(36)}`;
    const teacher = teacherRepo.createWechatUser(id, unionid, nickname, userInfo.unionid || null);
    const token = signToken(id, teacher.role);
    return { token, teacher };
  },

  // 小程序端微信登录
  async miniLogin(code: string): Promise<AuthResponse & { isNewUser: boolean }> {
    const { appId, appSecret } = getMiniConfig();
    if (!appId || !appSecret) {
      throw new Error('微信小程序未配置');
    }

    const sessionData = await getMiniSession(code, appId, appSecret);
    const unionid = sessionData.unionid || sessionData.openid;
    if (!unionid) {
      throw new Error('无法获取微信用户标识');
    }

    const existing = teacherRepo.findByUnionid(unionid);
    if (existing) {
      const token = signToken(existing.id, existing.role);
      return { token, teacher: existing, isNewUser: false };
    }

    // 小程序首次登录，创建新账号
    const id = crypto.randomUUID();
    const teacher = teacherRepo.createWechatUser(id, unionid, '微信用户', sessionData.unionid || null);
    const token = signToken(id, teacher.role);
    return { token, teacher, isNewUser: true };
  },

  // 已登录用户绑定微信
  bindWechat(teacherId: string, unionid: string, nickname: string): { success: boolean } {
    const existing = teacherRepo.findByUnionid(unionid);
    if (existing && existing.id !== teacherId) {
      throw new ValidationError('该微信已绑定其他账号');
    }

    teacherRepo.updateWechatInfo(teacherId, unionid, nickname);
    return { success: true };
  },

  // 检查微信绑定状态
  getWechatStatus(teacherId: string): { bound: boolean; nickname?: string } {
    const teacher = teacherRepo.findById(teacherId);
    if (!teacher) throw new UnauthorizedError('用户不存在');
    if (!teacher.unionid) return { bound: false };
    return { bound: true, nickname: teacher.wechat_nickname || undefined };
  },
};
