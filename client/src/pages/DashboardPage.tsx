import { useState } from 'react';
import useSWR from 'swr';
import { fetchDashboardStats, fetchWeeklyTop5, fetchRecentPets } from '../api/dashboard';
import { getLevel, getLevelName } from 'shared';

export function DashboardPage() {
  const [scope, setScope] = useState<'my' | 'all'>('my');

  const { data, error, isLoading } = useSWR(
    ['dashboard-stats', scope],
    () => fetchDashboardStats(scope)
  );
  const { data: weeklyData } = useSWR(
    ['weekly-top5', scope],
    () => fetchWeeklyTop5(scope)
  );
  const { data: recentPetsData } = useSWR(
    ['recent-pets', scope],
    () => fetchRecentPets(scope)
  );

  const stats = [
    { label: '班级数量', value: isLoading ? '-' : data?.classCount ?? 0, icon: '🏫', color: 'bg-blue-50 text-blue-600' },
    { label: '学生总数', value: isLoading ? '-' : data?.studentCount ?? 0, icon: '👨‍🎓', color: 'bg-green-50 text-green-600' },
    { label: '领养宠物', value: isLoading ? '-' : data?.petCount ?? 0, icon: '🐾', color: 'bg-purple-50 text-purple-600' },
    { label: '今日积分', value: isLoading ? '-' : data?.todayPoints ?? 0, icon: '⭐', color: 'bg-yellow-50 text-yellow-600' },
  ];

  const weeklyTop5 = weeklyData?.data || [];
  const recentPets = recentPetsData?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">仪表盘</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setScope('my')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              scope === 'my' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            我的
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              scope === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全平台
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          加载失败，请刷新重试
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`text-3xl p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">本周积分排行 TOP 5</h3>
          {weeklyTop5.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">本周暂无积分记录</p>
          ) : (
            <div className="space-y-2">
              {weeklyTop5.map((item: any, idx: number) => (
                <div key={item.id} className="flex items-center gap-3 py-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.class_name}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">+{item.weekly_points}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">最新领养宠物</h3>
          {recentPets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无领养记录</p>
          ) : (
            <div className="space-y-3">
              {recentPets.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {item.nickname || item.pet_name}
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600">
                        Lv.{getLevel(item.current_exp)} {getLevelName(item.current_exp)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">{item.student_name} · {item.class_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
