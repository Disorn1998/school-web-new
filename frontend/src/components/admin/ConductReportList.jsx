import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, Plus, Edit2, Calendar } from 'lucide-react';
import ConductScoreEntry from './ConductScoreEntry';

const ConductReportList = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newReport, setNewReport] = useState({ semester_id: '', year_id: '', evaluation_date: '' });
  
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);

  const [activeHeaderId, setActiveHeaderId] = useState(null);

  useEffect(() => {
    fetchDropdowns();
    loadReports();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [sRes, yRes] = await Promise.all([
        api.get('/admin/settings/semesters'),
        api.get('/admin/settings/years')
      ]);
      setSemesters(sRes.data || []);
      setYears(yRes.data || []);
      
      if (sRes.data?.length > 0) setNewReport(prev => ({...prev, semester_id: sRes.data[0].id}));
      if (yRes.data?.length > 0) setNewReport(prev => ({...prev, year_id: yRes.data[0].id}));
      setNewReport(prev => ({...prev, evaluation_date: new Date().toISOString().split('T')[0]}));
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/conduct');
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newReport.semester_id || !newReport.year_id || !newReport.evaluation_date) {
      alert("Please fill all fields");
      return;
    }
    try {
      await api.post('/admin/conduct/header', {
        semester_id: parseInt(newReport.semester_id),
        year_id: parseInt(newReport.year_id),
        evaluation_date: newReport.evaluation_date
      });
      setShowCreate(false);
      loadReports();
    } catch (err) {
      console.error(err);
      alert('Failed to create conduct report');
    }
  };

  if (activeHeaderId) {
    return <ConductScoreEntry headerId={activeHeaderId} onBack={() => setActiveHeaderId(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Conduct Reports</h1>
          <p className="text-slate-500 mt-2">Manage student behavior evaluations (Homeroom Teachers)</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 transition"
        >
          <Plus size={18} /> New Report
        </button>
      </div>

      {showCreate && (
        <div className="bg-brand-50 p-6 rounded-2xl border border-brand-200 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1">Semester</label>
            <select 
              value={newReport.semester_id}
              onChange={e => setNewReport({...newReport, semester_id: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200"
            >
              <option value="">Select...</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1">Class (Year)</label>
            <select 
              value={newReport.year_id}
              onChange={e => setNewReport({...newReport, year_id: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200"
            >
              <option value="">Select...</option>
              {years.map(y => <option key={y.id} value={y.id}>{y.year_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Evaluation Date</label>
            <input 
              type="date" 
              value={newReport.evaluation_date}
              onChange={e => setNewReport({...newReport, evaluation_date: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold">Save</button>
            <button onClick={() => setShowCreate(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 font-medium text-slate-500">Loading reports...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-brand-400 transition cursor-pointer shadow-sm" onClick={() => setActiveHeaderId(r.id)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xl text-slate-800">{r.year?.year_name}</h4>
                  <p className="text-sm font-medium text-brand-600 mt-1">{r.semester?.semester_name}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <FileText size={20} />
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-slate-500 items-center">
                <span className="flex items-center gap-1"><Calendar size={14}/> {r.evaluation_date}</span>
                <span className="font-semibold text-slate-600">By: {r.teacher?.first_name || 'Teacher'}</span>
              </div>
            </div>
          ))}
          {reports.length === 0 && !showCreate && (
            <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
              No conduct reports found. Click 'New Report' to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConductReportList;
