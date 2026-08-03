import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, Plus, Edit2, Trash2, X, ShieldAlert, Key } from 'lucide-react';

const ParentsView = () => {
  const [parents, setParents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentParent, setCurrentParent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '', password: '', status: 'active',
    father_firstname: '', father_lastname: '', father_email: '', father_phone: '',
    mother_firstname: '', mother_lastname: '', mother_email: '', mother_phone: '',
    guardian1_firstname: '', guardian1_lastname: '', guardian1_email: '', guardian1_phone: '',
    guardian2_firstname: '', guardian2_lastname: '', guardian2_email: '', guardian2_phone: '',
    invoice_target: 'Father',
    address_line1: '', address_line2: '', city: '', province: '', postcode: '', country: ''
  });

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/parents');
      setParents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch parents', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredParents = parents.filter(parent => 
    (parent.father_firstname && parent.father_firstname.toLowerCase().includes(searchQuery)) ||
    (parent.username && parent.username.toLowerCase().includes(searchQuery)) ||
    (parent.father_phone && parent.father_phone.includes(searchQuery))
  );

  const openAddModal = () => {
    setCurrentParent(null);
    setFormData({
      username: '', password: '', status: 'active',
      father_firstname: '', father_lastname: '', father_email: '', father_phone: '',
      mother_firstname: '', mother_lastname: '', mother_email: '', mother_phone: '',
      guardian1_firstname: '', guardian1_lastname: '', guardian1_email: '', guardian1_phone: '',
      guardian2_firstname: '', guardian2_lastname: '', guardian2_email: '', guardian2_phone: '',
      invoice_target: 'Father',
      address_line1: '', address_line2: '', city: '', province: '', postcode: '', country: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (parent) => {
    setCurrentParent(parent);
    setFormData({
      username: parent.username || '', password: '', status: parent.status || 'active',
      father_firstname: parent.father_firstname || '', father_lastname: parent.father_lastname || '', father_email: parent.father_email || '', father_phone: parent.father_phone || '',
      mother_firstname: parent.mother_firstname || '', mother_lastname: parent.mother_lastname || '', mother_email: parent.mother_email || '', mother_phone: parent.mother_phone || '',
      guardian1_firstname: parent.guardian1_firstname || '', guardian1_lastname: parent.guardian1_lastname || '', guardian1_email: parent.guardian1_email || '', guardian1_phone: parent.guardian1_phone || '',
      guardian2_firstname: parent.guardian2_firstname || '', guardian2_lastname: parent.guardian2_lastname || '', guardian2_email: parent.guardian2_email || '', guardian2_phone: parent.guardian2_phone || '',
      invoice_target: parent.invoice_target || 'Father',
      address_line1: parent.address_line1 || '', address_line2: parent.address_line2 || '', city: parent.city || '', province: parent.province || '', postcode: parent.postcode || '', country: parent.country || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (parent) => {
    setCurrentParent(parent);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      
      // Remove password if it's empty during edit to prevent overwriting with blank
      if (currentParent && !payload.password) {
        delete payload.password;
      }

      if (currentParent) {
        await api.put(`/admin/parents/${currentParent.id}`, payload);
      } else {
        await api.post('/admin/parents', payload);
      }
      
      setIsModalOpen(false);
      fetchParents();
    } catch (error) {
      console.error('Failed to save parent', error);
      alert('An error occurred while saving the parent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/admin/parents/${currentParent.id}`);
      setIsDeleteModalOpen(false);
      fetchParents();
    } catch (error) {
      console.error('Failed to delete parent', error);
      alert('Failed to delete parent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Parents Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage parent accounts and contact information</p>
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
              placeholder="Search parents..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm transition-all"
          >
            <Plus size={18} /> Add Parent
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Username</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Father's Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Mother's Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Linked Students</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Loading parent records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Key size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">{parent.username}</span>
                      </div>
                      <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${parent.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {parent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{parent.father_firstname} {parent.father_lastname}</p>
                      <p className="text-xs font-medium text-slate-500">{parent.father_phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{parent.mother_firstname || '-'}</p>
                      <p className="text-xs font-medium text-slate-500">{parent.mother_phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-600">
                      {parent.students?.length || 0} Students
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(parent)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(parent)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No parents found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800">{currentParent ? 'Edit Parent' : 'Add New Parent'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Account Info */}
              <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                    <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password {currentParent && "(Leave blank to keep)"}</label>
                    <input type={currentParent ? "password" : "text"} required={!currentParent} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all cursor-pointer">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Father Info */}
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3">Father's Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                        <input type="text" value={formData.father_firstname} onChange={(e) => setFormData({...formData, father_firstname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                        <input type="text" value={formData.father_lastname} onChange={(e) => setFormData({...formData, father_lastname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input type="text" value={formData.father_phone} onChange={(e) => setFormData({...formData, father_phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                      <input type="email" value={formData.father_email} onChange={(e) => setFormData({...formData, father_email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Mother Info */}
                <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-100">
                  <h4 className="text-sm font-bold text-pink-800 uppercase tracking-wider mb-3">Mother's Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                        <input type="text" value={formData.mother_firstname} onChange={(e) => setFormData({...formData, mother_firstname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                        <input type="text" value={formData.mother_lastname} onChange={(e) => setFormData({...formData, mother_lastname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input type="text" value={formData.mother_phone} onChange={(e) => setFormData({...formData, mother_phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                      <input type="email" value={formData.mother_email} onChange={(e) => setFormData({...formData, mother_email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guardian 1 */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-3">Guardian 1 (Optional)</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input type="text" placeholder="First Name" value={formData.guardian1_firstname} onChange={(e) => setFormData({...formData, guardian1_firstname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                      </div>
                      <div>
                        <input type="text" placeholder="Last Name" value={formData.guardian1_lastname} onChange={(e) => setFormData({...formData, guardian1_lastname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <input type="text" placeholder="Phone Number" value={formData.guardian1_phone} onChange={(e) => setFormData({...formData, guardian1_phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <input type="email" placeholder="Email Address" value={formData.guardian1_email} onChange={(e) => setFormData({...formData, guardian1_email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Guardian 2 */}
                <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                  <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-3">Guardian 2 (Optional)</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input type="text" placeholder="First Name" value={formData.guardian2_firstname} onChange={(e) => setFormData({...formData, guardian2_firstname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                      </div>
                      <div>
                        <input type="text" placeholder="Last Name" value={formData.guardian2_lastname} onChange={(e) => setFormData({...formData, guardian2_lastname: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <input type="text" placeholder="Phone Number" value={formData.guardian2_phone} onChange={(e) => setFormData({...formData, guardian2_phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <input type="email" placeholder="Email Address" value={formData.guardian2_email} onChange={(e) => setFormData({...formData, guardian2_email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing and Address */}
              <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-3">Billing & Address</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Target</label>
                    <select value={formData.invoice_target} onChange={(e) => setFormData({...formData, invoice_target: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none cursor-pointer">
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian1">Guardian 1</option>
                      <option value="Guardian2">Guardian 2</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input type="text" placeholder="Address Line 1" value={formData.address_line1} onChange={(e) => setFormData({...formData, address_line1: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                    </div>
                    <div>
                      <input type="text" placeholder="Address Line 2 (Optional)" value={formData.address_line2} onChange={(e) => setFormData({...formData, address_line2: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                    </div>
                    <div>
                      <input type="text" placeholder="Province" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                    </div>
                    <div>
                      <input type="text" placeholder="Postcode" value={formData.postcode} onChange={(e) => setFormData({...formData, postcode: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                    </div>
                    <div>
                      <input type="text" placeholder="Country" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-white p-2 rounded-t-xl border-t border-slate-100 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save Parent'}
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
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Parent?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete the account for <strong>{currentParent?.username}</strong>? This action cannot be undone.
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

    </div>
  );
};

export default ParentsView;
