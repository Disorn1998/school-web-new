import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bus, Plus, Search, MapPin, Users, Edit } from 'lucide-react';

const SchoolBusManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    route_name: '',
    driver_name: '',
    contact_info: '',
    license_plate: '',
    max_capacity: 12,
    monthly_fee: 0,
    description: ''
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/schoolbus/routes');
      setRoutes(res.data || []);
    } catch (error) {
      console.error('Failed to fetch routes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        max_capacity: parseInt(formData.max_capacity),
        monthly_fee: parseFloat(formData.monthly_fee)
      };

      await api.post('/admin/schoolbus/routes', payload);
      setIsModalOpen(false);
      fetchRoutes();
    } catch (error) {
      console.error('Failed to save route', error);
      alert('Failed to save route');
    }
  };

  const filteredRoutes = routes.filter(route => 
    route.route_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (route.driver_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bus className="text-brand-500" /> School Bus Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage bus routes, drivers, and capacity</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search Route or Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none text-sm"
            />
          </div>

          <button 
            onClick={() => {
              setFormData({ route_name: '', driver_name: '', contact_info: '', license_plate: '', max_capacity: 12, monthly_fee: 0, description: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            <Plus size={18} /> New Route
          </button>
        </div>
      </div>

      {/* Grid of Routes */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
          Loading Routes...
        </div>
      ) : filteredRoutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map(route => (
            <div key={route.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Bus size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{route.route_name}</h3>
                    <span className="inline-flex items-center text-xs font-bold text-slate-500 mt-1">
                      {route.license_plate}
                    </span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-brand-600 transition-colors p-1 opacity-0 group-hover:opacity-100">
                  <Edit size={16} />
                </button>
              </div>

              <div className="space-y-3 py-4 border-y border-slate-100 text-sm flex-grow">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="font-medium line-clamp-2">{route.description || 'No description'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-2">
                  <span className="font-semibold text-slate-500">Driver:</span>
                  <span className="font-medium">{route.driver_name || 'Not Assigned'} ({route.contact_info})</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold text-slate-500">Monthly Fee:</span>
                  <span className="font-bold text-brand-600">
                    ฿{route.monthly_fee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                  <Users size={16} /> Capacity: {route.max_capacity}
                </div>
                <button className="text-sm font-bold text-brand-600 hover:text-brand-700">View Registrations</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
            <Bus size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Routes Found</h3>
          <p className="text-slate-500 mt-1 max-w-md">There are no school bus routes set up yet. Click "New Route" to create one.</p>
        </div>
      )}

      {/* Create Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Create New Bus Route</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Route Name</label>
                <input 
                  type="text" required autoFocus
                  value={formData.route_name} onChange={e => setFormData({...formData, route_name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  placeholder="e.g. Route 1: Sukhumvit"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Areas Covered / Description</label>
                <textarea 
                  rows="2"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none resize-none" 
                  placeholder="Ekamai, Thong Lo, Phrom Phong"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input 
                    type="text" required
                    value={formData.driver_name} onChange={e => setFormData({...formData, driver_name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Driver Contact (Phone)</label>
                  <input 
                    type="text" required
                    value={formData.contact_info} onChange={e => setFormData({...formData, contact_info: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">License Plate</label>
                <input 
                  type="text" required
                  value={formData.license_plate} onChange={e => setFormData({...formData, license_plate: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Capacity (Seats)</label>
                  <input 
                    type="number" min="1" required
                    value={formData.max_capacity} onChange={e => setFormData({...formData, max_capacity: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Fee (฿)</label>
                  <input 
                    type="number" min="0" required
                    value={formData.monthly_fee} onChange={e => setFormData({...formData, monthly_fee: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolBusManagement;
