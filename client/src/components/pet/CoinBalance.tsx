import { Link } from 'react-router-dom';

interface CoinBalanceProps {
  coins: number;
  loading?: boolean;
}

export function CoinBalance({ coins, loading }: CoinBalanceProps) {
  return (
    <Link
      to="/wallet"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
    >
      <span className="text-lg">🪙</span>
      {loading ? (
        <span className="text-sm text-amber-400">...</span>
      ) : (
        <span className="text-sm font-bold text-amber-700">{coins}</span>
      )}
      <span className="text-xs text-amber-500">金币</span>
    </Link>
  );
}
