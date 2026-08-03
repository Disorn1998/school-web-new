import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, Search, Printer } from 'lucide-react';

const MonthlyAttendanceReport = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return String(d.getMonth() + 1).padStart(2, '0');
  });
  const [reportYearStr, setReportYearStr] = useState(() => {
    return String(new Date().getFullYear());
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/attendance/report?year_id=${selectedYear}&month=${reportMonth}&year=${reportYearStr}`);
      setReportData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch monthly report', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportMonth, reportYearStr, selectedYear]);

  // Generate days array for the selected month/year
  const getDaysInMonth = (month, year) => {
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const daysCount = getDaysInMonth(reportMonth, reportYearStr);
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  const getCellSymbol = (status) => {
    switch (status) {
      case 'ontime': return <span className="text-emerald-600 font-bold">P</span>;
      case 'late': return <span className="text-orange-500 font-bold">L</span>;
      case 'absent': return <span className="text-red-500 font-bold">A</span>;
      default: return <span className="text-slate-300">-</span>;
    }
  };

  return (
    <div id="monthly-report-container" className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="block w-32 py-2 pl-3 pr-8 border-none rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-slate-50 cursor-pointer"
          >
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
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
          <Printer size={18} /> Print Monthly Report
        </button>
      </div>

      <div id="monthly-report" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">
        <div className="p-6 border-b border-slate-100 hidden print:block text-center">
          <h2 className="text-2xl font-bold text-slate-800">Monthly Attendance Report</h2>
          <p className="text-slate-600 font-semibold">{reportMonth}/{reportYearStr} {selectedYear ? `- Year ${selectedYear}` : ''}</p>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse min-w-[800px] text-xs print:text-[10px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider border border-slate-200 sticky left-0 bg-slate-50 z-10 w-48 shadow-[1px_0_0_0_#e2e8f0] print:shadow-none">Student Name</th>
                {daysArray.map(d => (
                  <th key={d} className="px-2 py-3 font-bold text-slate-500 border border-slate-200 text-center w-8">{d}</th>
                ))}
                <th className="px-2 py-3 font-bold text-emerald-600 border border-slate-200 text-center">P</th>
                <th className="px-2 py-3 font-bold text-orange-500 border border-slate-200 text-center">L</th>
                <th className="px-2 py-3 font-bold text-red-500 border border-slate-200 text-center">A</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={daysCount + 4} className="px-6 py-12 text-center text-slate-400">Loading report...</td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((row) => {
                  let p = 0, l = 0, a = 0;
                  
                  return (
                    <tr key={row.student.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2 font-semibold text-slate-700 border border-slate-200 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0] print:shadow-none whitespace-nowrap">
                        {row.student.fullname}
                      </td>
                      {daysArray.map(d => {
                        const dateKey = `${reportYearStr}-${reportMonth}-${String(d).padStart(2, '0')}`;
                        const status = row.attendance[dateKey];
                        if (status === 'ontime') p++;
                        else if (status === 'late') l++;
                        else if (status === 'absent') a++;
                        
                        return (
                          <td key={d} className="px-1 py-2 border border-slate-200 text-center">
                            {getCellSymbol(status)}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 border border-slate-200 text-center font-bold text-emerald-600 bg-emerald-50/30">{p}</td>
                      <td className="px-2 py-2 border border-slate-200 text-center font-bold text-orange-500 bg-orange-50/30">{l}</td>
                      <td className="px-2 py-2 border border-slate-200 text-center font-bold text-red-500 bg-red-50/30">{a}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={daysCount + 4} className="px-6 py-12 text-center text-slate-500">No data found for this month.</td>
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
          #monthly-report, #monthly-report * { visibility: visible !important; }
          #monthly-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
};

export default MonthlyAttendanceReport;
