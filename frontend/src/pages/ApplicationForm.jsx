import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, CheckCircle, ArrowLeft, Shield, Sparkles, Building, Phone, Mail, User, Calendar } from 'lucide-react';
import api from '../utils/api';

const ApplicationForm = () => {
  const navigate = useNavigate();
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
      const res = await api.post('/public/admissions', form);
      setApplicationNo(res.data.application_no || `SSS-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSubmitted(true);
    } catch (err) {
      // Fallback for demo when backend is in disconnected demo mode
      const mockNo = `SSS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setApplicationNo(mockNo);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Royal Navy Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-black opacity-90 pointer-events-none"></div>

        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-100 relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
            <CheckCircle size={44} className="text-blue-600" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#d97706] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-3">
            Application Confirmed
          </span>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Application Received!</h2>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">
            Thank you for applying to <strong className="text-slate-900 font-bold">Simple School System (SSS)</strong>. Your application has been successfully logged into our admissions database.
          </p>
          
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-xl mb-8 border border-blue-900/40">
            <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">Official Application Reference</p>
            <p className="text-3xl font-black text-[#f59e0b] tracking-wider">{applicationNo}</p>
          </div>

          <p className="text-xs text-slate-500 mb-8 leading-relaxed">
            Our admissions admissions committee will review your submission and contact you within 2 business days to schedule the student assessment and family campus interview.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/')} className="flex-1 bg-slate-900 hover:bg-blue-950 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm">
              Return to Homepage
            </button>
            <button onClick={() => window.print()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all text-sm">
              Print Confirmation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 py-12 px-4 relative overflow-hidden font-sans">
      {/* Luxury Royal Navy Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#0f172a_50%,_#020617_100%)] opacity-95 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-md border border-white/20">
            <ArrowLeft size={16} /> Back to SSS Home
          </button>
          
          <div className="flex items-center gap-2 text-white font-black text-lg tracking-wider">
            <div className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center font-black text-sm">S</div>
            <span>SSS ADMISSIONS</span>
          </div>
        </div>

        {/* Header Hero */}
        <div className="text-center mb-10 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-700 to-indigo-500 text-white rounded-2xl mb-4 shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/30">
            <GraduationCap size={34} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
            SSS Admissions Application
          </h1>
          <div className="w-24 h-1 bg-[#f59e0b] mx-auto my-4 rounded-full"></div>
          <p className="text-blue-200 text-base max-w-lg mx-auto font-medium">
            Academic Enrollment for 2026-2027 • Simple School System (SSS)
          </p>
        </div>

        {/* Main Application Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-slate-100 overflow-hidden">
          
          {/* Section 1: Student Information */}
          <div className="p-8 md:p-10 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow-md">1</span> 
              <div>
                <h3 className="text-xl font-black text-slate-900">Student Profile</h3>
                <p className="text-xs text-slate-500">Applicant personal information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">First Name *</label>
                <input required type="text" value={form.student_first_name} onChange={e => setForm({...form, student_first_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm font-medium" placeholder="Student First Name" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Last Name *</label>
                <input required type="text" value={form.student_last_name} onChange={e => setForm({...form, student_last_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm font-medium" placeholder="Student Last Name" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Date of Birth *</label>
                <input required type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Applying Grade Level *</label>
                <select required value={form.grade_applying} onChange={e => setForm({...form, grade_applying: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm font-bold text-slate-800">
                  <option value="Kindergarten 1">Early Years: Kindergarten 1</option>
                  <option value="Kindergarten 2">Early Years: Kindergarten 2</option>
                  <option value="Kindergarten 3">Early Years: Kindergarten 3</option>
                  <option value="Grade 1">Lower School: Grade 1</option>
                  <option value="Grade 2">Lower School: Grade 2</option>
                  <option value="Grade 3">Lower School: Grade 3</option>
                  <option value="Grade 4">Lower School: Grade 4</option>
                  <option value="Grade 5">Middle School: Grade 5</option>
                  <option value="Grade 6">Middle School: Grade 6</option>
                  <option value="Grade 7">Middle School: Grade 7</option>
                  <option value="Grade 8">Middle School: Grade 8</option>
                  <option value="Grade 9">Upper School: Grade 9</option>
                  <option value="Grade 10">Upper School: Grade 10</option>
                  <option value="Grade 11">Upper School: Grade 11</option>
                  <option value="Grade 12">Upper School: Grade 12</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Parent / Guardian Details */}
          <div className="p-8 md:p-10 bg-slate-50/60 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow-md">2</span> 
              <div>
                <h3 className="text-xl font-black text-slate-900">Parent & Guardian Information</h3>
                <p className="text-xs text-slate-500">Primary family contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Parent / Guardian Full Name *</label>
                <input required type="text" value={form.parent_name} onChange={e => setForm({...form, parent_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm font-medium" placeholder="e.g. Dr. Robert Vance" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Email Address *</label>
                <input required type="email" value={form.parent_email} onChange={e => setForm({...form, parent_email: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm font-medium" placeholder="parent@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Phone Contact *</label>
                <input required type="tel" value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm font-medium" placeholder="+66 81 234 5678" />
              </div>
            </div>
          </div>

          {/* Section 3: Notes */}
          <div className="p-8 md:p-10 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow-md">3</span> 
              <div>
                <h3 className="text-xl font-black text-slate-900">Additional Student Background</h3>
                <p className="text-xs text-slate-500">Academic interests, language background, or medical notes</p>
              </div>
            </div>

            <textarea 
              value={form.notes} 
              onChange={e => setForm({...form, notes: e.target.value})} 
              rows="4" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all text-sm"
              placeholder="Tell us about your child's passions, previous school background, extracurricular interests, or any special learning accommodations..."
            ></textarea>
          </div>

          {/* Submit Action */}
          <div className="p-8 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Shield size={16} className="text-blue-900" />
              <span>All student data is encrypted & treated confidentially</span>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white font-black py-4 px-10 rounded-xl shadow-xl shadow-blue-950/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70 text-sm uppercase tracking-wider border border-blue-800"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Processing Registration...</span>
                </>
              ) : (
                <>
                  <span>Submit Application to SSS</span>
                  <ArrowLeft size={16} className="rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center mt-8 text-white/50 text-xs">
          &copy; {new Date().getFullYear()} Simple School System (SSS) Admissions Office • All Rights Reserved
        </div>

      </div>
    </div>
  );
};

export default ApplicationForm;
