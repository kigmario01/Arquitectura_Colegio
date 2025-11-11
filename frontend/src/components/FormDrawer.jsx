import { motion, AnimatePresence } from 'framer-motion';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const drawer = {
  hidden: { x: '100%' },
  visible: { x: 0 }
};

const FormDrawer = ({ open, title, children, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
        >
          <motion.div
            className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-surface p-6 shadow-2xl"
            variants={drawer}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Gestión</p>
                <h3 className="text-2xl font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-6 space-y-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormDrawer;
