import { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { login, register, wechatMiniLogin } from '../../api';

export default function LoginPage() {
  const { auth, setAuth } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 从入口页获取角色
  useEffect(() => {
    const role = Taro.getStorageSync('login_role') || 'teacher';
  }, []);

  if (auth.token) {
    Taro.redirectTo({ url: '/pages/dashboard/dashboard' });
    return null;
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = mode === 'register'
        ? await register(email.trim(), password, displayName.trim() || undefined)
        : await login(email.trim(), password);

      Taro.setStorageSync('token', result.token);
      Taro.setStorageSync('teacher', result.teacher);
      setAuth({ token: result.token, teacher: result.teacher, loading: false });
      Taro.redirectTo({ url: '/pages/dashboard/dashboard' });
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWechatLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { code } = await Taro.login();
      const result = await wechatMiniLogin(code);

      Taro.setStorageSync('token', result.token);
      Taro.setStorageSync('teacher', result.teacher);
      setAuth({ token: result.token, teacher: result.teacher, loading: false });

      if (result.isNewUser) {
        Taro.showModal({ title: '首次登录', content: '请先使用邮箱注册并关联微信，或联系管理员绑定账号。', showCancel: false });
      }
      Taro.redirectTo({ url: '/pages/dashboard/dashboard' });
    } catch (err: any) {
      setError(err.message || '微信登录失败，请使用邮箱登录');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: '48rpx' }}>
      <View style={{ textAlign: 'center', marginTop: '60rpx', marginBottom: '60rpx' }}>
        <Text style={{ fontSize: '80rpx', display: 'block' }}>📚</Text>
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', color: '#1F2937', display: 'block', marginTop: '16rpx' }}>
          {mode === 'login' ? '登录' : '注册'}
        </Text>
      </View>

      {/* 模式切换 */}
      <View style={{ display: 'flex', marginBottom: '48rpx', borderRadius: '16rpx', overflow: 'hidden', border: '2rpx solid #E5E7EB' }}>
        {(['login', 'register'] as const).map(m => (
          <View
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            style={{
              flex: 1, padding: '20rpx', textAlign: 'center', fontSize: '28rpx',
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

      <View className="input-group">
        <Text className="input-label">邮箱</Text>
        <Input
          value={email}
          onInput={e => setEmail(e.detail.value)}
          placeholder="请输入邮箱"
          className="input-field"
        />
      </View>

      {mode === 'register' && (
        <View className="input-group">
          <Text className="input-label">昵称</Text>
          <Input
            value={displayName}
            onInput={e => setDisplayName(e.detail.value)}
            placeholder="你的名字（选填）"
            className="input-field"
          />
        </View>
      )}

      <View className="input-group">
        <Text className="input-label">密码</Text>
        <Input
          password
          value={password}
          onInput={e => setPassword(e.detail.value)}
          placeholder="请输入密码"
          className="input-field"
        />
      </View>

      <Button
        onClick={handleSubmit}
        loading={loading}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '16rpx' }}
      >
        {mode === 'login' ? '登录' : '注册'}
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
