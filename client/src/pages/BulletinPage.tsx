import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchBulletinPosts, createBulletinPost, deleteBulletinPost } from '../api/bulletin';
import { useAuth } from '../context/AuthContext';

export function BulletinPage() {
  const { teacher } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [badWords, setBadWords] = useState<string[]>([]);

  const { data, isLoading, error: loadError } = useSWR('bulletin-posts', fetchBulletinPosts);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }
    setPosting(true);
    setError('');
    setBadWords([]);
    try {
      await createBulletinPost({ title: title.trim(), content: content.trim() });
      setShowForm(false);
      setTitle('');
      setContent('');
      mutate('bulletin-posts');
    } catch (err: any) {
      setError(err.message || '发帖失败');
      if (err.details?.words) {
        setBadWords(err.details.words);
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条帖子吗？')) return;
    try {
      await deleteBulletinPost(id);
      mutate('bulletin-posts');
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const posts = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">黑板报</h2>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setBadWords([]); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {showForm ? '取消' : '+ 发帖'}
        </button>
      </div>

      {/* 发帖表单 */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">发布新帖</h3>
          {error && (
            <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
              {badWords.length > 0 && (
                <span className="block mt-1 text-xs text-red-400">
                  触发词汇：{badWords.join('、')}
                </span>
              )}
            </div>
          )}
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="帖子标题"
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={5000}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="帖子内容..."
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handlePost}
              disabled={posting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {posting ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      )}

      {/* 帖子列表 */}
      {loadError && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">加载失败，请刷新重试</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>暂无帖子，快来发第一帖吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {post.author_role === 'admin' ? '管理员' : post.author_role === 'parent' ? '家长' : '老师'}
                    </span>
                    <h3 className="font-semibold text-gray-800">{post.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {post.author_name} · {new Date(post.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                {(teacher?.role === 'admin' || teacher?.id === post.author_id) && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 flex-shrink-0"
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
