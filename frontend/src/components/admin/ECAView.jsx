import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Activity, Plus, Search, Edit, Trash2, Users } from 'lucide-react';

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' }
];

const ECAView = () => {
  const [ecas, setEcas] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    day_of_week: 1,
    start_time: '15:30',
    end_time: '16:30',
    max_capacity: 30,
    fee: 0,
    teacher_id: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchEcas();
    }
  }, [selectedSemester]);

  const fetchInitialData = async () => {
    try {
      const [semRes, teachersRes] = await Promise.all([
        api.get('/admin/settings/semesters'),
        api.get('/admin/teachers')
      ]);
      setSemesters(semRes.data || []);
      setTeachers(teachersRes.data || []);
      
      const activeSem = (semRes.data || []).find(s => s.status === 'ACTIVE');
      if (activeSem) setSelectedSemester(activeSem.id.toString());
      else if (semRes.data?.length > 0) setSelectedSemester(semRes.data[0].id.toString());
    } catch (error) {
      console.error('Failed to fetch config', error);
    }
  };

  const fetchEcas = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/ecas?semester_id=${selectedSemester}`);
      setEcas(res.data || []);
    } catch (error) {
      console.error('Failed to fetch ECAs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        semester_id: parseInt(selectedSemester),
        day_of_week: parseInt(formData.day_of_week),
        max_capacity: parseInt(formData.max_capacity),
        fee: parseFloat(formData.fee),
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null
      };

      await api.post('/admin/ecas', payload);
      setIsModalOpen(false);
      fetchEcas();
    } catch (error) {
      console.error('Failed to save ECA', error);
      alert('Failed to save ECA');
    }
  };

  const filteredEcas = ecas.filter(eca => 
    eca.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (eca.teacher?.fullname || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-brand-500" /> Extracurricular Activities
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage ECAs and clubs for the semester</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <select 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
            >
              <option value="" disabled>Select Semester</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.semester_name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search ECA or Teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm"
            />
          </div>

          <button 
            onClick={() => {
              setFormData({ name: '', description: '', day_of_week: 1, start_time: '15:30', end_time: '16:30', max_capacity: 30, fee: 0, teacher_id: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            <Plus size={18} /> New ECA
          </button>
        </div>
      </div>

      {/* Grid of ECAs */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
          Loading ECAs...
        </div>
      ) : filteredEcas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEcas.map(eca => (
            <div key={eca.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 mb-2">
                    {DAYS.find(d => d.id === eca.day_of_week)?.name}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{eca.name}</h3>
                </div>
                <button className="text-slate-300 hover:text-brand-600 transition-colors p-1 opacity-0 group-hover:opacity-100">
                  <Edit size={16} />
                </button>
              </div>

              <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{eca.description}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold text-slate-500">Teacher:</span>
                  <span className="font-medium">{eca.teacher?.fullname || 'Not Assigned'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold text-slate-500">Time:</span>
                  <span className="font-medium">{eca.start_time} - {eca.end_time}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold text-slate-500">Fee:</span>
                  <span className={`font-bold ${eca.fee > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {eca.fee > 0 ? `฿${eca.fee.toLocaleString()}` : 'Free'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                  <Users size={16} /> Capacity: {eca.max_capacity}
                </div>
                <button className="text-sm font-bold text-brand-600 hover:text-brand-700">View Students</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
            <Activity size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No ECAs Found</h3>
          <p className="text-slate-500 mt-1 max-w-md">There are no Extracurricular Activities set up for this semester yet. Click "New ECA" to create one.</p>
        </div>
      )}

      {/* Create ECA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create New ECA</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ECA Name</label>
                <input 
                  type="text" required autoFocus
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  placeholder="e.g. Robotics Club"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none resize-none" 
                  placeholder="Brief description of the activity..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select 
                    value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer"
                  >
                    {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher in Charge</label>
                  <select 
                    value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer"
                  >
                    <option value="">-- Unassigned --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.fullname}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                  <input 
                    type="time" required
                    value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-text" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                  <input 
                    type="time" required
                    value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-text" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input 
                    type="number" min="1" required
                    value={formData.max_capacity} onChange={e => setFormData({...formData, max_capacity: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Extra Fee (฿)</label>
                  <input 
                    type="number" min="0" required
                    value={formData.fee} onChange={e => setFormData({...formData, fee: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">
                  Create ECA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECAView;
