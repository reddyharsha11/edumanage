import { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Plus, Trash2, Edit2, X, Users, Bus, LayoutGrid } from 'lucide-react';

const AdminInstitutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', operator_name: '', operator_email: '', operator_password: '' });

  useEffect(() => { fetchInstitutions(); }, []);

  const fetchInstitutions = async () => {
    try {
      const { data } = await api.get('/admin/institutions');
      setInstitutions(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/institutions', form);
      setShowModal(false);
      setForm({ name: '', address: '', operator_name: '', operator_email: '', operator_password: '' });
      fetchInstitutions();
    } catch (e) { alert('Failed to create institution'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this institution and all its data?')) return;
    try {
      await api.delete(`/admin/institutions/${id}`);
      fetchInstitutions();
    } catch (e) { alert('Failed to delete'); }
  };

  const crayonColors = ['bg-accentPurple', 'bg-accentBlue', 'bg-accentOrange', 'bg-accentGreen', 'bg-accentRed'];

  if (loading) return <div className="text-center mt-20 font-heading text-2xl">Loading Institutions... 🏫</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-sidebarBg flex items-center gap-2">
          <Building2 size={32} className="text-accentPurple" /> Institutions
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-accentPurple text-white font-bold py-2 px-5 rounded-btn shadow-crayon btn-crayon flex items-center gap-2"
        >
          <Plus size={18} /> Add Institution
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {institutions.map((inst, idx) => (
          <div key={inst.id} className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden flex flex-col">
            <div className={`h-2 w-full ${crayonColors[idx % crayonColors.length]}`} />
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between mb-1">
                <h2 className="font-heading text-xl text-textPrimary">{inst.name}</h2>
                <Building2 size={20} className="text-textSecondary flex-shrink-0 mt-1" />
              </div>
              <p className="text-sm text-textSecondary mb-4">{inst.address || 'No address'}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-bgSecondary rounded-lg p-2 text-center border border-borderColor/50">
                  <div className="font-heading text-lg text-accentBlue">{inst._count?.users ?? 0}</div>
                  <div className="text-xs text-textSecondary">Users</div>
                </div>
                <div className="bg-bgSecondary rounded-lg p-2 text-center border border-borderColor/50">
                  <div className="font-heading text-lg text-accentGreen">{inst._count?.classes ?? 0}</div>
                  <div className="text-xs text-textSecondary">Classes</div>
                </div>
                <div className="bg-bgSecondary rounded-lg p-2 text-center border border-borderColor/50">
                  <div className="font-heading text-lg text-accentOrange">{inst._count?.busRoutes ?? 0}</div>
                  <div className="text-xs text-textSecondary">Routes</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-borderColor bg-bgSecondary flex gap-2">
              <button className="flex-1 border-2 border-accentBlue text-accentBlue font-bold py-1.5 rounded-btn hover:bg-accentBlue hover:text-white transition-colors text-sm">
                Manage
              </button>
              <button onClick={() => handleDelete(inst.id)} className="w-9 h-9 border-2 border-accentRed text-accentRed rounded-btn flex items-center justify-center hover:bg-accentRed hover:text-white transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Institution Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2c181059] backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg rounded-card shadow-2xl w-full max-w-md border border-borderColor overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accentPurple to-accentBlue" />
            <div className="p-6 pt-8">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-heading text-2xl text-sidebarBg">Add Institution</h2>
                <button onClick={() => setShowModal(false)}><X size={22} className="text-textSecondary" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-1">Institution Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentPurple outline-none" placeholder="e.g. Green Valley School" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-1">Address</label>
                  <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentPurple outline-none" placeholder="City, State" />
                </div>
                <div className="border-t border-borderColor pt-4">
                  <p className="text-sm font-bold text-textSecondary mb-3">Operator Account (optional)</p>
                  <div className="space-y-3">
                    <input type="text" value={form.operator_name} onChange={e => setForm({...form, operator_name: e.target.value})} className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentPurple outline-none" placeholder="Operator Name" />
                    <input type="email" value={form.operator_email} onChange={e => setForm({...form, operator_email: e.target.value})} className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentPurple outline-none" placeholder="operator@school.com" />
                    <input type="password" value={form.operator_password} onChange={e => setForm({...form, operator_password: e.target.value})} className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentPurple outline-none" placeholder="Password" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border-2 border-borderColor text-textSecondary font-bold py-2 rounded-btn hover:bg-bgSecondary">Cancel</button>
                  <button type="submit" className="flex-1 bg-accentPurple text-white font-bold py-2 rounded-btn btn-crayon shadow-crayon">Create ✓</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstitutions;
