import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '仪表盘', icon: '📊' },
  { to: '/classes', label: '班级管理', icon: '🏫' },
  { to: '/students', label: '学生管理', icon: '👨‍🎓' },
  { to: '/pets', label: '宠物图鉴', icon: '🐾' },
  { to: '/rankings', label: '排行榜', icon: '🏆' },
  { to: '/rules', label: '评价规则', icon: '📋' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          🐱 班级宠物园
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
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
    </aside>
  );
}
