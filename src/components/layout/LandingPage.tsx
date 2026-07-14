import React, { useState } from 'react';
import { Route, Zap, Sliders, Play } from 'lucide-react';
import { motion } from 'motion/react';
import ShapeGrid from './ShapeGrid';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(onStart, 600);
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="h-screen w-screen bg-slate-950 flex flex-col justify-between items-center text-white relative overflow-hidden select-none"
    >
      
      {/* Interactive Shape Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-90">
        <ShapeGrid 
          speed={0.25} 
          squareSize={45}
          direction="diagonal"
          borderColor="rgba(99, 102, 241, 0.2)"
          hoverFillColor="rgba(99, 102, 241, 0.6)"
          shape="square"
          hoverTrailAmount={6}
        />
      </div>

      {/* Dynamic Background Tech Grids & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.3)_0%,rgba(2,6,23,0.95)_100%)] pointer-events-none z-0" />
      
      {/* Ambient Radial Glow centered behind the title */}
      <div className="absolute w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="absolute w-[200px] sm:w-[350px] h-[200px] sm:h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 z-0" />

      {/* Grid Scanner Effect Line */}
      <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent top-0 animate-bounce-slow pointer-events-none z-0" style={{ animationDuration: '8s' }} />

      {/* TOP DECORATION */}
      <div className="pt-8 px-6 flex items-center gap-1.5 z-10 text-[9px] sm:text-[10px] tracking-widest text-indigo-400 font-mono font-bold uppercase">
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
        Sistem Pemetaan Logistik Terdistribusi // v1.0.0
      </div>


      {/* MAIN CENTER CONTENT */}
      <div className="flex flex-col items-center text-center max-w-4xl px-6 z-10 my-auto py-8">
        
        {/* Retro Subtitle Badge */}
        <div className="mb-6 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest shadow-lg">
          Interactive Dijkstra Route Simulator
        </div>

        {/* Massive 3D Retro Title */}
        <h1 
          className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-widest font-pixel select-none mb-6 animate-fade-in" 
          style={{ fontFamily: '"Silkscreen", "Press Start 2P", monospace' }}
        >
          <span className="text-white" style={{ textShadow: '-3px 0 #ff0055, 3px 0 #00ffcc' }}>NAVI</span>
          <span className="text-[#99ff00]" style={{ textShadow: '-3px 0 #ff0055, 3px 0 #00ffcc' }}>GO</span>
        </h1>

        {/* Deskripsi */}
        <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed mb-10 font-medium">
          Visualisasi bagaimana{" "}
          <span className="relative inline-block group cursor-help z-30">
            <strong className="text-white border-b border-dashed border-white/40 pb-0.5 hover:text-indigo-400 hover:border-indigo-400 transition-colors">
              Algoritma Dijkstra
            </strong>
            {/* Popover Card */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-56 sm:w-64 rounded-2xl shadow-2xl border border-slate-800 bg-slate-950 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none scale-95 group-hover:scale-100 origin-bottom z-50">
              <img 
                src="Images/algoritma.png" 
                alt="Edsger W. Dijkstra" 
                className="w-full h-auto object-contain bg-slate-900 contrast-110 saturate-75 brightness-95 group-hover:saturate-100 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="bg-slate-900 text-slate-300 text-[10px] p-2.5 text-center font-semibold tracking-wider font-mono uppercase shadow-inner border-t border-slate-800">
                Edsger W. Dijkstra (1930 - 2002)
              </div>
            </span>
          </span>{" "}
          menemukan rute <strong className="text-indigo-400">Jalur Tercepat</strong> (Lalu Lintas Real-Time) dengan <strong className="text-[#99ff00]">Jarak Terpendek</strong> secara interaktif.
        </p>

        {/* Start CTA Button */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <button 
            onClick={handleStart}
            disabled={isExiting}
            className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold tracking-widest font-pixel border-2 border-indigo-400 rounded-2xl shadow-[4px_4px_0px_#99ff00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 uppercase text-xs sm:text-sm cursor-pointer flex items-center gap-3.5 select-none"
            style={{ fontFamily: '"Silkscreen", "Press Start 2P", monospace' }}
          >
            <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
            Mulai Simulasi
          </button>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            klik tombol untuk masuk ke dashboard peta
          </span>
        </div>

        {/* Key Features Bento Grid / Column highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left max-w-3xl">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="relative bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-300 group overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] hover:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.15)]"
          >
            {/* Top right micro-badge */}
            <span className="absolute top-4 right-4 text-[10px] font-mono text-indigo-500/70 group-hover:text-indigo-400 tracking-widest">
              [01]
            </span>
            
            <div>
              {/* Icon Container with glowing background */}
              <div className="relative w-11 h-11 bg-indigo-950/50 border border-indigo-800/40 text-indigo-400 rounded-xl flex items-center justify-center mb-4.5 group-hover:bg-indigo-900/60 group-hover:text-indigo-300 group-hover:border-indigo-500/60 transition-all duration-300">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-xl blur-xs group-hover:opacity-100 transition-opacity" />
                <Zap className="w-5 h-5 relative z-10 animate-pulse" />
              </div>
              
              <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-100 tracking-wider mb-2 font-mono flex items-center gap-2">
                Lalu Lintas Real-Time
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Navigasi cerdas yang mendeteksi kepadatan jalan dan kemacetan untuk menghitung rute tercepat secara dinamis.
              </p>
            </div>

            {/* Glowing bottom line accent */}
            <div className="w-full h-[1.5px] bg-indigo-950/80 mt-5 group-hover:bg-indigo-500/50 transition-all duration-300 relative">
              <div className="absolute left-0 top-0 h-full w-0 bg-indigo-400 group-hover:w-full transition-all duration-500" />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="relative bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300 group overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.15)]"
          >
            {/* Top right micro-badge */}
            <span className="absolute top-4 right-4 text-[10px] font-mono text-emerald-500/70 group-hover:text-emerald-400 tracking-widest">
              [02]
            </span>

            <div>
              {/* Icon Container with glowing background */}
              <div className="relative w-11 h-11 bg-emerald-950/50 border border-emerald-900/40 text-emerald-400 rounded-xl flex items-center justify-center mb-4.5 group-hover:bg-emerald-900/60 group-hover:text-emerald-300 group-hover:border-emerald-500/60 transition-all duration-300">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-xl blur-xs group-hover:opacity-100 transition-opacity" />
                <Route className="w-5 h-5 relative z-10" />
              </div>
              
              <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-100 tracking-wider mb-2 font-mono flex items-center gap-2">
                Visualisasi Langkah
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Tonton algoritma bekerja selangkah demi selangkah lengkap dengan visualisasi proses pencarian simpul.
              </p>
            </div>

            {/* Glowing bottom line accent */}
            <div className="w-full h-[1.5px] bg-emerald-950/80 mt-5 group-hover:bg-emerald-500/50 transition-all duration-300 relative">
              <div className="absolute left-0 top-0 h-full w-0 bg-emerald-400 group-hover:w-full transition-all duration-500" />
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="relative bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 hover:bg-slate-900/80 transition-all duration-300 group overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] hover:shadow-[0_15px_30px_-10px_rgba(245,158,11,0.15)]"
          >
            {/* Top right micro-badge */}
            <span className="absolute top-4 right-4 text-[10px] font-mono text-amber-500/70 group-hover:text-amber-400 tracking-widest">
              [03]
            </span>

            <div>
              {/* Icon Container with glowing background */}
              <div className="relative w-11 h-11 bg-amber-950/50 border border-amber-900/40 text-amber-400 rounded-xl flex items-center justify-center mb-4.5 group-hover:bg-amber-900/60 group-hover:text-amber-300 group-hover:border-amber-500/60 transition-all duration-300">
                <div className="absolute inset-0 bg-amber-500/10 rounded-xl blur-xs group-hover:opacity-100 transition-opacity" />
                <Sliders className="w-5 h-5 relative z-10" />
              </div>
              
              <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-100 tracking-wider mb-2 font-mono flex items-center gap-2">
                Editor Peta Fleksibel
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Ubah tata letak sesuka hati: tambah gedung baru, bangun koneksi jalan, atau matikan jalur pengiriman.
              </p>
            </div>

            {/* Glowing bottom line accent */}
            <div className="w-full h-[1.5px] bg-amber-950/80 mt-5 group-hover:bg-amber-500/50 transition-all duration-300 relative">
              <div className="absolute left-0 top-0 h-full w-0 bg-amber-400 group-hover:w-full transition-all duration-500" />
            </div>
          </motion.div>
        </div>

      </div>

      {/* BOTTOM FOOTER */}
      <div className="pb-8 text-center text-[10px] text-slate-500 font-mono tracking-widest uppercase z-10 px-6">
        Sistem Graph Dijkstra Navigo &copy; {new Date().getFullYear()} // Dikembangkan oleh Ahmad Rozin Romdhoni untuk Simulasi Pembelajaran Efektif
      </div>

    </motion.div>
  );
}
