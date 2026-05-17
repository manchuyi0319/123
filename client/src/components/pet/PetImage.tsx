import { LEVEL_GRADIENTS, LEVEL_BORDERS, LEVEL_GLOWS, getPetImageUrl } from 'shared';

type PetImageSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZE_MAP: Record<PetImageSize, string> = {
  sm: 'pet-avatar-container small',
  md: 'pet-avatar-container medium',
  lg: 'pet-avatar-container large',
  xl: 'pet-avatar-container xlarge',
  full: 'w-full aspect-square',
};

const PLACEHOLDER_SIZE: Record<PetImageSize, string> = {
  sm: 'pet-placeholder small',
  md: 'pet-placeholder medium',
  lg: 'pet-placeholder large',
  xl: 'pet-placeholder xlarge',
  full: 'pet-placeholder large',
};

interface PetImageProps {
  emoji: string;
  imageKey?: string;
  level?: number;
  rarity?: string;
  size?: PetImageSize;
  showLevel?: boolean;
  showLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function PetImage({
  emoji,
  imageKey,
  level = 1,
  rarity = 'common',
  size = 'md',
  showLevel = true,
  showLoading = true,
  className = '',
  onClick,
}: PetImageProps) {
  const safeLevel = Math.max(1, Math.min(8, level || 1));
  const gradient = LEVEL_GRADIENTS[safeLevel] || LEVEL_GRADIENTS[1];
  const border = LEVEL_BORDERS[safeLevel] || LEVEL_BORDERS[1];
  const glow = LEVEL_GLOWS[safeLevel] || '';

  const imageSrc = imageKey ? getPetImageUrl(imageKey, safeLevel) : null;

  const containerClass = [
    SIZE_MAP[size] || SIZE_MAP.md,
    'rounded-2xl',
    'bg-gradient-to-br',
    gradient,
    border,
    'border-4',
    glow,
    'shadow-lg',
    'relative',
    'overflow-hidden',
    'flex items-center justify-center',
    onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass} onClick={onClick} title={`Lv.${safeLevel}`}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-white/20 rounded-2xl" />

      {/* 宠物内容 */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-2">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={emoji}
            className="pet-image w-full h-full object-contain drop-shadow-md"
            loading="lazy"
          />
        ) : (
          <span className={PLACEHOLDER_SIZE[size] || PLACEHOLDER_SIZE.md}>
            {emoji}
          </span>
        )}
      </div>

      {/* 等级角标 */}
      {showLevel && (
        <div className={`level-badge bg-gradient-to-r ${
          safeLevel >= 7 ? 'from-yellow-400 to-amber-500' :
          safeLevel >= 5 ? 'from-purple-400 to-violet-500' :
          safeLevel >= 3 ? 'from-blue-400 to-cyan-500' :
          'from-gray-400 to-gray-500'
        }`}>
          Lv.{safeLevel}
        </div>
      )}

      {/* 光泽效果 (传说/史诗) */}
      {(rarity === 'mythical' || rarity === 'legendary' || rarity === 'epic') && (
        <div className="shimmer-effect absolute inset-0 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
}
