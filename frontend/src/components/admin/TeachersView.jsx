import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, BookOpen, MapPin, User, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const TeachersView = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const search = searchTerm.toLowerCase();
    const matchName = t.fullname ? t.fullname.toLowerCase().includes(search) : false;
    const matchEmail = t.email ? t.email.toLowerCase().includes(search) : false;
    return matchName || matchEmail;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view teaching staff profiles</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search teachers by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Teacher List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-4"></div>
              <p>Loading teachers...</p>
            </div>
          ) : filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTeachers.map(teacher => (
                <div 
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTeacher?.id === teacher.id 
                      ? 'border-brand-500 shadow-md ring-1 ring-brand-500/20' 
                      : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-brand-100 to-purple-100 flex items-center justify-center text-brand-700 font-bold text-xl shadow-inner shrink-0 overflow-hidden">
                      {teacher.photo && teacher.photo !== 'default.png' ? (
                        <img src={`http://localhost:3000${teacher.photo}`} alt={teacher.name} className="w-full h-full object-cover" />
                      ) : (
                        teacher.name ? teacher.name.charAt(0) : 'T'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{teacher.fullname}</h3>
                      <p className="text-xs text-brand-600 font-semibold mb-2">{teacher.passport_name || 'No Passport Name'}</p>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mb-1">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{teacher.email || 'No email provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No teachers found</h3>
              <p className="text-slate-500">Try adjusting your search query.</p>
            </div>
          )}
        </div>

        {/* Right Col: Teacher Details */}
        <div className="lg:col-span-1">
          {selectedTeacher ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden sticky top-24 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="h-32 bg-gradient-to-r from-brand-600 to-purple-600 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white flex items-center justify-center text-brand-600 font-bold text-3xl shadow-lg -mt-12 mb-4 overflow-hidden relative z-10">
                  {selectedTeacher.photo && selectedTeacher.photo !== 'default.png' ? (
                    <img src={`http://localhost:3000${selectedTeacher.photo}`} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTeacher.name ? selectedTeacher.name.charAt(0) : 'T'
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800">{selectedTeacher.fullname}</h2>
                <p className="text-brand-600 font-semibold text-sm mb-6">{selectedTeacher.passport_name || 'Teacher'}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-500 shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Email Address</p>
                      <p className="text-sm font-medium text-slate-700 truncate">{selectedTeacher.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-500 shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">System Username</p>
                      <p className="text-sm font-medium text-slate-700">{selectedTeacher.username}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-brand-500" /> Biography & Profile
                  </h3>
                  <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100/50">
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      {selectedTeacher.teacher_profile?.profile || "No biography provided yet. This teacher hasn't updated their profile."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl border border-slate-200 border-dashed h-[500px] flex flex-col items-center justify-center text-center p-8 sticky top-24">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Teacher Selected</h3>
              <p className="text-slate-500 text-sm">Select a teacher from the list to view their full profile and biography.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersView;
