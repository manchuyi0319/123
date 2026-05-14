import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchRules, createRule, updateRule, deleteRule } from '../api/rules';

const CATEGORIES: Record<string, string> = {
  behavior: '行为习惯',
  academic: '学习表现',
  attendance: '出勤卫生',
  custom: '自定义',
};

const POINTS_COLORS: Record<string, string> = {
  behavior: 'bg-blue-50 text-blue-700',
  academic: 'bg-purple-50 text-purple-700',
  attendance: 'bg-green-50 text-green-700',
  custom: 'bg-orange-50 text-orange-700',
};

export function RulesPage() {
  const { data, error, isLoading } = useSWR('rules', fetchRules);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', points_value: 3, category: 'behavior', icon: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const rules = data?.data || [];
  const presets = rules.filter((r: any) => r.is_preset === 1);
  const customs = rules.filter((r: any) => r.is_preset === 0);

  const openCreate = () => {
    setEditingRule(null);
    setForm({ name: '', description: '', points_value: 3, category: 'behavior', icon: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (rule: any) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      description: rule.description || '',
      points_value: rule.points_value,
      category: rule.category,
      icon: rule.icon || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('规则名称不能为空'); return; }
    if (form.points_value === 0) { setFormError('积分值不能为0'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingRule) {
        await updateRule(editingRule.id, form);
      } else {
        await createRule(form);
      }
      setShowModal(false);
      mutate('rules');
    } catch (err: any) {
      setFormError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除「${name}」吗？`)) return;
    try {
      await deleteRule(id);
      mutate('rules');
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const RuleCard = ({ rule, isPreset }: { rule: any; isPreset: boolean }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rule.icon || '📌'}</span>
          <div>
            <h4 className="font-medium text-gray-800 text-sm">{rule.name}</h4>
            {rule.description && <p className="text-xs text-gray-400 mt-0.5">{rule.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${POINTS_COLORS[rule.category] || POINTS_COLORS.custom}`}>
            {CATEGORIES[rule.category] || rule.category}
          </span>
          <span className={`text-sm font-bold ${rule.points_value > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {rule.points_value > 0 ? '+' : ''}{rule.points_value}
          </span>
        </div>
      </div>
      {!isPreset && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <button onClick={() => openEdit(rule)} className="flex-1 text-xs py-1 text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">编辑</button>
          <button onClick={() => handleDelete(rule.id, rule.name)} className="flex-1 text-xs py-1 text-red-500 bg-red-50 rounded hover:bg-red-100">删除</button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">评价规则</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          + 自定义规则
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" /></div>
      ) : (
        <>
          {customs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">我的自定义规则</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {customs.map((r: any) => <RuleCard key={r.id} rule={r} isPreset={false} />)}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">系统预设规则（{presets.length} 条）</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map((r: any) => <RuleCard key={r.id} rule={r} isPreset={true} />)}
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editingRule ? '编辑规则' : '创建自定义规则'}</h3>
            {formError && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">规则名称 *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="可选" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">积分数值 *</label>
                  <input type="number" value={form.points_value} onChange={e => setForm({ ...form, points_value: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
                  <p className="text-xs text-gray-400 mt-0.5">正数加分，负数扣分</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white">
                    {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="如：🌟（可选emoji）" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
