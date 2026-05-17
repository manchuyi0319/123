import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchPets, adoptPet } from '../api/pets';
import { fetchClasses } from '../api/classes';
import { fetchStudents } from '../api/students';
import { RARITY_LABELS, MAX_ADOPTION } from 'shared';
import { PetCard } from '../components/pet/PetCard';
import { PetImage } from '../components/pet/PetImage';

const RARITY_ORDER = ['mythical', 'fierce', 'legendary', 'epic', 'rare', 'common'];

export function PetsPage() {
  const { data: petsData, error, isLoading } = useSWR('pets', fetchPets);
  const { data: classesData } = useSWR('classes', fetchClasses);
  const [selectedClassId, setSelectedClassId] = useState('');
  const { data: studentsData } = useSWR(
    selectedClassId ? ['students', selectedClassId] : null,
    () => fetchStudents(selectedClassId)
  );

  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [adoptStudentId, setAdoptStudentId] = useState('');
  const [adoptNickname, setAdoptNickname] = useState('');
  const [adoptError, setAdoptError] = useState('');
  const [adopting, setAdopting] = useState(false);
  const [filterRarity, setFilterRarity] = useState<string>('all');

  const pets = petsData?.data || [];
  const classes = classesData?.data || [];
  const students = studentsData?.data || [];

  const filteredPets = filterRarity === 'all'
    ? pets
    : pets.filter((p: any) => p.rarity === filterRarity);

  const grouped = RARITY_ORDER
    .map(rarity => ({
      rarity,
      label: RARITY_LABELS[rarity] || rarity,
      pets: filteredPets.filter((p: any) => p.rarity === rarity),
    }))
    .filter(g => g.pets.length > 0);

  const openAdopt = (pet: any) => {
    setSelectedPet(pet);
    setAdoptStudentId('');
    setAdoptNickname('');
    setAdoptError('');
    setShowAdoptModal(true);
  };

  const handleAdopt = async () => {
    if (!adoptStudentId) { setAdoptError('请选择学生'); return; }
    setAdopting(true); setAdoptError('');
    try {
      await adoptPet({
        student_id: adoptStudentId,
        pet_id: selectedPet.id,
        nickname: adoptNickname.trim() || undefined,
      });
      setShowAdoptModal(false);
      mutate('pets');
    } catch (err: any) {
      setAdoptError(err.message || '领养失败');
    } finally { setAdopting(false); }
  };

  return (
    <div>
      {/* 顶部栏 */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">宠物图鉴</h2>
      </div>
      <p className="text-sm text-gray-400 mb-4">共 {pets.length} 种宠物 · 每位学生最多领养 {MAX_ADOPTION} 只</p>

      {/* 稀有度筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: '全部', emoji: '🐾' },
          { key: 'mythical', label: '神话', emoji: '🔴' },
          { key: 'fierce', label: '凶兽', emoji: '👹' },
          { key: 'legendary', label: '传说', emoji: '👑' },
          { key: 'epic', label: '史诗', emoji: '💎' },
          { key: 'rare', label: '稀有', emoji: '🌟' },
          { key: 'common', label: '普通', emoji: '🍀' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterRarity(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              filterRarity === f.key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="mr-1">{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" /></div>
      ) : (
        grouped.map(group => (
          <div key={group.rarity} className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3 tracking-wide">
              {group.label} <span className="text-gray-300">({group.pets.length} 种)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {group.pets.map((pet: any) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name}
                  species={pet.species}
                  emoji={pet.emoji}
                  imageKey={pet.image_key}
                  rarity={pet.rarity}
                  price={0}
                  description={pet.description}
                  level={1}
                  onClick={() => openAdopt(pet)}
                  onAction={() => openAdopt(pet)}
                  actionLabel="🎁 免费领养"
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* 领养弹窗 */}
      {showAdoptModal && selectedPet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdoptModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-pet-pop-in" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="mx-auto w-28 h-28">
                <PetImage
                  emoji={selectedPet.emoji}
                  imageKey={selectedPet.image_key}
                  level={1}
                  rarity={selectedPet.rarity}
                  size="full"
                />
              </div>
              <h3 className="text-lg font-semibold mt-2">领养 {selectedPet.name}</h3>
              <p className="text-sm text-gray-400">
                {RARITY_LABELS[selectedPet.rarity]} · 🎁 免费
              </p>
            </div>

            {adoptError && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-lg text-sm">{adoptError}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择班级</label>
                <select value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); setAdoptStudentId(''); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                  <option value="">请选择班级</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedClassId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">领养学生</label>
                  <select value={adoptStudentId} onChange={e => setAdoptStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                    <option value="">请选择学生</option>
                    {students.map((s: any) => <option key={s.id} value={s.id}>{s.name} (⭐{s.total_points})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称（可选）</label>
                <input type="text" value={adoptNickname} onChange={e => setAdoptNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="给你的宠物起个名字" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdoptModal(false)} className="flex-1 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
                取消
              </button>
              <button onClick={handleAdopt} disabled={adopting}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all text-sm font-medium shadow-md active:scale-95">
                {adopting ? '领养中...' : '确认领养'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
