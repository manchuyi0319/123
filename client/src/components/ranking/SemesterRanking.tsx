import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchSemesterRewards, updateSemesterRewards, fetchSemesterStudentRankings, fetchSemesterPetRankings, fetchSemesterClassRankings } from '../../api/semester';
import { getLevel, getLevelName } from 'shared';
import { PetAvatar } from '../pet/PetAvatar';
import { useAuth } from '../../context/AuthContext';

const MEDALS = ['🥇', '🥈', '🥉'];
const CATEGORY_TABS = [
  { key: 'students', label: '学生积分榜' },
  { key: 'pets', label: '宠物等级榜' },
  { key: 'classes', label: '班级平均分榜' },
];

export function SemesterRanking() {
  const { teacher } = useAuth();
  const isAdmin = teacher?.role === 'admin';
  const [activeCategory, setActiveCategory] = useState('students');
  const [editing, setEditing] = useState(false);

  const { data: rewardsData } = useSWR('semester-rewards', fetchSemesterRewards);
  const { data: studentsData, isLoading: sLoading } = useSWR(
    activeCategory === 'students' ? 'semester-rankings-students' : null,
    fetchSemesterStudentRankings
  );
  const { data: petsData, isLoading: pLoading } = useSWR(
    activeCategory === 'pets' ? 'semester-rankings-pets' : null,
    fetchSemesterPetRankings
  );
  const { data: classesData, isLoading: cLoading } = useSWR(
    activeCategory === 'classes' ? 'semester-rankings-classes' : null,
    fetchSemesterClassRankings
  );

  const rewards = rewardsData?.data || [];

  const getReward = (rank: number) => {
    const rankNum = rank + 1;
    return rewards.find((r: any) =>
      r.category === activeCategory && rankNum >= r.rank_start && rankNum <= r.rank_end
    );
  };

  const getTabData = () => {
    switch (activeCategory) {
      case 'students': return { data: studentsData?.data || [], loading: sLoading };
      case 'pets': return { data: petsData?.data || [], loading: pLoading };
      case 'classes': return { data: classesData?.data || [], loading: cLoading };
      default: return { data: [], loading: false };
    }
  };

  const { data, loading } = getTabData();

  // Admin reward editor
  const [editRewards, setEditRewards] = useState<any[]>([]);

  const startEditing = () => {
    setEditRewards(rewards.map((r: any) => ({
      id: r.id,
      category: r.category,
      rank_start: r.rank_start,
      rank_end: r.rank_end,
      reward: r.reward,
    })));
    setEditing(true);
  };

  const saveRewards = async () => {
    try {
      await updateSemesterRewards(editRewards);
      setEditing(false);
      mutate('semester-rewards');
    } catch (err: any) {
      alert(err.message || '保存失败');
    }
  };

  const addRewardRow = (category: string) => {
    setEditRewards([...editRewards, { category, rank_start: 1, rank_end: 1, reward: '' }]);
  };

  const updateRewardRow = (idx: number, field: string, value: any) => {
    const updated = [...editRewards];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditRewards(updated);
  };

  const removeRewardRow = (idx: number) => {
    setEditRewards(editRewards.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">学期实物奖励</h3>
        {isAdmin && !editing && (
          <button
            onClick={startEditing}
            className="text-sm text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-50"
          >
            编辑奖励
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              取消
            </button>
            <button
              onClick={saveRewards}
              className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
            >
              保存
            </button>
          </div>
        )}
      </div>

      {/* 奖励编辑器 */}
      {editing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {(['students', 'pets', 'classes'] as const).map(cat => (
            <div key={cat} className="mb-4 last:mb-0">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                {cat === 'students' ? '学生积分榜' : cat === 'pets' ? '宠物等级榜' : '班级平均分榜'}
              </h4>
              {editRewards.filter((r: any) => r.category === cat).map((r: any, idx: number) => {
                const globalIdx = editRewards.findIndex((er: any) => er === r);
                return (
                  <div key={globalIdx} className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 w-12">排名</span>
                    <input
                      type="number"
                      value={r.rank_start}
                      onChange={e => updateRewardRow(globalIdx, 'rank_start', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      min={1}
                    />
                    <span className="text-xs text-gray-400">-</span>
                    <input
                      type="number"
                      value={r.rank_end}
                      onChange={e => updateRewardRow(globalIdx, 'rank_end', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      min={1}
                    />
                    <input
                      type="text"
                      value={r.reward}
                      onChange={e => updateRewardRow(globalIdx, 'reward', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="奖品描述"
                      maxLength={200}
                    />
                    <button
                      onClick={() => removeRewardRow(globalIdx)}
                      className="text-red-400 hover:text-red-600 text-sm px-1"
                    >
                      删除
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => addRewardRow(cat)}
                className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
              >
                + 添加档位
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 奖励展示 */}
      {!editing && rewards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {(['students', 'pets', 'classes'] as const).map(cat => {
            const catRewards = rewards.filter((r: any) => r.category === cat);
            if (catRewards.length === 0) return null;
            return (
              <div key={cat} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <h4 className="text-xs font-semibold text-amber-800 mb-2">
                  {cat === 'students' ? '👨‍🎓 学生积分榜' : cat === 'pets' ? '🐾 宠物等级榜' : '🏫 班级平均分榜'}
                </h4>
                {catRewards.map((r: any) => {
                  const range = r.rank_start === r.rank_end ? `第${r.rank_start}名` : `第${r.rank_start}-${r.rank_end}名`;
                  return (
                    <p key={r.id} className="text-xs text-amber-700">
                      <span className="font-medium">{range}</span>：{r.reward}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* 排名 tab 切换 */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 排名列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">暂无排行数据</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {data.map((item: any, idx: number) => {
            const reward = getReward(idx);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  idx < data.length - 1 ? 'border-b border-gray-50' : ''
                } hover:bg-gray-50 transition-colors`}
              >
                <span className="text-2xl w-8 text-center flex-shrink-0">
                  {idx < 3 ? MEDALS[idx] : <span className="text-sm text-gray-400 font-bold">{idx + 1}</span>}
                </span>

                {activeCategory === 'students' && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.class_name} {item.grade ? item.grade + '年级' : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-indigo-600">{item.total_points}</p>
                      <p className="text-xs text-gray-400">积分</p>
                    </div>
                  </>
                )}

                {activeCategory === 'pets' && (
                  <>
                    <PetAvatar emoji={item.emoji} rarity={item.rarity} size="sm" animated={idx < 3} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.nickname || item.pet_name}</p>
                      <p className="text-xs text-gray-400">{item.student_name} · {item.class_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600 mb-1">
                        Lv.{getLevel(item.current_exp)} {getLevelName(item.current_exp)}
                      </span>
                      <p className="text-xs text-gray-400">{item.current_exp} EXP</p>
                    </div>
                  </>
                )}

                {activeCategory === 'classes' && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {[item.school, item.grade].filter(Boolean).join(' · ') || '未设置'} · {item.student_count} 名学生
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-indigo-600">{item.avg_points}</p>
                      <p className="text-xs text-gray-400">平均分</p>
                    </div>
                  </>
                )}

                {reward && (
                  <div className="flex-shrink-0 ml-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                      {reward.reward}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
