import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, CheckCircle, Clock, X, Trash2, Edit2, Filter } from 'lucide-react';

const ROLE_COLORS = {
  admin: 'bg-accentPurple/20 text-accentPurple',
  operator: 'bg-accentBlue/20 text-accentBlue',
  bus_driver: 'bg-accentOrange/20 text-accentOrange',
  partial: 'bg-gray-200 text-gray-600',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const { data } = await api.get(`/admin/users${params}`);
      setUsers(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, { isApproved: true });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isApproved: true } : u));
    } catch { alert('Failed to approve'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ role: user.role, isApproved: user.isApproved, institutionId: user.institutionId });
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/admin/users/${editUser.id}`, editForm);
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
      setEditUser(null);
    } catch { alert('Failed to update'); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-sidebarBg flex items-center gap-2">
          <Users size={32} className="text-accentBlue" /> All Users
        </h1>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-textSecondary" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-bgPrimary border-2 border-borderColor rounded-input px-3 py-2 focus:border-accentBlue outline-none font-bold text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="bus_driver">Bus Driver</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-sidebarBg text-white sticky top-0">
              <tr>
                <th className="p-4 font-heading text-base font-normal">Name</th>
                <th className="p-4 font-heading text-base font-normal">Email</th>
                <th className="p-4 font-heading text-base font-normal">Role</th>
                <th className="p-4 font-heading text-base font-normal">Institution</th>
                <th className="p-4 font-heading text-base font-normal text-center">Status</th>
                <th className="p-4 font-heading text-base font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-textSecondary font-bold">Loading users...</td></tr>
              ) : users.map((u, i) => (
                <tr key={u.id} className={`border-b border-borderColor hover:bg-accentYellow/5 ${i % 2 === 0 ? 'bg-bgSecondary' : 'bg-white'}`}>
                  <td className="p-4 font-bold text-textPrimary">{u.name}</td>
                  <td className="p-4 text-textSecondary text-sm">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-badge text-xs font-bold ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500'}`}>
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-textSecondary">{u.institution?.name || '—'}</td>
                  <td className="p-4 text-center">
                    {u.isApproved ? (
                      <span className="flex items-center justify-center gap-1 text-accentGreen text-sm font-bold">
                        <CheckCircle size={14} /> Approved
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-accentYellow text-sm font-bold">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {!u.isApproved && (
                        <button onClick={() => handleApprove(u.id)} className="text-xs font-bold bg-accentGreen/20 text-accentGreen px-2.5 py-1 rounded-badge hover:bg-accentGreen hover:text-white transition-colors">
                          Approve
                        </button>
                      )}
                      <button onClick={() => openEdit(u)} className="w-8 h-8 rounded-btn bg-accentBlue/10 text-accentBlue flex items-center justify-center hover:bg-accentBlue hover:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="w-8 h-8 rounded-btn bg-accentRed/10 text-accentRed flex items-center justify-center hover:bg-accentRed hover:text-white transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-[#2c181059] backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg rounded-card shadow-2xl w-full max-w-sm border border-borderColor overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accentBlue to-accentPurple" />
            <div className="p-6 pt-8">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-heading text-xl text-sidebarBg">Edit User: {editUser.name}</h2>
                <button onClick={() => setEditUser(null)}><X size={20} className="text-textSecondary" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-1">Role</label>
                  <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentBlue outline-none">
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                    <option value="bus_driver">Bus Driver</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isApproved" checked={editForm.isApproved} onChange={e => setEditForm({...editForm, isApproved: e.target.checked})} className="w-5 h-5 accent-accentGreen" />
                  <label htmlFor="isApproved" className="font-bold text-textPrimary">Approved</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditUser(null)} className="flex-1 border-2 border-borderColor text-textSecondary font-bold py-2 rounded-btn">Cancel</button>
                  <button onClick={handleEditSave} className="flex-1 bg-accentBlue text-white font-bold py-2 rounded-btn btn-crayon shadow-crayon">Save ✓</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
