import React, { useState } from 'react';
import axios from 'axios';
import { GraduationCap, CheckCircle } from 'lucide-react';

const ApplicationForm = () => {
  const [form, setForm] = useState({
    student_first_name: '',
    student_last_name: '',
    date_of_birth: '',
    grade_applying: 'Grade 1',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationNo, setApplicationNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/public/admissions', form);
      setApplicationNo(res.data.application_no);
      setIsSubmitted(true);
    } catch (err) {
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Received!</h2>
          <p className="text-slate-600 mb-6">Thank you for applying to St. Mark's International School. We have received your application.</p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <p className="text-sm text-slate-500 font-semibold mb-1">Your Application Number</p>
            <p className="text-2xl font-bold text-indigo-600 tracking-wider">{applicationNo}</p>
          </div>
          <p className="text-sm text-slate-500">Our admissions team will contact you shortly regarding the next steps and interview schedule.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">St. Mark's Admissions</h1>
          <p className="text-slate-500 mt-2">Application Form for Academic Year 2026-2027</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span> 
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                <input required type="text" value={form.student_first_name} onChange={e => setForm({...form, student_first_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                <input required type="text" value={form.student_last_name} onChange={e => setForm({...form, student_last_name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input required type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Grade Applying For</label>
                <select required value={form.grade_applying} onChange={e => setForm({...form, grade_applying: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  <option value="Kindergarten 1">Kindergarten 1</option>
                  <option value="Kindergarten 2">Kindergarten 2</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span> 
              Parent / Guardian Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input required type="email" value={form.parent_email} onChange={e => setForm({...form, parent_email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input required type="tel" value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="+66 81 234 5678" />
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">3</span> 
              Additional Notes
            </h3>
            <textarea 
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})} 
              rows="3" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Any special requirements, medical conditions, or questions?"
            ></textarea>
          </div>

          <div className="p-8 bg-slate-50 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
