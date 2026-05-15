import type { Pet } from '../types';

export interface PetSpeciesInput {
  name: string;
  species: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  sort_order: number;
}

export const DEFAULT_PETS: PetSpeciesInput[] = [
  // ===== 普通 (9 种，免费) =====
  { name: '小猫咪', species: 'cat', description: '乖巧温顺的小猫咪，喜欢晒太阳和撒娇', emoji: '🐱', rarity: 'common', price: 0, sort_order: 1 },
  { name: '小汪汪', species: 'dog', description: '忠诚活泼的小狗，永远是你最好的伙伴', emoji: '🐶', rarity: 'common', price: 0, sort_order: 2 },
  { name: '跳跳兔', species: 'rabbit', description: '蹦蹦跳跳的小兔子，耳朵长长的特别可爱', emoji: '🐰', rarity: 'common', price: 0, sort_order: 3 },
  { name: '小海龟', species: 'turtle', description: '慢悠悠的小海龟，壳上有着美丽的花纹', emoji: '🐢', rarity: 'common', price: 0, sort_order: 4 },
  { name: '彩蝶', species: 'butterfly', description: '五彩斑斓的小蝴蝶，翅膀上绘着大自然的画', emoji: '🦋', rarity: 'common', price: 0, sort_order: 5 },
  { name: '小仓鼠', species: 'hamster', description: '圆滚滚的小仓鼠，喜欢在轮子上跑来跑去', emoji: '🐹', rarity: 'common', price: 0, sort_order: 6 },
  { name: '小金鱼', species: 'goldfish', description: '游来游去的小金鱼，鳞片在阳光下闪闪发光', emoji: '🐟', rarity: 'common', price: 0, sort_order: 7 },
  { name: '小刺猬', species: 'hedgehog', description: '背上长满小刺的刺猬宝宝，其实内心很温柔', emoji: '🦔', rarity: 'common', price: 0, sort_order: 8 },
  { name: '小鹦鹉', species: 'parrot', description: '聪明伶俐的小鹦鹉，能学会说好多话', emoji: '🦜', rarity: 'common', price: 0, sort_order: 9 },

  // ===== 稀有 (6 种，10 金币) =====
  { name: '小灵狐', species: 'fox', description: '机灵可爱的小狐狸，拥有九条毛茸茸的尾巴', emoji: '🦊', rarity: 'rare', price: 10, sort_order: 10 },
  { name: '小熊猫', species: 'panda', description: '黑白相间的国宝，圆滚滚的特别讨人喜欢', emoji: '🐼', rarity: 'rare', price: 10, sort_order: 11 },
  { name: '智慧鸮', species: 'owl', description: '聪明博学的猫头鹰，戴着小小的眼镜', emoji: '🦉', rarity: 'rare', price: 10, sort_order: 12 },
  { name: '小企鹅', species: 'penguin', description: '摇摇摆摆的小企鹅，穿着天生的燕尾服', emoji: '🐧', rarity: 'rare', price: 10, sort_order: 13 },
  { name: '麒麟', species: 'kirin', description: '祥瑞之兽麒麟幼崽，所到之处祥云环绕', emoji: '🦌', rarity: 'rare', price: 10, sort_order: 14 },
  { name: '仙鹤', species: 'crane', description: '仙风道骨的仙鹤，翩翩起舞时如诗如画', emoji: '🦩', rarity: 'rare', price: 10, sort_order: 15 },

  // ===== 史诗 (5 种，25 金币) =====
  { name: '凤凰雏', species: 'phoenix', description: '浴火重生的神鸟幼崽，羽毛如火焰般绚烂', emoji: '🐦‍🔥', rarity: 'epic', price: 25, sort_order: 16 },
  { name: '小鲸鱼', species: 'whale', description: '海洋中的温柔巨兽，会喷出高高的水柱', emoji: '🐋', rarity: 'epic', price: 25, sort_order: 17 },
  { name: '玄武', species: 'xuanwu', description: '北方守护神兽，龟蛇合一的坚韧存在', emoji: '🐢', rarity: 'epic', price: 25, sort_order: 18 },
  { name: '白虎', species: 'baihu', description: '西方守护神兽，威猛中带着王者之风', emoji: '🐅', rarity: 'epic', price: 25, sort_order: 19 },
  { name: '神龙', species: 'shenlong', description: '腾云驾雾的神龙，掌控风云雷电之力', emoji: '🐉', rarity: 'epic', price: 25, sort_order: 20 },

  // ===== 传说 (3 种，50 金币) =====
  { name: '小火龙', species: 'dragon', description: '传说中的火焰之龙，能喷出炽热的火焰', emoji: '🦎', rarity: 'legendary', price: 50, sort_order: 21 },
  { name: '独角兽', species: 'unicorn', description: '纯洁优雅的魔法生物，角上闪烁着星光', emoji: '🦄', rarity: 'legendary', price: 50, sort_order: 22 },
  { name: '青龙', species: 'qinglong', description: '东方守护神兽之首，翱翔于九天之上', emoji: '🐲', rarity: 'legendary', price: 50, sort_order: 23 },
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
