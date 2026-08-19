import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bus, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const StudentSchoolBusRegistration = ({ currentStudent }) => {
  const [routes, setRoutes] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    if (currentStudent) {
      fetchBusData();
    }
  }, [currentStudent]);

  const fetchBusData = async () => {
    setIsLoading(true);
    try {
      const semRes = await api.get('/student/settings/semesters');
      const activeSem = (semRes.data || []).find(s => s.status === 'ACTIVE') || (semRes.data || [])[0];
      
      if (activeSem) {
        setActiveSemester(activeSem);
        
        const [routesRes, regRes] = await Promise.all([
          api.get('/student/schoolbus/routes'),
          api.get(`/student/schoolbus/registration/${currentStudent.id}?semester_id=${activeSem.id}`)
        ]);
        
        setRoutes(routesRes.data || []);
        setMyRegistrations(regRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bus data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (routeId, tripType) => {
    if (!window.confirm('Confirm registration for this bus route?')) return;
    
    setIsRegistering(true);
    try {
      await api.post('/student/schoolbus/register', { 
        route_id: routeId,
        student_id: currentStudent.id,
        trip_type: tripType
      });
      alert('Successfully registered for school bus!');
      fetchBusData();
    } catch (error) {
      console.error('Failed to register', error);
      alert(error.response?.data?.error || 'Registration failed. Route might be full.');
    } finally {
      setIsRegistering(false);
    }
  };

  const activeRegistration = myRegistrations.find(r => r.status === 'Active');

  if (!currentStudent) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bus className="text-brand-500" /> School Bus Service
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {activeSemester?.semester_name || 'Current Semester'} Registration
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
          Loading Routes...
        </div>
      ) : activeRegistration ? (
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 text-brand-500/20">
            <Bus size={180} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-brand-100 mb-2 font-semibold">
              <CheckCircle size={20} /> Currently Registered
            </div>
            <h3 className="text-3xl font-bold mb-6">{activeRegistration.route?.route_name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div>
                <p className="text-brand-200 text-sm font-medium mb-1">Driver</p>
                <p className="font-bold text-lg">{activeRegistration.route?.driver_name}</p>
                <p className="text-sm opacity-80">{activeRegistration.route?.contact_info}</p>
              </div>
              <div>
                <p className="text-brand-200 text-sm font-medium mb-1">Vehicle</p>
                <p className="font-bold text-lg">{activeRegistration.route?.license_plate}</p>
              </div>
              <div>
                <p className="text-brand-200 text-sm font-medium mb-1">Trip Type</p>
                <p className="font-bold text-lg bg-brand-500/30 inline-block px-3 py-1 rounded-lg">
                  {activeRegistration.trip_type}
                </p>
              </div>
              <div>
                <p className="text-brand-200 text-sm font-medium mb-1">Monthly Fee</p>
                <p className="font-bold text-lg">฿{activeRegistration.route?.monthly_fee.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-6 flex items-start gap-2 text-brand-100 text-sm bg-black/20 p-4 rounded-xl">
              <MapPin size={18} className="flex-shrink-0 mt-0.5" />
              <p>Coverage: {activeRegistration.route?.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 px-2">Available Routes</h3>
          
          {routes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routes.filter(r => r.is_active).map(route => (
                <div key={route.id} className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bus size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">{route.route_name}</h3>
                      <span className="inline-flex items-center text-xs font-bold text-slate-500 mt-1">
                        Plate: {route.license_plate}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 py-4 border-y border-slate-100 text-sm flex-grow">
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{route.description}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 pt-2">
                      <span className="font-semibold text-slate-500">Driver:</span>
                      <span className="font-medium">{route.driver_name} ({route.contact_info})</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-semibold text-slate-500">Fee (Round Trip):</span>
                      <span className="font-bold text-brand-600">฿{route.monthly_fee.toLocaleString()}/mo</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <button 
                      onClick={() => handleRegister(route.id, 'Round Trip')}
                      disabled={isRegistering}
                      className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {isRegistering ? 'Processing...' : 'Register (Round Trip)'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleRegister(route.id, 'Morning Only')}
                        disabled={isRegistering}
                        className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        Morning Only
                      </button>
                      <button 
                        onClick={() => handleRegister(route.id, 'Afternoon Only')}
                        disabled={isRegistering}
                        className="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        Afternoon Only
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Routes Found</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">There are no active school bus routes available at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSchoolBusRegistration;
