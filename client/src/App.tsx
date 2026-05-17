import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ParentLayout } from './components/layout/ParentLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClassesPage } from './pages/ClassesPage';
import { StudentsPage } from './pages/StudentsPage';
import { RulesPage } from './pages/RulesPage';
import { PetsPage } from './pages/PetsPage';
import { PetShopPage } from './pages/PetShopPage';
import { RankingsPage } from './pages/RankingsPage';
import { AdminPage } from './pages/AdminPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { PetFeedingPage } from './pages/PetFeedingPage';
import { HelpPage } from './pages/HelpPage';
import { QuizPage } from './pages/QuizPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { BulletinPage } from './pages/BulletinPage';
import { SemesterPage } from './pages/SemesterPage';
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentChildDetailPage } from './pages/parent/ParentChildDetailPage';
import { LinkChildPage } from './pages/parent/LinkChildPage';
import { WechatCallbackPage } from './pages/WechatCallbackPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/wechat-callback" element={<WechatCallbackPage />} />
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="pets" element={<PetsPage />} />
            <Route path="shop" element={<PetShopPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="pets/feed" element={<PetFeedingPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="bulletin" element={<BulletinPage />} />
            <Route path="semester" element={<SemesterPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Route>
          <Route element={<ParentLayout />}>
            <Route path="parent/dashboard" element={<ParentDashboardPage />} />
            <Route path="parent/children/:id" element={<ParentChildDetailPage />} />
            <Route path="parent/link" element={<LinkChildPage />} />
            <Route path="parent/quiz" element={<QuizPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
