import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '仪表盘', icon: '📊' },
  { to: '/announcements', label: '系统公告', icon: '📢' },
  { to: '/classes', label: '班级管理', icon: '🏫' },
  { to: '/students', label: '学生管理', icon: '👨‍🎓' },
  { to: '/shop', label: '宠物商城', icon: '🛒' },
  { to: '/pets/feed', label: '宠物喂养', icon: '🍖' },
  { to: '/quiz', label: '竞赛闯关', icon: '⚔️' },
  { to: '/rankings', label: '排行榜', icon: '🏆' },
  { to: '/semester', label: '学期奖励', icon: '🏅' },
  { to: '/discover', label: '发现班级', icon: '🔍' },
  { to: '/bulletin', label: '教师论坛', icon: '💬' },
  { to: '/rules', label: '评价规则', icon: '📋' },
  { to: '/admin', label: '后台管理', icon: '🔧' },
  { to: '/help', label: '操作说明', icon: '📖' },
];

const bottomItems = [
  { to: '/settings', label: '设置', icon: '⚙️' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          📚 我的老师我的班
        </h1>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-200">
        {bottomItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
