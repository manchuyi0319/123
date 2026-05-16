import { useState } from 'react';
import useSWR from 'swr';
import { fetchStudentRankings, fetchPetRankings, fetchClassRankings } from '../api/rankings';
import { fetchClasses } from '../api/classes';
import { getLevel, getLevelName } from 'shared';
import { PetImage } from '../components/pet/PetImage';

const MEDALS = ['🥇', '🥈', '🥉'];
const TABS = [
  { key: 'students', label: '学生积分榜', icon: '⭐' },
  { key: 'pets', label: '宠物等级榜', icon: '🐾' },
  { key: 'classes', label: '班级平均分榜', icon: '🏫' },
];

const PODIUM_LAYOUT = [
  { place: 1, col: 'col-start-2', row: 'row-start-1', size: 'lg', crown: '👑' },
  { place: 2, col: 'col-start-1', row: 'row-start-2', size: 'md', medal: '🥈' },
  { place: 3, col: 'col-start-3', row: 'row-start-2', size: 'md', medal: '🥉' },
  { place: 4, col: 'col-start-1', row: 'row-start-3', size: 'sm' },
  { place: 5, col: 'col-start-3', row: 'row-start-3', size: 'sm' },
];

function PodiumCard({ item, place, tab }: { item: any; place: number; tab: string }) {
  const isFirst = place === 1;
  const avatarSize = isFirst ? 'lg' : place <= 3 ? 'md' : 'sm';

  return (
    <div className={`flex flex-col items-center ${
      isFirst ? '-mt-4' : place <= 3 ? '' : 'mt-2'
    }`}>
      {/* 皇冠/奖牌 */}
      {isFirst && <span className="text-2xl animate-bounce-slow mb-1 drop-shadow-lg">👑</span>}
      {place === 2 && <span className="text-xl mb-1">🥈</span>}
      {place === 3 && <span className="text-xl mb-1">🥉</span>}

      {/* 宠物头像 */}
      <div className={`rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br ${
        isFirst ? 'w-20 h-20 shadow-yellow-400/40' :
        place <= 3 ? 'w-16 h-16' :
        'w-14 h-14 opacity-80'
      } ${
        isFirst ? 'from-yellow-100 to-amber-100' :
        place === 2 ? 'from-gray-100 to-slate-100' :
        place === 3 ? 'from-orange-100 to-amber-100' :
        'from-white to-gray-50'
      }`}>
        {tab === 'pets' ? (
          <PetImage
            emoji={item.emoji || '🐾'}
            imageKey={item.image_key}
            level={getLevel(item.current_exp || 0)}
            size="full"
            showLevel={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${isFirst ? 'text-3xl' : 'text-2xl'} ${tab === 'students' ? '' : ''}`}>
              {tab === 'students' ? '🧑‍🎓' : '🏫'}
            </span>
          </div>
        )}
      </div>

      {/* 名字 */}
      <p className={`font-bold text-white text-center mt-2 leading-tight ${
        isFirst ? 'text-base' : 'text-sm'
      } max-w-[100px] truncate text-shadow-sm`}>
        {tab === 'pets' ? (item.nickname || item.pet_name) : item.name}
      </p>

      {/* 等级 */}
      {tab === 'pets' && (
        <p className="text-xs text-white/70 mt-0.5">
          Lv.{getLevel(item.current_exp || 0)}
        </p>
      )}

      {/* 分数 */}
      <p className={`font-bold text-white drop-shadow-md ${
        isFirst ? 'text-lg' : 'text-sm'
      }`}>
        {tab === 'classes' ? `${item.avg_points} 均分` : `${item.total_points || item.current_exp || 0} ${tab === 'students' ? '积分' : 'EXP'}`}
      </p>

      {/* 班级名 */}
      {tab !== 'classes' && item.class_name && (
        <p className="text-xs text-white/50 truncate max-w-[100px]">{item.class_name}</p>
      )}

      {/* Pedestal 底座 */}
      <div className={`w-full rounded-lg mt-2 ${
        isFirst
          ? 'h-16 podium-gold w-[100px]'
          : place === 2
            ? 'h-12 podium-silver w-[85px]'
            : place === 3
              ? 'h-10 podium-bronze w-[85px]'
              : 'h-6 bg-gradient-to-b from-gray-400 to-gray-600 w-[70px] rounded-md'
      } flex items-center justify-center shadow-xl`}>
        <span className={`font-bold text-white drop-shadow-md ${
          isFirst ? 'text-xl' : 'text-sm'
        }`}>
          {place}
        </span>
      </div>
    </div>
  );
}

export function RankingsPage() {
  const [activeTab, setActiveTab] = useState('students');
  const [filterClassId, setFilterClassId] = useState('');
  const [scope, setScope] = useState<'my' | 'all'>('my');

  const { data: classesData } = useSWR('classes', fetchClasses);
  const { data: studentsData, error: studentsError, isLoading: studentsLoading } = useSWR(
    ['rankings-students', filterClassId, scope],
    () => fetchStudentRankings(filterClassId || undefined, scope)
  );
  const { data: petsData, error: petsError, isLoading: petsLoading } = useSWR(
    ['rankings-pets', scope],
    () => fetchPetRankings(scope)
  );
  const { data: classesRankData, error: classesError, isLoading: classesLoading } = useSWR(
    ['rankings-classes', scope],
    () => fetchClassRankings(scope)
  );

  const classes = classesData?.data || [];

  const getTabData = () => {
    switch (activeTab) {
      case 'students': return { data: studentsData?.data || [], error: studentsError, loading: studentsLoading };
      case 'pets': return { data: petsData?.data || [], error: petsError, loading: petsLoading };
      case 'classes': return { data: classesRankData?.data || [], error: classesError, loading: classesLoading };
      default: return { data: [], error: null, loading: false };
    }
  };

  const { data, error, loading } = getTabData();
  const top5 = data.slice(0, 5);
  const rest = data.slice(5);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">排行榜</h2>

      {/* Scope 切换 */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-gray-500">查看范围：</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setScope('my')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              scope === 'my' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 我的
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
              scope === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🌍 全平台
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 班级筛选 */}
      {activeTab === 'students' && scope === 'my' && (
        <div className="mb-4">
          <select
            value={filterClassId}
            onChange={e => setFilterClassId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
          >
            <option value="">全部班级</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>暂无排行数据</p>
        </div>
      ) : (
        <>
          {/* ===== 领奖台区域 ===== */}
          <div className="relative rounded-3xl overflow-hidden mb-8" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          }}>
            {/* 聚光灯效果 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60 spotlight-effect pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.25) 0%, transparent 70%)' }}
            />

            {/* 标题 */}
            <div className="text-center pt-6 pb-2 relative z-10">
              <h3 className="text-white text-lg font-bold drop-shadow-lg">
                {activeTab === 'students' ? '🏆 积分之星' : activeTab === 'pets' ? '🏆 宠物天梯' : '🏆 班级争霸'}
              </h3>
            </div>

            {/* 领奖台 */}
            <div className="relative z-10 px-4 pb-6">
              <div className="flex items-end justify-center gap-3">
                {/* 第2名 */}
                {top5[1] && (
                  <div className="flex flex-col items-center">
                    {top5[1].emoji && (
                      <div className="w-16 h-16 rounded-2xl border-3 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-slate-100 mb-1">
                        <PetImage emoji={top5[1].emoji} imageKey={top5[1].image_key} level={getLevel(top5[1].current_exp || 0)} size="full" showLevel={false} />
                      </div>
                    )}
                    <span className="text-xl mb-1">🥈</span>
                    <p className="text-white text-sm font-bold truncate max-w-[80px]">{activeTab === 'pets' ? (top5[1].nickname || top5[1].pet_name) : top5[1].name}</p>
                    {activeTab === 'pets' && <p className="text-white/60 text-xs">Lv.{getLevel(top5[1].current_exp || 0)}</p>}
                    <p className="text-white text-sm font-bold">{activeTab === 'classes' ? top5[1].avg_points : top5[1].total_points || top5[1].current_exp || 0}</p>
                    <div className="podium-silver w-20 h-14 rounded-lg flex items-center justify-center shadow-xl mt-1">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                  </div>
                )}

                {/* 第1名 */}
                {top5[0] && (
                  <div className="flex flex-col items-center -mt-2">
                    <span className="text-2xl animate-bounce-slow mb-1 drop-shadow-lg">👑</span>
                    {top5[0].emoji && (
                      <div className="w-20 h-20 rounded-2xl border-4 border-yellow-300 shadow-xl shadow-yellow-400/30 overflow-hidden bg-gradient-to-br from-yellow-100 to-amber-100 mb-1">
                        <PetImage emoji={top5[0].emoji} imageKey={top5[0].image_key} level={getLevel(top5[0].current_exp || 0)} size="full" showLevel={false} />
                      </div>
                    )}
                    <span className="text-xl mb-1">🥇</span>
                    <p className="text-white text-base font-bold truncate max-w-[100px]">{activeTab === 'pets' ? (top5[0].nickname || top5[0].pet_name) : top5[0].name}</p>
                    {activeTab === 'pets' && <p className="text-white/60 text-xs">Lv.{getLevel(top5[0].current_exp || 0)}</p>}
                    <p className="text-white text-lg font-bold drop-shadow-md">{activeTab === 'classes' ? top5[0].avg_points : top5[0].total_points || top5[0].current_exp || 0}</p>
                    {top5[0].class_name && activeTab !== 'classes' && (
                      <p className="text-white/50 text-xs truncate max-w-[100px]">{top5[0].class_name}</p>
                    )}
                    <div className="podium-gold w-24 h-20 rounded-lg flex items-center justify-center shadow-2xl mt-1">
                      <span className="text-white font-bold text-2xl drop-shadow-lg">1</span>
                    </div>
                  </div>
                )}

                {/* 第3名 */}
                {top5[2] && (
                  <div className="flex flex-col items-center">
                    {top5[2].emoji && (
                      <div className="w-16 h-16 rounded-2xl border-3 border-white shadow-lg overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 mb-1">
                        <PetImage emoji={top5[2].emoji} imageKey={top5[2].image_key} level={getLevel(top5[2].current_exp || 0)} size="full" showLevel={false} />
                      </div>
                    )}
                    <span className="text-xl mb-1">🥉</span>
                    <p className="text-white text-sm font-bold truncate max-w-[80px]">{activeTab === 'pets' ? (top5[2].nickname || top5[2].pet_name) : top5[2].name}</p>
                    {activeTab === 'pets' && <p className="text-white/60 text-xs">Lv.{getLevel(top5[2].current_exp || 0)}</p>}
                    <p className="text-white text-sm font-bold">{activeTab === 'classes' ? top5[2].avg_points : top5[2].total_points || top5[2].current_exp || 0}</p>
                    <div className="podium-bronze w-20 h-10 rounded-lg flex items-center justify-center shadow-xl mt-1">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 第4-5名（小底座） */}
              {top5.length > 3 && (
                <div className="flex justify-center gap-6 mt-4">
                  {top5.slice(3, 5).map((item, i) => (
                    <div key={item.id} className="flex flex-col items-center">
                      <p className="text-white/80 text-xs font-bold truncate max-w-[70px]">{activeTab === 'pets' ? (item.nickname || item.pet_name) : item.name}</p>
                      <p className="text-white/60 text-xs">{activeTab === 'classes' ? item.avg_points : item.total_points || item.current_exp || 0}</p>
                      <div className="bg-gradient-to-b from-gray-400 to-gray-600 w-16 h-5 rounded flex items-center justify-center shadow-lg mt-0.5">
                        <span className="text-white text-xs font-bold">{i + 4}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 底部装饰条 */}
            <div className="h-8 bg-gradient-to-b from-white/10 to-transparent rounded-b-3xl" />
          </div>

          {/* ===== 其余排名 (6+) ===== */}
          {rest.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                更多排名 ({rest.length} 项)
              </h3>
              {rest.map((item: any, idx: number) => {
                const rank = idx + 6;
                return (
                  <div
                    key={item.id}
                    className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <span className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-sm font-bold text-gray-500 shadow-sm">
                      {rank}
                    </span>

                    {activeTab === 'pets' && item.emoji && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                        <PetImage emoji={item.emoji} imageKey={item.image_key} level={getLevel(item.current_exp || 0)} size="full" showLevel={false} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {activeTab === 'pets' ? (item.nickname || item.pet_name) : item.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {activeTab === 'students' && `${item.class_name || ''}`}
                        {activeTab === 'pets' && `${item.student_name || ''} · ${item.class_name || ''}`}
                        {activeTab === 'classes' && [
                          item.school, item.grade, `${item.student_count}名学生`
                        ].filter(Boolean).join(' · ') || '未设置'}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {activeTab === 'pets' && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600 mb-0.5">
                          Lv.{getLevel(item.current_exp || 0)} {getLevelName(item.current_exp || 0)}
                        </span>
                      )}
                      <p className={`font-bold text-sm ${
                        rank <= 10 ? 'text-indigo-600' : 'text-gray-500'
                      }`}>
                        {activeTab === 'classes' ? `${item.avg_points} 均分` : `${item.total_points || item.current_exp || 0} ${activeTab === 'students' ? '积分' : 'EXP'}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
