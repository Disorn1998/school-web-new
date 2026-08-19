import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Search, Menu, X, ChevronDown, Lock, ArrowRight, Users, ShieldAlert, Globe, MapPin, Compass, BookOpen, Heart, RotateCcw, ZoomIn, ZoomOut, Play, Pause, Eye, Sparkles, Sun, Moon, ChevronLeft, ChevronRight as ChevronRightIcon, Award, Film, CheckCircle2 } from 'lucide-react';

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
      className="relative h-[450px] rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(15,23,42,0.18)] hover:shadow-[0_25px_50px_rgba(30,58,138,0.3)] cursor-pointer border border-slate-100/50"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out, box-shadow 0.3s ease'
      }}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500" 
        style={{ backgroundImage: `url(${bgImage})`, transform: 'translateZ(-50px) scale(1.15)' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#09152b] via-[#0f284e]/60 to-transparent" style={{ transform: 'translateZ(0)' }}></div>
      <div className="absolute bottom-0 left-0 p-8 w-full" style={{ transform: 'translateZ(60px)' }}>
        {children}
      </div>
    </div>
  );
};

// =========================================================================
// Real 3D WebGL Three.js Campus Digital Twin Explorer Component
// =========================================================================
const ThreeCampusExplorer = ({ lang = 'EN' }) => {
  const containerRef = useRef(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredBuilding, setHoveredBuilding] = useState(null);

  const buildingsInfo = {
    EN: {
      main: { name: 'Discovery Academic Hall & Clock Tower', type: 'Main Campus', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: 'Central collegiate neoclassical hall with lecture amphitheatres, administrative offices, and our iconic clock tower.' },
      stem: { name: 'STEM Innovation & Robotics Complex', type: 'Sciences & Tech', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: 'Futuristic research laboratories, astronomical observatory dome, AI robotics testing arenas, and biotech cleanrooms.' },
      theater: { name: 'Grand Performing Arts Center', type: 'Arts & Music', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: '650-seat acoustically tuned concert hall, orchestra studios, black box drama theater, and digital recording suites.' },
      stadium: { name: 'Olympic Athletics Stadium & Arena', type: 'Athletics', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: 'Full FIFA-grade turf football pitch, 8-lane running track, aquatic center, indoor basketball courts, and spectator grandstands.' },
      library: { name: 'Grand Rotunda Library & Archive', type: 'Learning Center', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: 'Circular glass atrium library holding 50,000+ volumes, individual study pods, digital archives, and panoramic forest views.' },
      lake: { name: '75-Acre Forest Trails & Eco Lake', type: 'Nature Reserve', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: 'Pristine Pacific Northwest evergreen trails, outdoor learning amphitheaters, organic gardens, and natural water reserve.' }
    },
    TH: {
      main: { name: 'อาคารวิชาการหลัก Discovery Hall และหอนาฬิกา', type: 'ศูนย์กลางวิชาการ', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: 'อาคารสถาปัตยกรรมคลาสสิกอันเป็นสัญลักษณ์ของ SSS ประกอบด้วยห้องบรรยายขนาดใหญ่ สำนักงานอำนวยการ และหอนาฬิกาประจำโรงเรียน' },
      stem: { name: 'ศูนย์นวัตกรรม STEM และดาราศาสตร์', type: 'วิทยาศาสตร์และเทคโนโลยี', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: 'อาคารกระจกนวัตกรรมล้ำสมัย พร้อมหอดูดาว ห้องปฏิบัติการหุ่นยนต์ AI ห้องวิจัยชีววิทยาศาสตร์ และเครื่องพิมพ์ 3 มิติ' },
      theater: { name: 'ศูนย์ศิลปะการแสดงและโรงละครใหญ่', type: 'ศิลปะและดนตรี', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: 'หอประชุมใหญ่ 650 ที่นั่ง พร้อมระบบเสียงมาตรฐานระดับสากล ห้องซ้อมดนตรีออร์เคสตรา และโรงละครแบล็กบ็อกซ์' },
      stadium: { name: 'สนามกีฬาโอลิมปิกและสระว่ายน้ำ', type: 'กีฬาและพลศึกษา', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: 'สนามฟุตบอลหญ้าเทียมมาตรฐานสากล ลู่วิ่งกรีฑา 8 ช่อง อัฒจันทร์เชียร์ สระว่ายน้ำโอลิมปิก และศูนย์ฟิตเนส' },
      library: { name: 'หอสมุดทรงกลมและศูนย์วิทยบริการ', type: 'ศูนย์การเรียนรู้', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: 'หอสมุดโดมกระจกโปร่งแสง หนังสือวิชาการกว่า 50,000 เล่ม พื้นที่ค้นคว้าเงียบสงบ และระบบสืบค้นข้อมูลทั่วโลก' },
      lake: { name: 'เส้นทางธรรมชาติและทะเลสาบเชิงนิเวศ 190 ไร่', type: 'ธรรมชาติและสิ่งแวดล้อม', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: 'พื้นที่ป่าธรรมชาติ 75 เอเคอร์ เส้นทางเดินศึกษาธรรมชาติ ลานเรียนรู้กลางแจ้ง สวนพฤกษศาสตร์ และทะเลสาบธรรมชาติ' }
    },
    CN: {
      main: { name: 'SSS主教学楼与钟楼 Discovery Hall', type: '学术中心', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: 'SSS核心古典现代综合主楼，内设大型阶梯讲堂、行政中枢及标志性钟楼。' },
      stem: { name: 'STEM前沿科技与天文科研中心', type: '科技创新', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: '配备专业天文台圆顶、AI机器人竞赛场地、基因生物实验室及3D研发智造工坊。' },
      theater: { name: '表演艺术大剧院与交响乐大厅', type: '艺术文化', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: '650座高规格专业声学剧场、交响乐排练室、戏剧黑匣子剧场及数字录音棚。' },
      stadium: { name: '奥林匹克综合运动场馆与游泳中心', type: '体育竞技', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: '标准天然足球草坪、8道专业田径跑道、室内恒温泳池、篮球馆及千人观礼看台。' },
      library: { name: '穹顶全景学术图书馆', type: '信息资源', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: '环形采光玻璃穹顶建筑，藏书逾50,000册，设个人研习舱与全球期刊数据库。' },
      lake: { name: '75英亩自然生态保护林与湖泊', type: '户外生态', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: '纯净的常青树森林步道、户外圆形剧场、有机农艺研学基地与生态湖区。' }
    },
    JP: {
      main: { name: 'SSS本校舎＆シンボル時計塔', type: '学術本部', img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800', desc: '伝統と先進が調和するSSSのシンボル校舎。大講堂、学校本部、象徴的な時計塔を備えます。' },
      stem: { name: 'STEMイノベーション＆天文観測棟', type: '先端科学', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800', desc: '天体観測ドーム、AIロボティクス研究室、バイオ実験室、次世代3Dラボを完備。' },
      theater: { name: 'パフォーミングアーツ大劇場', type: '芸術文化', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800', desc: '優れた音響を誇る650席の大劇場、オーケストラスタジオ、ブラックボックステアター。' },
      stadium: { name: 'オリンピックスタジアム＆総合アリーナ', type: 'スポーツ施設', img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800', desc: '公式人工芝サッカー場、8レーントラック、温水プール、アリーナ、観客スタンド。' },
      library: { name: 'ガラスドーム学術図書館', type: 'メディアセンター', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800', desc: '5万冊の蔵書と個別自習ブース、広大な森林を見渡すパノラマ閲覧席を備えた円形図書館。' },
      lake: { name: '75エーカー自然の森とエコレイク', type: '野外自然環境', img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800', desc: '緑豊かな常緑樹の森、野外円形教室、オーガニックガーデン、生物多様性を育む湖。' }
    }
  };

  const currentInfo = buildingsInfo[lang] || buildingsInfo.EN;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 620;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNight ? 0x050c18 : 0x0a192f);
    scene.fog = new THREE.FogExp2(isNight ? 0x050c18 : 0x0a192f, 0.008);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(90, 80, 110);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(isNight ? 0x223355 : 0xffffff, isNight ? 1.2 : 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(isNight ? 0x60a5fa : 0xfff7ed, isNight ? 1.5 : 2.8);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-60, 40, -60);
    scene.add(rimLight);

    const interactiveObjects = [];

    // Helper Materials
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 });
    const navyMat = new THREE.MeshStandardMaterial({ color: 0x0f284e, roughness: 0.4, metalness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
    const roofSlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const grassMat = new THREE.MeshStandardMaterial({ color: isNight ? 0x0f291e : 0x15803d, roughness: 0.8 });
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 });

    // Terrain Island Base
    const groundGeo = new THREE.BoxGeometry(160, 4, 140);
    const ground = new THREE.Mesh(groundGeo, grassMat);
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Campus Ring Road
    const roadGeo = new THREE.RingGeometry(45, 52, 40);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.05, 0);
    road.receiveShadow = true;
    scene.add(road);

    // 1. SSS Discovery Main Academic Hall & Clock Tower
    const mainGroup = new THREE.Group();
    mainGroup.position.set(-15, 0, -10);
    mainGroup.userData = { id: 'main' };

    const mainBase = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 18), wallMat);
    mainBase.position.y = 7;
    mainBase.castShadow = true;
    mainBase.receiveShadow = true;
    mainGroup.add(mainBase);

    for (let i = -8; i <= 8; i += 4) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 12, 12), goldMat);
      col.position.set(i, 6, 9.5);
      col.castShadow = true;
      mainGroup.add(col);
    }
    const pediment = new THREE.Mesh(new THREE.ConeGeometry(10, 4, 4), navyMat);
    pediment.rotation.y = Math.PI / 4;
    pediment.position.set(0, 14, 9.5);
    mainGroup.add(pediment);

    const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(19, 7, 4), roofSlateMat);
    mainRoof.rotation.y = Math.PI / 4;
    mainRoof.position.y = 17.5;
    mainRoof.castShadow = true;
    mainGroup.add(mainRoof);

    const tower = new THREE.Mesh(new THREE.BoxGeometry(6, 16, 6), wallMat);
    tower.position.set(0, 22, 0);
    tower.castShadow = true;
    mainGroup.add(tower);

    const towerCap = new THREE.Mesh(new THREE.ConeGeometry(4.5, 8, 4), goldMat);
    towerCap.rotation.y = Math.PI / 4;
    towerCap.position.set(0, 34, 0);
    towerCap.castShadow = true;
    mainGroup.add(towerCap);

    const flagpole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6), goldMat);
    flagpole.position.set(0, 39, 0);
    mainGroup.add(flagpole);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.8), new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }));
    flag.position.set(1.5, 40.5, 0);
    mainGroup.add(flag);

    scene.add(mainGroup);
    interactiveObjects.push(mainBase);

    // 2. STEM & Biotech Innovation Complex
    const stemGroup = new THREE.Group();
    stemGroup.position.set(38, 0, -25);
    stemGroup.userData = { id: 'stem' };

    const stemBase = new THREE.Mesh(new THREE.CylinderGeometry(12, 14, 12, 16), glassMat);
    stemBase.position.y = 6;
    stemBase.castShadow = true;
    stemGroup.add(stemBase);

    const stemRoof = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 1.5, 16), navyMat);
    stemRoof.position.y = 12.5;
    stemGroup.add(stemRoof);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
    dome.position.set(0, 13, 0);
    dome.castShadow = true;
    stemGroup.add(dome);

    scene.add(stemGroup);
    interactiveObjects.push(stemBase);

    // 3. Grand Performing Arts Center
    const theaterGroup = new THREE.Group();
    theaterGroup.position.set(-45, 0, 25);
    theaterGroup.userData = { id: 'theater' };

    const theaterBody = new THREE.Mesh(new THREE.CylinderGeometry(15, 17, 10, 8, 1, false, 0, Math.PI * 1.3), navyMat);
    theaterBody.position.y = 5;
    theaterBody.castShadow = true;
    theaterGroup.add(theaterBody);

    const theaterGlass = new THREE.Mesh(new THREE.CylinderGeometry(14.8, 16.8, 9.8, 8, 1, false, Math.PI * 1.3, Math.PI * 0.7), glassMat);
    theaterGlass.position.y = 5;
    theaterGroup.add(theaterGlass);

    scene.add(theaterGroup);
    interactiveObjects.push(theaterBody);

    // 4. Olympic Athletics Stadium
    const stadiumGroup = new THREE.Group();
    stadiumGroup.position.set(40, 0, 32);
    stadiumGroup.userData = { id: 'stadium' };

    const track = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 24), trackMat);
    track.position.y = 0.2;
    stadiumGroup.add(track);

    const pitch = new THREE.Mesh(new THREE.BoxGeometry(26, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
    pitch.position.y = 0.3;
    stadiumGroup.add(pitch);

    const grandstand = new THREE.Mesh(new THREE.BoxGeometry(32, 6, 5), navyMat);
    grandstand.position.set(0, 3, -12);
    grandstand.castShadow = true;
    stadiumGroup.add(grandstand);

    scene.add(stadiumGroup);
    interactiveObjects.push(pitch);

    // 5. Grand Rotunda Library
    const libGroup = new THREE.Group();
    libGroup.position.set(-18, 0, 38);
    libGroup.userData = { id: 'library' };

    const libRotunda = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 10, 20), wallMat);
    libRotunda.position.y = 5;
    libRotunda.castShadow = true;
    libGroup.add(libRotunda);

    const libDome = new THREE.Mesh(new THREE.SphereGeometry(8.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
    libDome.position.y = 10;
    libDome.castShadow = true;
    libGroup.add(libDome);

    scene.add(libGroup);
    interactiveObjects.push(libRotunda);

    // 6. Lake
    const lakeGeo = new THREE.CylinderGeometry(14, 16, 0.8, 16);
    const lake = new THREE.Mesh(lakeGeo, waterMat);
    lake.position.set(-50, 0.1, -35);
    lake.userData = { id: 'lake' };
    scene.add(lake);
    interactiveObjects.push(lake);

    // Procedural Trees
    const treePositions = [
      [-65, -45], [-55, -55], [-40, -50], [-70, -20], [-60, 5],
      [-55, 48], [-38, 52], [5, 50], [20, 52], [65, 45],
      [68, 15], [65, -15], [58, -48], [35, -55], [10, -52]
    ];
    treePositions.forEach(([tx, tz]) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0, tz);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3), new THREE.MeshStandardMaterial({ color: 0x5c3a21 }));
      trunk.position.y = 1.5;
      treeGroup.add(trunk);
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.8, 6, 7), new THREE.MeshStandardMaterial({ color: isNight ? 0x064e3b : 0x15803d }));
      foliage.position.y = 5;
      treeGroup.add(foliage);
      scene.add(treeGroup);
    });

    // Campus Bus
    const busGroup = new THREE.Group();
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 6), goldMat);
    busBody.position.y = 1.3;
    busGroup.add(busBody);
    scene.add(busGroup);

    // Controls
    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };
    let cameraAngle = 0.8;
    let cameraElevation = 0.6;
    let cameraDistance = 140;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isMouseDown = true;
      setAutoRotate(false);
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData?.id && parent.parent) {
          parent = parent.parent;
        }
        if (parent?.userData?.id) {
          container.style.cursor = 'pointer';
          setHoveredBuilding(currentInfo[parent.userData.id]);
        }
      } else {
        container.style.cursor = isMouseDown ? 'grabbing' : 'grab';
        setHoveredBuilding(null);
      }

      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      cameraAngle -= deltaX * 0.008;
      cameraElevation = Math.max(0.15, Math.min(1.3, cameraElevation + deltaY * 0.008));
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e) => {
      if (Math.abs(e.clientX - prevMousePos.x) < 3 && Math.abs(e.clientY - prevMousePos.y) < 3) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, true);
        if (intersects.length > 0) {
          let parent = intersects[0].object;
          while (parent && !parent.userData?.id && parent.parent) {
            parent = parent.parent;
          }
          if (parent?.userData?.id) {
            setSelectedBuilding(currentInfo[parent.userData.id]);
          }
        }
      }
      isMouseDown = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      cameraDistance = Math.max(60, Math.min(220, cameraDistance + e.deltaY * 0.1));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    let animId;
    let busAngle = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isMouseDown) {
        cameraAngle += 0.0025;
      }

      camera.position.x = Math.sin(cameraAngle) * Math.cos(cameraElevation) * cameraDistance;
      camera.position.z = Math.cos(cameraAngle) * Math.cos(cameraElevation) * cameraDistance;
      camera.position.y = Math.sin(cameraElevation) * cameraDistance;
      camera.lookAt(0, 8, 0);

      busAngle += 0.008;
      busGroup.position.x = Math.cos(busAngle) * 48.5;
      busGroup.position.z = Math.sin(busAngle) * 48.5;
      busGroup.rotation.y = -busAngle + Math.PI / 2;

      flag.rotation.y = Math.sin(Date.now() * 0.005) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 620;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [isNight, autoRotate, lang]);

  return (
    <div className="w-full relative select-none rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(15,23,42,0.9)] border-2 border-blue-500/30 bg-gradient-to-b from-[#0a192f] via-[#030a16] to-[#01050c]">
      <div className="absolute top-6 left-6 right-6 z-30 flex flex-wrap justify-between items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto bg-slate-950/85 backdrop-blur-md px-5 py-2.5 rounded-full border border-blue-400/40 text-xs font-black text-white shadow-2xl">
          <Sparkles size={16} className="text-[#f59e0b] animate-pulse" />
          <span className="tracking-widest">SSS REAL-TIME 3D DIGITAL TWIN</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1"></span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/85 backdrop-blur-md p-2 rounded-full border border-blue-400/40 shadow-2xl">
          <button 
            onClick={() => setAutoRotate(!autoRotate)} 
            className={`p-2 rounded-full transition-all text-xs font-bold flex items-center gap-1.5 ${autoRotate ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
            title="Toggle Orbit"
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{autoRotate ? 'Auto Orbit' : 'Paused'}</span>
          </button>
          
          <button 
            onClick={() => setIsNight(!isNight)} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-white/10 text-[#f59e0b] hover:bg-white/20 transition-all"
          >
            {isNight ? <Sun size={14} /> : <Moon size={14} />}
            <span className="hidden sm:inline">{isNight ? 'Day Mode' : 'Night Mode'}</span>
          </button>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full h-[640px] cursor-grab active:cursor-grabbing relative overflow-hidden"
      ></div>

      {hoveredBuilding && !selectedBuilding && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-950/90 text-white px-5 py-2 rounded-full border border-[#f59e0b] shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-ping"></div>
          <span className="font-extrabold text-xs uppercase tracking-wider">{hoveredBuilding.name}</span>
          <span className="text-[10px] text-blue-300">({hoveredBuilding.type})</span>
        </div>
      )}

      {selectedBuilding && (
        <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-40 bg-slate-950/95 backdrop-blur-2xl p-6 rounded-3xl border-2 border-[#f59e0b] shadow-[0_20px_60px_rgba(0,0,0,0.95)] animate-fade-in text-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] bg-amber-400/20 px-2.5 py-0.5 rounded-md border border-[#f59e0b]/40 inline-block">
                {selectedBuilding.type}
              </span>
              <h4 className="text-xl font-black mt-1 text-white">{selectedBuilding.name}</h4>
            </div>
            <button onClick={() => setSelectedBuilding(null)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          
          <img src={selectedBuilding.img} alt={selectedBuilding.name} className="w-full h-40 object-cover rounded-2xl mb-4 shadow-xl border border-white/10" />
          
          <p className="text-xs text-slate-200 leading-relaxed mb-5 font-normal">
            {selectedBuilding.desc}
          </p>

          <div className="flex gap-2">
            <button onClick={() => setSelectedBuilding(null)} className="flex-1 bg-gradient-to-r from-blue-900 to-[#0c1b33] hover:brightness-110 py-3 rounded-xl text-xs font-black text-white transition-all border border-blue-400/40 flex items-center justify-center gap-2 shadow-lg">
              <Eye size={14} className="text-[#f59e0b]" /> Explore Facilities & Booking
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-6 z-20 pointer-events-none hidden md:flex items-center gap-3 text-xs font-bold text-slate-300 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-blue-400/30">
        <Compass size={16} className="text-[#f59e0b]" />
        <span>Left-click + Drag to Orbit • Scroll Wheel to Zoom • Click any 3D building to inspect</span>
      </div>
    </div>
  );
};

// =========================================================================
// Interactive Story Gallery Component (Auto-play + Manual slider)
// =========================================================================
const CampusStoryGallery = ({ lang = 'EN' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const storiesData = {
    EN: [
      {
        tag: "STEM & Bio-Robotics",
        title: "The Spark of Scientific Discovery",
        desc: "In our state-of-the-art STEM innovation laboratories, curiosity transforms into real-world breakthroughs. Students conduct university-level biotech research, design autonomous AI robotics, and pitch patents under the mentorship of industry experts.",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200",
        stat: "Top 1% Robotics"
      },
      {
        tag: "Performing & Fine Arts",
        title: "Finding Voice on the Grand Stage",
        desc: "From classical symphony orchestra performances to breathtaking dramatic stage productions in our 650-seat grand theater, SSS students develop the confidence, emotional depth, and creative courage to express their authentic voice.",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200",
        stat: "30+ Annual Shows"
      },
      {
        tag: "Athletics & Teamwork",
        title: "Grit, Resilience & Champion Spirit",
        desc: "On our 75-acre athletics complex, our student-athletes learn the transformative value of dedication, mental toughness, and mutual trust as they compete for regional and national championship honors.",
        image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200",
        stat: "15+ Varsity Sports"
      },
      {
        tag: "75-Acre Outdoor Learning",
        title: "Nature as the Ultimate Classroom",
        desc: "Surrounded by Pacific Northwest forest canopies, students step beyond traditional walls into open-air ecological reserves. From organic sustainability projects to wilderness leadership treks, learning is vibrant and alive.",
        image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1200",
        stat: "75 Acres Forest"
      },
      {
        tag: "Global Community",
        title: "A Family of 30+ Nationalities",
        desc: "SSS is a welcoming, vibrant international family. In every classroom debate and cultural celebration, students forge lifelong global connections that broaden their world perspective and build lifelong empathy.",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200",
        stat: "30+ Nations"
      },
      {
        tag: "University Acceptance",
        title: "Launchpad to Ivy League & World Elite",
        desc: "With a dedicated 4-year individualized college counseling roadmap, 100% of SSS graduates gain admission to leading global universities, armed with intellect, character, and global vision.",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200",
        stat: "100% Acceptance"
      }
    ],
    TH: [
      {
        tag: "นวัตกรรม STEM และหุ่นยนต์",
        title: "จุดประกายการค้นพบทางวิทยาศาสตร์",
        desc: "ในห้องปฏิบัติการนวัตกรรม STEM ที่ทันสมัย ความอยากรู้อยากเห็นของนักเรียนเปลี่ยนเป็นผลงานจริง นักเรียนได้ทำวิจัยชีววิทยาศาสตร์ระดับมหาวิทยาลัย ออกแบบหุ่นยนต์ AI และสร้างสรรค์โครงงานร่วมกับผู้เชี่ยวชาญ",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200",
        stat: "อันดับ 1 หุ่นยนต์เยาวชน"
      },
      {
        tag: "ศิลปะและการแสดง",
        title: "ค้นพบพลังแห่งความคิดสร้างสรรค์บนเวทีใหญ่",
        desc: "จากการบรรเลงวงดุริยางค์ซิมโฟนี ไปจนถึงการแสดงละครเวทีสุดตระการตา ณ โรงละคร 650 ที่นั่ง นักเรียน SSS ได้พัฒนาความมั่นใจ ความคิดสร้างสรรค์ และความกล้าหาญในการแสดงออกอย่างงดงาม",
        image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200",
        stat: "30+ การแสดงต่อปี"
      },
      {
        tag: "การกีฬาและการทำงานเป็นทีม",
        title: "พลังแห่งความมุ่งมั่นและจิตวิญญาณแห่งชัยชนะ",
        desc: "ในสนามกีฬามาตรฐานโอลิมปิก นักกีฬาของ SSS ได้เรียนรู้คุณค่าของความพยายาม น้ำใจนักกีฬา และความสามัคคีในการแข่งขันระดับประเทศ",
        image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200",
        stat: "15+ ชนิดกีฬาชั้นนำ"
      },
      {
        tag: "ห้องเรียนธรรมชาติ 190 ไร่",
        title: "เมื่อธรรมชาติกลายเป็นห้องเรียนที่ยิ่งใหญ่",
        desc: "ท่ามกลางร่มเงาต้นไม้เขียวชอุ่ม 75 เอเคอร์ การเรียนรู้ไม่ได้จำกัดอยู่แค่ในห้องสี่เหลี่ยม แต่ขยายสู่ธรรมชาติ ทั้งการศึกษาเชิงนิเวศ การทำเกษตรอินทรีย์ และการสร้างภาวะผู้นำกลางแจ้ง",
        image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1200",
        stat: "พื้นที่ธรรมชาติ 190 ไร่"
      },
      {
        tag: "ชุมชนนานาชาติ",
        title: "ครอบครัวอบอุ่นจากกว่า 30 สัญชาติทั่วโลก",
        desc: "SSS คือชุมชนการศึกษาที่เปิดกว้างและเปี่ยมด้วยมิตรภาพ ในทุกการแลกเปลี่ยนความคิดเห็นและกิจกรรมวัฒนธรรม นักเรียนได้สร้างมิตรภาพไร้พรมแดนและความเข้าใจในความหลากหลาย",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200",
        stat: "30+ สัญชาตินานาชาติ"
      },
      {
        tag: "ความสำเร็จสู่มหาวิทยาลัย",
        title: "ก้าวสู่มหาวิทยาลัยชั้นนำระดับโลก 100%",
        desc: "ด้วยการแนะแนวศึกษาต่อแบบเข้มข้นรายบุคคลตลอด 4 ปี นักเรียน SSS ได้รับการตอบรับเข้าศึกษาต่อในมหาวิทยาลัยระดับโลกและกลุ่ม Ivy League ครบ 100%",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200",
        stat: "100% สอบติดมหาวิทยาลัยชั้นนำ"
      }
    ]
  };

  const stories = storiesData[lang] || storiesData.EN;

  // Auto-play interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, stories.length]);

  const activeStory = stories[currentIndex];

  return (
    <div 
      className="w-full bg-[#0a192f] text-white py-24 px-4 md:px-8 relative overflow-hidden border-t border-blue-500/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b] bg-amber-400/10 px-3.5 py-1 rounded-full border border-[#f59e0b]/30 inline-block mb-3">
              ✨ Campus Life & Inspiring Stories
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              {lang === 'TH' ? 'เรื่องราวแห่งการเติบโต ณ SSS' : 'Stories of SSS: Life, Wonder & Community'}
            </h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1))}
              className="w-12 h-12 rounded-full bg-slate-900/90 border border-blue-400/30 text-white hover:bg-[#f59e0b] hover:text-slate-950 transition-all flex items-center justify-center shadow-lg active:scale-90"
              aria-label="Previous story"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % stories.length)}
              className="w-12 h-12 rounded-full bg-slate-900/90 border border-blue-400/30 text-white hover:bg-[#f59e0b] hover:text-slate-950 transition-all flex items-center justify-center shadow-lg active:scale-90"
              aria-label="Next story"
            >
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>

        {/* Featured Story Display Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-blue-500/30 bg-slate-950 flex flex-col lg:flex-row min-h-[460px]">
          
          {/* Image Area */}
          <div className="w-full lg:w-3/5 relative h-72 lg:h-auto overflow-hidden">
            <img 
              src={activeStory.image} 
              alt={activeStory.title} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950"></div>
            
            <div className="absolute top-6 left-6 bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-black text-[#f59e0b]">
              {activeStory.tag}
            </div>
          </div>

          {/* Story Narrative Content Area */}
          <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-b from-slate-950 to-[#0c1b33]">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">
                <Award size={16} className="text-[#f59e0b]" /> {activeStory.stat}
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4 leading-snug">
                {activeStory.title}
              </h3>
              
              <p className="text-slate-300 leading-relaxed text-sm md:text-base font-normal">
                {activeStory.desc}
              </p>
            </div>

            {/* Pagination Thumbnails */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <div className="flex gap-2">
                {stories.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-[#f59e0b]' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">
                0{currentIndex + 1} / 0{stories.length}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// =========================================================================
// Main Landing Page Component
// =========================================================================
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
    
    // Video section
    videoTitle: "Experience Life at SSS",
    videoSubtitle: "Take an immersive look into our vibrant campus, student innovations, and inspiring academic journey.",
    videoHighlights: [
      "100% University & Ivy League Acceptance Rate",
      "75-Acre Pristine Forest & Ecological Sanctuary",
      "7:1 Student-to-Teacher Ratio for Personal Mentorship",
      "Over 50+ Student Clubs, Varsity Sports & Arts Ensembles"
    ],

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
    tourDesc: "Take an interactive virtual tour of our state-of-the-art facilities rendered in real-time 3D WebGL. Click and drag to rotate, scroll to zoom, and click any building for detailed information.",
    live3d: "REAL-TIME 3D WEBGL",
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
    
    videoTitle: "สัมผัสบรรยากาศการเรียนรู้ ณ SSS",
    videoSubtitle: "เปิดประสบการณ์ชมวิทยาเขตที่ทันสมัย การสร้างสรรค์นวัตกรรมของนักเรียน และการเดินทางทางการศึกษาที่น่าประทับใจ",
    videoHighlights: [
      "อัตราการสอบติดมหาวิทยาลัยชั้นนำระดับโลก 100%",
      "พื้นที่ธรรมชาติ 75 เอเคอร์ (190 ไร่) อันอุดมสมบูรณ์",
      "อัตราส่วนนักเรียนต่อครู 7:1 ดูแลใกล้ชิดทุกมิติ",
      "ชมรมและกิจกรรมมากกว่า 50 ชมรม ทั้งกีฬา ดนตรี และนวัตกรรม"
    ],

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
    tourTitle: "สำรวจโรงเรียนโมเดล 3 มิติสมจริง (SSS 3D WebGL Campus)",
    tourDesc: "ทัวร์เสมือนจริงชมสถาปัตยกรรมอาคารเรียนแบบ 3D WebGL เรนเดอร์แบบเรียลไทม์ คลิกและลากเพื่อหมุนโมเดล 360 องศา เลื่อนลูกกลิ้งเมาส์เพื่อซูม หรือคลิกที่อาคารเพื่อดูรายละเอียด",
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
    
    videoTitle: "沉浸体验SSS校园风采",
    videoSubtitle: "领略现代化绿色生态校园、学生创新项目与启发式求学之旅。",
    videoHighlights: [
      "100% 全球顶尖大学及名校录取率",
      "75英亩（190亩）常青生态林地",
      "1:7 关怀型师生比例，全程导师引领",
      "50余个专业学术社团、竞技校队与艺术团"
    ],

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
    tourDesc: "开启现代化校园虚拟实景之旅。基于WebGL实时3D渲染，点击并拖拽可360度旋转，滚动缩放，点击任意建筑即可查看详细介绍。",
    live3d: "实时3D WEBGL",
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
    
    videoTitle: "SSSスクール紹介ムービー",
    videoSubtitle: "緑あふれるキャンパス、生徒たちの探究心、感動に満ちたスクールライフをご覧ください。",
    videoHighlights: [
      "世界トップ大学への進学率 100%",
      "75エーカーの広大な自然環境とエコキャンパス",
      "生徒7名に対し教員1名のきめ細やかな個別指導",
      "50以上の多彩なクラブ・スポーツ・芸術プログラム"
    ],

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
    tourDesc: "最新の校舎設備をバーチャルツアーで体験。リアルタイム3D WebGLによるレンダリングで、ドラッグ操作による回転、ズーム、各建物の詳細確認が可能です。",
    live3d: "リアルタイム3D WebGL",
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
      
      {/* Luxury Royal Navy Top Utility Bar */}
      <div className="hidden md:flex w-full bg-gradient-to-r from-[#0c1b33] via-[#0f284e] to-[#0a192f] text-white py-2 px-8 justify-end text-xs font-semibold uppercase tracking-wider items-center gap-6 z-50 relative shadow-[0_5px_20px_rgba(10,25,47,0.4)] border-b border-blue-500/20">
        {t.utility.map(link => (
          <span key={link.name} onClick={() => navigate(link.path)} className="hover:text-[#f59e0b] cursor-pointer transition-transform hover:-translate-y-0.5 duration-200 block">{link.name}</span>
        ))}
        
        {/* Colorful Country Flag Language Switcher */}
        <div className="relative ml-4 border-l border-white/20 pl-6">
          <button 
            onClick={() => setLangOpen(!langOpen)} 
            className="flex items-center gap-2.5 bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 px-3.5 py-1.5 rounded-full transition-all border border-blue-300/30 shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:scale-95 cursor-pointer"
          >
            <FlagIcon code={currentLang.code} className="w-5 h-3.5 shadow-sm" />
            <span className="font-extrabold text-white text-xs tracking-wider">{currentLang.code}</span>
            <ChevronDown size={14} className={`text-white/80 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {langOpen && (
            <div className="absolute top-[125%] right-0 mt-1 w-44 bg-white rounded-2xl shadow-[0_15px_35px_rgba(15,23,42,0.25)] border border-slate-100 overflow-hidden z-50 transform origin-top-right animate-fade-in" style={{ perspective: '1000px' }}>
              {languages.map(lang => (
                <div 
                  key={lang.code} 
                  onClick={() => changeLanguage(lang)} 
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50/80 cursor-pointer transition-all duration-150 border-b border-slate-50 last:border-0 ${currentLang.code === lang.code ? 'bg-blue-50 font-black text-blue-900' : 'text-slate-700'}`}
                >
                  <FlagIcon code={lang.code} className="w-6 h-4 shadow-sm" />
                  <span className="font-bold text-xs uppercase tracking-wider">{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Luxury Navigation */}
      <nav className={`w-full z-40 transition-all duration-500 ${isScrolled ? 'fixed top-0 bg-white/95 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.08)] py-4 border-b border-slate-100' : 'absolute top-12 bg-transparent py-6'} px-8 flex justify-between items-center`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-300 group-hover:rotate-6 shadow-xl ${isScrolled ? 'bg-gradient-to-br from-[#0c1b33] to-[#1e3a8a] text-white border border-blue-900/30' : 'bg-white text-[#0c1b33] border border-white/50'}`}>
            S
          </div>
          <div className="flex flex-col">
            <span className={`text-3xl font-black tracking-tight uppercase transition-colors duration-300 leading-none ${isScrolled ? 'text-[#0c1b33]' : 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]'}`}>
              SSS
            </span>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isScrolled ? 'text-blue-900' : 'text-amber-300 drop-shadow-md'}`}>
              ACADEMY
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 h-full">
          {t.mainNav.map((nav) => (
            <div 
              key={nav.name} 
              className="relative group h-full py-2"
              onMouseEnter={() => setActiveDropdown(nav.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className={`font-bold uppercase tracking-wider text-[13px] flex items-center gap-1 cursor-pointer transition-colors ${isScrolled ? 'text-[#0c1b33] hover:text-[#f59e0b]' : 'text-white drop-shadow-md hover:text-[#f59e0b]'}`}>
                {nav.name} <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === nav.name ? 'rotate-180 text-[#f59e0b]' : ''}`} />
              </span>
              
              <div 
                className={`absolute top-[120%] left-0 w-64 bg-gradient-to-b from-[#0c1b33] to-[#081224] text-white shadow-[0_20px_40px_rgba(10,25,47,0.4)] border-t-4 border-[#f59e0b] rounded-b-2xl transition-all duration-300 transform origin-top ${activeDropdown === nav.name ? 'rotate-x-0 opacity-100 visible' : '-rotate-x-12 opacity-0 invisible'}`}
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                <div className="py-3 flex flex-col">
                  {nav.links.map(sublink => (
                    <span 
                      key={sublink.path} 
                      onClick={() => { setActiveDropdown(null); navigate(`/page/${sublink.path}`); }}
                      className="px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:text-[#f59e0b] hover:pl-8 cursor-pointer transition-all duration-200 block border-b border-white/5 last:border-0"
                    >
                      {sublink.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/apply')} className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-slate-950 px-7 py-3 ml-4 rounded-full font-black uppercase tracking-wider text-[13px] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 transition-all active:scale-95 shadow-lg border border-amber-300/40">
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

          <div className="z-50 cursor-pointer p-2 rounded-2xl bg-white/10 backdrop-blur-md" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} className={isScrolled ? "text-[#0c1b33]" : "text-white"} /> : <Menu size={28} className={isScrolled ? "text-[#0c1b33]" : "text-white"} />}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0c1b33]/98 backdrop-blur-2xl z-40 flex flex-col pt-28 px-8 pb-8 overflow-y-auto animate-fade-in text-white">
          <div className="flex gap-2 mb-6 pb-4 border-b border-white/20 overflow-x-auto">
            {languages.map(lang => (
              <button 
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${currentLang.code === lang.code ? 'bg-[#f59e0b] text-slate-950 border-[#f59e0b]' : 'bg-white/10 text-white border-white/20'}`}
              >
                <FlagIcon code={lang.code} className="w-4 h-3" />
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 font-black text-2xl uppercase tracking-wider">
            {t.mainNav.map(nav => (
              <div key={nav.name} className="flex flex-col border-b border-white/10 pb-4">
                <span className="flex justify-between items-center mb-2 text-[#f59e0b]">{nav.name}</span>
                <div className="flex flex-col gap-4 pl-4 mt-2">
                  {nav.links.map(sublink => (
                    <span 
                      key={sublink.path} 
                      onClick={() => { setMobileMenuOpen(false); navigate(`/page/${sublink.path}`); }}
                      className="text-sm text-white/80 font-bold hover:text-[#f59e0b] active:scale-95 transition-all"
                    >
                      {sublink.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-4 mt-4 text-lg font-bold">
               <span onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="flex items-center gap-2 text-white bg-white/10 px-6 py-4 rounded-2xl"><Users size={20}/> {t.studentLoginBtn}</span>
               <span onClick={() => { setMobileMenuOpen(false); navigate('/admin/login'); }} className="flex items-center gap-2 text-white bg-blue-900/60 px-6 py-4 rounded-2xl border border-blue-400/30"><ShieldAlert size={20} className="text-[#f59e0b]"/> {t.staffLoginBtn}</span>
               <span onClick={() => { setMobileMenuOpen(false); navigate('/apply'); }} className="flex items-center gap-2 text-slate-950 bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-6 py-4 rounded-2xl font-black">{t.inquireBtn} / {t.actionApply}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Luxury Royal Navy Parallax Video Background */}
      <div className="relative w-full h-[100vh] overflow-hidden flex items-center justify-center pb-24 px-8 md:px-16" style={{ perspective: '1000px' }}>
        <div 
          className="absolute inset-0 z-0 bg-[#0c1b33] scale-110"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        >
          <iframe 
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-75 mix-blend-screen"
            src="https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&controls=0&loop=1&playlist=ScMzIvxBSi4&showinfo=0&rel=0&modestbranding=1" 
            title="SSS Background" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          ></iframe>
        </div>
        
        {/* Luxury Navy & Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1b33] via-slate-950/60 to-black/40 z-10"></div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-center text-center mt-20" style={{ transform: `translateZ(${scrollY * 0.1}px)` }}>
          <div className="inline-flex items-center gap-2 bg-blue-950/80 backdrop-blur-md px-5 py-2 rounded-full border border-blue-400/40 text-xs font-black uppercase tracking-widest text-[#f59e0b] mb-6 shadow-xl animate-fade-in">
            <Sparkles size={14} /> SIMPLE SCHOOL SYSTEM (SSS)
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
            {t.heroTitle1}<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-200">{t.heroTitle2}</span>
          </h1>
          <div className="w-32 h-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] mb-8 shadow-[0_0_20px_rgba(245,158,11,0.7)] rounded-full"></div>
          <p className="text-xl md:text-2xl text-blue-100 font-medium max-w-3xl drop-shadow-xl mb-8 leading-relaxed">
            {t.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-4 mt-4">
            <button onClick={() => navigate('/login')} className="px-10 py-5 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-slate-950 font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_35px_rgba(245,158,11,0.5)] active:scale-95 flex items-center justify-center gap-3 border border-amber-300 group">
              <Users size={28} className="group-hover:scale-125 transition-transform duration-300" /> {t.studentLoginBtn}
            </button>
            <button onClick={() => navigate('/admin/login')} className="px-10 py-5 rounded-full bg-gradient-to-r from-[#0c1b33]/90 to-[#1e3a8a]/90 text-white font-black text-lg md:text-xl hover:scale-105 transition-all shadow-[0_10px_35px_rgba(30,58,138,0.7)] active:scale-95 flex items-center justify-center gap-3 border border-blue-400/40 backdrop-blur-xl group">
              <ShieldAlert size={28} className="group-hover:scale-125 transition-transform duration-300 text-[#f59e0b]" /> {t.staffLoginBtn}
            </button>
          </div>
        </div>
      </div>

      {/* About SSS Section (Royal Navy Background) */}
      <div className="w-full bg-[#0c1b33] text-white py-28 px-8 border-t border-blue-500/20 shadow-inner z-30 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#f59e0b] mb-2">Heritage of Distinction</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-white drop-shadow-sm">{t.aboutTitle}</h2>
            <p className="text-2xl font-medium mb-8 leading-snug text-blue-100">{t.aboutSubtitle}</p>
            
            <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-[#f59e0b]"><Compass /> {t.ourPurposeTitle}</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {t.ourPurposeDesc}
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-[#f59e0b]"><Heart /> {t.ourPromiseTitle}</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {t.ourPromiseDesc}
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2">
             <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800" alt="About SSS" className="w-full h-full object-cover rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-4 border-blue-900/40 hover:scale-[1.02] transition-transform duration-500" />
          </div>
        </div>
      </div>

      {/* NEW: SSS Promotional School Introduction Video Section */}
      <div className="w-full bg-[#050c18] py-28 px-4 md:px-8 relative overflow-hidden border-t-2 border-blue-500/20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          
          {/* Video Player Box */}
          <div className="w-full lg:w-3/5 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-2 border-blue-400/30 bg-slate-950 aspect-video relative group">
            <iframe 
              className="w-full h-full object-cover"
              src="https://www.youtube.com/embed/zpOULjyy-n8?autoplay=0&rel=0&modestbranding=1" 
              title="SSS Official Promotional Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Video Highlights & Overview */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center text-white">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#f59e0b] bg-amber-400/10 px-3.5 py-1 rounded-full border border-[#f59e0b]/30 w-max mb-4">
              <Film size={14} /> {currentLang.code === 'TH' ? 'วิดีโอแนะนำโรงเรียน' : 'Featured Video Spotlight'}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-white">
              {t.videoTitle}
            </h2>
            
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
              {t.videoSubtitle}
            </p>

            <div className="space-y-4 mb-8">
              {t.videoHighlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <CheckCircle2 size={20} className="text-[#f59e0b] shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-slate-200">{highlight}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/apply')} className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-slate-950 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl w-max flex items-center gap-2">
              <span>{currentLang.code === 'TH' ? 'นัดหมายเยี่ยมชมสถานที่จริง' : 'Book a Private Campus Tour'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* SSS Comprehensive Stats (Crisp White & Ice Slate) */}
      <div className="w-full bg-[#f8fafc] py-32 px-8 text-center relative overflow-hidden border-y border-slate-200">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-20 text-[#0c1b33]">{t.owlsEyeTitle}</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center p-8 rounded-3xl bg-white shadow-xl border border-slate-100">
            <div className="text-7xl font-black text-blue-900 mb-4 group-hover:scale-110 transition-transform">{t.stat1Number}</div>
            <p className="text-slate-600 font-bold px-2 text-sm">{t.stat1Desc}</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center p-8 rounded-3xl bg-white shadow-xl border border-slate-100">
            <div className="text-7xl font-black text-blue-900 mb-4 group-hover:scale-110 transition-transform">{t.stat2Number}</div>
            <p className="text-slate-600 font-bold px-2 text-sm">{t.stat2Desc}</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center p-8 rounded-3xl bg-white shadow-xl border border-slate-100">
            <div className="text-7xl font-black text-[#d97706] mb-4 group-hover:scale-110 transition-transform">{t.stat3Number}</div>
            <p className="text-slate-600 font-bold px-2 text-sm">{t.stat3Desc}</p>
          </div>
          <div className="group hover:-translate-y-4 transition-transform duration-300 flex flex-col items-center p-8 rounded-3xl bg-white shadow-xl border border-slate-100">
            <div className="text-7xl font-black text-blue-900 mb-4 group-hover:scale-110 transition-transform">{t.stat4Number}</div>
            <p className="text-slate-600 font-bold px-2 text-sm">{t.stat4Desc}</p>
          </div>
        </div>
      </div>

      {/* Our Campus Section (Pure Crisp White) */}
      <div className="w-full bg-white py-28 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#d97706] mb-2 inline-block">Inspiring Grounds</span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0c1b33] uppercase tracking-tight mb-4">{t.campusTitle}</h2>
            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto">{t.campusSubtitle}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
            <div className="w-full md:w-1/2">
              <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
                {t.campusP1}
              </p>
              <h3 className="text-2xl font-black text-[#0c1b33] mb-4">{t.campusHighlight}</h3>
              <p className="text-lg text-slate-700 leading-relaxed mb-6 font-medium">
                {t.campusP2}
              </p>
              <div className="flex gap-4 font-black text-[#d97706] uppercase tracking-widest text-sm">
                <span>{t.campusTags}</span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
               <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800" alt="Campus" className="w-full h-[500px] object-cover rounded-3xl shadow-2xl border-4 border-slate-100" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900 to-[#0c1b33] text-white rounded-3xl p-10 md:p-16 text-center shadow-2xl border border-blue-800/50">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-[#f59e0b]">{t.acresTitle}</h3>
            <p className="text-lg text-blue-100 leading-relaxed max-w-4xl mx-auto">
              {t.acresDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 100% Reliable Native 3D WebGL Three.js Campus Map Explorer Section */}
      <div className="w-full bg-[#050c18] text-white py-32 px-4 md:px-8 relative overflow-hidden border-t-4 border-[#f59e0b] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] z-30">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={32} className="text-[#f59e0b] animate-bounce" />
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] text-center">
              {t.tourTitle}
            </h2>
          </div>
          <p className="text-blue-200 mb-12 text-center max-w-2xl text-base md:text-lg">
            {t.tourDesc}
          </p>
          
          {/* Integrated Real 3D WebGL Three.js Component */}
          <ThreeCampusExplorer lang={currentLang.code} />
        </div>
      </div>

      {/* Only at SSS (Grid with 3D Tilt Cards) */}
      <div className="w-full bg-gradient-to-b from-[#f8fafc] to-white py-32 px-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#d97706] mb-2 inline-block">Signature SSS Pillars</span>
            <h2 className="text-4xl md:text-6xl font-black text-[#0c1b33] uppercase tracking-tight mb-4 drop-shadow-sm">{t.onlyTitle}</h2>
            <p className="text-slate-500 font-bold text-xl">{t.onlySubtitle}</p>
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
                  <p className="text-blue-100 text-sm mb-4 font-medium">{card.desc}</p>
                  <div className="text-[#f59e0b] font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-slate-950/70 w-max px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 hover:bg-[#f59e0b] hover:text-slate-950 transition-colors">
                    {t.exploreBtn} <ArrowRight size={14} />
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* Here's what makes us, us (Royal Navy Deep Theme) */}
      <div className="w-full bg-[#0c1b33] py-32 px-8 text-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 text-[#f59e0b]">{t.makesUsTitle}</h2>
            <p className="text-xl font-medium max-w-3xl mx-auto text-blue-100">{t.makesUsSubtitle}</p>
            <p className="text-lg text-white mt-4 font-black">{t.chartPath}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                <BookOpen size={48} className="text-[#f59e0b] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4 text-white">{t.pillars[0].title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{t.pillars[0].desc}</p>
             </div>
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                <Users size={48} className="text-[#f59e0b] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4 text-white">{t.pillars[1].title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{t.pillars[1].desc}</p>
             </div>
             <div className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                <ArrowRight size={48} className="text-[#f59e0b] mb-6" />
                <h3 className="text-3xl font-black uppercase mb-4 text-white">{t.pillars[2].title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{t.pillars[2].desc}</p>
             </div>
          </div>
          
          <div className="mt-20 flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => navigate('/apply')} className="bg-[#f59e0b] text-slate-950 px-10 py-4 font-black uppercase tracking-widest hover:bg-white transition-colors shadow-2xl rounded-full">
              {t.actionInquire}
            </button>
            <button onClick={() => navigate('/apply')} className="bg-transparent border-2 border-white text-white px-10 py-4 font-black uppercase tracking-widest hover:bg-white hover:text-[#0c1b33] transition-colors shadow-2xl rounded-full">
              {t.actionVisit}
            </button>
            <button onClick={() => navigate('/apply')} className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-10 py-4 font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl rounded-full border border-blue-400/40">
              {t.actionApply}
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Interactive Story Photo Gallery Section (Autoplay + Manual Slider) */}
      <CampusStoryGallery lang={currentLang.code} />

      {/* Demo Notice Banner */}
      <div className="w-full bg-red-600 text-white font-black text-center py-4 text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[inset_0_5px_15px_rgba(0,0,0,0.3)] relative z-40">
        {t.demoBanner}
      </div>

      {/* Footer (Luxury Midnight Black & Royal Navy) */}
      <footer className="w-full bg-[#030914] text-white py-16 px-8 relative z-30 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 border-b border-slate-800/80 pb-12 mb-8">
          <div className="flex items-start gap-5 max-w-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-[#0c1b33] text-white rounded-2xl shadow-[0_0_25px_rgba(30,58,138,0.6)] border border-blue-500/40 flex-shrink-0 flex items-center justify-center font-black text-4xl">S</div>
            <div>
              <div className="font-black text-2xl uppercase tracking-widest mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Simple School System</div>
              <div className="text-slate-400 text-sm leading-relaxed mb-6 font-medium whitespace-pre-line">{t.footerAddress}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto flex-1 md:ml-12">
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f59e0b] text-sm">{t.footerMeetTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-400">
                {t.mainNav[0].links.slice(0, 4).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f59e0b] text-sm">{t.footerAcademicsTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-400">
                {t.mainNav[1].links.slice(0, 4).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f59e0b] text-sm">{t.footerCommunityTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-400">
                {t.mainNav[2].links.slice(0, 4).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-6 text-[#f59e0b] text-sm">{t.footerAdmissionsTitle}</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-400">
                {t.mainNav[3].links.slice(0, 3).map(l => (
                  <li key={l.name} onClick={() => navigate(`/page/${l.path}`)} className="hover:text-white cursor-pointer transition-colors">{l.name}</li>
                ))}
                <li onClick={() => navigate('/apply')} className="text-[#f59e0b] hover:text-white cursor-pointer transition-colors">{t.actionApply}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center text-slate-500 text-xs gap-6 font-medium">
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
