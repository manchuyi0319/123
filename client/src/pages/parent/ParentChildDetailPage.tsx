import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetchChildDetail } from '../../api/parent';
import { getLevel, getLevelName, getLevelProgress, getExpToNextLevel, LEVEL_COLORS } from 'shared';

export function ParentChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: child, isLoading, error } = useSWR(
    id ? ['parent-child', id] : null,
    () => fetchChildDetail(id!)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">😢</div>
        <p className="text-lg">未找到该学生信息</p>
        <Link to="/parent/dashboard" className="mt-4 inline-block text-indigo-600 hover:underline">返回家长中心</Link>
      </div>
    );
  }

  const pets = child.pets || [];
  const recentPoints = child.recent_points || [];

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/parent/dashboard" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← 返回家长中心
      </Link>

      {/* 学生信息卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-3xl">
            {child.avatar_url || '👦'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{child.name}</h2>
            <p className="text-sm text-gray-400">
              {child.grade ? `${child.grade} · ` : ''}{child.class_name}
              {child.student_number ? ` · 学号: ${child.student_number}` : ''}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                ⭐ {child.total_points} 积分
              </span>
              <span className="text-sm text-gray-400">
                班级排名 #{child.rank} / {child.total_in_class}
              </span>
              <span className="text-sm text-gray-400">
                🐾 {pets.length} 只宠物
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 宠物列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🐾 我的宠物</h3>
        {pets.length === 0 ? (
          <p className="text-center py-8 text-gray-400">还没有领养宠物</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pets.map((sp: any) => {
              const level = getLevel(sp.current_exp);
              const progress = getLevelProgress(sp.current_exp);
              const nextExp = getExpToNextLevel(sp.current_exp);
              return (
                <div key={sp.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-4xl">{sp.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {sp.nickname || sp.pet_name}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${LEVEL_COLORS[level - 1] || 'bg-gray-400'}`}>
                      Lv.{level} {getLevelName(sp.current_exp)}
                    </span>
                    <div className="mt-1.5">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${LEVEL_COLORS[level - 1] || 'bg-indigo-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{sp.current_exp} EXP</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 最近积分记录 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 最近积分记录</h3>
        {recentPoints.length === 0 ? (
          <p className="text-center py-8 text-gray-400">暂无积分记录</p>
        ) : (
          <div className="space-y-2">
            {recentPoints.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${r.points_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {r.points_change > 0 ? '+' : ''}{r.points_change}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.reason}</p>
                    <p className="text-xs text-gray-400">
                      {r.created_at?.replace('T', ' ').substring(0, 16)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded">{r.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
