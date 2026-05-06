import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, CheckCircle, BarChart3 } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label, subLabel, colorClass }) => (
  <div className={`bg-cardBg p-6 rounded-card border-l-8 ${colorClass} shadow-card flex items-center gap-4 border border-borderColor/50`}>
    <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-bgSecondary text-textPrimary`}>
      <Icon size={28} />
    </div>
    <div>
      <div className="font-heading text-3xl text-textPrimary">{value}</div>
      <div className="font-bold text-textSecondary">{label}</div>
      {subLabel && <div className="text-sm text-textSecondary/70">{subLabel}</div>}
    </div>
  </div>
);

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

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-heading text-2xl">Loading Dashboard... ✏️</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-sidebarBg">Good Morning, {user?.name}! 👋</h1>
        <p className="text-textSecondary font-bold text-lg mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          icon={Users} 
          value={data?.total_students || 0} 
          label="Total Students" 
          colorClass="border-accentBlue"
        />
        <StatCard 
          icon={CheckCircle} 
          value={data?.present_today || 0} 
          label="Present Today" 
          subLabel={`Out of ${data?.total_students || 0}`}
          colorClass="border-accentGreen"
        />
        <StatCard 
          icon={BarChart3} 
          value={`${data?.attendance_percentage || 0}%`} 
          label="Attendance Rate" 
          colorClass="border-accentYellow"
        />
      </div>

      <div className="mb-6">
        <h2 className="font-heading text-2xl text-sidebarBg inline-block relative">
          📚 Class Overview
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-accentYellow opacity-70 wavy-underline"></div>
        </h2>
      </div>

      <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden">
        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-sidebarBg text-white sticky top-0 z-10">
              <tr>
                <th className="p-4 font-heading text-lg font-normal rounded-tl-card">Class</th>
                <th className="p-4 font-heading text-lg font-normal">Section</th>
                <th className="p-4 font-heading text-lg font-normal text-center">Students</th>
                <th className="p-4 font-heading text-lg font-normal text-center">Attendance %</th>
                <th className="p-4 font-heading text-lg font-normal text-center rounded-tr-card">Avg Marks</th>
              </tr>
            </thead>
            <tbody>
              {data?.per_class?.map((c, i) => (
                <tr key={c.class_id} className={`border-b border-borderColor transition-colors hover:bg-accentYellow/5 ${i % 2 === 0 ? 'bg-bgSecondary' : 'bg-white'}`}>
                  <td className="p-4 font-bold text-textPrimary">{c.class_name}</td>
                  <td className="p-4 text-textSecondary">{c.section}</td>
                  <td className="p-4 text-center font-bold">{c.total_students}</td>
                  <td className="p-4 text-center"><Badge value={c.attendance_pct} /></td>
                  <td className="p-4 text-center"><Badge value={c.avg_marks_pct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
