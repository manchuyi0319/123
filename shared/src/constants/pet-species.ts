import type { Pet } from '../types';

export interface PetSpeciesInput {
  name: string;
  species: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  sort_order: number;
  imageKey?: string;
}

export const DEFAULT_PETS: PetSpeciesInput[] = [
  // ===== 普通 (11 种，免费) =====
  { name: '小猫咪', species: 'cat', description: '乖巧温顺的小猫咪，喜欢晒太阳和撒娇', emoji: '🐱', rarity: 'common', price: 0, sort_order: 1, imageKey: 'cat' },
  { name: '小汪汪', species: 'dog', description: '忠诚活泼的小狗，永远是你最好的伙伴', emoji: '🐶', rarity: 'common', price: 0, sort_order: 2, imageKey: 'dog' },
  { name: '跳跳兔', species: 'rabbit', description: '蹦蹦跳跳的小兔子，耳朵长长的特别可爱', emoji: '🐰', rarity: 'common', price: 0, sort_order: 3, imageKey: 'rabbit' },
  { name: '小海龟', species: 'turtle', description: '慢悠悠的小海龟，壳上有着美丽的花纹', emoji: '🐢', rarity: 'common', price: 0, sort_order: 4, imageKey: 'turtle' },
  { name: '彩蝶', species: 'butterfly', description: '五彩斑斓的小蝴蝶，翅膀上绘着大自然的画', emoji: '🦋', rarity: 'common', price: 0, sort_order: 5, imageKey: 'butterfly' },
  { name: '小仓鼠', species: 'hamster', description: '圆滚滚的小仓鼠，喜欢在轮子上跑来跑去', emoji: '🐹', rarity: 'common', price: 0, sort_order: 6, imageKey: 'hamster' },
  { name: '小金鱼', species: 'goldfish', description: '游来游去的小金鱼，鳞片在阳光下闪闪发光', emoji: '🐟', rarity: 'common', price: 0, sort_order: 7, imageKey: 'goldfish' },
  { name: '小刺猬', species: 'hedgehog', description: '背上长满小刺的刺猬宝宝，其实内心很温柔', emoji: '🦔', rarity: 'common', price: 0, sort_order: 8, imageKey: 'hedgehog' },
  { name: '小鹦鹉', species: 'parrot', description: '聪明伶俐的小鹦鹉，能学会说好多话', emoji: '🦜', rarity: 'common', price: 0, sort_order: 9, imageKey: 'parrot' },
  { name: '柯基', species: 'corgi', description: '短腿小柯基，圆滚滚的屁股走起路来超可爱', emoji: '🐕', rarity: 'common', price: 0, sort_order: 10, imageKey: 'corgi' },
  { name: '羊驼', species: 'alpaca', description: '毛茸茸的羊驼宝宝，呆萌的样子让人忍不住想抱抱', emoji: '🦙', rarity: 'common', price: 0, sort_order: 11, imageKey: 'alpaca' },

  // ===== 稀有 (6 种，10 金币) =====
  { name: '小灵狐', species: 'fox', description: '机灵可爱的小狐狸，拥有九条毛茸茸的尾巴', emoji: '🦊', rarity: 'rare', price: 10, sort_order: 12, imageKey: 'fox' },
  { name: '小熊猫', species: 'panda', description: '黑白相间的国宝，圆滚滚的特别讨人喜欢', emoji: '🐼', rarity: 'rare', price: 10, sort_order: 13, imageKey: 'panda' },
  { name: '智慧鸮', species: 'owl', description: '聪明博学的猫头鹰，戴着小小的眼镜', emoji: '🦉', rarity: 'rare', price: 10, sort_order: 14, imageKey: 'owl' },
  { name: '小企鹅', species: 'penguin', description: '摇摇摆摆的小企鹅，穿着天生的燕尾服', emoji: '🐧', rarity: 'rare', price: 10, sort_order: 15, imageKey: 'penguin' },
  { name: '麒麟', species: 'kirin', description: '祥瑞之兽麒麟幼崽，所到之处祥云环绕', emoji: '🦌', rarity: 'rare', price: 10, sort_order: 16, imageKey: 'kirin' },
  { name: '仙鹤', species: 'crane', description: '仙风道骨的仙鹤，翩翩起舞时如诗如画', emoji: '🦩', rarity: 'rare', price: 10, sort_order: 17, imageKey: 'crane' },

  // ===== 史诗 (6 种，25 金币) =====
  { name: '凤凰雏', species: 'phoenix', description: '浴火重生的神鸟幼崽，羽毛如火焰般绚烂', emoji: '🐦‍🔥', rarity: 'epic', price: 25, sort_order: 18, imageKey: 'phoenix' },
  { name: '小鲸鱼', species: 'whale', description: '海洋中的温柔巨兽，会喷出高高的水柱', emoji: '🐋', rarity: 'epic', price: 25, sort_order: 19, imageKey: 'whale' },
  { name: '玄武', species: 'xuanwu', description: '北方守护神兽，龟蛇合一的坚韧存在', emoji: '🐢', rarity: 'epic', price: 25, sort_order: 20, imageKey: 'xuanwu' },
  { name: '白虎', species: 'baihu', description: '西方守护神兽，威猛中带着王者之风', emoji: '🐅', rarity: 'epic', price: 25, sort_order: 21, imageKey: 'baihu' },
  { name: '神龙', species: 'shenlong', description: '腾云驾雾的神龙，掌控风云雷电之力', emoji: '🐉', rarity: 'epic', price: 25, sort_order: 22, imageKey: 'shenlong' },
  { name: '朱雀', species: 'zhuque', description: '南方守护神兽，烈焰中重生的不死鸟', emoji: '🦚', rarity: 'epic', price: 25, sort_order: 23, imageKey: 'zhuque' },

  // ===== 传说 (3 种，50 金币) =====
  { name: '小火龙', species: 'dragon', description: '传说中的火焰之龙，能喷出炽热的火焰', emoji: '🦎', rarity: 'legendary', price: 50, sort_order: 24, imageKey: 'dragon' },
  { name: '独角兽', species: 'unicorn', description: '纯洁优雅的魔法生物，角上闪烁着星光', emoji: '🦄', rarity: 'legendary', price: 50, sort_order: 25, imageKey: 'unicorn' },
  { name: '青龙', species: 'qinglong', description: '东方守护神兽之首，翱翔于九天之上', emoji: '🐲', rarity: 'legendary', price: 50, sort_order: 26, imageKey: 'qinglong' },
];

export const MAX_ADOPTION = 5;

export const COIN_PACKAGES = [
  { coins: 10, amount: 10, label: '10 金币', desc: '够买一只稀有宠物' },
  { coins: 25, amount: 25, label: '25 金币', desc: '够买一只史诗宠物' },
  { coins: 50, amount: 50, label: '50 金币', desc: '够买一只传说宠物' },
  { coins: 100, amount: 100, label: '100 金币', desc: '最划算，买什么都够' },
];

export const RARITY_LABELS: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export const RARITY_COLORS: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700 border-gray-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

export const RARITY_GRADIENTS: Record<string, string> = {
  legendary: 'from-yellow-50 to-amber-100 border-yellow-400 shadow-yellow-400/30',
  epic: 'from-purple-50 to-violet-100 border-purple-400 shadow-purple-400/25',
  rare: 'from-blue-50 to-cyan-100 border-blue-400 shadow-blue-400/20',
  common: 'from-white to-gray-50 border-gray-200',
};

export const RARITY_GLOW: Record<string, string> = {
  legendary: 'shadow-lg shadow-yellow-400/40 ring-2 ring-yellow-300/50',
  epic: 'shadow-md shadow-purple-400/30 ring-2 ring-purple-300/40',
  rare: 'shadow-md shadow-blue-400/25 ring-1 ring-blue-200/30',
  common: '',
};

export const RARITY_BADGE: Record<string, string> = {
  legendary: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900',
  rare: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-blue-900',
  epic: 'bg-gradient-to-r from-purple-400 to-violet-500 text-purple-900',
  common: 'bg-gray-200 text-gray-600',
};

// 等级渐变色方案
export const LEVEL_GRADIENTS: Record<number, string> = {
  1: 'from-gray-100 via-slate-50 to-gray-100',
  2: 'from-blue-100 via-cyan-50 to-blue-100',
  3: 'from-blue-200 via-cyan-100 to-teal-100',
  4: 'from-purple-100 via-violet-50 to-purple-100',
  5: 'from-purple-200 via-violet-100 to-indigo-100',
  6: 'from-pink-100 via-rose-50 to-pink-100',
  7: 'from-pink-200 via-rose-100 to-red-100',
  8: 'from-yellow-100 via-amber-50 to-orange-100',
};

export const LEVEL_BORDERS: Record<number, string> = {
  1: 'border-gray-300',
  2: 'border-blue-300',
  3: 'border-cyan-300',
  4: 'border-purple-300',
  5: 'border-violet-300',
  6: 'border-pink-300',
  7: 'border-rose-300',
  8: 'border-yellow-400',
};

export const LEVEL_GLOWS: Record<number, string> = {
  1: '',
  2: 'shadow-blue-400/20',
  3: 'shadow-cyan-400/25',
  4: 'shadow-purple-400/25',
  5: 'shadow-violet-400/30',
  6: 'shadow-pink-400/30',
  7: 'shadow-rose-400/35',
  8: 'shadow-lg shadow-yellow-400/40 ring-2 ring-yellow-300/50',
};

// 宠物图片路径
export function getPetImageUrl(imageKey: string, level: number): string {
  return `/pets/${imageKey}/lv${Math.max(1, Math.min(8, level))}.png`;
}
