import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChalkboardTeacher, FaGraduationCap, FaHome, FaUserGraduate, FaClipboardList, FaBook } from 'react-icons/fa';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FaHome },
  { to: '/estudiantes', label: 'Estudiantes', icon: FaUserGraduate },
  { to: '/profesores', label: 'Profesores', icon: FaChalkboardTeacher },
  { to: '/cursos', label: 'Cursos', icon: FaBook },
  { to: '/notas', label: 'Notas', icon: FaGraduationCap },
  { to: '/asistencias', label: 'Asistencias', icon: FaClipboardList }
];

const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-72 flex-col bg-surface/80 backdrop-blur border-r border-white/5">
      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold">
            PE
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">Colegio</p>
            <h1 className="text-xl font-semibold">Plataforma Estudiantil</h1>
          </div>
        </motion.div>
      </div>
      <nav className="flex-1 space-y-2 px-4 pb-6">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="text-lg" />
            <span>{label}</span>
            <motion.span
              layoutId="activeIndicator"
              className="ml-auto h-2 w-2 rounded-full bg-secondary/70 opacity-0 group-[.active]:opacity-100"
            />
          </NavLink>
        ))}
      </nav>
      <div className="px-6 pb-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
          Gestiona estudiantes, profesores, cursos, notas y asistencia desde un mismo lugar. Datos protegidos y sincronizados en tiempo real.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
export { navItems };
