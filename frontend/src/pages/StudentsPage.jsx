import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';
import { useCrud } from '../hooks/useCrud.js';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  enrollment_date: ''
};

const StudentsPage = () => {
  const { items, loading, error, createItem, updateItem, deleteItem, fetchItems } = useCrud('students');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const columns = useMemo(
    () => [
      { key: 'first_name', title: 'Nombre' },
      { key: 'last_name', title: 'Apellido' },
      { key: 'email', title: 'Email' },
      { key: 'phone', title: 'Teléfono', render: (value) => value || '—' },
      { key: 'enrollment_date', title: 'Inscripción', render: (value) => value || '—' }
    ],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await updateItem(editingId, formData);
    } else {
      await createItem(formData);
    }
    await fetchItems();
    closeDrawer();
  };

  const openCreate = () => {
    setFormData(initialForm);
    setEditingId(null);
    setDrawerOpen(true);
  };

  const openEdit = (student) => {
    setFormData({ ...student });
    setEditingId(student.id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setFormData(initialForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Gestión de Estudiantes</h2>
          <p className="text-sm text-white/60">Administra los estudiantes registrados y mantén sus datos al día.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:shadow-primary/40"
        >
          Nuevo estudiante
        </button>
      </div>

      {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      {loading ? (
        <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/60">
          Cargando estudiantes...
        </motion.p>
      ) : (
        <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={(student) => deleteItem(student.id)} />
      )}

      <FormDrawer open={drawerOpen} title={editingId ? 'Editar estudiante' : 'Nuevo estudiante'} onClose={closeDrawer}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-white/70">Nombre</span>
              <input
                required
                value={formData.first_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
                placeholder="Juan"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-white/70">Apellido</span>
              <input
                required
                value={formData.last_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
                placeholder="Pérez"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm">
            <span className="text-white/70">Correo electrónico</span>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
              placeholder="juan.perez@colegio.edu"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-white/70">Teléfono</span>
              <input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
                placeholder="+569 9999 9999"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-white/70">Fecha de inscripción</span>
              <input
                type="date"
                value={formData.enrollment_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, enrollment_date: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-full border border-white/10 px-6 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </FormDrawer>
    </div>
  );
};

export default StudentsPage;
