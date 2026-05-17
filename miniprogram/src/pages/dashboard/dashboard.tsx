import { View, Text } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../../api';

export default function DashboardPage() {
  const { auth, logout } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.token) {
      Taro.redirectTo({ url: '/pages/index/index' });
      return;
    }
    loadStats();
  }, [auth.token]);

  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('加载仪表盘失败:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.token) return null;

  const statCards = [
    { label: '班级', value: stats?.classes ?? '-', icon: '🏫', color: '#EEF2FF', textColor: '#4F46E5' },
    { label: '学生', value: stats?.students ?? '-', icon: '👨‍🎓', color: '#F0FDF4', textColor: '#22C55E' },
    { label: '宠物', value: stats?.pets_adopted ?? '-', icon: '🐾', color: '#FEF3C7', textColor: '#D97706' },
    { label: '今日积分', value: stats?.today_points ?? '-', icon: '⭐', color: '#FCE7F3', textColor: '#DB2777' },
  ];

  const navCards = [
    { label: '班级管理', icon: '🏫', url: '/pages/classes/classes' },
    { label: '宠物图鉴', icon: '🐾', url: '/pages/pets/pets' },
    { label: '排行榜', icon: '🏆', url: '/pages/rankings/rankings' },
  ];

  return (
    <View>
      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', padding: '48rpx 32rpx', color: '#fff' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: '28rpx', opacity: 0.8, display: 'block' }}>
              {auth.teacher?.role === 'admin' ? '管理员' : '教师'}中心
            </Text>
            <Text style={{ fontSize: '40rpx', fontWeight: 'bold', display: 'block', marginTop: '8rpx' }}>
              {auth.teacher?.display_name || '老师'}
            </Text>
          </View>
          <View onClick={logout} style={{ padding: '16rpx' }}>
            <Text style={{ fontSize: '28rpx', opacity: 0.7 }}>退出</Text>
          </View>
        </View>
      </View>

      {/* 统计卡片 */}
      <View style={{ padding: '24rpx' }}>
        <View style={{ display: 'flex', flexWrap: 'wrap', margin: '-12rpx' }}>
          {statCards.map(s => (
            <View key={s.label} style={{ width: '50%', padding: '12rpx' }}>
              <View style={{ background: s.color, borderRadius: '20rpx', padding: '32rpx', textAlign: 'center' }}>
                <Text style={{ fontSize: '48rpx', display: 'block' }}>{s.icon}</Text>
                <Text style={{ fontSize: '44rpx', fontWeight: 'bold', color: s.textColor, display: 'block', marginTop: '8rpx' }}>
                  {loading ? '...' : s.value}
                </Text>
                <Text style={{ fontSize: '24rpx', color: '#6B7280', display: 'block', marginTop: '4rpx' }}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 快捷入口 */}
      <View style={{ padding: '0 24rpx' }}>
        <Text style={{ fontSize: '30rpx', fontWeight: 'bold', color: '#1F2937', paddingLeft: '8rpx', marginBottom: '16rpx', display: 'block' }}>
          快捷操作
        </Text>
        {navCards.map(n => (
          <View
            key={n.label}
            className="card"
            style={{ margin: '0 0 16rpx 0' }}
            onClick={() => Taro.navigateTo({ url: n.url })}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '20rpx' }}>
              <Text style={{ fontSize: '48rpx' }}>{n.icon}</Text>
              <Text style={{ fontSize: '32rpx', fontWeight: '500', color: '#1F2937', flex: 1 }}>{n.label}</Text>
              <Text style={{ color: '#D1D5DB', fontSize: '32rpx' }}>›</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 本周 TOP10 */}
      {stats?.top10 && stats.top10.length > 0 && (
        <View style={{ padding: '24rpx' }}>
          <Text style={{ fontSize: '30rpx', fontWeight: 'bold', color: '#1F2937', paddingLeft: '8rpx', marginBottom: '16rpx', display: 'block' }}>
            🏆 本周 TOP10
          </Text>
          <View className="card" style={{ margin: 0 }}>
            {stats.top10.slice(0, 5).map((s: any, i: number) => (
              <View key={s.id || i} className="list-item">
                <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                  <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: i < 3 ? '#F59E0B' : '#9CA3AF', width: '48rpx' }}>
                    {i + 1}
                  </Text>
                  <Text style={{ fontSize: '28rpx', color: '#1F2937' }}>{s.name}</Text>
                </View>
                <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#4F46E5' }}>⭐{s.total_points}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
