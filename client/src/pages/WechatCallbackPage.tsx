import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest, setToken } from '../api/client';

export function WechatCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTeacherDirect } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('正在处理微信登录...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      setError('未收到微信授权，请返回重试');
      return;
    }

    const savedState = sessionStorage.getItem('wechat_login_state');
    if (state !== savedState) {
      setError('登录验证失败（state不匹配），请重试');
      return;
    }
    sessionStorage.removeItem('wechat_login_state');

    setStatus('正在验证微信身份...');
    apiRequest<{ token: string; teacher: any }>('/auth/wechat/login-web', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        setToken(res.token);
        setTeacherDirect(res.teacher);
        setStatus('登录成功，正在跳转...');
        setTimeout(() => navigate('/', { replace: true }), 500);
      })
      .catch((err) => {
        setError(err.message || '微信登录失败');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-indigo-50">
      <div className="text-center">
        {error ? (
          <div>
            <div className="text-5xl mb-4">😕</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              返回登录
            </button>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-4 animate-bounce">🔄</div>
            <p className="text-gray-600">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
