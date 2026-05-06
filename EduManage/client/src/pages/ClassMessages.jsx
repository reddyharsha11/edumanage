import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';

const ClassMessages = () => {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get(`/classes/${classId}/students`);
      setStudents(data);
      if (data.length > 0) {
        setClassName(`${data[0].class?.name} ${data[0].class?.section}`);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const sendSingleMessage = async (studentId, parentPhone) => {
    const msg = prompt(`Enter message for ${parentPhone}:`);
    if (msg) {
      try {
        await api.post('/messages/send', {
          student_id: studentId,
          content: msg,
          language: 'English'
        });
        alert('Message sent! (Stubbed)');
      } catch (err) { console.error(err); }
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/messages/send', {
        class_id: parseInt(classId),
        content: bulkMessage,
        language: selectedLanguage
      });
      alert('Bulk message sent! (Stubbed)');
      setShowBulkModal(false);
      setBulkMessage('');
    } catch (err) { console.error(err); }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/messages" className="text-textSecondary hover:text-textPrimary font-bold text-sm mb-2 inline-block">
            ← Back to Classes
          </Link>
          <h1 className="font-heading text-3xl text-sidebarBg">Messages - {className}</h1>
        </div>
      </div>

      <div className="bg-cardBg rounded-card shadow-card border-l-8 border-l-accentBlue p-6 mb-8 flex justify-between items-center border border-borderColor">
        <div>
          <h2 className="font-heading text-2xl text-textPrimary mb-1">📢 Message All Parents in {className}</h2>
          <p className="text-textSecondary">Send announcements, holiday notices, or event reminders.</p>
        </div>
        <button 
          onClick={() => setShowBulkModal(true)}
          className="bg-accentBlue text-white font-bold py-3 px-6 rounded-btn shadow-crayon btn-crayon flex items-center gap-2"
        >
          <MessageSquare size={20} /> Compose Message ✏️
        </button>
      </div>

      <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-sidebarBg text-white">
              <tr>
                <th className="p-4 font-heading text-lg font-normal">Student</th>
                <th className="p-4 font-heading text-lg font-normal">Parent</th>
                <th className="p-4 font-heading text-lg font-normal">Phone</th>
                <th className="p-4 font-heading text-lg font-normal">Language</th>
                <th className="p-4 font-heading text-lg font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className={`border-b border-borderColor transition-colors hover:bg-accentYellow/10 ${i % 2 === 0 ? 'bg-bgSecondary' : 'bg-white'}`}>
                  <td className="p-4 font-bold text-textPrimary">{s.name}</td>
                  <td className="p-4 text-textSecondary">{s.parentName}</td>
                  <td className="p-4 text-textSecondary">{s.parentPhone}</td>
                  <td className="p-4 text-textSecondary">{s.parentLanguage}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => sendSingleMessage(s.id, s.parentPhone)}
                      className="bg-[#25D366] text-white font-bold py-1.5 px-4 rounded-btn hover:bg-[#128c7e] transition-colors text-sm flex items-center gap-2 ml-auto"
                    >
                      <Send size={16} /> Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 bg-[#2c181059] backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg rounded-card shadow-2xl w-full max-w-lg relative border border-borderColor overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accentBlue to-accentPurple"></div>
            
            <div className="p-6 pt-8">
              <h2 className="font-heading text-2xl text-sidebarBg mb-4">Bulk Message</h2>
              
              <div className="bg-bgSecondary p-4 rounded-lg border border-borderColor/50 mb-4 flex gap-3 text-textSecondary text-sm">
                <div className="text-xl">💡</div>
                <div>AI Assistant — Connect API key to enable auto-translation and tone improvement.</div>
              </div>

              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-1">Message Content</label>
                  <div className="bg-bgPrimary p-4 rounded-card border-2 border-borderColor relative overflow-hidden"
                       style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, rgba(180,160,120,0.2) 24px)', backgroundSize: '100% 24px' }}>
                    <textarea 
                      value={bulkMessage}
                      onChange={(e) => setBulkMessage(e.target.value)}
                      className="w-full bg-transparent border-none resize-none focus:outline-none font-body text-textPrimary leading-[24px] min-h-[150px]"
                      placeholder="Dear Parents..."
                      required
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-1">Primary Language</label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-2 focus:outline-none focus:border-accentBlue"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 border-2 border-borderColor text-textSecondary font-bold py-2 rounded-btn hover:bg-bgSecondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-accentBlue hover:bg-opacity-90 text-white font-bold py-2 rounded-btn btn-crayon shadow-crayon flex justify-center items-center gap-2"
                  >
                    <Send size={18} /> Send to All
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

export default ClassMessages;
