import { useAuth } from '../../context/AuthContext';

export function TopBar() {
  const { teacher, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          👩‍🏫 {teacher?.display_name}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          退出登录
        </button>
      </div>
    </header>
  );
}
