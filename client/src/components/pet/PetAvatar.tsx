import { RARITY_COLORS } from 'shared';

const ANIMATION_CLASS: Record<string, string> = {
  legendary: 'animate-glow-legendary',
  epic: 'animate-glow-epic',
  rare: 'animate-glow-rare',
  common: '', // 普通不闪烁
};

const SIZE_CLASS: Record<string, string> = {
  sm: 'text-2xl p-1.5',
  md: 'text-4xl p-2',
  lg: 'text-5xl p-3',
  xl: 'text-7xl p-4',
};

interface PetAvatarProps {
  emoji: string;
  rarity: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  onClick?: () => void;
}

export function PetAvatar({ emoji, rarity, size = 'md', animated = true, onClick }: PetAvatarProps) {
  const glow = ANIMATION_CLASS[rarity] || '';
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;

  return (
    <span
      onClick={onClick}
      className={`inline-block rounded-full transition-transform duration-300 select-none
        ${sizeClass} ${animated ? `animate-float ${glow}` : ''}
        ${onClick ? 'cursor-pointer hover:scale-125 active:scale-90' : ''}
      `}
      title={rarity}
    >
      {emoji}
    </span>
  );
}

// 宠物详情弹窗组件
interface PetDetailModalProps {
  emoji: string;
  rarity: string;
  petName: string;
  nickname?: string;
  species?: string;
  level: number;
  levelName: string;
  currentExp: number;
  progress: number;
  description?: string;
  onClose: () => void;
  onFeed?: () => void;
}

export function PetDetailModal({
  emoji, rarity, petName, nickname, species, level, levelName,
  currentExp, progress, description, onClose, onFeed,
}: PetDetailModalProps) {
  const levelColor =
    level >= 7 ? 'bg-yellow-400 text-yellow-900' :
    level >= 5 ? 'bg-purple-400 text-purple-900' :
    level >= 3 ? 'bg-blue-400 text-blue-900' :
    'bg-green-400 text-green-900';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-pet-pop-in" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          {/* 大宠物头像 */}
          <span className={`inline-block text-8xl p-4 rounded-full animate-float ${ANIMATION_CLASS[rarity] || ''}`}>
            {emoji}
          </span>

          <h2 className="text-xl font-bold text-gray-800 mt-3">
            {nickname || petName}
          </h2>
          {nickname && <p className="text-sm text-gray-400">{petName} · {species}</p>}
          {!nickname && species && <p className="text-sm text-gray-400">{species}</p>}

          {/* 稀有度 + 等级 */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
              rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
              rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {rarity}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full text-white ${levelColor}`}>
              Lv.{level} {levelName}
            </span>
          </div>

          {/* EXP 进度条 */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{currentExp} EXP</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  level >= 7 ? 'bg-yellow-400' :
                  level >= 5 ? 'bg-purple-400' :
                  level >= 3 ? 'bg-blue-400' :
                  'bg-green-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {description && (
            <p className="text-sm text-gray-500 mt-3">{description}</p>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">
            关闭
          </button>
          {onFeed && (
            <button onClick={onFeed} className="flex-1 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium">
              喂养 5分
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
