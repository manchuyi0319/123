import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { fetchClasses } from '../api/classes';
import { fetchStudents } from '../api/students';
import { fetchQuizStatus, fetchQuizQuestion, submitQuizAnswer, QuizQuestion, QuizAnswerResult } from '../api/quiz';

export function QuizPage() {
  const { data: classesData } = useSWR('classes', fetchClasses);
  const [selectedClassId, setSelectedClassId] = useState('');
  const { data: studentsData } = useSWR(
    selectedClassId ? ['students', selectedClassId] : null,
    () => fetchStudents(selectedClassId)
  );

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [statusKey, setStatusKey] = useState(0);
  const { data: status } = useSWR(
    selectedStudentId ? ['quiz-status', selectedStudentId, statusKey] : null,
    () => fetchQuizStatus(selectedStudentId)
  );

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<QuizAnswerResult | null>(null);
  const [error, setError] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);

  const classes = classesData?.data || [];
  const students = studentsData?.data || [];
  const selectedStudent = students.find((s: any) => s.id === selectedStudentId);

  const getQuestion = useCallback(async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    setError('');
    setSelectedOption(null);
    setResult(null);
    setShowLevelUp(false);
    try {
      const q = await fetchQuizQuestion(selectedStudentId);
      setQuestion(q);
    } catch (err: any) {
      setError(err.message || '获取题目失败');
    }
    setLoading(false);
  }, [selectedStudentId]);

  const handleAnswer = async (optionIndex: number) => {
    if (!question || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    try {
      const res = await submitQuizAnswer(selectedStudentId, question.id, optionIndex);
      setResult(res);

      if (res.points_earned > 0) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      setStatusKey(k => k + 1);
    } catch (err: any) {
      setError(err.message || '提交失败');
      setSelectedOption(null);
    }
  };

  const handleNext = () => {
    getQuestion();
  };

  const subjectLabels: Record<string, string> = {
    math: '数学',
    chinese: '语文',
    science: '科学',
    fun: '趣味',
    riddle: '谜语',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">竞赛闯关</h1>
        <p className="text-sm text-gray-500 mt-1">每过 10 关奖励 50 积分，每天 3 次答错机会</p>
      </div>

      {/* 学生选择 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">选择班级</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={selectedClassId}
              onChange={e => { setSelectedClassId(e.target.value); setSelectedStudentId(''); }}
            >
              <option value="">-- 选择班级 --</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">选择学生</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={selectedStudentId}
              onChange={e => { setSelectedStudentId(e.target.value); setQuestion(null); setResult(null); }}
              disabled={!selectedClassId}
            >
              <option value="">-- 选择学生 --</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 状态栏 */}
      {status && selectedStudent && (
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-700">第 {status.quiz_level} 关</div>
              <div className="text-xs text-indigo-500">{selectedStudent.name}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">{status.remaining}</div>
              <div className="text-xs text-amber-500">剩余机会</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">{status.questions_answered_today}</div>
              <div className="text-xs text-gray-500">今日答题</div>
            </div>
          </div>
          {!question && !loading && status.remaining > 0 && (
            <button
              onClick={getQuestion}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              开始答题
            </button>
          )}
        </div>
      )}

      {/* 机会用完 */}
      {status && status.remaining <= 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">⏰</div>
          <div className="text-lg font-bold text-red-700">今天的答题机会已用完</div>
          <p className="text-sm text-red-500 mt-1">明天上午 9:00 重置，明天再来挑战吧！</p>
        </div>
      )}

      {/* 加载中 */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin text-3xl mb-2">⏳</div>
          <p className="text-gray-500">正在出题...</p>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* 题目卡片 */}
      {question && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {subjectLabels[question.subject] || question.subject} · {question.grade} 年级
            </span>
            <span className="text-xs text-gray-400">第 {question.quiz_level} 关</span>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-5">{question.question}</h3>

            <div className="space-y-2.5">
              {question.options.map((opt, idx) => {
                let btnClass = 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700';

                if (selectedOption !== null) {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === result?.correct_answer;

                  if (isCorrectAnswer) {
                    btnClass = 'border-green-300 bg-green-50 text-green-700 ring-1 ring-green-400';
                  } else if (isSelected && !result?.correct) {
                    btnClass = 'border-red-300 bg-red-50 text-red-700 ring-1 ring-red-400';
                  } else {
                    btnClass = 'border-gray-100 bg-gray-50 text-gray-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${btnClass}`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 结果面板 */}
          {result && (
            <div className={`px-5 py-4 border-t ${result.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{result.correct ? '✅' : '❌'}</span>
                <span className={`font-bold ${result.correct ? 'text-green-700' : 'text-red-700'}`}>
                  {result.correct ? '回答正确！' : '回答错误'}
                </span>
              </div>
              {result.explanation && (
                <p className="text-sm text-gray-600 mb-2">{result.explanation}</p>
              )}
              {result.points_earned > 0 && (
                <div className="text-sm font-bold text-amber-600 mb-2">
                  🎉 通过第 {result.new_level} 关！奖励 {result.points_earned} 积分！
                </div>
              )}
              {result.remaining > 0 ? (
                <button
                  onClick={handleNext}
                  className="mt-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  下一题
                </button>
              ) : (
                <p className="text-sm text-red-500 mt-1">今天的答题机会已用完，明天再来吧！</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 升级动画 */}
      {showLevelUp && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-amber-500 text-white rounded-2xl px-8 py-6 shadow-2xl animate-bounce text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-bold">关卡突破！</div>
            <div className="text-lg">+50 积分奖励</div>
          </div>
        </div>
      )}

      {/* 未选择学生 */}
      {!selectedStudentId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-400">
          <div className="text-5xl mb-3">🏆</div>
          <p>请先选择班级和学生，开始竞赛闯关</p>
          <p className="text-sm mt-1">答对题目即可过关，每过 10 关奖励 50 积分！</p>
        </div>
      )}
    </div>
  );
}
