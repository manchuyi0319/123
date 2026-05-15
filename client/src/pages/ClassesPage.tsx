import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchClasses, createClass, updateClass, archiveClass, generateInviteCode } from '../api/classes';

interface ClassForm {
  name: string;
  grade: string;
  school: string;
  description: string;
}

const emptyForm: ClassForm = { name: '', grade: '', school: '', description: '' };

export function ClassesPage() {
  const { data, error, isLoading } = useSWR('classes', fetchClasses);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [generatingCode, setGeneratingCode] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const handleGenerateCode = async (id: string) => {
    setGeneratingCode(id);
    try {
      const res = await generateInviteCode(id);
      mutate('classes');
      setCopiedCode(res.invite_code);
      await navigator.clipboard.writeText(res.invite_code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err: any) {
      alert(err.message || '生成失败');
    } finally {
      setGeneratingCode('');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (cls: any) => {
    setEditingId(cls.id);
    setForm({ name: cls.name, grade: cls.grade || '', school: cls.school || '', description: cls.description || '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('班级名称不能为空');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateClass(editingId, form);
      } else {
        await createClass(form);
      }
      setShowModal(false);
      mutate('classes');
    } catch (err: any) {
      setFormError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`确定要归档「${name}」吗？归档后仍可查看历史数据。`)) return;
    try {
      await archiveClass(id);
      mutate('classes');
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">班级管理</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          + 创建班级
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>
      )}

      {data && data.data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🏫</div>
          <p className="text-lg">暂无班级，点击按钮创建第一个班级</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((cls: any) => (
            <div key={cls.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{cls.name}</h3>
                  {cls.grade && <p className="text-sm text-gray-400 mt-0.5">{cls.grade}</p>}
                  {cls.school && <p className="text-sm text-gray-400 mt-0.5">{cls.school}</p>}
                </div>
                <span className="text-sm bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                  {cls.student_count} 名学生
                </span>
              </div>
              {cls.description && (
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{cls.description}</p>
              )}

              {/* 邀请码 */}
              <div className="mb-3 p-2.5 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-600 font-medium">家长邀请码：</span>
                  {cls.invite_code ? (
                    <span className="text-sm font-bold text-amber-800 tracking-widest">
                      {cls.invite_code}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-400">未生成</span>
                  )}
                </div>
                <button
                  onClick={() => handleGenerateCode(cls.id)}
                  disabled={generatingCode === cls.id}
                  className="mt-1.5 w-full py-1 text-xs text-amber-700 bg-amber-100 rounded hover:bg-amber-200 disabled:opacity-40 transition-colors"
                >
                  {generatingCode === cls.id ? '生成中...' : cls.invite_code ? '重新生成并复制' : '生成邀请码'}
                </button>
                {copiedCode && copiedCode === cls.invite_code && (
                  <p className="text-xs text-green-600 mt-1">已复制到剪贴板！</p>
                )}
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => openEdit(cls)}
                  className="flex-1 text-xs py-1.5 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleArchive(cls.id, cls.name)}
                  className="flex-1 text-xs py-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  归档
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editingId ? '编辑班级' : '创建班级'}</h3>

            {formError && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">班级名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  placeholder="如：一年级3班"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年级</label>
                <input
                  type="text"
                  value={form.grade}
                  onChange={e => setForm({ ...form, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  placeholder="如：一年级"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学校</label>
                <input
                  type="text"
                  value={form.school}
                  onChange={e => setForm({ ...form, school: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  placeholder="如：育才小学"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                  rows={2}
                  placeholder="班级描述（可选）"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                取消
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
