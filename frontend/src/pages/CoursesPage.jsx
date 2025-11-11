import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';
import { useCrud } from '../hooks/useCrud.js';
import { api } from '../utils/api.js';

const initialForm = {
  name: '',
  description: '',
  teacher_id: ''
};

const CoursesPage = () => {
  const { items, loading, error, createItem, updateItem, deleteItem, fetchItems } = useCrud('courses');
  const [teachers, setTeachers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const { data } = await api.get('/teachers');
        setTeachers(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadTeachers();
  }, []);

  const columns = useMemo(
    () => [
      { key: 'name', title: 'Curso' },
      { key: 'description', title: 'Descripción', render: (value) => value || '—' },
      { key: 'teacher_name', title: 'Profesor', render: (value) => value || 'Sin asignar' }
    ],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...formData, teacher_id: formData.teacher_id || null };
    if (editingId) {
      await updateItem(editingId, payload);
    } else {
      await createItem(payload);
    }
    await fetchItems();
    closeDrawer();
  };

  const openCreate = () => {
    setFormData(initialForm);
    setEditingId(null);
    setDrawerOpen(true);
  };

  const openEdit = (course) => {
    setFormData({
      name: course.name,
      description: course.description || '',
      teacher_id: course.teacher_id || ''
    });
    setEditingId(course.id);
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
          <h2 className="text-2xl font-semibold text-white">Gestión de Cursos</h2>
          <p className="text-sm text-white/60">Define y actualiza los cursos ofrecidos en el colegio.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:shadow-primary/40"
        >
          Nuevo curso
        </button>
      </div>

      {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      {loading ? (
        <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/60">
          Cargando cursos...
        </motion.p>
      ) : (
        <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={(course) => deleteItem(course.id)} />
      )}

      <FormDrawer open={drawerOpen} title={editingId ? 'Editar curso' : 'Nuevo curso'} onClose={closeDrawer}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="text-white/70">Nombre del curso</span>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
              placeholder="Matemáticas Avanzadas"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-white/70">Descripción</span>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
              placeholder="Detalle breve del curso"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-white/70">Profesor asignado</span>
            <select
              value={formData.teacher_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, teacher_id: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-secondary focus:outline-none"
            >
              <option value="">Sin profesor</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id} className="bg-surface text-white">
                  {teacher.first_name} {teacher.last_name}
                </option>
              ))}
            </select>
          </label>
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

export default CoursesPage;
