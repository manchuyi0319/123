import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useSearchParams } from 'react-router-dom';
import { fetchStudents } from '../api/students';
import { fetchStudentPets, feedPet, feedAllPets } from '../api/pets';
import { getLevel, getLevelName, getLevelProgress, getExpToNextLevel } from 'shared';
import { PetCard } from '../components/pet/PetCard';
import { PetStatusBadge } from '../components/pet/PetStatusBadge';
import { LevelUpModal } from '../components/pet/LevelUpModal';

export function PetFeedingPage() {
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const { data: studentsData } = useSWR('students-all', () => fetchStudents(''));
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [feedingId, setFeedingId] = useState<string | null>(null);
  const [batchFeeding, setBatchFeeding] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [feedResult, setFeedResult] = useState<{ expGain: number; petName: string } | null>(null);
  const [batchResult, setBatchResult] = useState<{ totalExpGain: number; petCount: number; levelUps: number } | null>(null);

  const [levelUp, setLevelUp] = useState<{
    oldExp: number; newExp: number; petName: string; emoji: string; imageKey?: string;
  } | null>(null);

  const { data: petsData, error, isLoading } = useSWR(
    selectedStudentId ? ['student-pets', selectedStudentId] : null,
    () => fetchStudentPets(selectedStudentId)
  );

  const students = studentsData?.data || [];
  const pets = petsData?.data || [];
  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);

  useEffect(() => {
    if (feedResult) {
      const t = setTimeout(() => setFeedResult(null), 2000);
      return () => clearTimeout(t);
    }
  }, [feedResult]);

  useEffect(() => {
    if (batchResult) {
      const t = setTimeout(() => setBatchResult(null), 3000);
      return () => clearTimeout(t);
    }
  }, [batchResult]);

  const handleFeed = async (sp: any) => {
    const oldExp = sp.current_exp;
    setFeedingId(sp.id);
    setFeedError('');
    try {
      const result = await feedPet({ student_pet_id: sp.id });
      const newExp = result.current_exp;
      const expGain = result.exp_gain || (newExp - oldExp);

      setFeedResult({ expGain, petName: sp.nickname || sp.pet_name || '宠物' });

      if (getLevel(newExp) > getLevel(oldExp)) {
        setLevelUp({
          oldExp,
          newExp,
          petName: sp.nickname || sp.pet_name || '宠物',
          emoji: sp.emoji || '🐾',
          imageKey: sp.image_key,
        });
      }

      mutate(['student-pets', selectedStudentId]);
      mutate('students-all');
    } catch (err: any) {
      setFeedError(err.message || '喂养失败');
    } finally {
      setFeedingId(null);
    }
  };

  const handleFeedAll = async () => {
    if (!selectedStudentId) return;
    const studentPts = selectedStudent?.total_points || 0;
    const cost = pets.length * 5;
    if (studentPts < cost) {
      setFeedError(`积分不足，喂养 ${pets.length} 只宠物需要 ${cost} 积分，当前 ${studentPts} 积分`);
      return;
    }
    setBatchFeeding(true);
    setFeedError('');
    try {
      const result = await feedAllPets({ student_id: selectedStudentId });
      setBatchResult({
        totalExpGain: result.total_exp_gain,
        petCount: result.pet_count,
        levelUps: result.level_ups,
      });
      if (result.level_ups > 0) {
        const firstPet = result.data?.[0];
        if (firstPet) {
          setLevelUp({
            oldExp: Math.max(0, firstPet.current_exp - 20),
            newExp: firstPet.current_exp,
            petName: `${result.pet_count} 只宠物`,
            emoji: '🎉',
          });
        }
      }
      mutate(['student-pets', selectedStudentId]);
      mutate('students-all');
    } catch (err: any) {
      setFeedError(err.message || '批量喂养失败');
    } finally {
      setBatchFeeding(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">宠物喂养</h2>
      <p className="text-sm text-gray-400 mb-6">选择学生，喂养宠物，见证它们成长</p>

      {/* 学生选择器 */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">选择学生</label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-72 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
          >
            <option value="">请选择学生</option>
            {students.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} {s.class_name ? `· ${s.class_name}` : ''} (⭐{s.total_points})</option>
            ))}
          </select>
        </div>
        {pets.length > 0 && (
          <button
            onClick={handleFeedAll}
            disabled={batchFeeding || (selectedStudent?.total_points || 0) < pets.length * 5}
            className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-xl hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 transition-all text-sm font-medium shadow-md active:scale-95"
          >
            {batchFeeding ? '🍖 喂养中...' : `🍖 一键喂养 (${pets.length * 5} 分)`}
          </button>
        )}
      </div>

      {feedError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{feedError}</div>}

      {batchResult && (
        <div className="mb-4 px-4 py-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200 glass-card">
          🎉 已喂养 <strong>{batchResult.petCount}</strong> 只宠物，
          共获得 <strong>+{batchResult.totalExpGain} EXP</strong>
          {batchResult.levelUps > 0 && <>，<strong>{batchResult.levelUps} 只升级</strong></>}
        </div>
      )}

      {feedResult && !batchResult && (
        <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm animate-pulse">
          🍖 {feedResult.petName} 获得 <strong>+{feedResult.expGain} EXP</strong>
        </div>
      )}

      {!selectedStudentId ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-6xl mb-4">🍖</p>
          <p className="text-lg">请先选择一个学生</p>
          <p className="text-sm mt-1">选择学生后可以看到已领养的宠物并进行喂养</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🐾</p>
          <p>{selectedStudent?.name} 还没有领养宠物</p>
          <p className="text-sm mt-1">去宠物图鉴领养几只宠物吧</p>
        </div>
      ) : (
        <>
          {/* 宠物卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pets.map((sp: any) => {
              const level = getLevel(sp.current_exp);
              const levelName = getLevelName(sp.current_exp);
              const progress = getLevelProgress(sp.current_exp);
              const nextExp = getExpToNextLevel(sp.current_exp);
              const isFeeding = feedingId === sp.id;
              const isMaxLevel = level >= 8;

              return (
                <div key={sp.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* 宠物头像区 */}
                  <div className="text-center mb-3 relative">
                    <div className={`mx-auto w-28 h-28 ${sp.status === 'dead' ? 'opacity-60 grayscale' : sp.status === 'injured' ? 'opacity-80' : ''}`}>
                      <div className={`w-full h-full rounded-2xl border-4 border-white shadow-lg overflow-hidden ${
                        level >= 7 ? 'shadow-yellow-400/30' :
                        level >= 5 ? 'shadow-purple-400/25' :
                        level >= 3 ? 'shadow-blue-400/20' :
                        'shadow-gray-200'
                      }`}>
                        <span className={`w-full h-full flex items-center justify-center text-6xl ${
                          isFeeding ? 'animate-pet-bounce' : !batchFeeding ? 'animate-float' : ''
                        }`}>
                          {sp.emoji || '🐾'}
                        </span>
                      </div>
                    </div>
                    {/* 等级角标 */}
                    <div className={`absolute top-1 right-1/4 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r ${
                      level >= 7 ? 'from-yellow-400 to-amber-500' :
                      level >= 5 ? 'from-purple-400 to-violet-500' :
                      level >= 3 ? 'from-blue-400 to-cyan-500' :
                      'from-green-400 to-emerald-500'
                    }`}>
                      Lv.{level}
                    </div>
                  </div>

                  {/* 宠物信息 */}
                  <div className="text-center mb-3">
                    <h3 className="font-semibold text-gray-800">
                      {sp.nickname || sp.pet_name}
                    </h3>
                    {sp.nickname && (
                      <p className="text-xs text-gray-400">{sp.pet_name}</p>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${
                        level >= 7 ? 'from-yellow-100 to-amber-100 text-yellow-700' :
                        level >= 5 ? 'from-purple-100 to-violet-100 text-purple-700' :
                        level >= 3 ? 'from-blue-100 to-cyan-100 text-blue-700' :
                        'from-green-100 to-emerald-100 text-green-700'
                      }`}>
                        {levelName}
                      </span>
                      {sp.status && sp.status !== 'alive' && (
                        <PetStatusBadge status={sp.status} size="sm" />
                      )}
                    </div>
                  </div>

                  {/* 经验进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>EXP: {sp.current_exp}</span>
                      <span>{isMaxLevel ? '已达最高等级' : `距离下一级还需 ${nextExp} EXP`}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          level >= 7 ? 'bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300' :
                          level >= 5 ? 'bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300' :
                          level >= 3 ? 'bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300' :
                          'bg-gradient-to-r from-green-300 to-emerald-300'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 喂养按钮 */}
                  <button
                    onClick={() => handleFeed(sp)}
                    disabled={isFeeding || batchFeeding || isMaxLevel || (selectedStudent?.total_points || 0) < 5 || sp.status === 'dead'}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                      isMaxLevel
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : sp.status === 'dead'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isFeeding
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 hover:from-yellow-500 hover:to-amber-600 shadow-md'
                    } disabled:opacity-60`}
                  >
                    {isMaxLevel
                      ? '🏆 已毕业'
                      : sp.status === 'dead'
                        ? '🪦 已阵亡'
                        : isFeeding
                          ? '喂养中...'
                          : `🍖 喂养 (5 积分)`
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 升级弹窗 */}
      {levelUp && (
        <LevelUpModal
          oldExp={levelUp.oldExp}
          newExp={levelUp.newExp}
          petName={levelUp.petName}
          emoji={levelUp.emoji}
          imageKey={levelUp.imageKey}
          onClose={() => setLevelUp(null)}
        />
      )}
    </div>
  );
}
