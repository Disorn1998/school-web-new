import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, Printer, BarChart2, Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentReportCardView = () => {
  const [semesters, setSemesters] = useState([]);
  const [filterSemester, setFilterSemester] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await api.get('/student/settings/semesters');
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
    try {
      const res = await api.get(`/student/academic-report/${user.id}`, {
        params: { semester_id: filterSemester }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load report');
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
          <h1 className="text-3xl font-bold text-slate-800">My School Report</h1>
          <p className="text-slate-500 mt-2">View your academic performance and assessment history</p>
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in print:m-0 print:p-0 print:max-w-none">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My School Report</h1>
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
          className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 shadow-sm"
        >
          <Printer size={18} /> Print Report
        </button>
      </div>

      {isLoading && <div className="text-center py-10 font-medium text-slate-500">Loading Report...</div>}

      {reportData && !isLoading && (
        <>
          {/* A4 Report View */}
          <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 w-full max-w-[210mm] mx-auto min-h-[297mm]">
            <div className="border-b-2 border-black pb-4 mb-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-300">
                <span className="font-bold text-slate-400">LOGO</span>
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-black m-0">THE OVERLAKE SCHOOL</h2>
                <p className="text-xs text-black m-0">1294 Srinakarin Road, On-Nut , Suan Luang, Bangkok 10250, Thailand</p>
                <p className="text-xs text-black m-0">Tel : 02-300-5463 | Fax : 02-300-5465 | E-mail : info@overlake.org</p>
              </div>
            </div>

            <h3 className="text-center font-bold text-base mb-4 tracking-wide">SCHOOL REPORT - STUDENT CONDUCT</h3>
            
            <div className="border border-black p-3 mb-6 flex flex-wrap text-sm gap-y-2">
              <div className="w-1/2 flex"><strong className="w-36">Student Number:</strong> <span>{reportData.student?.student_id || '-'}</span></div>
              <div className="w-1/2 flex"><strong className="w-36">Student Name:</strong> <span>{reportData.student?.fullname || '-'}</span></div>
              <div className="w-1/2 flex"><strong className="w-36">Level:</strong> <span>{reportData.student?.year?.year_name || '-'}</span></div>
              <div className="w-1/2 flex"><strong className="w-36">Academic Year:</strong> <span>{semesters.find(s => s.id == filterSemester)?.semester_name || '-'}</span></div>
              <div className="w-1/2 flex"><strong className="w-36">No. of Days Late:</strong> <span>{reportData.total_late || 0}</span></div>
              <div className="w-1/2 flex"><strong className="w-36">No. of Days Absent:</strong> <span>{reportData.total_absent || 0}</span></div>
            </div>

            <table className="w-full text-sm border-collapse border border-black table-fixed">
              <thead>
                <tr className="bg-slate-100 text-center">
                  <th className="border border-black py-2" style={{width: '30%'}}>ACADEMIC OUTCOME</th>
                  <th className="border border-black py-2" style={{width: '12%'}}>STUDENT GRADE</th>
                  <th className="border border-black py-2" style={{width: '12%'}}>CLASS AVERAGE</th>
                  <th className="border border-black py-2" style={{width: '46%'}}>TEACHER'S COMMENT</th>
                </tr>
              </thead>
              <tbody>
                {reportData.subjects?.map((sub, i) => (
                  <React.Fragment key={i}>
                    {/* Subject Header */}
                    <tr className="bg-blue-50 font-bold text-red-600">
                      <td className="border border-black px-2 py-1">{sub.subject}</td>
                      <td className="border border-black text-center px-2 py-1">{sub.grade > 0 ? sub.grade.toFixed(2) : ''}</td>
                      <td className="border border-black text-center px-2 py-1">{sub.class_avg > 0 ? sub.class_avg.toFixed(2) : ''}</td>
                      <td className="border border-black px-2 py-1"></td>
                    </tr>
                    {/* Assessment Details */}
                    {sub.assessments?.map((ast, j) => (
                      <tr key={j}>
                        <td className="border border-black px-2 py-1 pl-4 text-xs">
                          <div className="flex items-center justify-between">
                            <span>{ast.report_name}</span>
                            {ast.file_path && (
                              <a href={`http://localhost:3000${ast.file_path}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-800 print:hidden" title="Download Exam File">
                                <Download size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="border border-black text-center px-2 py-1 text-xs">{ast.full_score > 0 ? ((ast.score / ast.full_score) * 100).toFixed(2) : '-'}</td>
                        <td className="border border-black text-center px-2 py-1 text-xs">{ast.class_avg > 0 ? ast.class_avg.toFixed(2) : '-'}</td>
                        {j === 0 ? (
                          <td className="border border-black px-2 py-1 text-xs align-top" rowSpan={sub.assessments.length}>
                            {sub.exam_comment}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                <tr className="font-bold text-red-600 bg-slate-100">
                  <td className="border border-black px-2 py-2">OVERALL PERFORMANCE</td>
                  <td className="border border-black text-center px-2 py-2">{reportData.overall_gpa > 0 ? reportData.overall_gpa.toFixed(2) : '-'}</td>
                  <td className="border border-black text-center px-2 py-2">{reportData.overall_class_avg > 0 ? reportData.overall_class_avg.toFixed(2) : '-'}</td>
                  <td className="border border-black px-2 py-2"></td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] mt-2 font-bold text-slate-500">NOTE: THIS DOCUMENT WAS ELECTRONICALLY GENERATED.</p>
          </div>

          {/* Continuous Assessment Charts */}
          <div className="space-y-6 print:hidden mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="text-brand-500" /> Assessment History & Charts
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportData.subjects?.map((sub, i) => {
                if (!sub.assessments || sub.assessments.length === 0) return null;
                
                const labels = sub.assessments.map(a => a.test_date || a.report_name);
                const studentData = sub.assessments.map(a => a.full_score > 0 ? ((a.score / a.full_score) * 100) : 0);
                const classData = sub.assessments.map(a => a.class_avg || 0);

                const chartData = {
                  labels,
                  datasets: [
                    {
                      label: 'Grade (%)',
                      data: studentData,
                      backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    },
                    {
                      label: 'Class Avg (%)',
                      data: classData,
                      backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    }
                  ]
                };

                const options = {
                  responsive: true,
                  scales: { y: { beginAtZero: true, max: 100 } }
                };

                return (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-700 mb-4">{sub.subject}</h3>
                    <div className="h-64">
                      <Bar data={chartData} options={options} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentReportCardView;
