import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ArrowRight, Users, ShieldAlert, Globe, MapPin, Compass, BookOpen, Heart } from 'lucide-react';

// 3D Tilt Card Component
const TiltCard = ({ children, bgImage }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    setRotate({ x: rotateX, y: rotateY });
  };
  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500" 
        style={{ backgroundImage: `url(${bgImage})`, transform: 'translateZ(-50px) scale(1.15)' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#00523e]/90 via-[#00523e]/40 to-transparent" style={{ transform: 'translateZ(0)' }}></div>
      <div className="absolute bottom-0 left-0 p-8 w-full" style={{ transform: 'translateZ(60px)' }}>
        {children}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'EN', flag: '🇬🇧', label: 'English' },
    { code: 'TH', flag: '🇹🇭', label: 'ภาษาไทย' },
    { code: 'CN', flag: '🇨🇳', label: '中文' },
    { code: 'JP', flag: '🇯🇵', label: '日本語' }
  ];
  const [currentLang, setCurrentLang] = useState(languages[0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const topUtilityLinks = [
    {name: "MyOverlake", path: "/login"}, 
    {name: "Alumni", path: "/page/alumni"}, 
    {name: "Giving", path: "/page/giving"}, 
    {name: "Calendar", path: "/page/calendar"}, 
    {name: "News", path: "/page/news"}
  ];
  
  const mainNavLinks = [
    { name: "Meet Overlake", links: [{name: "Diversity & Inclusion", path: "diversity"}, {name: "Meet Our Faculty & Staff", path: "staff"}, {name: "Meet Our Leadership", path: "leadership"}, {name: "Annual Report", path: "annual-report"}, {name: "Careers", path: "careers"}, {name: "Mission, Vision, Values", path: "mission"}] },
    { name: "Academics", links: [{name: "Academic Approach", path: "approach"}, {name: "Middle School", path: "middle-school"}, {name: "Upper School", path: "upper-school"}, {name: "Academic Departments", path: "departments"}, {name: "Signature Programs", path: "signature-programs"}] },
    { name: "Community", links: [{name: "Life at Overlake", path: "life"}, {name: "Arts", path: "arts"}, {name: "Athletics", path: "athletics"}, {name: "College Counseling", path: "counseling"}, {name: "Student Leadership", path: "leadership-students"}, {name: "Student Support", path: "support"}] },
    { name: "Admissions", links: [{name: "Begin Your Journey", path: "journey"}, {name: "Affording Overlake", path: "affording"}, {name: "Testing", path: "testing"}, {name: "Transportation", path: "transportation"}, {name: "Apply", path: "apply"}] }
  ];

  return (
    <div className="w-full min-h-screen font-sans bg-white text-slate-800 overflow-x-hidden">
      
      {/* Utility Top Bar */}
      <div className="hidden md:flex w-full bg-gradient-to-r from-[#003d2e] to-[#00523e] text-white py-2 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50 relative shadow-[0_5px_15px_rgba(0,0,0,0.3)] border-b border-white/10">
        {topUtilityLinks.map(link => (
          <span key={link.name} onClick={() => navigate(link.path)} className="hover:text-[#f2a900] cursor-pointer transition-transform hover:-translate-y-0.5 duration-200 block">{link.name}</span>
        ))}
        
        {/* Language Switcher */}
        <div className="relative ml-4 border-l border-white/20 pl-6">
          <button 
            onClick={() => setLangOpen(!langOpen)} 
            className="flex items-center gap-2 bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 px-4 py-1.5 rounded-full transition-all border border-white/20 shadow-[0_2px_5px_rgba(0,0,0,0.2)] active:scale-95"
          >
            <span className="text-base leading-none drop-shadow-md">{currentLang.flag}</span>
            <span className="font-bold text-white text-xs drop-shadow-md">{currentLang.code}</span>
            <ChevronDown size={14} className="text-white/70" />
          </button>
          
          {langOpen && (
            <div className="absolute top-[120%] right-0 mt-1 w-40 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 transform origin-top-right animate-fade-in-up" style={{ perspective: '1000px' }}>
              {languages.map(lang => (
                <div 
                  key={lang.code} 
                  onClick={() => { setCurrentLang(lang); setLangOpen(false); }} 
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#f4f4f4] cursor-pointer transition-colors border-b border-gray-50 last:border-0 hover:pl-6 duration-200"
                >
                  <span className="text-xl leading-none drop-shadow-sm">{lang.flag}</span>
                  <span className="font-bold text-[#00523e] text-xs uppercase tracking-wider">{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`w-full z-40 transition-all duration-500 ${isScrolled ? 'fixed top-0 bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-4' : 'absolute top-12 bg-transparent py-6'} px-8 flex justify-between items-center`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl transition-all duration-300 group-hover:rotate-12 shadow-lg ${isScrolled ? 'bg-[#00523e] text-white' : 'bg-white text-[#00523e]'}`}>
            O
          </div>
          <span className={`text-3xl font-black tracking-tight uppercase transition-colors duration-300 ${isScrolled ? 'text-[#00523e]' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`}>
            Overlake
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 h-full">
          {mainNavLinks.map((nav) => (
            <div 
              key={nav.name} 
              className="relative group h-full py-2"
              onMouseEnter={() => setActiveDropdown(nav.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className={`font-bold uppercase tracking-wider text-[13px] flex items-center gap-1 cursor-pointer transition-colors ${isScrolled ? 'text-[#00523e] hover:text-[#f2a900]' : 'text-white drop-shadow-md hover:text-[#f2a900]'}`}>
                {nav.name} <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === nav.name ? 'rotate-180' : ''}`} />
              </span>
              
              <div 
                className={`absolute top-[120%] left-0 w-64 bg-gradient-to-b from-[#00523e] to-[#003d2e] text-white shadow-[0_15px_35px_rgba(0,0,0,0.3)] border-t-4 border-[#f2a900] rounded-b-lg transition-all duration-300 transform origin-top ${activeDropdown === nav.name ? 'rotate-x-0 opacity-100 visible' : '-rotate-x-12 opacity-0 invisible'}`}
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                <div className="py-3 flex flex-col">
                  {nav.links.map(sublink => (
                    <span 
                      key={sublink.path} 
                      onClick={() => { setActiveDropdown(null); navigate(`/page/${sublink.path}`); }}
                      className="px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:text-[#f2a900] hover:pl-8 cursor-pointer transition-all duration-200 block border-b border-white/5 last:border-0"
                    >
                      {sublink.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/apply')} className="bg-gradient-to-r from-[#f2a900] to-[#d89600] text-white px-7 py-3 ml-4 rounded-full font-bold uppercase tracking-wider text-[13px] hover:shadow-[0_0_20px_rgba(242,169,0,0.5)] hover:scale-105 transition-all active:scale-95 shadow-md">
            Inquire
          </button>
        </div>

        <div className="lg:hidden z-50 cursor-pointer p-2 rounded-full bg-white/10 backdrop-blur-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} className={isScrolled ? "text-[#00523e]" : "text-white"} /> : <Menu size={28} className={isScrolled ? "text-[#00523e]" : "text-white"} />}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-[100vh] overflow-hidden flex items-center justify-center pb-24 px-8 md:px-16" style={{ perspective: '1000px' }}>
        <div 
          className="absolute inset-0 z-0 bg-[#00523e] scale-110"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        >
          <iframe 
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80 mix-blend-screen"
            src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&controls=0&loop=1&playlist=ScMzIvxBSi4&showinfo=0&rel=0&modestbranding=1" 
            title="Overlake Background" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          ></iframe>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#00523e] via-black/40 to-transparent z-10"></div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-center text-center mt-20" style={{ transform: `translateZ(${scrollY * 0.1}px)` }}>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            Inspire<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white">Excellence</span>
          </h1>
          <div className="w-32 h-2 bg-[#f2a900] mb-8 shadow-[0_0_15px_rgba(242,169,0,0.6)] rounded-full"></div>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-4 mt-8">
            <button onClick={() => navigate('/login')} className="px-10 py-5 rounded-full bg-gradient-to-br from-[#f2a900] to-[#d89600] text-[#00523e] font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(242,169,0,0.4)] active:scale-95 flex items-center justify-center gap-3 border border-[#ffca4f] group">
              <Users size={28} className="group-hover:scale-125 transition-transform duration-300" /> Student & Parent Login
            </button>
            <button onClick={() => navigate('/admin/login')} className="px-10 py-5 rounded-full bg-gradient-to-br from-[#00523e]/90 to-[#003d2e]/90 text-white font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,82,62,0.6)] active:scale-95 flex items-center justify-center gap-3 border border-white/20 backdrop-blur-lg group">
              <ShieldAlert size={28} className="group-hover:scale-125 transition-transform duration-300 text-[#f2a900]" /> Staff & Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* About Overlake Section */}
      <div className="w-full bg-[#00523e] text-white py-24 px-8 border-t border-[#f2a900]/30 shadow-inner z-30 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-5xl font-black uppercase tracking-tight mb-4 text-[#f2a900]">About Overlake</h2>
            <p className="text-2xl font-medium mb-8 leading-snug">We’re a school where curiosity thrives, connections deepen, and character flourishes.</p>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Compass className="text-[#f2a900]" /> Our Purpose</h3>
              <p className="text-gray-300 leading-relaxed">
                Overlake cultivates bold changemakers who learn by doing amid challenging curriculum, sparking a lifelong passion to create positive change in the world beyond our classrooms and campus.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Heart className="text-[#f2a900]" /> Our Promise</h3>
              <p className="text-gray-300 leading-relaxed">
                Students are at the heart of everything we do, and Overlake is an academic community with strong co-curriculars where wellbeing, deep connections, and purpose drive discovery—because education is an adventure.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2">
             <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800" alt="About Overlake" className="w-full h-full object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 hover:scale-[1.02] transition-transform duration-500" />
          </div>
        </div>
      </div>

      {/* Owls Eye View Stats */}
      <div className="w-full bg-[#f4f4f4] py-32 px-8 text-center relative overflow-hidden">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-20 text-[#00523e]">An Owls Eye View of Overlake</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">575</div>
            <p className="text-[#00523e] font-medium px-4">Young students from grades 5-12 all finding their unique paths</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">7:1</div>
            <p className="text-[#00523e] font-medium px-4">Student-to-teacher ratio that nurtures authentic connection</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">$1.8M</div>
            <p className="text-[#00523e] font-medium px-4">Financial aid granted making Overlake accessible to every promising student</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">75</div>
            <p className="text-[#00523e] font-medium px-4">Acres of immersion and wonder where learning comes alive outdoors</p>
          </div>
        </div>
      </div>

      {/* Our Campus Section */}
      <div className="w-full bg-white py-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[#00523e] uppercase tracking-tight mb-4">Our Campus</h2>
            <p className="text-xl text-gray-500 font-medium max-w-3xl mx-auto">A wonderland where the evergreens whisper and the outdoors becomes the classroom.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="w-full md:w-1/2">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Step foot onto our campus and feel it immediately—this place sings. Our evergreens create natural hideaways and invite impromptu gatherings, with winding trails connecting them all together. Here, learning isn’t contained to the classroom—it spills outdoors where students sketch under trees, debate by buildings, and ponder within our forestry.
              </p>
              <h3 className="text-2xl font-bold text-[#00523e] mb-4">Students find room to grow, wonder, and discover at Overlake.</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The world expands beyond our campus’s perimeter. Whether wandering through Pacific Northwest forests, lending a hand in global service, or connecting with neighbors right here in Redmond, this is where students broaden their horizons and find their place in the world. Overlake is rooted in earnestness: asking questions that invite imagination, building relationships that last, and caring deeply about each other and our planet.
              </p>
              <div className="flex gap-4 font-bold text-[#f2a900] uppercase tracking-widest text-sm">
                <span>Local</span> • <span>Regional</span> • <span>Global</span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
               <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800" alt="Campus" className="w-full h-[500px] object-cover rounded-3xl shadow-2xl" />
            </div>
          </div>
          
          <div className="bg-[#f4f4f4] rounded-3xl p-10 md:p-16 text-center shadow-inner">
            <h3 className="text-3xl font-black text-[#00523e] uppercase tracking-tight mb-6">75 Acres of Possibility</h3>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              Just a stone's throw from downtown Redmond, our sprawling campus feels like stepping into another world. Here, forest trails entice explorers, meadows host gatherings, and every corner invites a moment to pause, reflect, or dream. We've created this special place where nature's calm meets the buzz of learning—giving students room to breathe while keeping them anchored to Seattle’s vibrant energy.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive 3D Campus Map Section (Fixed Iframe URL) */}
      <div className="w-full bg-[#111] text-white py-32 px-8 relative overflow-hidden border-t-4 border-[#f2a900] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-30">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={32} className="text-[#f2a900] animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(242,169,0,0.3)]">Explore Our 3D Campus</h2>
          </div>
          <p className="text-gray-400 mb-12 text-center max-w-2xl text-lg">
            Take a virtual tour of our state-of-the-art facilities. <strong className="text-white">Click and drag</strong> to rotate the 3D model, scroll to zoom in and out.
          </p>
          
          <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-gradient-to-b from-gray-800 to-black border border-white/10 relative group flex items-center justify-center">
            {/* Using a verified Spline design URL that is globally accessible */}
            <iframe 
              title="3D Campus Viewer" 
              src='https://my.spline.design/miniroom-06915fb66601f021c1f55a156e5df469/' 
              frameBorder='0' 
              width='100%' 
              height='100%'
              className="absolute inset-0 z-10 transition-transform duration-700 group-hover:scale-105"
            ></iframe>
            <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold tracking-widest text-[#f2a900] flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> INTERACTIVE 3D
            </div>
          </div>
        </div>
      </div>

      {/* Only at Overlake (Grid with 3D Tilt Cards) */}
      <div className="w-full bg-gradient-to-b from-white to-gray-50 py-32 px-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-[#00523e] uppercase tracking-tight mb-4 drop-shadow-sm">Only at Overlake</h2>
            <p className="text-gray-500 font-medium text-xl">Where dynamic, authentic experiences shape tomorrow’s leaders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TiltCard bgImage="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Tuition Support</h3>
              <p className="text-white/90 text-sm mb-4">Investing in promising futures.</p>
              <div className="text-[#f2a900] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-black/40 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">Explore <ArrowRight size={14} /></div>
            </TiltCard>

            <TiltCard bgImage="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Our Campus</h3>
              <p className="text-white/90 text-sm mb-4">Learning spreads freely in nature’s classroom.</p>
              <div className="text-[#f2a900] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-black/40 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">Explore <ArrowRight size={14} /></div>
            </TiltCard>

            <TiltCard bgImage="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Service Learning</h3>
              <p className="text-white/90 text-sm mb-4">Service-empowered learning that transforms.</p>
              <div className="text-[#f2a900] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-black/40 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">Explore <ArrowRight size={14} /></div>
            </TiltCard>

            <TiltCard bgImage="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Project Week</h3>
              <p className="text-white/90 text-sm mb-4">Imagination becomes real-world practice.</p>
              <div className="text-[#f2a900] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-black/40 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">Explore <ArrowRight size={14} /></div>
            </TiltCard>

            <TiltCard bgImage="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Immersive Learning</h3>
              <p className="text-white/90 text-sm mb-4">Under the open sky.</p>
              <div className="text-[#f2a900] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-black/40 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">Explore <ArrowRight size={14} /></div>
            </TiltCard>

            <TiltCard bgImage="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Clubs & Activities</h3>
              <p className="text-white/90 text-sm mb-4">Find your people, build your passion.</p>
              <div className="text-[#f2a900] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-black/40 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">Explore <ArrowRight size={14} /></div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* Here's what makes us, us */}
      <div className="w-full bg-[#00523e] py-32 px-8 text-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-[#f2a900]">Here’s what makes us, us:</h2>
            <p className="text-xl font-medium max-w-3xl mx-auto text-white/90">Overlake is where learning takes flight; in every curious question and kind gesture, students are invited to become well-rounded humans.</p>
            <p className="text-lg text-[#f2a900] mt-4 font-bold">Chart a path through our forest of possibilities.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <BookOpen size={48} className="text-[#f2a900] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4">Learn</h3>
                <p className="text-gray-300">Students dive into a world that sparks wonder—where questions lead to discoveries and classroom walls extend outdoors.</p>
             </div>
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <Users size={48} className="text-[#f2a900] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4">Experience</h3>
                <p className="text-gray-300">Classmates delve into a vibrant community—where the connections are genuine, and seasons of wonder become lifelong passions.</p>
             </div>
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <ArrowRight size={48} className="text-[#f2a900] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4">Apply</h3>
                <p className="text-gray-300">Step into a new adventure that feels less like applying to a school and more like finding your child’s second home.</p>
             </div>
          </div>
          
          <div className="mt-20 flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-[#00523e] px-10 py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg rounded-full">Inquire</button>
            <button onClick={() => navigate('/apply')} className="bg-transparent border-2 border-white text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-[#00523e] transition-colors shadow-lg rounded-full">Visit</button>
            <button onClick={() => navigate('/apply')} className="bg-transparent border-2 border-[#f2a900] text-[#f2a900] px-10 py-4 font-bold uppercase tracking-widest hover:bg-[#f2a900] hover:text-[#00523e] transition-colors shadow-lg rounded-full">Apply</button>
          </div>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="w-full bg-red-600 text-white font-black text-center py-4 text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[inset_0_5px_15px_rgba(0,0,0,0.3)] relative z-40">
        ⚠️ This is a demo version / ระบบนี้เป็นเพียงเวอร์ชันทดลอง ⚠️
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#111] text-white py-16 px-8 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 border-b border-gray-800 pb-12 mb-8">
          <div className="flex items-start gap-5 max-w-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00523e] to-[#00291f] text-white rounded-2xl shadow-[0_0_20px_rgba(0,82,62,0.5)] border border-[#00523e]/50 flex-shrink-0 flex items-center justify-center font-black text-4xl">O</div>
            <div>
              <div className="font-black text-2xl uppercase tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Overlake School</div>
              <div className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">20301 NE 108th St<br/>Redmond, WA 98053<br/>questions@overlake.org<br/>425-868-1000</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto flex-1 md:ml-12">
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">Meet Overlake</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Diversity & Inclusion</li>
                <li className="hover:text-white cursor-pointer transition-colors">Faculty & Staff</li>
                <li className="hover:text-white cursor-pointer transition-colors">Leadership</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">Academics</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Middle School</li>
                <li className="hover:text-white cursor-pointer transition-colors">Upper School</li>
                <li className="hover:text-white cursor-pointer transition-colors">Departments</li>
                <li className="hover:text-white cursor-pointer transition-colors">Programs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">Community</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Life at Overlake</li>
                <li className="hover:text-white cursor-pointer transition-colors">Arts</li>
                <li className="hover:text-white cursor-pointer transition-colors">Athletics</li>
                <li className="hover:text-white cursor-pointer transition-colors">Alumni</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">Admissions</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Affording Overlake</li>
                <li className="hover:text-white cursor-pointer transition-colors">Testing</li>
                <li className="hover:text-white cursor-pointer transition-colors">Transportation</li>
                <li onClick={() => navigate('/apply')} className="text-[#f2a900] hover:text-white cursor-pointer transition-colors">Apply Now</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center text-gray-500 text-xs gap-6 font-medium">
          <div className="max-w-3xl">
             The Overlake School is committed to diversity and does not discriminate on the basis of race, color, religion, national or ethnic origin, socio-economic status, gender, sexual orientation, or disability, or other legally protected class, in the administration of its educational policies, admissions policies, financial aid programs, athletics, or other school-administered programs.
          </div>
          <div className="flex flex-col gap-2 min-w-max text-right">
             <span>&copy; {new Date().getFullYear()} Overlake School. All rights reserved.</span>
             <div className="flex justify-end gap-4">
               <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
               <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
               <span className="hover:text-white cursor-pointer transition-colors">Do Not Sell My Info</span>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
