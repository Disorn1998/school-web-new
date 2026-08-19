import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ChevronRight, ArrowRight } from 'lucide-react';

// Crisp, colorful country flag component using CDN
const FlagIcon = ({ code, className = "w-6 h-4" }) => {
  const flagUrls = {
    EN: "https://flagcdn.com/w80/gb.png",
    TH: "https://flagcdn.com/w80/th.png",
    CN: "https://flagcdn.com/w80/cn.png",
    JP: "https://flagcdn.com/w80/jp.png"
  };
  return (
    <img 
      src={flagUrls[code]} 
      alt={code} 
      className={`${className} object-cover rounded shadow-sm inline-block border border-white/30`} 
      loading="eager"
    />
  );
};

const pageContentData = {
  // English
  EN: {
    "diversity": { title: "Diversity & Inclusion", category: "Meet Overlake", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200", content: "Diversity is our strength. We are committed to fostering an inclusive community where all backgrounds, cultures, and perspectives are celebrated. Overlake actively promotes equity and justice in our curriculum, policies, and daily interactions." },
    "staff": { title: "Faculty & Staff", category: "Meet Overlake", img: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1200", content: "Our world-class faculty and staff are passionate educators and mentors dedicated to inspiring curiosity, critical thinking, and empathy in every student." },
    "leadership": { title: "Leadership Team", category: "Meet Overlake", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200", content: "Guided by our Head of School and Board of Trustees, Overlake's leadership ensures our mission of inspiring excellence remains vibrant and future-ready." },
    "annual-report": { title: "Annual Report", category: "Meet Overlake", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200", content: "Explore our transparent financial stewardship, philanthropic milestones, and academic accomplishments over the past academic year." },
    "careers": { title: "Careers at Overlake", category: "Meet Overlake", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", content: "Join a vibrant community of passionate educators and professionals. We offer competitive compensation, exceptional professional development, and a collaborative work culture." },
    "mission": { title: "Mission, Vision & Values", category: "Meet Overlake", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "Overlake cultivates bold changemakers who learn by doing amid challenging curriculum, sparking a lifelong passion to create positive change in the world." },
    
    "approach": { title: "Academic Approach", category: "Academics", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200", content: "Our experiential and inquiry-driven curriculum encourages students to ask bold questions, test theories, and apply their knowledge to solve real-world problems." },
    "middle-school": { title: "Middle School (Grades 5-8)", category: "Academics", img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200", content: "Middle School provides a nurturing yet rigorous environment where emerging adolescents discover their strengths, build foundational skills, and develop self-confidence." },
    "upper-school": { title: "Upper School (Grades 9-12)", category: "Academics", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200", content: "Upper School challenges students with advanced placement coursework, honors electives, and leadership opportunities that prepare them for success at the world's finest universities." },
    "departments": { title: "Academic Departments", category: "Academics", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200", content: "From STEM and Computer Science to Humanities and World Languages, our academic departments offer rich, interdisciplinary pathways." },
    "signature-programs": { title: "Signature Programs", category: "Academics", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200", content: "Explore unique Overlake learning experiences including Project Week, Outdoor Education, and independent senior research projects." },

    "life": { title: "Life at Overlake", category: "Community", img: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200", content: "Every day at Overlake brings genuine connections, energetic campus traditions, and memorable shared moments in our 75-acre woodland campus." },
    "arts": { title: "Visual & Performing Arts", category: "Community", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200", content: "Our arts programs celebrate individual creative expression through visual arts, choir, orchestra, band, and theatrical productions." },
    "athletics": { title: "Athletics Program", category: "Community", img: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200", content: "Overlake Owls compete across 15+ varsity sports, building leadership, character, resilience, and teamwork." },
    "counseling": { title: "College Counseling", category: "Community", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "Personalized four-year college guidance ensures each student finds the university that best matches their intellectual aspirations and life goals." },
    "leadership-students": { title: "Student Leadership", category: "Community", img: "https://images.unsplash.com/photo-1519452285881-2bf008ee5236?q=80&w=1200", content: "Students lead student government, run 50+ campus clubs, and organize community service initiatives that make a tangible difference." },
    "support": { title: "Student Support & Wellness", category: "Community", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200", content: "Comprehensive academic coaching, counseling services, and health wellness programs support the whole child." },

    "journey": { title: "Begin Your Journey", category: "Admissions", img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200", content: "We welcome passionate learners and curious minds. Discover the admissions timeline, requirements, and steps to join our student body." },
    "affording": { title: "Affording Overlake", category: "Admissions", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200", content: "With over $1.8M awarded annually in need-based financial aid, we are deeply committed to making an Overlake education accessible to all qualified students." },
    "testing": { title: "Testing & Evaluations", category: "Admissions", img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200", content: "Learn about our holistic evaluation process, test-optional pathways, and student interview guidelines." },
    "transportation": { title: "Transportation & Buses", category: "Admissions", img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200", content: "We provide comprehensive bus routes connecting our Redmond campus with Seattle, Bellevue, Kirkland, and surrounding Eastside communities." },
    "apply": { title: "Online Application", category: "Admissions", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "Submit your online inquiry and application through our admissions portal to begin your Overlake experience." }
  },

  // Thai
  TH: {
    "diversity": { title: "ความหลากหลายและความเท่าเทียม", category: "รู้จัก Overlake", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200", content: "ความหลากหลายคือพลังของเรา เรามุ่งมั่นสร้างชุมชนที่เปิดกว้างและยอมรับทุกความแตกต่างทางวัฒนธรรมและความคิด เพื่อสร้างความเป็นธรรมและความเท่าเทียมในทุกมิติ" },
    "staff": { title: "คณาจารย์และบุคลากร", category: "รู้จัก Overlake", img: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1200", content: "คณาจารย์ผู้ทรงคุณวุฒิระดับแนวหน้า พร้อมเป็นทั้งผู้สอนและที่ปรึกษาที่คอยจุดประกายความอยากรู้อยากเห็น และเสริมสร้างทักษะการคิดวิเคราะห์ให้แก่นักเรียนทุกคน" },
    "leadership": { title: "คณะผู้บริหาร", category: "รู้จัก Overlake", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200", content: "ทีมผู้บริหารและคณะกรรมการโรงเรียน มุ่งมั่นพัฒนาวิสัยทัศน์ทางการศึกษาเพื่อนำพาโรงเรียนก้าวสู่อนาคตอย่างมั่นคง" },
    "annual-report": { title: "รายงานประจำปี", category: "รู้จัก Overlake", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200", content: "รายงานความโปร่งใสทางด้านการเงิน ความสำเร็จทางวิชาการ และการเติบโตของโรงเรียนในรอบปีที่ผ่านมา" },
    "careers": { title: "ร่วมงานกับเรา", category: "รู้จัก Overlake", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", content: "ร่วมเป็นส่วนหนึ่งขององค์กรการศึกษาชั้นนำ พร้อมโอกาสในการพัฒนาสายอาชีพและสวัสดิการที่ยอดเยี่ยม" },
    "mission": { title: "พันธกิจ วิสัยทัศน์ และค่านิยม", category: "รู้จัก Overlake", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "บ่มเพาะผู้นำแห่งการเปลี่ยนแปลงที่กล้าหาญ ผ่านการลงมือปฏิบัติจริงและการเรียนรู้ที่ท้าทาย เพื่อสร้างผลกระทบเชิงบวกให้แก่สังคม" },

    "approach": { title: "แนวทางการเรียนรู้", category: "วิชาการ", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200", content: "หลักสูตรที่เน้นการสืบเสาะและการลงมือปฏิบัติจริง ช่วยให้นักเรียนกล้าตั้งคำถาม คิดค้นทฤษฎี และประยุกต์ใช้ความรู้ในการแก้ปัญหาจริง" },
    "middle-school": { title: "ระดับมัธยมศึกษาตอนต้น (เกรด 5-8)", category: "วิชาการ", img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200", content: "สภาพแวดล้อมที่อบอุ่นและท้าทาย ช่วยให้นักเรียนวัยรุ่นค้นพบจุดแข็งของตนเอง สร้างพื้นฐานความรู้ที่แข็งแกร่ง และเสริมสร้างความมั่นใจ" },
    "upper-school": { title: "ระดับมัธยมศึกษาตอนปลาย (เกรด 9-12)", category: "วิชาการ", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200", content: "หลักสูตรระดับสูง (AP และ Honors) พร้อมโอกาสในการแสดงภาวะผู้นำ เพื่อเตรียมความพร้อมสู่มหาวิทยาลัยชั้นนำระดับโลก" },
    "departments": { title: "กลุ่มสาระการเรียนรู้", category: "วิชาการ", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200", content: "ตั้งแต่สาขา STEM วิทยาการคอมพิวเตอร์ ไปจนถึงมนุษยศาสตร์และภาษาต่างประเทศ เรามีหลักสูตรที่บูรณาการอย่างลึกซึ้ง" },
    "signature-programs": { title: "หลักสูตรเฉพาะทาง", category: "วิชาการ", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200", content: "สัมผัสประสบการณ์เรียนรู้ที่เป็นเอกลักษณ์ เช่น สัปดาห์โครงงาน Project Week การศึกษาธรรมชาติกลางแจ้ง และโครงงานวิจัยอิสระ" },

    "life": { title: "ชีวิตในรั้ว Overlake", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200", content: "ทุกวันในวิทยาเขตธรรมชาติ 190 ไร่ เต็มไปด้วยมิตรภาพ ความอบอุ่น และกิจกรรมประเพณีของโรงเรียนที่น่าจดจำ" },
    "arts": { title: "ศิลปะและการแสดง", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200", content: "ส่งเสริมความคิดสร้างสรรค์ผ่านทัศนศิลป์ ดนตรี วงดุริยางค์ การขับร้องประสานเสียง และการแสดงละครเวที" },
    "athletics": { title: "การกีฬาและกิจกรรมพลศึกษา", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200", content: "ทีมนักกีฬา Owls เข้าร่วมการแข่งขันมากกว่า 15 ชนิดกีฬา เพื่อปลูกฝังน้ำใจนักกีฬา ความอดทน และการทำงานเป็นทีม" },
    "counseling": { title: "แนะแนวศึกษาต่อมหาวิทยาลัย", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "การให้คำปรึกษารายบุคคลแบบเข้มข้นตลอด 4 ปี เพื่อช่วยให้นักเรียนได้รับการตอบรับเข้าศึกษาในมหาวิทยาลัยที่ตรงกับเป้าหมายสูงสุด" },
    "leadership-students": { title: "ผู้นำนักเรียน", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1519452285881-2bf008ee5236?q=80&w=1200", content: "นักเรียนเป็นผู้นำสภานักเรียน บริหารชมรมมากกว่า 50 ชมรม และจัดกิจกรรมบริการสังคมที่สร้างประโยชน์อย่างแท้จริง" },
    "support": { title: "ศูนย์สนับสนุนและสุขภาวะนักเรียน", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200", content: "บริการให้คำปรึกษาทางวิชาการและสุขภาพจิต เพื่อส่งเสริมสุขภาวะที่ดีรอบด้านให้แก่นักเรียนทุกคน" },

    "journey": { title: "เริ่มต้นเส้นทางการเรียนรู้", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200", content: "ยินดีต้อนรับนักเรียนผู้มีความกระตือรือร้นและรักการเรียนรู้ เรียนรู้กำหนดการ เกณฑ์การรับสมัคร และขั้นตอนการเข้าศึกษา" },
    "affording": { title: "ค่าเล่าเรียนและทุนการศึกษา", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200", content: "ด้วยทุนการศึกษามากกว่า $1.8M ในแต่ละปี เรามุ่งมั่นมอบโอกาสทางการศึกษาให้แก่นักเรียนที่มีศักยภาพทุกคน" },
    "testing": { title: "การสอบประเมินและการสัมภาษณ์", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200", content: "ข้อมูลเกี่ยวกับเกณฑ์การพิจารณาแบบองค์รวม การประเมินความสามารถ และแนวทางการสัมภาษณ์นักเรียน" },
    "transportation": { title: "บริการรถรับส่งนักเรียน", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200", content: "เส้นทางรถโรงเรียนที่ครอบคลุม เชื่อมต่อวิทยาเขตเรดมอนด์กับซีแอตเทิล เบลวีว เคิร์กแลนด์ และพื้นที่ใกล้เคียง" },
    "apply": { title: "สมัครเรียนออนไลน์", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "กรอกข้อมูลและยื่นใบสมัครออนไลน์ผ่านระบบพอร์ทัลเพื่อเริ่มต้นการเดินทางที่ยอดเยี่ยมที่ Overlake" }
  }
};

const PublicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'TH', label: 'ภาษาไทย' },
    { code: 'CN', label: '中文' },
    { code: 'JP', label: '日本語' }
  ];

  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem('site_lang');
    return languages.find(l => l.code === saved) || languages[0];
  });

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    setLangOpen(false);
    localStorage.setItem('site_lang', lang.code);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fallback to EN if language dictionary doesn't have the specific slug
  const langKey = pageContentData[currentLang.code] ? currentLang.code : "EN";
  const defaultPage = {
    title: slug.replace(/-/g, ' ').toUpperCase(),
    category: currentLang.code === 'TH' ? "ข้อมูลโรงเรียน" : "Information",
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200",
    content: currentLang.code === 'TH' ? "รายละเอียดของหัวข้อนี้อยู่ระหว่างการปรับปรุงข้อมูล โปรดติดต่อฝ่ายรับสมัครเพื่อขอข้อมูลเพิ่มเติม" : "Information about this topic is currently being updated. Please contact our admissions office for more details."
  };

  const pageData = pageContentData[langKey][slug] || pageContentData["EN"][slug] || defaultPage;

  return (
    <div className="w-full min-h-screen font-sans bg-white text-slate-800 flex flex-col">
      
      {/* Utility Top Bar */}
      <div className="hidden md:flex w-full bg-[#00523e] text-white py-2 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50 shadow-md">
        <span onClick={() => navigate('/login')} className="hover:text-[#f2a900] cursor-pointer transition-colors">Portals</span>
        <span onClick={() => navigate('/')} className="hover:text-[#f2a900] cursor-pointer transition-colors">Home</span>
        
        {/* Language Switcher */}
        <div className="relative ml-4 border-l border-white/20 pl-6">
          <button 
            onClick={() => setLangOpen(!langOpen)} 
            className="flex items-center gap-2.5 bg-gradient-to-b from-white/25 to-white/10 hover:from-white/35 hover:to-white/15 px-3.5 py-1.5 rounded-full transition-all border border-white/30 shadow-sm active:scale-95 cursor-pointer"
          >
            <FlagIcon code={currentLang.code} className="w-5 h-3.5" />
            <span className="font-extrabold text-white text-xs tracking-wider">{currentLang.code}</span>
            <ChevronDown size={14} className={`text-white/80 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {langOpen && (
            <div className="absolute top-[125%] right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 transform origin-top-right animate-fade-in">
              {languages.map(lang => (
                <div 
                  key={lang.code} 
                  onClick={() => changeLanguage(lang)} 
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-[#f0fdf4] cursor-pointer transition-all duration-150 border-b border-gray-50 last:border-0 ${currentLang.code === lang.code ? 'bg-[#f0fdf4] font-black text-[#00523e]' : 'text-gray-700'}`}
                >
                  <FlagIcon code={lang.code} className="w-6 h-4 shadow-sm" />
                  <span className="font-bold text-xs uppercase tracking-wider">{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="w-full z-40 bg-[#00523e] py-4 px-8 flex justify-between items-center shadow-lg sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl bg-white text-[#00523e] shadow-md group-hover:scale-105 transition-transform">
            O
          </div>
          <span className="text-3xl font-black tracking-tight uppercase text-white">
            Overlake
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-white hover:text-[#f2a900] font-bold text-sm uppercase tracking-wider hidden md:block">
            ← Back to Home
          </button>
          <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-[#00523e] px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white transition-all shadow-md">
            Inquire / Apply
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="w-full h-80 md:h-[420px] relative overflow-hidden bg-gray-900">
        <img src={pageData.img} alt={pageData.title} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00523e] via-[#00523e]/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#f2a900] font-bold text-sm uppercase tracking-wider mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span>{pageData.category}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-lg">
            {pageData.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/4 hidden md:block">
          <div className="bg-[#f4f4f4] p-6 rounded-2xl border-t-4 border-[#00523e] shadow-sm">
            <h3 className="font-black text-xl text-[#00523e] uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">
              {pageData.category}
            </h3>
            <ul className="space-y-4 text-sm font-bold text-gray-600">
              <li onClick={() => navigate('/page/diversity')} className="hover:text-[#00523e] cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12}/> Diversity & Inclusion</li>
              <li onClick={() => navigate('/page/approach')} className="hover:text-[#00523e] cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12}/> Academic Approach</li>
              <li onClick={() => navigate('/page/life')} className="hover:text-[#00523e] cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12}/> Life at Overlake</li>
              <li onClick={() => navigate('/page/journey')} className="hover:text-[#00523e] cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12}/> Admissions Journey</li>
            </ul>
          </div>
          
          <div className="mt-8 p-6 bg-[#00523e] text-white rounded-2xl text-center shadow-md">
            <h4 className="font-bold uppercase tracking-wider mb-2 text-[#f2a900]">Visit Our Campus</h4>
            <p className="text-sm opacity-90 mb-4">Experience learning in our 75-acre natural setting.</p>
            <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-[#00523e] px-4 py-2.5 text-xs font-black uppercase tracking-wider w-full rounded-full hover:bg-white transition-colors">
              Schedule a Tour
            </button>
          </div>
        </div>

        <div className="w-full md:w-3/4">
          <div className="prose max-w-none">
            <p className="text-2xl text-gray-700 leading-relaxed font-semibold mb-8">
              {pageData.content}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <img src={pageData.img} alt="Detail" className="w-full h-56 object-cover rounded-2xl shadow-md" />
              <div className="bg-[#f4f4f4] p-8 rounded-2xl shadow-sm flex flex-col justify-center border-l-4 border-[#f2a900]">
                <h4 className="text-xl font-black text-[#00523e] uppercase mb-3">Academic Excellence</h4>
                <p className="text-gray-600 text-sm leading-relaxed">Our programs empower students to discover their passions, think critically, and lead with empathy in a complex world.</p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => navigate('/apply')} className="bg-[#00523e] text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#f2a900] hover:text-[#00523e] transition-colors shadow-md">
                Inquire Online
              </button>
              <button onClick={() => navigate('/')} className="border-2 border-[#00523e] text-[#00523e] px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#00523e] hover:text-white transition-colors">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="w-full bg-red-600 text-white font-black text-center py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner">
        ⚠️ This is a demo version / ระบบนี้เป็นเพียงเวอร์ชันทดลอง ⚠️
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#111] text-white py-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-800 pb-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00523e] text-white rounded-xl flex items-center justify-center font-black text-2xl">O</div>
            <div>
              <div className="font-black text-xl uppercase tracking-widest">The Overlake School</div>
              <div className="text-gray-400 text-sm">20301 NE 108th St, Redmond, WA 98053</div>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => navigate('/login')} className="border border-white/20 hover:border-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">Portals</button>
             <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-[#00523e] hover:bg-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">Apply Now</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-gray-500 text-xs text-center">
          &copy; {new Date().getFullYear()} The Overlake School. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default PublicPage;
