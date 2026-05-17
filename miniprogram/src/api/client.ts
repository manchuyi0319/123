import Taro from '@tarojs/taro';

// API 基础地址，可通过设置页修改
function getBaseUrl(): string {
  const saved = Taro.getStorageSync('api_base');
  if (saved) return saved;
  // 默认使用同域名（生产环境），开发时可在设置页修改
  return 'https://YOUR_DOMAIN.com/api';
}

export function setBaseUrl(url: string) {
  Taro.setStorageSync('api_base', url);
}

function getToken(): string | null {
  return Taro.getStorageSync('token');
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  skipAuth?: boolean;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, skipAuth = false } = options;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await Taro.request({
    url: `${getBaseUrl()}${path}`,
    method,
    data: body,
    header: headers,
  });

  if (res.statusCode >= 400) {
    const errData = res.data as any;
    throw new Error(errData?.error || `请求失败 (${res.statusCode})`);
  }

  return res.data as T;
}
