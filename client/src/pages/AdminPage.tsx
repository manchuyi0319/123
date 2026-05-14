import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchTeachers, fetchAdminStats, deleteTeacher } from '../api/admin';

export function AdminPage() {
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

      {/* 平台统计 */}
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

      {/* 教师列表 */}
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
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deleting}
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            {deleting ? '删除中...' : '确认删除'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="px-3 py-1 text-xs text-red-500 bg-red-50 rounded hover:bg-red-100"
                        >
                          删除
                        </button>
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
