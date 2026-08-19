import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import StudentInvoicesView from '../components/student/StudentInvoicesView';
import StudentHomeworkView from '../components/student/StudentHomeworkView';
import StudentReportCardView from '../components/student/StudentReportCardView';
import StudentConductReportView from '../components/student/StudentConductReportView';
import StudentTimetableView from '../components/student/StudentTimetableView';
import StudentECAEnrollment from '../components/student/StudentECAEnrollment';
import StudentSchoolBusRegistration from '../components/student/StudentSchoolBusRegistration';
import StudentLeaveRequest from '../components/student/StudentLeaveRequest';
import StudentLibrary from '../components/student/StudentLibrary';
import StudentHealthView from '../components/student/StudentHealthView';
import StudentEvaluationView from '../components/student/StudentEvaluationView';
import StudentSupportClassView from '../components/student/StudentSupportClassView';
import MyTicketsView from '../components/student/MyTicketsView';
import StudentShopView from '../components/student/StudentShopView';
import PrincipalMessagePopup from '../components/student/PrincipalMessagePopup';
import SchoolInformationView from '../components/student/SchoolInformationView';
import { LogOut, BookOpen, Clock, FileText, Calendar, CheckSquare, Users, Activity, Bus, Library, HeartPulse, Award, Sun, Wrench, ShoppingBag, Info } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [siblings, setSiblings] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [homework, setHomework] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profileRes = await api.get('/student/profile');
        const data = profileRes.data;
        if (Array.isArray(data) && data.length > 0) {
          setSiblings(data);
          setActiveStudentId(data[0].id);
        } else if (data && !Array.isArray(data)) {
          setSiblings([data]);
          setActiveStudentId(data.id);
        }
      } catch (error) {
        console.error('Failed to fetch profile data', error);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (!activeStudentId) return;

    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        const activeProfile = siblings.find(s => s.id === activeStudentId);
        setProfile(activeProfile);

        const homeworkRes = await api.get(`/student/homework/${activeStudentId}`);
        setHomework(homeworkRes.data || []);
      } catch (error) {
        console.error('Failed to fetch student specific data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [activeStudentId, siblings]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Principal Welcome Popup */}
      {profile && (
        <PrincipalMessagePopup studentName={profile.fullname} />
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Student Portal</span>
        </div>
        <div className="flex items-center gap-4">
          
          {siblings.length > 1 && (
            <div className="hidden sm:flex items-center gap-2 mr-4 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Users size={16} className="text-slate-400" />
              <select 
                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                value={activeStudentId || ''}
                onChange={(e) => setActiveStudentId(Number(e.target.value))}
              >
                {siblings.map(sib => (
                  <option key={sib.id} value={sib.id}>{sib.fullname}</option>
                ))}
              </select>
            </div>
          )}

          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{profile?.fullname || user?.fullname}</p>
            <p className="text-xs text-slate-500 font-medium">Year {profile?.year_id || 'Unknown'}</p>
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {/* Mobile Switcher (visible only on small screens if multiple siblings) */}
        {siblings.length > 1 && (
          <div className="sm:hidden mb-6 flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <Users size={18} className="text-brand-500" />
            <select 
              className="flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
              value={activeStudentId || ''}
              onChange={(e) => setActiveStudentId(Number(e.target.value))}
            >
              {siblings.map(sib => (
                <option key={sib.id} value={sib.id}>{sib.fullname}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 font-bold ${activeTab === 'dashboard' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('homework')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'homework' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BookOpen size={18} /> My Homework
          </button>
          <button 
            onClick={() => setActiveTab('report-card')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'report-card' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText size={18} /> Report Card
          </button>
          <button 
            onClick={() => setActiveTab('invoices')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'invoices' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText size={18} /> Invoices & Receipts
          </button>
          <button 
            onClick={() => setActiveTab('conduct-report')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'conduct-report' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CheckSquare size={18} /> Conduct Report
          </button>
          <button 
            onClick={() => setActiveTab('timetable')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'timetable' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Calendar size={18} /> Timetable
          </button>
          <button 
            onClick={() => setActiveTab('ecas')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'ecas' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Activity size={18} /> ECAs / Clubs
          </button>
          <button 
            onClick={() => setActiveTab('support-classes')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'support-classes' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Sun size={18} /> Summer Classes
          </button>
          <button 
            onClick={() => setActiveTab('tickets')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'tickets' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Wrench size={18} /> Help & Support
          </button>
          <button 
            onClick={() => setActiveTab('shop')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'shop' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShoppingBag size={18} /> School Shop
          </button>
          <button 
            onClick={() => setActiveTab('schoolbus')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'schoolbus' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Bus size={18} /> School Bus
          </button>
          <button 
            onClick={() => setActiveTab('leave')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'leave' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Calendar size={18} /> Leave Request
          </button>
          <button 
            onClick={() => setActiveTab('library')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'library' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Library size={18} /> Library
          </button>
          <button 
            onClick={() => setActiveTab('health')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'health' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <HeartPulse size={18} /> Health
          </button>
          <button 
            onClick={() => setActiveTab('evaluation')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'evaluation' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Award size={18} /> Evaluation
          </button>
          <button 
            onClick={() => setActiveTab('information')} 
            className={`px-4 py-2 font-bold flex items-center gap-2 ${activeTab === 'information' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Info size={18} /> Information
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-500 to-purple-500"></div>
                
                <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden mb-4 mt-6">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.fullname || 'Alex'}`} alt="avatar" className="w-full h-full object-cover" />
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
          </div>
        ) : activeTab === 'invoices' ? (
          <StudentInvoicesView activeStudentId={activeStudentId} />
        ) : activeTab === 'homework' ? (
          <StudentHomeworkView currentStudent={profile} />
        ) : activeTab === 'report-card' ? (
          <StudentReportCardView currentStudent={profile} />
        ) : activeTab === 'conduct-report' ? (
          <StudentConductReportView currentStudent={profile} />
        ) : activeTab === 'timetable' ? (
          <StudentTimetableView currentStudent={profile} />
        ) : activeTab === 'ecas' ? (
          <StudentECAEnrollment currentStudent={profile} />
        ) : activeTab === 'support-classes' ? (
          <StudentSupportClassView currentStudent={profile} />
        ) : activeTab === 'tickets' ? (
          <MyTicketsView currentStudent={profile} />
        ) : activeTab === 'shop' ? (
          <StudentShopView currentStudent={profile} />
        ) : activeTab === 'schoolbus' ? (
          <StudentSchoolBusRegistration currentStudent={profile} />
        ) : activeTab === 'leave' ? (
          <StudentLeaveRequest currentStudent={profile} />
        ) : activeTab === 'library' ? (
          <StudentLibrary currentStudent={profile} />
        ) : activeTab === 'health' ? (
          <StudentHealthView currentStudent={profile} />
        ) : activeTab === 'evaluation' ? (
          <StudentEvaluationView currentStudent={profile} />
        ) : activeTab === 'information' ? (
          <SchoolInformationView currentStudent={profile} />
        ) : null}
      </main>
    </div>
  );
};

export default StudentDashboard;
