import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BookOpen, Clock, FileText, Calendar, CheckSquare } from 'lucide-react';
import api from '../utils/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [homework, setHomework] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [profileRes, homeworkRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/homework')
        ]);
        setProfile(profileRes.data);
        setHomework(homeworkRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        // Fallback mock data
        setProfile({
          fullname: 'Alex Johnson',
          student_id: 'S-2023-001',
          year_id: 10,
          parent: { father_firstname: 'Michael', mother_firstname: 'Sarah' }
        });
        setHomework([
          { id: 1, subject: { subject_name: 'Mathematics' }, description: 'Algebra Exercises Ch. 4', date_due: '2026-08-10' },
          { id: 2, subject: { subject_name: 'Science' }, description: 'Biology Lab Report', date_due: '2026-08-12' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Student Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{profile?.fullname || user?.fullname}</p>
            <p className="text-xs text-slate-500 font-medium">Year {profile?.year_id || 10}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <span className="text-brand-600 font-bold">{profile?.fullname?.charAt(0) || 'S'}</span>
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-500 to-purple-500"></div>
            
            <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden mb-4 mt-6">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex" alt="avatar" className="w-full h-full object-cover" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800">
              {isLoading ? 'Loading...' : profile?.fullname}
            </h2>
            <p className="text-brand-600 font-semibold mb-6">{profile?.student_id || 'ID Unknown'}</p>
            
            <div className="space-y-3 text-left">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-sm">Class Year</span>
                <span className="font-bold text-slate-800">Year {profile?.year_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-sm">Father Name</span>
                <span className="font-semibold text-slate-700">{profile?.parent?.father_firstname || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium text-sm">Mother Name</span>
                <span className="font-semibold text-slate-700">{profile?.parent?.mother_firstname || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Homework & Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-brand-500" /> My Homework
              </h2>
              <button className="text-sm font-semibold text-brand-600 hover:text-brand-800">View All</button>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
              </div>
            ) : homework.length > 0 ? (
              <div className="space-y-4">
                {homework.map((hw, idx) => (
                  <div key={idx} className="group p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50 hover:bg-white">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
                        {hw.subject?.subject_name || 'Subject'}
                      </span>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-600 transition-colors">
                        {hw.description}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap">
                      <Clock size={16} /> Due {new Date(hw.date_due).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <CheckSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Homework!</h3>
                <p className="text-slate-500 text-sm mt-1">You've completed all your tasks.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-purple-500" /> Upcoming Schedule
              </h2>
            </div>
            <div className="py-8 text-center text-slate-500 font-medium">
              No upcoming events scheduled.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
