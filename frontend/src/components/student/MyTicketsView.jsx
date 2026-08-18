import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Wrench, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MyTicketsView = ({ currentStudent }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'IT', priority: 'Medium', description: '' });

  useEffect(() => {
    fetchTickets();
  }, [currentStudent]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/student/tickets');
      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/student/tickets', form);
      setIsModalOpen(false);
      fetchTickets();
      setForm({ title: '', category: 'IT', priority: 'Medium', description: '' });
      alert('Ticket submitted successfully');
    } catch (err) {
      alert('Failed to submit ticket');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Resolved' || status === 'Closed') return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={14}/> {status}</span>;
    if (status === 'In Progress') return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Clock size={14}/> {status}</span>;
    return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={14}/> {status}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-indigo-500" /> Help & Support
          </h2>
          <p className="text-slate-500 text-sm mt-1">Submit support tickets for IT issues or facility repairs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={20} /> Open New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">Loading tickets...</div>
        ) : tickets.length > 0 ? (
          tickets.map(t => (
            <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{t.ticket_no}</span>
                {getStatusBadge(t.status)}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{t.title}</h3>
              <p className="text-sm text-slate-500 mb-4 flex-1">{t.description}</p>
              
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
                <span>Category: <span className="text-slate-700">{t.category}</span></span>
                <span>Priority: <span className="text-slate-700">{t.priority}</span></span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200 border-dashed">
            You haven't submitted any tickets yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Open New Support Ticket</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Title</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="e.g. Air conditioner in Grade 5 is broken" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none">
                    <option value="IT">IT & Systems</option>
                    <option value="Facility">Facility Repair</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="4" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none" placeholder="Please describe the issue in detail..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsView;
