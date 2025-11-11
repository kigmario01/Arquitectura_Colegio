import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';
import StatCard from '../components/StatCard.jsx';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/summary');
        setSummary(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center py-20 text-white/60">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          Cargando dashboard...
        </motion.div>
      </div>
    );
  }

  if (!summary) {
    return <p className="text-white/60">No hay datos disponibles.</p>;
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Estudiantes"
          value={summary.totals.students}
          description="Total de estudiantes inscritos"
          accent="from-primary to-secondary"
        />
        <StatCard
          title="Profesores"
          value={summary.totals.teachers}
          description="Docentes activos este periodo"
          accent="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Cursos"
          value={summary.totals.courses}
          description="Cursos gestionados en la plataforma"
          accent="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Asistencia"
          value={`${summary.totals.attendanceRate}%`}
          description="Tasa general de asistencia"
          accent="from-amber-400 to-orange-500"
        />
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur lg:col-span-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Análisis</p>
              <h3 className="text-xl font-semibold text-white">Promedio de notas por curso</h3>
            </div>
            <span className="text-sm text-white/60">Promedio general: {summary.totals.averageGrade}</span>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer>
              <BarChart data={summary.gradesPerCourse}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="course" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="average" fill="url(#colorAverage)" radius={[12, 12, 0, 0]} />
                <defs>
                  <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur lg:col-span-2"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Asistencia</p>
            <h3 className="text-xl font-semibold text-white">Tendencia semanal</h3>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer>
              <AreaChart data={summary.attendanceTrend}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.6)" tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <Tooltip contentStyle={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="present" stroke="#22d3ee" fill="url(#colorAttendance)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;
