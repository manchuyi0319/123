import { useState, useEffect } from 'react';
import { getLevel, getLevelName } from 'shared';
import { PetImage } from './PetImage';

interface LevelUpModalProps {
  oldExp: number;
  newExp: number;
  petName: string;
  emoji: string;
  imageKey?: string;
  level?: number;
  onClose: () => void;
}

export function LevelUpModal({ oldExp, newExp, petName, emoji, imageKey, level, onClose }: LevelUpModalProps) {
  const oldLevel = getLevel(oldExp);
  const newLevel = getLevel(newExp);
  const [phase, setPhase] = useState<'show-prev' | 'transition' | 'show-current'>('show-prev');

  useEffect(() => {
    if (newLevel <= oldLevel) return;
    setPhase('show-prev');
    const t1 = setTimeout(() => setPhase('transition'), 600);
    const t2 = setTimeout(() => setPhase('show-current'), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [oldExp, newExp, oldLevel, newLevel]);

  if (newLevel <= oldLevel) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 宠物图容器 */}
        <div className="relative mx-auto w-28 h-28 mb-4">
          {/* 上一等级 */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              phase === 'show-prev'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-75'
            }`}
          >
            <PetImage
              emoji={emoji}
              imageKey={imageKey}
              level={oldLevel}
              size="full"
              showLevel={false}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
              Lv.{oldLevel} {getLevelName(oldExp)}
            </div>
          </div>

          {/* 过渡闪光 */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              phase === 'transition'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-50'
            }`}
          >
            <div className="text-4xl animate-level-up">✨</div>
          </div>

          {/* 新等级 */}
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              phase === 'show-current'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-75'
            }`}
          >
            <PetImage
              emoji={emoji}
              imageKey={imageKey}
              level={newLevel}
              size="full"
              showLevel={false}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-md">
              Lv.{newLevel} {getLevelName(newExp)}
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎉 升级了！
        </h3>
        <p className="text-gray-600 mb-1">{petName}</p>

        {/* 等级对比 */}
        <div className="flex items-center justify-center gap-3 my-4">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
            Lv.{oldLevel} {getLevelName(oldExp)}
          </span>
          <span className={`text-indigo-500 transition-all duration-300 ${phase === 'transition' ? 'scale-150' : 'scale-100'}`}>
            →
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md ${
            phase === 'show-current' ? 'animate-pulse' : ''
          }`}>
            Lv.{newLevel} {getLevelName(newExp)}
          </span>
        </div>

        {/* 星星粒子 */}
        <div className="flex justify-center gap-2 my-3">
          {['⭐', '✨', '🌟', '💫', '⭐'].map((s, i) => (
            <span
              key={i}
              className={`text-lg transition-all duration-300 ${
                phase === 'show-current' ? 'animate-sparkle' : 'opacity-0 scale-0'
              }`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {s}
            </span>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-8 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all text-sm font-medium shadow-lg hover:shadow-xl active:scale-95"
        >
          太棒了！
        </button>
      </div>
    </div>
  );
}
