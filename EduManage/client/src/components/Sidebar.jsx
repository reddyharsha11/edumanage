import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, School, ClipboardList, MessageSquare,
  Bus, ClipboardCheck, Settings, LogOut, Building2, Users,
  FileText, Shield
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ADMIN_NAV = [
  { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield },
  { name: 'Institutions',    path: '/admin/institutions', icon: Building2 },
  { name: 'All Users',       path: '/admin/users', icon: Users },
  { name: 'Audit Logs',      path: '/admin/audit-logs', icon: FileText },
  { name: 'Settings',        path: '/settings', icon: Settings },
];

const OPERATOR_NAV = [
  { name: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard },
  { name: 'Classes',         path: '/classes',         icon: School },
  { name: 'Marks',           path: '/marks',           icon: ClipboardList },
  { name: 'Messages',        path: '/messages',        icon: MessageSquare },
  { name: 'Buses',           path: '/buses',           icon: Bus },
  { name: 'Bus Attendance',  path: '/bus-attendance',  icon: ClipboardCheck },
  { name: 'Settings',        path: '/settings',        icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = user?.role === 'admin' ? ADMIN_NAV : OPERATOR_NAV;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const roleLabel = user?.role?.replace('_', ' ') ?? 'user';
  const roleBadgeColor = {
    admin: 'bg-accentPurple/30 text-accentPurple',
    operator: 'bg-accentYellow/30 text-accentYellow',
    bus_driver: 'bg-accentOrange/30 text-accentOrange',
    partial: 'bg-white/10 text-white/70',
  }[user?.role] ?? 'bg-white/10 text-white/70';

  return (
    <div className="fixed left-0 top-0 w-[260px] h-screen chalkboard-bg text-white flex flex-col shadow-xl z-50 overflow-hidden">
      {/* Logo */}
      <div className="p-6 flex flex-col items-center border-b border-white/10">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
          <School size={32} className="text-sidebarBg" />
        </div>
        <h2 className="font-heading text-xl">EduManage</h2>
        <p className="text-sm opacity-70 font-body mt-0.5">School Management</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-6 py-3.5 font-body text-sm transition-all duration-150
              ${isActive
                ? 'bg-accentYellow/10 text-accentYellow border-l-4 border-accentYellow'
                : 'text-white/75 hover:bg-white/8 hover:text-white border-l-4 border-transparent'
              }
            `}
          >
            <item.icon size={19} className="mr-3.5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-accentYellow/20 border-2 border-accentYellow/50 flex items-center justify-center flex-shrink-0">
            <span className="font-heading text-sm text-accentYellow">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{user?.name}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-badge capitalize ${roleBadgeColor}`}>{roleLabel}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-btn text-white/70 hover:bg-white/10 hover:text-white transition-colors font-body text-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Decorative doodles */}
      <div className="absolute bottom-20 right-3 opacity-5 text-6xl pointer-events-none select-none">🍎</div>
      <div className="absolute bottom-36 left-2 opacity-5 text-4xl pointer-events-none select-none">✏️</div>
    </div>
  );
};

export default Sidebar;
