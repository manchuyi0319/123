import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '../../context/AuthContext';
import { fetchChildren } from '../../api/parent';
import { getLevel, getLevelName, LEVEL_COLORS } from 'shared';

export function ParentDashboardPage() {
  const { teacher } = useAuth();
  const { data, isLoading, error } = useSWR('parent-children', fetchChildren);

  const children = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">家长中心</h2>
        <p className="text-gray-500 mt-1">欢迎，{teacher?.display_name}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>
      ) : children.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">还没有关联孩子</h3>
          <p className="text-gray-400 mb-6">请使用老师提供的邀请码注册，或联系老师通过您的加入申请</p>
          <Link
            to="/parent/link"
            className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            🔗 关联新孩子
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child: any) => (
              <Link
                key={child.id}
                to={`/parent/children/${child.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-2xl">
                    {child.avatar_url || '👦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{child.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {child.grade ? `${child.grade} · ` : ''}{child.class_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                        ⭐ {child.total_points} 积分
                      </span>
                      <span className="text-xs text-gray-400">
                        🐾 {child.pet_count} 只宠物
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg">→</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <Link
              to="/parent/link"
              className="inline-block px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
              + 关联新孩子
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
