import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Lock, ArrowRight, Users, ShieldAlert, Globe, MapPin, Compass, BookOpen, Heart, RotateCcw, ZoomIn, ZoomOut, Play, Pause, Layers, Eye, Sparkles } from 'lucide-react';

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

// 100% Reliable Native 3D Interactive Campus Explorer Component
const Campus3DExplorer = ({ lang = 'EN' }) => {
  const [rotateX, setRotateX] = useState(55);
  const [rotateZ, setRotateZ] = useState(35);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeTheme, setActiveTheme] = useState('day');
  const dragStartPos = useRef({ x: 0, y: 0 });

  const buildingsData = {
    EN: [
      { id: 'main', name: 'Discovery Academic Hall', type: 'Academic', x: 220, y: 180, height: 110, color: '#f2a900', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: 'Central academic hub of SSS featuring modern lecture halls, collaborative student study zones, and administrative leadership offices.' },
      { id: 'stem', name: 'STEM & Robotics Center', type: 'Technology', x: 380, y: 140, height: 95, color: '#00c49f', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: 'Cutting-edge biotech laboratories, makerspaces, 3D printing suites, and AI robotics testing arenas.' },
      { id: 'arts', name: 'Performing Arts & Theater', type: 'Arts', x: 120, y: 320, height: 100, color: '#ff7300', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: 'State-of-the-art 650-seat auditorium, acoustics orchestra hall, black box drama theater, and fine arts sculpture studios.' },
      { id: 'sports', name: 'Athletic Arena & Complex', type: 'Athletics', x: 400, y: 340, height: 80, color: '#0088fe', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: 'Olympic-length aquatic center, indoor basketball gymnasiums, strength & conditioning pavilion, and synthetic turf stadium.' },
      { id: 'library', name: 'Learning Resource Library', type: 'Library', x: 260, y: 300, height: 85, color: '#9966ff', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: 'Over 50,000 volumes, silent study sanctuaries, multimedia creation suites, and worldwide research archive databases.' },
      { id: 'nature', name: '75-Acre Forest Sanctuary', type: 'Outdoors', x: 100, y: 100, height: 40, color: '#22c55e', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: 'Pristine Pacific Northwest evergreen trails, outdoor learning amphitheaters, organic gardens, and ecological ponds.' }
    ],
    TH: [
      { id: 'main', name: 'อาคารวิชาการหลัก Discovery Hall', type: 'วิชาการ', x: 220, y: 180, height: 110, color: '#f2a900', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: 'ศูนย์กลางวิชาการของ SSS ประกอบด้วยห้องบรรยายทันสมัย พื้นที่ทำงานร่วมกันของนักเรียน และสำนักงานบริหารโรงเรียน' },
      { id: 'stem', name: 'ศูนย์นวัตกรรม STEM และหุ่นยนต์', type: 'เทคโนโลยี', x: 380, y: 140, height: 95, color: '#00c49f', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: 'ห้องปฏิบัติการวิทยาศาสตร์ขั้นสูง ศูนย์วิจัยหุ่นยนต์ AI เครื่องพิมพ์ 3 มิติ และห้องทดลองชีววิทยาศาสตร์' },
      { id: 'arts', name: 'ศูนย์ศิลปะการแสดงและโรงละคร', type: 'ศิลปะ', x: 120, y: 320, height: 100, color: '#ff7300', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: 'หอประชุมและโรงละคร 650 ที่นั่ง ห้องซ้อมดนตรีออร์เคสตรามาตรฐานระดับโลก และสตูดิโอประติมากรรม' },
      { id: 'sports', name: 'ศูนย์กีฬาและสระว่ายน้ำโอลิมปิก', type: 'กีฬา', x: 400, y: 340, height: 80, color: '#0088fe', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: 'สระว่ายน้ำมาตรฐานโอลิมปิก สนามบาสเกตบอลในร่ม สนามฟุตบอลหญ้าเทียม และศูนย์ฟิตเนสครบวงจร' },
      { id: 'library', name: 'หอสมุดและศูนย์วิทยบริการ', type: 'ห้องสมุด', x: 260, y: 300, height: 85, color: '#9966ff', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: 'หนังสือและสื่อค้นคว้ากว่า 50,000 รายการ พื้นที่อ่านหนังสือเงียบสงบ และระบบฐานข้อมูลวิจัยดิจิทัลระดับสากล' },
      { id: 'nature', name: 'พื้นที่ป่าธรรมชาติ 75 เอเคอร์ (190 ไร่)', type: 'ธรรมชาติ', x: 100, y: 100, height: 40, color: '#22c55e', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: 'เส้นทางเดินสำรวจธรรมชาติอันอุดมสมบูรณ์ ลานเรียนรู้กลางแจ้ง สวนเกษตรอินทรีย์ และสระน้ำเชิงนิเวศ' }
    ],
    CN: [
      { id: 'main', name: 'SSS探索主教学楼 Discovery Hall', type: '学术', x: 220, y: 180, height: 110, color: '#f2a900', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: 'SSS核心教学主楼，配备现代化多功能阶梯教室、学生协同研讨区及学校行政办公中心。' },
      { id: 'stem', name: 'STEM人工智能与科研中心', type: '科技', x: 380, y: 140, height: 95, color: '#00c49f', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: '配备前沿生物科学实验室、创客工坊、3D打印研发套件及AI机器人竞技训练场。' },
      { id: 'arts', name: '大剧院与表演艺术中心', type: '艺术', x: 120, y: 320, height: 100, color: '#ff7300', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: '拥有650座的专业声学剧场、交响乐排练大厅、黑匣子实验剧场及雕塑艺术工作室。' },
      { id: 'sports', name: '综合体育中心与游泳馆', type: '体育', x: 400, y: 340, height: 80, color: '#0088fe', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: '国际奥林匹克标准恒温泳池、室内篮球馆、专业健身房及全天候人工草坪运动场。' },
      { id: 'library', name: '学术图书馆与信息资源中心', type: '图书馆', x: 260, y: 300, height: 85, color: '#9966ff', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: '馆藏50,000余册实体学术典籍，设静谧自习专区、多媒体交互研讨室及全球数字文献库。' },
      { id: 'nature', name: '75英亩自然生态探究林区', type: '户外生态', x: 100, y: 100, height: 40, color: '#22c55e', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: '纯净的常青树森林步道、户外圆形阶梯剧场、有机植物研习园及生态湿地探索区。' }
    ],
    JP: [
      { id: 'main', name: 'SSSディスカバリー本校舎', type: '学術', x: 220, y: 180, height: 110, color: '#f2a900', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: '最新の講義室、生徒の協働学習ラウンジ、学校本部が集約されたSSSキャンパスの中心校舎。' },
      { id: 'stem', name: 'STEM＆ロボティクス先端棟', type: 'テクノロジー', x: 380, y: 140, height: 95, color: '#00c49f', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: '最先端のバイオ実験室、メイカースペース、3Dプリンティング設備、AIロボット実証フィールド。' },
      { id: 'arts', name: 'パフォーミングアーツ大劇場', type: '芸術', x: 120, y: 320, height: 100, color: '#ff7300', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: '音響設計に優れた650席の大講堂、オーケストラホール、ブラックボックステアター、造形アトリエ。' },
      { id: 'sports', name: '総合アリーナ＆オリンピックプール', type: 'スポーツ', x: 400, y: 340, height: 80, color: '#0088fe', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: 'オリンピック規格の温水プール、屋内バスケットボールコート、トレーニング施設、全天候型スタジアム。' },
      { id: 'library', name: '学術図書館・メディアセンター', type: '図書館', x: 260, y: 300, height: 85, color: '#9966ff', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: '5万冊以上の蔵書を誇り、静寂な個別自習ブース、マルチメディア編集室、デジタル論文DBを完備。' },
      { id: 'nature', name: '75エーカー自然保護林・野外教室', type: '大自然', x: 100, y: 100, height: 40, color: '#22c55e', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: '広大な常緑樹の森林トレイル、オープンエアの野外円形教室、有機ガーデン、自然観察池。' }
    ]
  };

  const buildings = buildingsData[lang] || buildingsData.EN;

  // Auto rotation loop
  useEffect(() => {
    if (autoRotate && !isDragging) {
      const interval = setInterval(() => {
        setRotateZ(prev => (prev + 0.3) % 360);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [autoRotate, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    setRotateZ(prev => prev + deltaX * 0.4);
    setRotateX(prev => Math.min(80, Math.max(20, prev - deltaY * 0.3)));
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(1.6, prev + 0.08));
    } else {
      setZoom(prev => Math.max(0.6, prev - 0.08));
    }
  };

  const resetView = () => {
    setRotateX(55);
    setRotateZ(35);
    setZoom(1);
    setAutoRotate(true);
    setSelectedBuilding(null);
  };

  return (
    <div className="w-full relative select-none rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/15 bg-gradient-to-b from-[#0a1410] via-[#020906] to-[#010403]">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-6 left-6 right-6 z-30 flex flex-wrap justify-between items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-white shadow-lg">
          <Sparkles size={14} className="text-[#f2a900]" />
          <span>SSS 3D LIVE DIGITAL TWIN</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-black/70 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-lg">
          <button 
            onClick={() => setAutoRotate(!autoRotate)} 
            className={`p-2 rounded-full transition-all text-xs font-bold flex items-center gap-1.5 ${autoRotate ? 'bg-[#00523e] text-emerald-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
            title="Auto Rotate"
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{autoRotate ? 'Auto Orbit' : 'Paused'}</span>
          </button>
          
          <button onClick={() => setZoom(prev => Math.min(1.6, prev + 0.15))} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <button onClick={resetView} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Reset Camera">
            <RotateCcw size={16} />
          </button>
          <button onClick={() => setActiveTheme(activeTheme === 'day' ? 'night' : 'day')} className="px-3 py-1 text-xs font-bold text-[#f2a900] hover:bg-white/10 rounded-full transition-colors">
            {activeTheme === 'day' ? '🌙 Night Mode' : '☀️ Day Mode'}
          </button>
        </div>
      </div>

      {/* 3D Viewport Scene Area */}
      <div 
        className="w-full h-[620px] cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ perspective: '1200px' }}
      >
        {/* Background Grid & Ambient Glow */}
        <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${activeTheme === 'night' ? 'bg-[radial-gradient(circle_at_center,#00523e_0%,#000_70%)]' : 'bg-[radial-gradient(circle_at_center,#022c22_0%,#000_80%)]'}`}></div>
        
        {/* 3D World Transform Board */}
        <div 
          className="relative w-[560px] h-[560px] transition-transform duration-75"
          style={{
            transform: `scale(${zoom}) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Ground Terrain (75-Acre SSS Woodland Grid) */}
          <div 
            className={`absolute inset-0 rounded-[3rem] border-4 shadow-[0_0_80px_rgba(0,82,62,0.6)] transition-colors duration-500 ${activeTheme === 'night' ? 'bg-[#021d15] border-emerald-500/40' : 'bg-[#043325] border-emerald-400/60'}`}
            style={{ 
              transformStyle: 'preserve-3d',
              backgroundImage: 'radial-gradient(#10b981 1.5px, transparent 1.5px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '35px 35px, 70px 70px, 70px 70px'
            }}
          >
            {/* Campus Pathways / Trails */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
              <path d="M 80 80 Q 220 180 380 140 T 400 340 T 260 300 T 120 320 Z" fill="none" stroke="#f2a900" strokeWidth="4" strokeDasharray="8 6" />
              <path d="M 220 180 L 260 300 L 380 140" fill="none" stroke="#6ee7b7" strokeWidth="3" />
              <circle cx="280" cy="240" r="45" fill="rgba(16,185,129,0.2)" stroke="#34d399" strokeWidth="2" />
            </svg>

            {/* Central Quad Lawn */}
            <div className="absolute top-[200px] left-[200px] w-[140px] h-[100px] rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center">
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest pointer-events-none">SSS CENTRAL QUAD</span>
            </div>

            {/* Decorative Evergreen Trees */}
            {[
              {x: 60, y: 70}, {x: 80, y: 130}, {x: 140, y: 60}, {x: 480, y: 90}, {x: 450, y: 220}, 
              {x: 80, y: 440}, {x: 160, y: 460}, {x: 340, y: 450}, {x: 470, y: 440}, {x: 50, y: 220}
            ].map((tree, idx) => (
              <div 
                key={idx} 
                className="absolute w-6 h-6 flex items-center justify-center pointer-events-none text-emerald-400 text-lg"
                style={{ 
                  left: tree.x, 
                  top: tree.y,
                  transform: `translateZ(15px) rotateX(-${rotateX}deg) rotateZ(-${rotateZ}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                🌲
              </div>
            ))}

            {/* 3D Buildings with Clickable Hotspots */}
            {buildings.map((b) => (
              <div 
                key={b.id}
                onClick={(e) => { e.stopPropagation(); setSelectedBuilding(b); }}
                className="absolute group cursor-pointer"
                style={{
                  left: b.x,
                  top: b.y,
                  width: '90px',
                  height: '70px',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* 3D Extruded Building Mesh */}
                <div 
                  className={`w-full h-full rounded-xl transition-all duration-300 relative ${selectedBuilding?.id === b.id ? 'ring-4 ring-[#f2a900] shadow-[0_0_30px_#f2a900]' : 'group-hover:ring-2 group-hover:ring-white'}`}
                  style={{
                    backgroundColor: b.color,
                    transform: `translateZ(${b.height / 2}px)`,
                    boxShadow: `0 0 25px ${b.color}80, inset 0 0 15px rgba(255,255,255,0.4)`
                  }}
                >
                  {/* Roof Glow */}
                  <div className="absolute inset-1 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center">
                    <span className="text-[10px] font-black text-black/80 uppercase tracking-tighter truncate px-1">{b.type}</span>
                  </div>
                </div>

                {/* Floating Interactive 3D Pin & Name Tag */}
                <div 
                  className="absolute left-1/2 -top-8 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                  style={{
                    transform: `translateZ(${b.height + 25}px) rotateX(-${rotateX}deg) rotateZ(-${rotateZ}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="bg-black/90 text-white font-extrabold text-xs px-3 py-1 rounded-full border border-white/30 shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md group-hover:scale-110 group-hover:border-[#f2a900] transition-all">
                    <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: b.color }}></div>
                    <span>{b.name}</span>
                  </div>
                  <div className="w-1 h-3 bg-white/60"></div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Floating Selected Building Detail Card */}
      {selectedBuilding && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[380px] z-40 bg-black/90 backdrop-blur-xl p-6 rounded-2xl border-2 border-[#f2a900] shadow-[0_10px_40px_rgba(0,0,0,0.9)] animate-fade-in text-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#f2a900] bg-[#f2a900]/20 px-2 py-0.5 rounded border border-[#f2a900]/40">
                {selectedBuilding.type}
              </span>
              <h4 className="text-xl font-black mt-1 text-white">{selectedBuilding.name}</h4>
            </div>
            <button onClick={() => setSelectedBuilding(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          
          <img src={selectedBuilding.img} alt={selectedBuilding.name} className="w-full h-36 object-cover rounded-xl mb-3 shadow-md border border-white/10" />
          
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            {selectedBuilding.desc}
          </p>

          <div className="flex gap-2">
            <button onClick={() => setSelectedBuilding(null)} className="flex-1 bg-[#00523e] hover:bg-[#003d2e] py-2 rounded-xl text-xs font-bold text-white transition-colors border border-emerald-500/40 flex items-center justify-center gap-1">
              <Eye size={12} /> Explore More
            </button>
          </div>
        </div>
      )}

      {/* Bottom Help Tip */}
      <div className="absolute bottom-4 left-6 z-20 pointer-events-none hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
        <Compass size={14} className="text-[#f2a900]" />
        <span>Drag to rotate 3D view • Scroll wheel to zoom • Click any building for details</span>
      </div>

    </div>
  );
};

const translations = {
  EN: {
    utility: [
      { name: "MySSS Portal", path: "/login" },
      { name: "Alumni", path: "/page/alumni" },
      { name: "Giving", path: "/page/giving" },
      { name: "Calendar", path: "/page/calendar" },
      { name: "News", path: "/page/news" }
    ],
    mainNav: [
      {
        name: "Meet SSS",
        links: [
          { name: "Diversity & Inclusion", path: "diversity" },
          { name: "Meet Our Faculty & Staff", path: "staff" },
          { name: "Meet Our Leadership", path: "leadership" },
          { name: "Annual Report", path: "annual-report" },
          { name: "Careers at SSS", path: "careers" },
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
          { name: "Life at SSS", path: "life" },
          { name: "Arts & Theater", path: "arts" },
          { name: "Athletics & Sports", path: "athletics" },
          { name: "College Counseling", path: "counseling" },
          { name: "Student Leadership", path: "leadership-students" },
          { name: "Student Support & Wellness", path: "support" }
        ]
      },
      {
        name: "Admissions",
        links: [
          { name: "Begin Your Journey", path: "journey" },
          { name: "Affording SSS", path: "affording" },
          { name: "Testing & Evaluation", path: "testing" },
          { name: "Transportation & Buses", path: "transportation" },
          { name: "Apply Online", path: "apply" }
        ]
      }
    ],
    inquireBtn: "Inquire",
    heroTitle1: "Inspire",
    heroTitle2: "Excellence",
    heroDesc: "Dedicated to inspiring excellence, developing intellectual curiosity, and teaching students to lead in a changing world at Simple School System (SSS).",
    studentLoginBtn: "Student & Parent Login",
    staffLoginBtn: "Staff & Admin Portal",
    aboutTitle: "About SSS",
    aboutSubtitle: "We’re a school where curiosity thrives, connections deepen, and character flourishes.",
    ourPurposeTitle: "Our Purpose",
    ourPurposeDesc: "SSS cultivates bold changemakers who learn by doing amid challenging curriculum, sparking a lifelong passion to create positive change in the world beyond our classrooms and campus.",
    ourPromiseTitle: "Our Promise",
    ourPromiseDesc: "Students are at the heart of everything we do, and SSS is an academic community with strong co-curriculars where wellbeing, deep connections, and purpose drive discovery—because education is an adventure.",
    owlsEyeTitle: "A Comprehensive View of SSS",
    stat1Number: "575",
    stat1Desc: "Young students from grades 5-12 all finding their unique paths at SSS",
    stat2Number: "7:1",
    stat2Desc: "Student-to-teacher ratio that nurtures authentic connection",
    stat3Number: "$1.8M",
    stat3Desc: "Financial aid granted making SSS accessible to every promising student",
    stat4Number: "75",
    stat4Desc: "Acres of immersion and wonder where learning comes alive outdoors",
    campusTitle: "Our Campus",
    campusSubtitle: "A wonderland where the evergreens whisper and the outdoors becomes the classroom.",
    campusP1: "Step foot onto our campus and feel it immediately—this place sings. Our evergreens create natural hideaways and invite impromptu gatherings, with winding trails connecting them all together. Here, learning isn’t contained to the classroom—it spills outdoors where students sketch under trees, debate by buildings, and ponder within our forestry.",
    campusHighlight: "Students find room to grow, wonder, and discover at SSS.",
    campusP2: "The world expands beyond our campus’s perimeter. Whether wandering through pristine forests, lending a hand in global service, or connecting with neighbors, this is where SSS students broaden their horizons and find their place in the world. SSS is rooted in earnestness: asking questions that invite imagination, building relationships that last, and caring deeply about each other and our planet.",
    campusTags: "Local • Regional • Global",
    acresTitle: "75 Acres of Possibility",
    acresDesc: "Our sprawling 75-acre campus feels like stepping into another world. Forest trails entice explorers, meadows host gatherings, and every corner invites a moment to pause, reflect, or dream. We've created this special place where nature's calm meets the buzz of learning—giving students room to breathe while keeping them anchored to vibrant energy.",
    tourTitle: "Explore Our 3D Campus",
    tourDesc: "Take an interactive virtual tour of our state-of-the-art facilities. Click and drag to rotate the 3D model, scroll to zoom in and out, or click on any building for full details.",
    live3d: "INTERACTIVE 3D",
    onlyTitle: "Only at SSS",
    onlySubtitle: "Where dynamic, authentic experiences shape tomorrow’s leaders.",
    cards: [
      { title: "Tuition Support", desc: "Investing in promising futures through generous financial aid." },
      { title: "75-Acre Nature Campus", desc: "Learning spreads freely in nature’s outdoor classroom." },
      { title: "Community Service", desc: "Service-empowered learning that transforms communities." },
      { title: "Project Week Adventure", desc: "Imagination becomes real-world practice during Project Week." },
      { title: "Immersive Learning", desc: "Building confidence under the open sky and forest canopy." },
      { title: "50+ Clubs & Activities", desc: "Find your people, build your passion, and lead with purpose." }
    ],
    exploreBtn: "Explore",
    makesUsTitle: "Here’s what makes us, us:",
    makesUsSubtitle: "SSS is where learning takes flight; in every curious question and kind gesture, students are invited to become well-rounded humans.",
    chartPath: "Chart a path through our forest of possibilities.",
    pillars: [
      { title: "Learn", desc: "Students dive into a world that sparks wonder—where questions lead to discoveries and classroom walls extend outdoors." },
      { title: "Experience", desc: "Classmates delve into a vibrant community—where connections are genuine, and seasons of wonder become lifelong passions." },
      { title: "Apply", desc: "Step into a new adventure that feels less like applying to a school and more like finding your child’s second home." }
    ],
    actionInquire: "Inquire",
    actionVisit: "Visit",
    actionApply: "Apply",
    demoBanner: "⚠️ This is a demo version / ระบบนี้เป็นเพียงเวอร์ชันทดลอง ⚠️",
    footerMeetTitle: "Meet SSS",
    footerAcademicsTitle: "Academics",
    footerCommunityTitle: "Community",
    footerAdmissionsTitle: "Admissions",
    footerAddress: "20301 SSS Campus Way\nSimple School System Academy\nquestions@simpleschool.com\nTel: (425) 868-1000",
    footerDisclaimer: "Simple School System (SSS) is committed to diversity and does not discriminate on the basis of race, color, religion, national or ethnic origin, socio-economic status, gender, sexual orientation, or disability in the administration of its educational policies, admissions policies, financial aid programs, athletics, or other school-administered programs.",
    copyright: "© 2026 Simple School System (SSS). All rights reserved.",
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
        name: "รู้จัก SSS",
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
          { name: "ชีวิตในรั้ว SSS", path: "life" },
          { name: "ศิลปะและการแสดง", path: "arts" },
          { name: "การกีฬาและกิจกรรม", path: "athletics" },
          { name: "แนะแนวศึกษาต่อมหาวิทยาลัย", path: "counseling" },
          { name: "ผู้นำนักเรียนและชมรม", path: "leadership-students" },
          { name: "ศูนย์สนับสนุนและสุขภาวะนักเรียน", path: "support" }
        ]
      },
      {
        name: "การรับสมัคร",
        links: [
          { name: "เริ่มต้นเส้นทางการเรียนรู้", path: "journey" },
          { name: "ค่าเล่าเรียนและทุนการศึกษา", path: "affording" },
          { name: "การสอบประเมินและความพร้อม", path: "testing" },
          { name: "บริการรถรับส่งนักเรียน", path: "transportation" },
          { name: "สมัครเรียนออนไลน์", path: "apply" }
        ]
      }
    ],
    inquireBtn: "สอบถามข้อมูล",
    heroTitle1: "จุดประกาย",
    heroTitle2: "สู่ความเป็นเลิศ",
    heroDesc: "มุ่งมั่นในการสร้างแรงบันดาลใจสู่ความเป็นเลิศ พัฒนาความอยากรู้อยากเห็นทางสติปัญญา และปลูกฝังความเป็นผู้นำในโลกที่เปลี่ยนแปลงอย่างรวดเร็ว ณ Simple School System (SSS)",
    studentLoginBtn: "เข้าสู่ระบบ นักเรียน / ผู้ปกครอง",
    staffLoginBtn: "เข้าสู่ระบบ ครูและผู้บริหาร",
    aboutTitle: "เกี่ยวกับ SSS",
    aboutSubtitle: "โรงเรียนที่ความอยากรู้อยากเห็นเบ่งบาน มิตรภาพแน่นแฟ้น และคุณธรรมงดงาม",
    ourPurposeTitle: "เป้าหมายของเรา",
    ourPurposeDesc: "SSS มุ่งบ่มเพาะผู้นำการเปลี่ยนแปลงที่กล้าหาญ ผ่านการลงมือปฏิบัติจริงควบคู่กับหลักสูตรวิชาการที่ท้าทาย เพื่อสร้างแรงบันดาลใจในการสร้างสรรค์สิ่งดีงามให้แก่โลก",
    ourPromiseTitle: "คำมั่นสัญญาของเรา",
    ourPromiseDesc: "นักเรียนคือหัวใจสำคัญในทุกสิ่งที่เราทำ SSS เป็นชุมชนวิชาการที่ผสานกิจกรรมเสริมสร้างสุขภาวะ ความผูกพัน และเป้าหมายชีวิต เพราะการศึกษาคือการผจญภัยที่ไม่มีที่สิ้นสุด",
    owlsEyeTitle: "ภาพรวมสถิติแห่งความสำเร็จของ SSS",
    stat1Number: "575",
    stat1Desc: "นักเรียนระดับเกรด 5-12 ที่กำลังค้นพบเส้นทางเฉพาะตัว ณ SSS",
    stat2Number: "7:1",
    stat2Desc: "อัตราส่วนนักเรียนต่อครูผู้สอน ดูแลอย่างใกล้ชิดและอบอุ่น",
    stat3Number: "65 ลบ.",
    stat3Desc: "ทุนการศึกษา ($1.8M) มอบโอกาสให้นักเรียนทุกคนได้เข้าถึงการศึกษาคุณภาพ",
    stat4Number: "190 ไร่",
    stat4Desc: "พื้นที่ธรรมชาติ 75 เอเคอร์ ที่การเรียนรู้มีชีวิตชีวากลางแจ้ง",
    campusTitle: "บรรยากาศวิทยาเขตของเรา",
    campusSubtitle: "ดินแดนมหัศจรรย์ท่ามกลางต้นไม้เขียวชอุ่มที่ธรรมชาติกลายเป็นห้องเรียน",
    campusP1: "ก้าวแรกสู่โรงเรียน SSS คุณจะสัมผัสได้ถึงพลังแห่งชีวิต ร่มเงาของต้นสนธรรมชาติเปิดโอกาสให้เกิดการพบปะพูดคุย เส้นทางเดินเชื่อมโยงทุกอาคารเข้าหากัน ที่นี่การเรียนรู้ไม่ได้จำกัดอยู่แค่ในห้องสี่เหลี่ยม แต่หลั่งไหลสู่ธรรมชาติภายนอก",
    campusHighlight: "นักเรียนได้เติบโต ค้นพบ และสร้างสรรค์สิ่งใหม่ที่ SSS",
    campusP2: "โลกการเรียนรู้กว้างไกลเกินกว่าขอบเขตโรงเรียน ไม่ว่าจะเป็นการเดินสำรวจป่า การทำงานบริการสังคมระดับโลก หรือการเชื่อมโยงกับชุมชน นักเรียน SSS ของเราเปิดกว้างมุมมอง ค้นหาจุดยืนในสังคม และใส่ใจซึ่งกันและกันอย่างแท้จริง",
    campusTags: "ระดับท้องถิ่น • ระดับภูมิภาค • ระดับโลก",
    acresTitle: "พื้นที่แห่งโอกาสไร้ขีดจำกัด (75 เอเคอร์)",
    acresDesc: "วิทยาเขตอันกว้างขวาง 190 ไร่ของเราให้ความรู้สึกเหมือนก้าวสู่อีกโลกหนึ่ง เส้นทางเดินป่า ลานสนามหญ้า และทุกมุมเชิญชวนให้พักผ่อน สะท้อนคิด หรือฝันถึงอนาคต ผสมผสานความสงบของธรรมชาติเข้ากับพลังการเรียนรู้อย่างลงตัว",
    tourTitle: "สำรวจโรงเรียนแบบจำลอง 3 มิติ (SSS 3D Campus)",
    tourDesc: "ทัวร์เสมือนจริงชมสิ่งอำนวยความสะดวกที่ทันสมัย คลิกและลากเพื่อหมุนโมเดล 3D ได้รอบทิศทาง เลื่อนลูกกลิ้งเมาส์เพื่อซูมเข้า-ออก หรือคลิกที่อาคารเพื่อดูรายละเอียด",
    live3d: "โมเดล 3D แบบอินเทอร์แอคทีฟ",
    onlyTitle: "เอกลักษณ์เฉพาะที่ SSS",
    onlySubtitle: "ประสบการณ์จริงที่หล่อหลอมและขับเคลื่อนผู้นำแห่งอนาคต",
    cards: [
      { title: "ทุนสนับสนุนการศึกษา", desc: "ร่วมลงทุนในอนาคตที่สดใสของเยาวชนผ่านทุนการศึกษา" },
      { title: "วิทยาเขตธรรมชาติ 190 ไร่", desc: "การเรียนรู้ที่เปิดกว้างในห้องเรียนธรรมชาติอันสมบูรณ์" },
      { title: "การบริการเพื่อสังคม", desc: "การเรียนรู้ผ่านการทำประโยชน์ที่เปลี่ยนแปลงโลกอย่างแท้จริง" },
      { title: "สัปดาห์โครงงานสร้างสรรค์", desc: "เปลี่ยนจินตนาการสู่การปฏิบัติจริงในโลกแห่งความเป็นจริง" },
      { title: "การเรียนรู้จากประสบการณ์จริง", desc: "เสริมสร้างความมั่นใจใต้ร่มเงาไม้และท้องฟ้ากว้าง" },
      { title: "ชมรมและกิจกรรมกว่า 50 ชมรม", desc: "ค้นพบเพื่อนที่รู้ใจและพัฒนาสิ่งที่คุณหลงใหลอย่างเต็มที่" }
    ],
    exploreBtn: "ดูรายละเอียด",
    makesUsTitle: "สิ่งที่หล่อหลอมให้เราเป็นเรา:",
    makesUsSubtitle: "SSS คือที่ที่การเรียนรู้ทะยานไกล ในทุกคำถามแห่งความสงสัยและการเกื้อกูลกัน นักเรียนได้รับโอกาสในการเติบโตเป็นมนุษย์ที่สมบูรณ์แบบ",
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
    footerMeetTitle: "รู้จัก SSS",
    footerAcademicsTitle: "วิชาการ",
    footerCommunityTitle: "ชุมชนและการใช้ชีวิต",
    footerAdmissionsTitle: "การรับสมัคร",
    footerAddress: "20301 SSS Campus Way\nSimple School System Academy\nquestions@simpleschool.com\nโทร: (425) 868-1000",
    footerDisclaimer: "โรงเรียน Simple School System (SSS) มุ่งมั่นในความหลากหลายและไม่เลือกปฏิบัติบนพื้นฐานของเชื้อชาติ สีผิว ศาสนา ชาติกำเนิด ภูมิหลังทางเศรษฐกิจและสังคม เพศ รสนิยมทางเพศ หรือความบกพร่องทางร่างกาย ในการดำเนินนโยบายทางการศึกษา การรับสมัคร และทุนการศึกษา",
    copyright: "© 2026 Simple School System (SSS). สงวนลิขสิทธิ์ทั้งหมด",
    terms: "เงื่อนไขการใช้งาน",
    privacy: "นโยบายความเป็นส่วนตัว",
    doNotSell: "การคุ้มครองข้อมูลส่วนบุคคล"
  },
  CN: {
    utility: [
      { name: "我的SSS门户", path: "/login" },
      { name: "校友会", path: "/page/alumni" },
      { name: "爱心捐赠", path: "/page/giving" },
      { name: "校历日程", path: "/page/calendar" },
      { name: "校园新闻", path: "/page/news" }
    ],
    mainNav: [
      {
        name: "走进SSS",
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
          { name: "SSS校园生活", path: "life" },
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
    heroDesc: "致力于在Simple School System (SSS) 激发学生的卓越追求，培养求知欲，教育学生在不断变化的世界中成为卓越的领导者。",
    studentLoginBtn: "学生与家长登录",
    staffLoginBtn: "教职员工与管理门户",
    aboutTitle: "关于SSS国际学校",
    aboutSubtitle: "这是一所激发好奇心、深化友谊与塑造品格的卓越学府。",
    ourPurposeTitle: "办学宗旨",
    ourPurposeDesc: "SSS在挑战性课程中注重知行合一，培养勇敢的变革者，激发终身创造积极世界影响的热情。",
    ourPromiseTitle: "我们的承诺",
    ourPromiseDesc: "学生是我们一切工作的核心。SSS是一个学术氛围浓厚、课外活动丰富的社区，在健康、信任与使命感的引领下探索未知——因为教育是一场探索之旅。",
    owlsEyeTitle: "SSS核心数据概览",
    stat1Number: "575",
    stat1Desc: "5-12年级学生在SSS探索并走出属于自己的独特道路",
    stat2Number: "7:1",
    stat2Desc: "极具关怀的师生比例，建立深度且真实的教学连接",
    stat3Number: "180万美元",
    stat3Desc: "发放丰厚助学金，让每一位优秀学子都能走进SSS",
    stat4Number: "75英亩",
    stat4Desc: "沉浸式自然校园，让户外成为充满探索趣味的课堂",
    campusTitle: "我们的校园",
    campusSubtitle: "常青树低语的仙境，大自然即是最具生机的教室。",
    campusP1: "踏入SSS校园，您会立刻感受到生机与活力。常青树营造出自然的休憩之所，林间小径串联起校园各处。在这里，学习从未局限在教室内——它延伸至绿树成荫的户外，学生们在树下素描、在建筑旁辩论、在林间沉思。",
    campusHighlight: "在SSS，学生拥有充足的空间成长、探索与发现自我。",
    campusP2: "学习的视野超越校园的边界。无论是在森林漫步，参与全球公益服务，还是与社区紧密互动，SSS引导学生拓宽视野，寻找在世界中的定位，学会真诚提问与关爱彼此及我们的地球。",
    campusTags: "立足本土 • 辐射区域 • 放眼全球",
    acresTitle: "75英亩无限可能",
    acresDesc: "广阔的75英亩校园宛如另一个宁静的世界。森林步道吸引探索者，草坪承载欢聚，处处皆是沉思与梦想的理想场所。大自然的宁静与求知的热烈在此完美融合。",
    tourTitle: "探索SSS 3D数字孪生校园",
    tourDesc: "开启现代化校园虚拟实景之旅。点击并拖拽可360度旋转3D模型，滚动鼠标滚轮可自由缩放查看细节，点击任意建筑即可查看详细介绍。",
    live3d: "实时3D交互渲染",
    onlyTitle: "SSS独具特色",
    onlySubtitle: "在充满活力与真实的体验中塑造未来的行业领袖。",
    cards: [
      { title: "助学金计划", desc: "投资无限潜力的未来青年才俊。" },
      { title: "75英亩自然校园", desc: "在生机盎然的自然课堂中自由求知。" },
      { title: "公益服务学习", desc: "通过赋能与奉献实现自我转变与社会价值。" },
      { title: "年度项目研究周", desc: "将无限想象力转化为现实世界的实际成果。" },
      { title: "沉浸式体验教学", desc: "在开阔的苍穹与天地之间锻造自信与魄力。" },
      { title: "50+学生社团与活动", desc: "结识志同道合的伙伴，孵化属于你的热爱与梦想。" }
    ],
    exploreBtn: "深入了解",
    makesUsTitle: "成就卓越的我们：",
    makesUsSubtitle: "在SSS，学习展翅翱翔；在每一个充满好奇的问题和善意的举动中，学生们被引领成长为全面发展的优秀人才。",
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
    footerMeetTitle: "走进SSS",
    footerAcademicsTitle: "学术课程",
    footerCommunityTitle: "校园社区",
    footerAdmissionsTitle: "招生入学",
    footerAddress: "20301 SSS Campus Way\nSimple School System Academy\nquestions@simpleschool.com\n电话: (425) 868-1000",
    footerDisclaimer: "Simple School System (SSS) 致力于促进多元化，在教育政策、招生政策、助学金计划及体育活动等各项管理中，不因种族、肤色、宗教、国籍、性别或身体障碍等受到任何歧视。",
    copyright: "© 2026 Simple School System (SSS). 版权所有 保留一切权利。",
    terms: "使用条款",
    privacy: "隐私政策",
    doNotSell: "个人信息保护"
  },
  JP: {
    utility: [
      { name: "MySSSポータル", path: "/login" },
      { name: "同窓生", path: "/page/alumni" },
      { name: "寄付・支援", path: "/page/giving" },
      { name: "スクールカレンダー", path: "/page/calendar" },
      { name: "ニュース", path: "/page/news" }
    ],
    mainNav: [
      {
        name: "SSSについて",
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
          { name: "SSSスクールライフ", path: "life" },
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
    heroDesc: "卓越した知性を育み、知的好奇心を深め、変化し続ける国際社会を牽引する次世代のリーダーをSimple School System (SSS) で育成します。",
    studentLoginBtn: "生徒・保護者ログイン",
    staffLoginBtn: "教職員・管理ポータル",
    aboutTitle: "SSSインターナショナルスクールへようこそ",
    aboutSubtitle: "知的好奇心が芽吹き、絆が深まり、豊かな人間性が育まれる学び舎。",
    ourPurposeTitle: "私たちの目的",
    ourPurposeDesc: "SSSは挑戦的なカリキュラムの実践を通じて、教室やキャンパスの枠を超え、世界により良い変革をもたらす情熱とリーダーシップを育てます。",
    ourPromiseTitle: "私たちの約束",
    ourPromiseDesc: "生徒一人ひとりが中心です。学業と課外活動が調和し、ウェルビーイングと深い信頼関係が探究心を育みます——教育とは終わりのない冒険です。",
    owlsEyeTitle: "SSSのデータで見る実績",
    stat1Number: "575名",
    stat1Desc: "5年生から12年生の生徒たちがSSSで自らの可能性を切り拓いています",
    stat2Number: "7:1",
    stat2Desc: "確かな信頼関係を築くきめ細やかな生徒・教員比率",
    stat3Number: "180万ドル",
    stat3Desc: "すべての優秀な生徒に門戸を開く充実した奨学金制度",
    stat4Number: "75エーカー",
    stat4Desc: "大自然そのものが教室となる広大で美しいキャンパス",
    campusTitle: "キャンパス環境",
    campusSubtitle: "豊かな常緑樹がそよぎ、大自然がそのまま最高の教室になる場所。",
    campusP1: "SSSキャンパスに足を踏み入れた瞬間、緑の息吹と生命力を感じられます。木々が心地よい集いの場を生み出し、小道が校舎を繋ぎます。学びは教室にとどまらず、木陰でのスケッチや森の中でのディスカッションへと広がります。",
    campusHighlight: "SSSには、生徒がのびのびと成長し探究できる環境があります。",
    campusP2: "学びの世界はキャンパスの外へと広がります。豊かな自然林の散策から国際的なボランティア活動、地域社会との繋がりまで、SSSの生徒たちは視野を広げ、世界における自らの役割と豊かな人間性を育みます。",
    campusTags: "地域密着 • 広域連携 • グローバル展開",
    acresTitle: "75エーカーの無限の可能性",
    acresDesc: "広大な75エーカーのキャンパスは、別世界のような静けさに包まれています。森のトレイル、緑の広場、豊かな自然と最先端の教育が融合し、集中して学べます。",
    tourTitle: "SSS 3Dバーチャルキャンパス体験",
    tourDesc: "最新の校舎設備をバーチャルツアーで体験。ドラッグ操作で3Dモデルを360度回転させ、マウスホイールで自在にズームイン・アウトできます。",
    live3d: "リアルタイム3Dビューア",
    onlyTitle: "SSSならではの魅力",
    onlySubtitle: "実践的でダイナミックな体験が未来のリーダーを育みます。",
    cards: [
      { title: "学費・奨学金サポート", desc: "未来ある若者たちの可能性へ投資します。" },
      { title: "75エーカーの自然キャンパス", desc: "大自然という開放的な教室で自由に学びを深めます。" },
      { title: "社会貢献・サービスラーニング", desc: "奉仕活動を通じて自己の変革と社会への貢献を学びます。" },
      { title: "プロジェクトウィーク", desc: "自由な発想を現実社会での実践へと昇華させます。" },
      { title: "体験型イマーシブ学習", desc: "広大な青空の下で確固たる自信と主体性を育みます。" },
      { title: "50以上の多彩なクラブ活動", desc: "志を共にする仲間と出会い、情熱を形にします。" }
    ],
    exploreBtn: "詳細を見る",
    makesUsTitle: "私たちを形づくるもの：",
    makesUsSubtitle: "SSSは学びが大きく羽ばたく場所です。好奇心溢れる問いかけと思いやりを通じて、豊かな人間性を備えたリーダーへと成長します。",
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
    footerMeetTitle: "SSSについて",
    footerAcademicsTitle: "アカデミックス",
    footerCommunityTitle: "コミュニティ",
    footerAdmissionsTitle: "入学案内",
    footerAddress: "20301 SSS Campus Way\nSimple School System Academy\nquestions@simpleschool.com\nTel: (425) 868-1000",
    footerDisclaimer: "Simple School System (SSS) は多様性を尊重し、人種、肌の色、宗教、国籍、出身地、性別、性的指向、障がい等に基づく一切の差別を行わず、公正な教育機会を提供します。",
    copyright: "© 2026 Simple School System (SSS). All rights reserved.",
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
            S
          </div>
          <span className={`text-3xl font-black tracking-tight uppercase transition-colors duration-300 ${isScrolled ? 'text-[#00523e]' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'}`}>
            SSS
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
            title="SSS Background" 
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

      {/* About SSS Section */}
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
             <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800" alt="About SSS" className="w-full h-full object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 hover:scale-[1.02] transition-transform duration-500" />
          </div>
        </div>
      </div>

      {/* SSS Comprehensive Stats */}
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

      {/* 100% Reliable Native 3D Interactive Campus Map Explorer Section */}
      <div className="w-full bg-[#050e0a] text-white py-32 px-4 md:px-8 relative overflow-hidden border-t-4 border-[#f2a900] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-30">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={32} className="text-[#f2a900] animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(242,169,0,0.4)] text-center">
              {t.tourTitle}
            </h2>
          </div>
          <p className="text-gray-400 mb-12 text-center max-w-2xl text-base md:text-lg">
            {t.tourDesc}
          </p>
          
          {/* Integrated 3D Interactive Component */}
          <Campus3DExplorer lang={currentLang.code} />
        </div>
      </div>

      {/* Only at SSS (Grid with 3D Tilt Cards) */}
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
            <div className="w-16 h-16 bg-gradient-to-br from-[#00523e] to-[#00291f] text-white rounded-2xl shadow-[0_0_20px_rgba(0,82,62,0.5)] border border-[#00523e]/50 flex-shrink-0 flex items-center justify-center font-black text-4xl">S</div>
            <div>
              <div className="font-black text-2xl uppercase tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Simple School System</div>
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
