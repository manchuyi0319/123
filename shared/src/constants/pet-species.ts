import type { Pet } from '../types';

export const DEFAULT_PETS: Omit<Pet, 'id' | 'created_at'>[] = [
  { name: '小火龙', species: 'dragon', description: '传说中的火焰之龙，能喷出炽热的火焰', emoji: '🐉', rarity: 'legendary', sort_order: 1 },
  { name: '独角兽', species: 'unicorn', description: '纯洁优雅的魔法生物，角上闪烁着星光', emoji: '🦄', rarity: 'legendary', sort_order: 2 },
  { name: '凤凰雏', species: 'phoenix', description: '浴火重生的神鸟幼崽，羽毛如火焰般绚烂', emoji: '🐦‍🔥', rarity: 'epic', sort_order: 3 },
  { name: '小灵狐', species: 'fox', description: '机灵可爱的小狐狸，拥有九条毛茸茸的尾巴', emoji: '🦊', rarity: 'rare', sort_order: 4 },
  { name: '小猫咪', species: 'cat', description: '乖巧温顺的小猫咪，喜欢晒太阳和撒娇', emoji: '🐱', rarity: 'common', sort_order: 5 },
  { name: '小汪汪', species: 'dog', description: '忠诚活泼的小狗，永远是你最好的伙伴', emoji: '🐶', rarity: 'common', sort_order: 6 },
  { name: '跳跳兔', species: 'rabbit', description: '蹦蹦跳跳的小兔子，耳朵长长的特别可爱', emoji: '🐰', rarity: 'common', sort_order: 7 },
  { name: '小熊猫', species: 'panda', description: '黑白相间的国宝，圆滚滚的特别讨人喜欢', emoji: '🐼', rarity: 'rare', sort_order: 8 },
  { name: '智慧鸮', species: 'owl', description: '聪明博学的猫头鹰，戴着小小的眼镜', emoji: '🦉', rarity: 'rare', sort_order: 9 },
  { name: '小海龟', species: 'turtle', description: '慢悠悠的小海龟，壳上有着美丽的花纹', emoji: '🐢', rarity: 'common', sort_order: 10 },
  { name: '小鲸鱼', species: 'whale', description: '海洋中的温柔巨兽，会喷出高高的水柱', emoji: '🐋', rarity: 'epic', sort_order: 11 },
  { name: '彩蝶', species: 'butterfly', description: '五彩斑斓的小蝴蝶，翅膀上绘着大自然的画', emoji: '🦋', rarity: 'common', sort_order: 12 },
  { name: '小企鹅', species: 'penguin', description: '摇摇摆摆的小企鹅，穿着天生的燕尾服', emoji: '🐧', rarity: 'rare', sort_order: 13 },
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
