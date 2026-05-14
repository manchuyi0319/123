import useSWR from 'swr';
import { fetchDashboardStats } from '../api/dashboard';

export function DashboardPage() {
  const { data, error, isLoading } = useSWR('dashboard-stats', fetchDashboardStats);

  const stats = [
    { label: '班级数量', value: isLoading ? '-' : data?.classCount ?? 0, icon: '🏫', color: 'bg-blue-50 text-blue-600' },
    { label: '学生总数', value: isLoading ? '-' : data?.studentCount ?? 0, icon: '👨‍🎓', color: 'bg-green-50 text-green-600' },
    { label: '领养宠物', value: isLoading ? '-' : data?.petCount ?? 0, icon: '🐾', color: 'bg-purple-50 text-purple-600' },
    { label: '今日积分', value: isLoading ? '-' : data?.todayPoints ?? 0, icon: '⭐', color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">仪表盘</h2>

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

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">欢迎使用班级宠物园!</h3>
        <p className="text-gray-500">
          在这里，你可以管理班级、给学生们积分奖励，学生们可以用积分喂养可爱的电子宠物。让班级管理变得更有趣！
        </p>
      </div>
    </div>
  );
}
