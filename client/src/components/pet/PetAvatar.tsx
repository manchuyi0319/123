import { RARITY_COLORS, RARITY_LABELS } from 'shared';
import { PetImage } from './PetImage';
import { PetStatusBadge } from './PetStatusBadge';

const ANIMATION_CLASS: Record<string, string> = {
  mythical: 'animate-glow-mythical',
  fierce: 'animate-glow-fierce',
  legendary: 'animate-glow-legendary',
  epic: 'animate-glow-epic',
  rare: 'animate-glow-rare',
  common: '',
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
  imageKey?: string;
  level: number;
  levelName: string;
  currentExp: number;
  progress: number;
  description?: string;
  status?: 'alive' | 'injured' | 'dead';
  onClose: () => void;
  onFeed?: () => void;
}

export function PetDetailModal({
  emoji, rarity, petName, nickname, species, imageKey, level, levelName,
  currentExp, progress, description, status, onClose, onFeed,
}: PetDetailModalProps) {
  const levelColor =
    level >= 7 ? 'from-yellow-400 to-amber-500 text-yellow-900' :
    level >= 5 ? 'from-purple-400 to-violet-500 text-purple-900' :
    level >= 3 ? 'from-blue-400 to-cyan-500 text-blue-900' :
    'from-green-400 to-emerald-500 text-green-900';

  const expBarColor =
    level >= 7 ? 'bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300' :
    level >= 5 ? 'bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300' :
    level >= 3 ? 'bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300' :
    'bg-gradient-to-r from-green-300 to-emerald-300';

  const isDead = status === 'dead';
  const isInjured = status === 'injured';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-pet-pop-in" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          {/* 大宠物头像 */}
          <div className={`mx-auto w-36 h-36 mb-4 ${isDead ? 'opacity-60 grayscale' : isInjured ? 'opacity-80' : ''}`}>
            <PetImage
              emoji={emoji}
              imageKey={imageKey}
              level={level}
              rarity={rarity}
              size="full"
              showLevel={false}
            />
          </div>

          <h2 className="text-xl font-bold text-gray-800 mt-3">
            {nickname || petName}
          </h2>
          {nickname && <p className="text-sm text-gray-400">{petName} · {species}</p>}
          {!nickname && species && <p className="text-sm text-gray-400">{species}</p>}

          {/* 状态徽章 + 稀有度 + 等级 */}
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            {status && status !== 'alive' && (
              <PetStatusBadge status={status} size="sm" />
            )}
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              rarity === 'mythical' ? 'bg-red-100 text-red-700' :
              rarity === 'fierce' ? 'bg-orange-100 text-orange-700' :
              rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
              rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
              rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {RARITY_LABELS[rarity] || rarity}
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full text-white bg-gradient-to-r ${levelColor}`}>
              Lv.{level} {levelName}
            </span>
          </div>

          {/* EXP 进度条 */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{currentExp} EXP</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${expBarColor}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {description && (
            <p className="text-sm text-gray-500 mt-3">{description}</p>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
            关闭
          </button>
          {onFeed && !isDead && (
            <button onClick={onFeed} className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-xl hover:from-yellow-500 hover:to-amber-600 transition-all text-sm font-medium shadow-md hover:shadow-lg active:scale-95">
              🍖 喂养 (5 积分)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
