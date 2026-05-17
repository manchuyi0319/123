import { View, Text, Button, Input } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { fetchStudents, addStudent, updateStudentPoints, fetchStudentPets, feedAllPets } from '../../api';

export default function StudentsPage() {
  const { auth } = useApp();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [classId, setClassId] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const [pointsStudent, setPointsStudent] = useState<any>(null);
  const [pointsChange, setPointsChange] = useState('1');
  const [pointsReason, setPointsReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [petsStudent, setPetsStudent] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [petsLoading, setPetsLoading] = useState(false);

  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const params = instance.router?.params || {};
    setClassId(params.classId || '');
    setClassName(params.className || '');
    if (params.classId) loadStudents(params.classId);
  }, []);

  const loadStudents = async (cid?: string) => {
    try {
      const res = await fetchStudents(cid || classId);
      setStudents(res.data || []);
    } catch (err) { console.error('加载学生失败'); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await addStudent(classId, newName.trim());
      setShowAdd(false); setNewName('');
      loadStudents();
      Taro.showToast({ title: '添加成功', icon: 'success' });
    } catch (err: any) {
      Taro.showToast({ title: err.message || '添加失败', icon: 'error' });
    } finally { setAdding(false); }
  };

  const PRESETS = [
    { label: '举手+1', change: 1, reason: '积极举手', category: 'participation' },
    { label: '作业优秀+2', change: 2, reason: '作业优秀', category: 'homework' },
    { label: '帮助同学+3', change: 3, reason: '帮助同学', category: 'behavior' },
    { label: '迟到-1', change: -1, reason: '迟到', category: 'attendance' },
    { label: '未交作业-2', change: -2, reason: '未交作业', category: 'homework' },
    { label: '自定义', change: 0, reason: '', category: 'other' },
  ];

  const handlePoints = async () => {
    const change = parseInt(pointsChange) || 0;
    if (change === 0 || !pointsReason.trim()) {
      Taro.showToast({ title: '请填写分值和理由', icon: 'none' }); return;
    }
    setSubmitting(true);
    try {
      await updateStudentPoints(pointsStudent.id, change, pointsReason.trim(), 'custom');
      loadStudents(); setPointsStudent(null);
      Taro.showToast({ title: `${change > 0 ? '+' : ''}${change} 分`, icon: 'success' });
    } catch (err: any) {
      Taro.showToast({ title: err.message || '操作失败', icon: 'error' });
    } finally { setSubmitting(false); }
  };

  const openPets = async (student: any) => {
    setPetsStudent(student); setPetsLoading(true);
    try {
      const res = await fetchStudentPets(student.id);
      setPets(res.data || []);
    } catch (err) { setPets([]); }
    finally { setPetsLoading(false); }
  };

  const handleFeedAll = async () => {
    try {
      await feedAllPets(petsStudent.id);
      Taro.showToast({ title: '喂养成功', icon: 'success' });
      const res = await fetchStudentPets(petsStudent.id);
      setPets(res.data || []);
    } catch (err: any) {
      Taro.showToast({ title: err.message || '喂养失败', icon: 'error' });
    }
  };

  if (!auth.token) { Taro.redirectTo({ url: '/pages/index/index' }); return null; }

  const RARITY_LABELS: Record<string, string> = {
    common: '普通', rare: '稀有', epic: '史诗', legendary: '传说', mythical: '神话', fierce: '凶兽',
  };

  return (
    <View>
      <View style={{ background: '#4F46E5', padding: '32rpx', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: '24rpx', opacity: 0.8, display: 'block' }}>{className}</Text>
          <Text style={{ fontSize: '36rpx', fontWeight: 'bold', display: 'block', marginTop: '4rpx' }}>{students.length} 名学生</Text>
        </View>
        <View onClick={() => setShowAdd(true)} style={{ background: 'rgba(255,255,255,0.2)', padding: '16rpx 24rpx', borderRadius: '12rpx' }}>
          <Text style={{ fontSize: '28rpx', color: '#fff' }}>+ 添加</Text>
        </View>
      </View>

      {loading ? (
        <View className="loading-center"><Text style={{ color: '#9CA3AF' }}>加载中...</Text></View>
      ) : students.length === 0 ? (
        <View className="empty-state"><Text className="empty-state-icon">👨‍🎓</Text><Text style={{ fontSize: '28rpx' }}>暂无学生</Text></View>
      ) : (
        <View style={{ padding: '24rpx' }}>
          {students.map((s: any) => (
            <View key={s.id} className="card" style={{ margin: '0 0 16rpx 0' }}>
              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: '34rpx', fontWeight: 'bold', color: '#1F2937', display: 'block' }}>{s.name}</Text>
                  <Text style={{ fontSize: '28rpx', color: '#F59E0B', display: 'block', marginTop: '4rpx' }}>⭐ {s.total_points || 0} 分</Text>
                </View>
                <View style={{ display: 'flex', gap: '12rpx' }}>
                  <View onClick={() => { setPointsStudent(s); setPointsChange('1'); setPointsReason(''); }} className="btn btn-sm" style={{ background: '#EEF2FF', color: '#4F46E5' }}>积分</View>
                  <View onClick={() => openPets(s)} className="btn btn-sm" style={{ background: '#FEF3C7', color: '#D97706' }}>宠物</View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 添加弹窗 */}
      {showAdd && (
        <View className="modal-overlay" onClick={() => setShowAdd(false)}>
          <View className="modal-content" onClick={e => e.stopPropagation()}>
            <Text style={{ fontSize: '34rpx', fontWeight: 'bold', display: 'block', marginBottom: '32rpx' }}>添加学生</Text>
            <View className="input-group">
              <Text className="input-label">学生姓名</Text>
              <Input value={newName} onInput={e => setNewName(e.detail.value)} placeholder="请输入姓名" className="input-field" />
            </View>
            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button onClick={() => setShowAdd(false)} className="btn btn-ghost" style={{ flex: 1 }}>取消</Button>
              <Button onClick={handleAdd} loading={adding} className="btn btn-primary" style={{ flex: 1 }}>添加</Button>
            </View>
          </View>
        </View>
      )}

      {/* 积分弹窗 */}
      {pointsStudent && (
        <View className="modal-overlay" onClick={() => setPointsStudent(null)}>
          <View className="modal-content" onClick={e => e.stopPropagation()}>
            <Text style={{ fontSize: '34rpx', fontWeight: 'bold', display: 'block', marginBottom: '8rpx' }}>{pointsStudent.name}</Text>
            <Text style={{ fontSize: '28rpx', color: '#F59E0B', display: 'block', marginBottom: '24rpx' }}>⭐ 当前 {pointsStudent.total_points || 0} 分</Text>

            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx', marginBottom: '24rpx' }}>
              {PRESETS.map((p, i) => (
                <View key={i} onClick={() => {
                  if (p.label !== '自定义') { setPointsChange(String(Math.abs(p.change))); setPointsReason(p.reason); }
                }} style={{ padding: '12rpx 20rpx', borderRadius: '10rpx', fontSize: '24rpx', background: p.change > 0 ? '#F0FDF4' : p.change < 0 ? '#FEF2F2' : '#F3F4F6', color: p.change > 0 ? '#22C55E' : p.change < 0 ? '#EF4444' : '#6B7280' }}>
                  {p.label}
                </View>
              ))}
            </View>

            <View style={{ display: 'flex', gap: '16rpx', marginBottom: '24rpx', alignItems: 'center' }}>
              <View onClick={() => setPointsChange(String(Math.max(1, parseInt(pointsChange || '0') - 1)))} style={{ padding: '12rpx 24rpx', background: '#F3F4F6', borderRadius: '8rpx', fontSize: '32rpx' }}>-</View>
              <Input value={pointsChange} onInput={e => setPointsChange(e.detail.value)} type="number" style={{ flex: 1, textAlign: 'center', border: '2rpx solid #E5E7EB', borderRadius: '8rpx', padding: '12rpx', fontSize: '36rpx', fontWeight: 'bold' }} />
              <View onClick={() => setPointsChange(String((parseInt(pointsChange || '0')) + 1))} style={{ padding: '12rpx 24rpx', background: '#F3F4F6', borderRadius: '8rpx', fontSize: '32rpx' }}>+</View>
            </View>

            <View className="input-group">
              <Text className="input-label">理由</Text>
              <Input value={pointsReason} onInput={e => setPointsReason(e.detail.value)} placeholder="加分/扣分理由" className="input-field" />
            </View>

            <View style={{ display: 'flex', gap: '16rpx', marginTop: '32rpx' }}>
              <Button onClick={() => setPointsStudent(null)} className="btn btn-ghost" style={{ flex: 1 }}>取消</Button>
              <Button onClick={handlePoints} loading={submitting} className="btn btn-primary" style={{ flex: 1 }}>确认</Button>
            </View>
          </View>
        </View>
      )}

      {/* 宠物详情弹窗 */}
      {petsStudent && (
        <View className="modal-overlay" onClick={() => setPetsStudent(null)}>
          <View className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '640rpx' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24rpx' }}>
              <Text style={{ fontSize: '34rpx', fontWeight: 'bold' }}>{petsStudent.name} 的宠物</Text>
              <Text onClick={() => setPetsStudent(null)} style={{ fontSize: '36rpx', color: '#9CA3AF' }}>✕</Text>
            </View>
            {petsLoading ? (
              <View className="loading-center"><Text style={{ color: '#9CA3AF' }}>加载中...</Text></View>
            ) : pets.length === 0 ? (
              <View style={{ textAlign: 'center', padding: '48rpx' }}><Text style={{ fontSize: '60rpx', display: 'block' }}>🐾</Text><Text style={{ color: '#9CA3AF', display: 'block', marginTop: '16rpx' }}>暂无宠物</Text></View>
            ) : (
              <View>
                {pets.map((p: any) => (
                  <View key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16rpx', padding: '20rpx 0', borderBottom: '1rpx solid #F3F4F6' }}>
                    <Text style={{ fontSize: '60rpx' }}>{p.emoji || '🐾'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '28rpx', fontWeight: 'bold', display: 'block' }}>{p.nickname || p.pet_name}</Text>
                      <Text style={{ fontSize: '22rpx', color: '#9CA3AF', display: 'block' }}>{RARITY_LABELS[p.rarity] || p.rarity} · Lv.{p.level || 1} · {p.current_exp || 0} EXP</Text>
                    </View>
                    <Text className={`tag tag-${p.rarity}`}>{RARITY_LABELS[p.rarity] || p.rarity}</Text>
                  </View>
                ))}
                <Button onClick={handleFeedAll} className="btn btn-primary" style={{ width: '100%', marginTop: '24rpx' }}>
                  🍖 一键喂养全部 ({pets.length}只 · {pets.length * 5}积分)
                </Button>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
