export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000];

export const LEVEL_NAMES = ['初生', '成长', '少年', '青年', '成熟', '精英', '王者', '传说'];

export const LEVEL_COLORS = [
  'bg-gray-400',
  'bg-green-400',
  'bg-green-500',
  'bg-blue-400',
  'bg-blue-500',
  'bg-purple-400',
  'bg-purple-500',
  'bg-yellow-400',
];

export function getLevel(exp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelName(exp: number): string {
  return LEVEL_NAMES[getLevel(exp) - 1];
}

export function getExpToNextLevel(exp: number): number | null {
  const level = getLevel(exp);
  if (level >= 8) return null;
  return LEVEL_THRESHOLDS[level] - exp;
}

export function getLevelProgress(exp: number): number {
  const level = getLevel(exp);
  if (level >= 8) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  return Math.round(((exp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
}
