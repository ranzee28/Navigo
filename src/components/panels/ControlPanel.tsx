import React from 'react';
import { Building, Road } from '../../types';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, 
  TrafficCone, Trash2, Link2, Plus, MousePointer,
  Sparkles, Zap, ShieldAlert, Bike, RefreshCw, XCircle
} from 'lucide-react';

interface ControlPanelProps {
  buildings: Building[];
  roads: Road[];
  selectedStartId: string;
  selectedEndId: string;
  onSelectStart: (id: string) => void;
  onSelectEnd: (id: string) => void;
  
  // Alat Peta (Tools)
  activeTool: 'select' | 'add_node' | 'connect_road' | 'delete' | 'toggle_traffic' | 'toggle_closure';
  setActiveTool: (tool: any) => void;

  // Kontrol Algoritma (Algorithm Control)
  isSimulationPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onResetSimulation: () => void;
  playbackSpeed: number; // dalam ms
  onChangePlaybackSpeed: (speed: number) => void;

  // Tindakan (Actions)
  onGenerateRandomMap: () => void;
  onInjectTraffic: () => void;
  onInjectClosure: () => void;
  onClearIncidents: () => void;
  onTriggerInstantSolve: () => void;
  onTriggerDispatch: () => void;
  isDispatching: boolean;
  hasValidPath: boolean;
}

export default function ControlPanel({
  buildings,
  roads,
  selectedStartId,
  selectedEndId,
  onSelectStart,
  onSelectEnd,
  activeTool,
  setActiveTool,
  isSimulationPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onResetSimulation,
  playbackSpeed,
  onChangePlaybackSpeed,
  onGenerateRandomMap,
  onInjectTraffic,
  onInjectClosure,
  onClearIncidents,
  onTriggerInstantSolve,
  onTriggerDispatch,
  isDispatching,
  hasValidPath
}: ControlPanelProps) {

  // Mengelompokkan alat-alat peta dalam bahasa Indonesia dengan warna yang rapi
  const tools = [
    { id: 'select', label: 'Pilih / Geser', icon: <MousePointer className="w-4 h-4" />, desc: 'Geser lokasi di peta' },
    { id: 'add_node', label: 'Tambah Gedung', icon: <Plus className="w-4 h-4 text-emerald-600" />, desc: 'Klik peta untuk menaruh gedung' },
    { id: 'connect_road', label: 'Hubungkan Jalan', icon: <Link2 className="w-4 h-4 text-sky-600" />, desc: 'Klik 2 gedung berurutan' },
    { id: 'toggle_traffic', label: 'Atur Kemacetan', icon: <TrafficCone className="w-4 h-4 text-amber-500" />, desc: 'Klik jalan untuk buat macet' },
    { id: 'toggle_closure', label: 'Tutup Jalan', icon: <XCircle className="w-4 h-4 text-rose-500" />, desc: 'Klik jalan untuk memblokir' },
    { id: 'delete', label: 'Hapus Elemen', icon: <Trash2 className="w-4 h-4 text-red-500" />, desc: 'Klik gedung atau jalan' },
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-800">
      
      {/* 1. ATUR RUTE */}
      <div className="flex flex-col gap-3">
        <h3 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1.5">
          Atur Pengiriman
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[11px] font-medium">Titik Awal (Kantin / Hub):</span>
            <select
              value={selectedStartId}
              onChange={(e) => onSelectStart(e.target.value)}
              className="bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full transition-all cursor-pointer"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-slate-500 text-[11px] font-medium">Titik Tujuan (Asrama / Gedung):</span>
            <select
              value={selectedEndId}
              onChange={(e) => onSelectEnd(e.target.value)}
              className="bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full transition-all cursor-pointer"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. TOMBOL PENGIRIMAN (DISPATCH BUTTONS) */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onTriggerDispatch}
          disabled={!hasValidPath || isDispatching}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs transition-all ${
            hasValidPath && !isDispatching
              ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Kirim Kurir</span>
        </button>
      </div>

      {/* 3. KONTROL SIMULASI (SIMULATION CONTROLS) */}
      <div className="flex flex-col gap-3 bg-slate-50/40 border border-slate-200 p-3.5 rounded-xl">
        <h3 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
          Simulasi Dijkstra
        </h3>

        {/* Tombol Putar Ulang (Playback Buttons) */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            onClick={onStepBackward}
            title="Langkah Mundur"
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-xs border transition cursor-pointer ${
              isSimulationPlaying 
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 shadow-xs'
            }`}
          >
            {isSimulationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulationPlaying ? 'Jeda' : 'Jalankan'}</span>
          </button>

          <button
            onClick={onStepForward}
            title="Langkah Maju"
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onResetSimulation}
            title="Reset Langkah"
            className="bg-white border border-slate-200 hover:border-slate-300 text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Penggeser Kecepatan Putar Ulang (Playback Speed Slider) */}
        <div className="flex flex-col gap-1 mt-0.5">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>Interval Animasi</span>
            <span className="text-indigo-600 font-semibold">{playbackSpeed} ms</span>
          </div>
          <input
            type="range"
            min={100}
            max={1500}
            step={100}
            value={playbackSpeed}
            onChange={(e) => onChangePlaybackSpeed(parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
          />
        </div>

        <button
          onClick={onTriggerInstantSolve}
          className="w-full flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-lg transition-all text-xs font-medium cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Rute Instan (Tanpa Animasi)</span>
        </button>
      </div>

      {/* 4. PALET PENYUNTING PETA (MAP CONSTRUCTOR PALETTE) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1.5">
          Penyunting Peta
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {tools.map(tool => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                title={tool.desc}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-50/60 border-indigo-500 text-indigo-700 font-semibold shadow-xs' 
                    : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tool.icon}
                <span className="font-medium text-[11px] truncate">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. MANAJEMEN KENDALA LALU LINTAS (INCIDENT MANAGEMENT) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1.5">
          Simulasi Kendala
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onInjectTraffic}
            className="bg-slate-50/50 border border-slate-200 hover:bg-slate-100 text-slate-600 py-2 px-1 rounded-lg text-[10px] text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer"
          >
            <TrafficCone className="w-4 h-4 text-amber-500" />
            <span className="font-medium">Macet</span>
          </button>

          <button
            onClick={onInjectClosure}
            className="bg-slate-50/50 border border-slate-200 hover:bg-slate-100 text-slate-600 py-2 px-1 rounded-lg text-[10px] text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="font-medium">Tutup Jalan</span>
          </button>

          <button
            onClick={onClearIncidents}
            className="bg-slate-50/50 border border-slate-200 hover:bg-slate-100 text-slate-600 py-2 px-1 rounded-lg text-[10px] text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">Normal</span>
          </button>
        </div>

        <button
          onClick={onGenerateRandomMap}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-semibold mt-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Acak Ulang Peta</span>
        </button>
      </div>

    </div>
  );
}
