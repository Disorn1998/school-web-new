import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { UserPlus, CheckCircle, XCircle, Clock, Search, ChevronRight, GraduationCap } from 'lucide-react';

const AdmissionsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/admissions');
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/admissions/${id}/status`, { status });
      fetchAdmissions();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleConvertToStudent = async (id) => {
    if(!window.confirm("This will automatically create a Student Profile and a Parent Account. Proceed?")) return;
    try {
      const res = await api.post(`/admin/admissions/${id}/convert`);
      alert(`Success! Created Student ID: ${res.data.student.student_id}`);
      fetchAdmissions();
    } catch (err) {
      alert('Failed to convert to student');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={14}/> Pending</span>;
      case 'Interview': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Search size={14}/> Interview</span>;
      case 'Accepted': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={14}/> Accepted</span>;
      case 'Rejected': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={14}/> Rejected</span>;
      case 'Registered': return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><GraduationCap size={14}/> Registered</span>;
      default: return null;
    }
  };

  const filtered = applications.filter(a => 
    a.student_first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.application_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="text-indigo-600" /> Admissions & Applications
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage incoming student applications and enrollments.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search applications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">App No.</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Grade</th>
                <th className="p-4 font-semibold">Parent Contact</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading applications...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No applications found.</td></tr>
              ) : filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-indigo-600">{app.application_no}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{app.student_first_name} {app.student_last_name}</div>
                    <div className="text-xs text-slate-500">DOB: {app.date_of_birth}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{app.grade_applying}</td>
                  <td className="p-4">
                    <div className="text-slate-800">{app.parent_name}</div>
                    <div className="text-xs text-slate-500">{app.parent_phone}</div>
                  </td>
                  <td className="p-4">{getStatusBadge(app.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {app.status === 'Pending' && (
                        <button onClick={() => handleUpdateStatus(app.id, 'Interview')} className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">Call Interview</button>
                      )}
                      {app.status === 'Interview' && (
                        <>
                          <button onClick={() => handleUpdateStatus(app.id, 'Accepted')} className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">Accept</button>
                          <button onClick={() => handleUpdateStatus(app.id, 'Rejected')} className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">Reject</button>
                        </>
                      )}
                      {app.status === 'Accepted' && (
                        <button onClick={() => handleConvertToStudent(app.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1">
                          Convert to Student <ChevronRight size={14}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsManagement;
