import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, CalendarDays, Clock, MapPin, UserCheck, AlertCircle } from 'lucide-react';

const AdminDutyManagement = () => {
  const [data, setData] = useState({
    teachers: [],
    days: [],
    time_slots: [],
    areas: [],
    assignments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    teacher_id: '',
    day_id: '',
    time_slot_id: '',
    area_id: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/duties');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch duty data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.teacher_id || !formData.day_id || !formData.time_slot_id || !formData.area_id) {
      setError('Please select all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/admin/duties', {
        teacher_id: parseInt(formData.teacher_id),
        day_id: parseInt(formData.day_id),
        time_slot_id: parseInt(formData.time_slot_id),
        area_id: parseInt(formData.area_id)
      });
      setSuccess('Duty assigned successfully.');
      setFormData({
        teacher_id: '',
        day_id: '',
        time_slot_id: '',
        area_id: ''
      });
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      setError('Failed to assign duty.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this duty assignment?")) return;
    try {
      await api.delete(`/admin/duties/${id}`);
      setSuccess('Duty assignment removed.');
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      setError('Failed to remove duty assignment.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading duty roster...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Duty Roster Management</h1>
        <p className="text-slate-500 mt-2">Assign and manage daily duties for teachers.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 font-semibold border border-red-100">
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 font-semibold border border-emerald-100">
          <UserCheck size={20} /> {success}
        </div>
      )}

      {/* Assign Duty Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Plus className="text-brand-500" /> Assign New Duty
        </h2>
        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Teacher</label>
            <select 
              value={formData.teacher_id} 
              onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 font-medium"
            >
              <option value="">Select Teacher...</option>
              {data.teachers.map(t => (
                <option key={t.id} value={t.id}>{t.fullname}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Day</label>
            <select 
              value={formData.day_id} 
              onChange={(e) => setFormData({...formData, day_id: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 font-medium"
            >
              <option value="">Select Day...</option>
              {data.days.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Time Slot</label>
            <select 
              value={formData.time_slot_id} 
              onChange={(e) => setFormData({...formData, time_slot_id: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 font-medium"
            >
              <option value="">Select Time...</option>
              {data.time_slots.map(ts => (
                <option key={ts.id} value={ts.id}>{ts.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Area</label>
            <div className="flex gap-3">
              <select 
                value={formData.area_id} 
                onChange={(e) => setFormData({...formData, area_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value="">Select Area...</option>
                {data.areas.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20 disabled:opacity-50 flex-shrink-0"
              >
                {isSubmitting ? '...' : 'Assign'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Current Assignments */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Current Assignments</h2>
          <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
            {data.assignments.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Teacher</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Day</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Time</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Area</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.assignments.map(assignment => (
                <tr key={assignment.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-4 text-sm font-bold text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                        {assignment.teacher?.fullname?.charAt(0) || 'T'}
                      </div>
                      {assignment.teacher?.fullname}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                      <CalendarDays size={14} /> {assignment.day?.name}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                      <Clock size={16} className="text-slate-400" /> {assignment.time_slot?.name}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                      <MapPin size={16} className="text-slate-400" /> {assignment.area?.name}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(assignment.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove Assignment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {data.assignments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium">
                    No duties assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDutyManagement;
