import { SemesterRanking } from '../components/ranking/SemesterRanking';

export function SemesterPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏅 学期奖励</h2>
      <SemesterRanking />
    </div>
  );
}
