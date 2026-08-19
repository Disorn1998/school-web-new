import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ChevronRight, Globe } from 'lucide-react';

const pageContentData = {
  // About Us
  "our-mission": { title: "Our Mission", category: "About Us", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "At Simple School System (SSS), our mission is to inspire excellence and develop intellectual curiosity. We believe in nurturing the whole child, preparing them not just for college, but for life. Our dedicated faculty and staff work collaboratively to create a safe, inclusive, and challenging environment where every student can thrive." },
  "leadership": { title: "Leadership", category: "About Us", img: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1200", content: "Our leadership team brings decades of educational experience and a shared vision for excellence. Led by our Head of School, the administration works tirelessly to ensure that SSS remains at the forefront of educational innovation while maintaining our core values and traditions." },
  "diversity-inclusion": { title: "Diversity & Inclusion", category: "About Us", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200", content: "Diversity is our strength. We are committed to fostering an inclusive community where all backgrounds, cultures, and perspectives are celebrated. SSS actively promotes equity and justice in our curriculum, policies, and daily interactions." },
  "campus": { title: "Our Campus", category: "About Us", img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200", content: "Set on 73 beautiful acres, the SSS campus is designed to facilitate both academic rigor and personal growth. From state-of-the-art science labs to our expansive athletic fields and performing arts center, every facility is purposefully built to enhance the student experience." },
  
  // Admission
  "how-to-apply": { title: "How to Apply", category: "Admission", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "Joining SSS is the first step toward a transformative educational journey. Our application process is designed to help us get to know your child comprehensively. Start by completing the online inquiry form, followed by a campus visit, student interview, and submission of academic records." },
  "tuition-financial-aid": { title: "Tuition & Financial Aid", category: "Admission", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200", content: "We are committed to making an SSS education accessible to talented students regardless of their family's financial situation. Over 25% of our student body receives some form of need-based financial aid. Explore our tuition schedules and learn how to apply for assistance." },
  "visit-sss": { title: "Visit SSS", category: "Admission", img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200", content: "The best way to understand the SSS difference is to experience it firsthand. We offer weekly campus tours, open houses in the fall, and shadow days for prospective students. Come walk our halls, meet our teachers, and see learning in action." },
  "faq": { title: "Admission FAQ", category: "Admission", img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200", content: "Got questions? We have answers. From application deadlines and testing requirements to transportation options and uniform policies, find all the information you need to navigate the admission process smoothly." },

  // Academics
  "curriculum": { title: "Curriculum", category: "Academics", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200", content: "Our rigorous, inquiry-based curriculum challenges students to think critically and creatively. We emphasize project-based learning, interdisciplinary studies, and real-world application, ensuring our students are prepared for the demands of top-tier universities." },
  "library": { title: "Library & Media Center", category: "Academics", img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200", content: "The SSS Library is the academic heart of our campus. Housing over 50,000 physical volumes and providing access to extensive digital databases, it serves as a hub for research, collaborative study, and a lifelong love of reading." },
  "technology": { title: "Technology Integration", category: "Academics", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200", content: "Technology is seamlessly integrated into the SSS learning experience. With our 1:1 device program, robust coding and robotics courses, and digital citizenship curriculum, we empower students to be responsible and innovative digital creators." },
  "college-counseling": { title: "College Counseling", category: "Academics", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200", content: "Our individualized college counseling program begins in the 9th grade. We work closely with students and parents to identify colleges that align with each student's academic and personal goals, resulting in a 100% college acceptance rate." },

  // Arts
  "visual-arts": { title: "Visual Arts", category: "Arts", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200", content: "The Visual Arts program at SSS encourages students to explore their creativity through painting, sculpture, digital design, and photography. Our student gallery showcases the incredible talent and unique perspectives of our young artists." },
  "performing-arts": { title: "Performing Arts", category: "Arts", img: "https://images.unsplash.com/photo-1507676184212-d0330a151f84?q=80&w=1200", content: "From classical ballet to contemporary dance, our Performing Arts program allows students to express themselves through movement. We offer multiple levels of instruction and regular performance opportunities in our state-of-the-art theater." },
  "music": { title: "Music Program", category: "Arts", img: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200", content: "Whether in the symphony orchestra, jazz band, or vocal ensemble, music is alive at SSS. Students receive world-class instruction and have the opportunity to perform locally, nationally, and internationally." },
  "theater": { title: "Theater & Drama", category: "Arts", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200", content: "Our Theater department produces three major productions each year, including a fall drama, winter one-acts, and a spectacular spring musical. Students can engage in acting, directing, set design, and stage management." },

  // Athletics
  "teams": { title: "Athletic Teams", category: "Athletics", img: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200", content: "SSS fields over 30 competitive teams across 15 different sports. We believe in the power of athletics to teach teamwork, resilience, and sportsmanship. Go Owls!" },
  "schedules": { title: "Game Schedules", category: "Athletics", img: "https://images.unsplash.com/photo-1574629810360-7efbbcb2f414?q=80&w=1200", content: "Stay up to date with all SSS athletic events. Come out and support our student-athletes as they compete for regional and state championships." },
  "facilities": { title: "Athletic Facilities", category: "Athletics", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200", content: "Our athletic complex features a synthetic turf stadium, an Olympic-sized swimming pool, multiple gymnasiums, and a comprehensive strength and conditioning center, providing premier facilities for our athletes." },
  "coaches": { title: "Our Coaches", category: "Athletics", img: "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1200", content: "Our coaching staff comprises dedicated professionals who are passionate about developing student-athletes both on and off the field. They serve as mentors, pushing students to reach their highest potential." },

  // Student Life
  "clubs": { title: "Student Clubs", category: "Student Life", img: "https://images.unsplash.com/photo-1519452285881-2bf008ee5236?q=80&w=1200", content: "With over 40 student-led clubs ranging from Robotics and Model UN to the Baking Club and Environmental Action, there is a place for every passion at SSS. Clubs provide crucial leadership opportunities for our students." },
  "community-service": { title: "Community Service", category: "Student Life", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200", content: "Service is a core pillar of the SSS experience. All students participate in local and global service initiatives, learning the value of giving back and understanding their role as global citizens." },
  "outdoor-education": { title: "Outdoor Education", category: "Student Life", img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1200", content: "Our renowned Outdoor Education program takes students out of their comfort zones and into nature. Through backpacking, rock climbing, and wilderness survival courses, students build confidence, teamwork, and environmental stewardship." },
  "events": { title: "School Events", category: "Student Life", img: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200", content: "From Spirit Week and Homecoming to the Spring Gala and cultural festivals, the SSS calendar is packed with events that build community, celebrate achievements, and create lifelong memories." },

  // Fallback
  "default": { title: "Information", category: "General", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "Information about this topic is currently being updated. Please check back soon or contact our administration office for more details." }
};

const topUtilityLinks = [
  { name: "Students", path: "/login" },
  { name: "Alumni", path: "/page/alumni" },
  { name: "Careers", path: "/page/careers" },
  { name: "Give", path: "/page/give" },
  { name: "Contact", path: "/page/contact" }
];

const mainNavLinks = [
  { name: "About Us", links: [{n: "Our Mission", p: "our-mission"}, {n: "Leadership", p: "leadership"}, {n: "Diversity & Inclusion", p: "diversity-inclusion"}, {n: "Campus", p: "campus"}] },
  { name: "Admission", links: [{n: "How to Apply", p: "how-to-apply"}, {n: "Tuition & Financial Aid", p: "tuition-financial-aid"}, {n: "Visit SSS", p: "visit-sss"}, {n: "FAQ", p: "faq"}] },
  { name: "Academics", links: [{n: "Curriculum", p: "curriculum"}, {n: "Library", p: "library"}, {n: "Technology", p: "technology"}, {n: "College Counseling", p: "college-counseling"}] },
  { name: "Arts", links: [{n: "Visual Arts", p: "visual-arts"}, {n: "Performing Arts", p: "performing-arts"}, {n: "Music", p: "music"}, {n: "Theater", p: "theater"}] },
  { name: "Athletics", links: [{n: "Teams", p: "teams"}, {n: "Schedules", p: "schedules"}, {n: "Facilities", p: "facilities"}, {n: "Coaches", p: "coaches"}] },
  { name: "Student Life", links: [{n: "Clubs", p: "clubs"}, {n: "Community Service", p: "community-service"}, {n: "Outdoor Education", p: "outdoor-education"}, {n: "Events", p: "events"}] }
];

const PublicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const pageData = pageContentData[slug] || pageContentData["default"];

  // Helper to find the actual title if it's a fallback but we have it in menus
  let displayTitle = pageData.title;
  if (pageData === pageContentData["default"]) {
     const cleanSlug = slug.replace(/-/g, ' ');
     displayTitle = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
  }

  return (
    <div className="w-full min-h-screen font-sans bg-white text-slate-800 flex flex-col">
      
      {/* Utility Top Bar */}
      <div className="hidden md:flex w-full bg-[#00523e] text-white py-1.5 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50">
        {topUtilityLinks.map(link => (
          <span key={link.name} onClick={() => navigate(link.path)} className="hover:text-[#f2a900] cursor-pointer transition-colors">{link.name}</span>
        ))}
        <div className="flex items-center gap-2 ml-4">
          <button onClick={() => navigate('/login')} className="flex items-center gap-1 hover:text-[#f2a900] transition-colors"><Lock size={12}/> Portals</button>
        </div>
        <Search size={14} className="cursor-pointer hover:text-[#f2a900] ml-2" />
        <div className="flex items-center gap-1 border-l border-white/30 pl-4 ml-2">
          <Globe size={14} />
          <select className="bg-transparent text-white font-bold cursor-pointer outline-none text-xs hover:text-[#f2a900] transition-colors appearance-none">
            <option value="en" className="text-black">EN</option>
            <option value="th" className="text-black">TH</option>
            <option value="cn" className="text-black">CN</option>
            <option value="jp" className="text-black">JP</option>
          </select>
        </div>
      </div>

      {/* Main Navigation - Solid Green for content pages */}
      <nav className="w-full z-40 bg-[#00523e] py-4 px-8 flex justify-between items-center shadow-md sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl bg-white text-[#00523e]">
            S
          </div>
          <span className="text-3xl font-black tracking-tight uppercase text-white">
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
              <span className="font-bold uppercase tracking-wider text-[13px] flex items-center gap-1 cursor-pointer transition-colors text-white hover:text-[#f2a900]">
                {nav.name} <ChevronDown size={14} className="opacity-50" />
              </span>
              
              {/* Dropdown Menu */}
              <div className={`absolute top-full left-0 mt-4 w-56 bg-white text-[#00523e] shadow-2xl border-t-4 border-[#f2a900] transition-all duration-200 transform origin-top ${activeDropdown === nav.name ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
                <div className="py-2 flex flex-col">
                  {nav.links.map(sublink => (
                    <span 
                      key={sublink.n} 
                      onClick={() => { setActiveDropdown(null); navigate(`/page/${sublink.p}`); }}
                      className="px-5 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#f4f4f4] hover:text-[#f2a900] cursor-pointer transition-colors"
                    >
                      {sublink.n}
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
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#00523e] text-white z-40 flex flex-col pt-24 px-8 pb-8 overflow-y-auto">
          <div className="flex flex-col gap-6 font-black text-2xl uppercase tracking-wider">
            {mainNavLinks.map(nav => (
              <div key={nav.name} className="flex flex-col border-b border-white/20 pb-4">
                <span className="flex justify-between items-center mb-2">{nav.name}</span>
                <div className="flex flex-col gap-4 pl-4 mt-2">
                  {nav.links.map(sublink => (
                    <span 
                      key={sublink.n} 
                      onClick={() => { setMobileMenuOpen(false); navigate(`/page/${sublink.p}`); }}
                      className="text-sm text-white/80 font-bold hover:text-[#f2a900]"
                    >
                      {sublink.n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-4 mt-4 text-lg font-bold text-white/80">
               <span onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="flex items-center gap-2 hover:text-white"><Lock size={18}/> Portals</span>
               <span onClick={() => { setMobileMenuOpen(false); navigate('/apply'); }} className="text-[#f2a900] hover:text-white">Inquire / Apply</span>
            </div>
          </div>
        </div>
      )}

      {/* Page Hero Banner */}
      <div className="w-full h-80 md:h-[400px] relative overflow-hidden bg-gray-900">
        <img src={pageData.img} alt={displayTitle} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00523e]/90 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#f2a900] font-bold text-sm uppercase tracking-wider mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span>{pageData.category}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-lg">
            {displayTitle}
          </h1>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-12">
        {/* Sidebar Nav */}
        <div className="w-full md:w-1/4 hidden md:block">
          <div className="bg-[#f4f4f4] p-6 rounded-lg border-t-4 border-[#00523e]">
            <h3 className="font-black text-xl text-[#00523e] uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">
              {pageData.category}
            </h3>
            <ul className="space-y-4">
              {mainNavLinks.find(n => n.name === pageData.category)?.links.map(l => (
                <li 
                  key={l.n} 
                  onClick={() => navigate(`/page/${l.p}`)}
                  className={`font-bold text-sm uppercase tracking-wider cursor-pointer transition-colors ${slug === l.p ? 'text-[#f2a900]' : 'text-gray-500 hover:text-[#00523e]'}`}
                >
                  {l.n}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-8 p-6 bg-[#00523e] text-white rounded-lg text-center">
            <h4 className="font-bold uppercase tracking-wider mb-2">Visit Us</h4>
            <p className="text-sm opacity-90 mb-4">See learning in action by scheduling a campus tour today.</p>
            <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-[#00523e] px-4 py-2 text-sm font-bold uppercase tracking-wider w-full hover:bg-white transition-colors">
              Schedule Tour
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4">
          <div className="prose max-w-none">
            <p className="text-xl text-gray-600 leading-relaxed font-medium mb-8">
              {pageData.content}
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              Our commitment to excellence ensures that every student receives the support and guidance they need to succeed. The {displayTitle} program is a cornerstone of the Simple School System experience, designed to foster growth, resilience, and a lifelong passion for learning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <img src={pageData.img} alt="Detail" className="w-full h-48 object-cover rounded shadow-md" />
              <div className="bg-[#f4f4f4] p-6 rounded shadow-sm flex flex-col justify-center">
                <h4 className="text-lg font-black text-[#00523e] uppercase mb-2">Did You Know?</h4>
                <p className="text-gray-600 text-sm">Our programs are consistently ranked among the top in the nation, reflecting our unwavering dedication to student success.</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              We invite you to explore more about what makes SSS unique. If you have any questions regarding {displayTitle} or any other aspect of our school, please do not hesitate to contact our admissions or administrative offices.
            </p>
          </div>
        </div>
      </div>

      {/* Footer (Simplified for PublicPage to maintain context) */}
      
      {/* Demo Notice Banner */}
      <div className="w-full bg-red-600 text-white font-black text-center py-3 text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner">
        ?? This is a demo version / ระบบนี้เป็นเพียงเวอร์ชันทดลอง ??
      </div>

      <footer className="w-full bg-[#1a1a1a] text-white py-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-800 pb-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00523e] text-white rounded-full flex items-center justify-center font-bold text-2xl">S</div>
            <div>
              <div className="font-black text-xl uppercase tracking-widest">Simple School System</div>
              <div className="text-gray-400 text-sm">20301 NE 108th St, Redmond, WA 98053</div>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => navigate('/login')} className="border border-white/20 hover:border-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors">Portals</button>
             <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-[#00523e] hover:bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors">Apply Now</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-gray-500 text-xs text-center">
          &copy; {new Date().getFullYear()} Simple School System (SSS). All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default PublicPage;


