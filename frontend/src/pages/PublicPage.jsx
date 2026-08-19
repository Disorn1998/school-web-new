import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ChevronRight, ArrowRight, BookOpen, Users, Compass, ShieldCheck, Heart, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

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
  // English (EN)
  EN: {
    // Meet SSS
    "diversity": { title: "Diversity & Inclusion", category: "Meet SSS", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200", content: "Diversity is the vibrant heartbeat of Simple School System (SSS). We are dedicated to cultivating an inclusive, welcoming community where every culture, perspective, and background is celebrated. SSS actively weaves equity, cultural competence, and belonging into our curriculum, leadership, and daily interactions." },
    "staff": { title: "Faculty & Staff", category: "Meet SSS", img: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1200", content: "Our world-class faculty members are leaders in their fields with over 80% holding advanced master's and doctoral degrees. They serve not only as exceptional classroom teachers but as mentors, advisors, and coaches who inspire curiosity and moral integrity in every student." },
    "leadership": { title: "Leadership Team & Board", category: "Meet SSS", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200", content: "Guided by our Head of School and Board of Trustees, SSS leadership steers our educational vision toward continuous innovation, rigorous academics, and sustainable stewardship, ensuring SSS remains at the global forefront of K-12 education." },
    "annual-report": { title: "Annual Report & Financials", category: "Meet SSS", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200", content: "Explore our transparent financial stewardship, philanthropic milestones, and academic accomplishments. Our robust endowment and prudent financial planning guarantee long-term educational excellence and state-of-the-art campus enhancements." },
    "careers": { title: "Careers at SSS", category: "Meet SSS", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", content: "Join a vibrant community of educators and professionals at Simple School System. We offer highly competitive salaries, full healthcare benefits, continuous international professional development, and an empowering, collaborative workplace culture." },
    "mission": { title: "Mission, Vision & Core Values", category: "Meet SSS", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "SSS cultivates bold changemakers who learn by doing amid a challenging, inquiry-driven curriculum, sparking a lifelong passion to create positive change and ethical leadership in the world." },
    
    // Academics
    "approach": { title: "Academic Approach & Philosophy", category: "Academics", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200", content: "Our experiential, inquiry-based pedagogical approach encourages students to ask bold questions, test scientific hypotheses, and apply theoretical principles to solve complex real-world challenges through interdisciplinary projects." },
    "middle-school": { title: "Middle School (Grades 5-8)", category: "Academics", img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200", content: "Middle School at SSS provides a supportive yet academically rigorous environment where emerging adolescents discover their unique intellectual passions, build fundamental research skills, and develop strong moral character." },
    "upper-school": { title: "Upper School (Grades 9-12)", category: "Academics", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200", content: "Upper School challenges students with Advanced Placement (AP) coursework, university-level honors electives, independent capstone dissertations, and global leadership opportunities that prepare them for top international universities." },
    "departments": { title: "Academic Departments", category: "Academics", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200", content: "From STEM, Robotics, and Computer Science to Humanities, World Languages, Fine Arts, and Social Sciences, our specialized departments provide deep academic pathways tailored to each student's career aspirations." },
    "signature-programs": { title: "Signature Programs & Project Week", category: "Academics", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200", content: "Experience unique SSS flagship programs including annual Project Week immersion, outdoor wilderness leadership, AI bio-informatics research, and international community exchange initiatives." },

    // Community
    "life": { title: "Life at SSS", category: "Community", img: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200", content: "Every day on our 75-acre woodland campus brings authentic friendships, spirited school traditions, student-led assemblies, and vibrant shared memories that unite our entire community." },
    "arts": { title: "Visual & Performing Arts", category: "Community", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200", content: "Our comprehensive arts academy nurtures creative expression through symphony orchestra, jazz band, choir, theatrical stage productions, ceramic sculpting, digital graphic design, and cinematography." },
    "athletics": { title: "Athletics & Sports Program", category: "Community", img: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200", content: "SSS fields over 30 competitive athletic teams across 15+ sports, competing in state and regional championships while instilling sportsmanship, physical wellness, resilience, and teamwork." },
    "counseling": { title: "College Counseling & Advising", category: "Community", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "Our dedicated four-year college counseling program provides one-on-one personalized roadmap planning, portfolio reviews, and admissions strategy, maintaining our 100% university acceptance rate." },
    "leadership-students": { title: "Student Leadership & Clubs", category: "Community", img: "https://images.unsplash.com/photo-1519452285881-2bf008ee5236?q=80&w=1200", content: "Students run our Student Government Association, lead 50+ diverse campus clubs (Robotics, Model UN, Debate, Environmental Action), and spearhead impactful local community service initiatives." },
    "support": { title: "Student Support & Wellness", category: "Community", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200", content: "Our dedicated Student Support Center integrates learning specialists, clinical counselors, and health staff to provide tailored academic accommodations and emotional wellness for every student." },

    // Admissions
    "journey": { title: "Begin Your Admissions Journey", category: "Admissions", img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200", content: "We warmly welcome curious minds and ambitious learners. Discover our admissions roadmap, view key deadline milestones, and take the first step toward joining the SSS student community." },
    "affording": { title: "Affording SSS & Financial Aid", category: "Admissions", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200", content: "With over $1.8M awarded annually in need-based financial aid, SSS is dedicated to ensuring socioeconomic diversity and welcoming every qualified student regardless of family financial circumstance." },
    "testing": { title: "Testing & Evaluation Process", category: "Admissions", img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200", content: "Learn about our holistic evaluation review, student writing assessments, recommendation letter requirements, and interactive student interview process." },
    "transportation": { title: "School Transportation & Bus Routes", category: "Admissions", img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200", content: "Our safe, modern bus fleet operates across comprehensive daily routes connecting our 75-acre campus with surrounding metropolitan neighborhoods and transit hubs." },
    "apply": { title: "Online Application Portal", category: "Admissions", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "Submit your online registration, upload student transcripts, and track your application status in real-time through our modern admissions portal." },

    // Utility
    "alumni": { title: "Alumni Network & Relations", category: "Community", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "Our global alumni network connects thousands of SSS graduates worldwide who are leaders in technology, medicine, law, public policy, arts, and entrepreneurship." },
    "giving": { title: "Giving & Philanthropy", category: "Meet SSS", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200", content: "Your charitable support empowers student financial aid, cutting-edge STEM laboratories, and faculty excellence, making an immediate transformative impact on current and future generations." },
    "calendar": { title: "Academic Calendar & Schedules", category: "Academics", img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200", content: "Stay informed on all upcoming SSS academic term dates, holiday breaks, parent-teacher conferences, athletic fixtures, and performing arts concert schedules." },
    "news": { title: "School News & Highlights", category: "Meet SSS", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200", content: "Read the latest stories, student competition victories, faculty research publications, and campus development updates from Simple School System (SSS)." }
  },

  // Thai (TH)
  TH: {
    "diversity": { title: "ความหลากหลายและความเท่าเทียม", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200", content: "ความหลากหลายคือพลังของ Simple School System (SSS) เรามุ่งมั่นสร้างชุมชนที่เปิดกว้างและยอมรับทุกความแตกต่างทางวัฒนธรรม เพื่อสร้างความเท่าเทียมและปลูกฝังความเข้าใจอันดีให้แก่นักเรียนทุกคน" },
    "staff": { title: "คณาจารย์และบุคลากร", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?q=80&w=1200", content: "คณาจารย์ผู้ทรงคุณวุฒิระดับนานาชาติกว่า 80% สำเร็จการศึกษาระดับปริญญาโทและเอก พร้อมเป็นทั้งครูผู้สอนและที่ปรึกษาที่คอยจุดประกายการเรียนรู้และเสริมสร้างทักษะชีวิต" },
    "leadership": { title: "คณะผู้บริหารและกรรมการโรงเรียน", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200", content: "ทีมผู้บริหารและคณะกรรมการโรงเรียน มุ่งมั่นพัฒนาวิสัยทัศน์ทางการศึกษาเพื่อนำพาโรงเรียน SSS ก้าวสู่มาตรฐานระดับสากลอย่างยั่งยืน" },
    "annual-report": { title: "รายงานประจำปีและสถานะการเงิน", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200", content: "รายงานความโปร่งใสทางด้านการเงิน ความสำเร็จทางวิชาการ และการเติบโตของโรงเรียน SSS ในรอบปีที่ผ่านมา" },
    "careers": { title: "ร่วมงานกับ SSS", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", content: "ร่วมเป็นส่วนหนึ่งขององค์กรการศึกษาชั้นนำ พร้อมโอกาสในการพัฒนาสายอาชีพ ผลตอบแทนที่คุ้มค่า และสวัสดิการที่ยอดเยี่ยม" },
    "mission": { title: "พันธกิจ วิสัยทัศน์ และค่านิยมหลัก", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "บ่มเพาะผู้นำแห่งการเปลี่ยนแปลงที่กล้าหาญ ผ่านการลงมือปฏิบัติจริงและการเรียนรู้ที่ท้าทาย เพื่อสร้างผลกระทบเชิงบวกให้แก่สังคมโลก" },

    "approach": { title: "แนวทางการเรียนรู้และหลักสูตร", category: "วิชาการ", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200", content: "หลักสูตรที่เน้นการสืบเสาะและการลงมือปฏิบัติจริง ช่วยให้นักเรียนกล้าตั้งคำถาม คิดค้นทฤษฎี และประยุกต์ใช้ความรู้ในการแก้ปัญหาจริง" },
    "middle-school": { title: "ระดับมัธยมศึกษาตอนต้น (เกรด 5-8)", category: "วิชาการ", img: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200", content: "สภาพแวดล้อมที่อบอุ่นและท้าทาย ช่วยให้นักเรียนค้นพบจุดแข็งของตนเอง สร้างพื้นฐานความรู้ที่แข็งแกร่ง และเสริมสร้างความมั่นใจ" },
    "upper-school": { title: "ระดับมัธยมศึกษาตอนปลาย (เกรด 9-12)", category: "วิชาการ", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200", content: "หลักสูตรระดับสูง (AP และ Honors) พร้อมโอกาสในการแสดงภาวะผู้นำ เพื่อเตรียมความพร้อมสู่มหาวิทยาลัยชั้นนำระดับโลก" },
    "departments": { title: "กลุ่มสาระการเรียนรู้เฉพาะทาง", category: "วิชาการ", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200", content: "ตั้งแต่สาขา STEM วิทยาการคอมพิวเตอร์ ไปจนถึงมนุษยศาสตร์และภาษาต่างประเทศ เรามีหลักสูตรที่บูรณาการอย่างลึกซึ้ง" },
    "signature-programs": { title: "หลักสูตรเฉพาะทางและสัปดาห์โครงงาน", category: "วิชาการ", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200", content: "สัมผัสประสบการณ์เรียนรู้ที่เป็นเอกลักษณ์ เช่น สัปดาห์โครงงาน Project Week การศึกษาธรรมชาติกลางแจ้ง และโครงงานวิจัยอิสระ" },

    "life": { title: "ชีวิตในรั้ว SSS", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=1200", content: "ทุกวันในวิทยาเขตธรรมชาติ 190 ไร่ เต็มไปด้วยมิตรภาพ ความอบอุ่น และกิจกรรมประเพณีของโรงเรียนที่น่าจดจำ" },
    "arts": { title: "ศิลปะและการแสดง", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200", content: "ส่งเสริมความคิดสร้างสรรค์ผ่านทัศนศิลป์ ดนตรี วงดุริยางค์ การขับร้องประสานเสียง และการแสดงละครเวที" },
    "athletics": { title: "การกีฬาและกิจกรรมพลศึกษา", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200", content: "ทีมนักกีฬา SSS เข้าร่วมการแข่งขันมากกว่า 15 ชนิดกีฬา เพื่อปลูกฝังน้ำใจนักกีฬา ความอดทน และการทำงานเป็นทีม" },
    "counseling": { title: "แนะแนวศึกษาต่อมหาวิทยาลัย", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "การให้คำปรึกษารายบุคคลแบบเข้มข้นตลอด 4 ปี เพื่อช่วยให้นักเรียนได้รับการตอบรับเข้าศึกษาในมหาวิทยาลัยที่ตรงกับเป้าหมายสูงสุด" },
    "leadership-students": { title: "ผู้นำนักเรียนและชมรม", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1519452285881-2bf008ee5236?q=80&w=1200", content: "นักเรียนเป็นผู้นำสภานักเรียน บริหารชมรมมากกว่า 50 ชมรม และจัดกิจกรรมบริการสังคมที่สร้างประโยชน์อย่างแท้จริง" },
    "support": { title: "ศูนย์สนับสนุนและสุขภาวะนักเรียน", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200", content: "บริการให้คำปรึกษาทางวิชาการและสุขภาพจิต เพื่อส่งเสริมสุขภาวะที่ดีรอบด้านให้แก่นักเรียนทุกคน" },

    "journey": { title: "เริ่มต้นเส้นทางการเรียนรู้", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1200", content: "ยินดีต้อนรับนักเรียนผู้มีความกระตือรือร้นและรักการเรียนรู้ เรียนรู้กำหนดการ เกณฑ์การรับสมัคร และขั้นตอนการเข้าศึกษา ณ SSS" },
    "affording": { title: "ค่าเล่าเรียนและทุนการศึกษา", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200", content: "ด้วยทุนการศึกษามากกว่า $1.8M ในแต่ละปี เรามุ่งมั่นมอบโอกาสทางการศึกษาให้แก่นักเรียนที่มีศักยภาพทุกคน" },
    "testing": { title: "การสอบประเมินและการสัมภาษณ์", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200", content: "ข้อมูลเกี่ยวกับเกณฑ์การพิจารณาแบบองค์รวม การประเมินความสามารถ และแนวทางการสัมภาษณ์นักเรียน" },
    "transportation": { title: "บริการรถรับส่งนักเรียน", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200", content: "เส้นทางรถโรงเรียนที่ครอบคลุม เชื่อมต่อวิทยาเขต SSS กับพื้นที่สำคัญโดยรอบอย่างสะดวกและปลอดภัย" },
    "apply": { title: "สมัครเรียนออนไลน์", category: "การรับสมัคร", img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200", content: "กรอกข้อมูลและยื่นใบสมัครออนไลน์ผ่านระบบพอร์ทัลเพื่อเริ่มต้นการเดินทางที่ยอดเยี่ยมที่ SSS" },

    "alumni": { title: "สมาคมศิษย์เก่า SSS", category: "ชุมชนและการใช้ชีวิต", img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200", content: "เครือข่ายศิษย์เก่า SSS ที่กระจายตัวอยู่ทั่วโลก สร้างความร่วมมือและส่งต่อความสำเร็จสู่รุ่นน้องต่อไป" },
    "giving": { title: "การบริจาคและสนับสนุนการศึกษา", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200", content: "การสนับสนุนของท่านช่วยต่อยอดทุนการศึกษาและพัฒนาห้องปฏิบัติการเพื่อประโยชน์สูงสุดของนักเรียน" },
    "calendar": { title: "ปฏิทินการศึกษาและกิจกรรม", category: "วิชาการ", img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200", content: "ตรวจสอบกำหนดการเปิดภาคเรียน วันหยุด กิจกรรมกีฬา และงานแสดงประจำปีของโรงเรียน SSS ได้ที่นี่" },
    "news": { title: "ข่าวสารและบทความเด่น", category: "รู้จัก SSS", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200", content: "ติดตามข่าวสารความสำเร็จของนักเรียน กิจกรรมใหม่ๆ และความเคลื่อนไหวล่าสุดของ Simple School System (SSS)" }
  }
};

const PublicPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
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

  const langKey = pageContentData[currentLang.code] ? currentLang.code : "EN";
  const defaultPage = {
    title: slug ? slug.replace(/-/g, ' ').toUpperCase() : "INFORMATION",
    category: currentLang.code === 'TH' ? "ข้อมูลโรงเรียน SSS" : "SSS Information",
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200",
    content: currentLang.code === 'TH' 
      ? "ยินดีต้อนรับสู่ Simple School System (SSS) รายละเอียดของหัวข้อนี้พร้อมให้บริการแล้ว สามารถติดต่อฝ่ายรับสมัครเพื่อรับข้อมูลเพิ่มเติม" 
      : "Welcome to Simple School System (SSS). Information about this topic is available and our admissions office is ready to assist with any questions."
  };

  const pageData = (pageContentData[langKey] && pageContentData[langKey][slug]) || pageContentData["EN"][slug] || defaultPage;

  return (
    <div className="w-full min-h-screen font-sans bg-white text-slate-800 flex flex-col">
      
      {/* Luxury Royal Navy Top Utility Bar */}
      <div className="hidden md:flex w-full bg-gradient-to-r from-[#0c1b33] via-[#0f284e] to-[#0a192f] text-white py-2 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50 shadow-md border-b border-blue-500/20">
        <span onClick={() => navigate('/login')} className="hover:text-[#f59e0b] cursor-pointer transition-colors">Portals</span>
        <span onClick={() => navigate('/')} className="hover:text-[#f59e0b] cursor-pointer transition-colors">Home</span>
        
        {/* Language Switcher */}
        <div className="relative ml-4 border-l border-white/20 pl-6">
          <button 
            onClick={() => setLangOpen(!langOpen)} 
            className="flex items-center gap-2.5 bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 px-3.5 py-1.5 rounded-full transition-all border border-blue-300/30 shadow-sm active:scale-95 cursor-pointer"
          >
            <FlagIcon code={currentLang.code} className="w-5 h-3.5 shadow-sm" />
            <span className="font-extrabold text-white text-xs tracking-wider">{currentLang.code}</span>
            <ChevronDown size={14} className={`text-white/80 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {langOpen && (
            <div className="absolute top-[125%] right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 transform origin-top-right animate-fade-in">
              {languages.map(lang => (
                <div 
                  key={lang.code} 
                  onClick={() => changeLanguage(lang)} 
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-150 border-b border-slate-50 last:border-0 ${currentLang.code === lang.code ? 'bg-blue-50 font-black text-blue-900' : 'text-slate-700'}`}
                >
                  <FlagIcon code={lang.code} className="w-6 h-4 shadow-sm" />
                  <span className="font-bold text-xs uppercase tracking-wider">{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Luxury Navy Navigation */}
      <nav className="w-full z-40 bg-[#0c1b33] py-4 px-8 flex justify-between items-center shadow-lg sticky top-0 border-b border-blue-900/40">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl bg-gradient-to-br from-white to-blue-50 text-[#0c1b33] shadow-md group-hover:scale-105 transition-transform border border-white/40">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black tracking-tight uppercase text-white leading-none">
              SSS
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f59e0b]">
              ACADEMY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-white/90 hover:text-[#f59e0b] font-bold text-sm uppercase tracking-wider hidden md:block transition-colors">
            ← {currentLang.code === 'TH' ? 'กลับหน้าแรก' : 'Back to Home'}
          </button>
          <button onClick={() => navigate('/apply')} className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-slate-950 px-6 py-2.5 rounded-full font-black uppercase tracking-wider text-xs hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 transition-all shadow-md">
            {currentLang.code === 'TH' ? 'สมัครเรียนออนไลน์' : 'Inquire / Apply'}
          </button>
        </div>
      </nav>

      {/* Hero Banner (Luxury Royal Navy Deep Gradient) */}
      <div className="w-full h-80 md:h-[420px] relative overflow-hidden bg-slate-950">
        <img src={pageData.img} alt={pageData.title} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1b33] via-[#0c1b33]/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[#f59e0b] font-bold text-sm uppercase tracking-wider mb-4">
            <Link to="/" className="hover:text-white transition-colors">{currentLang.code === 'TH' ? 'หน้าหลัก' : 'Home'}</Link>
            <ChevronRight size={14} />
            <span>{pageData.category}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-xl">
            {pageData.title}
          </h1>
        </div>
      </div>

      {/* Content Section (Pure Crisp White & Ice Slate) */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/4 hidden md:block">
          <div className="bg-[#f8fafc] p-6 rounded-3xl border-t-4 border-blue-900 shadow-md">
            <h3 className="font-black text-lg text-[#0c1b33] uppercase tracking-wider mb-6 pb-4 border-b border-slate-200">
              {pageData.category}
            </h3>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li onClick={() => navigate('/page/diversity')} className="hover:text-blue-900 cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12} className="text-[#f59e0b]"/> Diversity & Inclusion</li>
              <li onClick={() => navigate('/page/approach')} className="hover:text-blue-900 cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12} className="text-[#f59e0b]"/> Academic Approach</li>
              <li onClick={() => navigate('/page/life')} className="hover:text-blue-900 cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12} className="text-[#f59e0b]"/> Life at SSS</li>
              <li onClick={() => navigate('/page/journey')} className="hover:text-blue-900 cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12} className="text-[#f59e0b]"/> Admissions Journey</li>
              <li onClick={() => navigate('/page/affording')} className="hover:text-blue-900 cursor-pointer flex items-center gap-2 hover:translate-x-1 transition-transform"><ArrowRight size={12} className="text-[#f59e0b]"/> Tuition & Financial Aid</li>
            </ul>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-900 to-[#0c1b33] text-white rounded-3xl text-center shadow-xl border border-blue-800/40">
            <h4 className="font-black uppercase tracking-wider mb-2 text-[#f59e0b]">{currentLang.code === 'TH' ? 'เยี่ยมชมโรงเรียน SSS' : 'Visit SSS Campus'}</h4>
            <p className="text-xs text-blue-100 mb-4">{currentLang.code === 'TH' ? 'สัมผัสบรรยากาศการเรียนรู้ในพื้นที่ธรรมชาติ 75 เอเคอร์' : 'Experience learning in our 75-acre natural woodland setting.'}</p>
            <button onClick={() => navigate('/apply')} className="bg-[#f59e0b] text-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider w-full rounded-full hover:bg-white transition-all shadow-md">
              {currentLang.code === 'TH' ? 'นัดหมายเยี่ยมชม' : 'Schedule a Tour'}
            </button>
          </div>
        </div>

        <div className="w-full md:w-3/4">
          <div className="prose max-w-none">
            <p className="text-2xl text-slate-800 leading-relaxed font-semibold mb-8">
              {pageData.content}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <img src={pageData.img} alt="Detail" className="w-full h-56 object-cover rounded-3xl shadow-lg border-2 border-slate-100" />
              <div className="bg-[#f8fafc] p-8 rounded-3xl shadow-sm flex flex-col justify-center border-l-4 border-[#f59e0b]">
                <h4 className="text-xl font-black text-[#0c1b33] uppercase mb-3">{currentLang.code === 'TH' ? 'จุดเด่นของหลักสูตร SSS' : 'Academic Excellence'}</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {currentLang.code === 'TH'
                    ? 'หลักสูตรของ SSS มุ่งเน้นการพัฒนาผู้เรียนรอบด้าน ทั้งทางวิชาการ คุณธรรม และทักษะการเป็นผู้นำแห่งอนาคต'
                    : 'Our programs empower students to discover their passions, think critically, and lead with empathy in a complex world.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => navigate('/apply')} className="bg-gradient-to-r from-blue-900 to-[#0c1b33] text-white px-8 py-3.5 rounded-full font-black uppercase tracking-wider text-xs hover:brightness-110 transition-all shadow-md border border-blue-800">
                {currentLang.code === 'TH' ? 'กรอกใบสมัครออนไลน์' : 'Inquire Online'}
              </button>
              <button onClick={() => navigate('/')} className="border-2 border-blue-900 text-blue-900 px-8 py-3.5 rounded-full font-black uppercase tracking-wider text-xs hover:bg-blue-900 hover:text-white transition-all">
                {currentLang.code === 'TH' ? 'กลับสู่หน้าหลัก' : 'Back to Home'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="w-full bg-red-600 text-white font-black text-center py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner">
        ⚠️ This is a demo version / ระบบนี้เป็นเพียงเวอร์ชันทดลอง ⚠️
      </div>

      {/* Footer (Luxury Midnight Black & Royal Navy) */}
      <footer className="w-full bg-[#030914] text-white py-12 px-8 mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800 pb-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-[#0c1b33] text-white rounded-2xl flex items-center justify-center font-black text-2xl border border-blue-500/40">S</div>
            <div>
              <div className="font-black text-xl uppercase tracking-widest">Simple School System (SSS)</div>
              <div className="text-slate-400 text-sm">20301 SSS Campus Way, Redmond, WA 98053 • questions@simpleschool.com</div>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => navigate('/login')} className="border border-white/20 hover:border-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">Portals</button>
             <button onClick={() => navigate('/apply')} className="bg-[#f59e0b] text-slate-950 hover:bg-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md">Apply Now</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-slate-500 text-xs text-center">
          &copy; {new Date().getFullYear()} Simple School System (SSS). All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default PublicPage;
