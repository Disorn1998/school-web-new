import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Award, Target, Users, BookOpen } from 'lucide-react';

const StudentEvaluationView = ({ currentStudent }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentStudent) fetchData();
  }, [currentStudent]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/student/evaluation/${currentStudent.id}`);
      setEvaluations(res.data || []);
    } catch (error) {
      console.error('Failed to fetch evaluations', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score === 'Excellent') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score === 'Good') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  if (!currentStudent) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="text-brand-500" /> Monthly Evaluations
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track monthly progress and teacher feedback</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-medium">Loading Evaluations...</div>
      ) : evaluations.length > 0 ? (
        <div className="space-y-6">
          {evaluations.map(ev => (
            <div key={ev.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-xl text-slate-800">{ev.month_year}</h3>
                  <p className="text-sm text-slate-500 mt-1">Evaluated by: {ev.teacher?.fullname}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${getScoreColor(ev.academic_score)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={18} />
                    <span className="font-bold">Academic</span>
                  </div>
                  <p className="text-lg font-bold">{ev.academic_score}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${getScoreColor(ev.behavior_score)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={18} />
                    <span className="font-bold">Behavior</span>
                  </div>
                  <p className="text-lg font-bold">{ev.behavior_score}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${getScoreColor(ev.social_score)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} />
                    <span className="font-bold">Social</span>
                  </div>
                  <p className="text-lg font-bold">{ev.social_score}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Teacher's Comment</h4>
                <p className="text-slate-600 leading-relaxed text-sm">{ev.teacher_comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Award size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No Evaluations Yet</h3>
          <p className="mt-1">Monthly evaluations will appear here once submitted by teachers.</p>
        </div>
      )}
    </div>
  );
};

export default StudentEvaluationView;
