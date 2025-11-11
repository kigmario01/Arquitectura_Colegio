import { motion } from 'framer-motion';

const StatCard = ({ title, value, description, accent = 'from-primary to-secondary' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur"
    >
      <p className="text-xs uppercase tracking-widest text-white/60">{title}</p>
      <h3 className="mt-2 text-3xl font-semibold text-white">{value}</h3>
      <div className={`mt-4 h-1 w-16 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-3 text-sm text-white/60">{description}</p>
    </motion.div>
  );
};

export default StatCard;
