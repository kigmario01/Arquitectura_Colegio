import { useState } from 'react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: aquí iría la autenticación contra el backend
    // Por ahora solo mostramos una acción simulada
    // Puedes integrar tu API en src/utils/api.js cuando tengas endpoint
    alert(`Inicio de sesión simulado para: ${email}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-surface to-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
      >
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Acceso</p>
          <h1 className="text-2xl font-semibold text-white">Iniciar sesión</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-white/70">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
              placeholder="usuario@colegio.edu"
              required
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-white/70">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
              placeholder="••••••••"
              required
            />
          </label>
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20"
          >
            Entrar
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-white/50">
          Plataforma Estudiantil v1.0
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;