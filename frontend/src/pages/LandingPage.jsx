import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ArrowRight, Users, ShieldAlert, Globe, MapPin } from 'lucide-react';

// 3D Tilt Card Component
const TiltCard = ({ children, bgImage }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (-15 to 15 degrees max)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setRotate({ x: rotateX, y: rotateY });
  };
  
  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-96 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#00523e] via-[#00523e]/40 to-transparent" style={{ transform: 'translateZ(0)' }}></div>
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
    {name: "Students", path: "/login"}, 
    {name: "Alumni", path: "/page/alumni"}, 
    {name: "Careers", path: "/page/careers"}, 
    {name: "Give", path: "/page/give"}, 
    {name: "Contact", path: "/page/contact"}
  ];
  
  const mainNavLinks = [
    { name: "About Us", links: [{name: "Our Mission", path: "our-mission"}, {name: "Leadership", path: "leadership"}, {name: "Diversity & Inclusion", path: "diversity-inclusion"}, {name: "Campus", path: "campus"}] },
    { name: "Admission", links: [{name: "How to Apply", path: "how-to-apply"}, {name: "Tuition & Financial Aid", path: "tuition-financial-aid"}, {name: "Visit SSS", path: "visit-sss"}, {name: "FAQ", path: "faq"}] },
    { name: "Academics", links: [{name: "Curriculum", path: "curriculum"}, {name: "Library", path: "library"}, {name: "Technology", path: "technology"}, {name: "College Counseling", path: "college-counseling"}] },
    { name: "Arts", links: [{name: "Visual Arts", path: "visual-arts"}, {name: "Performing Arts", path: "performing-arts"}, {name: "Music", path: "music"}, {name: "Theater", path: "theater"}] },
    { name: "Athletics", links: [{name: "Teams", path: "teams"}, {name: "Schedules", path: "schedules"}, {name: "Facilities", path: "facilities"}, {name: "Coaches", path: "coaches"}] },
    { name: "Student Life", links: [{name: "Clubs", path: "clubs"}, {name: "Community Service", path: "community-service"}, {name: "Outdoor Education", path: "outdoor-education"}, {name: "Events", path: "events"}] }
  ];

  return (
    <div className="w-full min-h-screen font-sans bg-white text-slate-800 overflow-x-hidden">
      
      {/* Utility Top Bar with 3D shadow effect */}
      <div className="hidden md:flex w-full bg-gradient-to-r from-[#003d2e] to-[#00523e] text-white py-2 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50 relative shadow-[0_5px_15px_rgba(0,0,0,0.3)] border-b border-white/10">
        {topUtilityLinks.map(link => (
          <span key={link.name} onClick={() => navigate(link.path)} className="hover:text-[#f2a900] cursor-pointer transition-transform hover:-translate-y-0.5 duration-200 block">{link.name}</span>
        ))}
        
        {/* Language Switcher - 3D Button Style */}
        <div className="relative ml-4 border-l border-white/20 pl-6">
          <button 
            onClick={() => setLangOpen(!langOpen)} 
            className="flex items-center gap-2 bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 px-4 py-1.5 rounded-full transition-all border border-white/20 shadow-[0_2px_5px_rgba(0,0,0,0.2)] active:scale-95"
          >
            <span className="text-base leading-none drop-shadow-md">{currentLang.flag}</span>
            <span className="font-bold text-white text-xs drop-shadow-md">{currentLang.code}</span>
            <ChevronDown size={14} className="text-white/70" />
          </button>
          
          {/* 3D Dropdown Menu */}
          {langOpen && (
            <div 
              className="absolute top-[120%] right-0 mt-1 w-40 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 transform origin-top-right animate-fade-in-up"
              style={{ perspective: '1000px' }}
            >
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
            S
          </div>
          <span className={`text-3xl font-black tracking-tight uppercase transition-colors duration-300 ${isScrolled ? 'text-[#00523e]' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`}>
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
                {nav.name} <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === nav.name ? 'rotate-180' : ''}`} />
              </span>
              
              {/* 3D Dropdown Menu */}
              <div 
                className={`absolute top-[120%] left-0 w-56 bg-gradient-to-b from-[#00523e] to-[#003d2e] text-white shadow-[0_15px_35px_rgba(0,0,0,0.3)] border-t-4 border-[#f2a900] rounded-b-lg transition-all duration-300 transform origin-top ${activeDropdown === nav.name ? 'rotate-x-0 opacity-100 visible' : '-rotate-x-12 opacity-0 invisible'}`}
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

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden z-50 cursor-pointer p-2 rounded-full bg-white/10 backdrop-blur-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} className={isScrolled ? "text-[#00523e]" : "text-white"} /> : <Menu size={28} className={isScrolled ? "text-[#00523e]" : "text-white"} />}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#00523e]/95 backdrop-blur-xl z-40 flex flex-col pt-32 px-8 pb-8 overflow-y-auto animate-fade-in">
          <div className="flex flex-col gap-6 text-white font-black text-2xl uppercase tracking-wider">
            {mainNavLinks.map(nav => (
              <div key={nav.name} className="flex flex-col border-b border-white/10 pb-4">
                <span className="flex justify-between items-center mb-2">{nav.name}</span>
                <div className="flex flex-col gap-4 pl-4 mt-2">
                  {nav.links.map(sublink => (
                    <span 
                      key={sublink.path} 
                      onClick={() => { setMobileMenuOpen(false); navigate(`/page/${sublink.path}`); }}
                      className="text-sm text-white/70 font-bold hover:text-[#f2a900] active:scale-95 transition-all"
                    >
                      {sublink.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-4 mt-4 text-lg font-bold">
               <span onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="flex items-center gap-2 text-white bg-white/10 px-6 py-4 rounded-xl"><Users size={20}/> Portals</span>
               <span onClick={() => { setMobileMenuOpen(false); navigate('/apply'); }} className="flex items-center gap-2 text-[#00523e] bg-[#f2a900] px-6 py-4 rounded-xl">Inquire / Apply</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Parallax Video Background */}
      <div className="relative w-full h-[100vh] overflow-hidden flex items-center justify-center pb-24 px-8 md:px-16" style={{ perspective: '1000px' }}>
        <div 
          className="absolute inset-0 z-0 bg-[#00523e] scale-110"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }} // True Parallax scrolling
        >
          <iframe 
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80 mix-blend-screen"
            src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&controls=0&loop=1&playlist=ScMzIvxBSi4&showinfo=0&rel=0&modestbranding=1" 
            title="SSS Background" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          ></iframe>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-center text-center mt-20" style={{ transform: `translateZ(${scrollY * 0.1}px)` }}>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            Inspire<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white">Excellence</span>
          </h1>
          <div className="w-32 h-2 bg-[#f2a900] mb-8 shadow-[0_0_15px_rgba(242,169,0,0.6)] rounded-full"></div>
          <p className="text-xl md:text-2xl text-white font-medium max-w-3xl drop-shadow-xl mb-12">
            Dedicated to inspiring excellence, developing intellectual curiosity, and teaching students to lead in a changing world.
          </p>
          
          {/* Giant Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-4">
            <button onClick={() => navigate('/login')} className="px-10 py-5 rounded-full bg-gradient-to-br from-[#f2a900] to-[#d89600] text-[#00523e] font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(242,169,0,0.4)] active:scale-95 flex items-center justify-center gap-3 border border-[#ffca4f] group">
              <Users size={28} className="group-hover:scale-125 transition-transform duration-300" /> Student & Parent Login
            </button>
            <button onClick={() => navigate('/admin/login')} className="px-10 py-5 rounded-full bg-gradient-to-br from-[#00523e]/90 to-[#003d2e]/90 text-white font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,82,62,0.6)] active:scale-95 flex items-center justify-center gap-3 border border-white/20 backdrop-blur-lg group">
              <ShieldAlert size={28} className="group-hover:scale-125 transition-transform duration-300 text-[#f2a900]" /> Staff & Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 3D Campus Map Section */}
      <div className="w-full bg-[#111] text-white py-32 px-8 relative overflow-hidden border-t-4 border-[#f2a900] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-30 -mt-10 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={32} className="text-[#f2a900] animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(242,169,0,0.3)]">Explore Our 3D Campus</h2>
          </div>
          <p className="text-gray-400 mb-12 text-center max-w-2xl text-lg">
            Take a virtual tour of our state-of-the-art facilities. <strong className="text-white">Click and drag</strong> to rotate the 3D model, scroll to zoom in and out.
          </p>
          
          {/* 3D Spline Interactive Embed */}
          <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-gradient-to-b from-gray-800 to-black border border-white/10 relative group">
            {/* Using a beautiful public isometric city/school Spline for demo */}
            <iframe 
              src='https://my.spline.design/isometriccity-19f4082eb43df65cc1a7c0f16f5c88c7/' 
              frameBorder='0' 
              width='100%' 
              height='100%'
              className="absolute inset-0 z-10 transition-transform duration-700 group-hover:scale-105"
            ></iframe>
            <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold tracking-widest text-[#f2a900] flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> LIVE 3D RENDER
            </div>
          </div>
        </div>
      </div>

      {/* 3D Academics / Grade Levels Section */}
      <div className="w-full bg-gradient-to-b from-white to-gray-100 py-32 px-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-[#00523e] uppercase tracking-tight mb-4 drop-shadow-sm">Discover Academics</h2>
              <div className="w-24 h-2 bg-[#f2a900] rounded-full"></div>
            </div>
            <p className="text-gray-500 max-w-md mt-6 md:mt-0 font-medium text-lg border-l-4 border-[#f2a900] pl-6">
              From early childhood to graduation, we provide a continuous journey of discovery, growth, and excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* 3D Tilt Cards */}
            <div onClick={() => navigate('/page/curriculum')}>
              <TiltCard bgImage="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">Lower School</h3>
                <p className="text-white/90 text-sm mb-6 font-medium drop-shadow-md">Building a foundation of curiosity, creativity, and love for learning.</p>
                <div className="text-[#f2a900] font-black uppercase text-sm tracking-widest flex items-center gap-2 bg-black/40 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">
                  Explore <ArrowRight size={16} />
                </div>
              </TiltCard>
            </div>

            <div onClick={() => navigate('/page/curriculum')}>
              <TiltCard bgImage="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">Middle School</h3>
                <p className="text-white/90 text-sm mb-6 font-medium drop-shadow-md">Guiding students through critical years of personal and academic growth.</p>
                <div className="text-[#f2a900] font-black uppercase text-sm tracking-widest flex items-center gap-2 bg-black/40 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">
                  Explore <ArrowRight size={16} />
                </div>
              </TiltCard>
            </div>

            <div onClick={() => navigate('/page/college-counseling')}>
              <TiltCard bgImage="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">Upper School</h3>
                <p className="text-white/90 text-sm mb-6 font-medium drop-shadow-md">Preparing young adults for college, leadership, and global citizenship.</p>
                <div className="text-[#f2a900] font-black uppercase text-sm tracking-widest flex items-center gap-2 bg-black/40 w-max px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">
                  Explore <ArrowRight size={16} />
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Scrolling Reveal Stats Section */}
      <div 
        className="w-full bg-[#00523e] text-white py-32 px-8 text-center relative overflow-hidden shadow-inner"
        style={{ backgroundAttachment: 'fixed', backgroundImage: 'radial-gradient(circle at center, #00664d 0%, #003d2e 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 transition-all duration-1000 ease-out" style={{ transform: `translateY(${Math.max(0, 100 - scrollY * 0.05)}px)`, opacity: scrollY > 800 ? 1 : 0.3 }}>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-20 drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">The SSS Difference</h2>
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="group hover:-translate-y-4 transition-transform duration-300">
              <div className="text-6xl md:text-8xl font-black text-[#f2a900] mb-4 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform">530</div>
              <div className="uppercase tracking-widest text-sm font-bold bg-white/10 py-2 rounded-full border border-white/20 backdrop-blur-sm">Students Enrolled</div>
            </div>
            <div className="group hover:-translate-y-4 transition-transform duration-300">
              <div className="text-6xl md:text-8xl font-black text-[#f2a900] mb-4 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform">9:1</div>
              <div className="uppercase tracking-widest text-sm font-bold bg-white/10 py-2 rounded-full border border-white/20 backdrop-blur-sm">Student/Faculty Ratio</div>
            </div>
            <div className="group hover:-translate-y-4 transition-transform duration-300">
              <div className="text-6xl md:text-8xl font-black text-[#f2a900] mb-4 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform">73</div>
              <div className="uppercase tracking-widest text-sm font-bold bg-white/10 py-2 rounded-full border border-white/20 backdrop-blur-sm">Acres of Campus</div>
            </div>
            <div className="group hover:-translate-y-4 transition-transform duration-300">
              <div className="text-6xl md:text-8xl font-black text-[#f2a900] mb-4 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform">100%</div>
              <div className="uppercase tracking-widest text-sm font-bold bg-white/10 py-2 rounded-full border border-white/20 backdrop-blur-sm">College Acceptance</div>
            </div>
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
            <div className="w-16 h-16 bg-gradient-to-br from-[#00523e] to-[#00291f] text-white rounded-2xl shadow-[0_0_20px_rgba(0,82,62,0.5)] border border-[#00523e]/50 flex-shrink-0 flex items-center justify-center font-black text-4xl">S</div>
            <div>
              <div className="font-black text-2xl uppercase tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Simple School System</div>
              <div className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">20301 NE 108th St<br/>Redmond, WA 98053<br/>Phone: (425) 868-1000</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto flex-1 md:ml-12">
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">Quick Links</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> Employment</li>
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> News & Events</li>
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> School Calendar</li>
                <li className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">Portals</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                <li onClick={() => navigate('/login')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> Student Portal</li>
                <li onClick={() => navigate('/login')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> Parent Portal</li>
                <li onClick={() => navigate('/admin/login')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> Faculty Portal</li>
                <li onClick={() => navigate('/admin/login')} className="hover:text-white cursor-pointer transition-colors flex items-center gap-2 hover:translate-x-2 duration-200"><ArrowRight size={12}/> Admin Dashboard</li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">Support SSS</h4>
              <p className="text-sm text-gray-400 mb-6 font-medium">Your gift makes a difference in the lives of our students and faculty.</p>
              <button className="bg-transparent border-2 border-[#f2a900] text-[#f2a900] hover:bg-[#f2a900] hover:text-[#00523e] px-8 py-3 text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto rounded-full shadow-[0_0_15px_rgba(242,169,0,0.2)] hover:shadow-[0_0_25px_rgba(242,169,0,0.5)] active:scale-95">
                Make a Gift
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs gap-4 font-bold tracking-wide">
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
