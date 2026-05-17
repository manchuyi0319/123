import { View, Text, Button } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { fetchClasses, createClass } from '../../api';

export default function ClassesPage() {
  const { auth } = useApp();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!auth.token) return;
    loadClasses();
  }, [auth.token]);

  const loadClasses = async () => {
    try {
      const res = await fetchClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error('加载班级失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createClass(newName.trim(), newGrade.trim() || '一年级');
      setShowCreate(false);
      setNewName('');
      setNewGrade('');
      loadClasses();
      Taro.showToast({ title: '创建成功', icon: 'success' });
    } catch (err: any) {
      Taro.showToast({ title: err.message || '创建失败', icon: 'error' });
    } finally {
      setCreating(false);
    }
  };

  if (!auth.token) {
    Taro.redirectTo({ url: '/pages/index/index' });
    return null;
  }

  return (
    <View>
      {/* 头部 */}
      <View style={{ background: '#4F46E5', padding: '32rpx', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: '28rpx', opacity: 0.8, display: 'block' }}>班级管理</Text>
          <Text style={{ fontSize: '36rpx', fontWeight: 'bold', display: 'block', marginTop: '4rpx' }}>
            {classes.length} 个班级
          </Text>
        </View>
        <View onClick={() => setShowCreate(true)} style={{ background: 'rgba(255,255,255,0.2)', padding: '16rpx 24rpx', borderRadius: '12rpx' }}>
          <Text style={{ fontSize: '28rpx', color: '#fff' }}>+ 新建</Text>
        </View>
      </View>

      {/* 班级列表 */}
      {loading ? (
        <View className="loading-center">
          <Text style={{ color: '#9CA3AF' }}>加载中...</Text>
        </View>
      ) : classes.length === 0 ? (
        <View className="empty-state">
          <Text className="empty-state-icon">🏫</Text>
          <Text style={{ fontSize: '28rpx' }}>暂无班级</Text>
          <Text style={{ fontSize: '24rpx', display: 'block', marginTop: '16rpx' }}>点击右上角"新建"创建第一个班级</Text>
        </View>
      ) : (
        <View style={{ padding: '24rpx' }}>
          {classes.map((c: any) => (
            <View
              key={c.id}
              className="card"
              style={{ margin: '0 0 16rpx 0' }}
              onClick={() => Taro.navigateTo({ url: `/pages/students/students?classId=${c.id}&className=${c.name}` })}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: '34rpx', fontWeight: 'bold', color: '#1F2937', display: 'block' }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#9CA3AF', display: 'block', marginTop: '8rpx' }}>
                    {c.grade || ''} · {c.student_count || 0} 名学生
                    {c.invite_code && ` · 邀请码: ${c.invite_code}`}
                  </Text>
                </View>
                <Text style={{ color: '#D1D5DB', fontSize: '40rpx' }}>›</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 创建班级弹窗 */}
      {showCreate && (
        <View className="modal-overlay" onClick={() => setShowCreate(false)}>
          <View className="modal-content" onClick={e => e.stopPropagation()}>
            <Text style={{ fontSize: '34rpx', fontWeight: 'bold', color: '#1F2937', display: 'block', marginBottom: '32rpx' }}>
              新建班级
            </Text>
            <View className="input-group">
              <Text className="input-label">班级名称</Text>
              <Input
                value={newName}
                onInput={e => setNewName(e.detail.value)}
                placeholder="如：三年级一班"
                className="input-field"
              />
            </View>
            <View className="input-group">
              <Text className="input-label">年级</Text>
              <Input
                value={newGrade}
                onInput={e => setNewGrade(e.detail.value)}
                placeholder="如：三年级"
                className="input-field"
              />
            </View>
            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button onClick={() => setShowCreate(false)} className="btn btn-ghost" style={{ flex: 1 }}>取消</Button>
              <Button onClick={handleCreate} loading={creating} className="btn btn-primary" style={{ flex: 1 }}>创建</Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
