import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'plataforma_estudiantil.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

sqlite3.verbose();
const db = new sqlite3.Database(DB_PATH);

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

const initializeDatabase = async () => {
  await runAsync('PRAGMA foreign_keys = ON');
  await runAsync(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      enrollment_date TEXT DEFAULT (DATE('now'))
    )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      hire_date TEXT DEFAULT (DATE('now'))
    )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      teacher_id INTEGER,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      grade REAL NOT NULL,
      grade_date TEXT DEFAULT (DATE('now')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      attendance_date TEXT DEFAULT (DATE('now')),
      status TEXT CHECK(status IN ('Presente', 'Ausente', 'Tarde')) DEFAULT 'Presente',
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )`);

  // Users for authentication
  await runAsync(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT (DATETIME('now'))
    )`);

  // Seed admin user if not exists
  const existingAdmin = await getAsync(`SELECT id FROM users WHERE email = ?`, ['admin@colegio.edu']);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('admin123', 10);
    await runAsync(
      `INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin@colegio.edu', hash, 'Admin', 'General', 'admin']
    );
    console.log('Usuario admin inicial creado: admin@colegio.edu / admin123');
  }
};

// Allow configuring CORS origin via env; default is open
const CORS_ORIGIN = process.env.CORS_ORIGIN;
app.use(CORS_ORIGIN ? cors({ origin: CORS_ORIGIN }) : cors());
app.use(express.json());

// Async handler util
const asyncHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Auth middleware (skips /api/auth/*)
const authMiddleware = (req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    return next();
  }
  const authHeader = req.headers['authorization'] || '';
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  if (!token) {
    return res.status(401).json({ message: 'No autorizado: token faltante' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'No autorizado: token inválido' });
  }
};

// Auth routes
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }
  const user = await getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role }
  });
}));

app.get('/api/auth/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await getAsync(`SELECT id, email, first_name, last_name, role FROM users WHERE id = ?`, [req.user.id]);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.json(user);
}));

// Apply auth protection to API routes (except /api/auth/* which is skipped above)
app.use(authMiddleware);

// Students CRUD
app.get('/api/students', asyncHandler(async (req, res) => {
  const students = await allAsync(`SELECT * FROM students ORDER BY last_name, first_name`);
  res.json(students);
}));

app.get('/api/students/:id', asyncHandler(async (req, res) => {
  const student = await getAsync(`SELECT * FROM students WHERE id = ?`, [req.params.id]);
  if (!student) {
    return res.status(404).json({ message: 'Estudiante no encontrado' });
  }
  res.json(student);
}));

app.post('/api/students', asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, enrollment_date } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: 'Nombre, apellido y email son obligatorios' });
  }
  const result = await runAsync(
    `INSERT INTO students (first_name, last_name, email, phone, enrollment_date) VALUES (?, ?, ?, ?, ?)` ,
    [first_name, last_name, email, phone || null, enrollment_date || null]
  );
  const student = await getAsync(`SELECT * FROM students WHERE id = ?`, [result.id]);
  res.status(201).json(student);
}));

app.put('/api/students/:id', asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, enrollment_date } = req.body;
  const result = await runAsync(
    `UPDATE students SET first_name = ?, last_name = ?, email = ?, phone = ?, enrollment_date = ? WHERE id = ?`,
    [first_name, last_name, email, phone || null, enrollment_date || null, req.params.id]
  );
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Estudiante no encontrado' });
  }
  const student = await getAsync(`SELECT * FROM students WHERE id = ?`, [req.params.id]);
  res.json(student);
}));

app.delete('/api/students/:id', asyncHandler(async (req, res) => {
  const result = await runAsync(`DELETE FROM students WHERE id = ?`, [req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Estudiante no encontrado' });
  }
  res.json({ message: 'Estudiante eliminado correctamente' });
}));

// Teachers CRUD
app.get('/api/teachers', asyncHandler(async (req, res) => {
  const teachers = await allAsync(`SELECT * FROM teachers ORDER BY last_name, first_name`);
  res.json(teachers);
}));

app.get('/api/teachers/:id', asyncHandler(async (req, res) => {
  const teacher = await getAsync(`SELECT * FROM teachers WHERE id = ?`, [req.params.id]);
  if (!teacher) {
    return res.status(404).json({ message: 'Profesor no encontrado' });
  }
  res.json(teacher);
}));

app.post('/api/teachers', asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, hire_date } = req.body;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: 'Nombre, apellido y email son obligatorios' });
  }
  const result = await runAsync(
    `INSERT INTO teachers (first_name, last_name, email, phone, hire_date) VALUES (?, ?, ?, ?, ?)` ,
    [first_name, last_name, email, phone || null, hire_date || null]
  );
  const teacher = await getAsync(`SELECT * FROM teachers WHERE id = ?`, [result.id]);
  res.status(201).json(teacher);
}));

app.put('/api/teachers/:id', asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, hire_date } = req.body;
  const result = await runAsync(
    `UPDATE teachers SET first_name = ?, last_name = ?, email = ?, phone = ?, hire_date = ? WHERE id = ?`,
    [first_name, last_name, email, phone || null, hire_date || null, req.params.id]
  );
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Profesor no encontrado' });
  }
  const teacher = await getAsync(`SELECT * FROM teachers WHERE id = ?`, [req.params.id]);
  res.json(teacher);
}));

app.delete('/api/teachers/:id', asyncHandler(async (req, res) => {
  const result = await runAsync(`DELETE FROM teachers WHERE id = ?`, [req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Profesor no encontrado' });
  }
  res.json({ message: 'Profesor eliminado correctamente' });
}));

// Courses CRUD
app.get('/api/courses', asyncHandler(async (req, res) => {
  const courses = await allAsync(`
    SELECT courses.*, 
           teachers.first_name || ' ' || teachers.last_name AS teacher_name
    FROM courses
    LEFT JOIN teachers ON teachers.id = courses.teacher_id
    ORDER BY courses.name
  `);
  res.json(courses);
}));

app.get('/api/courses/:id', asyncHandler(async (req, res) => {
  const course = await getAsync(`SELECT * FROM courses WHERE id = ?`, [req.params.id]);
  if (!course) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }
  res.json(course);
}));

app.post('/api/courses', asyncHandler(async (req, res) => {
  const { name, description, teacher_id } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'El nombre del curso es obligatorio' });
  }
  const result = await runAsync(
    `INSERT INTO courses (name, description, teacher_id) VALUES (?, ?, ?)` ,
    [name, description || null, teacher_id || null]
  );
  const course = await getAsync(`SELECT * FROM courses WHERE id = ?`, [result.id]);
  res.status(201).json(course);
}));

app.put('/api/courses/:id', asyncHandler(async (req, res) => {
  const { name, description, teacher_id } = req.body;
  const result = await runAsync(
    `UPDATE courses SET name = ?, description = ?, teacher_id = ? WHERE id = ?`,
    [name, description || null, teacher_id || null, req.params.id]
  );
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }
  const course = await getAsync(`SELECT * FROM courses WHERE id = ?`, [req.params.id]);
  res.json(course);
}));

app.delete('/api/courses/:id', asyncHandler(async (req, res) => {
  const result = await runAsync(`DELETE FROM courses WHERE id = ?`, [req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }
  res.json({ message: 'Curso eliminado correctamente' });
}));

// Grades CRUD
app.get('/api/grades', asyncHandler(async (req, res) => {
  const grades = await allAsync(`
    SELECT grades.*, 
           students.first_name || ' ' || students.last_name AS student_name,
           courses.name AS course_name
    FROM grades
    INNER JOIN students ON students.id = grades.student_id
    INNER JOIN courses ON courses.id = grades.course_id
    ORDER BY grade_date DESC
  `);
  res.json(grades);
}));

app.post('/api/grades', asyncHandler(async (req, res) => {
  const { student_id, course_id, grade, grade_date } = req.body;
  if (!student_id || !course_id || grade == null) {
    return res.status(400).json({ message: 'Estudiante, curso y nota son obligatorios' });
  }
  const result = await runAsync(
    `INSERT INTO grades (student_id, course_id, grade, grade_date) VALUES (?, ?, ?, ?)` ,
    [student_id, course_id, grade, grade_date || null]
  );
  const inserted = await getAsync(`SELECT * FROM grades WHERE id = ?`, [result.id]);
  res.status(201).json(inserted);
}));

app.put('/api/grades/:id', asyncHandler(async (req, res) => {
  const { student_id, course_id, grade, grade_date } = req.body;
  const result = await runAsync(
    `UPDATE grades SET student_id = ?, course_id = ?, grade = ?, grade_date = ? WHERE id = ?`,
    [student_id, course_id, grade, grade_date || null, req.params.id]
  );
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Registro de nota no encontrado' });
  }
  const updated = await getAsync(`SELECT * FROM grades WHERE id = ?`, [req.params.id]);
  res.json(updated);
}));

app.delete('/api/grades/:id', asyncHandler(async (req, res) => {
  const result = await runAsync(`DELETE FROM grades WHERE id = ?`, [req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Registro de nota no encontrado' });
  }
  res.json({ message: 'Nota eliminada correctamente' });
}));

// Attendance CRUD
app.get('/api/attendance', asyncHandler(async (req, res) => {
  const attendance = await allAsync(`
    SELECT attendance.*, 
           students.first_name || ' ' || students.last_name AS student_name,
           courses.name AS course_name
    FROM attendance
    INNER JOIN students ON students.id = attendance.student_id
    INNER JOIN courses ON courses.id = attendance.course_id
    ORDER BY attendance_date DESC
  `);
  res.json(attendance);
}));

app.post('/api/attendance', asyncHandler(async (req, res) => {
  const { student_id, course_id, attendance_date, status } = req.body;
  if (!student_id || !course_id) {
    return res.status(400).json({ message: 'Estudiante y curso son obligatorios' });
  }
  const result = await runAsync(
    `INSERT INTO attendance (student_id, course_id, attendance_date, status) VALUES (?, ?, ?, ?)` ,
    [student_id, course_id, attendance_date || null, status || 'Presente']
  );
  const inserted = await getAsync(`SELECT * FROM attendance WHERE id = ?`, [result.id]);
  res.status(201).json(inserted);
}));

app.put('/api/attendance/:id', asyncHandler(async (req, res) => {
  const { student_id, course_id, attendance_date, status } = req.body;
  const result = await runAsync(
    `UPDATE attendance SET student_id = ?, course_id = ?, attendance_date = ?, status = ? WHERE id = ?`,
    [student_id, course_id, attendance_date || null, status || 'Presente', req.params.id]
  );
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
  }
  const updated = await getAsync(`SELECT * FROM attendance WHERE id = ?`, [req.params.id]);
  res.json(updated);
}));

app.delete('/api/attendance/:id', asyncHandler(async (req, res) => {
  const result = await runAsync(`DELETE FROM attendance WHERE id = ?`, [req.params.id]);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
  }
  res.json({ message: 'Asistencia eliminada correctamente' });
}));

// Summary endpoint for dashboard
app.get('/api/summary', asyncHandler(async (req, res) => {
  const [studentsCount, teachersCount, coursesCount, gradesAverage, attendanceStats, gradesPerCourse, attendanceTrend] = await Promise.all([
    getAsync('SELECT COUNT(*) as total FROM students'),
    getAsync('SELECT COUNT(*) as total FROM teachers'),
    getAsync('SELECT COUNT(*) as total FROM courses'),
    getAsync('SELECT AVG(grade) as average FROM grades'),
    getAsync(`SELECT 
                SUM(CASE WHEN status = 'Presente' THEN 1 ELSE 0 END) AS presentes,
                SUM(CASE WHEN status = 'Ausente' THEN 1 ELSE 0 END) AS ausentes,
                SUM(CASE WHEN status = 'Tarde' THEN 1 ELSE 0 END) AS tardes,
                COUNT(*) AS total
              FROM attendance`),
    allAsync(`SELECT courses.name AS course_name, AVG(grades.grade) AS average_grade
              FROM grades
              INNER JOIN courses ON courses.id = grades.course_id
              GROUP BY courses.id
              ORDER BY courses.name`),
    allAsync(`SELECT attendance_date AS date,
                     SUM(CASE WHEN status = 'Presente' THEN 1 ELSE 0 END) AS present_count
              FROM attendance
              GROUP BY attendance_date
              ORDER BY attendance_date DESC
              LIMIT 7`)
  ]);

  const attendanceRate = attendanceStats?.total
    ? Math.round((attendanceStats.presentes / attendanceStats.total) * 100)
    : 0;

  res.json({
    totals: {
      students: studentsCount?.total || 0,
      teachers: teachersCount?.total || 0,
      courses: coursesCount?.total || 0,
      averageGrade: gradesAverage?.average ? Number(gradesAverage.average).toFixed(2) : '0.00',
      attendanceRate
    },
    gradesPerCourse: gradesPerCourse.map((item) => ({
      course: item.course_name,
      average: item.average_grade ? Number(item.average_grade).toFixed(2) : '0.00'
    })),
    attendanceTrend: attendanceTrend
      .map((item) => ({ date: item.date, present: item.present_count }))
      .reverse()
  });
}));

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
      console.log(`Base de datos en: ${DB_PATH}`);
    });
  })
  .catch((error) => {
    console.error('Error inicializando la base de datos', error);
    process.exit(1);
  });
