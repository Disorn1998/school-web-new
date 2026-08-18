import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, CheckCircle, XCircle, Search, Clock, FileText } from 'lucide-react';

const LeaveApprovalView = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const query = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
      const res = await api.get(`/admin/leave${query}`);
      setLeaves(res.data || []);
    } catch (error) {
      console.error('Failed to fetch leave requests', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) return;

    try {
      await api.put(`/admin/leave/${id}`, { status: newStatus });
      fetchLeaves();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update leave status');
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

  const filteredLeaves = leaves.filter(leave => 
    (leave.student?.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (leave.reason || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-brand-500" /> Student Leave Requests
          </h2>
          <p className="text-slate-500 text-sm mt-1">Review and approve student absence requests</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filterStatus === status ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative w-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search Student or Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none focus:outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
            Loading Requests...
          </div>
        ) : filteredLeaves.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredLeaves.map(leave => (
              <div key={leave.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-brand-600 font-bold flex items-center justify-center text-lg flex-shrink-0 mt-1">
                    {leave.student?.fullname?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-800">{leave.student?.fullname || 'Unknown Student'}</h3>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">ID: {leave.student?.student_id}</span>
                      {getStatusBadge(leave.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-2">
                      <Calendar size={14} />
                      <span>{new Date(leave.start_date).toLocaleDateString()}</span>
                      {leave.start_date !== leave.end_date && (
                        <>
                          <span>to</span>
                          <span>{new Date(leave.end_date).toLocaleDateString()}</span>
                        </>
                      )}
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="font-semibold text-brand-600">{leave.leave_type}</span>
                    </div>
                    <p className="text-sm text-slate-600 bg-white border border-slate-200 p-3 rounded-xl mt-2 inline-block max-w-2xl">
                      "{leave.reason}"
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Submitted on {new Date(leave.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {leave.status === 'PENDING' && (
                  <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
                      className="flex-1 md:flex-none px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-100"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Leave Requests Found</h3>
            <p className="text-slate-500 mt-1">There are no leave requests matching your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalView;
