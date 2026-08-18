import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User, Lock, GraduationCap } from 'lucide-react';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Hardcode role to 'student' so the backend handles it properly
    const result = await login(username, password, 'student');
    
    if (result.success) {
      if (['student', 'parent'].includes(result.role)) {
        navigate('/student');
      } else {
        setError('Unauthorized access for this portal.');
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 transition-all duration-300 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3">
              <GraduationCap className="text-white w-10 h-10 -rotate-3" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Student Portal</h1>
            <p className="text-slate-500 mt-2">Sign in as Parent or Student</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            {/* DEMO MODE QUICK LOGIN BUTTONS */}
            <div className="mb-6 space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider text-center font-semibold">Demo Quick Login</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setUsername('STU20261'); setPassword('password'); }}
                  className="py-2 px-3 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-700 hover:bg-brand-100 transition-colors shadow-sm font-medium"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('parent1'); setPassword('password'); }}
                  className="py-2 px-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors shadow-sm font-medium"
                >
                  Parent
                </button>
              </div>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-medium tracking-wide">Or Enter Credentials</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Username (Student ID / Parent Phone)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">School Staff?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Teachers and admins login here</p>
                </div>
                <button 
                  onClick={() => navigate('/admin/login')} 
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          © 2026 Simple School System
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
