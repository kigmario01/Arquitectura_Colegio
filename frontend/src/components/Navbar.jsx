import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from './Sidebar.jsx';
import { FaBars } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Navbar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((item) => location.pathname.startsWith(item.to)) || navItems[0],
    [location.pathname]
  );

  const toggleMenu = () => {
    setShowMobileMenu((prev) => !prev);
    onToggleSidebar?.();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Sesión cerrada');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/60 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-white lg:hidden"
            onClick={toggleMenu}
          >
            <FaBars />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Módulo</p>
            <h2 className="text-lg font-semibold text-white lg:text-2xl">{activeItem?.label}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-xs text-white/80"
          >
            Plataforma Estudiantil v1.0
          </motion.div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showMobileMenu && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-2 border-t border-white/5 bg-surface/90 px-4 py-4 lg:hidden"
          >
            {navItems.map(({ to, label }) => (
              <a key={to} href={to} className="rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white/80">
                {label}
              </a>
            ))}
            <button
              onClick={handleLogout}
              className="rounded-xl bg-white/5 px-4 py-3 text-left text-sm font-medium text-white/80"
            >
              Cerrar sesión
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
