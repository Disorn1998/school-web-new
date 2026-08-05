import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, ShieldCheck, UserCog, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

const StaffView = () => {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentStaff, setCurrentStaff] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    passport_name: '',
    email: '',
    role: 'officer'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      username: '',
      password: '',
      fullname: '',
      passport_name: '',
      email: '',
      role: 'officer'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setModalMode('edit');
    setCurrentStaff(s);
    setFormData({
      username: s.username,
      password: '', // Leave empty to not change
      fullname: s.fullname,
      passport_name: s.passport_name || '',
      email: s.email || '',
      role: s.role
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/admin/personnel/${id}`);
      fetchStaff();
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Failed to delete staff member');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (modalMode === 'add') {
        await api.post('/admin/personnel', formData);
      } else {
        await api.put(`/admin/personnel/${currentStaff.id}`, formData);
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Failed to save staff member');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff & Officers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage school administrators and staff members</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add Staff</span>
          </button>
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
            <div key={member.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
              
              {/* Actions Overlay */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(member)} className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(member.id)} className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white flex items-center justify-center text-slate-800 font-bold text-2xl shadow-lg -mt-10 mb-4 overflow-hidden relative z-10">
                  {member.photo && member.photo !== 'default.png' ? (
                    <img src={`http://localhost:3000${member.photo}`} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.fullname ? member.fullname.charAt(0) : 'S'
                  )}
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-4">
                    <h3 className="text-lg font-bold text-slate-800 truncate">{member.fullname}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{member.passport_name || 'Staff Member'}</p>
                  </div>
                  {member.role === 'super' ? (
                    <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0">
                      <ShieldCheck size={12} /> Super
                    </span>
                  ) : member.role === 'admin' ? (
                     <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0">
                      <ShieldCheck size={12} /> Admin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0">
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Add New Staff' : 'Edit Staff Member'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {errorMsg && (
                <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                  {errorMsg}
                </div>
              )}
              
              <form id="staff-form" onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Username *</label>
                    <input 
                      type="text" required 
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                      Password {modalMode === 'add' ? '*' : '(Leave empty to keep)'}
                    </label>
                    <input 
                      type="password" required={modalMode === 'add'} 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name *</label>
                  <input 
                    type="text" required 
                    value={formData.fullname}
                    onChange={e => setFormData({...formData, fullname: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Role *</label>
                    <select 
                      required
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="officer">Officer (General Staff)</option>
                      <option value="admin">Admin (Manager)</option>
                      <option value="super">Super Admin (System Owner)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Passport / Official Name</label>
                  <input 
                    type="text" 
                    value={formData.passport_name}
                    onChange={e => setFormData({...formData, passport_name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="staff-form"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                ) : 'Save Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffView;
