import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Search, UploadCloud, FileText, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

const TeacherLessonPlanView = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [form, setForm] = useState({
    title: '',
    subject: '',
    week_of: '',
    file_path: ''
  });

  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    feedback: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/lesson-plans');
      setPlans(res.data || []);
    } catch (error) {
      console.error('Failed to fetch lesson plans', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/lesson-plans', form);
      setIsModalOpen(false);
      fetchData();
      alert('Lesson plan submitted successfully.');
    } catch (error) {
      alert('Failed to submit lesson plan');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/lesson-plans/${selectedPlan.id}/status`, reviewForm);
      setReviewModalOpen(false);
      fetchData();
      alert('Lesson plan reviewed successfully.');
    } catch (error) {
      alert('Failed to review lesson plan');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Needs Revision') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-brand-500" /> Lesson Plans
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'teacher' ? 'Submit and track your weekly lesson plans.' : 'Review and approve lesson plans from teachers.'}
          </p>
        </div>
        {user?.role === 'teacher' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            <UploadCloud size={18} /> Submit Plan
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">Week Of</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Teacher</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Subject</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Title</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-bold text-slate-600 text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm font-semibold text-slate-700">{plan.week_of}</td>
                  <td className="p-4 text-sm font-semibold text-slate-800">{plan.teacher?.fullname || 'Unknown'}</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">{plan.subject}</td>
                  <td className="p-4 text-sm font-bold text-brand-600">
                    <div className="flex items-center gap-2">
                      <FileText size={16} /> {plan.title}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                    {plan.feedback && (
                      <p className="text-xs text-slate-500 mt-1 max-w-[150px] truncate" title={plan.feedback}>
                        <MessageSquare size={10} className="inline mr-1" />{plan.feedback}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {(user?.role === 'super' || user?.role === 'officer') && plan.status === 'Pending' ? (
                      <button 
                        onClick={() => { setSelectedPlan(plan); setReviewModalOpen(true); }}
                        className="bg-brand-50 text-brand-600 hover:bg-brand-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        Review
                      </button>
                    ) : (
                      <a href={`http://localhost:3000${plan.file_path}`} target="_blank" className="text-slate-400 hover:text-slate-600 font-semibold text-sm">View File</a>
                    )}
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No lesson plans found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Teacher Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Submit Lesson Plan</h3>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Week Of</label>
                <input type="date" required value={form.week_of} onChange={e => setForm({...form, week_of: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject / Class</label>
                <input type="text" required placeholder="e.g. Science Year 4" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Topic / Title</label>
                <input type="text" required placeholder="e.g. Solar System Overview" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">Submit Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review Modal */}
      {reviewModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Review Lesson Plan</h3>
              <p className="text-sm text-slate-500 mt-1">{selectedPlan.teacher?.fullname} - {selectedPlan.title}</p>
            </div>
            
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select value={reviewForm.status} onChange={e => setReviewForm({...reviewForm, status: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none bg-white">
                  <option value="Approved" className="text-emerald-600">Approve</option>
                  <option value="Needs Revision" className="text-rose-600">Needs Revision</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Feedback (Optional)</label>
                <textarea rows="3" placeholder="Provide actionable feedback..." value={reviewForm.feedback} onChange={e => setReviewForm({...reviewForm, feedback: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setReviewModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLessonPlanView;
