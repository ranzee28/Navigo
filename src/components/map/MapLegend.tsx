import React from 'react';
import { Info, X } from 'lucide-react';

interface MapLegendProps {
  isLegendOpen: boolean;
  setIsLegendOpen: (open: boolean) => void;
}

// Mengambil alih bagian render legenda peta yang interaktif dan detail kondisi warna/jalan.

export default function MapLegend({ isLegendOpen, setIsLegendOpen }: MapLegendProps) {
  if (!isLegendOpen) {
    return (
      <div 
        className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm no-pan pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsLegendOpen(true)}
          title="Tampilkan Legenda Peta"
          className="p-1.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:text-indigo-600 transition shadow-xs flex items-center justify-center cursor-pointer font-sans"
        >
          <Info className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-sm w-72 text-slate-700 font-sans select-none no-pan pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800">Legenda Peta & Status</span>
        </div>
        <button 
          onClick={() => setIsLegendOpen(false)}
          title="Sembunyikan Legenda"
          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-medium">
        {/* Kolom Gedung (Node Column) */}
        <div className="space-y-1.5 border-r border-slate-100 pr-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Gedung</div>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 block shrink-0" />
            <span className="text-slate-600">Belum Dikunjungi</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eff6ff] border border-[#2563eb] block shrink-0" />
            <span className="text-slate-600">Sudah Dikunjungi</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e11d48]"></span>
            </span>
            <span className="text-slate-600 font-semibold text-rose-600">Sedang Diperiksa</span>
          </div>
        </div>

        {/* Kolom Jalan (Road Column) */}
        <div className="space-y-1.5 pl-1">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kondisi Jalan</div>
          
          <div className="flex items-center gap-2">
            <span className="w-5 h-1 bg-[#cbd5e1] rounded-full block shrink-0" />
            <span className="text-slate-600">Jalan Normal</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-5 h-1 bg-[#cbd5e1] rounded-full block" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping block -ml-2" />
            </div>
            <span className="text-slate-600">Padat / Macet</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-5 h-1 border-t-2 border-dashed border-[#f43f5e] block shrink-0" />
            <span className="text-slate-600 text-rose-600 font-semibold">Jalan Ditutup</span>
          </div>
        </div>
      </div>

      {/* Indikator Rute Terpendek di bagian bawah (Shortest Route Indicator at bottom) */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-5 h-1 bg-emerald-500 rounded-full block shrink-0 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
          <span className="text-slate-600 font-bold text-emerald-600 font-sans">Rute Optimal Tercepat</span>
        </div>
      </div>
    </div>
  );
}
