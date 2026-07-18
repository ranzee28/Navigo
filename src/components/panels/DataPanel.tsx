import React from 'react';
import { DijkstraStep, Building, Road } from '../../types';
import { 
  Activity, ListCollapse, Clock, Compass, HelpCircle, Download, FileJson, FileSpreadsheet,
  Route, Zap, Milestone
} from 'lucide-react';
import { getShortestPath } from '../../algorithms/dijkstra';

interface DataPanelProps {
  currentStep: DijkstraStep | null;
  buildings: Building[];
  roads: Road[];
  sourceId: string;
  targetId: string;
  executionTime: number; // dalam mikrodetik
  activeRoute: string[];
  routingMode: 'shortest' | 'fastest';
  setRoutingMode: (mode: 'shortest' | 'fastest') => void;
}

export default function DataPanel({
  currentStep,
  buildings,
  roads,
  sourceId,
  targetId,
  executionTime,
  activeRoute,
  routingMode,
  setRoutingMode
}: DataPanelProps) {
  
  // Pembantu untuk mendapatkan nama gedung (Helpers to get node names)
  const getNodeName = (id: string) => {
    return buildings.find(b => b.id === id)?.name || id;
  };

  const isSimulationActive = currentStep !== null;
  
  const currentNode = isSimulationActive ? currentStep.currentNodeId : null;
  const queue = isSimulationActive ? currentStep.queue : [];
  const distances = isSimulationActive ? currentStep.distances : {};
  const previous = isSimulationActive ? currentStep.previous : {};
  const visited = isSimulationActive ? currentStep.visited : [];
  const relaxedEdges = isSimulationActive ? currentStep.relaxedEdges : [];
  const stepDescription = isSimulationActive 
    ? currentStep.description 
    : "Simulasi tidak aktif. Tekan tombol \"Mulai Simulasi\" atau \"Rute Instan\" untuk melihat proses pencarian.";

  // Metrik yang dihitung untuk pengunduhan laporan (Calculated metrics for log download)
  const calculatedDistance = activeRoute.length > 0 
    ? activeRoute.slice(0, -1).reduce((acc, nodeId, idx) => {
        const nextId = activeRoute[idx + 1];
        const road = roads.find(r => 
          (r.fromId === nodeId && r.toId === nextId) || 
          (r.fromId === nextId && r.toId === nodeId)
        );
        return acc + (road ? road.weight : 0);
      }, 0)
    : 0;

  const calculatedTrafficMultiplier = activeRoute.length > 1
    ? activeRoute.slice(0, -1).reduce((acc, nodeId, idx) => {
        const nextId = activeRoute[idx + 1];
        const road = roads.find(r => 
          (r.fromId === nodeId && r.toId === nextId) || 
          (r.fromId === nextId && r.toId === nodeId)
        );
        return acc * (road ? road.trafficMultiplier : 1.0);
      }, 1.0)
    : 1.0;

  const calculatedTime = Math.round(calculatedDistance * 3.5 * calculatedTrafficMultiplier);
  const baseFee = 2000;
  const distanceFee = calculatedDistance * 1500;
  const calculatedFee = calculatedDistance > 0 ? (baseFee + distanceFee) * (1 + (calculatedTrafficMultiplier - 1) * 0.4) : 0;

  // Penangan Pengunduhan JSON (JSON Download Handler)
  const downloadJSON = () => {
    if (activeRoute.length === 0) return;
    
    const segments = [];
    let accumulatedDist = 0;
    
    for (let i = 0; i < activeRoute.length - 1; i++) {
      const currentId = activeRoute[i];
      const nextId = activeRoute[i + 1];
      const road = roads.find(r => 
        (r.fromId === currentId && r.toId === nextId) || 
        (r.fromId === nextId && r.toId === currentId)
      );
      const segmentDistance = road ? road.weight : 0;
      accumulatedDist += segmentDistance;
      
      let condition = "Normal";
      if (road?.isClosed) condition = "Tutup Jalan";
      else if ((road?.trafficMultiplier || 1) > 1.5) condition = "Sangat Macet";
      else if ((road?.trafficMultiplier || 1) > 1) condition = "Padat Merayap";

      segments.push({
        no: i + 1,
        dari: getNodeName(currentId),
        ke: getNodeName(nextId),
        jarak_ruas_km: segmentDistance,
        kondisi_lalu_lintas: condition,
        pengali_kemacetan: road ? road.trafficMultiplier : 1.0,
        akumulasi_jarak_km: Number(accumulatedDist.toFixed(2))
      });
    }

    const reportData = {
      informasi_umum: {
        waktu_unduh: new Date().toLocaleString('id-ID'),
        lokasi_awal: getNodeName(sourceId),
        lokasi_tujuan: getNodeName(targetId),
        total_jarak_km: Number(calculatedDistance.toFixed(2)),
        estimasi_waktu_menit: calculatedTime,
        biaya_antar_rp: Math.round(calculatedFee),
        kecepatan_algoritma_dijkstra_us: Number(executionTime.toFixed(1))
      },
      detail_rute_perjalanan: segments
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `laporan_rute_${sourceId}_ke_${targetId}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  // Penangan Pengunduhan CSV (CSV Download Handler)
  const downloadCSV = () => {
    if (activeRoute.length === 0) return;

    let csvContent = "=== LAPORAN EFISIENSI RUTE PENGIRIMAN KAMPUS ===\r\n";
    csvContent += `Waktu Unduh,${new Date().toLocaleString('id-ID')}\r\n`;
    csvContent += `Titik Awal,${getNodeName(sourceId)}\r\n`;
    csvContent += `Titik Tujuan,${getNodeName(targetId)}\r\n`;
    csvContent += `Total Jarak (km),${calculatedDistance.toFixed(2)}\r\n`;
    csvContent += `Estimasi Waktu (menit),${calculatedTime}\r\n`;
    csvContent += `Biaya Antar (Rp),${Math.round(calculatedFee)}\r\n`;
    csvContent += `Waktu Eksekusi Dijkstra (us),${executionTime.toFixed(1)}\r\n\r\n`;
    
    csvContent += "No,Dari,Ke,Jarak Ruas (km),Kondisi Lalu Lintas,Pengali Kemacetan,Akumulasi Jarak (km)\r\n";
    
    let accumulatedDist = 0;
    for (let i = 0; i < activeRoute.length - 1; i++) {
      const currentId = activeRoute[i];
      const nextId = activeRoute[i + 1];
      const road = roads.find(r => 
        (r.fromId === currentId && r.toId === nextId) || 
        (r.fromId === nextId && r.toId === currentId)
      );
      const segmentDistance = road ? road.weight : 0;
      accumulatedDist += segmentDistance;
      
      let condition = "Normal";
      if (road?.isClosed) condition = "Tutup Jalan";
      else if ((road?.trafficMultiplier || 1) > 1.5) condition = "Sangat Macet";
      else if ((road?.trafficMultiplier || 1) > 1) condition = "Padat Merayap";

      csvContent += `${i + 1},"${getNodeName(currentId)}","${getNodeName(nextId)}",${segmentDistance},"${condition}",${road ? road.trafficMultiplier : 1.0},${accumulatedDist.toFixed(2)}\r\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `laporan_rute_${sourceId}_ke_${targetId}_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  // Dapatkan kedua opsi rute untuk dibandingkan secara real-time
  const shortestOption = getShortestPath(buildings, roads, sourceId, targetId, 'shortest');
  const fastestOption = getShortestPath(buildings, roads, sourceId, targetId, 'fastest');

  // Hitung metrik masing-masing rute
  const calculateMetrics = (path: string[]) => {
    if (path.length === 0) return { distance: 0, time: 0, fee: 0, trafficMultiplier: 1.0 };
    
    const distance = path.slice(0, -1).reduce((acc, nodeId, idx) => {
      const nextId = path[idx + 1];
      const road = roads.find(r => 
        (r.fromId === nodeId && r.toId === nextId) || 
        (r.fromId === nextId && r.toId === nodeId)
      );
      return acc + (road ? road.weight : 0);
    }, 0);

    const trafficMultiplier = path.length > 1
      ? path.slice(0, -1).reduce((acc, nodeId, idx) => {
          const nextId = path[idx + 1];
          const road = roads.find(r => 
            (r.fromId === nodeId && r.toId === nextId) || 
            (r.fromId === nextId && r.toId === nodeId)
          );
          return acc * (road ? road.trafficMultiplier : 1.0);
        }, 1.0)
      : 1.0;

    const time = Math.round(distance * 3.5 * trafficMultiplier);
    const baseFee = 2000;
    const distanceFee = distance * 1500;
    const fee = distance > 0 ? (baseFee + distanceFee) * (1 + (trafficMultiplier - 1) * 0.4) : 0;

    return { distance, time, fee, trafficMultiplier };
  };

  const shortestMetrics = calculateMetrics(shortestOption.path);
  const fastestMetrics = calculateMetrics(fastestOption.path);

  return (
    <div className="flex flex-col gap-5 h-full text-slate-800">

      {/* Opsi Perbandingan Rute */}
      <div className="bg-white border border-slate-200/95 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Route className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
            Perbandingan Rute Pengiriman
          </h3>
        </div>
        
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          Sistem menganalisis kondisi lalu lintas real-time di kampus untuk menyajikan dua opsi perutean utama:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Opsi Jalur Paling Cepat */}
          <button
            onClick={() => setRoutingMode('fastest')}
            disabled={fastestOption.path.length === 0}
            className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group select-none ${
              routingMode === 'fastest'
                ? 'bg-indigo-50/50 border-indigo-500 shadow-xs'
                : 'bg-slate-50/30 hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            {routingMode === 'fastest' && (
              <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Aktif
              </span>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${routingMode === 'fastest' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                <span className="text-xs font-bold text-slate-800">Jalur Paling Cepat</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Menghindari jalan macet atau padat merayap.
              </p>
            </div>

            {fastestOption.path.length > 0 ? (
              <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-slate-100/80 pt-2.5 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-medium">Waktu</span>
                  <span className="text-xs font-black text-indigo-700 font-mono">{fastestMetrics.time} m</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-medium">Jarak</span>
                  <span className="text-xs font-black text-slate-700 font-mono">{fastestMetrics.distance.toFixed(1)} km</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-medium">Biaya</span>
                  <span className="text-[10px] font-black text-slate-700 font-mono">Rp{Math.round(fastestMetrics.fee).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3.5 pt-2.5 text-slate-400 italic text-[10px]">Rute tidak tersedia</div>
            )}
          </button>

          {/* Opsi Jarak Terpendek */}
          <button
            onClick={() => setRoutingMode('shortest')}
            disabled={shortestOption.path.length === 0}
            className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group select-none ${
              routingMode === 'shortest'
                ? 'bg-indigo-50/50 border-indigo-500 shadow-xs'
                : 'bg-slate-50/30 hover:bg-slate-50/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            {routingMode === 'shortest' && (
              <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Aktif
              </span>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Milestone className={`w-4 h-4 ${routingMode === 'shortest' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                <span className="text-xs font-bold text-slate-800">Jarak Terpendek</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Mengabaikan rintangan lalu lintas & hambatan waktu.
              </p>
            </div>

            {shortestOption.path.length > 0 ? (
              <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-slate-100/80 pt-2.5 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-medium">Waktu</span>
                  <span className={`text-xs font-black font-mono ${shortestMetrics.time > fastestMetrics.time ? 'text-amber-600' : 'text-indigo-700'}`}>
                    {shortestMetrics.time} m
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-medium">Jarak</span>
                  <span className="text-xs font-black text-slate-700 font-mono">{shortestMetrics.distance.toFixed(1)} km</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-medium">Biaya</span>
                  <span className="text-[10px] font-black text-slate-700 font-mono">Rp{Math.round(shortestMetrics.fee).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : (
              <div className="mt-3.5 pt-2.5 text-slate-400 italic text-[10px]">Rute tidak tersedia</div>
            )}
          </button>
        </div>

        {/* Dynamic Highlight Badge */}
        {shortestOption.path.length > 0 && fastestOption.path.length > 0 && shortestMetrics.time !== fastestMetrics.time && (
          <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-[10px] text-slate-600 leading-relaxed flex items-start gap-2">
            <span className="text-base leading-none">💡</span>
            <span>
              {shortestMetrics.time > fastestMetrics.time ? (
                <>
                  Rute <strong>Jalur Paling Cepat</strong> menghemat waktu hingga <strong>{shortestMetrics.time - fastestMetrics.time} menit</strong> dengan menghindari kepadatan lalu lintas, meskipun jarak fisiknya sedikit berbeda.
                </>
              ) : (
                <>
                  Kedua opsi memiliki estimasi waktu tempuh yang serupa, namun opsi <strong>Jarak Terpendek</strong> meminimalkan konsumsi energi kendaraan pengiriman.
                </>
              )}
            </span>
          </div>
        )}
      </div>
      
      {/* 1. Metrik Header / Status Simulasi (1. Header Metrics / Current Node) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 flex flex-col gap-0.5">
          <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Status Simulasi</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSimulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-slate-700 font-semibold text-xs">
              {isSimulationActive ? 'Sedang Berjalan' : 'Siap Diuji'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-3 flex flex-col gap-0.5">
          <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Waktu Eksekusi</span>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{executionTime > 0 ? `${executionTime.toFixed(1)} µs` : '0.0 µs'}</span>
          </div>
        </div>
      </div>

      {/* 2. Fokus Gedung Aktif Saat Ini (2. Current Node Focus) */}
      <div className="bg-slate-50/60 border border-slate-200 p-4 rounded-xl">
        <div className="text-slate-400 text-[10px] font-medium tracking-wider mb-1.5 flex justify-between items-center">
          <span>Gedung Kampus Aktif (u)</span>
          <span className="text-rose-600 font-semibold">{currentNode ? 'Variabel u' : '-'}</span>
        </div>
        {currentNode ? (
          <div className="flex items-center justify-between">
            <span className="text-rose-600 font-bold text-xs tracking-wide">
              {getNodeName(currentNode)}
            </span>
            <span className="bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-[9px] text-rose-700 font-medium">
              Memindai Tetangga
            </span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">Tidak ada gedung aktif yang dipindai.</span>
        )}
        <p className="text-[11px] text-slate-600 leading-relaxed mt-3 bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
          {stepDescription}
        </p>
      </div>

      {/* Kartu Unduh Laporan Rute (Download Route Report Card) */}
      {activeRoute.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/40 to-slate-50/40 border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              Unduh Laporan Perjalanan
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
              Ekspor hasil rute optimal dan efisiensi simulasi ke format JSON atau CSV.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={downloadJSON}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-500" />
              <span>Format JSON</span>
            </button>
            <button
              onClick={downloadCSV}
              className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Format CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Antrean Prioritas (Q) - (3. Priority Queue (Q)) */}
      <div className="flex flex-col flex-1 min-h-[140px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <span className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            Antrean Prioritas (Q)
          </span>
          <span className="text-slate-400 text-[10px] font-medium">Min-Heap</span>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[130px] space-y-1.5 pr-1">
          {queue.length > 0 ? (
            queue.map((item, idx) => {
              const isMin = idx === 0;
              const isTarget = item.nodeId === targetId;
              return (
                <div
                  key={item.nodeId}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-xs ${
                    isMin 
                      ? 'bg-rose-50 border-rose-200 text-rose-950 font-semibold shadow-xs' 
                      : isTarget
                        ? 'bg-indigo-50/60 border-indigo-150 text-indigo-950'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      isMin ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium truncate max-w-[155px]">
                      {getNodeName(item.nodeId)}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-right">
                    {item.priority === Infinity ? '∞' : `${item.priority.toFixed(1)} km`}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl py-6 text-slate-400 italic text-[11px] gap-1">
              <span>{isSimulationActive ? 'Antrean Prioritas Q Kosong (Q = Ø).' : 'Mulai simulasi untuk melihat perubahan Antrean Prioritas.'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Tabel Jarak & Predecessor (4. Distance Table) */}
      <div className="flex flex-col flex-1 min-h-[150px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <span className="text-slate-700 font-semibold text-xs flex items-center gap-1.5">
            <ListCollapse className="w-4 h-4 text-indigo-500" />
            Tabel Jarak & Predecessor
          </span>
          <span className="text-slate-400 text-[10px] font-medium">Nilai jarak[v] & predecessor</span>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[160px] space-y-1 pr-1">
          {buildings.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-[9px] uppercase font-bold">
                  <th className="py-1">Gedung Kampus (v)</th>
                  <th className="py-1 text-right">jarak[v] (Terpendek)</th>
                  <th className="py-1 text-right">sebelumnya[v] (Predecessor)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {buildings.map(b => {
                  const distValue = distances[b.id];
                  const prevId = previous[b.id];
                  const isS = b.id === sourceId;
                  const isT = b.id === targetId;
                  
                  const isCurrentlyEvaluated = isSimulationActive && currentStep.activeNeighborId === b.id;

                  return (
                    <tr 
                      key={b.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isCurrentlyEvaluated 
                          ? 'bg-amber-50 text-amber-950 font-semibold' 
                          : isS 
                            ? 'text-amber-700 font-semibold' 
                            : isT 
                              ? 'text-indigo-700 font-semibold' 
                              : 'text-slate-600'
                      }`}
                    >
                      <td className="py-2 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          visited.includes(b.id) ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                        <span className="truncate max-w-[130px]">{b.name}</span>
                      </td>
                      <td className="py-2 text-right font-mono font-semibold">
                        {distValue === undefined 
                          ? '-' 
                          : distValue === Infinity 
                            ? 'Tak Hingga (∞)' 
                            : `${distValue.toFixed(1)} km`}
                      </td>
                      <td className="py-2 text-right text-slate-400 font-mono truncate max-w-[100px]">
                        {prevId ? getNodeName(prevId) : 'Belum Ada'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-slate-400 italic">Tidak ada gedung.</div>
          )}
        </div>
      </div>

      {/* 5. Ringkasan Kunjungan & Relaksasi Sisi di Bagian Bawah (5. Bottom Visited & Relaxed summary) */}
      <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-slate-100 text-[11px]">
        <div>
          <span className="text-slate-400 block mb-1 font-semibold text-[10px] uppercase">Selesai Dikunjungi (S)</span>
          <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto">
            {visited.length > 0 ? (
              visited.map(vId => (
                <span key={vId} className="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium text-[10px]">
                  {buildings.find(b => b.id === vId)?.name.split(' ')[0] || vId}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic text-[10px]">Kosong (Ø)</span>
            )}
          </div>
        </div>

        <div>
          <span className="text-slate-400 block mb-1 font-semibold text-[10px] uppercase">Jalan Direlaksasi</span>
          <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto">
            {relaxedEdges.length > 0 ? (
              relaxedEdges.map(rId => (
                <span key={rId} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium text-[10px]">
                  Jalan {rId.replace('road_', '')}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic text-[10px]">0 jalan</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
