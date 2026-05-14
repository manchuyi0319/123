import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useSearchParams } from 'react-router-dom';
import { fetchStudents } from '../api/students';
import { fetchStudentPets, feedPet } from '../api/pets';
import { getLevel, getLevelName, getLevelProgress, getExpToNextLevel } from 'shared';
import { PetAvatar } from '../components/pet/PetAvatar';
import { LevelUpModal } from '../components/pet/LevelUpModal';

export function PetFeedingPage() {
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const { data: studentsData } = useSWR('students-all', () => fetchStudents(''));
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [feedingId, setFeedingId] = useState<string | null>(null);
  const [feedError, setFeedError] = useState('');
  const [feedResult, setFeedResult] = useState<{ expGain: number; petName: string } | null>(null);

  // Level up modal state
  const [levelUp, setLevelUp] = useState<{
    oldExp: number; newExp: number; petName: string; emoji: string;
  } | null>(null);

  const { data: petsData, error, isLoading } = useSWR(
    selectedStudentId ? ['student-pets', selectedStudentId] : null,
    () => fetchStudentPets(selectedStudentId)
  );

  const students = studentsData?.data || [];
  const pets = petsData?.data || [];
  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);

  // 清除喂养结果提示
  useEffect(() => {
    if (feedResult) {
      const t = setTimeout(() => setFeedResult(null), 2000);
      return () => clearTimeout(t);
    }
  }, [feedResult]);

  const handleFeed = async (sp: any) => {
    const oldExp = sp.current_exp;
    setFeedingId(sp.id);
    setFeedError('');
    try {
      const result = await feedPet({ student_pet_id: sp.id });
      const newExp = result.current_exp;
      const expGain = result.exp_gain || (newExp - oldExp);

      setFeedResult({ expGain, petName: sp.nickname || sp.pet?.name || sp.pet_name || '宠物' });

      // 检查升级
      if (getLevel(newExp) > getLevel(oldExp)) {
        setLevelUp({
          oldExp,
          newExp,
          petName: sp.nickname || sp.pet?.name || sp.pet_name || '宠物',
          emoji: sp.pet?.emoji || sp.emoji || '🐾',
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

  const selectedPet = pets.length > 0 ? pets[0] : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">宠物喂养</h2>
      <p className="text-sm text-gray-400 mb-6">选择学生，喂养宠物，见证它们成长</p>

      {/* 学生选择器 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">选择学生</label>
        <select
          value={selectedStudentId}
          onChange={e => setSelectedStudentId(e.target.value)}
          className="w-full md:w-80 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
        >
          <option value="">请选择学生</option>
          {students.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name} {s.class_name ? `· ${s.class_name}` : ''} (⭐{s.total_points})</option>
          ))}
        </select>
      </div>

      {feedError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{feedError}</div>}

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
          {/* 喂养结果提示 */}
          {feedResult && (
            <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm animate-pulse">
              🍖 {feedResult.petName} 获得 <strong>+{feedResult.expGain} EXP</strong>
            </div>
          )}

          {/* 宠物卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pets.map((sp: any) => {
              const pet = sp.pet || sp;
              const level = getLevel(sp.current_exp);
              const levelName = getLevelName(sp.current_exp);
              const progress = getLevelProgress(sp.current_exp);
              const nextExp = getExpToNextLevel(sp.current_exp);
              const isFeeding = feedingId === sp.id;

              return (
                <div key={sp.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* 宠物头像 */}
                  <div className="text-center mb-4">
                    <PetAvatar
                      emoji={pet.emoji || '🐾'}
                      rarity={pet.rarity || 'common'}
                      size="xl"
                      animated={!isFeeding}
                    />
                  </div>

                  {/* 宠物信息 */}
                  <div className="text-center mb-3">
                    <h3 className="font-semibold text-gray-800">
                      {sp.nickname || pet.name}
                    </h3>
                    {sp.nickname && (
                      <p className="text-xs text-gray-400">{pet.name}</p>
                    )}
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      level >= 7 ? 'bg-yellow-50 text-yellow-600' :
                      level >= 5 ? 'bg-purple-50 text-purple-600' :
                      'bg-indigo-50 text-indigo-600'
                    }`}>
                      Lv.{level} {levelName}
                    </span>
                  </div>

                  {/* 经验进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>EXP: {sp.current_exp}</span>
                      <span>{nextExp !== null ? `距离下一级还需 ${nextExp} EXP` : '已达最高等级 🎉'}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          level >= 7 ? 'bg-yellow-400' :
                          level >= 5 ? 'bg-purple-400' :
                          'bg-indigo-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 喂养按钮 */}
                  <button
                    onClick={() => handleFeed(sp)}
                    disabled={isFeeding || nextExp === null || (selectedStudent?.total_points || 0) < 5}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      nextExp === null
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isFeeding
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-yellow-400 text-yellow-800 hover:bg-yellow-500 active:scale-95'
                    } disabled:opacity-60`}
                  >
                    {nextExp === null
                      ? '🏆 已满级'
                      : isFeeding
                        ? '🍖 喂养中...'
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
          onClose={() => setLevelUp(null)}
        />
      )}
    </div>
  );
}
