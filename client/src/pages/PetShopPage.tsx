import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchShopPets, fetchWallet } from '../api/shop';
import { adoptPet } from '../api/pets';
import { fetchClasses } from '../api/classes';
import { fetchStudents } from '../api/students';
import { RARITY_LABELS, RARITY_COLORS, MAX_ADOPTION } from 'shared';
import { PetAvatar } from '../components/pet/PetAvatar';
import { Link } from 'react-router-dom';

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'common'];

export function PetShopPage() {
  const { data: petsData, error, isLoading } = useSWR('shop-pets', fetchShopPets);
  const { data: walletData, mutate: mutateWallet } = useSWR('wallet', fetchWallet);
  const { data: classesData } = useSWR('shop-classes', fetchClasses);
  const [selectedClassId, setSelectedClassId] = useState('');
  const { data: studentsData } = useSWR(
    selectedClassId ? ['shop-students', selectedClassId] : null,
    () => fetchStudents(selectedClassId)
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [adoptStudentId, setAdoptStudentId] = useState('');
  const [adoptNickname, setAdoptNickname] = useState('');
  const [adoptError, setAdoptError] = useState('');
  const [adopting, setAdopting] = useState(false);

  const pets = petsData?.data || [];
  const coins = walletData?.coins || 0;
  const classes = classesData?.data || [];
  const students = studentsData?.data || [];

  const grouped = RARITY_ORDER.map(rarity => ({
    rarity,
    label: RARITY_LABELS[rarity] || rarity,
    pets: pets.filter((p: any) => p.rarity === rarity),
  })).filter(g => g.pets.length > 0);

  const openBuy = (pet: any) => {
    setSelectedPet(pet);
    setAdoptStudentId('');
    setAdoptNickname('');
    setAdoptError('');
    setShowModal(true);
  };

  const handleBuy = async () => {
    if (!adoptStudentId) { setAdoptError('请选择学生'); return; }
    setAdopting(true); setAdoptError('');
    try {
      await adoptPet({
        student_id: adoptStudentId,
        pet_id: selectedPet.id,
        nickname: adoptNickname.trim() || undefined,
      });
      setShowModal(false);
      mutate('shop-pets');
      mutateWallet();
    } catch (err: any) {
      setAdoptError(err.message || '购买失败');
    } finally { setAdopting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">宠物商城</h2>
        <Link to="/wallet" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
          <span className="text-xl">🪙</span>
          <span className="text-sm font-bold text-amber-700">{coins}</span>
          <span className="text-xs text-amber-500">金币</span>
        </Link>
      </div>
      <p className="text-sm text-gray-400 mb-6">共 {pets.length} 种宠物 · 每位学生最多领养 {MAX_ADOPTION} 只</p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" /></div>
      ) : (
        grouped.map(group => (
          <div key={group.rarity} className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">{group.label} ({group.pets.length} 种)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.pets.map((pet: any) => (
                <div key={pet.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-center mb-3 flex justify-center">
                    <PetAvatar emoji={pet.emoji} rarity={pet.rarity} size="lg" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-center mb-1">{pet.name}</h4>
                  <p className="text-xs text-gray-400 text-center mb-3">{pet.species} · {RARITY_LABELS[pet.rarity]}</p>
                  <p className="text-xs text-gray-500 text-center line-clamp-2 mb-4">{pet.description}</p>
                  <button
                    onClick={() => openBuy(pet)}
                    disabled={pet.price > 0 && coins < pet.price}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      pet.price === 0
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : coins >= pet.price
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {pet.price === 0 ? '🎁 免费领养' : coins >= pet.price ? `🪙 ${pet.price} 金币购买` : `🔒 ${pet.price} 金币`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && selectedPet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <span className="text-5xl">{selectedPet.emoji}</span>
              <h3 className="text-lg font-semibold mt-2">{selectedPet.price === 0 ? '领养' : '购买'} {selectedPet.name}</h3>
              <p className="text-sm text-gray-400">
                {RARITY_LABELS[selectedPet.rarity]}
                {selectedPet.price > 0 ? ` · 🪙 ${selectedPet.price} 金币` : ' · 🎁 免费'}
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

            {selectedPet.price > 0 && (
              <div className="mt-3 p-2.5 bg-amber-50 rounded-lg text-xs text-amber-700">
                当前金币余额：<span className="font-bold">{coins}</span>
                {coins < selectedPet.price && (
                  <span className="text-red-500 ml-1">（不足，请先<Link to="/wallet" className="underline">充值</Link>）</span>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button onClick={handleBuy} disabled={adopting || (selectedPet.price > 0 && coins < selectedPet.price)}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium">
                {adopting ? '处理中...' : selectedPet.price === 0 ? '确认领养' : '确认购买'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
