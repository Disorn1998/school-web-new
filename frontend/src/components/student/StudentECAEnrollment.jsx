import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Activity, Users, Clock, Plus, CheckCircle, AlertCircle } from 'lucide-react';

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' }
];

const StudentECAEnrollment = ({ currentStudent }) => {
  const [ecas, setEcas] = useState([]);
  const [myEcas, setMyEcas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    if (currentStudent) {
      fetchECAData();
    }
  }, [currentStudent]);

  const fetchECAData = async () => {
    setIsLoading(true);
    try {
      const semRes = await api.get('/admin/settings/semesters');
      const activeSem = (semRes.data || []).find(s => s.status === 'ACTIVE') || (semRes.data || [])[0];
      
      if (activeSem) {
        setActiveSemester(activeSem);
        
        const [allEcasRes, myEcasRes] = await Promise.all([
          api.get(`/student/ecas?semester_id=${activeSem.id}`),
          api.get(`/student/my-ecas?semester_id=${activeSem.id}`)
        ]);
        
        setEcas(allEcasRes.data || []);
        setMyEcas(myEcasRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch ECA data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (ecaId) => {
    if (!window.confirm('Are you sure you want to enroll in this activity?')) return;
    
    setIsEnrolling(true);
    try {
      await api.post('/student/ecas/enroll', { eca_id: ecaId });
      alert('Successfully enrolled!');
      fetchECAData(); // Refresh list
    } catch (error) {
      console.error('Failed to enroll', error);
      alert(error.response?.data?.error || 'Failed to enroll in ECA. It might be full.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const isEnrolled = (ecaId) => {
    return myEcas.some(enrollment => enrollment.eca_id === ecaId && enrollment.status === 'Enrolled');
  };

  if (!currentStudent) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-brand-500" /> Extracurricular Activities
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {activeSemester?.semester_name || 'Current Semester'}
          </p>
        </div>
        
        <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl text-sm font-bold border border-brand-100 flex items-center gap-2">
          <CheckCircle size={18} />
          {myEcas.length} Enrolled Activities
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
          Loading ECAs...
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 px-2">Available Clubs & Activities</h3>
          
          {ecas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecas.map(eca => {
                const enrolled = isEnrolled(eca.id);
                // Note: We don't have current occupancy from this API without extra backend work, 
                // but we can assume available unless enrolled.
                
                return (
                  <div key={eca.id} className={`bg-white rounded-3xl p-6 border shadow-sm transition-all flex flex-col h-full ${enrolled ? 'border-brand-500 shadow-brand-500/10' : 'border-slate-200 hover:shadow-md'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 mb-2">
                          {DAYS.find(d => d.id === eca.day_of_week)?.name}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{eca.name}</h3>
                      </div>
                      {enrolled && (
                        <div className="bg-brand-500 text-white p-1.5 rounded-full" title="Enrolled">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{eca.description}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={16} className="text-slate-400" />
                        <span className="font-medium">{eca.start_time} - {eca.end_time}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-semibold text-slate-500">Teacher:</span>
                        <span className="font-medium">{eca.teacher?.fullname || 'Staff'}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-semibold text-slate-500">Fee:</span>
                        <span className={`font-bold ${eca.fee > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {eca.fee > 0 ? `฿${eca.fee.toLocaleString()}` : 'Free'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                      {enrolled ? (
                        <div className="w-full py-2.5 text-center text-sm font-bold text-brand-700 bg-brand-50 rounded-xl">
                          Already Enrolled
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEnroll(eca.id)}
                          disabled={isEnrolling}
                          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          {isEnrolling ? 'Processing...' : <><Plus size={16} /> Enroll Now</>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Activities Found</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">There are no Extracurricular Activities open for registration at this time. Please check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentECAEnrollment;
