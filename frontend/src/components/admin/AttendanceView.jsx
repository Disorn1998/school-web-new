import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, Clock, Calendar, CheckSquare, XCircle, AlertTriangle, UserCheck, Printer, BarChart2, X, PieChart } from 'lucide-react';
import MonthlyAttendanceReport from './MonthlyAttendanceReport';
import YearlyAttendanceReport from './YearlyAttendanceReport';

const AttendanceView = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState('daily');
  
  // Date State
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [bulkState, setBulkState] = useState({});
  
  // Form State
  const [formData, setFormData] = useState({
    check_in: '08:00:00',
    status: 'ontime'
  });

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/attendance/daily?date=${selectedDate}`);
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  useEffect(() => {
    const initialState = {};
    attendanceData.forEach(item => {
      initialState[item.student.id] = item.attendance?.status || '';
    });
    setBulkState(initialState);
  }, [attendanceData]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredData = attendanceData.filter(item => {
    const studentName = item.student?.fullname || '';
    const studentId = item.student?.student_id || '';
    
    const matchesSearch = studentName.toLowerCase().includes(searchQuery) ||
                          studentId.toLowerCase().includes(searchQuery);
                          
    const matchesYear = selectedYear === '' || (item.student?.year_id?.toString() === selectedYear);
    return matchesSearch && matchesYear;
  });

  // Statistics calculation
  const totalStudents = attendanceData.length;
  const presentCount = attendanceData.filter(item => item.attendance && item.attendance.status !== 'absent').length;
  const onTimeCount = attendanceData.filter(item => item.attendance?.status === 'ontime').length;
  const lateCount = attendanceData.filter(item => item.attendance?.status === 'late').length;
  const absentCount = totalStudents - presentCount;

  const getStatusBadge = (attendance) => {
    if (!attendance) {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600"><XCircle size={14}/> Absent</span>;
    }
    if (attendance.status === 'late') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600"><AlertTriangle size={14}/> Late ({attendance.late_minutes}m)</span>;
    }
    if (attendance.status === 'ontime') {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600"><CheckSquare size={14}/> On Time</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{attendance.status}</span>;
  };

  const openManualEntry = (student, existingAttendance) => {
    setCurrentStudent(student);
    if (existingAttendance) {
      setFormData({
        check_in: existingAttendance.check_in,
        status: existingAttendance.status
      });
    } else {
      setFormData({
        check_in: new Date().toTimeString().split(' ')[0],
        status: 'ontime'
      });
    }
    setIsModalOpen(true);
  };

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [studentHistory, setStudentHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const openHistoryModal = async (student) => {
    setCurrentStudent(student);
    setIsHistoryModalOpen(true);
    setIsHistoryLoading(true);
    try {
      const response = await api.get(`/admin/attendance/student/${student.id}`);
      setStudentHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch student history', error);
      setStudentHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        user_id: currentStudent.id,
        work_date: selectedDate,
        check_in: formData.check_in,
        status: formData.status
      };
      await api.post('/admin/attendance/manual', payload);
      setIsModalOpen(false);
      fetchAttendance(); // Refresh table
    } catch (error) {
      console.error('Failed to save manual attendance', error);
      alert('Failed to save attendance record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSave = async () => {
    setIsSubmitting(true);
    try {
      const records = Object.entries(bulkState).map(([userId, status]) => ({
        user_id: parseInt(userId),
        status: status
      })).filter(r => r.status !== '');

      await api.post('/admin/attendance/bulk', {
        work_date: selectedDate,
        records: records
      });
      alert('Class attendance saved successfully!');
      fetchAttendance();
    } catch (error) {
      console.error('Failed to save bulk attendance', error);
      alert('Failed to save class attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor student arrivals and generate reports</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'daily' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock size={16} /> Daily Entry
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'monthly' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 size={16} /> Monthly Report
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'yearly' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PieChart size={16} /> Yearly Report
          </button>
        </div>
      </div>

      {activeTab === 'monthly' ? (
        <MonthlyAttendanceReport />
      ) : activeTab === 'yearly' ? (
        <YearlyAttendanceReport />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div></div>
            <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all print:hidden"
          >
            <Printer size={18} /> Print Report
          </button>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 print:hidden">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-brand-500" />
              </div>
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-44 pl-10 pr-3 py-2 border-none rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50 transition-all cursor-pointer"
              />
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-36 py-2 pl-3 pr-8 border-none rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50 transition-all cursor-pointer"
            >
              <option value="">All Classes</option>
              {[...Array(15)].map((_, i) => (
                <option key={i+1} value={i+1}>Year {i+1}</option>
              ))}
            </select>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="relative w-56">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name..."
              className="block w-full pl-10 pr-3 py-2 border-none rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50 transition-all"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><CheckSquare size={24}/></div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">Total Present</p>
            <p className="text-2xl font-bold text-slate-800">{presentCount} <span className="text-sm font-semibold text-slate-400">/ {totalStudents}</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><UserCheck size={24}/></div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">On Time</p>
            <p className="text-2xl font-bold text-slate-800">{onTimeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0"><AlertTriangle size={24}/></div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">Late Arrivals</p>
            <p className="text-2xl font-bold text-slate-800">{lateCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0"><XCircle size={24}/></div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">Absent</p>
            <p className="text-2xl font-bold text-slate-800">{absentCount}</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 print:hidden text-center">Bulk Update Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right print:hidden">Actions</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Check-in Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading attendance data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => openHistoryModal(item.student)}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-100 to-purple-100 flex items-center justify-center text-brand-700 font-bold shadow-sm text-xs hover:shadow-md transition-all">
                          {item.student.fullname ? item.student.fullname.charAt(0) : 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-700 hover:text-brand-800 transition-colors">{item.student.fullname}</p>
                          <p className="text-xs font-medium text-slate-400">{item.student.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">Year {item.student.year_id}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.attendance)}
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      <select
                        value={bulkState[item.student.id] || ''}
                        onChange={(e) => setBulkState({...bulkState, [item.student.id]: e.target.value})}
                        className={`block w-full py-1.5 pl-3 pr-8 text-xs font-bold rounded-lg border-0 ring-1 ring-inset focus:ring-2 focus:ring-inset transition-colors cursor-pointer ${
                          bulkState[item.student.id] === 'absent' ? 'bg-red-50 text-red-700 ring-red-200 focus:ring-red-500' :
                          bulkState[item.student.id] === 'late' ? 'bg-orange-50 text-orange-700 ring-orange-200 focus:ring-orange-500' :
                          bulkState[item.student.id] === 'ontime' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 focus:ring-emerald-500' :
                          'bg-slate-50 text-slate-500 ring-slate-200 focus:ring-slate-500'
                        }`}
                      >
                        <option value="" disabled>Not Set</option>
                        <option value="ontime">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openHistoryModal(item.student)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          History
                        </button>
                        <button 
                          onClick={() => openManualEntry(item.student, item.attendance)}
                          className="px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                        >
                          {item.attendance ? 'Edit Entry' : 'Manual Check-in'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {item.attendance ? (
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-slate-400" /> {item.attendance.check_in}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No records found for this date.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end print:hidden">
            <button
              onClick={handleBulkSave}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-sm rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
              ) : (
                <><CheckSquare size={18} /> Save Class Attendance</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Attendance History</h3>
                <p className="text-sm text-brand-600 font-semibold">{currentStudent?.fullname} ({currentStudent?.student_id})</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Loading history...</span>
                </div>
              ) : studentHistory.length > 0 ? (
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Date</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Check-in Time</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 text-sm font-bold text-slate-700">{record.work_date}</td>
                          <td className="px-5 py-3 text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" /> {record.check_in}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {getStatusBadge(record)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Calendar size={48} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-sm font-semibold">No attendance records found.</p>
                  <p className="text-xs mt-1">This student hasn't checked in yet.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end sticky bottom-0">
              <button onClick={() => setIsHistoryModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Check-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Manual Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-brand-50 rounded-xl mb-4">
                <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-1">Student</p>
                <p className="text-sm font-bold text-brand-900">{currentStudent?.fullname}</p>
                <p className="text-xs text-brand-700/70">{currentStudent?.student_id}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Check-in Time (HH:MM:SS)</label>
                <input 
                  type="text" required
                  value={formData.check_in} onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
                  placeholder="08:00:00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status Overide</label>
                <select 
                  value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-medium"
                >
                  <option value="ontime" className="text-emerald-600">On Time</option>
                  <option value="late" className="text-orange-600">Late</option>
                  <option value="absent" className="text-red-600">Absent (Excused)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}

    </div>
  );
};

export default AttendanceView;
