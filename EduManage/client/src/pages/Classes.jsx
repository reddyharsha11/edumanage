import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Users, Trash2, Edit2 } from 'lucide-react';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', section: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', newClass);
      setShowModal(false);
      setNewClass({ name: '', section: '' });
      fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class? All students and marks will be lost.')) {
      try {
        await api.delete(`/classes/${id}`);
        fetchClasses();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const crayonColors = ['bg-accentRed', 'bg-accentOrange', 'bg-accentYellow', 'bg-accentGreen', 'bg-accentBlue', 'bg-accentPurple'];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-sidebarBg">📚 Classes</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accentYellow text-textPrimary font-bold py-2 px-4 rounded-btn shadow-crayon btn-crayon"
        >
          + Add Class ✏️
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, idx) => (
          <div key={cls.id} className="bg-cardBg rounded-card shadow-card overflow-hidden border border-borderColor flex flex-col relative">
            <div className={`h-3 w-full ${crayonColors[idx % crayonColors.length]}`}></div>
            <div className="p-6 flex-1">
              <h2 className="font-heading text-2xl text-textPrimary">{cls.name}</h2>
              <p className="text-textSecondary font-bold mt-1">Section {cls.section}</p>
              
              <div className="flex items-center text-textSecondary mt-4 bg-bgSecondary p-3 rounded-lg border border-borderColor/50">
                <Users size={18} className="mr-2 text-accentBlue" />
                <span className="font-bold">{cls._count?.students || 0} Students</span>
              </div>
            </div>
            <div className="p-4 border-t border-borderColor bg-bgSecondary flex justify-between">
              <button 
                onClick={() => navigate(`/classes/${cls.id}/students`)}
                className="border-2 border-accentGreen text-accentGreen font-bold py-1.5 px-4 rounded-btn hover:bg-accentGreen hover:text-white transition-colors"
              >
                View Students
              </button>
              <button 
                onClick={() => handleDelete(cls.id)}
                className="text-textSecondary hover:text-accentRed transition-colors p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#2c181059] backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg rounded-card shadow-2xl w-full max-w-md relative border border-borderColor overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accentRed via-accentYellow to-accentPurple"></div>
            
            <div className="p-6 pt-8">
              <h2 className="font-heading text-2xl text-sidebarBg mb-4">Add New Class</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-1">Class Name</label>
                  <input 
                    type="text" 
                    value={newClass.name}
                    onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                    className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:outline-none focus:border-accentYellow"
                    placeholder="e.g. Class 5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-1">Section</label>
                  <input 
                    type="text" 
                    value={newClass.section}
                    onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                    className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:outline-none focus:border-accentYellow"
                    placeholder="e.g. A"
                    required
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 border-2 border-borderColor text-textSecondary font-bold py-2 rounded-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-sidebarBg text-white font-bold py-2 rounded-btn btn-crayon shadow-crayon"
                  >
                    Save Class ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
