import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { fetchClassStudents, submitJoinRequest } from '../../api/parent';

export function LinkChildPage() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [lookedUp, setLookedUp] = useState(false);
  const [submittingId, setSubmittingId] = useState('');
  const [successId, setSuccessId] = useState('');
  const [error, setError] = useState('');

  const { data: classData, isLoading: isLookingUp } = useSWR(
    lookedUp && inviteCode.trim().length === 6
      ? ['parent-class-students', inviteCode.trim().toUpperCase()]
      : null,
    () => fetchClassStudents(inviteCode.trim().toUpperCase()),
    { onError: () => setError('未找到该班级，请检查邀请码') }
  );

  const students = classData?.data || [];
  const cls = classData?.class;

  const handleLookup = () => {
    if (inviteCode.trim().length < 6) {
      setError('请输入6位邀请码');
      return;
    }
    setError('');
    setLookedUp(true);
  };

  const handleSubmit = async (studentId: string, studentName: string) => {
    setSubmittingId(studentId);
    setError('');
    try {
      await submitJoinRequest({ student_id: studentId });
      setSuccessId(studentId);
      setTimeout(() => {
        mutate('parent-children');
        navigate('/parent/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || '提交失败');
    } finally {
      setSubmittingId('');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/parent/dashboard" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← 返回家长中心
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">关联孩子</h2>
        <p className="text-sm text-gray-400 mb-6">输入老师提供的6位邀请码，找到孩子并提交关联申请</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={inviteCode}
            onChange={e => { setInviteCode(e.target.value.toUpperCase()); setLookedUp(false); setError(''); }}
            placeholder="输入6位邀请码"
            maxLength={6}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm uppercase tracking-widest text-center"
          />
          <button
            onClick={handleLookup}
            disabled={inviteCode.trim().length < 6 || isLookingUp}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors text-sm font-medium"
          >
            {isLookingUp ? '查找中...' : '查找'}
          </button>
        </div>

        {lookedUp && !isLookingUp && cls && (
          <div>
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                {cls.name} {cls.grade ? `(${cls.grade})` : ''}
              </p>
            </div>

            {students.length === 0 ? (
              <p className="text-center py-8 text-gray-400">该班级暂无学生</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-2">请选择您的孩子：</p>
                {students.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">
                        {s.student_number ? `学号: ${s.student_number} · ` : ''}
                        ⭐ {s.total_points} 积分
                      </p>
                    </div>
                    {successId === s.id ? (
                      <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                        ✅ 已提交
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSubmit(s.id, s.name)}
                        disabled={submittingId === s.id}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-40 transition-colors text-xs font-medium"
                      >
                        {submittingId === s.id ? '提交中...' : '这是我的孩子'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {lookedUp && !isLookingUp && !cls && !error && (
          <p className="text-center py-4 text-gray-400">请输入邀请码查找班级</p>
        )}
      </div>
    </div>
  );
}
