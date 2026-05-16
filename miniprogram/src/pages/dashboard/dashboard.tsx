import { View, Text } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { auth } = useApp();
  const [stats, setStats] = useState<any>(null);
  const API_BASE = Taro.getStorageSync('api_base') || 'https://YOUR_DOMAIN.com/api';

  useEffect(() => {
    if (!auth.token) return;
    Taro.request({
      url: `${API_BASE}/dashboard/stats`,
      header: { Authorization: `Bearer ${auth.token}` },
    }).then(res => setStats(res.data)).catch(() => {});
  }, [auth.token]);

  return (
    <View>
      <View className="card">
        <Text style={{ fontSize: '40rpx', fontWeight: 'bold' }}>
          仪表盘
        </Text>
        {stats && (
          <View style={{ display: 'flex', flexWrap: 'wrap', marginTop: '24rpx' }}>
            {['classes', 'students', 'pets_adopted', 'today_points'].map(key => (
              <View key={key} style={{ width: '50%', padding: '16rpx' }}>
                <View style={{ background: '#F3F4F6', borderRadius: '12rpx', padding: '24rpx', textAlign: 'center' }}>
                  <Text style={{ fontSize: '48rpx', fontWeight: 'bold', color: '#4F46E5' }}>
                    {stats[key] || 0}
                  </Text>
                  <Text style={{ fontSize: '22rpx', color: '#6B7280', display: 'block', marginTop: '8rpx' }}>
                    {key === 'classes' ? '班级' : key === 'students' ? '学生' : key === 'pets_adopted' ? '宠物' : '今日积分'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
