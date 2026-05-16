interface PetStatusBadgeProps {
  status: 'alive' | 'injured' | 'dead';
  size?: 'sm' | 'md';
}

export function PetStatusBadge({ status, size = 'md' }: PetStatusBadgeProps) {
  if (status === 'alive') return null;

  const config = {
    injured: { emoji: '🩹', text: '受伤中', className: 'bg-orange-100 text-orange-700 border-orange-300' },
    dead: { emoji: '🪦', text: '已阵亡', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  }[status];

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClass} ${config.className} rounded-full border font-medium`}>
      <span>{config.emoji}</span>
      <span>{config.text}</span>
    </span>
  );
}
