import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { HeartPulse, Activity, AlertCircle, Droplet, Ruler, Info } from 'lucide-react';

const StudentHealthView = ({ currentStudent }) => {
  const [record, setRecord] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentStudent) fetchData();
  }, [currentStudent]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recRes, incRes] = await Promise.all([
        api.get(`/student/health/record/${currentStudent.id}`).catch(() => ({ data: null })),
        api.get(`/student/health/incidents/${currentStudent.id}`)
      ]);
      setRecord(recRes.data);
      setIncidents(incRes.data || []);
    } catch (error) {
      console.error('Failed to fetch health data', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentStudent) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="text-rose-500" /> My Health Records
          </h2>
          <p className="text-slate-500 text-sm mt-1">Keep track of physical health and clinic visits</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium">Loading Health Data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Record */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info size={18} className="text-brand-500" /> General Info
              </h3>
              
              {record ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-red-100 text-red-500 rounded-xl flex items-center justify-center">
                      <Droplet size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">Blood Type</p>
                      <p className="font-bold text-slate-800 text-lg">{record.blood_type || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">Weight</p>
                        <p className="font-bold text-slate-800">{record.weight_kg ? `${record.weight_kg} kg` : '-'}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
                        <Ruler size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">Height</p>
                        <p className="font-bold text-slate-800">{record.height_cm ? `${record.height_cm} cm` : '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Allergies</p>
                    <p className="text-sm font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">
                      {record.allergies || 'None recorded'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Underlying Diseases</p>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl">
                      {record.underlying_diseases || 'None recorded'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Emergency Contact</p>
                    <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl">
                      {record.emergency_contact || 'None recorded'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No health profile recorded yet.<br/>Please contact the nurse.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Incidents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" /> Clinic Visits & Incidents
              </h3>
              
              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map(inc => (
                    <div key={inc.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inc.incident_type === 'Accident' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Activity size={24} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800">{inc.incident_type}</h4>
                          <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            {inc.incident_date.split('T')[0]}
                          </span>
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold mb-2 ${inc.severity === 'High' ? 'bg-red-100 text-red-700' : inc.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          Severity: {inc.severity}
                        </span>
                        <p className="text-sm text-slate-600 mb-2">{inc.description}</p>
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <p className="text-xs font-semibold text-slate-400 mb-1">Action Taken</p>
                          <p className="text-sm font-semibold text-slate-700">{inc.action_taken}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <HeartPulse size={32} className="text-slate-300" />
                  </div>
                  <p className="font-medium">No clinic visits recorded.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHealthView;
