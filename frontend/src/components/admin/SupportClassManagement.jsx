import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Sun, Search, Plus, Users, Calendar, DollarSign, Clock } from 'lucide-react';

const SupportClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    schedule: '',
    price: '',
    capacity: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/support-classes');
      setClasses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/support-classes', {
        ...form,
        price: parseFloat(form.price),
        capacity: parseInt(form.capacity)
      });
      setIsModalOpen(false);
      fetchClasses();
      setForm({ title: '', description: '', schedule: '', price: '', capacity: '' });
      alert('Class created successfully');
    } catch (err) {
      alert('Failed to create class');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sun className="text-orange-500" /> Summer & Support Classes
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage extra academic programs and summer camps</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={20} /> Create New Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">Loading classes...</div>
        ) : classes.length > 0 ? (
          classes.map(c => (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                <Sun size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h3>
              <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{c.description}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <Calendar size={16} className="text-brand-500" /> {c.schedule}
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <DollarSign size={16} className="text-emerald-500" /> ฿{c.price.toLocaleString()}
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <Users size={16} className="text-blue-500" /> {c.enrollments?.length || 0} / {c.capacity} Enrolled
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-brand-600 font-bold rounded-xl transition-colors text-sm">
                  View Enrolled Students
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200 border-dashed">
            No support classes available.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create New Class</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Class Title</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="e.g. Summer Coding Camp" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="Learn Python basics..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Schedule (Dates/Times)</label>
                <input required type="text" value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="e.g. July 1 - July 15 (Mon-Fri 9AM-12PM)" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Price (THB)</label>
                  <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input required type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="30" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">Save Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportClassManagement;
