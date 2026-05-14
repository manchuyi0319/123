import { useState } from 'react';
import useSWR from 'swr';
import { fetchPublicClasses, fetchPublicClassDetail } from '../api/discover';
import { getLevel, getLevelName } from 'shared';

export function DiscoverPage() {
  const { data, error, isLoading } = useSWR('discover-classes', fetchPublicClasses);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: detailData } = useSWR(
    selectedId ? ['discover-class', selectedId] : null,
    () => fetchPublicClassDetail(selectedId!)
  );

  const classes = data?.data || [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">发现班级</h2>
      <p className="text-sm text-gray-400 mb-6">浏览全平台教师创建的班级，了解各地的教学风采</p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏫</p>
          <p>暂无公开班级</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c: any) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
              className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-all ${
                selectedId === c.id ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{c.name}</h3>
                  <p className="text-xs text-gray-400">{[c.school, c.grade].filter(Boolean).join(' · ') || '未设置学校/年级'}</p>
                </div>
                <span className="text-sm font-bold text-indigo-600">{c.student_count} 人</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>👨‍🏫 {c.teacher_name}</span>
              </div>

              {selectedId === c.id && detailData && (
                <div className="mt-4 pt-4 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                  {detailData.students?.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">学生 TOP {Math.min(5, detailData.students.length)}</p>
                      {detailData.students.slice(0, 5).map((s: any, i: number) => (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {s.name}
                          </span>
                          <span className="text-indigo-600 font-medium">{s.total_points} 分</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">暂无学生</p>
                  )}

                  {detailData.pets?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detailData.pets.slice(0, 6).map((p: any) => (
                        <span key={p.id} className="text-lg" title={`${p.pet_name} Lv.${getLevel(p.current_exp)} · ${p.student_name}`}>
                          {p.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
