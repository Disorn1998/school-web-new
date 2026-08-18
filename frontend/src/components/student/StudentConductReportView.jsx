import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Printer } from 'lucide-react';

const StudentConductReportView = () => {
  const [semesters, setSemesters] = useState([]);
  const [filterSemester, setFilterSemester] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await api.get('/admin/settings/semesters');
        setSemesters(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSemesters();
  }, []);

  const loadReport = async () => {
    if (!filterSemester) return;
    setIsLoading(true);
    setReportData(null);
    try {
      const res = await api.get(`/student/conduct/${user.id}`, {
        params: { semester_id: filterSemester }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setReportData({ not_found: true });
      } else {
        alert('Failed to load conduct report');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filterSemester) {
      loadReport();
    }
  }, [filterSemester]);

  const handlePrint = () => {
    window.print();
  };

  if (!reportData && !isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Conduct Report</h1>
          <p className="text-slate-500 mt-2">View your behavior and conduct evaluations</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-end gap-4 max-w-sm">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Select Semester</label>
            <select 
              value={filterSemester} 
              onChange={e => setFilterSemester(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Select...</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Group details by type
  const groupedDetails = {};
  if (reportData && !reportData.not_found && reportData.details) {
    reportData.details.forEach(d => {
      const type = d.category?.type || 'Other';
      if (!groupedDetails[type]) groupedDetails[type] = [];
      groupedDetails[type].push(d);
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in print:m-0 print:p-0 print:max-w-none">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Conduct Report</h1>
          <div className="mt-2 flex items-center gap-4">
            <select 
              value={filterSemester} 
              onChange={e => setFilterSemester(e.target.value)}
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm"
            >
              <option value="">Select Semester...</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          disabled={!reportData || reportData.not_found}
          className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 shadow-sm disabled:opacity-50"
        >
          <Printer size={18} /> Print Report
        </button>
      </div>

      {isLoading && <div className="text-center py-10 font-medium text-slate-500">Loading Report...</div>}

      {reportData?.not_found && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 p-6 rounded-2xl text-center font-bold">
          No conduct report found for the selected semester.
        </div>
      )}

      {reportData && !reportData.not_found && !isLoading && (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 w-full max-w-[210mm] mx-auto min-h-[297mm]">
          <div className="border-b-2 border-black pb-4 mb-6 flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-300">
              <span className="font-bold text-slate-400">LOGO</span>
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-black m-0">ST.MARKS AUSTRALIAN INTERNATIONAL SCHOOL</h2>
              <p className="text-xs text-black m-0">1294 Srinakarin Road, On-Nut , Suan Luang, Bangkok 10250, Thailand</p>
              <p className="text-xs text-black m-0">Tel : 02-300-5463 | Fax : 02-300-5465 | E-mail : info@stmarks.ac.th</p>
            </div>
          </div>

          <h3 className="text-center font-bold text-base mb-6 tracking-wide">STUDENT CONDUCT REPORT</h3>
          
          <div className="border border-black p-4 mb-8 flex flex-wrap text-sm gap-y-3">
            <div className="w-1/2 flex"><strong className="w-36">Student Number:</strong> <span>{reportData.student?.student_id || '-'}</span></div>
            <div className="w-1/2 flex"><strong className="w-36">Student Name:</strong> <span>{reportData.student?.fullname || '-'}</span></div>
            <div className="w-1/2 flex"><strong className="w-36">Level:</strong> <span>{reportData.student?.year?.year_name || '-'}</span></div>
            <div className="w-1/2 flex"><strong className="w-36">Academic Year:</strong> <span>{semesters.find(s => s.id == filterSemester)?.semester_name || '-'}</span></div>
            <div className="w-1/2 flex"><strong className="w-36">Evaluation Date:</strong> <span>{reportData.header?.evaluation_date || '-'}</span></div>
            <div className="w-1/2 flex"><strong className="w-36">Homeroom Teacher:</strong> <span>{reportData.header?.teacher?.fullname || reportData.header?.teacher?.first_name || '-'}</span></div>
          </div>

          <div className="mb-4 text-xs font-bold text-slate-600">
            Rating Scale: 4 = Excellent, 3 = Good, 2 = Satisfactory, 1 = Needs Improvement
          </div>

          <table className="w-full text-sm border-collapse border border-black table-fixed mb-8">
            <thead>
              <tr className="bg-slate-100 text-center">
                <th className="border border-black py-2 text-left px-4" style={{width: '80%'}}>BEHAVIOR & DEVELOPMENT CATEGORY</th>
                <th className="border border-black py-2" style={{width: '20%'}}>RATING (1-4)</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedDetails).map((type, i) => (
                <React.Fragment key={i}>
                  <tr className="bg-blue-50 font-bold text-slate-800">
                    <td className="border border-black px-4 py-2" colSpan="2">{type}</td>
                  </tr>
                  {groupedDetails[type].map((d, j) => (
                    <tr key={j}>
                      <td className="border border-black px-4 py-1.5 pl-8 text-sm">{d.category?.category}</td>
                      <td className="border border-black text-center px-4 py-1.5 font-bold text-slate-700">{d.score}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* General Comment */}
          <div className="border border-black min-h-[150px] p-4 relative">
            <strong className="block mb-2 text-sm uppercase">Homeroom Teacher's Comment:</strong>
            <p className="text-sm text-slate-800 whitespace-pre-wrap">
              {reportData.comment?.general_comment || <span className="text-slate-400 italic">No comment provided.</span>}
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-16 flex justify-between px-10">
            <div className="text-center">
              <div className="border-b border-black w-48 mb-2"></div>
              <div className="text-sm">Homeroom Teacher</div>
            </div>
            <div className="text-center">
              <div className="border-b border-black w-48 mb-2"></div>
              <div className="text-sm">Parent / Guardian</div>
            </div>
          </div>

          <p className="text-[10px] mt-16 text-center font-bold text-slate-400">NOTE: THIS DOCUMENT WAS ELECTRONICALLY GENERATED.</p>
        </div>
      )}
    </div>
  );
};

export default StudentConductReportView;
