import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookOpen, Search, FileText, Calendar, Filter, AlertCircle, Plus, X, Upload } from 'lucide-react';

const TeacherHomeworkView = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    semester_id: '',
    year_id: '',
    subject_id: '',
    date_set: new Date().toISOString().split('T')[0],
    date_due: '',
    description: '',
    attachment: null
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [hwRes, yrRes, semRes] = await Promise.all([
        api.get('/admin/homework'),
        api.get('/admin/settings/years'),
        api.get('/admin/settings/semesters')
      ]);
      setHomeworks(hwRes.data || []);
      setYears(yrRes.data || []);
      setSemesters(semRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.semester_id || !formData.year_id || !formData.subject_id || !formData.date_due) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append('semester_id', formData.semester_id);
    data.append('year_id', formData.year_id);
    data.append('subject_id', formData.subject_id);
    data.append('date_set', formData.date_set);
    data.append('date_due', formData.date_due);
    data.append('description', formData.description);
    if (formData.attachment) data.append('attachment', formData.attachment);

    try {
      await api.post('/admin/homework', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      setFormData({
        semester_id: '',
        year_id: '',
        subject_id: '',
        date_set: new Date().toISOString().split('T')[0],
        date_due: '',
        description: '',
        attachment: null
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to assign homework');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this homework?")) return;
    try {
      await api.delete(`/admin/homework/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete homework');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Homework Management</h1>
          <p className="text-slate-500 mt-2">Assign homework to your classes and manage submissions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={20} /> Assign Homework
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-medium">Loading homeworks...</span>
          </div>
        ) : homeworks.length > 0 ? (
          homeworks.map(hw => (
            <div key={hw.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                    <BookOpen size={14} /> Subject ID: {hw.subject_id}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                    Class: {hw.year?.year_name || hw.year_id}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
                    <Calendar size={14} /> Due: {hw.date_due}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap">{hw.description}</p>
                
                {hw.attachment && (
                  <div className="pt-2">
                    <a href={`http://localhost:3000${hw.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition-colors">
                      <FileText size={16} /> View Attachment
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => handleDelete(hw.id)} className="text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <span className="text-slate-400 font-medium">No homework assigned yet.</span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <h3 className="text-lg font-bold text-slate-800">Assign Homework</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Semester <span className="text-red-500">*</span></label>
                  <select required value={formData.semester_id} onChange={e => setFormData({...formData, semester_id: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20">
                    <option value="">Select Semester...</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Class <span className="text-red-500">*</span></label>
                  <select required value={formData.year_id} onChange={e => setFormData({...formData, year_id: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20">
                    <option value="">Select...</option>
                    {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                  <select required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20">
                    <option value="">Select...</option>
                    <option value="1">Mathematics</option>
                    <option value="2">Science</option>
                    <option value="3">English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date Set <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.date_set} onChange={e => setFormData({...formData, date_set: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                  <input type="date" required value={formData.date_due} onChange={e => setFormData({...formData, date_due: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20" placeholder="Write homework details here..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Attachment (Optional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
                  <input type="file" onChange={e => setFormData({...formData, attachment: e.target.files[0]})} className="w-full text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Assign Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHomeworkView;
