import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClassesPage } from './pages/ClassesPage';
import { StudentsPage } from './pages/StudentsPage';
import { RulesPage } from './pages/RulesPage';
import { PetsPage } from './pages/PetsPage';
import { RankingsPage } from './pages/RankingsPage';
import { AdminPage } from './pages/AdminPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { PetFeedingPage } from './pages/PetFeedingPage';
import { HelpPage } from './pages/HelpPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="rules" element={<RulesPage />} />
            <Route path="pets" element={<PetsPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="pets/feed" element={<PetFeedingPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
