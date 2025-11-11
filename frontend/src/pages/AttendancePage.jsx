import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../components/DataTable.jsx';
import FormDrawer from '../components/FormDrawer.jsx';
import { useCrud } from '../hooks/useCrud.js';
import { api } from '../utils/api.js';

const initialForm = {
  student_id: '',
  course_id: '',
  attendance_date: '',
  status: 'Presente'
};

const statusOptions = ['Presente', 'Ausente', 'Tarde'];

const AttendancePage = () => {
  const { items, loading, error, createItem, updateItem, deleteItem, fetchItems } = useCrud('attendance');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([api.get('/students'), api.get('/courses')]);
        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadOptions();
  }, []);

  const columns = useMemo(
    () => [
      { key: 'student_name', title: 'Estudiante' },
      { key: 'course_name', title: 'Curso' },
      { key: 'status', title: 'Estado' },
      { key: 'attendance_date', title: 'Fecha', render: (value) => value || '—' }
    ],
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...formData,
      student_id: Number(formData.student_id),
      course_id: Number(formData.course_id)
    };
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

  const openEdit = (attendance) => {
    setFormData({
      student_id: attendance.student_id,
      course_id: attendance.course_id,
      attendance_date: attendance.attendance_date || '',
      status: attendance.status
    });
    setEditingId(attendance.id);
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
          <h2 className="text-2xl font-semibold text-white">Gestión de Asistencias</h2>
          <p className="text-sm text-white/60">Registra la presencia diaria y visualiza el seguimiento.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:shadow-primary/40"
        >
          Nueva asistencia
        </button>
      </div>

      {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      {loading ? (
        <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/60">
          Cargando asistencias...
        </motion.p>
      ) : (
        <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={(attendance) => deleteItem(attendance.id)} />
      )}

      <FormDrawer open={drawerOpen} title={editingId ? 'Editar asistencia' : 'Nueva asistencia'} onClose={closeDrawer}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="text-white/70">Estudiante</span>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, student_id: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-secondary focus:outline-none"
            >
              <option value="" disabled>
                Selecciona un estudiante
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id} className="bg-surface text-white">
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-white/70">Curso</span>
            <select
              required
              value={formData.course_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, course_id: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-secondary focus:outline-none"
            >
              <option value="" disabled>
                Selecciona un curso
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="bg-surface text-white">
                  {course.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-white/70">Fecha</span>
              <input
                type="date"
                value={formData.attendance_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, attendance_date: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-secondary focus:outline-none"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-white/70">Estado</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-secondary focus:outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option} className="bg-surface text-white">
                    {option}
                  </option>
                ))}
              </select>
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

export default AttendancePage;
