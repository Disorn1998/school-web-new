import React, { useState } from 'react';
import api from '../../utils/api';
import { UploadCloud, Download, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const StudentToolsManagement = () => {
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [exportYear, setExportYear] = useState('0');
  
  const [promoteConfig, setPromoteConfig] = useState({ action: 'all', student_id: '', source_year_id: '1', target_year_id: '2' });
  const [isPromoting, setIsPromoting] = useState(false);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file.");
    
    setIsImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('csv_file', file);

    try {
      const res = await api.post('/admin/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult({ type: 'success', msg: `Successfully imported ${res.data.records_saved} records!` });
      setFile(null);
    } catch (err) {
      setImportResult({ type: 'error', msg: err.response?.data?.error || 'Failed to import students' });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    window.open(`http://localhost:3000/api/admin/students/export?year_id=${exportYear}`, '_blank');
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure? This will update students' grade levels in the database.")) return;
    
    setIsPromoting(true);
    try {
      const payload = { ...promoteConfig };
      if (payload.action === 'individual') payload.student_id = parseInt(payload.student_id);
      if (payload.action === 'class') {
        payload.source_year_id = parseInt(payload.source_year_id);
        payload.target_year_id = parseInt(payload.target_year_id);
      }

      await api.post('/admin/students/promote', payload);
      alert('Promotion successful!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to promote students');
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-indigo-600" /> Student Data Tools
        </h2>
        <p className="text-slate-500 text-sm mt-1">Bulk import, export, and student promotion management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import CSV */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><UploadCloud className="text-emerald-500"/> Bulk Import (CSV)</h3>
          <p className="text-sm text-slate-500 mb-4">Upload a CSV file to insert or update student records. Required headers: StudentID, Fullname, Nickname, YearID, Email, Phone, EnrollmentYear, DateOfBirth, FoodLimitations, HealthLimitations, ParentID.</p>
          
          <form onSubmit={handleImport} className="space-y-4">
            <input 
              type="file" 
              accept=".csv"
              onChange={e => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <button 
              disabled={isImporting || !file}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
            >
              <UploadCloud size={18}/> {isImporting ? 'Importing...' : 'Upload & Process'}
            </button>
            {importResult && (
              <div className={`p-3 rounded-xl text-sm font-semibold ${importResult.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {importResult.msg}
              </div>
            )}
          </form>
        </div>

        {/* Export CSV */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Download className="text-blue-500"/> Export Data (CSV)</h3>
          <p className="text-sm text-slate-500 mb-4">Download student records as a CSV file for Excel processing or backup.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Filter by Year</label>
              <select value={exportYear} onChange={e => setExportYear(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl">
                <option value="0">All Years</option>
                <option value="1">Kindergarten 1</option>
                <option value="2">Kindergarten 2</option>
                <option value="3">Grade 1</option>
                <option value="4">Grade 2</option>
                <option value="5">Grade 3</option>
              </select>
            </div>
            <button 
              onClick={handleExport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              <Download size={18}/> Export to CSV
            </button>
          </div>
        </div>

        {/* Promote Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><TrendingUp className="text-amber-500"/> Promote Students</h3>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <span className="font-bold">Warning:</span> Promoting students will permanently update their Grade/Year level in the database. Use this feature carefully at the end of the academic year.
            </div>
          </div>

          <form onSubmit={handlePromote} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${promoteConfig.action === 'all' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-200'}`}>
                <input type="radio" name="promote_type" value="all" checked={promoteConfig.action === 'all'} onChange={() => setPromoteConfig({...promoteConfig, action: 'all'})} className="sr-only" />
                <div className="font-bold text-slate-800">Whole School</div>
                <div className="text-xs text-slate-500 mt-1">Automatically shift everyone up by 1 year according to the standard progression rule.</div>
              </label>

              <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${promoteConfig.action === 'class' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-200'}`}>
                <input type="radio" name="promote_type" value="class" checked={promoteConfig.action === 'class'} onChange={() => setPromoteConfig({...promoteConfig, action: 'class'})} className="sr-only" />
                <div className="font-bold text-slate-800">By Class/Year</div>
                <div className="text-xs text-slate-500 mt-1">Shift all students from a specific year to a new target year.</div>
              </label>

              <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${promoteConfig.action === 'individual' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-200'}`}>
                <input type="radio" name="promote_type" value="individual" checked={promoteConfig.action === 'individual'} onChange={() => setPromoteConfig({...promoteConfig, action: 'individual'})} className="sr-only" />
                <div className="font-bold text-slate-800">Individual</div>
                <div className="text-xs text-slate-500 mt-1">Select a specific student to promote or demote.</div>
              </label>
            </div>

            {promoteConfig.action === 'class' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold mb-1">From Year</label>
                  <input type="number" value={promoteConfig.source_year_id} onChange={e => setPromoteConfig({...promoteConfig, source_year_id: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">To Target Year</label>
                  <input type="number" value={promoteConfig.target_year_id} onChange={e => setPromoteConfig({...promoteConfig, target_year_id: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
              </div>
            )}

            {promoteConfig.action === 'individual' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold mb-1">Student DB ID</label>
                  <input type="number" value={promoteConfig.student_id} onChange={e => setPromoteConfig({...promoteConfig, student_id: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" placeholder="e.g. 1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">To Target Year</label>
                  <input type="number" value={promoteConfig.target_year_id} onChange={e => setPromoteConfig({...promoteConfig, target_year_id: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
                </div>
              </div>
            )}

            <div className="flex justify-end">
               <button 
                type="submit"
                disabled={isPromoting}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <TrendingUp size={18}/> {isPromoting ? 'Processing...' : 'Execute Promotion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentToolsManagement;
