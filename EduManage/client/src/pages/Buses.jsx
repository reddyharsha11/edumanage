import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Bus, Phone, MapPin, CheckCircle, Clock, Users, X,
  Navigation, UserMinus, UserPlus, RefreshCw, Layers
} from 'lucide-react';

/* ─── tiny helpers ─── */
const BUS_COLORS = ['#e84040', '#4a90d9', '#f0874a', '#9b59b6', '#5cb85c', '#f5c842'];
const STOP_EMOJIS = ['🏫', '🏙️', '🏘️', '🌳', '🏪', '⛽', '🚦', '🏢', '🌉'];

function stopLabel(idx, name) {
  const area = name.split('-').pop().trim().split(' ')[0]; // e.g. "Kukatpally"
  return `${STOP_EMOJIS[idx % STOP_EMOJIS.length]} ${area} Stop ${idx + 1}`;
}

/* ─── City Flow Route Modal ─── */
const RouteModal = ({ route, onClose, onRemoveStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const color = BUS_COLORS[route.id % BUS_COLORS.length];

  useEffect(() => {
    fetchStudents();
  }, [route.id]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/routes/${route.id}/students`);
      setStudents(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchAllStudents = async () => {
    try {
      const { data } = await api.get('/classes');
      const studs = [];
      for (const cls of data) {
        const res = await api.get(`/classes/${cls.id}/students`);
        studs.push(...res.data.map(s => ({ ...s, className: `${cls.name} ${cls.section}` })));
      }
      setAllStudents(studs.filter(s => !students.find(rs => rs.id === s.id)));
    } catch (err) { console.error(err); }
    setAddMode(true);
  };

  const handleAdd = async (studentId) => {
    try {
      await api.post(`/routes/${route.id}/students`, { student_id: studentId });
      await fetchStudents();
      setAddMode(false);
    } catch (err) { console.error(err); }
  };

  const handleRemove = async (studentId) => {
    if (!window.confirm('Remove this student from the route?')) return;
    try {
      await api.delete(`/routes/${route.id}/students/${studentId}`);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      onRemoveStudent && onRemoveStudent(studentId);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a2e]/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-2xl relative overflow-hidden max-h-[90vh] flex flex-col">

        {/* ── Header – city skyline banner ── */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`, minHeight: 160 }}>
          {/* Stars */}
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, opacity: 0.4 + Math.random() * 0.5, top: `${Math.random() * 70}%`, left: `${Math.random() * 100}%` }} />
          ))}
          {/* City buildings silhouette */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 800 80" preserveAspectRatio="none">
            <path d="M0,80 L0,40 L40,40 L40,20 L60,20 L60,30 L80,30 L80,10 L100,10 L100,30 L120,30 L120,40 L160,40 L160,25 L180,25 L180,15 L200,15 L200,25 L240,25 L240,50 L260,50 L260,30 L280,30 L280,20 L310,20 L310,30 L330,30 L330,45 L360,45 L360,25 L380,25 L380,10 L400,10 L400,25 L430,25 L430,40 L460,40 L460,20 L480,20 L480,35 L520,35 L520,15 L540,15 L540,5 L560,5 L560,15 L580,15 L580,30 L610,30 L610,40 L640,40 L640,20 L670,20 L670,35 L700,35 L700,45 L730,45 L730,30 L760,30 L760,50 L800,50 L800,80 Z"
              fill="rgba(255,255,255,0.08)" />
          </svg>
          {/* Road line at bottom */}
          <div className="absolute bottom-0 left-0 w-full h-6 bg-[#2d3748] flex items-center px-6 gap-4">
            <div className="flex-1 border-t-2 border-dashed border-[#f5c842]/60"></div>
          </div>

          {/* Bus SVG on road */}
          <div className="absolute bottom-1 left-8" style={{ color }}>
            <svg width="52" height="28" viewBox="0 0 52 28">
              <rect x="2" y="4" width="44" height="18" rx="4" fill={color} />
              <rect x="6" y="7" width="8" height="7" rx="2" fill="rgba(255,255,255,0.7)" />
              <rect x="16" y="7" width="8" height="7" rx="2" fill="rgba(255,255,255,0.7)" />
              <rect x="26" y="7" width="8" height="7" rx="2" fill="rgba(255,255,255,0.7)" />
              <circle cx="10" cy="24" r="4" fill="#1a1a2e" /><circle cx="10" cy="24" r="2" fill="#e2e8f0" />
              <circle cx="38" cy="24" r="4" fill="#1a1a2e" /><circle cx="38" cy="24" r="2" fill="#e2e8f0" />
            </svg>
          </div>

          {/* Title */}
          <div className="absolute top-5 right-6 text-right">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Route</p>
            <h2 className="font-heading text-2xl text-white leading-tight">{route.routeName}</h2>
            <p className="text-white/70 text-sm font-bold mt-1">
              Driver: {route.driver?.name || 'Unassigned'}
            </p>
          </div>

          <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <div className="flex bg-[#f8f9fc] border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 p-4 text-center border-r border-gray-100">
            <div className="font-heading text-2xl" style={{ color }}>{students.length}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Students</div>
          </div>
          <div className="flex-1 p-4 text-center border-r border-gray-100">
            <div className="font-heading text-2xl text-[#2d4a1e]">{students.length}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Stops</div>
          </div>
          <div className="flex-1 p-4 text-center">
            <div className="font-heading text-2xl text-[#f0874a]">🚌</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active</div>
          </div>
        </div>

        {/* ── Body – scroll ── */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* City Flow Timeline */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-xl text-[#1a1a2e] flex items-center gap-2">
                <Navigation size={20} style={{ color }} /> Route Flow
              </h3>
              <div className="flex gap-2">
                <button onClick={fetchStudents} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <RefreshCw size={15} className="text-gray-500" />
                </button>
                <button
                  onClick={fetchAllStudents}
                  className="flex items-center gap-1.5 text-sm font-bold py-1.5 px-3 rounded-full text-white transition-colors btn-crayon shadow-crayon"
                  style={{ backgroundColor: color }}
                >
                  <UserPlus size={15} /> Add Student
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-400 font-bold">Loading route…</div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-3">🚌</div>
                <p className="font-heading text-lg text-gray-400">No students on this route yet</p>
                <p className="text-sm text-gray-400">Click "Add Student" to assign students</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical road line */}
                <div className="absolute left-[22px] top-6 bottom-6 w-[3px] bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full z-0" />

                {/* School stop at top */}
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-11 h-11 rounded-full bg-[#2d4a1e] flex items-center justify-center shadow-md flex-shrink-0 ring-4 ring-[#2d4a1e]/20">
                    <span className="text-lg">🏫</span>
                  </div>
                  <div className="flex-1 bg-[#2d4a1e] text-white px-4 py-2 rounded-xl">
                    <p className="font-heading text-sm">Sunshine Public School</p>
                    <p className="text-xs opacity-70">Final Destination</p>
                  </div>
                </div>

                {students.map((s, idx) => (
                  <div key={s.id} className="flex items-start gap-4 mb-3 relative z-10 group">
                    {/* Stop dot */}
                    <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 border-2 border-white"
                      style={{ backgroundColor: color + '22', borderColor: color }}>
                      <span className="text-lg">{STOP_EMOJIS[(idx + 1) % STOP_EMOJIS.length]}</span>
                    </div>

                    {/* Stop card */}
                    <div className="flex-1 bg-[#fdf6e3] border border-[#e8d5b0] rounded-xl p-3 flex justify-between items-start hover:shadow-md transition-shadow">
                      <div>
                        <p className="font-bold text-[#2c1810] text-sm">{s.name}</p>
                        <p className="text-xs text-[#7a6652] mt-0.5">
                          {stopLabel(idx, route.routeName)} · {s.class?.name} {s.class?.section}
                        </p>
                        {s.parentPhone && (
                          <p className="text-xs text-[#4a90d9] mt-1 flex items-center gap-1">
                            <Phone size={11} /> {s.parentPhone}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(s.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center"
                      >
                        <UserMinus size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Start dot */}
                <div className="flex items-center gap-4 mt-2 relative z-10">
                  <div className="w-11 h-11 rounded-full bg-[#1a1a2e] flex items-center justify-center shadow-md flex-shrink-0 ring-4 ring-[#1a1a2e]/10">
                    <span className="text-lg">🚦</span>
                  </div>
                  <div className="flex-1 bg-[#1a1a2e] text-white px-4 py-2 rounded-xl">
                    <p className="font-heading text-sm">Route Start Point</p>
                    <p className="text-xs opacity-70">Bus departs from here</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Student Panel */}
          {addMode && (
            <div className="border-2 border-dashed border-[#e8d5b0] rounded-xl p-4 bg-[#fff9f0]">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-heading text-lg text-[#2c1810]">Assign a Student</h4>
                <button onClick={() => setAddMode(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              {allStudents.length === 0 ? (
                <p className="text-center text-gray-400 py-4">All students are already assigned!</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {allStudents.map(s => (
                    <div key={s.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#e8d5b0]">
                      <div>
                        <p className="font-bold text-sm text-[#2c1810]">{s.name}</p>
                        <p className="text-xs text-[#7a6652]">{s.className}</p>
                      </div>
                      <button
                        onClick={() => handleAdd(s.id)}
                        className="text-white text-sm font-bold py-1 px-3 rounded-full"
                        style={{ backgroundColor: color }}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Buses Page ─── */
const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => { fetchBuses(); }, []);

  const fetchBuses = async () => {
    try {
      const { data } = await api.get('/buses');
      setBuses(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (driverId) => {
    try {
      await api.put(`/buses/approve/${driverId}`);
      setBuses(prev => prev.map(b =>
        b.driver?.id === driverId ? { ...b, driver: { ...b.driver, isApproved: true } } : b
      ));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-bounce">🚌</div>
        <p className="font-heading text-xl text-sidebarBg">Loading routes...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading text-3xl text-sidebarBg flex items-center gap-2">
            🚌 Bus Management
          </h1>
          <p className="text-textSecondary font-bold mt-1">{buses.length} routes active</p>
        </div>
        <button className="bg-accentOrange text-white font-bold py-2 px-5 rounded-btn shadow-crayon btn-crayon flex items-center gap-2">
          <UserPlus size={18} /> Add Driver
        </button>
      </div>

      {/* City road banner */}
      <div className="rounded-card overflow-hidden mb-8 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', minHeight: 120 }}>
        {/* Stars */}
        {[...Array(25)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2, opacity: 0.3 + Math.random() * 0.5, top: `${Math.random() * 80}%`, left: `${Math.random() * 100}%` }} />
        ))}
        {/* Buildings */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,100 L0,55 L50,55 L50,30 L70,30 L70,45 L100,45 L100,20 L120,20 L120,15 L140,15 L140,20 L160,20 L160,40 L200,40 L200,25 L230,25 L230,60 L280,60 L280,35 L310,35 L310,22 L340,22 L340,35 L380,35 L380,50 L420,50 L420,28 L450,28 L450,15 L470,15 L470,28 L510,28 L510,45 L540,45 L540,30 L570,30 L570,18 L600,18 L600,30 L640,30 L640,50 L680,50 L680,32 L710,32 L710,20 L730,20 L730,32 L770,32 L770,48 L810,48 L810,28 L840,28 L840,38 L880,38 L880,55 L920,55 L920,38 L950,38 L950,22 L970,22 L970,10 L990,10 L990,22 L1020,22 L1020,38 L1060,38 L1060,52 L1090,52 L1090,35 L1120,35 L1120,50 L1160,50 L1160,65 L1200,65 L1200,100 Z"
            fill="rgba(255,255,255,0.07)" />
        </svg>
        {/* Road */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-[#2d3748] flex items-center overflow-hidden">
          <div className="flex gap-8 animate-[slide_4s_linear_infinite] whitespace-nowrap">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-12 h-1.5 bg-[#f5c842]/50 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Overlay text */}
        <div className="relative z-10 p-6 pb-14 flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <Layers size={24} className="text-[#f5c842]" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-white">City Transport Overview</h2>
            <p className="text-white/60 text-sm">Manage all bus routes, drivers & student assignments</p>
          </div>
        </div>
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {buses.map((route, idx) => {
          const isApproved = route.driver?.isApproved;
          const busColor = BUS_COLORS[idx % BUS_COLORS.length];

          return (
            <div key={route.id} className="bg-cardBg rounded-card shadow-card overflow-hidden border border-borderColor flex flex-col group hover:-translate-y-1 transition-transform">
              {/* Colored top band with mini bus icon */}
              <div className="relative h-16 flex items-end px-4 pb-2" style={{ backgroundColor: busColor + '18' }}>
                <div className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: `repeating-linear-gradient(45deg, ${busColor} 0px, ${busColor} 1px, transparent 0, transparent 50%)`, backgroundSize: '8px 8px' }} />
                <div className="absolute top-3 right-4">
                  <svg width="48" height="26" viewBox="0 0 52 28">
                    <rect x="2" y="4" width="44" height="18" rx="4" fill={busColor} />
                    <rect x="6" y="7" width="7" height="7" rx="2" fill="rgba(255,255,255,0.75)" />
                    <rect x="15" y="7" width="7" height="7" rx="2" fill="rgba(255,255,255,0.75)" />
                    <rect x="24" y="7" width="7" height="7" rx="2" fill="rgba(255,255,255,0.75)" />
                    <circle cx="10" cy="23" r="3.5" fill="#333" /><circle cx="10" cy="23" r="1.5" fill="#e2e8f0" />
                    <circle cx="38" cy="23" r="3.5" fill="#333" /><circle cx="38" cy="23" r="1.5" fill="#e2e8f0" />
                  </svg>
                </div>
                {/* Status pill */}
                <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-badge relative z-10 ${isApproved ? 'bg-accentGreen/20 text-accentGreen' : 'bg-accentYellow/30 text-[#a07a00]'}`}>
                  {isApproved ? <CheckCircle size={13} className="mr-1" /> : <Clock size={13} className="mr-1" />}
                  {isApproved ? 'Active' : 'Pending'}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 flex-1">
                <h2 className="font-heading text-xl text-textPrimary mb-1">{route.driver?.name || 'Unassigned'}</h2>

                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-sm text-textSecondary bg-bgSecondary px-3 py-2 rounded-lg border border-borderColor/50">
                    <MapPin size={15} style={{ color: busColor }} />
                    <span className="font-bold truncate">{route.routeName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-textSecondary bg-bgSecondary px-3 py-2 rounded-lg border border-borderColor/50">
                    <Phone size={15} className="text-accentGreen" />
                    <span className="font-bold">{route.driver?.email || 'No contact'}</span>
                  </div>
                </div>

                {/* Mini stop dots preview */}
                <div className="mt-4 flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#2d4a1e] ring-2 ring-[#2d4a1e]/20" title="School" />
                  <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: busColor + '60' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: busColor }} />
                  <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: busColor + '60' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: busColor + 'aa' }} />
                  <div className="flex-1 border-t-2 border-dashed" style={{ borderColor: busColor + '60' }} />
                  <div className="w-3 h-3 rounded-full bg-[#1a1a2e]" title="Start" />
                  <span className="text-xs text-textSecondary font-bold ml-1">Route</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-borderColor bg-bgSecondary flex gap-2">
                {!isApproved && (
                  <button
                    onClick={() => handleApprove(route.driver?.id)}
                    className="flex-1 bg-accentGreen text-white font-bold py-2 px-3 rounded-btn text-sm btn-crayon shadow-crayon"
                  >
                    Approve ✓
                  </button>
                )}
                <button
                  onClick={() => setSelectedRoute(route)}
                  className="flex-1 font-bold py-2 px-3 rounded-btn text-sm border-2 transition-colors"
                  style={{ borderColor: busColor, color: busColor }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = busColor; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = busColor; }}
                >
                  View Route →
                </button>
                {isApproved && (
                  <button className="flex-1 border-2 border-accentRed text-accentRed font-bold py-2 px-3 rounded-btn hover:bg-accentRed hover:text-white transition-colors text-sm">
                    Revoke
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Route Detail Modal */}
      {selectedRoute && (
        <RouteModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}

      {/* Animated road CSS */}
      <style>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Buses;
