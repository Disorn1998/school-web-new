import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

const StudentLeaveRequest = ({ currentStudent }) => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    leave_type: 'Sick',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    if (currentStudent) {
      fetchLeaves();
    }
  }, [currentStudent]);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/student/leave/${currentStudent.id}`);
      setLeaves(res.data || []);
    } catch (error) {
      console.error('Failed to fetch leaves', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/student/leave', {
        ...formData,
        student_id: currentStudent.id
      });
      setIsModalOpen(false);
      setFormData({
        leave_type: 'Sick',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: ''
      });
      fetchLeaves();
      alert('Leave request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit leave', error);
      alert('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600"><Clock size={14} /> Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600"><CheckCircle size={14} /> Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600"><XCircle size={14} /> Rejected</span>;
      default:
        return null;
    }
  };

  if (!currentStudent) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-brand-500" /> My Leave Requests
          </h2>
          <p className="text-slate-500 text-sm mt-1">Submit and track absence requests</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
        >
          <Plus size={18} /> Request Leave
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
            Loading Requests...
          </div>
        ) : leaves.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {leaves.map(leave => (
              <div key={leave.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-800">{leave.leave_type} Leave</h3>
                    {getStatusBadge(leave.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
                    <span>{new Date(leave.start_date).toLocaleDateString()}</span>
                    {leave.start_date !== leave.end_date && (
                      <>
                        <span>to</span>
                        <span>{new Date(leave.end_date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 bg-white border border-slate-200 p-3 rounded-xl inline-block max-w-xl">
                    "{leave.reason}"
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Submitted on {new Date(leave.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Leave Requests</h3>
            <p className="text-slate-500 mt-1">You haven't submitted any leave requests yet.</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Submit Leave Request</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Leave Type</label>
                <select 
                  value={formData.leave_type} 
                  onChange={e => setFormData({...formData, leave_type: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer"
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                  <option value="Vacation">Vacation / Holiday</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                  <input 
                    type="date" required
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-text" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date" required
                    min={formData.start_date}
                    value={formData.end_date} 
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-text" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason for Leave</label>
                <textarea 
                  rows="3" required
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none resize-none" 
                  placeholder="Please provide details for the absence..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaveRequest;
