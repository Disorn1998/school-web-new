import React, { useState } from 'react';
import { ShieldAlert, BookOpen, Link as LinkIcon, Download, ExternalLink, ChevronRight } from 'lucide-react';

const SchoolInformationView = () => {
  const [activeSubTab, setActiveSubTab] = useState('policies');

  const policies = [
    {
      id: 1,
      title: "Dress Code & Uniform",
      desc: "All students are required to wear the standard school uniform on Mondays through Thursdays. P.E. uniforms are strictly for Fridays.",
    },
    {
      id: 2,
      title: "Attendance & Punctuality",
      desc: "Students must arrive before 8:00 AM. Three late arrivals in a semester will result in a deduction of conduct points. Any absence requires a medical certificate or parent letter.",
    },
    {
      id: 3,
      title: "Electronic Devices",
      desc: "Mobile phones and tablets must be turned off and kept in lockers during instructional hours unless explicitly requested by a teacher for academic purposes.",
    },
    {
      id: 4,
      title: "Academic Integrity",
      desc: "Cheating, plagiarism, or any form of academic dishonesty will result in an immediate zero for the assignment and a disciplinary hearing.",
    }
  ];

  const curriculum = [
    {
      id: "sci-math",
      name: "Science & Mathematics Track",
      desc: "Intensive coursework focusing on Advanced Physics, Chemistry, Biology, and Calculus. Designed for students aiming for Engineering or Medical fields.",
      credits: 120,
    },
    {
      id: "arts-lang",
      name: "Arts & Languages Track",
      desc: "Emphasis on global communication, offering Mandarin, French, and intensive English Literature, along with Creative Arts.",
      credits: 110,
    },
    {
      id: "business",
      name: "Business & Technology Track",
      desc: "Prepares students for modern enterprises with classes in Accounting, Economics, Computer Science, and Entrepreneurship.",
      credits: 115,
    }
  ];

  const resources = [
    {
      id: 1,
      title: "Digital E-Library",
      desc: "Access over 10,000 academic journals, e-books, and research papers from anywhere.",
      link: "https://library.simpleschool.com",
      type: "Portal"
    },
    {
      id: 2,
      title: "Khan Academy For Schools",
      desc: "Supplementary video lessons and practice exercises for Mathematics and Sciences.",
      link: "https://khanacademy.org",
      type: "External"
    },
    {
      id: 3,
      title: "Past Exam Papers Vault",
      desc: "Download previous midterm and final examination papers for revision.",
      link: "#",
      type: "Archive"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-indigo-600" /> School Information Hub
        </h2>
        <p className="text-slate-500 text-sm mt-1">Access school policies, curriculum details, and helpful learning resources.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveSubTab('policies')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSubTab === 'policies' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            <ShieldAlert size={18}/> Policies & Rules
          </button>
          <button 
            onClick={() => setActiveSubTab('curriculum')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSubTab === 'curriculum' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            <BookOpen size={18}/> Curriculum Info
          </button>
          <button 
            onClick={() => setActiveSubTab('resources')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeSubTab === 'resources' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
          >
            <LinkIcon size={18}/> Online Resources
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 md:p-8 bg-white">
          
          {/* POLICIES TAB */}
          {activeSubTab === 'policies' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <ShieldAlert className="text-rose-500" /> Student Code of Conduct & Policies
              </h3>
              <div className="space-y-4">
                {policies.map(pol => (
                  <div key={pol.id} className="p-5 border border-slate-100 bg-slate-50 rounded-2xl hover:border-slate-200 transition-colors">
                    <h4 className="font-bold text-slate-800 text-lg mb-2">{pol.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{pol.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CURRICULUM TAB */}
          {activeSubTab === 'curriculum' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <BookOpen className="text-amber-500" /> Academic Tracks & Curriculum
              </h3>
              <div className="grid grid-cols-1 gap-5">
                {curriculum.map(track => (
                  <div key={track.id} className="p-6 border-2 border-slate-100 rounded-2xl hover:border-amber-200 transition-colors bg-white shadow-sm flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                      <BookOpen className="text-amber-500" size={28}/>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-lg">{track.name}</h4>
                      <p className="text-slate-500 text-sm mt-1">{track.desc}</p>
                    </div>
                    <div className="text-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <div className="text-2xl font-black text-indigo-600">{track.credits}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credits</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeSubTab === 'resources' && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <LinkIcon className="text-emerald-500" /> External Links & Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map(res => (
                  <a 
                    key={res.id} 
                    href={res.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group p-5 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all bg-white flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100">
                          {res.type}
                        </div>
                        <ExternalLink size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-emerald-600 transition-colors">{res.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{res.desc}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                      Access Resource <ChevronRight size={16} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SchoolInformationView;
