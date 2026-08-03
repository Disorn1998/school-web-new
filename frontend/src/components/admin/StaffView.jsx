import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, ShieldCheck, UserCog } from 'lucide-react';
import api from '../../utils/api';

const StaffView = () => {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staff.filter(s => {
    const search = searchTerm.toLowerCase();
    const matchName = s.fullname ? s.fullname.toLowerCase().includes(search) : false;
    const matchEmail = s.email ? s.email.toLowerCase().includes(search) : false;
    return matchName || matchEmail;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff & Officers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage school administrators and staff members</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-4"></div>
          <p>Loading staff directory...</p>
        </div>
      ) : filteredStaff.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(member => (
            <div key={member.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white flex items-center justify-center text-slate-800 font-bold text-2xl shadow-lg -mt-10 mb-4 overflow-hidden relative z-10">
                  {member.photo && member.photo !== 'default.png' ? (
                    <img src={`http://localhost:3000${member.photo}`} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name ? member.name.charAt(0) : 'S'
                  )}
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 truncate">{member.fullname}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{member.passport_name || 'Staff Member'}</p>
                  </div>
                  {member.role === 'super' ? (
                    <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck size={12} /> Super Admin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      <UserCog size={12} /> Officer
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{member.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <UserCog size={14} className="text-slate-400" />
                    <span className="truncate">@{member.username}</span>
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
          <h3 className="text-lg font-bold text-slate-700 mb-1">No staff members found</h3>
          <p className="text-slate-500">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
};

export default StaffView;
