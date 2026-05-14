import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetchClasses } from '../api/classes';
import { fetchStudents, addStudent, batchAddStudents, updateStudent, deactivateStudent } from '../api/students';

export function StudentsPage() {
  const { data: classesData } = useSWR('classes', fetchClasses);
  const [selectedClassId, setSelectedClassId] = useState('');
  const { data: studentsData, error, isLoading } = useSWR(
    selectedClassId ? ['students', selectedClassId] : null,
    () => fetchStudents(selectedClassId)
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [batchNames, setBatchNames] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const classes = classesData?.data || [];

  const resetForm = () => {
    setName('');
    setStudentNumber('');
    setBatchNames('');
    setFormError('');
    setEditingStudent(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) { setFormError('请输入学生姓名'); return; }
    if (!selectedClassId) { setFormError('请先选择班级'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, { name: name.trim(), student_number: studentNumber.trim() || undefined });
      } else {
        await addStudent({ class_id: selectedClassId, name: name.trim(), student_number: studentNumber.trim() || undefined });
      }
      setShowAddModal(false);
      resetForm();
      mutate(['students', selectedClassId]);
    } catch (err: any) {
      setFormError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleBatch = async () => {
    const names = batchNames.split(/[\n,]/).map(s => s.trim()).filter(s => s);
    if (names.length === 0) { setFormError('请输入至少一个学生姓名'); return; }
    if (!selectedClassId) { setFormError('请先选择班级'); return; }
    setSaving(true);
    setFormError('');
    try {
      await batchAddStudents({ class_id: selectedClassId, names });
      setShowBatchModal(false);
      resetForm();
      mutate(['students', selectedClassId]);
    } catch (err: any) {
      setFormError(err.message || '导入失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`确定要移除「${name}」吗？`)) return;
    try {
      await deactivateStudent(id);
      mutate(['students', selectedClassId]);
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const openEdit = (student: any) => {
    setEditingStudent(student);
    setName(student.name);
    setStudentNumber(student.student_number || '');
    setFormError('');
    setShowAddModal(true);
  };

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

      {/* 班级选择 */}
      <div className="mb-4">
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
        >
          <option value="">请选择班级</option>
          {classes.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedClassId ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">👨‍🎓</div>
          <p className="text-lg">请先选择一个班级查看学生</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
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
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">学号</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">姓名</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">积分</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.data.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm text-gray-500">{s.student_number || '-'}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{s.name}</td>
                  <td className="px-5 py-3">
                    <span className="text-sm bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      ⭐ {s.total_points}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="text-xs text-indigo-600 hover:underline mr-3">编辑</button>
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
              <textarea
                value={batchNames}
                onChange={e => setBatchNames(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                rows={6}
                placeholder="每行一个姓名，或用逗号分隔&#10;如：&#10;张三&#10;李四,王五&#10;赵六"
              />
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
    </div>
  );
}
