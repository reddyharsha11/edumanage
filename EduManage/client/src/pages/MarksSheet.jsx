import { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { Save, Send } from 'lucide-react';

const MarksSheet = () => {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [term, setTerm] = useState('Term 1');
  const [subjects, setSubjects] = useState(['Math', 'Science', 'English']);
  const [marks, setMarks] = useState({}); // { studentId_subject: value }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [classId, term]);

  const fetchData = async () => {
    try {
      const [studentsRes, marksRes] = await Promise.all([
        api.get(`/classes/${classId}/students`),
        api.get(`/marks/${classId}?term=${term}`)
      ]);
      
      setStudents(studentsRes.data);
      
      const marksMap = {};
      marksRes.data.forEach(m => {
        marksMap[`${m.studentId}_${m.subject}`] = m.marksObtained;
        if (!subjects.includes(m.subject)) {
          setSubjects(prev => Array.from(new Set([...prev, m.subject])));
        }
      });
      setMarks(marksMap);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleMarkChange = (studentId, subject, value) => {
    setMarks(prev => ({
      ...prev,
      [`${studentId}_${subject}`]: value
    }));
  };

  const handleAddSubject = () => {
    const newSubject = prompt('Enter new subject name:');
    if (newSubject && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
    }
  };

  const handleSubmit = async () => {
    if (window.confirm('Submit these marks? This will overwrite existing records for this term.')) {
      const payload = [];
      students.forEach(s => {
        subjects.forEach(sub => {
          const val = marks[`${s.id}_${sub}`];
          if (val !== undefined && val !== '') {
            payload.push({
              student_id: s.id,
              term: term,
              subject: sub,
              marks_obtained: val,
              total_marks: 100
            });
          }
        });
      });
      
      try {
        await api.post('/marks', payload);
        alert('Marks saved successfully!');
      } catch (err) {
        console.error(err);
        alert('Error saving marks');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-full mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/marks" className="text-textSecondary hover:text-textPrimary font-bold text-sm mb-2 inline-block">
            ← Back to Classes
          </Link>
          <h1 className="font-heading text-3xl text-sidebarBg">Marks Sheet</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={term} 
            onChange={(e) => setTerm(e.target.value)}
            className="bg-accentYellow/20 border-2 border-accentYellow text-accentYellow font-bold px-4 py-2 rounded-btn focus:outline-none appearance-none"
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Final">Final Exams</option>
          </select>
        </div>
      </div>

      <div className="bg-cardBg rounded-card shadow-card border border-borderColor overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-sidebarBg text-white">
              <tr>
                <th className="p-4 font-heading text-lg font-normal sticky left-0 bg-sidebarBg z-20 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Student</th>
                {subjects.map(sub => (
                  <th key={sub} className="p-4 font-heading text-lg font-normal text-center min-w-[120px]">
                    {sub} <span className="text-sm opacity-70">/100</span>
                  </th>
                ))}
                <th 
                  className="p-4 font-heading text-lg font-normal text-center min-w-[150px] border-l-2 border-dashed border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={handleAddSubject}
                >
                  + Add Subject
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className={`border-b border-borderColor transition-colors hover:bg-accentYellow/10 ${i % 2 === 0 ? 'bg-bgSecondary' : 'bg-white'}`}>
                  <td className="p-4 font-bold text-textPrimary sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)] bg-inherit">{s.name}</td>
                  {subjects.map(sub => {
                    const val = marks[`${s.id}_${sub}`];
                    return (
                      <td key={sub} className="p-2 text-center border-l border-borderColor/30">
                        <input 
                          type="number" 
                          max="100"
                          min="0"
                          value={val !== undefined ? val : ''}
                          onChange={(e) => handleMarkChange(s.id, sub, e.target.value)}
                          className="w-20 text-center bg-bgPrimary border-2 border-borderColor/50 rounded-md py-1 focus:outline-none focus:border-accentYellow"
                        />
                      </td>
                    );
                  })}
                  <td className="p-4 border-l-2 border-dashed border-borderColor/30 bg-bgPrimary/50"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-white border-t border-borderColor p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex justify-between items-center z-40">
        <div className="font-bold text-textSecondary px-4 hidden md:block">
          Unsaved changes
        </div>
        <div className="flex gap-4 w-full md:w-auto px-4 md:px-0">
          <button 
            className="flex-1 md:flex-none border-2 border-sidebarBg text-sidebarBg font-bold py-3 px-6 rounded-btn transition-colors flex items-center justify-center gap-2 hover:bg-sidebarBg/5"
          >
            <Save size={20} />
            Save Draft
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 md:flex-none bg-sidebarBg hover:bg-sidebarAccent text-white font-bold py-3 px-8 rounded-btn transition-colors btn-crayon shadow-crayon flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Submit & Send Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarksSheet;
