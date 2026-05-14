import { RARITY_COLORS } from 'shared';

const GLOW_COLORS: Record<string, string> = {
  legendary: 'shadow-[0_0_15px_rgba(250,204,21,0.6)]',
  epic: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]',
  rare: 'shadow-[0_0_8px_rgba(59,130,246,0.4)]',
  common: '',
};

const SIZE_CLASS: Record<string, string> = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

interface PetAvatarProps {
  emoji: string;
  rarity: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  onClick?: () => void;
}

export function PetAvatar({ emoji, rarity, size = 'md', animated = true, onClick }: PetAvatarProps) {
  const glow = GLOW_COLORS[rarity] || '';
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;

  return (
    <span
      onClick={onClick}
      className={`inline-block rounded-full p-2 transition-transform duration-300 select-none
        ${sizeClass} ${glow}
        ${animated ? 'animate-float' : ''}
        ${onClick ? 'cursor-pointer hover:scale-125 active:scale-90' : ''}
      `}
      title={rarity}
    >
      {emoji}
    </span>
  );
}
