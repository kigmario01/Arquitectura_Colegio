import { motion, AnimatePresence } from 'framer-motion';

const DataTable = ({ columns, data, onEdit, onDelete, emptyMessage = 'Sin registros' }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead className="bg-white/5 text-left uppercase tracking-wider text-white/60">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-semibold">
                  {column.title}
                </th>
              ))}
              <th className="px-5 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-6 text-center text-white/50">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/5/0 hover:bg-white/5"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-5 py-4 text-white/80">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="rounded-full bg-primary/20 px-4 py-1 text-xs font-semibold text-primary/90 transition hover:bg-primary/40"
                          >
                            Editar
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="rounded-full bg-red-500/10 px-4 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
