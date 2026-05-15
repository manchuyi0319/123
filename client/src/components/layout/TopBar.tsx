import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useSWR from 'swr';
import { fetchWallet } from '../../api/shop';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { teacher, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: walletData } = useSWR('wallet', fetchWallet);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const coins = walletData?.coins ?? 0;

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex-1 flex items-center gap-4">
        <Link to="/wallet" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors">
          <span className="text-base">🪙</span>
          <span className="text-sm font-bold text-amber-700">{coins}</span>
        </Link>
      </div>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm text-gray-700">
            {teacher?.display_name}
          </span>
          <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">{teacher?.display_name}</p>
              <p className="text-xs text-gray-400">{teacher?.role === 'admin' ? '管理员' : '教师'}</p>
            </div>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ⚙️ 设置
            </Link>
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
