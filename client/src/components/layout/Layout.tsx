import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DashboardPage } from '../../pages/DashboardPage';
import { ClassesPage } from '../../pages/ClassesPage';
import { StudentsPage } from '../../pages/StudentsPage';
import { RulesPage } from '../../pages/RulesPage';
import { PetsPage } from '../../pages/PetsPage';
import { RankingsPage } from '../../pages/RankingsPage';
import { AdminPage } from '../../pages/AdminPage';

export function Layout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/pets" element={<PetsPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
