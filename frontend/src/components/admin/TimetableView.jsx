import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, Save, Edit2, User, MapPin, Search } from 'lucide-react';
import { getClassName } from '../../utils/constants';

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' }
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimetableView = () => {
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState('1'); // Default Year 1
  const [selectedSemester, setSelectedSemester] = useState('');
  
  const [timetable, setTimetable] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { day, period }
  const [formData, setFormData] = useState({ subject: '', teacher_id: '', room: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSemester && selectedYear) {
      fetchTimetable();
    }
  }, [selectedSemester, selectedYear]);

  const fetchInitialData = async () => {
    try {
      const [semRes, teachersRes] = await Promise.all([
        api.get('/admin/settings/semesters'),
        api.get('/admin/teachers')
      ]);
      setSemesters(semRes.data || []);
      setTeachers(teachersRes.data || []);
      
      const activeSem = (semRes.data || []).find(s => s.status === 'ACTIVE');
      if (activeSem) setSelectedSemester(activeSem.id.toString());
      else if (semRes.data?.length > 0) setSelectedSemester(semRes.data[0].id.toString());
    } catch (error) {
      console.error('Failed to fetch config', error);
    }
  };

  const fetchTimetable = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/timetable?year_id=${selectedYear}&semester_id=${selectedSemester}`);
      const data = response.data || [];
      
      // Convert to map for easy lookup: { 'day-period': entry }
      const map = {};
      data.forEach(entry => {
        map[`${entry.day_of_week}-${entry.period}`] = entry;
      });
      setTimetable(map);
    } catch (error) {
      console.error('Failed to fetch timetable', error);
      setTimetable({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellClick = (day, period) => {
    const key = `${day}-${period}`;
    const existing = timetable[key] || { subject: '', teacher_id: '', room: '' };
    
    setEditingCell({ day, period });
    setFormData({
      subject: existing.subject,
      teacher_id: existing.teacher_id ? existing.teacher_id.toString() : '',
      room: existing.room || ''
    });
    setIsModalOpen(true);
  };

  const handleModalSave = (e) => {
    e.preventDefault();
    const key = `${editingCell.day}-${editingCell.period}`;
    
    // Find teacher name
    let teacherObj = null;
    if (formData.teacher_id) {
      teacherObj = teachers.find(t => t.id.toString() === formData.teacher_id);
    }

    setTimetable(prev => ({
      ...prev,
      [key]: {
        day_of_week: editingCell.day,
        period: editingCell.period,
        subject: formData.subject,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null,
        room: formData.room,
        teacher: teacherObj
      }
    }));
    setIsModalOpen(false);
  };

  const handleModalClear = () => {
    const key = `${editingCell.day}-${editingCell.period}`;
    const newMap = { ...timetable };
    delete newMap[key];
    setTimetable(newMap);
    setIsModalOpen(false);
  };

  const saveTimetable = async () => {
    setIsSaving(true);
    try {
      const entries = Object.values(timetable).map(t => ({
        day_of_week: t.day_of_week,
        period: t.period,
        subject: t.subject,
        teacher_id: t.teacher_id,
        room: t.room
      }));

      await api.post('/admin/timetable/bulk', {
        year_id: parseInt(selectedYear),
        semester_id: parseInt(selectedSemester),
        entries: entries
      });
      alert('Timetable saved successfully!');
    } catch (error) {
      console.error('Failed to save timetable', error);
      alert('Failed to save timetable.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-brand-500" /> Class Timetables
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage weekly schedules for each class</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <select 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            <option value="" disabled>Select Semester</option>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>{s.semester_name}</option>
            ))}
          </select>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            {[...Array(15)].map((_, i) => (
              <option key={i+1} value={i+1}>{getClassName(i+1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Schedule: {getClassName(selectedYear)}</h3>
          <button
            onClick={saveTimetable}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-400 shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={16} />}
            Save Timetable
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-slate-400 font-medium flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin mb-3"></div>
            Loading timetable...
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
                          className="p-0 border border-slate-200 relative group cursor-pointer hover:bg-slate-50 transition-colors h-24 align-top w-40"
                          onClick={() => handleCellClick(day.id, period)}
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
                              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                                <Edit2 size={12} /> Add
                              </span>
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">
                {DAYS.find(d => d.id === editingCell?.day)?.name} - Period {editingCell?.period}
              </h3>
            </div>
            
            <form onSubmit={handleModalSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={formData.subject} 
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  placeholder="e.g. Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Teacher</label>
                <select 
                  value={formData.teacher_id} 
                  onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer"
                >
                  <option value="">-- No Teacher Assigned --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullname} ({t.group})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room</label>
                <input 
                  type="text" 
                  value={formData.room} 
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none" 
                  placeholder="e.g. Room 101"
                />
              </div>

              <div className="pt-4 flex justify-between gap-3">
                <button type="button" onClick={handleModalClear} className="py-2.5 px-4 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                  Clear
                </button>
                <div className="flex gap-2 flex-1 justify-end">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="py-2.5 px-4 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="py-2.5 px-5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all">
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TimetableView;
