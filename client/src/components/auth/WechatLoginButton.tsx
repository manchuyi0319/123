import { useState } from 'react';
import { apiRequest, setToken } from '../../api/client';

// 微信开放平台 OAuth 2.0 扫码登录
// 需要配置环境变量 VITE_WECHAT_OPEN_APP_ID
export function WechatLoginButton({ onSuccess }: { onSuccess: (teacher: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWechatLogin = () => {
    const appId = import.meta.env.VITE_WECHAT_OPEN_APP_ID;
    if (!appId) {
      setError('微信登录尚未配置');
      return;
    }

    // 生成 state 防 CSRF
    const state = crypto.randomUUID();
    sessionStorage.setItem('wechat_login_state', state);

    const redirectUri = encodeURIComponent(`${window.location.origin}/login/wechat-callback`);
    const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

    // 弹窗扫码
    const width = 480;
    const height = 540;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    window.open(url, 'wechat-login', `width=${width},height=${height},left=${left},top=${top}`);
  };

  // 页面加载时检查是否为微信回调（在回调页中调用）
  const handleCallback = async (code: string, state: string) => {
    setLoading(true);
    setError('');
    try {
      const savedState = sessionStorage.getItem('wechat_login_state');
      if (state !== savedState) {
        throw new Error('登录验证失败，请重试');
      }
      sessionStorage.removeItem('wechat_login_state');

      const res = await apiRequest<{ token: string; teacher: any }>('/auth/wechat/login-web', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setToken(res.token);
      onSuccess(res.teacher);
    } catch (err: any) {
      setError(err.message || '微信登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">或</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleWechatLogin}
        disabled={loading}
        className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .177-.556C23.027 18.48 24 16.82 24 14.98c0-3.59-3.267-6.122-7.062-6.122zm-2.133 2.955c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.845 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
        </svg>
        {loading ? '正在登录...' : '微信扫码登录'}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}

      <p className="mt-2 text-xs text-gray-400 text-center">
        需要微信开放平台账号支持。若未配置，可先使用邮箱登录。
      </p>
    </div>
  );
}

// 导出回调处理函数供回调页面使用
export { WechatLoginButton as default };
