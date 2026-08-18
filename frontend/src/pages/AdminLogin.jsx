import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, User, Lock, Shield } from 'lucide-react';

const AdminLogin = () => {
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

    // Hardcode role to 'admin' so the backend receives 'staff'
    const result = await login(username, password, 'admin');
    
    if (result.success) {
      if (['staff', 'super', 'admin', 'officer', 'teacher'].includes(result.role)) {
        navigate('/admin');
      } else {
        setError('Unauthorized access for this role.');
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dark theme decorative background blobs for Admin */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 transition-all duration-300 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3">
              <Shield className="text-white w-10 h-10 -rotate-3" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 mt-2">Sign in to manage the system</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm flex items-center justify-center animate-fade-in">
                {error}
              </div>
            )}

            <div className="mb-6 space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-300 uppercase tracking-wider text-center font-bold mb-2">⭐ Auto Fill Demo Login</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('password'); }}
                  className="py-2.5 px-3 bg-brand-600 hover:bg-brand-500 rounded-lg text-sm text-white font-bold transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('teacher1'); setPassword('password'); }}
                  className="py-2.5 px-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white font-bold transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Teacher
                </button>
              </div>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OR ENTER CREDENTIALS</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-500/30 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Access Dashboard
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Students & Parents</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Check grades and homework</p>
                </div>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-brand-500/20"
                >
                  Student Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
