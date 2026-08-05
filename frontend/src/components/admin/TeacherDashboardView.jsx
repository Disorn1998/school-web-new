import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { ClipboardList, CalendarDays, BookOpen, UserCheck, Activity, Star } from 'lucide-react';

const TeacherDashboardView = () => {
  const { user } = useAuth();
  const [dutyData, setDutyData] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/teacher/dashboard');
        setDutyData(res.data.my_duty || {});
        setLeaves(res.data.leave_today || []);
      } catch (error) {
        console.error("Failed to fetch teacher dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Greeting Box */}
      <div className="inline-flex items-center gap-3 mb-6 px-5 py-3 border border-brand-200 rounded-2xl bg-white shadow-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-slate-500 font-semibold text-sm">Welcome back,</span>
        <span className="text-slate-800 font-bold text-lg">{user?.fullname}</span>
      </div>

      {/* My Duty Ribbon */}
      <div className="bg-white border-2 border-brand-500 rounded-full py-3 px-6 shadow-[0_4px_12px_rgba(59,130,246,0.08)] flex items-center gap-4 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-2 font-bold text-brand-600 flex-shrink-0">
          <ClipboardList size={18} /> My Duty:
        </div>
        
        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="text-slate-400 text-sm font-medium">Loading duties...</span>
          ) : Object.keys(dutyData).length > 0 ? (
            Object.entries(dutyData).map(([day, slots]) => (
              <div key={day} className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:bg-brand-50 transition-colors flex-shrink-0">
                <span className="text-brand-600 flex items-center gap-1.5"><CalendarDays size={14}/> {day}:</span>
                <span>
                  {slots.map((s, idx) => (
                    <span key={idx}>
                      <strong>{s.time_slot}</strong> : {s.area}
                      {idx < slots.length - 1 && <span className="text-slate-300 mx-2">|</span>}
                    </span>
                  ))}
                </span>
              </div>
            ))
          ) : (
            <span className="text-slate-400 text-sm font-medium">You have no duty assigned yet.</span>
          )}
        </div>
      </div>

      {/* Student Leave Today */}
      {leaves.length > 0 && (
        <div className="bg-white border-2 border-red-500 rounded-2xl p-6 shadow-sm shadow-red-100">
          <div className="flex items-center gap-2 text-red-600 font-bold mb-4 text-lg">
            <UserCheck /> Student Leave Today
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {leaves.map(leave => (
              <div key={leave.id} className="bg-red-50 rounded-xl p-4 border border-red-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{leave.student?.fullname}</p>
                  <p className="text-xs font-semibold text-red-600 bg-red-100 inline-block px-2 py-0.5 rounded-full mt-1">
                    {leave.leave_type} - {leave.student?.year?.year_name || 'N/A'}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-500 font-medium">{leave.start_date.substring(0,10)}</p>
                  <p className="text-slate-500 font-medium">to {leave.end_date.substring(0,10)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-slate-800 font-bold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-tight">Homework</p>
              <p className="text-xs text-slate-500 font-medium mt-1">View & assign</p>
            </div>
          </button>

          <button className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <Activity size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-tight">Student Scores</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Performance reports</p>
            </div>
          </button>

          <button className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-tight">Student Conduct</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Behavior records</p>
            </div>
          </button>

          <button className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-tight">Monthly Evaluation</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Manage evaluations</p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboardView;
