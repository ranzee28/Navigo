import React, { useState, useRef, useEffect } from 'react';
import { Clock, Menu, X, Play, Compass, RefreshCw, Layout, HelpCircle } from 'lucide-react';
import { gsap } from 'gsap';

interface NavbarProps {
  time: string;
  onLogoClick?: () => void;
  onStartSimulation?: () => void;
  isSimulationPlaying?: boolean;
}

export default function Navbar({ time, onLogoClick, onStartSimulation, isSimulationPlaying }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardNavRef = useRef<HTMLDivElement>(null);

  // GSAP animation for CardNav opening and closing transitions
  useEffect(() => {
    const element = cardNavRef.current;
    if (!element) return;

    if (isMenuOpen) {
      // Smooth reveal with elastic/power scaling and sliding
      gsap.killTweensOf(element);
      gsap.fromTo(element,
        { 
          opacity: 0, 
          scale: 0.92, 
          y: -15,
          visibility: 'hidden'
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          visibility: 'visible',
          duration: 0.45, 
          ease: "power3.out",
          display: "block"
        }
      );
    } else {
      // Smooth slide up and fade out
      gsap.killTweensOf(element);
      gsap.to(element, {
        opacity: 0,
        scale: 0.92,
        y: -15,
        duration: 0.35,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(element, { visibility: 'hidden', display: 'none' });
        }
      });
    }
  }, [isMenuOpen]);

  return (
    <header className="relative bg-slate-950 border-b border-slate-900/80 py-3 px-6 flex items-center justify-between flex-shrink-0 z-40 select-none w-full shadow-md">
      <div className="flex items-center gap-3">
        <div onClick={onLogoClick} className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all">
          <h1 className="text-lg md:text-xl font-bold tracking-widest font-pixel flex items-center bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 shadow-[2px_2px_0px_rgba(79,70,229,0.3)] select-none" style={{ fontFamily: '"Silkscreen", "Press Start 2P", monospace' }}>
            <span className="text-white" style={{ textShadow: '-1px 0 #ff0055, 1px 0 #00ffcc' }}>NAVI</span>
            <span className="text-[#99ff00]" style={{ textShadow: '-1px 0 #ff0055, 1px 0 #00ffcc' }}>GO</span>
          </h1>
        </div>
      </div>

      {/* Lencana indikator status aktif & Tombol Menu Navigasi */}
      <div className="flex items-center gap-3.5 text-xs">
        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-semibold uppercase tracking-wider select-none">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Sistem Aktif
        </span>
        {time && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-300 font-mono font-semibold select-none">
            <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            {time}
          </span>
        )}

        {/* Toggle Button for CardNav */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/50 hover:border-indigo-500/70 text-indigo-300 hover:text-indigo-200 rounded-xl text-[10px] tracking-wider uppercase font-bold transition-all duration-200 cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.15)] hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] select-none font-mono"
        >
          {isMenuOpen ? <X className="w-3.5 h-3.5 text-rose-400" /> : <Menu className="w-3.5 h-3.5 text-indigo-400" />}
          <span>Menu</span>
        </button>
      </div>

      {/* CardNav floating interactive panel */}
      <div
        ref={cardNavRef}
        style={{ display: 'none', visibility: 'hidden' }}
        className="absolute top-16 right-6 w-80 bg-slate-950/95 backdrop-blur-md border border-slate-800/90 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(99,102,241,0.15)] z-50 overflow-hidden"
      >
        {/* Dynamic header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-900/80 mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            <span className="text-[10px] tracking-widest font-bold uppercase text-slate-400 font-mono">Navigo Control Panel</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-indigo-950/60 text-indigo-400 font-mono rounded-md border border-indigo-900/50 uppercase font-semibold">
            v1.0.0
          </span>
        </div>

        {/* Educational info block inside Menu */}
        <div className="space-y-3.5 mb-5 text-left">
          <div className="bg-slate-900/60 border border-slate-850/70 rounded-xl p-3 flex gap-3">
            <Layout className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-bold text-slate-200 tracking-wide font-mono uppercase">Rute Cerdas Dijkstra</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                Mengevaluasi ribuan kemungkinan rute logistik secara instan untuk mencari waktu kirim tercepat.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-850/70 rounded-xl p-3 flex gap-3">
            <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-bold text-slate-200 tracking-wide font-mono uppercase">Lalu Lintas Dinamis</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                Mendeteksi kemacetan, penutupan jalan, dan insiden kurir secara langsung pada kanvas.
              </p>
            </div>
          </div>
        </div>

        {/* The Action Buttons container */}
        <div className="space-y-2.5 pt-1.5 border-t border-slate-900/80">
          
          {/* Mulai Simulasi - HIGH GLOW ICONIC BUTTON */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (onStartSimulation) onStartSimulation();
            }}
            className="relative w-full group py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-bold tracking-widest font-mono border border-emerald-400/50 rounded-xl transition-all duration-300 uppercase text-[11px] cursor-pointer overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.65)] flex items-center justify-center gap-2 select-none"
          >
            {/* Background glowing particles/pulse */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-40 blur-md group-hover:opacity-80 transition-opacity duration-300 z-0" />
            
            <Play className="w-3.5 h-3.5 fill-white text-white group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10 text-white" style={{ textShadow: '0 0 8px rgba(255,255,255,0.6)' }}>Mulai Simulasi</span>
          </button>

          {/* Reset / Kembali ke Landing */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (onLogoClick) onLogoClick();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold tracking-widest font-mono uppercase transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-all duration-500" />
            <span>Kembali Ke Landing</span>
          </button>
        </div>
      </div>
    </header>
  );
}
