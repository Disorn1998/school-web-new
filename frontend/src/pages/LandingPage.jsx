import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldAlert, GraduationCap, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      
      {/* Background Video (YouTube Embed acting as background) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 bg-slate-900">
        <iframe 
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80"
          src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&controls=0&loop=1&playlist=ScMzIvxBSi4&showinfo=0&rel=0&modestbranding=1" 
          title="Nature Drone Background" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>

      {/* Dark Overlay to make text readable */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-900/50 z-10"></div>

      {/* Main Content Container */}
      <div className="relative z-20 h-full flex flex-col">
        
        {/* Navigation Bar */}
        <nav className="w-full px-6 py-4 md:px-12 md:py-6 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <GraduationCap size={28} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">S.S.S.</h1>
              <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest leading-none">Simple School System</p>
            </div>
          </div>

          <div className="hidden lg:flex gap-4 items-center">
            <button onClick={() => navigate('/apply')} className="px-5 py-2.5 rounded-full text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-2 text-sm">
              <UserPlus size={18} /> Online Admission
            </button>
            <button onClick={() => navigate('/admin/login')} className="px-5 py-2.5 rounded-full text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-2 text-sm">
              <ShieldAlert size={18} /> Staff Portal
            </button>
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-600/30 active:scale-95 flex items-center gap-2 text-sm">
              <LogIn size={18} /> Student & Parent Login
            </button>
          </div>
          
          {/* Mobile Menu Button - Just redirects to login for now */}
          <div className="lg:hidden">
            <button onClick={() => navigate('/login')} className="p-3 rounded-full bg-brand-600 text-white shadow-lg active:scale-95">
              <LogIn size={20} />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-sm mb-6 backdrop-blur-md animate-fade-in">
            ?? Welcome to the Future of Education
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white max-w-5xl leading-tight mb-6 animate-fade-in-up drop-shadow-2xl">
            Empowering Minds,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-purple-300 drop-shadow-none">
              Transforming Futures.
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl font-medium mb-10 animate-fade-in-up drop-shadow-lg" style={{animationDelay: '0.1s'}}>
            A fully integrated school management system designed to connect students, parents, and teachers seamlessly in one unified platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up w-full sm:w-auto px-4 sm:px-0" style={{animationDelay: '0.2s'}}>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-brand-700 font-bold text-lg hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3">
              Access Portal <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/apply')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-600/30 hover:bg-brand-600/50 border border-white/20 text-white font-bold text-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-3">
              Apply Now
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-6 text-center text-white/70 text-sm font-medium bg-gradient-to-t from-black/80 to-transparent">
          &copy; {new Date().getFullYear()} Simple School System. Designed for educational excellence.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
