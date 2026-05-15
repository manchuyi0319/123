import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api/announcements';
import { useAuth } from '../context/AuthContext';

export function AnnouncementsPage() {
  const { teacher } = useAuth();
  const isAdmin = teacher?.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading, error: loadError } = useSWR('announcements', fetchAnnouncements);

  const openCreate = () => {
    setEditId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setError('');
    setShowModal(true);
  };

  const openEdit = (a: any) => {
    setEditId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setIsPinned(!!a.is_pinned);
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await updateAnnouncement(editId, { title: title.trim(), content: content.trim(), is_pinned: isPinned ? 1 : 0 });
      } else {
        await createAnnouncement({ title: title.trim(), content: content.trim(), is_pinned: isPinned ? 1 : 0 });
      }
      setShowModal(false);
      mutate('announcements');
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条公告吗？')) return;
    try {
      await deleteAnnouncement(id);
      mutate('announcements');
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const announcements = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">系统公告</h2>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + 发布公告
          </button>
        )}
      </div>

      {loadError && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">加载失败，请刷新重试</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>暂无公告</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a: any) => (
            <div
              key={a.id}
              className={`bg-white rounded-xl shadow-sm border p-5 ${a.is_pinned ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    {a.is_pinned ? <span className="text-red-500 text-xs px-1.5 py-0.5 bg-red-50 rounded">置顶</span> : null}
                    {a.title}
                  </h3>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {a.author_name} · {new Date(a.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(a)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editId ? '编辑公告' : '发布公告'}</h3>
            {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="公告标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="公告内容"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded border-gray-300"
                />
                置顶公告
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
