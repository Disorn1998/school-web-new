import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ArrowRight } from 'lucide-react';

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

      {/* Academics / Grade Levels Section */}
      <div className="w-full bg-white py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-[#00523e] uppercase tracking-tight mb-4">Discover Academics</h2>
              <div className="w-16 h-1.5 bg-[#f2a900]"></div>
            </div>
            <p className="text-gray-500 max-w-md mt-4 md:mt-0 font-medium">From early childhood to graduation, we provide a continuous journey of discovery, growth, and excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Early Childhood / Lower School */}
            <div className="group relative h-96 overflow-hidden bg-gray-900 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800" alt="Lower School" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00523e]/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Lower School</h3>
                <p className="text-white/80 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">Building a foundation of curiosity, creativity, and love for learning.</p>
                <button className="text-[#f2a900] font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                  Explore <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Middle School */}
            <div className="group relative h-96 overflow-hidden bg-gray-900 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800" alt="Middle School" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00523e]/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Middle School</h3>
                <p className="text-white/80 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">Guiding students through critical years of personal and academic growth.</p>
                <button className="text-[#f2a900] font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                  Explore <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Upper School */}
            <div className="group relative h-96 overflow-hidden bg-gray-900 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" alt="Upper School" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00523e]/90 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Upper School</h3>
                <p className="text-white/80 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">Preparing young adults for college, leadership, and global citizenship.</p>
                <button className="text-[#f2a900] font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                  Explore <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Life & Activities */}
      <div className="w-full bg-[#f4f4f4] py-24 px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="w-full lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black text-[#00523e] uppercase tracking-tight mb-4">Campus Life</h2>
            <div className="w-16 h-1.5 bg-[#f2a900] mb-8"></div>
            <p className="text-lg text-gray-600 mb-6 font-medium">
              Education at SSS extends far beyond the classroom walls. Our vibrant campus life provides countless opportunities for students to discover new passions, build lifelong friendships, and develop leadership skills.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-[#00523e] font-bold uppercase tracking-wide text-sm">
                <div className="w-2 h-2 bg-[#f2a900]"></div> Over 40 Student-led Clubs
              </li>
              <li className="flex items-center gap-3 text-[#00523e] font-bold uppercase tracking-wide text-sm">
                <div className="w-2 h-2 bg-[#f2a900]"></div> Comprehensive Athletics Program
              </li>
              <li className="flex items-center gap-3 text-[#00523e] font-bold uppercase tracking-wide text-sm">
                <div className="w-2 h-2 bg-[#f2a900]"></div> Award-winning Arts & Theater
              </li>
              <li className="flex items-center gap-3 text-[#00523e] font-bold uppercase tracking-wide text-sm">
                <div className="w-2 h-2 bg-[#f2a900]"></div> Community Service Initiatives
              </li>
            </ul>
            <button className="bg-[#00523e] text-white px-8 py-4 font-bold uppercase tracking-wider text-sm hover:bg-[#f2a900] transition-colors shadow-lg">
              Explore Student Life
            </button>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <img src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=600" alt="Athletics" className="w-full h-48 object-cover shadow-md hover:scale-[1.02] transition-transform cursor-pointer" />
              <img src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=600" alt="Arts" className="w-full h-64 object-cover shadow-md hover:scale-[1.02] transition-transform cursor-pointer" />
            </div>
            <div className="flex flex-col gap-4 mt-8">
              <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600" alt="Science Labs" className="w-full h-64 object-cover shadow-md hover:scale-[1.02] transition-transform cursor-pointer" />
              <img src="https://images.unsplash.com/photo-1519452285881-2bf008ee5236?auto=format&fit=crop&q=80&w=600" alt="Robotics Club" className="w-full h-48 object-cover shadow-md hover:scale-[1.02] transition-transform cursor-pointer" />
            </div>
          </div>

        </div>
      </div>

      {/* SSS Stats / Highlight */}
      <div className="w-full bg-[#00523e] text-white py-24 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-16">The SSS Difference</h2>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <div className="text-5xl md:text-6xl font-black text-[#f2a900] mb-2">530</div>
              <div className="uppercase tracking-widest text-sm font-bold opacity-80">Students Enrolled</div>
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
      </div>

      {/* Call to Action */}
      <div className="w-full bg-[#f2a900] py-16 px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[#00523e] uppercase tracking-tight mb-6">Ready to Join Our Community?</h2>
        <button onClick={() => navigate('/apply')} className="bg-[#00523e] text-white px-10 py-4 font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-[#00523e] transition-all shadow-xl hover:shadow-2xl active:scale-95">
          Start Your Application
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#1a1a1a] text-white py-16 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 border-b border-gray-800 pb-12 mb-8">
          <div className="flex items-start gap-4 max-w-sm">
            <div className="w-14 h-14 bg-[#00523e] text-white flex-shrink-0 flex items-center justify-center font-black text-3xl">S</div>
            <div>
              <div className="font-black text-2xl uppercase tracking-widest mb-2">Simple School System</div>
              <div className="text-gray-400 text-sm leading-relaxed mb-4">20301 NE 108th St<br/>Redmond, WA 98053<br/>Phone: (425) 868-1000</div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#f2a900] transition-colors cursor-pointer flex items-center justify-center font-bold">f</div>
                <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#f2a900] transition-colors cursor-pointer flex items-center justify-center font-bold">in</div>
                <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#f2a900] transition-colors cursor-pointer flex items-center justify-center font-bold">ig</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto flex-1 md:ml-12">
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4 text-[#f2a900]">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Employment</li>
                <li className="hover:text-white cursor-pointer transition-colors">News & Events</li>
                <li className="hover:text-white cursor-pointer transition-colors">School Calendar</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4 text-[#f2a900]">Portals</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li onClick={() => navigate('/login')} className="hover:text-white cursor-pointer transition-colors">Student Portal</li>
                <li onClick={() => navigate('/login')} className="hover:text-white cursor-pointer transition-colors">Parent Portal</li>
                <li onClick={() => navigate('/admin/login')} className="hover:text-white cursor-pointer transition-colors">Faculty Portal</li>
                <li onClick={() => navigate('/admin/login')} className="hover:text-white cursor-pointer transition-colors">Admin Dashboard</li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold uppercase tracking-wider mb-4 text-[#f2a900]">Support SSS</h4>
              <p className="text-sm text-gray-400 mb-4">Your gift makes a difference in the lives of our students and faculty.</p>
              <button className="border border-[#f2a900] text-[#f2a900] hover:bg-[#f2a900] hover:text-black px-6 py-2 text-xs font-bold uppercase tracking-wider transition-colors w-full md:w-auto">
                Make a Gift
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4">
          <div>&copy; {new Date().getFullYear()} Simple School System (SSS). All rights reserved.</div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Sitemap</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
