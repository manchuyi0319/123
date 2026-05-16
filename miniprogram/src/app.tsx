import { PropsWithChildren, useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import './app.scss';

// 全局认证上下文
interface AuthState {
  token: string | null;
  teacher: any | null;
  loading: boolean;
}

function App({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    teacher: null,
    loading: true,
  });

  useEffect(() => {
    // 启动时检查本地 token
    const token = Taro.getStorageSync('token');
    const teacher = Taro.getStorageSync('teacher');
    if (token) {
      setAuth({ token, teacher: teacher || null, loading: false });
    } else {
      setAuth({ token: null, teacher: null, loading: false });
    }
  }, []);

  // 微信登录
  const handleWechatLogin = async () => {
    try {
      const { code } = await Taro.login();
      const API_BASE = Taro.getStorageSync('api_base') || 'https://YOUR_DOMAIN.com/api';

      const res = await Taro.request({
        url: `${API_BASE}/auth/wechat/login-mini`,
        method: 'POST',
        data: { code },
      });

      const data: any = res.data;
      if (data.token) {
        Taro.setStorageSync('token', data.token);
        Taro.setStorageSync('teacher', data.teacher);
        setAuth({ token: data.token, teacher: data.teacher, loading: false });
      }
    } catch (err) {
      console.error('微信登录失败:', err);
    }
  };

  return (
    <app-context.Provider value={{ auth, handleWechatLogin }}>
      {children}
    </app-context.Provider>
  );
}

// 简易 context
import { createContext, useContext } from 'react';
export const AppContext = createContext<{
  auth: AuthState;
  handleWechatLogin: () => Promise<void>;
}>({
  auth: { token: null, teacher: null, loading: true },
  handleWechatLogin: async () => {},
});
export const useApp = () => useContext(AppContext);

export default App;
