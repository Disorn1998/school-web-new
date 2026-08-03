import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Users, FileText, CheckSquare, Bell } from 'lucide-react';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/admin/students');
        setStudents(response.data);
      } catch (error) {
        console.error('Failed to fetch students', error);
        // Fallback mock data for design purposes
        setStudents([
          { id: 1, student_id: 'S001', fullname: 'John Doe', year_id: 10, parent: { father_firstname: 'Robert' } },
          { id: 2, student_id: 'S002', fullname: 'Jane Smith', year_id: 11, parent: { father_firstname: 'Michael' } },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">ST.MARKS</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 rounded-xl font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Users size={20} /> Students
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <CheckSquare size={20} /> Attendance
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <FileText size={20} /> Invoices
          </a>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800">Overview</h1>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user?.fullname || 'Admin User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.group || 'Administrator'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 text-white flex items-center justify-center font-bold">
                {user?.fullname ? user.fullname.charAt(0) : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stat Cards */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">Total Students</h3>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Users size={20}/></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">1,248</p>
              <p className="text-sm text-emerald-600 font-medium mt-2">+12% from last month</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">Today's Attendance</h3>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><CheckSquare size={20}/></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">98.5%</p>
              <p className="text-sm text-slate-500 font-medium mt-2">1,229 present</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium">Pending Invoices</h3>
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><FileText size={20}/></div>
              </div>
              <p className="text-3xl font-bold text-slate-800">฿452,000</p>
              <p className="text-sm text-orange-600 font-medium mt-2">24 invoices pending</p>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Recent Students</h2>
              <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors">
                Add Student
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-4 font-semibold">Student ID</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Class Year</th>
                    <th className="px-6 py-4 font-semibold">Parent Name</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2"></div>
                        Loading students...
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.student_id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {student.fullname.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{student.fullname}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">Year {student.year_id}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.parent?.father_firstname || 'N/A'}</td>
                        <td className="px-6 py-4 text-right text-sm">
                          <button className="text-brand-600 hover:text-brand-800 font-medium">Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
