import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, BookOpen, MapPin, User, ChevronRight, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

const TeachersView = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    passport_name: '',
    email: '',
    role: 'teacher',
    biography: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/teachers');
      setTeachers(response.data);
      // Auto-update selected teacher if it exists
      if (selectedTeacher) {
        const updated = response.data.find(t => t.id === selectedTeacher.id);
        if (updated) setSelectedTeacher(updated);
        else setSelectedTeacher(null);
      }
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

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      username: '',
      password: '',
      fullname: '',
      passport_name: '',
      email: '',
      role: 'teacher',
      biography: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setModalMode('edit');
    setFormData({
      username: t.username,
      password: '', // Leave empty to not change
      fullname: t.fullname,
      passport_name: t.passport_name || '',
      email: t.email || '',
      role: 'teacher',
      biography: t.teacher_profile?.profile || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/personnel/${id}`);
      if (selectedTeacher && selectedTeacher.id === id) {
        setSelectedTeacher(null);
      }
      fetchTeachers();
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Failed to delete teacher');
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
        await api.put(`/admin/personnel/${selectedTeacher.id}`, formData);
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || 'Failed to save teacher');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Teachers Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view teaching staff profiles</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search teachers by name or email..." 
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
            <span>Add Teacher</span>
          </button>
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
                        teacher.fullname ? teacher.fullname.charAt(0) : 'T'
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
              
              {/* Actions Overlay */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(selectedTeacher); }} 
                  className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(selectedTeacher.id); }} 
                  className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="h-32 bg-gradient-to-r from-brand-600 to-purple-600 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white flex items-center justify-center text-brand-600 font-bold text-3xl shadow-lg -mt-12 mb-4 overflow-hidden relative z-10">
                  {selectedTeacher.photo && selectedTeacher.photo !== 'default.png' ? (
                    <img src={`http://localhost:3000${selectedTeacher.photo}`} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTeacher.fullname ? selectedTeacher.fullname.charAt(0) : 'T'
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
                    <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Add New Teacher' : 'Edit Teacher Profile'}
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
              
              <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
                
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name *</label>
                    <input 
                      type="text" required 
                      value={formData.fullname}
                      onChange={e => setFormData({...formData, fullname: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
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
                </div>

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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Biography & Profile</label>
                  <textarea 
                    rows={6}
                    value={formData.biography}
                    onChange={e => setFormData({...formData, biography: e.target.value})}
                    placeholder="Enter teacher's biography, qualifications, and experience..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 custom-scrollbar"
                  ></textarea>
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
                form="teacher-form"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                ) : 'Save Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeachersView;
