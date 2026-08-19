import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ArrowRight, Users, ShieldAlert, Globe, MapPin, Compass, BookOpen, Heart } from 'lucide-react';

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

const translations = {
  EN: {
    utility: [
      { name: "MyOverlake", path: "/login" },
      { name: "Alumni", path: "/page/alumni" },
      { name: "Giving", path: "/page/giving" },
      { name: "Calendar", path: "/page/calendar" },
      { name: "News", path: "/page/news" }
    ],
    mainNav: [
      {
        name: "Meet Overlake",
        links: [
          { name: "Diversity & Inclusion", path: "diversity" },
          { name: "Meet Our Faculty & Staff", path: "staff" },
          { name: "Meet Our Leadership", path: "leadership" },
          { name: "Annual Report", path: "annual-report" },
          { name: "Careers", path: "careers" },
          { name: "Mission, Vision, Values", path: "mission" }
        ]
      },
      {
        name: "Academics",
        links: [
          { name: "Academic Approach", path: "approach" },
          { name: "Middle School", path: "middle-school" },
          { name: "Upper School", path: "upper-school" },
          { name: "Academic Departments", path: "departments" },
          { name: "Signature Programs", path: "signature-programs" }
        ]
      },
      {
        name: "Community",
        links: [
          { name: "Life at Overlake", path: "life" },
          { name: "Arts", path: "arts" },
          { name: "Athletics", path: "athletics" },
          { name: "College Counseling", path: "counseling" },
          { name: "Student Leadership", path: "leadership-students" },
          { name: "Student Support", path: "support" }
        ]
      },
      {
        name: "Admissions",
        links: [
          { name: "Begin Your Journey", path: "journey" },
          { name: "Affording Overlake", path: "affording" },
          { name: "Testing", path: "testing" },
          { name: "Transportation", path: "transportation" },
          { name: "Apply", path: "apply" }
        ]
      }
    ],
    inquireBtn: "Inquire",
    heroTitle1: "Inspire",
    heroTitle2: "Excellence",
    heroDesc: "Dedicated to inspiring excellence, developing intellectual curiosity, and teaching students to lead in a changing world.",
    studentLoginBtn: "Student & Parent Login",
    staffLoginBtn: "Staff & Admin Portal",
    aboutTitle: "About Overlake",
    aboutSubtitle: "We’re a school where curiosity thrives, connections deepen, and character flourishes.",
    ourPurposeTitle: "Our Purpose",
    ourPurposeDesc: "Overlake cultivates bold changemakers who learn by doing amid challenging curriculum, sparking a lifelong passion to create positive change in the world beyond our classrooms and campus.",
    ourPromiseTitle: "Our Promise",
    ourPromiseDesc: "Students are at the heart of everything we do, and Overlake is an academic community with strong co-curriculars where wellbeing, deep connections, and purpose drive discovery—because education is an adventure.",
    owlsEyeTitle: "An Owls Eye View of Overlake",
    stat1Number: "575",
    stat1Desc: "Young students from grades 5-12 all finding their unique paths",
    stat2Number: "7:1",
    stat2Desc: "Student-to-teacher ratio that nurtures authentic connection",
    stat3Number: "$1.8M",
    stat3Desc: "Financial aid granted making Overlake accessible to every promising student",
    stat4Number: "75",
    stat4Desc: "Acres of immersion and wonder where learning comes alive outdoors",
    campusTitle: "Our Campus",
    campusSubtitle: "A wonderland where the evergreens whisper and the outdoors becomes the classroom.",
    campusP1: "Step foot onto our campus and feel it immediately—this place sings. Our evergreens create natural hideaways and invite impromptu gatherings, with winding trails connecting them all together. Here, learning isn’t contained to the classroom—it spills outdoors where students sketch under trees, debate by buildings, and ponder within our forestry.",
    campusHighlight: "Students find room to grow, wonder, and discover at Overlake.",
    campusP2: "The world expands beyond our campus’s perimeter. Whether wandering through Pacific Northwest forests, lending a hand in global service, or connecting with neighbors right here in Redmond, this is where students broaden their horizons and find their place in the world. Overlake is rooted in earnestness: asking questions that invite imagination, building relationships that last, and caring deeply about each other and our planet.",
    campusTags: "Local • Regional • Global",
    acresTitle: "75 Acres of Possibility",
    acresDesc: "Just a stone's throw from downtown Redmond, our sprawling campus feels like stepping into another world. Here, forest trails entice explorers, meadows host gatherings, and every corner invites a moment to pause, reflect, or dream. We've created this special place where nature's calm meets the buzz of learning—giving students room to breathe while keeping them anchored to Seattle’s vibrant energy.",
    tourTitle: "Explore Our 3D Campus",
    tourDesc: "Take a virtual tour of our state-of-the-art facilities. Click and drag to rotate the 3D model, scroll to zoom in and out.",
    live3d: "INTERACTIVE 3D",
    onlyTitle: "Only at Overlake",
    onlySubtitle: "Where dynamic, authentic experiences shape tomorrow’s leaders.",
    cards: [
      { title: "Tuition Support", desc: "Investing in promising futures." },
      { title: "Our Campus", desc: "Learning spreads freely in nature’s classroom." },
      { title: "Service Learning", desc: "Service-empowered learning that transforms." },
      { title: "Project Week", desc: "Imagination becomes real-world practice." },
      { title: "Immersive Learning", desc: "Under the open sky." },
      { title: "Clubs & Activities", desc: "Find your people, build your passion." }
    ],
    exploreBtn: "Explore",
    makesUsTitle: "Here’s what makes us, us:",
    makesUsSubtitle: "Overlake is where learning takes flight; in every curious question and kind gesture, students are invited to become well-rounded humans.",
    chartPath: "Chart a path through our forest of possibilities.",
    pillars: [
      { title: "Learn", desc: "Students dive into a world that sparks wonder—where questions lead to discoveries and classroom walls extend outdoors." },
      { title: "Experience", desc: "Classmates delve into a vibrant community—where the connections are genuine, and seasons of wonder become lifelong passions." },
      { title: "Apply", desc: "Step into a new adventure that feels less like applying to a school and more like finding your child’s second home." }
    ],
    actionInquire: "Inquire",
    actionVisit: "Visit",
    actionApply: "Apply",
    demoBanner: "⚠️ This is a demo version / ระบบนี้เป็นเพียงเวอร์ชันทดลอง ⚠️",
    footerMeetTitle: "Meet Overlake",
    footerAcademicsTitle: "Academics",
    footerCommunityTitle: "Community",
    footerAdmissionsTitle: "Admissions",
    footerAddress: "20301 NE 108th St\nRedmond, WA 98053\nquestions@overlake.org\n425-868-1000",
    footerDisclaimer: "The Overlake School is committed to diversity and does not discriminate on the basis of race, color, religion, national or ethnic origin, socio-economic status, gender, sexual orientation, or disability, or other legally protected class, in the administration of its educational policies, admissions policies, financial aid programs, athletics, or other school-administered programs.",
    copyright: "© 2026 Overlake School. All rights reserved.",
    terms: "Terms",
    privacy: "Privacy",
    doNotSell: "Do Not Sell My Info"
  },
  TH: {
    utility: [
      { name: "พอร์ทัลของฉัน", path: "/login" },
      { name: "ศิษย์เก่า", path: "/page/alumni" },
      { name: "การบริจาค", path: "/page/giving" },
      { name: "ปฏิทิน", path: "/page/calendar" },
      { name: "ข่าวสาร", path: "/page/news" }
    ],
    mainNav: [
      {
        name: "รู้จัก Overlake",
        links: [
          { name: "ความหลากหลายและความเท่าเทียม", path: "diversity" },
          { name: "คณาจารย์และบุคลากร", path: "staff" },
          { name: "คณะผู้บริหาร", path: "leadership" },
          { name: "รายงานประจำปี", path: "annual-report" },
          { name: "ร่วมงานกับเรา", path: "careers" },
          { name: "พันธกิจ วิสัยทัศน์ และค่านิยม", path: "mission" }
        ]
      },
      {
        name: "วิชาการ",
        links: [
          { name: "แนวทางการเรียนรู้", path: "approach" },
          { name: "ระดับมัธยมศึกษาตอนต้น", path: "middle-school" },
          { name: "ระดับมัธยมศึกษาตอนปลาย", path: "upper-school" },
          { name: "กลุ่มสาระการเรียนรู้", path: "departments" },
          { name: "หลักสูตรเฉพาะทาง", path: "signature-programs" }
        ]
      },
      {
        name: "ชุมชนและการใช้ชีวิต",
        links: [
          { name: "ชีวิตในรั้ว Overlake", path: "life" },
          { name: "ศิลปะและการแสดง", path: "arts" },
          { name: "การกีฬา", path: "athletics" },
          { name: "แนะแนวศึกษาต่อมหาวิทยาลัย", path: "counseling" },
          { name: "ผู้นำนักเรียน", path: "leadership-students" },
          { name: "ศูนย์สนับสนุนนักเรียน", path: "support" }
        ]
      },
      {
        name: "การรับสมัคร",
        links: [
          { name: "เริ่มต้นเส้นทางการเรียนรู้", path: "journey" },
          { name: "ค่าเล่าเรียนและทุนการศึกษา", path: "affording" },
          { name: "การสอบประเมิน", path: "testing" },
          { name: "บริการรถรับส่ง", path: "transportation" },
          { name: "สมัครเรียนออนไลน์", path: "apply" }
        ]
      }
    ],
    inquireBtn: "สอบถามข้อมูล",
    heroTitle1: "จุดประกาย",
    heroTitle2: "สู่ความเป็นเลิศ",
    heroDesc: "มุ่งมั่นในการสร้างแรงบันดาลใจสู่ความเป็นเลิศ พัฒนาความอยากรู้อยากเห็นทางสติปัญญา และปลูกฝังความเป็นผู้นำในโลกที่เปลี่ยนแปลงอย่างรวดเร็ว",
    studentLoginBtn: "เข้าสู่ระบบ นักเรียน / ผู้ปกครอง",
    staffLoginBtn: "เข้าสู่ระบบ ครูและผู้บริหาร",
    aboutTitle: "เกี่ยวกับ Overlake",
    aboutSubtitle: "โรงเรียนที่ความอยากรู้อยากเห็นเบ่งบาน มิตรภาพแน่นแฟ้น และคุณธรรมงดงาม",
    ourPurposeTitle: "เป้าหมายของเรา",
    ourPurposeDesc: "Overlake มุ่งบ่มเพาะผู้นำการเปลี่ยนแปลงที่กล้าหาญ ผ่านการลงมือปฏิบัติจริงควบคู่กับหลักสูตรวิชาการที่ท้าทาย เพื่อสร้างแรงบันดาลใจในการสร้างสรรค์สิ่งดีงามให้แก่โลก",
    ourPromiseTitle: "คำมั่นสัญญาของเรา",
    ourPromiseDesc: "นักเรียนคือหัวใจสำคัญในทุกสิ่งที่เราทำ Overlake เป็นชุมชนวิชาการที่ผสานกิจกรรมเสริมสร้างสุขภาวะ ความผูกพัน และเป้าหมายชีวิต เพราะการศึกษาคือการผจญภัยที่ไม่มีที่สิ้นสุด",
    owlsEyeTitle: "ภาพรวมสถิติแห่งความสำเร็จของ Overlake",
    stat1Number: "575",
    stat1Desc: "นักเรียนระดับเกรด 5-12 ที่กำลังค้นพบเส้นทางเฉพาะตัว",
    stat2Number: "7:1",
    stat2Desc: "อัตราส่วนนักเรียนต่อครูผู้สอน ดูแลอย่างใกล้ชิดและอบอุ่น",
    stat3Number: "65 ลบ.",
    stat3Desc: "ทุนการศึกษา ($1.8M) มอบโอกาสให้นักเรียนทุกคนได้เข้าถึงการศึกษาคุณภาพ",
    stat4Number: "190 ไร่",
    stat4Desc: "พื้นที่ธรรมชาติ 75 เอเคอร์ ที่การเรียนรู้มีชีวิตชีวากลางแจ้ง",
    campusTitle: "บรรยากาศวิทยาเขตของเรา",
    campusSubtitle: "ดินแดนมหัศจรรย์ท่ามกลางต้นไม้เขียวชอุ่มที่ธรรมชาติกลายเป็นห้องเรียน",
    campusP1: "ก้าวแรกสู่โรงเรียน คุณจะสัมผัสได้ถึงพลังแห่งชีวิต ร่มเงาของต้นสนธรรมชาติเปิดโอกาสให้เกิดการพบปะพูดคุย เส้นทางเดินเชื่อมโยงทุกอาคารเข้าหากัน ที่นี่การเรียนรู้ไม่ได้จำกัดอยู่แค่ในห้องสี่เหลี่ยม แต่หลั่งไหลสู่ธรรมชาติภายนอก",
    campusHighlight: "นักเรียนได้เติบโต ค้นพบ และสร้างสรรค์สิ่งใหม่ที่ Overlake",
    campusP2: "โลกการเรียนรู้กว้างไกลเกินกว่าขอบเขตโรงเรียน ไม่ว่าจะเป็นการเดินสำรวจป่า การทำงานบริการสังคมระดับโลก หรือการเชื่อมโยงกับชุมชนในเรดมอนด์ นักเรียนของเราเปิดกว้างมุมมอง ค้นหาจุดยืนในสังคม และใส่ใจซึ่งกันและกันอย่างแท้จริง",
    campusTags: "ระดับท้องถิ่น • ระดับภูมิภาค • ระดับโลก",
    acresTitle: "พื้นที่แห่งโอกาสไร้ขีดจำกัด",
    acresDesc: "ตั้งอยู่ใกล้กับใจกลางเมืองเรดมอนด์ วิทยาเขตอันกว้างขวางของเราให้ความรู้สึกเหมือนก้าวสู่อีกโลกหนึ่ง เส้นทางเดินป่า ลานสนามหญ้า และทุกมุมเชิญชวนให้พักผ่อน สะท้อนคิด หรือฝันถึงอนาคต ผสมผสานความสงบของธรรมชาติเข้ากับพลังการเรียนรู้อย่างลงตัว",
    tourTitle: "สำรวจโรงเรียนแบบจำลอง 3 มิติ (3D Campus)",
    tourDesc: "ทัวร์เสมือนจริงชมสิ่งอำนวยความสะดวกที่ทันสมัย คลิกและลากเพื่อหมุนโมเดล 3D ได้รอบทิศทาง และเลื่อนลูกกลิ้งเมาส์เพื่อซูมเข้า-ออก",
    live3d: "โมเดล 3D แบบอินเทอร์แอคทีฟ",
    onlyTitle: "เอกลักษณ์เฉพาะที่ Overlake",
    onlySubtitle: "ประสบการณ์จริงที่หล่อหลอมและขับเคลื่อนผู้นำแห่งอนาคต",
    cards: [
      { title: "ทุนสนับสนุนการศึกษา", desc: "ร่วมลงทุนในอนาคตที่สดใสของเยาวชน" },
      { title: "วิทยาเขตท่ามกลางธรรมชาติ", desc: "การเรียนรู้ที่เปิดกว้างในห้องเรียนธรรมชาติ" },
      { title: "การบริการเพื่อสังคม", desc: "การเรียนรู้ผ่านการทำประโยชน์ที่เปลี่ยนแปลงโลก" },
      { title: "สัปดาห์โครงงานสร้างสรรค์", desc: "เปลี่ยนจินตนาการสู่การปฏิบัติจริงในโลกแห่งความจริง" },
      { title: "การเรียนรู้จากประสบการณ์จริง", desc: "เสริมสร้างความมั่นใจใต้ท้องฟ้าและธรรมชาติ" },
      { title: "ชมรมและกิจกรรมนักเรียน", desc: "ค้นพบเพื่อนที่รู้ใจและพัฒนาสิ่งที่คุณหลงใหล" }
    ],
    exploreBtn: "ดูรายละเอียด",
    makesUsTitle: "สิ่งที่หล่อหลอมให้เราเป็นเรา:",
    makesUsSubtitle: "Overlake คือที่ที่การเรียนรู้ทะยานไกล ในทุกคำถามแห่งความสงสัยและการเกื้อกูลกัน นักเรียนได้รับโอกาสในการเติบโตเป็นมนุษย์ที่สมบูรณ์แบบ",
    chartPath: "ค้นพบเส้นทางของคุณในป่าแห่งความเป็นไปได้",
    pillars: [
      { title: "การเรียนรู้ (Learn)", desc: "ดำดิ่งสู่โลกแห่งจินตนาการ ที่ซึ่งคำถามนำไปสู่การค้นพบ และห้องเรียนขยายสู่โลกภายนอก" },
      { title: "ประสบการณ์ (Experience)", desc: "ร่วมเป็นส่วนหนึ่งของชุมชนที่อบอุ่น มิตรภาพแท้จริง และความหลงใหลที่กลายเป็นเป้าหมายชีวิต" },
      { title: "สมัครเรียน (Apply)", desc: "เริ่มต้นการเดินทางครั้งใหม่ ที่ให้ความรู้สึกอบอุ่นเหมือนได้พบบ้านหลังที่สองของลูกคุณ" }
    ],
    actionInquire: "สอบถามข้อมูล",
    actionVisit: "นัดหมายเยี่ยมชม",
    actionApply: "สมัครเรียนทันที",
    demoBanner: "⚠️ This is a demo version / ระบบนี้เป็นเพียงเวอร์ชันทดลอง ⚠️",
    footerMeetTitle: "รู้จัก Overlake",
    footerAcademicsTitle: "วิชาการ",
    footerCommunityTitle: "ชุมชนและการใช้ชีวิต",
    footerAdmissionsTitle: "การรับสมัคร",
    footerAddress: "20301 NE 108th St\nRedmond, WA 98053\nquestions@overlake.org\n425-868-1000",
    footerDisclaimer: "โรงเรียน Overlake มุ่งมั่นในความหลากหลายและไม่เลือกปฏิบัติบนพื้นฐานของเชื้อชาติ สีผิว ศาสนา ชาติกำเนิด ภูมิหลังทางเศรษฐกิจและสังคม เพศ รสนิยมทางเพศ หรือความบกพร่องทางร่างกาย ในการดำเนินนโยบายทางการศึกษา การรับสมัคร และทุนการศึกษา",
    copyright: "© 2026 Overlake School. สงวนลิขสิทธิ์ทั้งหมด",
    terms: "เงื่อนไขการใช้งาน",
    privacy: "นโยบายความเป็นส่วนตัว",
    doNotSell: "การคุ้มครองข้อมูลส่วนบุคคล"
  },
  CN: {
    utility: [
      { name: "我的门户", path: "/login" },
      { name: "校友会", path: "/page/alumni" },
      { name: "爱心捐赠", path: "/page/giving" },
      { name: "校历日程", path: "/page/calendar" },
      { name: "校园新闻", path: "/page/news" }
    ],
    mainNav: [
      {
        name: "走进欧弗莱克",
        links: [
          { name: "多元与包容", path: "diversity" },
          { name: "师资与教职工", path: "staff" },
          { name: "领导团队", path: "leadership" },
          { name: "年度发展报告", path: "annual-report" },
          { name: "职业发展机会", path: "careers" },
          { name: "使命、愿景与价值观", path: "mission" }
        ]
      },
      {
        name: "学术课程",
        links: [
          { name: "学术培养模式", path: "approach" },
          { name: "初中部 (5-8年级)", path: "middle-school" },
          { name: "高中部 (9-12年级)", path: "upper-school" },
          { name: "学科教研部门", path: "departments" },
          { name: "特色研究项目", path: "signature-programs" }
        ]
      },
      {
        name: "校园社区",
        links: [
          { name: "欧弗莱克生活", path: "life" },
          { name: "艺术与表演", path: "arts" },
          { name: "体育与竞技", path: "athletics" },
          { name: "升学指导中心", path: "counseling" },
          { name: "学生领导力培养", path: "leadership-students" },
          { name: "学生全面支持体系", path: "support" }
        ]
      },
      {
        name: "招生入学",
        links: [
          { name: "开启求学之旅", path: "journey" },
          { name: "学费与助学金政策", path: "affording" },
          { name: "入学评估与测试", path: "testing" },
          { name: "校车与交通指引", path: "transportation" },
          { name: "在线提交申请", path: "apply" }
        ]
      }
    ],
    inquireBtn: "咨询招生",
    heroTitle1: "激发潜能",
    heroTitle2: "追求卓越",
    heroDesc: "致力于激发学生的卓越追求，培养求知欲，教育学生在不断变化的世界中成为卓越的领导者。",
    studentLoginBtn: "学生与家长登录",
    staffLoginBtn: "教职员工与管理门户",
    aboutTitle: "关于欧弗莱克 (Overlake)",
    aboutSubtitle: "这是一所激发好奇心、深化友谊与塑造品格的卓越学府。",
    ourPurposeTitle: "办学宗旨",
    ourPurposeDesc: "欧弗莱克在挑战性课程中注重知行合一，培养勇敢的变革者，激发终身创造积极世界影响的热情。",
    ourPromiseTitle: "我们的承诺",
    ourPromiseDesc: "学生是我们一切工作的核心。欧弗莱克是一个学术氛围浓厚、课外活动丰富的社区，在健康、信任与使命感的引领下探索未知——因为教育是一场探索之旅。",
    owlsEyeTitle: "欧弗莱克核心概览",
    stat1Number: "575",
    stat1Desc: "5-12年级学生在此探索并走出属于自己的独特道路",
    stat2Number: "7:1",
    stat2Desc: "极具关怀的师生比例，建立深度且真实的教学连接",
    stat3Number: "180万美元",
    stat3Desc: "发放丰厚助学金，让每一位优秀学子都能走进欧弗莱克",
    stat4Number: "75英亩",
    stat4Desc: "沉浸式自然校园，让户外成为充满探索趣味的课堂",
    campusTitle: "我们的校园",
    campusSubtitle: "常青树低语的仙境，大自然即是最具生机的教室。",
    campusP1: "踏入校园，您会立刻感受到生机与活力。常青树营造出自然的休憩之所，林间小径串联起校园各处。在这里，学习从未局限在教室内——它延伸至绿树成荫的户外，学生们在树下素描、在建筑旁辩论、在林间沉思。",
    campusHighlight: "在欧弗莱克，学生拥有充足的空间成长、探索与发现自我。",
    campusP2: "学习的视野超越校园的边界。无论是在西北太平洋森林漫步，参与全球公益服务，还是与社区紧密互动，欧弗莱克引导学生拓宽视野，寻找在世界中的定位，学会真诚提问与关爱彼此及我们的地球。",
    campusTags: "立足本土 • 辐射区域 • 放眼全球",
    acresTitle: "75英亩无限可能",
    acresDesc: "毗邻雷德蒙德市中心，广阔的校园宛如另一个宁静的世界。森林步道吸引探索者，草坪承载欢聚，处处皆是沉思与梦想的理想场所。大自然的宁静与求知的热烈在此完美融合。",
    tourTitle: "探索3D全景数字校园",
    tourDesc: "开启现代化校园虚拟实景之旅。点击并拖拽可360度旋转3D模型，滚动鼠标滚轮可自由缩放查看细节。",
    live3d: "实时3D交互渲染",
    onlyTitle: "欧弗莱克独具特色",
    onlySubtitle: "在充满活力与真实的体验中塑造未来的行业领袖。",
    cards: [
      { title: "助学金计划", desc: "投资无限潜力的未来青年才俊。" },
      { title: "大自然校园", desc: "在生机盎然的自然课堂中自由求知。" },
      { title: "公益服务学习", desc: "通过赋能与奉献实现自我转变与社会价值。" },
      { title: "年度项目研究周", desc: "将无限想象力转化为现实世界的实际成果。" },
      { title: "沉浸式体验教学", desc: "在开阔的苍穹与天地之间锻造自信与魄力。" },
      { title: "丰富社团与活动", desc: "结识志同道合的伙伴，孵化属于你的热爱与梦想。" }
    ],
    exploreBtn: "深入了解",
    makesUsTitle: "成就卓越的我们：",
    makesUsSubtitle: "在欧弗莱克，学习展翅翱翔；在每一个充满好奇的问题和善意的举动中，学生们被引领成长为全面发展的优秀人才。",
    chartPath: "在无限可能的森林中开辟属于你的求学之路。",
    pillars: [
      { title: "求知 (Learn)", desc: "潜入激发好奇心的知识世界——问题引领发现，课堂无限延展至户外大自然。" },
      { title: "体验 (Experience)", desc: "融入充满活力的集体——建立真挚的友谊，将成长时期的探索升华为一生的热爱。" },
      { title: "启程 (Apply)", desc: "开启一段全新的旅程——这不仅是申请一所名校，更是为孩子找到温暖的第二个家。" }
    ],
    actionInquire: "在线咨询",
    actionVisit: "预约探校",
    actionApply: "立即申请",
    demoBanner: "⚠️ This is a demo version / 系统当前为演示体验版本 ⚠️",
    footerMeetTitle: "走进欧弗莱克",
    footerAcademicsTitle: "学术课程",
    footerCommunityTitle: "校园社区",
    footerAdmissionsTitle: "招生入学",
    footerAddress: "20301 NE 108th St\nRedmond, WA 98053\nquestions@overlake.org\n425-868-1000",
    footerDisclaimer: "欧弗莱克学校致力于促进多元化，在教育政策、招生政策、助学金计划及体育活动等各项管理中，不因种族、肤色、宗教、国籍、性别或身体障碍等受到任何歧视。",
    copyright: "© 2026 Overlake School. 版权所有 保留一切权利。",
    terms: "使用条款",
    privacy: "隐私政策",
    doNotSell: "个人信息保护"
  },
  JP: {
    utility: [
      { name: "ポータル", path: "/login" },
      { name: "同窓生", path: "/page/alumni" },
      { name: "寄付・支援", path: "/page/giving" },
      { name: "スクールカレンダー", path: "/page/calendar" },
      { name: "ニュース", path: "/page/news" }
    ],
    mainNav: [
      {
        name: "オーバーレイクについて",
        links: [
          { name: "ダイバーシティ＆インクルージョン", path: "diversity" },
          { name: "教員・スタッフ紹介", path: "staff" },
          { name: "リーダーシップチーム", path: "leadership" },
          { name: "アニュアルレポート", path: "annual-report" },
          { name: "採用情報", path: "careers" },
          { name: "理念・ビジョン・価値観", path: "mission" }
        ]
      },
      {
        name: "アカデミックス",
        links: [
          { name: "教育アプローチ", path: "approach" },
          { name: "ミドルスクール (中学部)", path: "middle-school" },
          { name: "アッパースクール (高等部)", path: "upper-school" },
          { name: "学科・部門", path: "departments" },
          { name: "特修プログラム", path: "signature-programs" }
        ]
      },
      {
        name: "コミュニティ",
        links: [
          { name: "スクールライフ", path: "life" },
          { name: "アート＆パフォーミングアーツ", path: "arts" },
          { name: "アスレチックス (体育・部活)", path: "athletics" },
          { name: "大学進学カウンセリング", path: "counseling" },
          { name: "生徒会・リーダーシップ", path: "leadership-students" },
          { name: "スチューデントサポート", path: "support" }
        ]
      },
      {
        name: "入学案内",
        links: [
          { name: "入学へのステップ", path: "journey" },
          { name: "学費と奨学金制度", path: "affording" },
          { name: "入学考査・テスト", path: "testing" },
          { name: "スクールバス・交通アクセス", path: "transportation" },
          { name: "オンライン出願", path: "apply" }
        ]
      }
    ],
    inquireBtn: "資料請求",
    heroTitle1: "卓越性を",
    heroTitle2: "切り拓く",
    heroDesc: "卓越した知性を育み、知的好奇心を深め、変化し続ける国際社会を牽引する次世代のリーダーを育成します。",
    studentLoginBtn: "生徒・保護者ログイン",
    staffLoginBtn: "教職員・管理ポータル",
    aboutTitle: "オーバーレイクスクールへようこそ",
    aboutSubtitle: "知的好奇心が芽吹き、絆が深まり、豊かな人間性が育まれる学び舎。",
    ourPurposeTitle: "私たちの目的",
    ourPurposeDesc: "挑戦的なカリキュラムの実践を通じて、教室やキャンパスの枠を超え、世界により良い変革をもたらす情熱とリーダーシップを育てます。",
    ourPromiseTitle: "私たちの約束",
    ourPromiseDesc: "生徒一人ひとりが中心です。学業と課外活動が調和し、ウェルビーイングと深い信頼関係が探究心を育みます——教育とは終わりのない冒険です。",
    owlsEyeTitle: "オーバーレイクのデータで見る実績",
    stat1Number: "575名",
    stat1Desc: "5年生から12年生の生徒たちが自らの可能性を切り拓いています",
    stat2Number: "7:1",
    stat2Desc: "確かな信頼関係を築くきめ細やかな生徒・教員比率",
    stat3Number: "180万ドル",
    stat3Desc: "すべての優秀な生徒に門戸を開く充実した奨学金制度",
    stat4Number: "75エーカー",
    stat4Desc: "大自然そのものが教室となる広大で美しいキャンパス",
    campusTitle: "キャンパス環境",
    campusSubtitle: "豊かな常緑樹がそよぎ、大自然がそのまま最高の教室になる場所。",
    campusP1: "キャンパスに足を踏み入れた瞬間、緑の息吹と生命力を感じられます。木々が心地よい集いの場を生み出し、小道が校舎を繋ぎます。学びは教室にとどまらず、木陰でのスケッチや森の中でのディスカッションへと広がります。",
    campusHighlight: "オーバーレイクには、生徒がのびのびと成長し探究できる環境があります。",
    campusP2: "学びの世界はキャンパスの外へと広がります。豊かな自然林の散策から国際的なボランティア活動、地域社会との繋がりまで、生徒たちは視野を広げ、世界における自らの役割と豊かな人間性を育みます。",
    campusTags: "地域密着 • 広域連携 • グローバル展開",
    acresTitle: "75エーカーの無限の可能性",
    acresDesc: "レドモンド中心部からすぐの広大なキャンパスは、別世界のような静けさに包まれています。森のトレイル、緑の広場、豊かな自然と最先端の教育が融合し、シアトルの活気を感じながら集中して学べます。",
    tourTitle: "3Dバーチャルキャンパス体験",
    tourDesc: "最新の校舎設備をバーチャルツアーで体験。ドラッグ操作で3Dモデルを360度回転させ、マウスホイールで自在にズームイン・アウトできます。",
    live3d: "リアルタイム3Dビューア",
    onlyTitle: "オーバーレイクならではの魅力",
    onlySubtitle: "実践的でダイナミックな体験が未来のリーダーを育みます。",
    cards: [
      { title: "学費・奨学金サポート", desc: "未来ある若者たちの可能性へ投資します。" },
      { title: "自然と調和したキャンパス", desc: "大自然という開放的な教室で自由に学びを深めます。" },
      { title: "社会貢献・サービスラーニング", desc: "奉仕活動を通じて自己の変革と社会への貢献を学びます。" },
      { title: "プロジェクトウィーク", desc: "自由な発想を現実社会での実践へと昇華させます。" },
      { title: "体験型イマーシブ学習", desc: "広大な青空の下で確固たる自信と主体性を育みます。" },
      { title: "多彩なクラブ・課外活動", desc: "志を共にする仲間と出会い、情熱を形にします。" }
    ],
    exploreBtn: "詳細を見る",
    makesUsTitle: "私たちを形づくるもの：",
    makesUsSubtitle: "オーバーレイクは学びが大きく羽ばたく場所です。好奇心溢れる問いかけと思いやりを通じて、豊かな人間性を備えたリーダーへと成長します。",
    chartPath: "可能性に満ちた森の中へ、あなた自身の航路を描きましょう。",
    pillars: [
      { title: "学ぶ (Learn)", desc: "知的好奇心が刺激される世界へ——問いが新たな発見を生み、教室は大自然へと広がります。" },
      { title: "体験する (Experience)", desc: "活気あるコミュニティへ——真の友情を育み、探究心が一生の情熱へと変わります。" },
      { title: "出願する (Apply)", desc: "新たな冒険の始まり——それは単なる学校選びではなく、第2の温かな我が家を見つける旅です。" }
    ],
    actionInquire: "資料請求",
    actionVisit: "学校見学予約",
    actionApply: "今すぐ出願する",
    demoBanner: "⚠️ This is a demo version / 現在デモ体験版として稼働中です ⚠️",
    footerMeetTitle: "オーバーレイクについて",
    footerAcademicsTitle: "アカデミックス",
    footerCommunityTitle: "コミュニティ",
    footerAdmissionsTitle: "入学案内",
    footerAddress: "20301 NE 108th St\nRedmond, WA 98053\nquestions@overlake.org\n425-868-1000",
    footerDisclaimer: "オーバーレイクスクールは多様性を尊重し、人種、肌の色、宗教、国籍、出身地、性別、性的指向、障がい等に基づく一切の差別を行わず、公正な教育機会を提供します。",
    copyright: "© 2026 Overlake School. All rights reserved.",
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    doNotSell: "個人情報の取り扱いについて"
  }
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'TH', label: 'ภาษาไทย' },
    { code: 'CN', label: '中文' },
    { code: 'JP', label: '日本語' }
  ];

  // Retrieve saved language from localStorage if available
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations[currentLang.code] || translations.EN;

  return (
    <div className="w-full min-h-screen font-sans bg-white text-slate-800 overflow-x-hidden">
      
      {/* Utility Top Bar */}
      <div className="hidden md:flex w-full bg-gradient-to-r from-[#003d2e] to-[#00523e] text-white py-2 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50 relative shadow-[0_5px_15px_rgba(0,0,0,0.3)] border-b border-white/10">
        {t.utility.map(link => (
          <span key={link.name} onClick={() => navigate(link.path)} className="hover:text-[#f2a900] cursor-pointer transition-transform hover:-translate-y-0.5 duration-200 block">{link.name}</span>
        ))}
        
        {/* Colorful Country Flag Language Switcher */}
        <div className="relative ml-4 border-l border-white/20 pl-6">
          <button 
            onClick={() => setLangOpen(!langOpen)} 
            className="flex items-center gap-2.5 bg-gradient-to-b from-white/25 to-white/10 hover:from-white/35 hover:to-white/15 px-3.5 py-1.5 rounded-full transition-all border border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:scale-95 cursor-pointer"
          >
            <FlagIcon code={currentLang.code} className="w-5 h-3.5 shadow-sm" />
            <span className="font-extrabold text-white text-xs tracking-wider">{currentLang.code}</span>
            <ChevronDown size={14} className={`text-white/80 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {langOpen && (
            <div className="absolute top-[125%] right-0 mt-1 w-44 bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden z-50 transform origin-top-right animate-fade-in" style={{ perspective: '1000px' }}>
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
          {t.mainNav.map((nav) => (
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
            {t.inquireBtn}
          </button>
        </div>

        {/* Mobile Navigation controls */}
        <div className="lg:hidden flex items-center gap-3">
          <button 
            onClick={() => setLangOpen(!langOpen)} 
            className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full border border-white/30"
          >
            <FlagIcon code={currentLang.code} className="w-5 h-3.5" />
            <span className="font-bold text-white text-xs">{currentLang.code}</span>
          </button>

          <div className="z-50 cursor-pointer p-2 rounded-full bg-white/10 backdrop-blur-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} className={isScrolled ? "text-[#00523e]" : "text-white"} /> : <Menu size={28} className={isScrolled ? "text-[#00523e]" : "text-white"} />}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#00523e]/95 backdrop-blur-xl z-40 flex flex-col pt-28 px-8 pb-8 overflow-y-auto animate-fade-in">
          {/* Language picker in mobile menu */}
          <div className="flex gap-2 mb-6 pb-4 border-b border-white/20 overflow-x-auto">
            {languages.map(lang => (
              <button 
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${currentLang.code === lang.code ? 'bg-[#f2a900] text-[#00523e] border-[#f2a900]' : 'bg-white/10 text-white border-white/20'}`}
              >
                <FlagIcon code={lang.code} className="w-4 h-3" />
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 text-white font-black text-2xl uppercase tracking-wider">
            {t.mainNav.map(nav => (
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
               <span onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="flex items-center gap-2 text-white bg-white/10 px-6 py-4 rounded-xl"><Users size={20}/> {t.studentLoginBtn}</span>
               <span onClick={() => { setMobileMenuOpen(false); navigate('/admin/login'); }} className="flex items-center gap-2 text-white bg-white/10 px-6 py-4 rounded-xl"><ShieldAlert size={20}/> {t.staffLoginBtn}</span>
               <span onClick={() => { setMobileMenuOpen(false); navigate('/apply'); }} className="flex items-center gap-2 text-[#00523e] bg-[#f2a900] px-6 py-4 rounded-xl">{t.inquireBtn} / {t.actionApply}</span>
            </div>
          </div>
        </div>
      )}

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
            {t.heroTitle1}<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-white">{t.heroTitle2}</span>
          </h1>
          <div className="w-32 h-2 bg-[#f2a900] mb-8 shadow-[0_0_15px_rgba(242,169,0,0.6)] rounded-full"></div>
          <p className="text-xl md:text-2xl text-white font-medium max-w-3xl drop-shadow-xl mb-6 leading-relaxed">
            {t.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-4 mt-6">
            <button onClick={() => navigate('/login')} className="px-10 py-5 rounded-full bg-gradient-to-br from-[#f2a900] to-[#d89600] text-[#00523e] font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(242,169,0,0.4)] active:scale-95 flex items-center justify-center gap-3 border border-[#ffca4f] group">
              <Users size={28} className="group-hover:scale-125 transition-transform duration-300" /> {t.studentLoginBtn}
            </button>
            <button onClick={() => navigate('/admin/login')} className="px-10 py-5 rounded-full bg-gradient-to-br from-[#00523e]/90 to-[#003d2e]/90 text-white font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,82,62,0.6)] active:scale-95 flex items-center justify-center gap-3 border border-white/20 backdrop-blur-lg group">
              <ShieldAlert size={28} className="group-hover:scale-125 transition-transform duration-300 text-[#f2a900]" /> {t.staffLoginBtn}
            </button>
          </div>
        </div>
      </div>

      {/* About Overlake Section */}
      <div className="w-full bg-[#00523e] text-white py-24 px-8 border-t border-[#f2a900]/30 shadow-inner z-30 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-5xl font-black uppercase tracking-tight mb-4 text-[#f2a900]">{t.aboutTitle}</h2>
            <p className="text-2xl font-medium mb-8 leading-snug">{t.aboutSubtitle}</p>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Compass className="text-[#f2a900]" /> {t.ourPurposeTitle}</h3>
              <p className="text-gray-300 leading-relaxed text-base">
                {t.ourPurposeDesc}
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Heart className="text-[#f2a900]" /> {t.ourPromiseTitle}</h3>
              <p className="text-gray-300 leading-relaxed text-base">
                {t.ourPromiseDesc}
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
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-20 text-[#00523e]">{t.owlsEyeTitle}</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">{t.stat1Number}</div>
            <p className="text-[#00523e] font-medium px-4">{t.stat1Desc}</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">{t.stat2Number}</div>
            <p className="text-[#00523e] font-medium px-4">{t.stat2Desc}</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">{t.stat3Number}</div>
            <p className="text-[#00523e] font-medium px-4">{t.stat3Desc}</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center">
            <div className="text-7xl font-black text-[#f2a900] mb-4 group-hover:scale-110 transition-transform">{t.stat4Number}</div>
            <p className="text-[#00523e] font-medium px-4">{t.stat4Desc}</p>
          </div>
        </div>
      </div>

      {/* Our Campus Section */}
      <div className="w-full bg-white py-24 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[#00523e] uppercase tracking-tight mb-4">{t.campusTitle}</h2>
            <p className="text-xl text-gray-500 font-medium max-w-3xl mx-auto">{t.campusSubtitle}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="w-full md:w-1/2">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {t.campusP1}
              </p>
              <h3 className="text-2xl font-bold text-[#00523e] mb-4">{t.campusHighlight}</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {t.campusP2}
              </p>
              <div className="flex gap-4 font-bold text-[#f2a900] uppercase tracking-widest text-sm">
                <span>{t.campusTags}</span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
               <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800" alt="Campus" className="w-full h-[500px] object-cover rounded-3xl shadow-2xl" />
            </div>
          </div>
          
          <div className="bg-[#f4f4f4] rounded-3xl p-10 md:p-16 text-center shadow-inner">
            <h3 className="text-3xl font-black text-[#00523e] uppercase tracking-tight mb-6">{t.acresTitle}</h3>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {t.acresDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive 3D Campus Map Section */}
      <div className="w-full bg-[#111] text-white py-32 px-8 relative overflow-hidden border-t-4 border-[#f2a900] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-30">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={32} className="text-[#f2a900] animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_15px_rgba(242,169,0,0.3)]">{t.tourTitle}</h2>
          </div>
          <p className="text-gray-400 mb-12 text-center max-w-2xl text-lg">
            {t.tourDesc}
          </p>
          
          <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-gradient-to-b from-gray-800 to-black border border-white/10 relative group flex items-center justify-center">
            <iframe 
              title="3D Campus Viewer" 
              src='https://my.spline.design/miniroom-06915fb66601f021c1f55a156e5df469/' 
              frameBorder='0' 
              width='100%' 
              height='100%'
              className="absolute inset-0 z-10 transition-transform duration-700 group-hover:scale-105"
            ></iframe>
            <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold tracking-widest text-[#f2a900] flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {t.live3d}
            </div>
          </div>
        </div>
      </div>

      {/* Only at Overlake (Grid with 3D Tilt Cards) */}
      <div className="w-full bg-gradient-to-b from-white to-gray-50 py-32 px-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-[#00523e] uppercase tracking-tight mb-4 drop-shadow-sm">{t.onlyTitle}</h2>
            <p className="text-gray-500 font-medium text-xl">{t.onlySubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.cards.map((card, idx) => {
              const images = [
                "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800"
              ];
              return (
                <TiltCard key={card.title} bgImage={images[idx % images.length]}>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{card.title}</h3>
                  <p className="text-white/90 text-sm mb-4">{card.desc}</p>
                  <div className="text-[#f2a900] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-black/40 w-max px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-[#f2a900] hover:text-[#00523e] transition-colors">
                    {t.exploreBtn} <ArrowRight size={14} />
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* Here's what makes us, us */}
      <div className="w-full bg-[#00523e] py-32 px-8 text-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-[#f2a900]">{t.makesUsTitle}</h2>
            <p className="text-xl font-medium max-w-3xl mx-auto text-white/90">{t.makesUsSubtitle}</p>
            <p className="text-lg text-[#f2a900] mt-4 font-bold">{t.chartPath}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <BookOpen size={48} className="text-[#f2a900] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4">{t.pillars[0].title}</h3>
                <p className="text-gray-300 leading-relaxed">{t.pillars[0].desc}</p>
             </div>
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <Users size={48} className="text-[#f2a900] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4">{t.pillars[1].title}</h3>
                <p className="text-gray-300 leading-relaxed">{t.pillars[1].desc}</p>
             </div>
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <ArrowRight size={48} className="text-[#f2a900] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4">{t.pillars[2].title}</h3>
                <p className="text-gray-300 leading-relaxed">{t.pillars[2].desc}</p>
             </div>
          </div>
          
          <div className="mt-20 flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => navigate('/apply')} className="bg-[#f2a900] text-[#00523e] px-10 py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg rounded-full">{t.actionInquire}</button>
            <button onClick={() => navigate('/apply')} className="bg-transparent border-2 border-white text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-white hover:text-[#00523e] transition-colors shadow-lg rounded-full">{t.actionVisit}</button>
            <button onClick={() => navigate('/apply')} className="bg-transparent border-2 border-[#f2a900] text-[#f2a900] px-10 py-4 font-bold uppercase tracking-widest hover:bg-[#f2a900] hover:text-[#00523e] transition-colors shadow-lg rounded-full">{t.actionApply}</button>
          </div>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="w-full bg-red-600 text-white font-black text-center py-4 text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[inset_0_5px_15px_rgba(0,0,0,0.3)] relative z-40">
        {t.demoBanner}
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#111] text-white py-16 px-8 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 border-b border-gray-800 pb-12 mb-8">
          <div className="flex items-start gap-5 max-w-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00523e] to-[#00291f] text-white rounded-2xl shadow-[0_0_20px_rgba(0,82,62,0.5)] border border-[#00523e]/50 flex-shrink-0 flex items-center justify-center font-black text-4xl">O</div>
            <div>
              <div className="font-black text-2xl uppercase tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Overlake School</div>
              <div className="text-gray-400 text-sm leading-relaxed mb-6 font-medium whitespace-pre-line">{t.footerAddress}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto flex-1 md:ml-12">
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">{t.footerMeetTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                {t.mainNav[0].links.slice(0, 4).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">{t.footerAcademicsTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                {t.mainNav[1].links.slice(0, 4).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">{t.footerCommunityTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                {t.mainNav[2].links.slice(0, 4).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f2a900] text-sm">{t.footerAdmissionsTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-gray-400">
                {t.mainNav[3].links.slice(0, 3).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
                <li onClick={() => navigate('/apply')} className="text-[#f2a900] hover:text-white cursor-pointer transition-colors">{t.actionApply}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center text-gray-500 text-xs gap-6 font-medium">
          <div className="max-w-3xl leading-relaxed">
             {t.footerDisclaimer}
          </div>
          <div className="flex flex-col gap-2 min-w-max text-right">
             <span>{t.copyright}</span>
             <div className="flex justify-end gap-4">
               <span className="hover:text-white cursor-pointer transition-colors">{t.terms}</span>
               <span className="hover:text-white cursor-pointer transition-colors">{t.privacy}</span>
               <span className="hover:text-white cursor-pointer transition-colors">{t.doNotSell}</span>
             </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
