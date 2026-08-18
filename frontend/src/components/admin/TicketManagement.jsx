import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

const TicketManagement = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/tickets');
      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/tickets/${id}/status`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (priority === 'Medium') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'Resolved' || status === 'Closed') return <CheckCircle size={16} className="text-emerald-500" />;
    if (status === 'In Progress') return <Clock size={16} className="text-amber-500" />;
    return <AlertCircle size={16} className="text-rose-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-indigo-500" /> Support Tickets
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage helpdesk and facility repair requests</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading tickets...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600 text-sm">Ticket No.</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Category</th>
                <th className="p-4 font-bold text-slate-600 text-sm w-1/3">Issue Description</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Priority</th>
                <th className="p-4 font-bold text-slate-600 text-sm">Status</th>
                <th className="p-4 font-bold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm font-bold text-indigo-600">{t.ticket_no}</td>
                  <td className="p-4 text-sm font-semibold text-slate-600">{t.category}</td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-slate-800">{t.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      {getStatusIcon(t.status)} {t.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={t.status}
                      onChange={e => updateStatus(t.id, e.target.value)}
                      className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No support tickets found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TicketManagement;
