import { useState, useEffect } from 'react';
import { PetImage } from './PetImage';

type StatusEvent = 'injured' | 'death' | 'revive' | 'heal';

interface PetStatusModalProps {
  show: boolean;
  type: StatusEvent;
  petName: string;
  petType?: string;
  petEmoji?: string;
  petLevel?: number;
  petImageKey?: string;
  damagePoints?: number;
  onClose: () => void;
}

const STATUS_CONFIG: Record<StatusEvent, {
  title: string;
  subtitle: string;
  emoji: string;
  borderColor: string;
  shadowColor: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
}> = {
  injured: {
    title: '宠物受伤了！',
    subtitle: '快加油恢复吧！',
    emoji: '🩹',
    borderColor: 'border-orange-400',
    shadowColor: 'shadow-orange-400/50',
    gradientFrom: 'from-orange-300',
    gradientTo: 'to-red-300',
    textColor: 'text-orange-500',
  },
  death: {
    title: '宠物阵亡了',
    subtitle: '',
    emoji: '🪦',
    borderColor: 'border-gray-400',
    shadowColor: 'shadow-gray-400/50',
    gradientFrom: 'from-gray-300',
    gradientTo: 'to-gray-400',
    textColor: 'text-gray-600',
  },
  revive: {
    title: '宠物复活了！',
    subtitle: '太棒了！继续加油！',
    emoji: '✨',
    borderColor: 'border-green-400',
    shadowColor: 'shadow-green-400/50',
    gradientFrom: 'from-green-300',
    gradientTo: 'to-emerald-300',
    textColor: 'text-green-500',
  },
  heal: {
    title: '恢复健康！',
    subtitle: '宠物状态良好',
    emoji: '💚',
    borderColor: 'border-teal-400',
    shadowColor: 'shadow-teal-400/50',
    gradientFrom: 'from-teal-300',
    gradientTo: 'to-cyan-300',
    textColor: 'text-teal-500',
  },
};

export function PetStatusModal({
  show,
  type,
  petName,
  petEmoji = '🐾',
  petLevel = 1,
  petImageKey,
  damagePoints,
  onClose,
}: PetStatusModalProps) {
  const [phase, setPhase] = useState<'start' | 'show' | 'end'>('start');

  useEffect(() => {
    if (show) {
      setPhase('start');
      const t1 = setTimeout(() => setPhase('show'), 100);
      const t2 = setTimeout(() => setPhase('end'), 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [show]);

  if (!show) return null;

  const config = STATUS_CONFIG[type];
  const subtitle = type === 'death' && damagePoints && damagePoints > 0
    ? `还需 ${damagePoints} 分可以复活`
    : config.subtitle;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center transition-all duration-500 transform
          ${phase === 'start' ? 'scale-90 opacity-0' : phase === 'show' ? 'scale-100 opacity-100' : 'scale-100 opacity-100'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* 宠物图 */}
        <div className={`mx-auto w-32 h-32 mb-4 ${config.borderColor} ${config.shadowColor} shadow-lg border-4 rounded-2xl overflow-hidden`}>
          <PetImage
            emoji={petEmoji}
            imageKey={petImageKey}
            level={petLevel}
            size="full"
            showLevel={false}
          />
        </div>

        {/* 状态emoji动画 */}
        <div className={`text-5xl mb-3 animate-bounce-slow ${config.textColor}`}>
          {config.emoji}
        </div>

        <h3 className={`text-xl font-bold mb-1 ${config.textColor}`}>
          {config.title}
        </h3>

        <p className="text-gray-500 text-sm mb-1">{petName}</p>

        {subtitle && (
          <p className="text-gray-400 text-xs">{subtitle}</p>
        )}

        <button
          onClick={onClose}
          className={`mt-6 px-8 py-2.5 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-lg`}
        >
          {type === 'injured' || type === 'death' ? '知道了' : '太棒了！'}
        </button>
      </div>
    </div>
  );
}
