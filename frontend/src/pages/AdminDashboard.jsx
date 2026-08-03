import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { getClassName } from '../utils/constants';
import AdminSidebar from '../components/AdminSidebar';
import StudentsView from '../components/admin/StudentsView';
import ParentsView from '../components/admin/ParentsView';
import AttendanceView from '../components/admin/AttendanceView';
import TeachersView from '../components/admin/TeachersView';
import StaffView from '../components/admin/StaffView';
import { Users, FileText, CheckSquare, Bell, Search, Wrench } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState({
    total_students: 0,
    attendance_rate: 0,
    students_present: 0,
    pending_invoices: 0,
    pending_count: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, statsRes] = await Promise.all([
          api.get('/admin/students'),
          api.get('/admin/dashboard/stats')
        ]);
        setStudents(studentsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        setStudents([
          { id: 1, student_id: 'S001', fullname: 'John Doe', year_id: 10, parent: { father_firstname: 'Robert' } },
          { id: 2, student_id: 'S002', fullname: 'Jane Smith', year_id: 11, parent: { father_firstname: 'Michael' } },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-semibold">Total Students</h3>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Users size={24}/></div>
              </div>
              <p className="text-4xl font-bold text-slate-800">{stats.total_students.toLocaleString()}</p>
              <p className="text-sm text-emerald-600 font-semibold mt-3 bg-emerald-50 w-fit px-3 py-1 rounded-full">Active accounts</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-semibold">Today's Attendance</h3>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><CheckSquare size={24}/></div>
              </div>
              <p className="text-4xl font-bold text-slate-800">{stats.attendance_rate.toFixed(1)}%</p>
              <p className="text-sm text-emerald-600 font-semibold mt-3 bg-emerald-50 w-fit px-3 py-1 rounded-full">{stats.students_present} present today</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-semibold">Pending Invoices</h3>
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><FileText size={24}/></div>
              </div>
              <p className="text-4xl font-bold text-slate-800">฿{stats.pending_invoices.toLocaleString()}</p>
              <p className="text-sm text-orange-600 font-semibold mt-3 bg-orange-50 w-fit px-3 py-1 rounded-full">{stats.pending_count} invoices pending</p>
            </div>
          </div>

          {/* Recent Students Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">Recent Students</h2>
              <button 
                onClick={() => setActiveTab('students')}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white">
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">ID</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Student Name</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Year</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-medium">
                        <div className="flex justify-center items-center gap-3">
                           <div className="w-5 h-5 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin"></div>
                           Loading students...
                        </div>
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-slate-700">{student.student_id}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-100 to-purple-100 flex items-center justify-center text-brand-700 font-bold shadow-sm overflow-hidden">
                              {student.profile_image && student.profile_image !== 'default.png' ? (
                                <img src={`http://localhost:3000${student.profile_image}`} alt={student.fullname} className="w-full h-full object-cover" />
                              ) : (
                                student.fullname ? student.fullname.charAt(0) : 'S'
                              )}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{student.fullname}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-500">{getClassName(student.year_id)}</td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-500">{student.parent?.father_firstname || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-medium">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'students') {
      return <StudentsView />;
    }

    if (activeTab === 'parents') {
      return <ParentsView />;
    }

    if (activeTab === 'attendance') {
      return <AttendanceView />;
    }

    if (activeTab === 'teachers') {
      return <TeachersView />;
    }

    if (activeTab === 'staff') {
      return <StaffView />;
    }

    // Placeholder view for all other tabs
    return (
      <div className="max-w-4xl mx-auto h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
          <Wrench className="w-12 h-12 text-brand-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3 capitalize">{activeTab.replace('-', ' ')} Module</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          This module is currently being connected to the new system architecture. 
          The interface for {activeTab} will be available in the upcoming release.
        </p>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Dynamic Sidebar Component */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-400" />
             </div>
             <input type="text" placeholder="Search students, invoices..." className="bg-transparent border-none focus:outline-none text-sm w-64 text-slate-700 placeholder-slate-400 font-medium" />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all">
                {user?.fullname ? user.fullname.charAt(0) : 'A'}
              </div>
              <div className="hidden md:block text-sm">
                <p className="text-slate-700 font-bold">{user?.fullname || 'Admin User'}</p>
                <p className="text-slate-400 font-medium capitalize">{user?.group || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
