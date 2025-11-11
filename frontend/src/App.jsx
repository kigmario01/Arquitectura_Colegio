import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import GradesPage from './pages/GradesPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

const App = () => {
  const location = useLocation();
  const isLogin = location.pathname.startsWith('/login');
  const RequireAuth = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
  };
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-surface to-background text-white">
      {!isLogin && <Sidebar />}
      <div className="flex flex-1 flex-col">
        {!isLogin && <Navbar />}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/estudiantes" element={<RequireAuth><StudentsPage /></RequireAuth>} />
            <Route path="/profesores" element={<RequireAuth><TeachersPage /></RequireAuth>} />
            <Route path="/cursos" element={<RequireAuth><CoursesPage /></RequireAuth>} />
            <Route path="/notas" element={<RequireAuth><GradesPage /></RequireAuth>} />
            <Route path="/asistencias" element={<RequireAuth><AttendancePage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
