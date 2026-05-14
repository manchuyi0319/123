import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function TopBar() {
  const { teacher } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          👩‍🏫 {teacher?.display_name}
        </span>
        <Link
          to="/settings"
          className="text-sm text-gray-400 hover:text-indigo-500 transition-colors"
          title="设置"
        >
          ⚙️
        </Link>
      </div>
    </header>
  );
}
