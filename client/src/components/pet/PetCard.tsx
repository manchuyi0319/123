import { RARITY_LABELS, RARITY_GRADIENTS, RARITY_GLOW } from 'shared';
import { PetImage } from './PetImage';

interface PetCardProps {
  id: string;
  name: string;
  species: string;
  emoji: string;
  imageKey?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical' | 'fierce';
  price: number;
  description?: string;
  coins?: number;
  level?: number;
  onClick?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionClass?: string;
  status?: 'alive' | 'injured' | 'dead';
  nickname?: string;
}

export function PetCard({
  name,
  species,
  emoji,
  imageKey,
  rarity,
  price,
  description,
  coins,
  level = 1,
  onClick,
  onAction,
  actionLabel,
  actionDisabled,
  actionClass,
  status,
  nickname,
}: PetCardProps) {
  const gradient = RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS.common;
  const glow = RARITY_GLOW[rarity] || '';

  const statusOverlay = status && status !== 'alive' ? (
    <div className={`pet-status-overlay ${status}`}>
      {status === 'injured' ? '🩹 受伤中' : '🪦 已阵亡'}
    </div>
  ) : null;

  const cardOpacity = status === 'dead' ? 'opacity-75 grayscale-[30%]' : status === 'injured' ? 'opacity-90' : '';

  const defaultActionLabel = price === 0 ? '🎁 免费领养' : `🪙 ${price} 金币`;
  const defaultActionClass = price === 0
    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md';

  return (
    <div
      className={`pet-card bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden ${glow} ${cardOpacity} cursor-pointer`}
      onClick={onClick}
    >
      {/* 宠物图片区 */}
      <div className="relative aspect-square bg-gradient-to-br from-white/60 to-white/20">
        <PetImage
          emoji={emoji}
          imageKey={imageKey}
          level={level}
          rarity={rarity}
          size="full"
          showLevel={true}
        />
        {statusOverlay}
      </div>

      {/* 信息区 */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {nickname || name}
            </h3>
            {nickname && (
              <p className="text-xs text-gray-400">{name}</p>
            )}
          </div>
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
            rarity === 'mythical' ? 'bg-red-100 text-red-700' :
            rarity === 'fierce' ? 'bg-orange-100 text-orange-700' :
            rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
            rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
            rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {RARITY_LABELS[rarity]}
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-1">{species}</p>

        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
        )}

        {/* 操作按钮 */}
        {onAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            disabled={actionDisabled}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              actionDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : (actionClass || defaultActionClass)
            }`}
          >
            {actionDisabled && price > 0 && coins !== undefined && coins < price
              ? `🔒 金币不足 (${coins}/${price})`
              : actionLabel || defaultActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
