import React, { useState, useEffect } from 'react';
import { X, Quote } from 'lucide-react';

const PrincipalMessagePopup = ({ studentName }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the message
    const hasSeenMessage = localStorage.getItem(`principal_msg_seen_${studentName}`);
    if (!hasSeenMessage) {
      // Delay popup slightly for a smooth entrance
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [studentName]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(`principal_msg_seen_${studentName}`, 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-white/50 hover:bg-slate-100 rounded-full p-2 transition-all z-10"
        >
          <X size={24} />
        </button>

        {/* Left Image Section */}
        <div className="w-full md:w-2/5 h-48 md:h-auto bg-slate-100 relative">
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600" 
            alt="Principal" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
            <div className="text-white">
              <div className="font-bold text-lg">Dr. Sarah Jenkins</div>
              <div className="text-xs text-slate-200">School Principal</div>
            </div>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="w-full md:w-3/5 p-8 flex flex-col justify-center bg-slate-50">
          <Quote className="text-indigo-200 w-12 h-12 mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Welcome to a New Academic Year!
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Dear <span className="font-bold text-indigo-600">{studentName}</span>, <br/><br/>
            On behalf of the faculty and staff, I am thrilled to welcome you back to campus. 
            Our school is a place of rigorous academic pursuit and profound personal growth. 
            This portal has been redesigned to empower you with the tools you need to succeed. 
            Embrace the challenges ahead, support your peers, and let's make this year extraordinary.
          </p>
          <button 
            onClick={handleClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Enter Student Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrincipalMessagePopup;
