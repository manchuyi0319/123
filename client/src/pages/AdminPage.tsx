import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuth } from '../context/AuthContext';
import { fetchTeachers, fetchAdminStats, deleteTeacher } from '../api/admin';
import { apiRequest } from '../api/client';

// 管理员视图
function AdminPanel() {
  const { data: statsData } = useSWR('admin-stats', fetchAdminStats);
  const { data: teachersData, error, isLoading } = useSWR('admin-teachers', fetchTeachers);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const teachers = teachersData?.data || [];
  const stats = statsData || { teacherCount: 0, studentCount: 0, classCount: 0, petCount: 0 };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteTeacher(id);
      setDeleteId(null);
      mutate('admin-teachers');
      mutate('admin-stats');
    } catch (err: any) {
      setDeleteError(err.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">后台管理</h2>
      <p className="text-sm text-gray-400 mb-6">管理平台教师账号，清理测试数据</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '教师总数', value: stats.teacherCount, icon: '👨‍🏫' },
          { label: '学生总数', value: stats.studentCount, icon: '👨‍🎓' },
          { label: '班级总数', value: stats.classCount, icon: '🏫' },
          { label: '宠物总数', value: stats.petCount, icon: '🐾' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>}
      {deleteError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{deleteError}</div>}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">教师</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">角色</th>
                <th className="text-center px-5 py-3 text-sm font-medium text-gray-500">班级</th>
                <th className="text-center px-5 py-3 text-sm font-medium text-gray-500">学生</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-gray-500">注册时间</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t: any) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{t.display_name}</p>
                    <p className="text-xs text-gray-400">@{t.username}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      t.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {t.role === 'admin' ? '管理员' : '教师'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-sm text-gray-600">{t.class_count || 0}</td>
                  <td className="px-5 py-3 text-center text-sm text-gray-600">{t.student_count || 0}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{t.created_at}</td>
                  <td className="px-5 py-3 text-right">
                    {t.role !== 'admin' && (
                      deleteId === t.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setDeleteId(null)} className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200">取消</button>
                          <button onClick={() => handleDelete(t.id)} disabled={deleting} className="px-3 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50">
                            {deleting ? '删除中...' : '确认删除'}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(t.id)} className="px-3 py-1 text-xs text-red-500 bg-red-50 rounded hover:bg-red-100">删除</button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 普通教师视图
const TEACHER_TOOLS = [
  {
    title: '导出数据',
    desc: '导出班级、学生信息和积分记录为 CSV 文件，方便本地存档和分析',
    icon: '📥',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    action: '导出 CSV',
  },
  {
    title: '成绩报告',
    desc: '查看各班级学生积分汇总报告，了解整体表现和个体差异',
    icon: '📊',
    color: 'bg-green-50 text-green-600 border-green-200',
    action: '查看报告',
  },
  {
    title: '重置积分',
    desc: '将所选班级所有学生积分清零（新学期开始时使用），此操作不可撤销',
    icon: '🔄',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    action: '重置积分',
    danger: true,
  },
  {
    title: '修改邮箱',
    desc: '更新登录邮箱地址，下次登录时使用新邮箱',
    icon: '📧',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    action: '修改邮箱',
  },
  {
    title: '修改密码',
    desc: '修改当前账号的登录密码，建议定期更换以保证安全',
    icon: '🔐',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    action: '修改密码',
  },
  {
    title: '学期重置',
    desc: '学期结束后重置所有宠物的喂养等级，新学期学生需重新喂养宠物。此操作不可撤销',
    icon: '⏳',
    color: 'bg-red-50 text-red-600 border-red-200',
    action: '重置宠物等级',
    danger: true,
  },
];

function TeacherPanel() {
  const { teacher } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 修改邮箱
  const [newEmail, setNewEmail] = useState(teacher?.username || '');
  // 修改密码
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // 重置积分
  const [selectedClassId, setSelectedClassId] = useState('');

  const { data: classesData } = useSWR('my-classes-reset', () => apiRequest('/classes'));

  const handleExportCSV = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/admin/export', { method: 'POST' });
      const csv = (res as any).csv;
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `班级数据导出_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('数据导出成功');
    } catch (err: any) {
      setError(err.message || '导出失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPoints = async () => {
    if (!selectedClassId) { setError('请选择要重置的班级'); return; }
    if (!confirm('确定要重置该班级所有学生的积分吗？此操作不可撤销！')) return;
    setLoading(true);
    setError('');
    try {
      await apiRequest('/admin/reset-points', { method: 'POST', body: JSON.stringify({ class_id: selectedClassId }) });
      setMsg('积分已重置');
      setSelectedClassId('');
      setActiveTool(null);
    } catch (err: any) {
      setError(err.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/profile', { method: 'PATCH', body: JSON.stringify({ email: newEmail }) });
      setMsg('邮箱已更新');
      setActiveTool(null);
    } catch (err: any) {
      setError(err.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { setError('两次输入的新密码不一致'); return; }
    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/password', { method: 'PATCH', body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) });
      setMsg('密码已修改');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTool(null);
    } catch (err: any) {
      setError(err.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPets = async () => {
    if (!confirm('确定要重置所有学生的宠物喂养等级吗？此操作不可撤销！学期结束后才建议使用。')) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/admin/reset-pets', { method: 'POST' });
      setMsg((res as any).message || '宠物喂养等级已重置');
      setActiveTool(null);
    } catch (err: any) {
      setError(err.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToolAction = (tool: string) => {
    setMsg('');
    setError('');
    if (tool === '导出数据') {
      handleExportCSV();
    } else if (tool === '重置宠物等级') {
      handleResetPets();
    } else {
      setActiveTool(tool);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">后台管理</h2>
      <p className="text-sm text-gray-400 mb-6">数据管理、报告导出和账号安全设置</p>

      {msg && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{msg}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* 工具卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEACHER_TOOLS.map(tool => (
          <div key={tool.title} className={`bg-white rounded-xl p-5 shadow-sm border ${tool.color.split(' ')[2] || 'border-gray-100'} hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-4">
              <span className={`text-2xl p-3 rounded-xl ${tool.color.split(' ')[0]} ${tool.color.split(' ')[1]}`}>
                {tool.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 mb-1">{tool.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{tool.desc}</p>
                <button
                  onClick={() => handleToolAction(tool.title)}
                  disabled={loading}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    tool.danger
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  } disabled:opacity-50`}
                >
                  {tool.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 修改邮箱弹窗 */}
      {activeTool === '修改邮箱' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setActiveTool(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">修改邮箱</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">当前邮箱</label>
                <p className="text-sm text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">{teacher?.username}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">新邮箱</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setActiveTool(null)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">取消</button>
              <button onClick={handleUpdateEmail} disabled={loading} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {activeTool === '修改密码' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setActiveTool(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">旧密码</label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">新密码</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="至少4个字符" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">确认新密码</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="再次输入新密码" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setActiveTool(null)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">取消</button>
              <button onClick={handleChangePassword} disabled={loading} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
                {loading ? '修改中...' : '修改密码'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重置积分弹窗 */}
      {activeTool === '重置积分' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setActiveTool(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">重置积分</h3>
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">⚠️ 此操作将清零所选班级所有学生的积分，不可撤销！</p>
            <div>
              <label className="block text-sm text-gray-600 mb-1">选择班级</label>
              <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">请选择班级</option>
                {(classesData as any)?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({(c as any).student_count || 0} 名学生)</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setActiveTool(null)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">取消</button>
              <button onClick={handleResetPoints} disabled={loading || !selectedClassId}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm">
                {loading ? '重置中...' : '确认重置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成绩报告弹窗 */}
      {activeTool === '成绩报告' && (
        <ReportPanel teacherId={teacher?.id || ''} onClose={() => setActiveTool(null)} />
      )}
    </div>
  );
}

// 成绩报告面板
function ReportPanel({ teacherId, onClose }: { teacherId: string; onClose: () => void }) {
  const { data, isLoading } = useSWR(teacherId ? ['teacher-report', teacherId] : null,
    () => apiRequest('/admin/report')
  );
  const report = data as any;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">成绩报告</h3>

        {isLoading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
        ) : !report?.classes ? (
          <p className="text-sm text-gray-400 text-center py-8">暂无数据</p>
        ) : (
          <div className="space-y-4">
            {report.classes.map((c: any) => (
              <div key={c.class_name} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{c.class_name}</h4>
                  <span className="text-xs text-gray-400">{c.student_count} 名学生</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="bg-blue-50 rounded-lg py-2">
                    <p className="text-xs text-blue-500">平均分</p>
                    <p className="font-bold text-blue-700">{c.avg_points}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg py-2">
                    <p className="text-xs text-green-500">最高分</p>
                    <p className="font-bold text-green-700">{c.max_points}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg py-2">
                    <p className="text-xs text-yellow-500">总积分</p>
                    <p className="font-bold text-yellow-700">{c.total_points}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} className="w-full mt-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">关闭</button>
      </div>
    </div>
  );
}

// 组装
export function AdminPage() {
  const { teacher } = useAuth();

  if (!teacher) return null;

  if (teacher.role === 'admin') return <AdminPanel />;
  return <TeacherPanel />;
}
