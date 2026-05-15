import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parentRegister } from '../api/parent';
import { setToken } from '../api/client';

type Mode = 'login' | 'register' | 'parent';

export function LoginPage() {
  const { login, register, isAuthenticated, setTeacherDirect } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'parent') {
        const res = await parentRegister({
          email,
          password,
          display_name: displayName,
          invite_code: inviteCode,
        });
        setToken(res.token);
        setTeacherDirect(res.teacher);
        navigate('/parent/dashboard', { replace: true });
      } else if (mode === 'register') {
        await register({ email, password, display_name: displayName });
        navigate('/', { replace: true });
      } else {
        await login({ email, password });
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-gray-800">我的老师我的班</h1>
          <p className="text-gray-500 mt-2">游戏化班级管理与宠物养成</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 模式切换 */}
          <div className="flex border border-gray-200 rounded-lg mb-6 overflow-hidden">
            {([
              ['login', '教师登录'],
              ['register', '教师注册'],
              ['parent', '家长注册'],
            ] as [Mode, string][]).map(([m, label]) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {mode === 'parent' && (
            <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-lg text-xs">
              请使用老师提供的6位邀请码注册。注册后需老师审批通过才能查看孩子数据。
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            {(mode === 'register' || mode === 'parent') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>
            )}

            {mode === 'parent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邀请码</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors uppercase tracking-widest text-center"
                  placeholder="如：ABC123"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">由老师提供的6位班级邀请码</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="请输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '请稍候...' : mode === 'parent' ? '家长注册' : mode === 'register' ? '注册' : '登录'}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            {mode === 'login' ? (
              <>没有账号？<button onClick={() => switchMode('register')} className="ml-1 text-indigo-600 hover:underline font-medium">去注册</button></>
            ) : mode === 'register' ? (
              <>已有账号？<button onClick={() => switchMode('login')} className="ml-1 text-indigo-600 hover:underline font-medium">去登录</button></>
            ) : (
              <>是老师？<button onClick={() => switchMode('login')} className="ml-1 text-indigo-600 hover:underline font-medium">教师登录</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
