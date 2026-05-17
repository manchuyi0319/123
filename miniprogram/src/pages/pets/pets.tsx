import { View, Text, Button, Input } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { fetchPets, fetchClasses, fetchStudents, adoptPet } from '../../api';

const RARITY_ORDER = ['mythical', 'fierce', 'legendary', 'epic', 'rare', 'common'];
const RARITY_LABELS: Record<string, string> = {
  common: '普通', rare: '稀有', epic: '史诗', legendary: '传说', mythical: '神话', fierce: '凶兽',
};

export default function PetsPage() {
  const { auth } = useApp();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRarity, setFilterRarity] = useState('all');

  const [adoptPetData, setAdoptPetData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [adoptStudentId, setAdoptStudentId] = useState('');
  const [adoptNickname, setAdoptNickname] = useState('');
  const [adopting, setAdopting] = useState(false);

  useEffect(() => {
    if (!auth.token) { Taro.redirectTo({ url: '/pages/index/index' }); return; }
    loadPets();
  }, [auth.token]);

  const loadPets = async () => {
    try {
      const res = await fetchPets();
      setPets(res.data || []);
    } catch (err) { console.error('加载宠物失败'); }
    finally { setLoading(false); }
  };

  const filteredPets = filterRarity === 'all' ? pets : pets.filter(p => p.rarity === filterRarity);

  const grouped = RARITY_ORDER
    .map(rarity => ({ rarity, label: RARITY_LABELS[rarity] || rarity, pets: filteredPets.filter(p => p.rarity === rarity) }))
    .filter(g => g.pets.length > 0);

  const openAdopt = async (pet: any) => {
    setAdoptPetData(pet);
    setAdoptStudentId('');
    setAdoptNickname('');
    try {
      const res = await fetchClasses();
      setClasses(res.data || []);
    } catch (err) { setClasses([]); }
  };

  const onClassChange = async (cid: string) => {
    setSelectedClassId(cid);
    setAdoptStudentId('');
    if (!cid) { setStudents([]); return; }
    try {
      const res = await fetchStudents(cid);
      setStudents(res.data || []);
    } catch (err) { setStudents([]); }
  };

  const handleAdopt = async () => {
    if (!adoptStudentId) { Taro.showToast({ title: '请选择学生', icon: 'none' }); return; }
    setAdopting(true);
    try {
      await adoptPet({ student_id: adoptStudentId, pet_id: adoptPetData.id, nickname: adoptNickname.trim() || undefined });
      setAdoptPetData(null);
      Taro.showToast({ title: '领养成功！', icon: 'success' });
    } catch (err: any) {
      Taro.showToast({ title: err.message || '领养失败', icon: 'error' });
    } finally { setAdopting(false); }
  };

  if (!auth.token) return null;

  const FILTERS = [
    { key: 'all', label: '全部', emoji: '🐾' },
    { key: 'mythical', label: '神话', emoji: '🔴' },
    { key: 'fierce', label: '凶兽', emoji: '👹' },
    { key: 'legendary', label: '传说', emoji: '👑' },
    { key: 'epic', label: '史诗', emoji: '💎' },
    { key: 'rare', label: '稀有', emoji: '🌟' },
    { key: 'common', label: '普通', emoji: '🍀' },
  ];

  return (
    <View>
      <View style={{ background: '#4F46E5', padding: '32rpx', color: '#fff' }}>
        <Text style={{ fontSize: '28rpx', opacity: 0.8, display: 'block' }}>宠物图鉴</Text>
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', display: 'block', marginTop: '4rpx' }}>32 种 · 全部免费</Text>
      </View>

      {/* 稀有度筛选 */}
      <View style={{ padding: '24rpx 24rpx 0' }}>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx' }}>
          {FILTERS.map(f => (
            <View key={f.key} onClick={() => setFilterRarity(f.key)}
              style={{
                padding: '12rpx 24rpx', borderRadius: '12rpx', fontSize: '26rpx', fontWeight: '500',
                background: filterRarity === f.key ? '#4F46E5' : '#F3F4F6',
                color: filterRarity === f.key ? '#fff' : '#6B7280',
              }}>
              {f.emoji} {f.label}
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="loading-center"><Text style={{ color: '#9CA3AF' }}>加载中...</Text></View>
      ) : (
        <View style={{ padding: '24rpx' }}>
          {grouped.map(group => (
            <View key={group.rarity} style={{ marginBottom: '40rpx' }}>
              <Text style={{ fontSize: '28rpx', fontWeight: 'bold', color: '#9CA3AF', marginBottom: '16rpx', display: 'block' }}>
                {group.label} ({group.pets.length} 种)
              </Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', margin: '-8rpx' }}>
                {group.pets.map((pet: any) => (
                  <View key={pet.id} style={{ width: '50%', padding: '8rpx' }}>
                    <View className="card" style={{ margin: 0, padding: '24rpx', textAlign: 'center' }}
                      onClick={() => openAdopt(pet)}>
                      <Text style={{ fontSize: '72rpx', display: 'block' }}>{pet.emoji}</Text>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', display: 'block', marginTop: '8rpx' }}>{pet.name}</Text>
                      <Text className={`tag tag-${pet.rarity}`} style={{ marginTop: '8rpx' }}>{RARITY_LABELS[pet.rarity]}</Text>
                      <View style={{ marginTop: '12rpx', background: '#22C55E', color: '#fff', borderRadius: '8rpx', padding: '8rpx', fontSize: '24rpx' }}>
                        🎁 免费领养
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 领养弹窗 */}
      {adoptPetData && (
        <View className="modal-overlay" onClick={() => setAdoptPetData(null)}>
          <View className="modal-content" onClick={e => e.stopPropagation()}>
            <View style={{ textAlign: 'center', marginBottom: '32rpx' }}>
              <Text style={{ fontSize: '80rpx', display: 'block' }}>{adoptPetData.emoji}</Text>
              <Text style={{ fontSize: '36rpx', fontWeight: 'bold', display: 'block', marginTop: '8rpx' }}>领养 {adoptPetData.name}</Text>
              <Text style={{ color: '#22C55E', fontSize: '28rpx', display: 'block', marginTop: '4rpx' }}>🎁 免费</Text>
            </View>

            <View className="input-group">
              <Text className="input-label">选择班级</Text>
              <View style={{ maxHeight: '300rpx', overflowY: 'auto', border: '2rpx solid #E5E7EB', borderRadius: '12rpx' }}>
                {classes.map((c: any) => (
                  <View key={c.id} onClick={() => onClassChange(c.id)}
                    style={{
                      padding: '20rpx 24rpx', borderBottom: '1rpx solid #F3F4F6',
                      background: selectedClassId === c.id ? '#EEF2FF' : '#fff',
                    }}>
                    <Text style={{ fontSize: '26rpx', color: selectedClassId === c.id ? '#4F46E5' : '#1F2937', fontWeight: selectedClassId === c.id ? 'bold' : 'normal' }}>
                      {c.name} ({c.grade || ''})
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {selectedClassId && students.length > 0 && (
              <View className="input-group">
                <Text className="input-label">领养学生</Text>
                <View style={{ maxHeight: '300rpx', overflowY: 'auto', border: '2rpx solid #E5E7EB', borderRadius: '12rpx' }}>
                  {students.map((s: any) => (
                    <View key={s.id} onClick={() => setAdoptStudentId(s.id)}
                      style={{
                        padding: '20rpx 24rpx', borderBottom: '1rpx solid #F3F4F6',
                        background: adoptStudentId === s.id ? '#EEF2FF' : '#fff',
                      }}>
                      <Text style={{ fontSize: '26rpx', color: adoptStudentId === s.id ? '#4F46E5' : '#1F2937', fontWeight: adoptStudentId === s.id ? 'bold' : 'normal' }}>
                        {s.name} (⭐{s.total_points || 0})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className="input-group">
              <Text className="input-label">昵称（可选）</Text>
              <Input value={adoptNickname} onInput={e => setAdoptNickname(e.detail.value)} placeholder="给宠物起个名字" className="input-field" />
            </View>

            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button onClick={() => setAdoptPetData(null)} className="btn btn-ghost" style={{ flex: 1 }}>取消</Button>
              <Button onClick={handleAdopt} loading={adopting} disabled={!adoptStudentId} className="btn btn-primary" style={{ flex: 1 }}>确认领养</Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
