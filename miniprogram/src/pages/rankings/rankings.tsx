import { View, Text } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { fetchRankings, fetchClasses } from '../../api';

const TABS = [
  { key: 'students', label: '学生排行', icon: '👨‍🎓' },
  { key: 'pets', label: '宠物排行', icon: '🐾' },
  { key: 'classes', label: '班级排行', icon: '🏫' },
];

export default function RankingsPage() {
  const { auth } = useApp();
  const [activeTab, setActiveTab] = useState('students');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  useEffect(() => {
    if (!auth.token) { Taro.redirectTo({ url: '/pages/index/index' }); return; }
    loadRankings();
    loadClasses();
  }, [auth.token, activeTab, selectedClassId]);

  const loadClasses = async () => {
    try {
      const res = await fetchClasses();
      setClasses(res.data || []);
    } catch (err) {}
  };

  const loadRankings = async () => {
    setLoading(true);
    try {
      const res = await fetchRankings(activeTab as any, selectedClassId || undefined);
      setRankings(res.data || []);
    } catch (err) { setRankings([]); }
    finally { setLoading(false); }
  };

  if (!auth.token) return null;

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <View>
      <View style={{ background: '#4F46E5', padding: '32rpx', color: '#fff' }}>
        <Text style={{ fontSize: '28rpx', opacity: 0.8, display: 'block' }}>排行榜</Text>
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', display: 'block', marginTop: '4rpx' }}>全平台排名</Text>
      </View>

      {/* Tab */}
      <View style={{ display: 'flex', background: '#fff', borderBottom: '1rpx solid #E5E7EB' }}>
        {TABS.map(t => (
          <View key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              flex: 1, textAlign: 'center', padding: '24rpx 0',
              borderBottom: activeTab === t.key ? '4rpx solid #4F46E5' : '4rpx solid transparent',
              color: activeTab === t.key ? '#4F46E5' : '#9CA3AF',
              fontSize: '28rpx', fontWeight: activeTab === t.key ? 'bold' : 'normal',
            }}>
            {t.icon} {t.label}
          </View>
        ))}
      </View>

      {/* 班级筛选 */}
      <View style={{ padding: '16rpx 24rpx', background: '#fff' }}>
        <View style={{ display: 'flex', gap: '12rpx', flexWrap: 'wrap' }}>
          <View onClick={() => setSelectedClassId('')}
            style={{ padding: '10rpx 20rpx', borderRadius: '10rpx', fontSize: '24rpx', background: !selectedClassId ? '#4F46E5' : '#F3F4F6', color: !selectedClassId ? '#fff' : '#6B7280' }}>
            全部
          </View>
          {classes.map((c: any) => (
            <View key={c.id} onClick={() => setSelectedClassId(c.id)}
              style={{ padding: '10rpx 20rpx', borderRadius: '10rpx', fontSize: '24rpx', background: selectedClassId === c.id ? '#4F46E5' : '#F3F4F6', color: selectedClassId === c.id ? '#fff' : '#6B7280' }}>
              {c.name}
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="loading-center"><Text style={{ color: '#9CA3AF' }}>加载中...</Text></View>
      ) : rankings.length === 0 ? (
        <View className="empty-state"><Text className="empty-state-icon">🏆</Text><Text>暂无排名数据</Text></View>
      ) : (
        <View style={{ padding: '24rpx' }}>
          {rankings.map((item: any, i: number) => (
            <View key={item.id || i} className="card" style={{ margin: '0 0 12rpx 0', padding: '24rpx 32rpx' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <Text style={{ fontSize: i < 3 ? '48rpx' : '28rpx', fontWeight: 'bold', color: i < 3 ? '#F59E0B' : '#9CA3AF', width: '64rpx', textAlign: 'center' }}>
                  {i < 3 ? MEDALS[i] : `${i + 1}`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '30rpx', fontWeight: 'bold', color: '#1F2937', display: 'block' }}>
                    {item.name || item.display_name || item.pet_name || ''}
                  </Text>
                  {item.class_name && (
                    <Text style={{ fontSize: '22rpx', color: '#9CA3AF', display: 'block', marginTop: '4rpx' }}>{item.class_name}</Text>
                  )}
                </View>
                {item.total_points !== undefined && (
                  <Text style={{ fontSize: '30rpx', fontWeight: 'bold', color: '#F59E0B' }}>⭐{item.total_points}</Text>
                )}
                {item.exp !== undefined && (
                  <Text style={{ fontSize: '30rpx', fontWeight: 'bold', color: '#8B5CF6' }}>Lv.{item.level || 1}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
