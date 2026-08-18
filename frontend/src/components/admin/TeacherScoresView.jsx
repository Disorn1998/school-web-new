import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Save, AlertCircle, FileSpreadsheet, Check, Plus, Edit2, X, Users, Calendar, UploadCloud, Download } from 'lucide-react';

const TeacherScoresView = () => {
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [filterYear, setFilterYear] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ report_name: '', test_date: '', full_score: '' });

  const [activeAssessment, setActiveAssessment] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [isSavingScores, setIsSavingScores] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [yRes, sRes] = await Promise.all([
          api.get('/admin/settings/years'),
          api.get('/admin/settings/semesters')
        ]);
        setYears(yRes.data || []);
        setSemesters(sRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  const loadAssessments = async () => {
    if (!filterYear || !filterSubject || !filterSemester) {
      alert("Please select Class, Subject, and Semester first.");
      return;
    }
    setIsLoading(true);
    setActiveAssessment(null);
    try {
      const res = await api.get('/admin/scores', {
        params: {
          year_id: filterYear,
          subject_id: filterSubject,
          semester_id: semesters.find(s => s.semester_name === filterSemester)?.id || filterSemester
        }
      });
      setAssessments(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssessment = async () => {
    if (!newAssessment.report_name || !newAssessment.full_score || !newAssessment.test_date) {
      alert('Please fill all fields');
      return;
    }
    const semesterId = semesters.find(s => s.semester_name === filterSemester)?.id;
    try {
      await api.post('/admin/scores/header', {
        semester_id: parseInt(semesterId),
        subject_id: parseInt(filterSubject),
        year_id: parseInt(filterYear),
        report_name: newAssessment.report_name,
        test_date: newAssessment.test_date,
        full_score: parseFloat(newAssessment.full_score)
      });
      setShowCreateForm(false);
      setNewAssessment({ report_name: '', test_date: '', full_score: '' });
      loadAssessments();
    } catch (err) {
      console.error(err);
      alert('Failed to create assessment');
    }
  };

  const handleOpenScores = async (assessment) => {
    setActiveAssessment(assessment);
    try {
      const res = await api.get(`/admin/scores/details/${assessment.id}`);
      setStudentsData(res.data.records.map(r => ({
        student_id: r.student.id,
        first_name: r.student.fullname || r.student.first_name, // Support both naming styles
        student_code: r.student.student_id,
        score: r.detail?.score ?? '',
        comment: r.detail?.comment ?? '',
        detail_id: r.detail?.id,
        file_path: r.detail?.file_path
      })));
    } catch (err) {
      console.error(err);
      alert('Failed to load student scores');
    }
  };

  const handleScoreChange = (index, field, value) => {
    const newData = [...studentsData];
    newData[index][field] = value;
    setStudentsData(newData);
  };

  const handleSaveScores = async () => {
    setIsSavingScores(true);
    setSuccessMsg('');
    try {
      const records = studentsData.map(item => ({
        student_id: item.student_id,
        score: item.score !== '' ? parseFloat(item.score) : 0,
        comment: item.comment
      }));

      await api.post(`/admin/scores/bulk/${activeAssessment.id}`, { records });
      setSuccessMsg('Scores saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      handleOpenScores(activeAssessment); // Reload to get detail IDs for file uploads
    } catch (err) {
      console.error(err);
      alert('Failed to save scores');
    } finally {
      setIsSavingScores(false);
    }
  };

  const handleFileUpload = async (detailId, file) => {
    if (!detailId) {
      alert("Please save the score first before uploading a file.");
      return;
    }
    const formData = new FormData();
    formData.append('exam_file', file);
    try {
      const res = await api.post(`/admin/scores/upload/${detailId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      handleOpenScores(activeAssessment); // Reload
    } catch (err) {
      console.error(err);
      alert('Failed to upload file');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Academic Reports (Assessments)</h1>
        <p className="text-slate-500 mt-2">Manage continuous assessments and test scores</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <FileSpreadsheet className="text-brand-500" /> Filter Subject & Class
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Semester</label>
            <select 
              value={filterSemester} 
              onChange={e => setFilterSemester(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select...</option>
              {semesters.map(s => <option key={s.id} value={s.semester_name}>{s.semester_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Class</label>
            <select 
              value={filterYear} 
              onChange={e => setFilterYear(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select Class...</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
            <select 
              value={filterSubject} 
              onChange={e => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select Subject...</option>
              <option value="1">Mathematics</option>
              <option value="2">Science</option>
              <option value="3">English</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={loadAssessments}
              className="w-full bg-slate-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              Load Assessments
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 font-semibold border border-green-200">
          <Check size={20} /> {successMsg}
        </div>
      )}

      {/* Assessments List */}
      {!activeAssessment && assessments.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-xl">Assessments</h3>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <Plus size={16} /> New Assessment
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-200 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">Report Name (e.g. Midterm, Effort & Participation)</label>
                <input 
                  type="text" 
                  value={newAssessment.report_name}
                  onChange={e => setNewAssessment({...newAssessment, report_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                <input 
                  type="date" 
                  value={newAssessment.test_date}
                  onChange={e => setNewAssessment({...newAssessment, test_date: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Score</label>
                <input 
                  type="number" 
                  value={newAssessment.full_score}
                  onChange={e => setNewAssessment({...newAssessment, full_score: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 w-32"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateAssessment} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold">Save</button>
                <button onClick={() => setShowCreateForm(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessments.map(a => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-brand-400 transition cursor-pointer" onClick={() => handleOpenScores(a)}>
                <h4 className="font-bold text-lg text-slate-800">{a.report_name}</h4>
                <div className="mt-4 flex justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {a.test_date}</span>
                  <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Max: {a.full_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enter Scores View */}
      {activeAssessment && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <button onClick={() => setActiveAssessment(null)} className="text-sm font-bold text-brand-600 mb-1 hover:underline flex items-center gap-1">
                &larr; Back to Assessments
              </button>
              <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                <Edit2 size={20} className="text-brand-500" /> Entering Scores for: {activeAssessment.report_name}
              </h3>
              <p className="text-sm text-slate-500">Full Score is <strong>{activeAssessment.full_score}</strong></p>
            </div>
            <button 
              onClick={handleSaveScores}
              disabled={isSavingScores}
              className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
            >
              {isSavingScores ? 'Saving...' : <><Save size={18} /> Save Scores</>}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Student ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Score (Max {activeAssessment.full_score})</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 w-1/3">Comment</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Exam File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsData.map((student, index) => (
                  <tr key={student.student_id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-sm font-medium text-slate-600">{student.student_code}</td>
                    <td className="px-6 py-3 text-sm font-bold text-slate-800">{student.first_name}</td>
                    <td className="px-6 py-3">
                      <input 
                        type="number"
                        step="0.01"
                        max={activeAssessment.full_score}
                        value={student.score}
                        onChange={(e) => handleScoreChange(index, 'score', e.target.value)}
                        className={`w-32 px-3 py-1.5 bg-slate-50 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-500/20 ${parseFloat(student.score) > activeAssessment.full_score ? 'border-red-500 text-red-600' : 'border-slate-200 text-brand-700'}`}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input 
                        type="text"
                        placeholder="Add comment..."
                        value={student.comment}
                        onChange={(e) => handleScoreChange(index, 'comment', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-500/20"
                      />
                    </td>
                    <td className="px-6 py-3">
                      {student.detail_id ? (
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-brand-100 transition-colors flex items-center gap-1">
                            <UploadCloud size={16} /> Upload
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files[0]) handleFileUpload(student.detail_id, e.target.files[0]);
                              }}
                            />
                          </label>
                          {student.file_path && (
                            <a href={`http://localhost:3000${student.file_path}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brand-600">
                              <Download size={18} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Save score first</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherScoresView;
