import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, Plus, Edit2, Trash2, X, MoreVertical, ShieldAlert, Eye, Filter } from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';
import ApplicationWizard from './ApplicationWizard';
import { CLASS_LEVELS, getClassName } from '../../utils/constants';

const StudentsView = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  const [parents, setParents] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    fullname: '',
    nickname: '',
    year_id: 1,
    parent_id: '',
    status: 'active',
    date_of_birth: '',
    gender: '',
    nationality: '',
    enrollment_year: new Date().getFullYear(),
    email: '',
    phone: '',
    food_limitations: '',
    health_limitations: ''
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const response = await api.get('/admin/parents');
      setParents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch parents', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.fullname && student.fullname.toLowerCase().includes(searchQuery)) ||
      (student.student_id && student.student_id.toLowerCase().includes(searchQuery)) ||
      (student.nickname && student.nickname.toLowerCase().includes(searchQuery));
      
    const matchesClass = selectedClassFilter === '' || student.year_id.toString() === selectedClassFilter;
    
    return matchesSearch && matchesClass;
  });

  const openAddModal = () => {
    setIsWizardOpen(true);
  };

  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      student_id: student.student_id || '',
      fullname: student.fullname || '',
      nickname: student.nickname || '',
      year_id: student.year_id || 1,
      parent_id: student.parent_id || '',
      status: student.status || 'active',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      nationality: student.nationality || '',
      enrollment_year: student.enrollment_year || new Date().getFullYear(),
      email: student.email || '',
      phone: student.phone || '',
      food_limitations: student.food_limitations || '',
      health_limitations: student.health_limitations || '',
      profile_image: student.profile_image || ''
    });
    setIsModalOpen(true);
  };

  const openProfileModal = (student) => {
    setCurrentStudent(student);
    setIsProfileModalOpen(true);
  };

  const openDeleteModal = (student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        year_id: parseInt(formData.year_id) || null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        enrollment_year: parseInt(formData.enrollment_year) || null
      };

      if (currentStudent) {
        // Update
        await api.put(`/admin/students/${currentStudent.id}`, payload);
      } else {
        // Create
        await api.post('/admin/students', payload);
      }
      
      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Failed to save student', error);
      alert('An error occurred while saving the student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/students/${currentStudent.id}`);
      setIsDeleteModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Failed to delete student', error);
      alert('Failed to delete student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Students Management</h2>
          <p className="text-sm text-slate-500 mt-1">View, add, and manage student records</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search students..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white shadow-sm transition-all"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="block w-40 pl-10 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white cursor-pointer shadow-sm transition-all appearance-none"
            >
              <option value="">All Classes</option>
              {CLASS_LEVELS.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Student Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Year / Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Parent / Guardian</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{student.student_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-100 to-purple-100 flex items-center justify-center text-brand-700 font-bold shadow-sm overflow-hidden">
                          {student.profile_image && student.profile_image !== 'default.png' ? (
                            <img src={`http://localhost:3000${student.profile_image}`} alt={student.fullname} className="w-full h-full object-cover" />
                          ) : (
                            student.fullname ? student.fullname.charAt(0) : 'S'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.fullname}</p>
                          <p className="text-xs font-medium text-slate-500">Nickname: {student.nickname || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{getClassName(student.year_id)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{student.parent?.father_firstname || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openProfileModal(student)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Profile">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(student)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No students found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal (Only used for EDIT now) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Edit Student</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Profile Image Edit */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                <label className="relative w-32 h-40 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-brand-500 overflow-hidden group bg-white">
                  {formData.profile_image && formData.profile_image !== 'default.png' ? (
                    <img src={`http://localhost:3000${formData.profile_image}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <span className="text-xs font-medium mt-1">Upload Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const uploadData = new FormData();
                    uploadData.append('image', file);
                    try {
                      const response = await fetch('http://localhost:3000/api/admin/upload', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                        body: uploadData
                      });
                      const data = await response.json();
                      if (!response.ok) throw new Error(data.error);
                      setFormData(prev => ({ ...prev, profile_image: data.url }));
                    } catch (err) {
                      alert('Upload failed: ' + err.message);
                    }
                  }} />
                </label>
                <p className="text-xs text-slate-500 mt-2">Click to update photo</p>
              </div>

              {/* General Information */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">General Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                    <input type="text" required value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student ID</label>
                    <input type="text" required value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nickname</label>
                    <input type="text" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Class Year</label>
                    <select value={formData.year_id} onChange={(e) => setFormData({...formData, year_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer">
                      <option value="16">In Process</option>
                      {CLASS_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                    <input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                    <input type="text" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nationality</label>
                    <input type="text" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Enrollment Year</label>
                    <input type="number" value={formData.enrollment_year} onChange={(e) => setFormData({...formData, enrollment_year: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Account (Family)</label>
                    <select value={formData.parent_id} onChange={(e) => setFormData({...formData, parent_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer">
                      <option value="">-- No Parent Assigned --</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>{p.father_firstname} {p.father_lastname} (ID: {p.id})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4">Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Health & Limitations */}
              <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-4">Health & Limitations</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Food Limitations</label>
                    <textarea value={formData.food_limitations} onChange={(e) => setFormData({...formData, food_limitations: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all min-h-[80px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Health Limitations</label>
                    <textarea value={formData.health_limitations} onChange={(e) => setFormData({...formData, health_limitations: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all min-h-[80px]" />
                  </div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-white p-2 rounded-t-xl border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Student?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete <strong>{currentStudent?.fullname}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isSubmitting} className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2">
                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {isProfileModalOpen && (
        <StudentProfileModal 
          student={currentStudent} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}

      {/* Application Wizard */}
      {isWizardOpen && (
        <ApplicationWizard 
          onClose={() => setIsWizardOpen(false)} 
          onSuccess={() => {
            setIsWizardOpen(false);
            fetchStudents();
          }}
        />
      )}

    </div>
  );
};

export default StudentsView;
