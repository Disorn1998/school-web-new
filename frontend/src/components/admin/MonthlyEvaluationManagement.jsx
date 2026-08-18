import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Award, Search, Plus, FileText } from 'lucide-react';

const MonthlyEvaluationManagement = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [form, setForm] = useState({
    student_id: '',
    month_year: currentMonth,
    academic_score: 'Good',
    behavior_score: 'Good',
    social_score: 'Good',
    teacher_comment: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [evalRes, stuRes] = await Promise.all([
        api.get('/admin/evaluation'),
        api.get('/admin/students')
      ]);
      setEvaluations(evalRes.data || []);
      setStudents(stuRes.data || []);
      if (stuRes.data?.length > 0) {
        setForm(prev => ({ ...prev, student_id: stuRes.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch evaluation data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/evaluation', {
        ...form,
        student_id: parseInt(form.student_id)
      });
      setIsModalOpen(false);
      fetchData();
      alert('Evaluation saved successfully.');
    } catch (error) {
      console.error('Failed to save evaluation', error);
      alert('Failed to save evaluation');
    }
  };

  const filteredEvals = evaluations.filter(ev => 
    ev.student?.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ev.month_year.includes(searchQuery)
  );

  const getScoreColor = (score) => {
    if (score === 'Excellent') return 'text-emerald-600 bg-emerald-50';
    if (score === 'Good') return 'text-blue-600 bg-blue-50';
    return 'text-amber-600 bg-amber-50';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-brand-500" /> Monthly Evaluation
          </h2>
          <p className="text-slate-500 text-sm mt-1">Assess and track student progress every month.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={18} /> New Evaluation
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text" placeholder="Search student or YYYY-MM..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">Month</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Student</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Academic</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Behavior</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Social</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Teacher Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvals.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700">{ev.month_year}</td>
                  <td className="p-4 font-semibold text-slate-800">{ev.student?.fullname}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${getScoreColor(ev.academic_score)}`}>{ev.academic_score}</span></td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${getScoreColor(ev.behavior_score)}`}>{ev.behavior_score}</span></td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${getScoreColor(ev.social_score)}`}>{ev.social_score}</span></td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={ev.teacher_comment}>{ev.teacher_comment}</td>
                </tr>
              ))}
              {filteredEvals.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No evaluations found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Award size={20} className="text-brand-600" />
              <h3 className="text-lg font-bold text-slate-800">Add Monthly Evaluation</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Student</label>
                  <select required value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    {students.map(s => <option key={s.id} value={s.id}>{s.fullname}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Month (YYYY-MM)</label>
                  <input type="month" required value={form.month_year} onChange={e => setForm({...form, month_year: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Academic</label>
                  <select value={form.academic_score} onChange={e => setForm({...form, academic_score: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Behavior</label>
                  <select value={form.behavior_score} onChange={e => setForm({...form, behavior_score: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Social</label>
                  <select value={form.social_score} onChange={e => setForm({...form, social_score: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher Comment</label>
                <textarea required rows="3" placeholder="Write feedback here..." value={form.teacher_comment} onChange={e => setForm({...form, teacher_comment: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">Save Evaluation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyEvaluationManagement;
