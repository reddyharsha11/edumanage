import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import BusAttendance from './pages/BusAttendance';
import BusDriverPortal from './pages/BusDriverPortal';
import Buses from './pages/Buses';
import Marks from './pages/Marks';
import MarksSheet from './pages/MarksSheet';
import Messages from './pages/Messages';
import ClassMessages from './pages/ClassMessages';
import AdminDashboard from './pages/AdminDashboard';
import AdminInstitutions from './pages/AdminInstitutions';
import AdminUsers from './pages/AdminUsers';
import AdminAuditLogs from './pages/AdminAuditLogs';
import Sidebar from './components/Sidebar';

// ── Layout wrapper for pages WITH sidebar ────────────────────
const WithSidebar = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center font-heading text-2xl">Loading... ✏️</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" />;
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8 pb-24">
        {children}
      </main>
    </div>
  );
};

// ── Route that just needs auth (no sidebar override needed) ───
const AuthOnly = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center font-heading text-2xl">Loading... ✏️</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// ── Root redirect based on role ───────────────────────────────
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center font-heading text-2xl">Loading... ✏️</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin')      return <Navigate to="/admin/dashboard" />;
  if (user.role === 'bus_driver') return <Navigate to="/bus-driver" />;
  return <Navigate to="/dashboard" />;
};

// ── Stub for placeholder pages ────────────────────────────────
const StubPage = ({ title }) => (
  <div className="max-w-6xl mx-auto">
    <h1 className="font-heading text-3xl text-sidebarBg mb-4">{title}</h1>
    <div className="bg-cardBg p-8 rounded-card border-2 border-dashed border-borderColor text-center text-textSecondary font-bold">
      🚧 This section is under construction.
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Bus Driver — full screen, no sidebar */}
          <Route path="/bus-driver" element={<AuthOnly><BusDriverPortal /></AuthOnly>} />

          {/* Operator pages */}
          <Route path="/dashboard"       element={<WithSidebar allowedRoles={['operator']}><Dashboard /></WithSidebar>} />
          <Route path="/classes"         element={<WithSidebar allowedRoles={['operator']}><Classes /></WithSidebar>} />
          <Route path="/classes/:classId/students" element={<WithSidebar allowedRoles={['operator']}><StudentList /></WithSidebar>} />
          <Route path="/students/:id"    element={<WithSidebar allowedRoles={['operator']}><StudentDetail /></WithSidebar>} />
          <Route path="/marks"           element={<WithSidebar allowedRoles={['operator']}><Marks /></WithSidebar>} />
          <Route path="/marks/:classId"  element={<WithSidebar allowedRoles={['operator']}><MarksSheet /></WithSidebar>} />
          <Route path="/messages"        element={<WithSidebar allowedRoles={['operator']}><Messages /></WithSidebar>} />
          <Route path="/messages/:classId" element={<WithSidebar allowedRoles={['operator']}><ClassMessages /></WithSidebar>} />
          <Route path="/buses"           element={<WithSidebar allowedRoles={['operator']}><Buses /></WithSidebar>} />
          <Route path="/bus-attendance"  element={<WithSidebar allowedRoles={['operator', 'bus_driver']}><BusAttendance /></WithSidebar>} />
          <Route path="/settings"        element={<WithSidebar allowedRoles={['operator', 'admin']}><StubPage title="⚙️ Settings" /></WithSidebar>} />

          {/* Admin pages */}
          <Route path="/admin/dashboard"    element={<WithSidebar allowedRoles={['admin']}><AdminDashboard /></WithSidebar>} />
          <Route path="/admin/institutions" element={<WithSidebar allowedRoles={['admin']}><AdminInstitutions /></WithSidebar>} />
          <Route path="/admin/users"        element={<WithSidebar allowedRoles={['admin']}><AdminUsers /></WithSidebar>} />
          <Route path="/admin/audit-logs"   element={<WithSidebar allowedRoles={['admin']}><AdminAuditLogs /></WithSidebar>} />

          {/* Catch-all */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-bgPrimary">
              <div className="text-6xl">🛑</div>
              <h1 className="font-heading text-4xl text-accentRed">Unauthorized</h1>
              <p className="text-textSecondary font-bold">You don't have permission to access this page.</p>
              <a href="/" className="bg-sidebarBg text-white font-bold px-6 py-3 rounded-btn mt-2">Go Home</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
