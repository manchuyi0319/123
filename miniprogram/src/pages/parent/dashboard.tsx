import { View, Text, Button, Input } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { fetchParentChildren, linkChild, fetchStudentPets } from '../../api';

export default function ParentDashboard() {
  const { auth, logout } = useApp();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showLink, setShowLink] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [linking, setLinking] = useState(false);

  const [petsChild, setPetsChild] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);

  useEffect(() => {
    if (!auth.token) { Taro.redirectTo({ url: '/pages/index/index' }); return; }
    loadChildren();
  }, [auth.token]);

  const loadChildren = async () => {
    try {
      const res = await fetchParentChildren();
      setChildren(res.data || []);
    } catch (err) { console.error('加载孩子列表失败'); }
    finally { setLoading(false); }
  };

  const handleLink = async () => {
    if (!inviteCode.trim()) { Taro.showToast({ title: '请输入邀请码', icon: 'none' }); return; }
    setLinking(true);
    try {
      await linkChild(inviteCode.trim());
      setShowLink(false);
      setInviteCode('');
      loadChildren();
      Taro.showToast({ title: '关联成功，等待教师审批', icon: 'success' });
    } catch (err: any) {
      Taro.showToast({ title: err.message || '关联失败', icon: 'error' });
    } finally { setLinking(false); }
  };

  const openPets = async (child: any) => {
    setPetsChild(child);
    setPetsLoading(true);
    try {
      const res = await fetchStudentPets(child.id);
      setPets(res.data || []);
    } catch (err) { setPets([]); }
    finally { setPetsLoading(false); }
  };

  if (!auth.token) return null;

  const RARITY_LABELS: Record<string, string> = {
    common: '普通', rare: '稀有', epic: '史诗', legendary: '传说', mythical: '神话', fierce: '凶兽',
  };

  return (
    <View>
      <View style={{ background: '#4F46E5', padding: '32rpx', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: '28rpx', opacity: 0.8, display: 'block' }}>家长中心</Text>
          <Text style={{ fontSize: '36rpx', fontWeight: 'bold', display: 'block', marginTop: '4rpx' }}>
            {auth.teacher?.display_name || '家长'}
          </Text>
        </View>
        <View onClick={logout} style={{ padding: '16rpx' }}>
          <Text style={{ fontSize: '28rpx', opacity: 0.7 }}>退出</Text>
        </View>
      </View>

      <View style={{ padding: '24rpx' }}>
        <View onClick={() => setShowLink(true)} className="btn btn-outline" style={{ marginBottom: '32rpx' }}>
          🔗 关联孩子
        </View>

        {loading ? (
          <View className="loading-center"><Text style={{ color: '#9CA3AF' }}>加载中...</Text></View>
        ) : children.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-state-icon">👨‍👩‍👧</Text>
            <Text style={{ fontSize: '28rpx' }}>暂未关联孩子</Text>
            <Text style={{ fontSize: '24rpx', display: 'block', marginTop: '16rpx', color: '#D1D5DB' }}>
              联系老师获取班级邀请码
            </Text>
          </View>
        ) : (
          children.map((child: any) => (
            <View key={child.id} className="card" style={{ margin: '0 0 16rpx 0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16rpx' }}>
                <View>
                  <Text style={{ fontSize: '34rpx', fontWeight: 'bold', color: '#1F2937', display: 'block' }}>{child.name}</Text>
                  <Text style={{ fontSize: '24rpx', color: '#9CA3AF', display: 'block', marginTop: '4rpx' }}>
                    {child.class_name} · {child.grade || ''}
                  </Text>
                </View>
                <Text style={{ fontSize: '36rpx', fontWeight: 'bold', color: '#F59E0B' }}>⭐{child.total_points || 0}</Text>
              </View>

              {/* 宠物预览 */}
              {child.pets && child.pets.length > 0 && (
                <View style={{ display: 'flex', gap: '12rpx', marginBottom: '16rpx', flexWrap: 'wrap' }}>
                  {child.pets.slice(0, 5).map((p: any) => (
                    <View key={p.id} style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '48rpx', display: 'block' }}>{p.emoji || '🐾'}</Text>
                      <Text style={{ fontSize: '18rpx', color: '#9CA3AF', display: 'block', marginTop: '2rpx' }}>
                        {p.nickname || p.pet_name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View onClick={() => openPets(child)} className="btn btn-sm" style={{ background: '#FEF3C7', color: '#D97706', display: 'inline-block' }}>
                🐾 查看宠物详情
              </View>
            </View>
          ))
        )}
      </View>

      {/* 关联孩子弹窗 */}
      {showLink && (
        <View className="modal-overlay" onClick={() => setShowLink(false)}>
          <View className="modal-content" onClick={e => e.stopPropagation()}>
            <Text style={{ fontSize: '34rpx', fontWeight: 'bold', display: 'block', marginBottom: '8rpx' }}>关联孩子</Text>
            <Text style={{ fontSize: '24rpx', color: '#9CA3AF', display: 'block', marginBottom: '24rpx' }}>
              请向老师获取班级邀请码
            </Text>
            <View className="input-group">
              <Text className="input-label">邀请码</Text>
              <Input value={inviteCode} onInput={e => setInviteCode(e.detail.value.toUpperCase())} placeholder="输入邀请码" className="input-field" maxlength={8} />
            </View>
            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button onClick={() => setShowLink(false)} className="btn btn-ghost" style={{ flex: 1 }}>取消</Button>
              <Button onClick={handleLink} loading={linking} className="btn btn-primary" style={{ flex: 1 }}>关联</Button>
            </View>
          </View>
        </View>
      )}

      {/* 宠物详情弹窗 */}
      {petsChild && (
        <View className="modal-overlay" onClick={() => setPetsChild(null)}>
          <View className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '640rpx' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24rpx' }}>
              <Text style={{ fontSize: '34rpx', fontWeight: 'bold' }}>{petsChild.name} 的宠物</Text>
              <Text onClick={() => setPetsChild(null)} style={{ fontSize: '36rpx', color: '#9CA3AF' }}>✕</Text>
            </View>
            {petsLoading ? (
              <View className="loading-center"><Text style={{ color: '#9CA3AF' }}>加载中...</Text></View>
            ) : pets.length === 0 ? (
              <View style={{ textAlign: 'center', padding: '48rpx' }}><Text style={{ fontSize: '60rpx', display: 'block' }}>🐾</Text><Text style={{ color: '#9CA3AF', display: 'block', marginTop: '16rpx' }}>暂无宠物</Text></View>
            ) : (
              pets.map((p: any) => (
                <View key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16rpx', padding: '20rpx 0', borderBottom: '1rpx solid #F3F4F6' }}>
                  <Text style={{ fontSize: '60rpx' }}>{p.emoji || '🐾'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '28rpx', fontWeight: 'bold', display: 'block' }}>{p.nickname || p.pet_name}</Text>
                    <Text style={{ fontSize: '22rpx', color: '#9CA3AF', display: 'block' }}>{RARITY_LABELS[p.rarity] || p.rarity} · Lv.{p.level || 1}</Text>
                  </View>
                  <Text className={`tag tag-${p.rarity}`}>{RARITY_LABELS[p.rarity] || p.rarity}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </View>
  );
}
