import { useState } from 'react';
import useSWR from 'swr';
import { fetchStudentRankings, fetchPetRankings, fetchClassRankings } from '../api/rankings';
import { fetchClasses } from '../api/classes';
import { getLevel, getLevelName } from 'shared';

const MEDALS = ['🥇', '🥈', '🥉'];
const TABS = [
  { key: 'students', label: '学生积分榜' },
  { key: 'pets', label: '宠物等级榜' },
  { key: 'classes', label: '班级平均分榜' },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank < 3) {
    return <span className="text-2xl">{MEDALS[rank]}</span>;
  }
  return <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">{rank + 1}</span>;
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

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">排行榜</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setScope('my')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              scope === 'my' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            我的
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              scope === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            全平台
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        {scope === 'all' ? '查看所有教师的班级和学生排名' : '查看自己班级的学生排名'}
      </p>

      {/* Tab 切换 */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 班级筛选（仅学生榜 + 我的模式） */}
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

      {/* 内容区 */}
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>}

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {data.map((item: any, idx: number) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-5 py-4 ${
                idx < data.length - 1 ? 'border-b border-gray-50' : ''
              } hover:bg-gray-50 transition-colors`}
            >
              <RankBadge rank={idx} />

              {activeTab === 'students' && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.class_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{item.total_points}</p>
                    <p className="text-xs text-gray-400">积分</p>
                  </div>
                </>
              )}

              {activeTab === 'pets' && (
                <>
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {item.nickname || item.pet_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.student_name} · {item.class_name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600 mb-1">
                      Lv.{getLevel(item.current_exp)} {getLevelName(item.current_exp)}
                    </span>
                    <p className="text-xs text-gray-400">{item.current_exp} EXP</p>
                  </div>
                </>
              )}

              {activeTab === 'classes' && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.grade || '未设置年级'} · {item.student_count} 名学生</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{item.avg_points}</p>
                    <p className="text-xs text-gray-400">平均分</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
