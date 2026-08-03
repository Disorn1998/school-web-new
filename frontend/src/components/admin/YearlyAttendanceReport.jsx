import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, Printer } from 'lucide-react';

const YearlyAttendanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  
  const [reportYearStr, setReportYearStr] = useState(() => {
    return String(new Date().getFullYear());
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/attendance/report/yearly?year_id=${selectedYear}&year=${reportYearStr}`);
      setReportData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch yearly report', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportYearStr, selectedYear]);

  const monthsArray = [
    { num: '01', name: 'Jan' },
    { num: '02', name: 'Feb' },
    { num: '03', name: 'Mar' },
    { num: '04', name: 'Apr' },
    { num: '05', name: 'May' },
    { num: '06', name: 'Jun' },
    { num: '07', name: 'Jul' },
    { num: '08', name: 'Aug' },
    { num: '09', name: 'Sep' },
    { num: '10', name: 'Oct' },
    { num: '11', name: 'Nov' },
    { num: '12', name: 'Dec' },
  ];

  return (
    <div id="yearly-report-container" className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={reportYearStr}
            onChange={(e) => setReportYearStr(e.target.value)}
            className="block w-28 py-2 pl-3 pr-8 border-none rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50 cursor-pointer"
          >
            {[...Array(10)].map((_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="block w-36 py-2 pl-3 pr-8 border-none rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50 cursor-pointer"
          >
            <option value="">All Classes</option>
            {[...Array(15)].map((_, i) => (
              <option key={i+1} value={i+1}>Year {i+1}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all"
        >
          <Printer size={18} /> Print Yearly Report
        </button>
      </div>

      <div id="yearly-report" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">
        <div className="p-6 border-b border-slate-100 hidden print:block text-center">
          <h2 className="text-2xl font-bold text-slate-800">Yearly Attendance Report</h2>
          <p className="text-slate-600 font-semibold">{reportYearStr} {selectedYear ? `- Year ${selectedYear}` : ''}</p>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse min-w-[1000px] text-xs print:text-[10px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider border border-slate-200 sticky left-0 bg-slate-50 z-10 w-48 shadow-[1px_0_0_0_#e2e8f0] print:shadow-none">Student Name</th>
                {monthsArray.map(m => (
                  <th key={m.num} className="px-2 py-3 font-bold text-slate-500 border border-slate-200 text-center w-16">{m.name}</th>
                ))}
                <th className="px-2 py-3 font-bold text-slate-700 border border-slate-200 text-center bg-slate-100">Total Year</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-slate-400">Loading report...</td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((row) => {
                  let totalP = 0, totalL = 0, totalA = 0;
                  
                  return (
                    <tr key={row.student.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-700 border border-slate-200 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0] print:shadow-none whitespace-nowrap">
                        {row.student.fullname || 'Unknown Student'}
                      </td>
                      {monthsArray.map(m => {
                        const stats = row.months[m.num] || { present: 0, late: 0, absent: 0 };
                        totalP += stats.present;
                        totalL += stats.late;
                        totalA += stats.absent;
                        
                        return (
                          <td key={m.num} className="px-1 py-2 border border-slate-200 text-center">
                            {(stats.present === 0 && stats.late === 0 && stats.absent === 0) ? (
                              <span className="text-slate-300">-</span>
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-0.5 text-[10px]">
                                <span className="font-bold text-emerald-600">P:{stats.present}</span>
                                {stats.late > 0 && <span className="font-bold text-orange-500">L:{stats.late}</span>}
                                {stats.absent > 0 && <span className="font-bold text-red-500">A:{stats.absent}</span>}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 border border-slate-200 text-center bg-slate-50">
                        <div className="flex justify-center gap-2 font-bold">
                          <span className="text-emerald-600">P:{totalP}</span>
                          <span className="text-orange-500">L:{totalL}</span>
                          <span className="text-red-500">A:{totalA}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="px-6 py-12 text-center text-slate-500">No data found for this year.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 1cm; }
          body * { visibility: hidden !important; }
          #yearly-report, #yearly-report * { visibility: visible !important; }
          #yearly-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
};

export default YearlyAttendanceReport;
