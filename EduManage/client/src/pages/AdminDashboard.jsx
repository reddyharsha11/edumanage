import { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Users, Bus, MapPin, BarChart3, Activity, Clock, CheckCircle } from 'lucide-react';

const AdminStatCard = ({ icon: Icon, value, label, color, bg }) => (
  <div className={`${bg} rounded-card p-5 border border-borderColor shadow-card flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center bg-white/70`}>
      <Icon size={24} />
    </div>
    <div>
      <div className="font-heading text-3xl text-textPrimary">{value}</div>
      <div className="text-sm font-bold text-textSecondary">{label}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, iRes, aRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/institutions'),
          api.get('/admin/audit-logs'),
        ]);
        setStats(sRes.data);
        setInstitutions(iRes.data);
        setAuditLogs(aRes.data.slice(0, 20));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="text-center mt-20 font-heading text-2xl">Loading Admin Dashboard... 📊</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-sidebarBg">🛡️ Admin Dashboard</h1>
        <p className="text-textSecondary font-bold mt-1">Global overview across all institutions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        <AdminStatCard icon={Building2} value={stats?.total_institutions ?? 0} label="Institutions" color="text-accentPurple" bg="bg-accentPurple/10" />
        <AdminStatCard icon={Users} value={stats?.total_students ?? 0} label="Total Students" color="text-accentBlue" bg="bg-accentBlue/10" />
        <AdminStatCard icon={Bus} value={stats?.total_drivers ?? 0} label="Bus Drivers" color="text-accentOrange" bg="bg-accentOrange/10" />
        <AdminStatCard icon={MapPin} value={stats?.total_routes ?? 0} label="Active Routes" color="text-accentGreen" bg="bg-accentGreen/10" />
        <AdminStatCard icon={Activity} value={stats?.active_driver_sessions ?? 0} label="Live Sessions" color="text-accentRed" bg="bg-accentRed/10" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Institutions Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-2xl text-sidebarBg">🏫 Institutions</h2>
            <a href="/admin/institutions" className="text-accentBlue font-bold text-sm hover:underline">View All →</a>
          </div>
          <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden">
            <table className="w-full">
              <thead className="bg-sidebarBg text-white">
                <tr>
                  <th className="p-3 text-left font-heading text-base font-normal">Institution</th>
                  <th className="p-3 text-center font-heading text-base font-normal">Students</th>
                  <th className="p-3 text-center font-heading text-base font-normal">Classes</th>
                  <th className="p-3 text-center font-heading text-base font-normal">Routes</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst, i) => (
                  <tr key={inst.id} className={`border-b border-borderColor hover:bg-accentYellow/5 ${i % 2 === 0 ? 'bg-bgSecondary' : 'bg-white'}`}>
                    <td className="p-3">
                      <p className="font-bold text-textPrimary text-sm">{inst.name}</p>
                      <p className="text-xs text-textSecondary">{inst.address}</p>
                    </td>
                    <td className="p-3 text-center font-bold text-textSecondary">{inst._count?.users ?? 0}</td>
                    <td className="p-3 text-center font-bold text-textSecondary">{inst._count?.classes ?? 0}</td>
                    <td className="p-3 text-center font-bold text-textSecondary">{inst._count?.busRoutes ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-2xl text-sidebarBg">📋 Recent Audit Log</h2>
            <a href="/admin/audit-logs" className="text-accentBlue font-bold text-sm hover:underline">View All →</a>
          </div>
          <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden max-h-[380px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-textSecondary">No audit logs yet.</div>
            ) : (
              auditLogs.map((log, i) => (
                <div key={log.id} className={`flex gap-4 p-3 border-b border-borderColor hover:bg-bgSecondary ${i % 2 === 0 ? 'bg-white' : 'bg-bgSecondary'}`}>
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accentBlue/10 flex items-center justify-center">
                    <Activity size={16} className="text-accentBlue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-textPrimary truncate">{log.action}</p>
                    <p className="text-xs text-textSecondary flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold">{log.user?.name || 'System'}</span>
                      <span className="opacity-50">·</span>
                      <span className="capitalize">{log.user?.role?.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="text-xs text-textSecondary/70 flex-shrink-0 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(log.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
