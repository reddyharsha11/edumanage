import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Activity, Clock, Filter } from 'lucide-react';

const ROLE_COLORS = {
  admin: 'bg-accentPurple/20 text-accentPurple',
  operator: 'bg-accentBlue/20 text-accentBlue',
  bus_driver: 'bg-accentOrange/20 text-accentOrange',
};

const ACTION_ICONS = {
  'Updated live location': '📍',
  'Marked bus attendance': '✅',
  'Started duty session': '▶️',
  'Ended duty session': '⏹️',
  'Approved bus driver': '👍',
  'Updated user': '✏️',
  'Added student': '👤',
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = actionFilter ? `?action=${actionFilter}` : '';
      const { data } = await api.get(`/admin/audit-logs${params}`);
      setLogs(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = logs.filter(l => !actionFilter || l.action.toLowerCase().includes(actionFilter.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-sidebarBg flex items-center gap-2">
          <FileText size={32} className="text-accentBlue" /> Audit Logs
        </h1>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-textSecondary" />
          <input
            type="text"
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            placeholder="Filter by action..."
            className="bg-bgPrimary border-2 border-borderColor rounded-input px-3 py-2 focus:border-accentBlue outline-none text-sm w-48"
          />
        </div>
      </div>

      <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden">
        <div className="bg-sidebarBg text-white px-5 py-3 grid grid-cols-12 text-sm font-heading font-normal">
          <div className="col-span-1">Time</div>
          <div className="col-span-3">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-4">Action</div>
          <div className="col-span-2">Table</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-textSecondary font-bold">Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-textSecondary">No logs found.</div>
        ) : (
          filtered.map((log, i) => (
            <div
              key={log.id}
              className={`grid grid-cols-12 px-5 py-3.5 border-b border-borderColor hover:bg-accentYellow/5 items-center gap-2 ${i % 2 === 0 ? 'bg-bgSecondary' : 'bg-white'}`}
            >
              <div className="col-span-1 text-xs text-textSecondary flex items-center gap-1">
                <Clock size={12} />
                {new Date(log.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="col-span-3 font-bold text-textPrimary text-sm truncate">
                {log.user?.name || 'System'}
              </div>
              <div className="col-span-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-badge ${ROLE_COLORS[log.user?.role] || 'bg-gray-100 text-gray-500'}`}>
                  {log.user?.role?.replace('_', ' ') || '—'}
                </span>
              </div>
              <div className="col-span-4 flex items-center gap-2 text-sm text-textPrimary">
                <span>{ACTION_ICONS[log.action] || '🔧'}</span>
                <span className="truncate">{log.action}</span>
              </div>
              <div className="col-span-2 text-xs text-textSecondary italic truncate">
                {log.targetTable || '—'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
