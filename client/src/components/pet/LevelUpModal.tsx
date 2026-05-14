import { getLevel, getLevelName } from 'shared';

interface LevelUpModalProps {
  oldExp: number;
  newExp: number;
  petName: string;
  emoji: string;
  onClose: () => void;
}

export function LevelUpModal({ oldExp, newExp, petName, emoji, onClose }: LevelUpModalProps) {
  const oldLevel = getLevel(oldExp);
  const newLevel = getLevel(newExp);

  if (newLevel <= oldLevel) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl text-center" onClick={e => e.stopPropagation()}>
        <div className="text-6xl mb-4 animate-level-up">{emoji}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">🎉 升级了！</h3>
        <p className="text-gray-600 mb-1">{petName}</p>
        <div className="flex items-center justify-center gap-3 my-4">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
            Lv.{oldLevel} {getLevelName(oldExp)}
          </span>
          <span className="text-indigo-500">→</span>
          <span className="px-3 py-1 bg-indigo-100 rounded-full text-sm font-bold text-indigo-600 animate-pulse">
            Lv.{newLevel} {getLevelName(newExp)}
          </span>
        </div>
        <div className="flex justify-center gap-2 my-3">
          {['⭐', '✨', '🌟', '💫', '⭐'].map((s, i) => (
            <span key={i} className="text-lg animate-sparkle" style={{ animationDelay: `${i * 0.15}s` }}>
              {s}
            </span>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          太棒了！
        </button>
      </div>
    </div>
  );
}
