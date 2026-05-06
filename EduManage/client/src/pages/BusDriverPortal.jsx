import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { MapPin, LogOut, Navigation, Clock, AlertCircle, Loader, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom glowing bus marker
const busIcon = L.divIcon({
  className: '',
  html: `<div style="width:44px;height:44px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 0 6px rgba(16,185,129,0.2),0 4px 16px rgba(16,185,129,0.5);border:2px solid rgba(255,255,255,0.3)">🚌</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

// Auto-pan map when position changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1.2 }); }, [center, map]);
  return null;
}

/* ── Toggle Switch ─────────────────────────────────────────── */
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative w-16 h-9 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none ${
      checked ? 'bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.5)]' : 'bg-red-500/80'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-transform duration-300 ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
);

/* ── Glow Dot ──────────────────────────────────────────────── */
const GlowDot = ({ active }) => (
  <span className="relative flex h-3 w-3 flex-shrink-0">
    {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
    <span className={`relative inline-flex rounded-full h-3 w-3 ${active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
  </span>
);

/* ── Main ──────────────────────────────────────────────────── */
const BusDriverPortal = () => {
  const { user, logout } = useContext(AuthContext);
  const routeId = user?.routeId;

  const [session,       setSession]       = useState(null);
  const [sessionLoading,setSessionLoading]= useState(true);
  const isOnDuty = !!session;

  const [students,      setStudents]      = useState([]);
  const [attendance,    setAttendance]    = useState({});
  const [submitted,     setSubmitted]     = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { location, placeName, error: locError, lastUpdated, isFetching, updateLocation } =
    useDriverLocation(isOnDuty, routeId);

  // Load active session
  useEffect(() => {
    api.get('/driver/session/active')
      .then(({ data }) => setSession(data))
      .catch(() => {})
      .finally(() => setSessionLoading(false));
  }, []);

  // Load students + today's attendance
  useEffect(() => {
    if (!routeId) return;
    api.get(`/bus-attendance/${routeId}`).then(({ data }) => {
      setStudents(data.students || []);
      const map = {};
      (data.attendance || []).forEach(a => { map[a.studentId] = a.status; });
      setAttendance(map);
      if (data.attendance?.length) setSubmitted(true);
    }).catch(() => {});
  }, [routeId]);

  const startDuty = async () => {
    try {
      const { data } = await api.post('/driver/session/start', { route_id: routeId });
      setSession({ session_id: data.session_id, route_id: routeId, started_at: data.started_at });
    } catch { alert('Failed to start duty.'); }
  };

  const endDuty = async () => {
    if (!window.confirm('End your duty for today?')) return;
    try {
      await api.post('/driver/session/end', { session_id: session.session_id });
      setSession(null);
    } catch { alert('Failed to end duty.'); }
  };

  const submitAttendance = async () => {
    setSubmitLoading(true);
    try {
      await api.post('/bus-attendance', students.map(s => ({
        student_id: s.id, date: new Date().toISOString(),
        status: attendance[s.id] || 'absent', type: 'bus',
      })));
      setSubmitted(true);
    } catch { alert('Failed to submit.'); }
    setSubmitLoading(false);
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount  = students.length - presentCount;
  const dutyTime     = session ? new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  const timeAgo      = (d) => {
    if (!d) return null;
    const s = Math.round((Date.now() - new Date(d)) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
  };

  const mapCenter = location ? [location.lat, location.lng] : [17.3850, 78.4867]; // Default: Hyderabad

  if (sessionLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at top, #0d2137 0%, #060d18 100%)' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm font-bold">Loading driver portal...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-body overflow-y-auto pb-24"
      style={{ background: 'radial-gradient(ellipse at top, #0d2137 0%, #060d18 100%)' }}>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-emerald-500/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-16 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-5">

        {/* ── Top Bar ── */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">🚌</div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">EduManage Driver</p>
              <p className="text-white font-bold text-sm leading-tight">{user?.name}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all">
            <LogOut size={15} className="text-white/60" />
          </button>
        </div>

        {/* ── Hero Duty Card ── */}
        <div className="relative rounded-3xl overflow-hidden mb-4"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.14),rgba(59,130,246,0.07))', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          <div className="p-5">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${
              isOnDuty ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-white/5 border border-white/10 text-white/40'
            }`}>
              <GlowDot active={isOnDuty} />
              {isOnDuty ? `On Duty · ${dutyTime}` : 'Off Duty'}
            </div>
            <h1 className="font-heading text-3xl text-white mb-1">
              {isOnDuty ? 'Good morning! 👋' : 'Ready to Drive?'}
            </h1>
            <p className="text-white/40 text-sm mb-5">
              {session?.route_name || 'Route A – Kukatpally'} ·{' '}
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={startDuty} disabled={isOnDuty}
                className={`py-4 rounded-2xl font-heading text-lg transition-all active:scale-95 relative overflow-hidden ${
                  isOnDuty ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/30' : 'bg-emerald-500 text-white'
                }`}
                style={!isOnDuty ? { boxShadow: '0 8px 28px rgba(16,185,129,0.4)' } : {}}>
                {!isOnDuty && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />}
                ▶ Start Duty
              </button>
              <button onClick={endDuty} disabled={!isOnDuty}
                className={`py-4 rounded-2xl font-heading text-lg transition-all active:scale-95 relative overflow-hidden ${
                  !isOnDuty ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/30' : 'bg-red-500 text-white'
                }`}
                style={isOnDuty ? { boxShadow: '0 8px 28px rgba(239,68,68,0.3)' } : {}}>
                {isOnDuty && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />}
                ■ End Duty
              </button>
            </div>
          </div>
        </div>

        {/* ── Location Card with MAP ── */}
        <div className="rounded-3xl overflow-hidden mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Map */}
          <div className="relative h-52 overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={14}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution=""
              />
              {location && (
                <>
                  <MapUpdater center={[location.lat, location.lng]} />
                  <Circle
                    center={[location.lat, location.lng]}
                    radius={location.accuracy || 50}
                    pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, weight: 2 }}
                  />
                  <Marker position={[location.lat, location.lng]} icon={busIcon}>
                    <Popup className="leaflet-popup-dark">📍 {placeName || 'Bus is here'}</Popup>
                  </Marker>
                </>
              )}
            </MapContainer>

            {/* Dark overlay gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080f1a] to-transparent pointer-events-none z-[1000]" />

            {/* Live badge */}
            {location && (
              <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-full px-3 py-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold">LIVE</span>
              </div>
            )}
          </div>

          {/* Info below map */}
          <div className="p-4">
            {locError ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 mb-4">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{locError}</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {isFetching ? 'Detecting location…' : placeName || (location ? 'Location found' : 'Not sharing yet')}
                  </p>
                  <p className="text-white/30 text-xs">
                    {location
                      ? `Updated ${timeAgo(lastUpdated)}`
                      : isOnDuty ? 'Tap below to share' : 'Start duty to auto-share'}
                  </p>
                </div>
                {isFetching && <Loader size={16} className="text-emerald-400 animate-spin flex-shrink-0" />}
                {location && !isFetching && <Wifi size={16} className="text-emerald-400 flex-shrink-0" />}
                {!location && !isFetching && <WifiOff size={16} className="text-white/20 flex-shrink-0" />}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={updateLocation} disabled={isFetching}
                className="py-3.5 rounded-2xl font-heading text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}>
                {isFetching ? <Loader size={16} className="animate-spin" /> : <Navigation size={16} />}
                {isFetching ? 'Locating…' : 'Update Now'}
              </button>
              <button onClick={() => alert('Location sent to parents! (WhatsApp stub)')}
                className="py-3.5 rounded-2xl font-heading text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                style={{ background: 'rgba(37,211,102,0.13)', border: '1px solid rgba(37,211,102,0.2)', color: '#34d399' }}>
                📱 Send to Parents
              </button>
            </div>
          </div>
        </div>

        {/* ── Attendance Card ── */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-white text-xl">Today's Attendance</span>
                  {submitted && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={11} /> Done
                    </span>
                  )}
                </div>
                <p className="text-white/30 text-xs mt-0.5">{students.length} students on this route</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 rounded-2xl py-3 text-center">
                <div className="font-heading text-2xl text-white">{students.length}</div>
                <div className="text-white/30 text-xs">Total</div>
              </div>
              <div className="rounded-2xl py-3 text-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="font-heading text-2xl text-emerald-400">{presentCount}</div>
                <div className="text-emerald-400/50 text-xs">Present</div>
              </div>
              <div className="rounded-2xl py-3 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div className="font-heading text-2xl text-red-400">{absentCount}</div>
                <div className="text-red-400/50 text-xs">Absent</div>
              </div>
            </div>

            {/* Progress bar */}
            {students.length > 0 && (
              <div className="mb-5">
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((presentCount / students.length) * 100)}%` }} />
                </div>
                <p className="text-white/25 text-xs mt-1 text-right">
                  {Math.round((presentCount / students.length) * 100)}% present
                </p>
              </div>
            )}

            {/* Students */}
            <div className="space-y-2.5 mb-5">
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🚌</p>
                  <p className="text-white/30 text-sm">No students on this route.</p>
                </div>
              ) : students.map((s, i) => {
                const isPresent = attendance[s.id] === 'present';
                const isAbsent  = attendance[s.id] === 'absent';
                return (
                  <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                    style={{
                      background: isPresent ? 'rgba(16,185,129,0.08)' : isAbsent ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.04)',
                      border: isPresent ? '1px solid rgba(16,185,129,0.2)' : isAbsent ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-heading text-base flex-shrink-0"
                      style={{
                        background: isPresent ? 'rgba(16,185,129,0.2)' : isAbsent ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                        color: isPresent ? '#34d399' : isAbsent ? '#f87171' : 'rgba(255,255,255,0.3)',
                      }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{s.name}</p>
                      <p className="text-white/30 text-xs">Stop {i + 1}</p>
                    </div>
                    <Toggle checked={isPresent} onChange={() => {
                      if (!submitted) setAttendance(p => ({ ...p, [s.id]: p[s.id] === 'present' ? 'absent' : 'present' }));
                    }} disabled={submitted} />
                  </div>
                );
              })}
            </div>

            {/* Submit button */}
            <button onClick={submitAttendance}
              disabled={submitted || submitLoading || students.length === 0}
              className="w-full py-5 rounded-2xl font-heading text-xl transition-all active:scale-95 relative overflow-hidden"
              style={
                submitted
                  ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', cursor: 'not-allowed' }
                  : students.length === 0
                    ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
                    : { background: '#f5c842', color: '#1a2d10', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }
              }>
              {!submitted && students.length > 0 && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />}
              {submitLoading ? '⏳ Submitting...' : submitted ? '✅ Attendance Submitted' : '✅ Submit Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[2000]"
        style={{ background: 'rgba(6,13,24,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-md mx-auto px-4 py-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className={`text-xs font-bold ${submitted ? 'text-emerald-400' : 'text-white/30'}`}>
              {submitted ? '✅ Submitted' : '⏳ Pending'}
            </div>
            <div className="text-white/20 text-[10px] mt-0.5">Attendance</div>
          </div>
          <div>
            <div className={`text-xs font-bold truncate ${placeName ? 'text-blue-400' : 'text-white/30'}`}>
              {placeName ? `📍 ${placeName.split(',')[0]}` : '📍 Not shared'}
            </div>
            <div className="text-white/20 text-[10px] mt-0.5">Location</div>
          </div>
          <div>
            <div className={`text-xs font-bold ${isOnDuty ? 'text-emerald-400' : 'text-white/30'}`}>
              {isOnDuty ? `▶ ${dutyTime}` : '● Off duty'}
            </div>
            <div className="text-white/20 text-[10px] mt-0.5">Duty</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDriverPortal;
