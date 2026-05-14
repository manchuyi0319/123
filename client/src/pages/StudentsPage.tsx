import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchClasses } from '../api/classes';
import { fetchStudents, addStudent, batchAddStudents, updateStudent, deactivateStudent } from '../api/students';
import { fetchRules } from '../api/rules';
import { addPoints, fetchStudentPoints } from '../api/points';
import { fetchStudentPets, feedPet } from '../api/pets';
import { getLevel, getLevelName, getLevelProgress, getExpToNextLevel, LEVEL_COLORS } from 'shared';

export function StudentsPage() {
  const { data: classesData } = useSWR('classes', fetchClasses);
  const { data: rulesData } = useSWR('rules', fetchRules);
  const [selectedClassId, setSelectedClassId] = useState('');
  const { data: studentsData, error, isLoading } = useSWR(
    selectedClassId ? ['students', selectedClassId] : null,
    () => fetchStudents(selectedClassId)
  );

  // 学生添加/编辑
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [batchNames, setBatchNames] = useState('');

  // 积分弹窗
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsStudent, setPointsStudent] = useState<any>(null);
  const [pointsChange, setPointsChange] = useState(1);
  const [pointsReason, setPointsReason] = useState('');
  const [pointsCategory, setPointsCategory] = useState('behavior');
  const [selectedRuleId, setSelectedRuleId] = useState('');

  // 积分流水
  const [showHistory, setShowHistory] = useState(false);
  const [historyStudentId, setHistoryStudentId] = useState('');
  const { data: historyData } = useSWR(
    showHistory && historyStudentId ? ['point-history', historyStudentId] : null,
    () => fetchStudentPoints(historyStudentId)
  );

  // 宠物面板
  const [showPetPanel, setShowPetPanel] = useState(false);
  const [petStudentId, setPetStudentId] = useState('');
  const [petStudentName, setPetStudentName] = useState('');
  const { data: petListData, mutate: mutatePets } = useSWR(
    showPetPanel && petStudentId ? ['student-pets', petStudentId] : null,
    () => fetchStudentPets(petStudentId)
  );
  const [feedingId, setFeedingId] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const classes = classesData?.data || [];
  const rules = rulesData?.data || [];

  const resetForm = () => {
    setName(''); setStudentNumber(''); setBatchNames('');
    setFormError(''); setEditingStudent(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) { setFormError('请输入学生姓名'); return; }
    if (!selectedClassId) { setFormError('请先选择班级'); return; }
    setSaving(true); setFormError('');
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, { name: name.trim(), student_number: studentNumber.trim() || undefined });
      } else {
        await addStudent({ class_id: selectedClassId, name: name.trim(), student_number: studentNumber.trim() || undefined });
      }
      setShowAddModal(false); resetForm();
      mutate(['students', selectedClassId]);
    } catch (err: any) { setFormError(err.message || '保存失败'); } finally { setSaving(false); }
  };

  const handleBatch = async () => {
    const names = batchNames.split(/[\n,]/).map(s => s.trim()).filter(s => s);
    if (names.length === 0) { setFormError('请输入至少一个学生姓名'); return; }
    if (!selectedClassId) { setFormError('请先选择班级'); return; }
    setSaving(true); setFormError('');
    try {
      await batchAddStudents({ class_id: selectedClassId, names });
      setShowBatchModal(false); resetForm();
      mutate(['students', selectedClassId]);
    } catch (err: any) { setFormError(err.message || '导入失败'); } finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`确定要移除「${name}」吗？`)) return;
    try { await deactivateStudent(id); mutate(['students', selectedClassId]); } catch (err: any) { alert(err.message || '操作失败'); }
  };

  const openEdit = (student: any) => {
    setEditingStudent(student);
    setName(student.name);
    setStudentNumber(student.student_number || '');
    setFormError(''); setShowAddModal(true);
  };

  const openPoints = (student: any, presetChange?: number, presetReason?: string, presetCategory?: string) => {
    setPointsStudent(student);
    setPointsChange(presetChange || 1);
    setPointsReason(presetReason || '');
    setPointsCategory(presetCategory || 'behavior');
    setSelectedRuleId('');
    setFormError(''); setShowPointsModal(true);
  };

  const handleAddPoints = async () => {
    if (pointsChange === 0) { setFormError('积分变化不能为0'); return; }
    if (!pointsReason.trim()) { setFormError('请输入理由'); return; }
    setSaving(true); setFormError('');
    try {
      await addPoints({
        student_id: pointsStudent.id,
        points_change: pointsChange,
        reason: pointsReason.trim(),
        category: pointsCategory,
        evaluation_rule_id: selectedRuleId || undefined,
      });
      setShowPointsModal(false);
      mutate(['students', selectedClassId]);
      if (showHistory) mutate(['point-history', historyStudentId]);
    } catch (err: any) { setFormError(err.message || '操作失败'); } finally { setSaving(false); }
  };

  const openHistory = (studentId: string) => {
    setHistoryStudentId(studentId);
    setShowHistory(true);
  };

  const openPetPanel = (studentId: string, studentName: string) => {
    setPetStudentId(studentId);
    setPetStudentName(studentName);
    setShowPetPanel(true);
  };

  const handleFeed = async (studentPetId: string) => {
    setFeedingId(studentPetId);
    try {
      await feedPet({ student_pet_id: studentPetId });
      mutatePets();
      mutate(['students', selectedClassId]);
    } catch (err: any) {
      alert(err.message || '喂养失败');
    } finally {
      setFeedingId('');
    }
  };

  const quickPresets = rules.slice(0, 8);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">学生管理</h2>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setShowBatchModal(true); }} disabled={!selectedClassId}
            className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-40">
            批量导入
          </button>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} disabled={!selectedClassId}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-40">
            + 添加学生
          </button>
        </div>
      </div>

      <div className="mb-4">
        <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white">
          <option value="">请选择班级</option>
          {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!selectedClassId ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">👨‍🎓</div>
          <p className="text-lg">请先选择一个班级查看学生</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" /></div>
      ) : error ? (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">加载失败，请刷新重试</div>
      ) : !studentsData || studentsData.data.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p>该班级暂无学生，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">学号</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">姓名</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">积分</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">快捷操作</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">更多</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.data.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-500">{s.student_number || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${s.total_points >= 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                      ⭐ {s.total_points}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      {quickPresets.filter((r: any) => r.points_value > 0).slice(0, 3).map((r: any) => (
                        <button key={r.id}
                          onClick={() => openPoints(s, r.points_value, r.name, r.category)}
                          className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 rounded hover:bg-green-100"
                          title={r.name}>
                          {r.icon || '✅'} +{r.points_value}
                        </button>
                      ))}
                      {quickPresets.filter((r: any) => r.points_value < 0).slice(0, 2).map((r: any) => (
                        <button key={r.id}
                          onClick={() => openPoints(s, r.points_value, r.name, r.category)}
                          className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                          title={r.name}>
                          {r.icon || '⚠️'} {r.points_value}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openPoints(s)} className="text-xs text-indigo-600 hover:underline mr-2">加减分</button>
                    <button onClick={() => openPetPanel(s.id, s.name)} className="text-xs text-yellow-600 hover:underline mr-2">宠物</button>
                    <button onClick={() => openHistory(s.id)} className="text-xs text-gray-500 hover:underline mr-2">流水</button>
                    <button onClick={() => openEdit(s)} className="text-xs text-gray-500 hover:underline mr-2">编辑</button>
                    <button onClick={() => handleDeactivate(s.id, s.name)} className="text-xs text-red-500 hover:underline">移除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 添加/编辑弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editingStudent ? '编辑学生' : '添加学生'}</h3>
            {formError && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学号</label>
                <input type="text" value={studentNumber} onChange={e => setStudentNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" placeholder="可选" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入弹窗 */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBatchModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">批量导入学生</h3>
            {formError && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">学生姓名</label>
              <textarea value={batchNames} onChange={e => setBatchNames(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                rows={6} placeholder="每行一个姓名，或用逗号分隔&#10;如：&#10;张三&#10;李四,王五&#10;赵六" />
              <p className="text-xs text-gray-400 mt-1">每行一个姓名，或使用逗号分隔，单次最多 50 人</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowBatchModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button onClick={handleBatch} disabled={saving} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium">
                {saving ? '导入中...' : '一键导入'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 加减分弹窗 */}
      {showPointsModal && pointsStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPointsModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1">加减分 - {pointsStudent.name}</h3>
            <p className="text-sm text-gray-400 mb-4">当前积分：⭐ {pointsStudent.total_points}</p>
            {formError && <div className="mb-3 p-2.5 bg-red-50 text-red-600 rounded-lg text-sm">{formError}</div>}

            {/* 快捷规则选择 */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">快捷规则</label>
              <div className="flex flex-wrap gap-1.5">
                {rules.filter((r: any) => r.points_value > 0).slice(0, 4).map((r: any) => (
                  <button key={r.id}
                    onClick={() => { setPointsChange(r.points_value); setPointsReason(r.name); setPointsCategory(r.category); setSelectedRuleId(r.id); }}
                    className={`text-xs px-2 py-1 rounded-full border ${selectedRuleId === r.id ? 'bg-green-100 border-green-400 text-green-700' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'}`}>
                    {r.icon || '✅'} +{r.points_value}
                  </button>
                ))}
                {rules.filter((r: any) => r.points_value < 0).slice(0, 3).map((r: any) => (
                  <button key={r.id}
                    onClick={() => { setPointsChange(r.points_value); setPointsReason(r.name); setPointsCategory(r.category); setSelectedRuleId(r.id); }}
                    className={`text-xs px-2 py-1 rounded-full border ${selectedRuleId === r.id ? 'bg-red-100 border-red-400 text-red-700' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}>
                    {r.icon || '⚠️'} {r.points_value}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">积分变化 *</label>
                <div className="flex gap-2 items-center">
                  <button onClick={() => setPointsChange(Math.abs(pointsChange) * -1)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">扣分</button>
                  <input type="number" value={pointsChange} onChange={e => setPointsChange(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-center" />
                  <button onClick={() => setPointsChange(Math.abs(pointsChange))} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100">加分</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">理由 *</label>
                <input type="text" value={pointsReason} onChange={e => setPointsReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="如：作业优秀" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPointsModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">取消</button>
              <button onClick={handleAddPoints} disabled={saving}
                className={`flex-1 py-2 text-white rounded-lg disabled:opacity-50 transition-colors text-sm font-medium ${pointsChange > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                {saving ? '处理中...' : pointsChange > 0 ? `确认 +${pointsChange} 分` : `确认 ${pointsChange} 分`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 宠物面板弹窗 */}
      {showPetPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPetPanel(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1">{petStudentName} 的宠物</h3>
            <p className="text-sm text-gray-400 mb-4">共 {petListData?.data?.length || 0} 只</p>

            {!petListData ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
            ) : petListData.data.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <span className="text-4xl">🐾</span>
                <p className="mt-2">还没有领养宠物，去宠物图鉴看看吧</p>
              </div>
            ) : (
              <div className="space-y-3">
                {petListData.data.map((sp: any) => {
                  const level = getLevel(sp.current_exp);
                  const progress = getLevelProgress(sp.current_exp);
                  const nextExp = getExpToNextLevel(sp.current_exp);
                  return (
                    <div key={sp.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{sp.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-800">{sp.nickname || sp.pet_name}</h4>
                            <span className="text-xs text-gray-400">({sp.pet_name})</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${LEVEL_COLORS[level - 1] || 'bg-gray-400'}`}>
                              Lv.{level} {getLevelName(sp.current_exp)}
                            </span>
                            <span className="text-xs text-gray-400">{sp.current_exp} EXP</span>
                          </div>
                          {/* EXP 进度条 */}
                          <div className="mb-1">
                            <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                              <span>成长进度</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full transition-all ${LEVEL_COLORS[level - 1] || 'bg-indigo-500'}`} style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                          {nextExp !== null && (
                            <p className="text-xs text-gray-400">距离下一级还需 {nextExp} EXP</p>
                          )}
                          {nextExp === null && (
                            <p className="text-xs text-yellow-600 font-medium">已达最高等级 🎉</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleFeed(sp.id)}
                          disabled={feedingId === sp.id || nextExp === null}
                          className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-40 transition-colors text-xs font-medium"
                        >
                          {feedingId === sp.id ? '...' : '🍖 喂养 5分'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => setShowPetPanel(false)} className="mt-4 w-full py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 积分流水弹窗 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHistory(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">积分流水</h3>
            {!historyData || historyData.data.length === 0 ? (
              <p className="text-center py-8 text-gray-400">暂无积分记录</p>
            ) : (
              <div className="space-y-2">
                {historyData.data.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${r.points_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {r.points_change > 0 ? '+' : ''}{r.points_change}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{r.reason}</p>
                        <p className="text-xs text-gray-400">{r.created_at?.replace('T', ' ').substring(0, 16)}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded">{r.teacher_name}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowHistory(false)} className="mt-4 w-full py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
