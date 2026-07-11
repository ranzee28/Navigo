import React, { useState, useEffect, useRef } from 'react';
import { Building, Road, DijkstraStep } from './types';
import { DEFAULT_BUILDINGS, DEFAULT_ROADS, generateRandomCampusMap } from './data/mockCampus';
import { generateDijkstraSteps, getShortestPath } from './algorithms/dijkstra';
import MapCanvas from './components/map/MapCanvas';
import ControlPanel from './components/panels/ControlPanel';
import DataPanel from './components/panels/DataPanel';
import PseudocodePanel from './components/panels/PseudocodePanel';
import StatsPanel from './components/panels/StatsPanel';
import ComplexityLab from './components/lab/ComplexityLab';
import ToastContainer, { Toast } from './components/ToastContainer';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './components/layout/LandingPage';
import { Compass, Clock, Activity, ListCollapse, Terminal, ClipboardList, FlaskConical, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sliders, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose } from 'lucide-react';

export default function App() {
  // Status Landing Page
  const [showLanding, setShowLanding] = useState<boolean>(true);

  // Status Notifikasi Toast
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Pembantu untuk memicu notifikasi toast kustom
  const triggerToast = (type: 'traffic' | 'closure' | 'success' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Status Graf (Graph State)
  const [buildings, setBuildings] = useState<Building[]>(DEFAULT_BUILDINGS);
  const [roads, setRoads] = useState<Road[]>(DEFAULT_ROADS);
  const [selectedStartId, setSelectedStartId] = useState<string>('cafeteria');
  const [selectedEndId, setSelectedEndId] = useState<string>('dorm_a');
  
  // Alat Interaktif (Interactive Tool)
  const [activeTool, setActiveTool] = useState<'select' | 'add_node' | 'connect_road' | 'delete' | 'toggle_traffic' | 'toggle_closure'>('select');

  // Status Langkah Dijkstra (Dijkstra Step State)
  const [steps, setSteps] = useState<DijkstraStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isSimulationPlaying, setIsSimulationPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(500); // Penundaan 500ms per baris kode
  const [executionTime, setExecutionTime] = useState<number>(0);

  // Status Animasi Pengiriman (Dispatch Animation State)
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchProgress, setDispatchProgress] = useState<number>(0);
  const [dispatchSegmentIndex, setDispatchSegmentIndex] = useState<number>(0);
  const [isDelivered, setIsDelivered] = useState<boolean>(false);

  // Tab Dinamis untuk merapikan antarmuka UI
  const [activeTab, setActiveTab] = useState<'status' | 'simulation' | 'benchmark'>('status');

  // Preferensi Rute: 'shortest' (Jarak Terpendek) atau 'fastest' (Jalur Tercepat / Traffic)
  const [routingMode, setRoutingMode] = useState<'shortest' | 'fastest'>('fastest');

  // Ref untuk mengontrol scroll tab konten dikanan
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Fungsi scrolling untuk kontainer tab kanan
  const handleScrollTab = (direction: 'up' | 'down') => {
    if (tabContentRef.current) {
      const scrollAmount = 180;
      tabContentRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Waktu real-time untuk ditampilkan di sistem aktif
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Status perluasan/penciutan bilah sisi kiri
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isToggleHovered, setIsToggleHovered] = useState<boolean>(false);

  // Status perluasan/penciutan bilah sisi kanan
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState<boolean>(true);
  const [isRightToggleHovered, setIsRightToggleHovered] = useState<boolean>(false);

  // Perhitungan status Fullscreen berdasarkan visibilitas kedua sidebar
  const isFullscreen = !isSidebarExpanded && !isRightSidebarExpanded;

  const handleToggleFullscreen = () => {
    if (isFullscreen) {
      setIsSidebarExpanded(true);
      setIsRightSidebarExpanded(true);
      addLog("LAYAR PENUH NONAKTIF: Menampilkan kembali panel kontrol dan analisis data.");
    } else {
      setIsSidebarExpanded(false);
      setIsRightSidebarExpanded(false);
      addLog("LAYAR PENUH AKTIF: Menyembunyikan semua panel untuk observasi rute maksimal.");
    }
  };

  // Log Insiden / Peringatan
  const [incidentLogs, setIncidentLogs] = useState<string[]>([]);

  // Ref untuk menampung timer putar ulang (playback)
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pembantu untuk menambahkan log berstempel waktu dalam Bahasa Indonesia
  const addLog = (message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setIncidentLogs(prev => [`[${timeStr}] ${message}`, ...prev.slice(0, 49)]);
  };

  // Inisialisasi log awal saat aplikasi dimuat
  useEffect(() => {
    addLog("Sistem navigasi siap digunakan.");
    addLog("Pilih gedung asal dan tujuan di peta untuk merencanakan rute.");
  }, []);

  // Setiap kali gedung diseret, perbarui bobot jalan agar proporsional dengan jarak baru
  const handleUpdateBuildings = (updatedBuildings: Building[]) => {
    setBuildings(updatedBuildings);
    
    // Perbarui jarak jalan (bobot) secara otomatis berdasarkan panjang koordinat baru
    const updatedRoads = roads.map(road => {
      const b1 = updatedBuildings.find(b => b.id === road.fromId);
      const b2 = updatedBuildings.find(b => b.id === road.toId);
      if (b1 && b2) {
        const distance = Math.hypot(b1.x - b2.x, b1.y - b2.y);
        const weight = Math.round((distance / 30) * 10) / 10;
        return { ...road, weight };
      }
      return road;
    });
    setRoads(updatedRoads);
  };

  // Kalkulator rute terpendek instan
  const { path: activeRoute, distance: totalDistance } = getShortestPath(
    buildings,
    roads,
    selectedStartId,
    selectedEndId,
    routingMode
  );

  // Jika koordinat gedung berubah atau gedung asal/tujuan berubah, bersihkan status pengiriman jika ada proses aktif
  useEffect(() => {
    if (isDispatching || isDelivered || dispatchProgress !== 0 || dispatchSegmentIndex !== 0 || currentStepIndex !== -1) {
      setIsDispatching(false);
      setIsDelivered(false);
      setDispatchProgress(0);
      setDispatchSegmentIndex(0);
      
      // Bersihkan visualisasi langkah dinamis jika sedang ditampilkan
      if (currentStepIndex !== -1) {
        setCurrentStepIndex(-1);
        setSteps([]);
        setIsSimulationPlaying(false);
      }
    }
  }, [selectedStartId, selectedEndId, buildings, roads]);

  // Penangan putar ulang langkah demi langkah Dijkstra
  useEffect(() => {
    if (isSimulationPlaying) {
      if (currentStepIndex === -1) {
        // Picu dimulainya visualisasi
        const t0 = performance.now();
        const dijkstraSteps = generateDijkstraSteps(buildings, roads, selectedStartId, selectedEndId, routingMode);
        const t1 = performance.now();
        setExecutionTime((t1 - t0) * 1000); // ubah ke mikrodetik
        
        setSteps(dijkstraSteps);
        setCurrentStepIndex(0);
        addLog(`PENCARIAN RUTE: Menjalankan algoritme Dijkstra dari ${buildings.find(b => b.id === selectedStartId)?.name}...`);
        
        // Alihkan tab otomatis ke simulasi agar pengguna melihat jalannya proses!
        setActiveTab('simulation');
      } else {
        playbackTimerRef.current = setTimeout(() => {
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
          } else {
            setIsSimulationPlaying(false);
            addLog("PENCARIAN SELESAI: Rute pengiriman optimal berhasil ditemukan.");
          }
        }, playbackSpeed);
      }
    } else {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    }

    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [isSimulationPlaying, currentStepIndex, steps, playbackSpeed]);

  // Interactive controls triggers
  const handleTogglePlay = () => {
    if (currentStepIndex === steps.length - 1) {
      setCurrentStepIndex(-1);
      setSteps([]);
    }
    setIsSimulationPlaying(prev => !prev);
  };

  const handleStepForward = () => {
    setIsSimulationPlaying(false);
    if (currentStepIndex === -1) {
      const t0 = performance.now();
      const dijkstraSteps = generateDijkstraSteps(buildings, roads, selectedStartId, selectedEndId, routingMode);
      const t1 = performance.now();
      setExecutionTime((t1 - t0) * 1000);
      setSteps(dijkstraSteps);
      setCurrentStepIndex(0);
      setActiveTab('simulation');
    } else if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsSimulationPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleResetSimulation = () => {
    setIsSimulationPlaying(false);
    setCurrentStepIndex(-1);
    setSteps([]);
    setIsDispatching(false);
    setIsDelivered(false);
    addLog("RESET SISTEM: Data pencarian dibersihkan. Kembali ke pemantauan normal.");
  };

  // Handler untuk memulai simulasi langsung dari menu navigasi
  const handleStartSimulationFromMenu = () => {
    handleResetSimulation();
    const t0 = performance.now();
    const dijkstraSteps = generateDijkstraSteps(buildings, roads, selectedStartId, selectedEndId, routingMode);
    const t1 = performance.now();
    setExecutionTime((t1 - t0) * 1000);
    setSteps(dijkstraSteps);
    setCurrentStepIndex(0);
    setIsSimulationPlaying(true);
    setActiveTab('simulation');
    
    // Temukan nama gedung
    const startName = buildings.find(b => b.id === selectedStartId)?.name || selectedStartId;
    const endName = buildings.find(b => b.id === selectedEndId)?.name || selectedEndId;
    triggerToast('success', 'Simulasi Dimulai 🚀', `Mengevaluasi rute logistik optimal dari ${startName} ke ${endName}`);
  };

  // Utilitas modifikasi peta (Map modification utilities)
  const handleGenerateRandomMap = () => {
    handleResetSimulation();
    const { buildings: randB, roads: randR } = generateRandomCampusMap(11);
    setBuildings(randB);
    setRoads(randR);
    setSelectedStartId('cafeteria');
    
    // Cari gedung asrama untuk lokasi tujuan (dormitory)
    const dorms = randB.filter(b => b.type === 'dormitory');
    if (dorms.length > 0) {
      setSelectedEndId(dorms[0].id);
    } else {
      setSelectedEndId(randB[randB.length - 1].id);
    }
    
    addLog("PETA BARU: Peta kampus acak dengan bobot jalan berhasil dibuat.");
  };

  const handleInjectTraffic = () => {
    const openRoads = roads.filter(r => !r.isClosed);
    if (openRoads.length === 0) return;
    
    const randomRoad = openRoads[Math.floor(Math.random() * openRoads.length)];
    const fromNodeName = buildings.find(b => b.id === randomRoad.fromId)?.name || randomRoad.fromId;
    const toNodeName = buildings.find(b => b.id === randomRoad.toId)?.name || randomRoad.toId;

    const trafficMultipliers = [1.5, 2.5, 3.0];
    const newMult = trafficMultipliers[Math.floor(Math.random() * trafficMultipliers.length)];
    
    let severity = "Kepadatan Sedang (1.5x bobot)";
    if (newMult === 2.5) severity = "Kemacetan Tinggi (2.5x bobot)";
    if (newMult === 3.0) severity = "Macet Total / Antrean Panjang (3.0x bobot)";

    const updated = roads.map(r => r.id === randomRoad.id ? { ...r, trafficMultiplier: newMult } : r);
    setRoads(updated);
    addLog(`LALU LINTAS: Terjadi ${severity} antara [${fromNodeName}] dan [${toNodeName}].`);
    triggerToast('traffic', 'Kemacetan Terdeteksi 🚦', `Antara [${fromNodeName}] dan [${toNodeName}]: ${severity}`);
  };

  const handleInjectClosure = () => {
    const openRoads = roads.filter(r => !r.isClosed);
    if (openRoads.length === 0) return;

    const randomRoad = openRoads[Math.floor(Math.random() * openRoads.length)];
    const fromNodeName = buildings.find(b => b.id === randomRoad.fromId)?.name || randomRoad.fromId;
    const toNodeName = buildings.find(b => b.id === randomRoad.toId)?.name || randomRoad.toId;

    const updated = roads.map(r => r.id === randomRoad.id ? { ...r, isClosed: true } : r);
    setRoads(updated);
    addLog(`PENUTUPAN JALAN: Jalan antara [${fromNodeName}] dan [${toNodeName}] ditutup untuk sementara.`);
    triggerToast('closure', 'Jalan Ditutup 🚫', `Akses antara [${fromNodeName}] dan [${toNodeName}] diblokir.`);
  };

  const handleClearIncidents = () => {
    const updated = roads.map(r => ({ ...r, trafficMultiplier: 1.0, isClosed: false }));
    setRoads(updated);
    addLog("INFO JALAN: Semua kemacetan dan penutupan jalan dibersihkan. Arus kembali normal.");
    triggerToast('success', 'Lalu Lintas Normal ✅', 'Semua kemacetan dan penutupan jalan berhasil dibersihkan.');
  };

  const handleTriggerInstantSolve = () => {
    const t0 = performance.now();
    const dijkstraSteps = generateDijkstraSteps(buildings, roads, selectedStartId, selectedEndId, routingMode);
    const t1 = performance.now();
    setExecutionTime((t1 - t0) * 1000);
    setSteps(dijkstraSteps);
    setCurrentStepIndex(dijkstraSteps.length - 1);
    addLog("SOLUSI INSTAN: Rute terpendek berhasil dihitung langsung tanpa jeda simulasi.");
    // Auto switch to status tab so they see metrics
    setActiveTab('status');
  };

  // Loop Animasi Pengiriman Motor/Kurir (Motor/Robot Dispatch Anim Loop)
  const handleTriggerDispatch = () => {
    if (activeRoute.length < 2) return;
    setIsDispatching(true);
    setDispatchProgress(0);
    setDispatchSegmentIndex(0);
    setIsDelivered(false);
    addLog(`KURIR DIKIRIM: Kurir motor pembawa makanan berangkat menyusuri rute terpendek...`);
    setActiveTab('status');
  };

  useEffect(() => {
    let animId: number;
    if (isDispatching && activeRoute.length > 1) {
      const tick = () => {
        setDispatchProgress(prev => {
          const increment = 0.012; // Kecepatan kurir lebih lambat agar terlihat proses perjalanan yang jelas dan mantap
          if (prev + increment >= 1.0) {
            if (dispatchSegmentIndex < activeRoute.length - 2) {
              setDispatchSegmentIndex(idx => idx + 1);
              const nextNodeName = buildings.find(b => b.id === activeRoute[dispatchSegmentIndex + 2])?.name;
              addLog(`GPS AKTIF: Kurir melintasi jalan raya. Menuju [${nextNodeName}].`);
              return 0;
            } else {
              setIsDispatching(false);
              setIsDelivered(true);
              addLog(`PESANAN TIBA: Kurir motor telah sampai di [${buildings.find(b => b.id === selectedEndId)?.name}]. Makanan hangat siap diterima!`);
              return 0;
            }
          }
          return prev + increment;
        });
        animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animId);
  }, [isDispatching, dispatchSegmentIndex, activeRoute, buildings, selectedEndId]);

  // Pengaman Tambahan: Reset status pengiriman jika rute aktif tiba-tiba berubah atau kosong
  useEffect(() => {
    if (isDispatching) {
      if (activeRoute.length < 2) {
        setIsDispatching(false);
        setDispatchProgress(0);
        setDispatchSegmentIndex(0);
      } else if (dispatchSegmentIndex >= activeRoute.length - 1) {
        setIsDispatching(false);
        setDispatchProgress(0);
        setDispatchSegmentIndex(0);
      }
    }
  }, [activeRoute, isDispatching, dispatchSegmentIndex]);

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white h-screen overflow-hidden">
      
      {/* 1. NAVIGASI ATAS / HEADER */}
      <Navbar 
        time={time} 
        onLogoClick={() => setShowLanding(true)} 
        onStartSimulation={handleStartSimulationFromMenu}
        isSimulationPlaying={isSimulationPlaying}
      />

      {/* 2. WADAH TATA LETAK UTAMA (MAIN LAYOUT CONTAINER) */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden w-full min-h-0 bg-[#f0f4f9]">
        
        {/* 2a. BILAH SISI INTERAKTIF (Gaya Kartu Melayang) */}
        <aside 
          className={`${
            isSidebarExpanded ? 'w-[360px]' : 'w-[64px]'
          } flex-shrink-0 bg-white rounded-3xl border border-slate-200/50 flex flex-col h-full transition-all duration-300 z-30 shadow-xs overflow-hidden`}
        >
          {isSidebarExpanded ? (
            <div className="flex flex-col h-full bg-white">
              {/* Header Bilah Sisi dengan Tombol Buka/Tutup */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Panel Kendali</span>
                </div>
                <button
                  onClick={() => setIsSidebarExpanded(false)}
                  title="Sembunyikan Panel"
                  className="p-1.5 hover:bg-slate-50 border border-slate-200 hover:border-indigo-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-xs"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
              
              {/* Konten Panel yang Bisa Discroll */}
              <div className="flex-1 overflow-y-auto p-5">
                <ControlPanel
                  buildings={buildings}
                  roads={roads}
                  selectedStartId={selectedStartId}
                  selectedEndId={selectedEndId}
                  onSelectStart={setSelectedStartId}
                  onSelectEnd={setSelectedEndId}
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  isSimulationPlaying={isSimulationPlaying}
                  onTogglePlay={handleTogglePlay}
                  onStepForward={handleStepForward}
                  onStepBackward={handleStepBackward}
                  onResetSimulation={handleResetSimulation}
                  playbackSpeed={playbackSpeed}
                  onChangePlaybackSpeed={setPlaybackSpeed}
                  onGenerateRandomMap={handleGenerateRandomMap}
                  onInjectTraffic={handleInjectTraffic}
                  onInjectClosure={handleInjectClosure}
                  onClearIncidents={handleClearIncidents}
                  onTriggerInstantSolve={handleTriggerInstantSolve}
                  onTriggerDispatch={handleTriggerDispatch}
                  isDispatching={isDispatching}
                  hasValidPath={activeRoute.length > 0}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center h-full py-4 bg-white">
              {/* Tombol logo ciut dengan transisi hover interaktif ke ikon bilah sisi */}
              <button
                onClick={() => setIsSidebarExpanded(true)}
                onMouseEnter={() => setIsToggleHovered(true)}
                onMouseLeave={() => setIsToggleHovered(false)}
                title="Buka Panel"
                className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center shadow-xs group"
              >
                {isToggleHovered ? (
                  <PanelLeftOpen className="w-5 h-5 text-indigo-600 transition-transform scale-110" />
                ) : (
                  <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                )}
              </button>
            </div>
          )}
        </aside>

        {/* 2b. AREA KERJA UTAMA (Gaya Kartu Melayang) */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200/50 shadow-xs flex flex-col h-full overflow-hidden min-w-0">
          
          {/* Baris Judul Area Kerja */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Area Peta & Simulasi Pengiriman</span>
          </div>

          {/* Konten yang Bisa Discroll di Dalam Kartu Area Kerja */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-6">
              
              {/* Visualisator Peta Interaktif */}
              <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
                <MapCanvas
                  buildings={buildings}
                  roads={roads}
                  activeRoute={activeRoute}
                  currentStep={currentStepIndex !== -1 ? steps[currentStepIndex] : null}
                  selectedStartId={selectedStartId}
                  selectedEndId={selectedEndId}
                  onSelectStart={setSelectedStartId}
                  onSelectEnd={setSelectedEndId}
                  onUpdateBuildings={handleUpdateBuildings}
                  onUpdateRoads={setRoads}
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  isDispatching={isDispatching}
                  dispatchPath={activeRoute}
                  dispatchProgress={dispatchProgress}
                  dispatchSegmentIndex={dispatchSegmentIndex}
                  onDeliveryComplete={() => addLog("Kurir sukses menyelesaikan pengantaran makanan!")}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                  onTriggerToast={triggerToast}
                />
              </div>

              {/* PANEL TAB YANG RAPI (Menggabungkan detail secara bersih) */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-shrink-0">
                
                {/* Navigasi Tab */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                  <button
                    onClick={() => setActiveTab('status')}
                    className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'status'
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Status & Aktivitas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('simulation')}
                    className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'simulation'
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Analisis Data</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('benchmark')}
                    className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'benchmark'
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Benchmark Kinerja</span>
                  </button>
                </div>

                {/* Isi Konten Tab */}
                <div className="relative flex-1 flex">
                  <div 
                    ref={tabContentRef}
                    className="p-6 flex-1 scroll-smooth"
                  >
                    {activeTab === 'status' && (
                      <StatsPanel
                        buildings={buildings}
                        roads={roads}
                        activeRoute={activeRoute}
                        totalDistance={totalDistance}
                        selectedStartId={selectedStartId}
                        selectedEndId={selectedEndId}
                        isDispatching={isDispatching}
                        isDelivered={isDelivered}
                        incidentLogs={incidentLogs}
                      />
                    )}

                    {activeTab === 'simulation' && (
                      <div className="h-full">
                        <DataPanel
                          currentStep={currentStepIndex !== -1 ? steps[currentStepIndex] : null}
                          buildings={buildings}
                          roads={roads}
                          sourceId={selectedStartId}
                          targetId={selectedEndId}
                          executionTime={executionTime}
                          activeRoute={activeRoute}
                          routingMode={routingMode}
                          setRoutingMode={setRoutingMode}
                        />
                      </div>
                    )}

                    {activeTab === 'benchmark' && (
                      <div className="h-full">
                        <ComplexityLab />
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* BAGIAN KAKI / FOOTER */}
            <Footer />
          </main>

        </div>

        {/* 2c. BILAH SISI KANAN INTERAKTIF (Gaya Kartu Melayang) */}
        <aside 
          className={`${
            isRightSidebarExpanded ? 'w-[360px]' : 'w-[64px]'
          } flex-shrink-0 bg-white rounded-3xl border border-slate-200/50 flex flex-col h-full transition-all duration-300 z-30 shadow-xs overflow-hidden`}
        >
          {isRightSidebarExpanded ? (
            <div className="flex flex-col h-full bg-white">
              {/* Header Bilah Sisi dengan Tombol Tutup */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={() => setIsRightSidebarExpanded(false)}
                  title="Sembunyikan Panel Pseudocode"
                  className="p-1.5 hover:bg-slate-50 border border-slate-200 hover:border-indigo-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-xs"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Pseudocode Dijkstra</span>
                  <Terminal className="w-4 h-4 text-indigo-600 animate-pulse" />
                </div>
              </div>
              
              {/* Konten Panel Pseudocode yang Bisa Discroll */}
              <div className="flex-1 overflow-y-auto p-5">
                <PseudocodePanel
                  currentLineIndex={currentStepIndex !== -1 ? steps[currentStepIndex].lineOfCode : -1}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center h-full py-4 bg-white">
              {/* Tombol logo ciut dengan transisi hover interaktif ke ikon bilah sisi kanan */}
              <button
                onClick={() => setIsRightSidebarExpanded(true)}
                onMouseEnter={() => setIsRightToggleHovered(true)}
                onMouseLeave={() => setIsRightToggleHovered(false)}
                title="Buka Panel Pseudocode"
                className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center shadow-xs group"
              >
                {isRightToggleHovered ? (
                  <PanelRightOpen className="w-5 h-5 text-indigo-600 transition-transform scale-110" />
                ) : (
                  <Terminal className="w-5 h-5 text-indigo-600" />
                )}
              </button>
            </div>
          )}
        </aside>

      </div>

      {/* Kontainer Notifikasi Toast */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

    </div>
  );
}
