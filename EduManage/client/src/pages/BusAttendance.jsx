import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin } from 'lucide-react';

const BusAttendance = () => {
  const { user } = useContext(AuthContext);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'bus_driver') {
      // For bus driver, we fetch their assigned route directly
      fetchDriverRoute();
    } else {
      fetchRoutes();
    }
  }, [user]);

  const fetchRoutes = async () => {
    try {
      const { data } = await api.get('/buses');
      setRoutes(data);
      if (data.length > 0) setSelectedRoute(data[0].id);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchDriverRoute = async () => {
    try {
      const { data } = await api.get('/buses');
      const driverRoute = data.find(r => r.driverId === user.id);
      if (driverRoute) {
        setRoutes([driverRoute]);
        setSelectedRoute(driverRoute.id);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedRoute) {
      fetchBusAttendance();
    }
  }, [selectedRoute]);

  const fetchBusAttendance = async () => {
    try {
      const { data } = await api.get(`/bus-attendance/${selectedRoute}`);
      setStudents(data.students);
      const attMap = {};
      data.attendance.forEach(a => {
        attMap[a.studentId] = a.status;
      });
      setAttendance(attMap);
    } catch (err) { console.error(err); }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const submitAttendance = async () => {
    const payload = Object.keys(attendance).map(id => ({
      student_id: parseInt(id),
      date: new Date().toISOString(),
      status: attendance[id]
    }));
    try {
      await api.post('/bus-attendance', payload);
      alert('Attendance saved!');
    } catch (err) { console.error(err); }
  };

  const sendLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await api.post('/bus-attendance/send-location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            route_id: selectedRoute
          });
          alert('Location sent to parents!');
        } catch (err) { console.error(err); }
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  if (loading) return <div>Loading...</div>;

  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = Object.values(attendance).filter(status => status === 'absent').length;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="bg-sidebarBg p-6 rounded-card shadow-lg text-white mb-6 chalkboard-bg relative overflow-hidden">
        {user?.role === 'operator' && (
          <select 
            value={selectedRoute || ''} 
            onChange={(e) => setSelectedRoute(parseInt(e.target.value))}
            className="absolute top-6 right-6 bg-white/10 border border-white/30 text-white rounded-input px-3 py-1 outline-none"
          >
            {routes.map(r => <option key={r.id} value={r.id} className="text-black">{r.routeName}</option>)}
          </select>
        )}
        
        <h1 className="font-heading text-3xl mb-2 flex items-center gap-2">
          <MapPin size={28} className="text-accentYellow" /> 
          {routes.find(r => r.id === selectedRoute)?.routeName || 'Select Route'}
        </h1>
        <p className="font-bold opacity-80 mb-4">{new Date().toDateString()}</p>
        
        <div className="flex gap-3">
          <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm">
            {students.length} Students
          </div>
          <div className="bg-accentGreen/80 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm text-white">
            {presentCount} Present
          </div>
          <div className="bg-accentRed/80 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm text-white">
            {absentCount} Absent
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {students.map(s => {
          const isPresent = attendance[s.id] === 'present';
          const isAbsent = attendance[s.id] === 'absent';
          return (
            <div 
              key={s.id} 
              className={`bg-cardBg p-4 rounded-card border-l-8 shadow-sm flex items-center justify-between border-y border-r border-borderColor transition-all ${isPresent ? 'border-l-accentGreen' : isAbsent ? 'border-l-accentRed' : 'border-l-borderColor'}`}
            >
              <div>
                <h3 className="font-bold text-lg text-textPrimary">{s.name}</h3>
                <p className="text-textSecondary text-sm">Parent: {s.parentName}</p>
              </div>
              
              <button 
                onClick={() => toggleAttendance(s.id)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${isPresent ? 'bg-accentGreen' : isAbsent ? 'bg-accentRed' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isPresent ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-white border-t border-borderColor p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-between items-center z-40">
        <div className="font-bold text-textSecondary px-4 hidden md:block">
          {Object.keys(attendance).length} of {students.length} marked
        </div>
        <div className="flex gap-4 w-full md:w-auto px-4 md:px-0">
          <button 
            onClick={sendLocation}
            className="flex-1 md:flex-none bg-[#25D366] hover:bg-[#128c7e] text-white font-bold py-3 px-6 rounded-btn transition-colors flex items-center justify-center gap-2"
          >
            <MapPin size={20} />
            Share Location
          </button>
          <button 
            onClick={submitAttendance}
            className="flex-1 md:flex-none bg-sidebarBg hover:bg-sidebarAccent text-white font-bold py-3 px-8 rounded-btn transition-colors"
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusAttendance;
