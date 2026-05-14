const STEPS = [
  {
    icon: '🏫',
    title: '1. 创建班级',
    desc: '点击「班级管理」→「创建班级」，填写班级名称、年级和学校信息。每个班级可以有多个学生。',
  },
  {
    icon: '👨‍🎓',
    title: '2. 添加学生',
    desc: '在「学生管理」页面，选择班级后逐个添加学生，或使用「批量导入」一次性添加多名学生（每行一个姓名）。',
  },
  {
    icon: '⭐',
    title: '3. 积分评价',
    desc: '在「学生管理」中点击学生卡片上的加减分按钮，选择预设评价规则或自定义输入理由和分值。每日每个学生最多获得 20 积分。',
  },
  {
    icon: '🐾',
    title: '4. 领养宠物',
    desc: '在「宠物图鉴」页面浏览所有宠物，选择心仪的宠物后选择班级和学生进行领养。稀有度越高的宠物消耗积分越多。',
  },
  {
    icon: '🍖',
    title: '5. 喂养宠物',
    desc: '在「宠物喂养」页面选择学生，点击喂养按钮消耗 5 积分喂食宠物，随机获得 10-30 经验值。积累经验可升级宠物（最高 8 级）。也可在「学生管理」→「查看宠物」中快速喂养。',
  },
  {
    icon: '🏆',
    title: '6. 查看排行榜',
    desc: '「排行榜」页面展示学生积分榜、宠物等级榜、班级平均分榜。切换「我的/全平台」查看不同范围的数据。排名前列的学生/宠物/班级会获得奖牌标识。',
  },
  {
    icon: '🔍',
    title: '7. 发现班级',
    desc: '「发现班级」页面可以浏览全平台所有教师的活跃班级，点击班级卡片查看该班学生和宠物详情（只读）。',
  },
  {
    icon: '📋',
    title: '8. 评价规则',
    desc: '「评价规则」页面可自定义加减分的快捷操作，预设图标和分值，方便日常教学中快速评分。',
  },
];

export function HelpPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">操作说明</h2>
      <p className="text-sm text-gray-400 mb-6">快速了解班级宠物园的使用方法</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map(step => (
          <div key={step.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">{step.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
        <h3 className="font-semibold text-indigo-700 mb-2">小贴士</h3>
        <ul className="text-sm text-indigo-600 space-y-1">
          <li>· 宠物稀有度分为普通（免费）、稀有（10分）、史诗（30分）、传说（50分）</li>
          <li>· 喂养宠物每次消耗 5 积分，随机获得 10-30 经验值</li>
          <li>· 宠物共 8 个等级：蛋→幼崽→成长→成熟→精英→稀有→史诗→传说</li>
          <li>· 切换「全平台」模式可查看所有教师的数据，但只能操作自己的班级</li>
          <li>· 归档班级后会保留历史数据，学生积分不变</li>
        </ul>
      </div>
    </div>
  );
}
