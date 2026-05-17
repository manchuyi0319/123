import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchWallet, fetchWalletRecords, redeemCode } from '../api/shop';
import { COIN_PACKAGES } from 'shared';

export function WalletPage() {
  const { data: walletData, error, isLoading } = useSWR('wallet', fetchWallet);
  const { data: recordsData } = useSWR('wallet-records', fetchWalletRecords);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeemError, setRedeemError] = useState('');

  const coins = walletData?.coins || 0;
  const records = recordsData?.data || [];

  const handleRedeem = async () => {
    if (!redeemInput.trim()) return;
    setRedeeming(true);
    setRedeemError('');
    setRedeemMsg('');
    try {
      const res = await redeemCode(redeemInput.trim());
      setRedeemMsg(res.message);
      setRedeemInput('');
      mutate('wallet');
      mutate('wallet-records');
    } catch (err: any) {
      setRedeemError(err.message || '兑换失败');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">我的钱包</h2>

      {/* 余额卡片 */}
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <p className="text-amber-100 text-sm mb-1">金币余额</p>
        <div className="flex items-center gap-3">
          <span className="text-5xl">🪙</span>
          <span className="text-4xl font-bold">{isLoading ? '...' : coins}</span>
        </div>
        <p className="text-amber-100 text-sm mt-2">用于购买稀有、史诗、传说、凶兽、神话宠物</p>
      </div>

      {/* 充值码兑换 */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">💳 兑换充值码</h3>
        <p className="text-sm text-gray-400 mb-3">输入管理员提供的充值码，即可获得金币</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={redeemInput}
            onChange={e => setRedeemInput(e.target.value.toUpperCase())}
            placeholder="如：ABCD-EFGH-JKLM"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-mono tracking-wider"
          />
          <button
            onClick={handleRedeem}
            disabled={redeeming || !redeemInput.trim()}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {redeeming ? '兑换中...' : '兑换'}
          </button>
        </div>
        {redeemMsg && <p className="mt-2 text-sm text-green-600">{redeemMsg}</p>}
        {redeemError && <p className="mt-2 text-sm text-red-500">{redeemError}</p>}
      </div>

      {/* 充值套餐 */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">🛒 购买金币（即将上线）</h3>
        <div className="grid grid-cols-2 gap-3">
          {COIN_PACKAGES.map((pkg) => (
            <div key={pkg.coins} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-lg font-bold text-gray-800">{pkg.label}</p>
              <p className="text-xs text-gray-400 mb-2">{pkg.desc}</p>
              <p className="text-sm font-semibold text-amber-600">¥{pkg.amount}</p>
              <button
                disabled
                className="mt-2 w-full py-1.5 text-xs bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed"
              >
                即将上线
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">在线支付即将支持，当前请使用管理员发放的充值码</p>
      </div>

      {/* 流水记录 */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">📋 金币流水</h3>
        {records.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">暂无记录</p>
        ) : (
          <div className="space-y-2">
            {records.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-700">{r.reason}</p>
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString('zh-CN')}</p>
                </div>
                <span className={`text-sm font-medium ${r.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {r.amount >= 0 ? `+${r.amount}` : r.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
