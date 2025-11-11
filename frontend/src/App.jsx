import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import GradesPage from './pages/GradesPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';

const App = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-surface to-background text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/estudiantes" element={<StudentsPage />} />
            <Route path="/profesores" element={<TeachersPage />} />
            <Route path="/cursos" element={<CoursesPage />} />
            <Route path="/notas" element={<GradesPage />} />
            <Route path="/asistencias" element={<AttendancePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
