import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users } from 'lucide-react';

const Marks = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const crayonColors = ['bg-accentBlue', 'bg-accentRed', 'bg-accentGreen', 'bg-accentOrange', 'bg-accentPurple', 'bg-accentYellow'];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl text-sidebarBg flex items-center gap-2">
          <ClipboardList size={32} className="text-accentBlue" />
          Marks Entry
        </h1>
      </div>

      <div className="mb-6">
        <p className="text-textSecondary font-bold text-lg">Select a class to enter or view marks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, idx) => (
          <div 
            key={cls.id} 
            onClick={() => navigate(`/marks/${cls.id}`)}
            className="bg-cardBg rounded-card shadow-card overflow-hidden border border-borderColor flex flex-col relative cursor-pointer hover:-translate-y-1 transition-transform group"
          >
            <div className={`h-3 w-full ${crayonColors[idx % crayonColors.length]}`}></div>
            <div className="p-6 flex-1 flex flex-col justify-center items-center text-center">
              <h2 className="font-heading text-3xl text-textPrimary group-hover:text-accentBlue transition-colors">{cls.name}</h2>
              <p className="text-textSecondary font-bold mt-1 mb-4">Section {cls.section}</p>
              
              <div className="flex items-center text-textSecondary bg-bgSecondary px-4 py-2 rounded-full border border-borderColor/50">
                <Users size={18} className="mr-2 text-sidebarBg" />
                <span className="font-bold">{cls._count?.students || 0} Students</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marks;
