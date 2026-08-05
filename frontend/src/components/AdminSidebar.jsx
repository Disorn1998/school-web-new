import React from 'react';
import { 
  LayoutDashboard, Users, UserCog, CheckSquare, 
  ShieldAlert, BookOpen, FileText, HeartPulse, 
  Library, DollarSign, Bus, Activity, 
  Award, Mail, PieChart, LogOut, Settings, ClipboardList
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super', 'officer', 'teacher'] },
  { id: 'duty_roster', label: 'Duty Roster', icon: ClipboardList, roles: ['super', 'officer'] },
  { id: 'teachers', label: 'Teachers', icon: Users, roles: ['super', 'officer'] },
  { id: 'staff', label: 'Staff & Officers', icon: UserCog, roles: ['super'] },
  { id: 'students', label: 'Students', icon: Users, roles: ['super', 'officer', 'teacher'] },
  { id: 'parents', label: 'Parents', icon: UserCog, roles: ['super', 'officer'] },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare, roles: ['super', 'officer', 'teacher'] },
  { id: 'conduct', label: 'Conduct', icon: ShieldAlert, roles: ['super', 'officer', 'teacher'] },
  { id: 'homework', label: 'Homework', icon: BookOpen, roles: ['super', 'officer', 'teacher'] },
  { id: 'lesson', label: 'Lesson Plan', icon: FileText, roles: ['super', 'officer', 'teacher'] },
  { id: 'health', label: 'Health', icon: HeartPulse, roles: ['super', 'officer', 'teacher'] },
  { id: 'library', label: 'Library', icon: Library, roles: ['super', 'officer', 'teacher'] },
  { id: 'finance', label: 'Finance & Invoices', icon: DollarSign, roles: ['super', 'officer'] },
  { id: 'schoolbus', label: 'School Bus', icon: Bus, roles: ['super', 'officer'] },
  { id: 'ecas', label: 'ECAs', icon: Activity, roles: ['super', 'officer'] },
  { id: 'evaluation', label: 'Evaluation', icon: Award, roles: ['super', 'officer', 'teacher'] },
  { id: 'newsletter', label: 'Newsletter', icon: Mail, roles: ['super', 'officer'] },
  { id: 'reports', label: 'Reports', icon: PieChart, roles: ['super', 'officer'] },
  { id: 'settings', label: 'Academic Settings', icon: Settings, roles: ['super', 'officer'] },
];

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useAuth();
  
  // Filter menu items based on user role
  const userRole = user?.role || 'teacher';
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-72 h-screen bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-10 sticky top-0 overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="p-6 pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white font-bold text-xl">SSS</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">Admin Portal</h1>
            <p className="text-xs text-emerald-400 font-medium">Simple School System</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
        
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon 
                size={20} 
                className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-400'} transition-colors`} 
              />
              <span className="text-sm">{item.label}</span>
              
              {/* Optional Active Indicator */}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-colors group"
        >
          <LogOut size={20} className="text-slate-500 group-hover:text-red-400 transition-colors" />
          <span className="text-sm">Logout</span>
        </button>
      </div>

      {/* CSS for custom scrollbar hidden in modern browsers but functionally working */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 20px;
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
