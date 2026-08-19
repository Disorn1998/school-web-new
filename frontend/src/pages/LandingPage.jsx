import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topUtilityLinks = ["Students", "Alumni", "Careers", "Give", "Contact"];
  
  const mainNavLinks = [
    { name: "About Us", links: ["Our Mission", "Leadership", "Diversity & Inclusion", "Campus"] },
    { name: "Admission", links: ["How to Apply", "Tuition & Financial Aid", "Visit SSS", "FAQ"] },
    { name: "Academics", links: ["Curriculum", "Library", "Technology", "College Counseling"] },
    { name: "Arts", links: ["Visual Arts", "Performing Arts", "Music", "Theater"] },
    { name: "Athletics", links: ["Teams", "Schedules", "Facilities", "Coaches"] },
    { name: "Student Life", links: ["Clubs", "Community Service", "Outdoor Education", "Events"] }
  ];

  return (
    <div className="w-full min-h-screen font-sans bg-white text-slate-800">
      
      {/* Utility Top Bar */}
      <div className="hidden md:flex w-full bg-[#00523e] text-white py-1.5 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50 relative">
        {topUtilityLinks.map(link => (
          <span key={link} className="hover:text-[#f2a900] cursor-pointer transition-colors">{link}</span>
        ))}
        <div className="flex items-center gap-2 ml-4">
          <button onClick={() => navigate('/login')} className="flex items-center gap-1 hover:text-[#f2a900] transition-colors"><Lock size={12}/> Portals</button>
        </div>
        <Search size={14} className="cursor-pointer hover:text-[#f2a900] ml-2" />
      </div>

      {/* Main Navigation */}
      <nav className={`w-full z-40 transition-all duration-300 ${isScrolled ? 'fixed top-0 bg-white shadow-md py-4' : 'absolute top-8 bg-transparent py-6'} px-8 flex justify-between items-center`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl ${isScrolled ? 'bg-[#00523e] text-white' : 'bg-white text-[#00523e]'}`}>
            S
          </div>
          <span className={`text-3xl font-black tracking-tight uppercase ${isScrolled ? 'text-[#00523e]' : 'text-white drop-shadow-md'}`}>
            SSS
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 h-full">
          {mainNavLinks.map((nav) => (
            <div 
              key={nav.name} 
              className="relative group h-full py-2"
              onMouseEnter={() => setActiveDropdown(nav.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className={`font-bold uppercase tracking-wider text-[13px] flex items-center gap-1 cursor-pointer transition-colors ${isScrolled ? 'text-[#00523e] hover:text-[#f2a900]' : 'text-white drop-shadow-md hover:text-[#f2a900]'}`}>
                {nav.name} <ChevronDown size={14} className="opacity-50" />
              </span>
              
              {/* Dropdown Menu */}
              <div className={`absolute top-full left-0 mt-4 w-56 bg-[#00523e] text-white shadow-2xl border-t-4 border-[#f2a900] transition-all duration-200 transform origin-top ${activeDropdown === nav.name ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
                <div className="py-2 flex flex-col">
                  {nav.links.map(sublink => (
                    <span key={sublink} className="px-5 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:text-[#f2a900] cursor-pointer transition-colors">
                      {sublink}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-white px-6 py-2.5 ml-2 font-bold uppercase tracking-wider text-[13px] hover:bg-[#d89600] transition-colors shadow-md">
            Inquire
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden text-white z-50 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} className="text-[#00523e]" /> : <Menu size={28} className={isScrolled ? "text-[#00523e]" : "text-white"} />}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col pt-24 px-8 pb-8 overflow-y-auto">
          <div className="flex flex-col gap-6 text-[#00523e] font-black text-2xl uppercase tracking-wider">
            {mainNavLinks.map(nav => (
              <div key={nav.name} className="flex flex-col border-b border-gray-100 pb-4">
                <span className="flex justify-between items-center mb-2">{nav.name} <ChevronDown size={20}/></span>
                <div className="flex flex-col gap-3 pl-4 mt-2">
                  {nav.links.map(sublink => (
                    <span key={sublink} className="text-sm text-gray-500 font-bold hover:text-[#f2a900]">{sublink}</span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-4 mt-4 text-lg font-bold text-gray-500">
               <span onClick={() => navigate('/login')} className="flex items-center gap-2 text-[#00523e]"><Lock size={18}/> Portals</span>
               <span onClick={() => navigate('/apply')} className="text-[#f2a900]">Inquire / Apply</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Video Background */}
      <div className="relative w-full h-[90vh] overflow-hidden flex items-end pb-24 px-8 md:px-16">
        <div className="absolute inset-0 z-0 bg-[#00523e]">
          <iframe 
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80 mix-blend-screen"
            src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&controls=0&loop=1&playlist=ScMzIvxBSi4&showinfo=0&rel=0&modestbranding=1" 
            title="SSS Background" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          ></iframe>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10"></div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl">
            Inspire<br/>Excellence
          </h1>
          <div className="w-24 h-2 bg-[#f2a900] mb-6 shadow-md"></div>
          <p className="text-xl md:text-2xl text-white font-medium max-w-2xl drop-shadow-md">
            Dedicated to inspiring excellence, developing intellectual curiosity, and teaching students to lead in a changing world.
          </p>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="w-full bg-[#f4f4f4] py-16 px-8 flex justify-center -mt-10 relative z-30">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 shadow-xl border-t-4 border-[#00523e] flex flex-col items-start hover:-translate-y-2 transition-transform cursor-pointer group" onClick={() => navigate('/login')}>
            <h3 className="text-2xl font-black text-[#00523e] uppercase tracking-tight mb-4 group-hover:text-[#f2a900] transition-colors">Portals</h3>
            <p className="text-gray-600 mb-6 flex-1">Access the student, parent, and faculty portals for grades, schedules, and school resources.</p>
            <button className="font-bold text-[#00523e] uppercase text-sm tracking-wider flex items-center gap-2 group-hover:text-[#f2a900] transition-colors">
              Login Now <span className="text-xl"></span>
            </button>
          </div>

          <div className="bg-white p-8 shadow-xl border-t-4 border-[#f2a900] flex flex-col items-start hover:-translate-y-2 transition-transform cursor-pointer group" onClick={() => navigate('/apply')}>
            <h3 className="text-2xl font-black text-[#00523e] uppercase tracking-tight mb-4 group-hover:text-[#f2a900] transition-colors">Admission</h3>
            <p className="text-gray-600 mb-6 flex-1">Join our community. Learn about the application process, visit our campus, and discover SSS.</p>
            <button className="font-bold text-[#00523e] uppercase text-sm tracking-wider flex items-center gap-2 group-hover:text-[#f2a900] transition-colors">
              Apply Online <span className="text-xl"></span>
            </button>
          </div>

          <div className="bg-white p-8 shadow-xl border-t-4 border-[#00523e] flex flex-col items-start hover:-translate-y-2 transition-transform cursor-pointer group" onClick={() => navigate('/admin/login')}>
            <h3 className="text-2xl font-black text-[#00523e] uppercase tracking-tight mb-4 group-hover:text-[#f2a900] transition-colors">Administration</h3>
            <p className="text-gray-600 mb-6 flex-1">For staff and administrators to manage school operations, admissions, and reports.</p>
            <button className="font-bold text-[#00523e] uppercase text-sm tracking-wider flex items-center gap-2 group-hover:text-[#f2a900] transition-colors">
              Staff Access <span className="text-xl"></span>
            </button>
          </div>

        </div>
      </div>

      {/* SSS Stats / Highlight */}
      <div className="w-full bg-[#00523e] text-white py-24 px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-16">The SSS Difference</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <div className="text-5xl md:text-6xl font-black text-[#f2a900] mb-2">530</div>
            <div className="uppercase tracking-widest text-sm font-bold opacity-80">Students</div>
          </div>
          <div>
            <div className="text-5xl md:text-6xl font-black text-[#f2a900] mb-2">9:1</div>
            <div className="uppercase tracking-widest text-sm font-bold opacity-80">Student/Faculty Ratio</div>
          </div>
          <div>
            <div className="text-5xl md:text-6xl font-black text-[#f2a900] mb-2">73</div>
            <div className="uppercase tracking-widest text-sm font-bold opacity-80">Acres of Campus</div>
          </div>
          <div>
            <div className="text-5xl md:text-6xl font-black text-[#f2a900] mb-2">100%</div>
            <div className="uppercase tracking-widest text-sm font-bold opacity-80">College Acceptance</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#1a1a1a] text-white py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00523e] text-white rounded-full flex items-center justify-center font-bold text-2xl">S</div>
            <div>
              <div className="font-black text-xl uppercase tracking-widest">Simple School System</div>
              <div className="text-gray-400 text-sm">20301 NE 108th St, Redmond, WA 98053</div>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
             &copy; {new Date().getFullYear()} Simple School System (SSS). All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
