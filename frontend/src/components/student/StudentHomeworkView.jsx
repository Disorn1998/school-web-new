import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookOpen, Calendar, FileText, AlertCircle, Clock } from 'lucide-react';

const StudentHomeworkView = ({ currentStudent }) => {
  const [homeworks, setHomeworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentStudent?.id) return;
    
    const fetchHomeworks = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/student/homework/${currentStudent.id}`);
        setHomeworks(res.data || []);
      } catch (err) {
        console.error('Failed to fetch homeworks', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHomeworks();
  }, [currentStudent]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-brand-500" /> My Homework
          </h2>
          <p className="text-slate-500 mt-1">Keep track of your assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
            Loading homeworks...
          </div>
        ) : homeworks.length > 0 ? (
          homeworks.map(hw => {
            const isOverdue = new Date(hw.date_due) < new Date(new Date().setHours(0,0,0,0));
            return (
              <div key={hw.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                {isOverdue && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    Overdue
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center text-brand-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Subject: {hw.subject?.subject_name || hw.subject_id}</h3>
                    <p className="text-xs text-slate-500 font-medium">Teacher: {hw.teacher?.fullname || 'N/A'}</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 font-medium flex-1 whitespace-pre-wrap">{hw.description}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> Set: {hw.date_set}</span>
                    <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                      <Clock size={14} /> Due: {hw.date_due}
                    </span>
                  </div>
                  
                  {hw.attachment && (
                    <a href={`http://localhost:3000${hw.attachment}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-sm transition-colors mt-2">
                      <FileText size={16} /> View Attachment
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
            No active homework at the moment. Great job!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHomeworkView;
