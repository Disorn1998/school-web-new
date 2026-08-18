import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { getClassName } from '../../utils/constants';

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' }
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const StudentTimetableView = ({ currentStudent }) => {
  const [timetable, setTimetable] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    if (currentStudent) {
      fetchTimetable();
    }
  }, [currentStudent]);

  const fetchTimetable = async () => {
    setIsLoading(true);
    try {
      // Find active semester first
      const semRes = await api.get('/admin/settings/semesters');
      const activeSem = (semRes.data || []).find(s => s.status === 'ACTIVE') || (semRes.data || [])[0];
      
      if (activeSem) {
        setActiveSemester(activeSem);
        const response = await api.get(`/admin/timetable?year_id=${currentStudent.year_id}&semester_id=${activeSem.id}`);
        const data = response.data || [];
        
        const map = {};
        data.forEach(entry => {
          map[`${entry.day_of_week}-${entry.period}`] = entry;
        });
        setTimetable(map);
      }
    } catch (error) {
      console.error('Failed to fetch timetable', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentStudent) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-brand-500" /> Class Timetable
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {activeSemester?.semester_name || 'Current Semester'} • {getClassName(currentStudent.year_id)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
            Loading schedule...
          </div>
        ) : (
          <div className="overflow-x-auto p-6">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-3 border border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 uppercase w-24 text-center">Day</th>
                  {PERIODS.map(p => (
                    <th key={p} className="p-3 border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 text-center">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day.id}>
                    <td className="p-3 border border-slate-200 bg-slate-50 font-bold text-slate-700 text-sm text-center">
                      {day.name}
                    </td>
                    {PERIODS.map(period => {
                      const key = `${day.id}-${period}`;
                      const entry = timetable[key];

                      return (
                        <td 
                          key={period} 
                          className="p-0 border border-slate-200 h-24 align-top w-40 relative group hover:bg-slate-50 transition-colors"
                        >
                          {entry && entry.subject ? (
                            <div className="w-full h-full p-2 flex flex-col justify-between">
                              <p className="text-sm font-bold text-brand-700 leading-tight">{entry.subject}</p>
                              <div className="mt-auto space-y-0.5">
                                {entry.teacher && (
                                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    <User size={10} /> {entry.teacher.fullname}
                                  </p>
                                )}
                                {entry.room && (
                                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                    <MapPin size={10} /> {entry.room}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-semibold text-slate-300">Free</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTimetableView;
