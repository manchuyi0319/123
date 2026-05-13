export interface EvaluationPreset {
  name: string;
  description: string;
  points_value: number;
  category: 'behavior' | 'academic' | 'attendance' | 'custom';
  icon: string;
  sort_order: number;
}

export const DEFAULT_PRESETS: EvaluationPreset[] = [
  // 行为类（加分）
  { name: '积极发言', description: '课堂上积极举手回答问题', points_value: 3, category: 'behavior', icon: '🙋', sort_order: 1 },
  { name: '帮助同学', description: '主动帮助有困难的同学', points_value: 5, category: 'behavior', icon: '🤝', sort_order: 2 },
  { name: '遵守纪律', description: '课堂和课间遵守学校纪律', points_value: 2, category: 'behavior', icon: '✅', sort_order: 3 },
  // 学习类（加分）
  { name: '作业优秀', description: '作业完成质量高，字迹工整', points_value: 5, category: 'academic', icon: '⭐', sort_order: 4 },
  { name: '考试成绩优异', description: '考试取得优异成绩（90分以上）', points_value: 10, category: 'academic', icon: '🏆', sort_order: 5 },
  { name: '进步明显', description: '学习成绩或表现有明显进步', points_value: 8, category: 'academic', icon: '📈', sort_order: 6 },
  // 健康类（加分）
  { name: '认真做操', description: '课间操认真完成，动作标准', points_value: 2, category: 'attendance', icon: '💪', sort_order: 7 },
  { name: '保持整洁', description: '个人座位和物品保持干净整洁', points_value: 3, category: 'attendance', icon: '🧹', sort_order: 8 },
  // 行为类（扣分）
  { name: '上课讲话', description: '上课期间与同学交头接耳', points_value: -3, category: 'behavior', icon: '🗣️', sort_order: 9 },
  { name: '未完成作业', description: '没有按时完成和提交作业', points_value: -5, category: 'academic', icon: '❌', sort_order: 10 },
  { name: '迟到', description: '上学或上课迟到', points_value: -2, category: 'attendance', icon: '⏰', sort_order: 11 },
  { name: '乱扔垃圾', description: '随地乱扔垃圾，不保持环境卫生', points_value: -3, category: 'attendance', icon: '🗑️', sort_order: 12 },
];
