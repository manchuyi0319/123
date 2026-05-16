import { View, Text } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

export default function ClassesPage() {
  const { auth } = useApp();
  const [classes, setClasses] = useState<any[]>([]);
  const API_BASE = Taro.getStorageSync('api_base') || 'https://YOUR_DOMAIN.com/api';

  useEffect(() => {
    if (!auth.token) return;
    Taro.request({
      url: `${API_BASE}/classes`,
      header: { Authorization: `Bearer ${auth.token}` },
    }).then(res => setClasses(res.data || [])).catch(() => {});
  }, [auth.token]);

  return (
    <View>
      {classes.map((c: any) => (
        <View key={c.id} className="card">
          <Text style={{ fontSize: '32rpx', fontWeight: 'bold' }}>{c.name}</Text>
          <Text style={{ color: '#6B7280', fontSize: '24rpx' }}>{c.grade || ''} · {c.student_count || 0} 名学生</Text>
        </View>
      ))}
      {classes.length === 0 && (
        <View className="card">
          <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>暂无班级，请先在网页端创建</Text>
        </View>
      )}
    </View>
  );
}
