import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/parent/dashboard', label: '家长中心', icon: '🏠' },
  { to: '/parent/link', label: '关联孩子', icon: '🔗' },
  { to: '/parent/quiz', label: '竞赛闯关', icon: '⚔️' },
  { to: '/rankings', label: '排行榜', icon: '🏆' },
  { to: '/shop', label: '宠物商城', icon: '🛒' },
  { to: '/wallet', label: '金币钱包', icon: '🪙' },
  { to: '/help', label: '帮助', icon: '📖' },
];

export function ParentSidebar({ onClose }: { onClose?: () => void }) {
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
            end={item.to === '/parent/dashboard'}
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
