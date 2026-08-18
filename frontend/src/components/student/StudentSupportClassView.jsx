import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Sun, Calendar, DollarSign, Users, CheckCircle, Info } from 'lucide-react';

const StudentSupportClassView = ({ currentStudent }) => {
  const [classes, setClasses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentStudent]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const studentIdStr = currentStudent ? `?student_id=${currentStudent.id}` : '';
      const [classesRes, myRes] = await Promise.all([
        api.get('/student/support-classes'),
        api.get(`/student/my-support-classes${studentIdStr}`)
      ]);
      setClasses(classesRes.data || []);
      setMyEnrollments(myRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (classId) => {
    if (!window.confirm('Are you sure you want to enroll in this class? You will be billed for the fee.')) return;
    
    try {
      const payload = { class_id: classId };
      if (currentStudent) {
        payload.student_id = currentStudent.id;
      }
      
      await api.post('/student/support-classes/enroll', payload);
      alert('Successfully enrolled! An invoice has been generated.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll');
    }
  };

  const isEnrolled = (classId) => {
    return myEnrollments.some(e => e.support_class_id === classId);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-400 font-medium">Loading classes...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <Sun className="absolute -top-10 -right-10 w-48 h-48 text-white/10" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Summer & Support Classes</h2>
          <p className="text-orange-50 font-medium max-w-lg">
            Enhance your skills during the holidays! Enroll in our specialized support classes and summer camps.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Sun className="text-orange-500" /> Available Programs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length > 0 ? (
            classes.map(c => {
              const enrolled = isEnrolled(c.id);
              const isFull = c.enrollments?.length >= c.capacity;
              
              return (
                <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h4>
                    <p className="text-sm text-slate-500 mb-6">{c.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                        <Calendar size={16} className="text-brand-500" /> {c.schedule}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                        <DollarSign size={16} className="text-emerald-500" /> ฿{c.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                        <Users size={16} className="text-blue-500" /> {c.enrollments?.length || 0} / {c.capacity} Enrolled
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    {enrolled ? (
                      <div className="w-full py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Already Enrolled
                      </div>
                    ) : isFull ? (
                      <div className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-center">
                        Class is Full
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(c.id)}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-sm flex justify-center items-center gap-2"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200 border-dashed">
              No programs available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSupportClassView;
