import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setStudent(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const sendWhatsApp = async () => {
    alert("WhatsApp API ready to connect 🔌");
  };

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>Student not found</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="text-textSecondary hover:text-textPrimary font-bold text-sm mb-2 inline-block">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-4xl text-sidebarBg m-0">{student.name}</h1>
          <span className="px-4 py-1 bg-accentYellow/20 text-accentYellow font-bold rounded-full border border-accentYellow">
            {student.class?.name} {student.class?.section}
          </span>
        </div>
      </div>

      <div className="bg-cardBg p-6 rounded-card shadow-card border border-borderColor flex justify-around items-center mb-8">
        <div className="text-center">
          <div className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-1">Attendance</div>
          <div className="font-heading text-3xl text-accentGreen">{student.attendance_percentage}%</div>
        </div>
        <div className="w-px h-16 border-l-2 border-dashed border-borderColor"></div>
        <div className="text-center">
          <div className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-1">{student.current_term?.term_name}</div>
          <div className="font-heading text-3xl text-accentBlue">{student.current_term?.marks_percentage}%</div>
        </div>
        <div className="w-px h-16 border-l-2 border-dashed border-borderColor"></div>
        <div className="text-center">
          <div className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-1">{student.previous_term?.term_name}</div>
          <div className="font-heading text-3xl text-textPrimary">{student.previous_term?.marks_percentage}%</div>
        </div>
      </div>

      {student.growth_rate !== null && (
        <div className={`p-4 rounded-card mb-8 border ${student.growth_rate >= 0 ? 'bg-accentGreen/10 border-accentGreen text-sidebarBg' : 'bg-accentRed/10 border-accentRed text-accentRed'}`}>
          <div className="font-bold flex items-center gap-2">
            {student.growth_rate >= 0 ? '🌟' : '⚠️'}
            {student.growth_rate >= 0 ? `+${student.growth_rate}% improvement` : `${student.growth_rate}% needs attention`}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-heading text-2xl text-sidebarBg mb-4">Teacher Remarks</h2>
          <div className="bg-bgPrimary p-6 rounded-card border-2 border-borderColor relative overflow-hidden"
               style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(180,160,120,0.2) 32px)', backgroundSize: '100% 32px' }}>
            <textarea 
              className="w-full bg-transparent border-none resize-none focus:outline-none font-body text-textPrimary leading-[32px] min-h-[200px]"
              defaultValue={student.remarks?.[0]?.remark || ''}
              placeholder="Write a note about the student's progress..."
            ></textarea>
            <button className="bg-accentYellow text-textPrimary font-bold py-2 px-6 rounded-btn shadow-crayon btn-crayon mt-4 float-right">
              Save Remarks
            </button>
            <div className="clear-both"></div>
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl text-sidebarBg mb-4">Parent Information</h2>
          <div className="bg-cardBg p-6 rounded-card border border-borderColor shadow-sm mb-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-1">Parent Name</label>
              <input type="text" defaultValue={student.parent_info?.parent_name} className="w-full bg-bgSecondary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentYellow outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-1">Phone Number</label>
              <input type="text" defaultValue={student.parent_info?.parent_phone} className="w-full bg-bgSecondary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentYellow outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-textSecondary mb-1">Preferred Language</label>
              <select defaultValue={student.parent_info?.parent_language} className="w-full bg-bgSecondary border-2 border-borderColor rounded-input px-4 py-2 focus:border-accentYellow outline-none">
                <option>English</option><option>Hindi</option><option>Telugu</option><option>Malayalam</option>
              </select>
            </div>
            <button className="w-full bg-sidebarBg text-white font-bold py-3 rounded-btn mt-2">
              Save Changes
            </button>
          </div>

          <div className="bg-[#dcf8c6] p-6 rounded-card border border-[#25D366]/30">
            <h3 className="font-heading text-xl text-[#075e54] mb-2">WhatsApp Communication</h3>
            <p className="text-[#128c7e] text-sm mb-4 font-bold">Send updates directly to parents.</p>
            <button onClick={sendWhatsApp} className="w-full bg-[#25D366] text-white font-bold py-3 rounded-btn flex justify-center items-center gap-2 shadow-sm hover:bg-[#128c7e] transition-colors">
              Send Message via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
