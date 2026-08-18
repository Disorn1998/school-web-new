import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HeartPulse, Search, Plus, AlertCircle, Activity, User, Calendar } from 'lucide-react';

const HealthManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    student_id: '',
    incident_type: 'Sickness',
    severity: 'Low',
    description: '',
    action_taken: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [incRes, stuRes] = await Promise.all([
        api.get('/admin/health/incidents'),
        api.get('/admin/students')
      ]);
      setIncidents(incRes.data || []);
      setStudents(stuRes.data || []);
      if (stuRes.data?.length > 0) {
        setForm(prev => ({ ...prev, student_id: stuRes.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch health data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/health/incidents', {
        ...form,
        student_id: parseInt(form.student_id)
      });
      setIsModalOpen(false);
      fetchData();
      alert('Health incident recorded successfully.');
    } catch (error) {
      console.error('Failed to save incident', error);
      alert('Failed to save incident');
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.student?.fullname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inc.incident_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="text-rose-500" /> Health Center
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage health records, sickness, and accidents.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            <Plus size={18} /> Record Incident
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text" placeholder="Search student name..."
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
                <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Student</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Type</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Severity</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Description</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Action Taken</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Reporter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map(inc => (
                <tr key={inc.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{inc.incident_date.split('T')[0]}</td>
                  <td className="p-4 font-semibold text-slate-800">{inc.student?.fullname}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${inc.incident_type === 'Accident' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {inc.incident_type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${inc.severity === 'High' ? 'bg-red-100 text-red-700' : inc.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={inc.description}>{inc.description}</td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={inc.action_taken}>{inc.action_taken}</td>
                  <td className="p-4 text-xs text-slate-500">{inc.reporter?.fullname}</td>
                </tr>
              ))}
              {filteredIncidents.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No incidents found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Activity size={20}/> Log Health Incident</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Student</label>
                <select required value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullname}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                  <select value={form.incident_type} onChange={e => setForm({...form, incident_type: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="Sickness">Sickness</option>
                    <option value="Accident">Accident</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Severity</label>
                  <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea required rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Action Taken</label>
                <textarea required rows="2" value={form.action_taken} onChange={e => setForm({...form, action_taken: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthManagement;
