import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';

export default function LoginPage() {
  const { auth, handleWechatLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (auth.token) {
    Taro.redirectTo({ url: '/pages/index/index' });
    return null;
  }

  const API_BASE = Taro.getStorageSync('api_base') || 'https://YOUR_DOMAIN.com/api';

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const body = mode === 'register'
        ? { email, password, display_name: email.split('@')[0] }
        : { email, password };

      const res = await Taro.request({
        url: `${API_BASE}${endpoint}`,
        method: 'POST',
        data: body,
      });

      const data: any = res.data;
      if (data.token) {
        Taro.setStorageSync('token', data.token);
        Taro.setStorageSync('teacher', data.teacher);
        Taro.redirectTo({ url: '/pages/index/index' });
      }
    } catch (err: any) {
      setError(err.errMsg || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: '48rpx' }}>
      <View style={{ textAlign: 'center', marginBottom: '60rpx', marginTop: '80rpx' }}>
        <Text style={{ fontSize: '80rpx' }}>📚</Text>
      </View>

      {/* 模式切换 */}
      <View style={{ display: 'flex', marginBottom: '48rpx', borderRadius: '16rpx', overflow: 'hidden', border: '2rpx solid #E5E7EB' }}>
        {['login', 'register'].map(m => (
          <View
            key={m}
            onClick={() => { setMode(m as any); setError(''); }}
            style={{
              flex: 1,
              padding: '20rpx',
              textAlign: 'center',
              fontSize: '28rpx',
              background: mode === m ? '#4F46E5' : '#fff',
              color: mode === m ? '#fff' : '#6B7280',
            }}
          >
            {m === 'login' ? '登录' : '注册'}
          </View>
        ))}
      </View>

      {error && (
        <View style={{ padding: '24rpx', background: '#FEF2F2', borderRadius: '12rpx', marginBottom: '32rpx' }}>
          <Text style={{ color: '#EF4444', fontSize: '24rpx' }}>{error}</Text>
        </View>
      )}

      <View style={{ marginBottom: '32rpx' }}>
        <Text style={{ fontSize: '24rpx', color: '#6B7280', marginBottom: '12rpx' }}>邮箱</Text>
        <Input
          value={email}
          onInput={e => setEmail(e.detail.value)}
          placeholder="请输入邮箱"
          style={{ border: '2rpx solid #E5E7EB', borderRadius: '12rpx', padding: '24rpx', fontSize: '28rpx' }}
        />
      </View>

      <View style={{ marginBottom: '48rpx' }}>
        <Text style={{ fontSize: '24rpx', color: '#6B7280', marginBottom: '12rpx' }}>密码</Text>
        <Input
          password
          value={password}
          onInput={e => setPassword(e.detail.value)}
          placeholder="请输入密码"
          style={{ border: '2rpx solid #E5E7EB', borderRadius: '12rpx', padding: '24rpx', fontSize: '28rpx' }}
        />
      </View>

      <Button
        onClick={handleSubmit}
        loading={loading}
        style={{ background: '#4F46E5', color: '#fff', borderRadius: '12rpx', width: '100%' }}
      >
        {mode === 'register' ? '注册' : '登录'}
      </Button>

      {/* 微信快捷登录 */}
      <View style={{ marginTop: '48rpx' }}>
        <View style={{ display: 'flex', alignItems: 'center', marginBottom: '32rpx' }}>
          <View style={{ flex: 1, height: '2rpx', background: '#E5E7EB' }} />
          <Text style={{ margin: '0 24rpx', color: '#9CA3AF', fontSize: '24rpx' }}>或</Text>
          <View style={{ flex: 1, height: '2rpx', background: '#E5E7EB' }} />
        </View>
        <Button
          onClick={handleWechatLogin}
          style={{ background: '#22C55E', color: '#fff', borderRadius: '12rpx', width: '100%' }}
        >
          微信一键登录
        </Button>
      </View>
    </View>
  );
}
