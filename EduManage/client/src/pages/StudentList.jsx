import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const Badge = ({ value, type = 'percent' }) => {
  let bgColor = 'bg-accentGreen/20';
  let textColor = 'text-sidebarBg';
  
  if (type === 'percent') {
    if (value < 50) { bgColor = 'bg-accentRed/20'; textColor = 'text-accentRed'; }
    else if (value < 75) { bgColor = 'bg-accentOrange/20'; textColor = 'text-accentOrange'; }
  }

  return (
    <span className={`px-3 py-1 rounded-badge font-bold text-sm ${bgColor} ${textColor}`}>
      {value}{type === 'percent' ? '%' : ''}
    </span>
  );
};

const StudentList = () => {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get(`/classes/${classId}/students`);
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/classes" className="text-textSecondary hover:text-textPrimary font-bold text-sm mb-2 inline-block">
            ← Back to Classes
          </Link>
          <h1 className="font-heading text-3xl text-sidebarBg">Student List</h1>
        </div>
        <button 
          className="bg-accentOrange text-white font-bold py-2 px-4 rounded-btn shadow-crayon btn-crayon"
        >
          + Add Student
        </button>
      </div>

      <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden mb-6">
        <div className="p-4 border-b border-borderColor bg-bgSecondary">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
            <input 
              type="text" 
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-borderColor rounded-input focus:outline-none focus:border-accentYellow bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-sidebarBg text-white sticky top-0 z-10">
              <tr>
                <th className="p-4 font-heading text-lg font-normal">Name</th>
                <th className="p-4 font-heading text-lg font-normal">Parent Name</th>
                <th className="p-4 font-heading text-lg font-normal">Phone</th>
                <th className="p-4 font-heading text-lg font-normal text-center">Attendance</th>
                <th className="p-4 font-heading text-lg font-normal text-center">Marks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr 
                  key={s.id} 
                  onClick={() => navigate(`/students/${s.id}`)}
                  className={`border-b border-borderColor cursor-pointer transition-colors hover:bg-accentYellow/10 ${i % 2 === 0 ? 'bg-bgSecondary' : 'bg-white'}`}
                >
                  <td className="p-4 font-bold text-textPrimary">{s.name}</td>
                  <td className="p-4 text-textSecondary">{s.parentName}</td>
                  <td className="p-4 text-textSecondary">{s.parentPhone}</td>
                  <td className="p-4 text-center"><Badge value={s.attendance_percentage} /></td>
                  <td className="p-4 text-center"><Badge value={s.marks_percentage} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-textSecondary font-bold">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
