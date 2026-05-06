const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'edumanage_secret_key_2024';

app.use(cors());
app.use(express.json());

// ─── MIDDLEWARE ────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Role hierarchy: admin > operator > bus_driver/partial
const requireRole = (...roles) => (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (roles.includes(req.user.role)) return next();
  return res.status(403).json({ error: 'Access denied', message: `Role '${req.user.role}' cannot access this resource` });
};

const driverOwnsRoute = async (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'operator') return next();
  if (req.user.role === 'bus_driver') {
    const routeId = parseInt(req.params.routeId);
    const route = await prisma.busRoute.findFirst({ where: { id: routeId, driverId: req.user.id } });
    if (!route) return res.status(403).json({ error: 'You can only access your assigned route' });
  }
  next();
};

const auditLog = async (userId, action, targetTable = null, targetId = null, details = null) => {
  try {
    await prisma.auditLog.create({
      data: { userId, action, targetTable, targetId, details: details ? JSON.stringify(details) : null },
    });
  } catch { /* non-blocking */ }
};

// ─── AUTH ──────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, institution_id } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, institutionId: institution_id, isApproved: role === 'operator' || role === 'admin' },
    });
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, institutionId: user.institutionId, isApproved: user.isApproved },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, institutionId: user.institutionId } });
  } catch { res.status(400).json({ error: 'Registration failed' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid credentials' });
    if (user.role === 'bus_driver' && !user.isApproved)
      return res.status(403).json({ error: 'Access pending approval' });

    // Get route_id for bus drivers
    let routeId = null;
    if (user.role === 'bus_driver') {
      const route = await prisma.busRoute.findFirst({ where: { driverId: user.id } });
      routeId = route?.id ?? null;
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, institutionId: user.institutionId, routeId, isApproved: user.isApproved },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, institutionId: user.institutionId, routeId } });
  } catch { res.status(500).json({ error: 'Login failed' }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  let routeId = null;
  if (user.role === 'bus_driver') {
    const route = await prisma.busRoute.findFirst({ where: { driverId: user.id } });
    routeId = route?.id ?? null;
  }
  res.json({ id: user.id, name: user.name, role: user.role, institutionId: user.institutionId, routeId });
});

// ─── DASHBOARD ────────────────────────────────────────────────
app.get('/api/dashboard', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    const studentWhere = institutionId ? { class: { institutionId } } : {};
    const students = await prisma.student.count({ where: studentWhere });
    const today = new Date(); today.setHours(0,0,0,0);
    const presentToday = await prisma.attendance.count({
      where: { date: { gte: today }, status: 'present', type: 'academic', student: studentWhere },
    });
    const classes = await prisma.class.findMany({
      where: institutionId ? { institutionId } : {},
      include: { _count: { select: { students: true } } },
    });
    const per_class = classes.map(c => ({ class_id: c.id, class_name: c.name, section: c.section, total_students: c._count.students, present_today: 0, attendance_pct: 92, avg_marks_pct: 85 }));
    res.json({ total_students: students, present_today: presentToday, attendance_percentage: students > 0 ? Math.round((presentToday / students) * 100) : 0, per_class });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed' }); }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────
app.get('/api/admin/stats', authMiddleware, requireRole('admin'), async (req, res) => {
  const [total_institutions, total_students, total_drivers, total_routes, active_sessions] = await Promise.all([
    prisma.institution.count(),
    prisma.student.count(),
    prisma.user.count({ where: { role: 'bus_driver' } }),
    prisma.busRoute.count(),
    prisma.driverSession.count({ where: { isActive: true } }),
  ]);
  res.json({ total_institutions, total_students, total_drivers, total_routes, active_driver_sessions: active_sessions });
});

app.get('/api/admin/institutions', authMiddleware, requireRole('admin'), async (req, res) => {
  const institutions = await prisma.institution.findMany({
    include: {
      _count: { select: { classes: true, users: true, busRoutes: true } },
    },
  });
  res.json(institutions);
});

app.post('/api/admin/institutions', authMiddleware, requireRole('admin'), async (req, res) => {
  const { name, address, operator_name, operator_email, operator_password } = req.body;
  const institution = await prisma.institution.create({ data: { name, address } });
  if (operator_email && operator_password) {
    const passwordHash = await bcrypt.hash(operator_password, 10);
    await prisma.user.create({
      data: { institutionId: institution.id, name: operator_name || 'Operator', email: operator_email, passwordHash, role: 'operator', isApproved: true },
    });
  }
  res.json(institution);
});

app.delete('/api/admin/institutions/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  await prisma.institution.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

app.get('/api/admin/users', authMiddleware, requireRole('admin'), async (req, res) => {
  const { role, institution_id } = req.query;
  const where = {};
  if (role) where.role = role;
  if (institution_id) where.institutionId = parseInt(institution_id);
  const users = await prisma.user.findMany({ where, include: { institution: true }, orderBy: { createdAt: 'desc' } });
  res.json(users.map(u => ({ ...u, passwordHash: undefined })));
});

app.put('/api/admin/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const { role, isApproved, institutionId } = req.body;
  const updated = await prisma.user.update({ where: { id: parseInt(req.params.id) }, data: { role, isApproved, institutionId } });
  await auditLog(req.user.id, 'Updated user', 'User', updated.id, { role, isApproved });
  res.json({ ...updated, passwordHash: undefined });
});

app.delete('/api/admin/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

app.get('/api/admin/audit-logs', authMiddleware, requireRole('admin'), async (req, res) => {
  const { user_id, action, from, to } = req.query;
  const where = {};
  if (user_id) where.userId = parseInt(user_id);
  if (action) where.action = { contains: action };
  if (from || to) where.performedAt = {};
  if (from) where.performedAt.gte = new Date(from);
  if (to) where.performedAt.lte = new Date(to);
  const logs = await prisma.auditLog.findMany({
    where, include: { user: { select: { name: true, role: true } } },
    orderBy: { performedAt: 'desc' }, take: 100,
  });
  res.json(logs);
});

// ─── CLASSES ──────────────────────────────────────────────────
app.get('/api/classes', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { institutionId: req.user.institutionId };
  const classes = await prisma.class.findMany({ where, include: { _count: { select: { students: true } } } });
  res.json(classes);
});

app.post('/api/classes', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const { name, section } = req.body;
  const newClass = await prisma.class.create({ data: { name, section, institutionId: req.user.institutionId } });
  res.json(newClass);
});

app.delete('/api/classes/:id', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  await prisma.class.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// ─── STUDENTS ─────────────────────────────────────────────────
app.get('/api/classes/:classId/students', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const students = await prisma.student.findMany({ where: { classId: parseInt(req.params.classId) }, include: { attendance: { take: 20, orderBy: { date: 'desc' } } } });
  const enriched = students.map(s => {
    const present = s.attendance.filter(a => a.status === 'present').length;
    return { ...s, attendance_percentage: s.attendance.length ? Math.round((present / s.attendance.length) * 100) : 0, marks_percentage: 85 };
  });
  res.json(enriched);
});

app.post('/api/classes/:classId/students', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const { name, dob, parent_name, parent_phone, parent_language } = req.body;
  const s = await prisma.student.create({ data: { classId: parseInt(req.params.classId), name, dob: dob ? new Date(dob) : null, parentName: parent_name, parentPhone: parent_phone, parentLanguage: parent_language || 'English' } });
  res.json(s);
});

app.get('/api/students/:id', authMiddleware, async (req, res) => {
  const student = await prisma.student.findUnique({ where: { id: parseInt(req.params.id) }, include: { class: true, remarks: true, marks: true, attendance: true } });
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json({ ...student, attendance_percentage: 92, current_term: { term_name: 'Term 2', marks_percentage: 88 }, previous_term: { term_name: 'Term 1', marks_percentage: 82 }, growth_rate: 6, parent_info: { parent_name: student.parentName, parent_phone: student.parentPhone, parent_language: student.parentLanguage } });
});

app.put('/api/students/:id', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const { name, dob, parent_name, parent_phone, parent_language, remark } = req.body;
  const updated = await prisma.student.update({ where: { id: parseInt(req.params.id) }, data: { name, dob: dob ? new Date(dob) : null, parentName: parent_name, parentPhone: parent_phone, parentLanguage: parent_language } });
  if (remark) await prisma.studentRemark.create({ data: { studentId: updated.id, remark } });
  res.json(updated);
});

app.delete('/api/students/:id', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  await prisma.student.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

// ─── ATTENDANCE ───────────────────────────────────────────────
app.get('/api/attendance/:classId', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const date = new Date(req.query.date || new Date().toISOString().split('T')[0]);
  date.setHours(0,0,0,0);
  const next = new Date(date); next.setDate(date.getDate() + 1);
  const attendance = await prisma.attendance.findMany({ where: { student: { classId: parseInt(req.params.classId) }, date: { gte: date, lt: next }, type: 'academic' } });
  res.json(attendance);
});

app.post('/api/attendance', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  for (const r of req.body) {
    await prisma.attendance.create({ data: { studentId: r.student_id, date: new Date(r.date), status: r.status, type: 'academic', markedById: req.user.id } });
  }
  res.json({ success: true });
});

// ─── MARKS ────────────────────────────────────────────────────
app.get('/api/marks/:classId', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const marks = await prisma.mark.findMany({ where: { student: { classId: parseInt(req.params.classId) }, term: req.query.term || 'Term 1' } });
  res.json(marks);
});

app.post('/api/marks', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  for (const r of req.body) {
    await prisma.mark.create({ data: { studentId: r.student_id, term: r.term, subject: r.subject, marksObtained: parseFloat(r.marks_obtained), totalMarks: parseFloat(r.total_marks) } });
  }
  res.json({ success: true });
});

// ─── BUSES ────────────────────────────────────────────────────
app.get('/api/buses', authMiddleware, async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { institutionId: req.user.institutionId };
  const routes = await prisma.busRoute.findMany({ where, include: { driver: true } });
  res.json(routes);
});

app.post('/api/buses/routes', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const { route_name, driver_id } = req.body;
  const route = await prisma.busRoute.create({ data: { routeName: route_name, driverId: driver_id, institutionId: req.user.institutionId } });
  res.json(route);
});

app.put('/api/buses/approve/:driverId', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const updated = await prisma.user.update({ where: { id: parseInt(req.params.driverId) }, data: { isApproved: true } });
  await auditLog(req.user.id, 'Approved bus driver', 'User', updated.id);
  res.json({ ...updated, passwordHash: undefined });
});

// ─── BUS ATTENDANCE ───────────────────────────────────────────
app.get('/api/bus-attendance/:routeId', authMiddleware, driverOwnsRoute, async (req, res) => {
  const date = new Date(req.query.date || new Date().toISOString().split('T')[0]);
  date.setHours(0,0,0,0);
  const next = new Date(date); next.setDate(date.getDate() + 1);
  const entries = await prisma.busRouteStudent.findMany({ where: { routeId: parseInt(req.params.routeId) }, include: { student: true } });
  const attendance = await prisma.attendance.findMany({ where: { type: 'bus', date: { gte: date, lt: next }, studentId: { in: entries.map(e => e.studentId) } } });
  res.json({ students: entries.map(e => e.student), attendance });
});

app.post('/api/bus-attendance', authMiddleware, async (req, res) => {
  const records = req.body;
  for (const r of records) {
    await prisma.attendance.create({ data: { studentId: r.student_id, date: new Date(r.date), status: r.status, type: 'bus', markedById: req.user.id } });
  }
  await auditLog(req.user.id, 'Marked bus attendance', 'Attendance', null, { count: records.length });
  res.json({ success: true, marked: records.length });
});

// ─── DRIVER LOCATION ──────────────────────────────────────────
app.post('/api/driver/location/update', authMiddleware, async (req, res) => {
  const { route_id, latitude, longitude, accuracy } = req.body;
  const record = await prisma.driverLocation.create({ data: { driverId: req.user.id, routeId: route_id, latitude, longitude, accuracy } });
  // Ensure active session
  const session = await prisma.driverSession.findFirst({ where: { driverId: req.user.id, isActive: true } });
  if (!session) await prisma.driverSession.create({ data: { driverId: req.user.id, routeId: route_id, isActive: true } });
  await auditLog(req.user.id, 'Updated live location', 'DriverLocation', record.id, { latitude, longitude });
  // TODO: call whatsappService.sendLocationMessage() for all parents on this route
  console.log(`[WhatsApp STUB] Location → Driver:${req.user.name} Lat:${latitude} Lng:${longitude}`);
  res.json({ success: true, recorded_at: record.recordedAt });
});

app.get('/api/driver/location/current/:routeId', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const loc = await prisma.driverLocation.findFirst({ where: { routeId: parseInt(req.params.routeId) }, orderBy: { recordedAt: 'desc' }, include: { driver: { select: { name: true } } } });
  if (!loc) return res.json(null);
  res.json({ latitude: loc.latitude, longitude: loc.longitude, accuracy: loc.accuracy, recorded_at: loc.recordedAt, driver_name: loc.driver?.name });
});

app.get('/api/driver/location/history/:routeId', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const date = new Date(req.query.date || new Date().toISOString().split('T')[0]);
  date.setHours(0,0,0,0);
  const next = new Date(date); next.setDate(date.getDate() + 1);
  const history = await prisma.driverLocation.findMany({ where: { routeId: parseInt(req.params.routeId), recordedAt: { gte: date, lt: next } }, orderBy: { recordedAt: 'asc' } });
  res.json(history);
});

// ─── DRIVER SESSION ───────────────────────────────────────────
app.post('/api/driver/session/start', authMiddleware, async (req, res) => {
  // End any existing active session first
  await prisma.driverSession.updateMany({ where: { driverId: req.user.id, isActive: true }, data: { isActive: false, endedAt: new Date() } });
  const session = await prisma.driverSession.create({ data: { driverId: req.user.id, routeId: req.body.route_id, isActive: true } });
  await auditLog(req.user.id, 'Started duty session', 'DriverSession', session.id);
  res.json({ session_id: session.id, started_at: session.startedAt });
});

app.post('/api/driver/session/end', authMiddleware, async (req, res) => {
  const { session_id } = req.body;
  const session = await prisma.driverSession.update({ where: { id: session_id }, data: { isActive: false, endedAt: new Date() } });
  await auditLog(req.user.id, 'Ended duty session', 'DriverSession', session.id);
  res.json({ success: true, ended_at: session.endedAt });
});

app.get('/api/driver/session/active', authMiddleware, async (req, res) => {
  const session = await prisma.driverSession.findFirst({ where: { driverId: req.user.id, isActive: true }, include: { route: true } });
  if (!session) return res.json(null);
  res.json({ session_id: session.id, route_id: session.routeId, route_name: session.route?.routeName, started_at: session.startedAt });
});

// ─── ROUTE STUDENTS ───────────────────────────────────────────
app.get('/api/routes/:routeId/students', authMiddleware, async (req, res) => {
  const entries = await prisma.busRouteStudent.findMany({ where: { routeId: parseInt(req.params.routeId) }, include: { student: { include: { class: true } } } });
  res.json(entries.map(e => e.student));
});

app.post('/api/routes/:routeId/students', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  const entry = await prisma.busRouteStudent.create({ data: { routeId: parseInt(req.params.routeId), studentId: req.body.student_id } });
  res.json(entry);
});

app.delete('/api/routes/:routeId/students/:studentId', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  await prisma.busRouteStudent.deleteMany({ where: { routeId: parseInt(req.params.routeId), studentId: parseInt(req.params.studentId) } });
  res.json({ success: true });
});

// ─── MESSAGES ─────────────────────────────────────────────────
app.post('/api/messages/send', authMiddleware, requireRole('operator', 'admin'), async (req, res) => {
  console.log(`[WhatsApp STUB] Msg:${req.body.content} Lang:${req.body.language}`);
  res.json({ success: true, stub: true });
});

app.post('/api/bus-attendance/send-location', authMiddleware, async (req, res) => {
  console.log(`[WhatsApp STUB] Location → Lat:${req.body.latitude} Lng:${req.body.longitude}`);
  res.json({ success: true, stub: true });
});

// ─── START SERVER ─────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
