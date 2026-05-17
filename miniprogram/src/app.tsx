import { PropsWithChildren, useState, useEffect, createContext, useContext } from 'react';
import Taro from '@tarojs/taro';
import './app.scss';

interface AuthState {
  token: string | null;
  teacher: any | null;
  loading: boolean;
}

interface AppContextType {
  auth: AuthState;
  setAuth: (a: AuthState) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextType>({
  auth: { token: null, teacher: null, loading: true },
  setAuth: () => {},
  logout: () => {},
});

export const useApp = () => useContext(AppContext);

function App({ children }: PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    teacher: null,
    loading: true,
  });

  useEffect(() => {
    const token = Taro.getStorageSync('token');
    const teacher = Taro.getStorageSync('teacher');
    if (token && teacher) {
      setAuth({ token, teacher, loading: false });
    } else {
      setAuth({ token: null, teacher: null, loading: false });
    }
  }, []);

  const logout = () => {
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('teacher');
    setAuth({ token: null, teacher: null, loading: false });
    Taro.reLaunch({ url: '/pages/index/index' });
  };

  return (
    <AppContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export default App;
