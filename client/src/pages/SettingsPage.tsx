import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';

export function SettingsPage() {
  const { teacher, logout } = useAuth();

  const [displayName, setDisplayName] = useState(teacher?.display_name || '');
  const [email, setEmail] = useState(teacher?.email || '');
  const [phone, setPhone] = useState(teacher?.phone || '');
  const [school, setSchool] = useState(teacher?.school || '');
  const [bio, setBio] = useState(teacher?.bio || '');

  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setSavingProfile(true);
    try {
      await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ display_name: displayName, email: email || null, phone: phone || null, school: school || null, bio: bio || null }),
      });
      setProfileMsg('个人信息已更新');
    } catch (err: any) {
      setProfileError(err.message || '保存失败');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }
    setSavingPassword(true);
    try {
      await apiRequest('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      setPasswordMsg('密码已修改');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || '修改失败');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">设置</h2>

      {/* 个人信息 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">个人信息</h3>

        {profileMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{profileMsg}</div>}
        {profileError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{profileError}</div>}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="选填"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="选填"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">学校</label>
              <input
                type="text"
                value={school}
                onChange={e => setSchool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="选填"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
              rows={3}
              placeholder="介绍一下自己（选填）"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {savingProfile ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>

      {/* 修改密码 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>

        {passwordMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{passwordMsg}</div>}
        {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{passwordError}</div>}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="至少4个字符"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="再次输入新密码"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {savingPassword ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>

      {/* 账号信息 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">账号信息</h3>
        <div className="text-sm text-gray-500 space-y-2">
          <p>角色：{teacher?.role === 'admin' ? '管理员' : '教师'}</p>
          <p>注册时间：{teacher?.created_at}</p>
        </div>
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
