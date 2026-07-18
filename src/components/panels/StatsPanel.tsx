import React from 'react';
import { Building, Road } from '../../types';
import { 
  Bike, CheckCircle2, Clock, AlertTriangle, Landmark, Compass, Terminal 
} from 'lucide-react';

interface StatsPanelProps {
  buildings: Building[];
  roads: Road[];
  activeRoute: string[];
  totalDistance: number;
  selectedStartId: string;
  selectedEndId: string;
  isDispatching: boolean;
  isDelivered: boolean;
  incidentLogs: string[];
}

export default function StatsPanel({
  buildings,
  roads,
  activeRoute,
  totalDistance,
  selectedStartId,
  selectedEndId,
  isDispatching,
  isDelivered,
  incidentLogs
}: StatsPanelProps) {

  const getBuildingName = (id: string) => {
    return buildings.find(b => b.id === id)?.name || id;
  };

  // Lencana Status (Status Badge)
  let statusColor = 'bg-slate-50 border-slate-200 text-slate-500';
  let statusLabel = 'MENUNGGU PENGIRIMAN';
  let statusIcon = <Clock className="w-5 h-5 text-slate-400" />;

  if (isDelivered) {
    statusColor = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold';
    statusLabel = 'MAKANAN SAMPAI DI TUJUAN!';
    statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse" />;
  } else if (isDispatching) {
    statusColor = 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold';
    statusLabel = 'KURIR SEDANG DI JALAN (LIVE)';
    statusIcon = <Bike className="w-5 h-5 text-indigo-600 animate-bounce" />;
  } else if (activeRoute.length > 0) {
    statusColor = 'bg-amber-50 border-amber-200 text-amber-700 font-bold';
    statusLabel = 'RUTE DIKETAHUI - SIAP DIKIRIM';
    statusIcon = <Compass className="w-5 h-5 text-amber-600" />;
  }

  // Perhitungan Biaya (Cost calculation)
  const baseFee = 2000; // Rp 2.000,-
  const distanceFee = totalDistance * 1500; // Rp 1.500,- per km
  const activeRoadsCount = activeRoute.length - 1;
  const trafficMultiplier = activeRoadsCount > 0 
    ? activeRoute.slice(0, -1).reduce((acc, nodeId, idx) => {
        const nextId = activeRoute[idx + 1];
        const road = roads.find(r => (r.fromId === nodeId && r.toId === nextId) || (r.fromId === nextId && r.toId === nodeId));
        return acc * (road ? road.trafficMultiplier : 1.0);
      }, 1.0)
    : 1.0;

  const totalFee = totalDistance > 0 ? (baseFee + distanceFee) * (1 + (trafficMultiplier - 1) * 0.4) : 0;
  const activeIncidentsCount = roads.filter(r => r.isClosed || r.trafficMultiplier > 1.0).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5 h-full text-slate-800">
      
      {/* 1. STATUS PENGIRIMAN */}
      <div className={`border p-4 rounded-xl flex items-center justify-between gap-4 transition-all duration-300 ${statusColor}`}>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Status Pengiriman</span>
          <span className="text-xs font-bold tracking-wide">{statusLabel}</span>
        </div>
        <div className="p-1.5 bg-white rounded-lg border border-slate-200/50 shadow-inner">
          {statusIcon}
        </div>
      </div>

      {/* 2. METRIKS UTAMA */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 flex flex-col gap-0.5 shadow-xs">
          <span className="text-slate-500 text-[10px] font-medium">Jarak Tempuh</span>
          <span className="text-slate-800 text-sm font-bold font-mono tracking-tight">
            {totalDistance > 0 ? `${totalDistance.toFixed(1)} km` : '0.0 km'}
          </span>
        </div>

        <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 flex flex-col gap-0.5 shadow-xs">
          <span className="text-slate-500 text-[10px] font-medium">Estimasi Waktu</span>
          <span className="text-indigo-600 text-sm font-bold font-mono tracking-tight">
            {totalDistance > 0 ? `${Math.round(totalDistance * 3.5 * trafficMultiplier)} mnt` : '0 mnt'}
          </span>
        </div>

        <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 flex flex-col gap-0.5 shadow-xs">
          <span className="text-slate-500 text-[10px] font-medium">Biaya Antar</span>
          <span className="text-emerald-600 text-sm font-bold font-mono tracking-tight">
            {totalFee > 0 ? `Rp ${Math.round(totalFee).toLocaleString('id-ID')}` : 'Rp 0'}
          </span>
        </div>
      </div>

      {/* 3. DAFTAR RUTE AKTIF */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-0.5">
          <span className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
            Urutan Jalur Pengantaran
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {activeRoute.length > 0 ? `${activeRoute.length} lokasi` : 'Belum ditentukan'}
          </span>
        </div>

        <div className="bg-slate-50/40 border border-slate-200 rounded-xl p-4 max-h-[160px] overflow-y-auto space-y-2">
          {activeRoute.length > 0 ? (
            <div className="relative pl-4 space-y-3 py-1 text-xs">
              {/* Indikator garis vertikal (Vertical line indicator) */}
              <div className="absolute left-[5px] top-2.5 bottom-2.5 w-0.5 bg-slate-200" />
              
              {activeRoute.map((nodeId, idx) => {
                const isStart = idx === 0;
                const isEnd = idx === activeRoute.length - 1;
                return (
                  <div key={`${nodeId}-${idx}`} className="flex items-center gap-2.5 relative">
                    <span className={`absolute -left-[14px] w-2 h-2 rounded-full border border-white ${
                      isStart ? 'bg-amber-500 ring-2 ring-amber-500/20' : isEnd ? 'bg-indigo-600 ring-2 ring-indigo-600/20' : 'bg-slate-400'
                    }`} />
                    <span className={`font-medium truncate max-w-[170px] ${
                      isStart ? 'text-amber-700 font-semibold' : isEnd ? 'text-indigo-700 font-semibold' : 'text-slate-600'
                    }`}>
                      {getBuildingName(nodeId)}
                    </span>
                    {isStart && <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-medium uppercase">Asal</span>}
                    {isEnd && <span className="text-[8px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium uppercase">Tujuan</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-400 italic py-4 text-center text-xs">
              Silakan pilih gedung tujuan Anda pada peta.
            </div>
          )}
        </div>
      </div>

      {/* 4. LOG TELEMETRI & AKTIVITAS SISTEM */}
      <div className="flex-1 flex flex-col min-h-[140px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
          <span className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
            Aktivitas Pengiriman
          </span>
          {activeIncidentsCount > 0 && (
            <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium animate-pulse">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{activeIncidentsCount} Gangguan</span>
            </span>
          )}
        </div>

        <div className="flex-1 bg-slate-50/50 border border-slate-200 p-3 rounded-xl overflow-y-auto font-mono text-[10.5px] space-y-1.5 text-slate-500 max-h-[150px] select-none shadow-inner">
          {incidentLogs.length > 0 ? (
            incidentLogs.map((log, idx) => {
              const isTraffic = log.includes('TRAFFIC') || log.includes('SLOWDOWN') || log.includes('LALU LINTAS');
              const isClosure = log.includes('CLOSED') || log.includes('HAZARD') || log.includes('PENUTUPAN') || log.includes('TUTUP');
              const isComplete = log.includes('DELIVERED') || log.includes('ARRIVED') || log.includes('COMPLETE') || log.includes('TIBA') || log.includes('SELESAI') || log.includes('SUKSES');
              const isDispatch = log.includes('LAUNCHED') || log.includes('DISPATCH') || log.includes('KURIR') || log.includes('KIRIM');

              let logColor = 'text-slate-500';
              if (isTraffic) logColor = 'text-amber-600 font-medium';
              if (isClosure) logColor = 'text-rose-600 font-semibold';
              if (isComplete) logColor = 'text-emerald-600 font-semibold';
              if (isDispatch) logColor = 'text-indigo-600 font-medium';

              return (
                <div key={idx} className={`leading-relaxed border-b border-slate-100 pb-1 last:border-0 ${logColor}`}>
                  <span className="text-slate-400 mr-1.5">{`>`}</span>
                  {log}
                </div>
              );
            })
          ) : (
            <div className="text-slate-400 italic py-6 text-center">
              Menunggu aktivitas pengiriman kurir...
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
