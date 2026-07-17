import React, { useState, useRef, useEffect } from 'react';
import { Building, Road, DijkstraStep } from '../../types';
import { getEffectiveWeight } from '../../algorithms/dijkstra';
import { 
  Compass, Link2, ZoomIn, ZoomOut, Maximize, Maximize2, Minimize2
} from 'lucide-react';

import MapLegend from './MapLegend';
import AddNodeModal from './AddNodeModal';
import MapRoad from './MapRoad';
import MapNode from './MapNode';

// Berfungsi sebagai pengatur state utama (panning, zoom, drag, tool aktif) dan wadah SVG utama.

interface MapCanvasProps {
  buildings: Building[];
  roads: Road[];
  activeRoute: string[]; // List of node IDs in shortest path
  currentStep: DijkstraStep | null; // From Dijkstra animation
  selectedStartId: string;
  selectedEndId: string;
  onSelectStart: (id: string) => void;
  onSelectEnd: (id: string) => void;
  onUpdateBuildings: (buildings: Building[]) => void;
  onUpdateRoads: (roads: Road[]) => void;
  activeTool: 'select' | 'add_node' | 'connect_road' | 'delete' | 'toggle_traffic' | 'toggle_closure';
  setActiveTool: (tool: any) => void;
  
  // Dispatch Animation state
  isDispatching: boolean;
  dispatchPath: string[];
  dispatchProgress: number; // 0 to 1 for the current segment
  dispatchSegmentIndex: number; // current segment starting index in dispatchPath
  onDeliveryComplete: () => void;

  // Fullscreen support
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;

  // Toast notifications
  onTriggerToast?: (type: 'traffic' | 'closure' | 'success' | 'info', title: string, message: string) => void;
}

export default function MapCanvas({
  buildings,
  roads,
  activeRoute,
  currentStep,
  selectedStartId,
  selectedEndId,
  onSelectStart,
  onSelectEnd,
  onUpdateBuildings,
  onUpdateRoads,
  activeTool,
  setActiveTool,
  isDispatching,
  dispatchPath,
  dispatchProgress,
  dispatchSegmentIndex,
  onDeliveryComplete,
  isFullscreen = false,
  onToggleFullscreen,
  onTriggerToast
}: MapCanvasProps) {
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgRectRef = useRef<DOMRect | null>(null);
  
  // Ukur ulang bounding client rect saat ukuran layar berubah untuk kinerja seret yang maksimal
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        svgRectRef.current = svgRef.current.getBoundingClientRect();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Status seret (drag)
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Status koneksi jalan
  const [roadStartId, setRoadStartId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Status edit bobot jalan manual
  const [editingRoadId, setEditingRoadId] = useState<string | null>(null);

  // Modal / Popover Kustom
  const [newNodeCoords, setNewNodeCoords] = useState<{ x: number; y: number } | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<Building['type']>('classroom');

  // Status Zoom dan Geser (Pan)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPan, setInitialPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasMovedDuringPan, setHasMovedDuringPan] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  // Bersihkan status penyuntingan jalan saat jenis alat (tool) aktif berubah
  useEffect(() => {
    setEditingRoadId(null);
    setRoadStartId(null);
  }, [activeTool]);

  // Pendengar scroll mouse untuk perbesaran berbasis titik fokus (focal-point zoom)
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const zoomFactor = 1.1;
      let newZoom = zoom;
      if (e.deltaY < 0) {
        newZoom = Math.min(zoom * zoomFactor, 6); // Perbesaran maksimum 6x
      } else {
        newZoom = Math.max(zoom / zoomFactor, 0.4); // Perbesaran minimum 0.4x
      }
      
      if (newZoom === zoom) return;

      const rect = svgEl.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
      const clickY = ((e.clientY - rect.top) / rect.height) * 500;

      const modelX = (clickX - pan.x) / zoom;
      const modelY = (clickY - pan.y) / zoom;

      const newPanX = clickX - modelX * newZoom;
      const newPanY = clickY - modelY * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    svgEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, pan]);

  // Melacak posisi kursor di dalam SVG (dipetakan melalui transformasi Zoom & Pan saat ini)
  const getSVGCoords = (e: React.MouseEvent<SVGSVGElement> | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    if (!svgRectRef.current) {
      svgRectRef.current = svgRef.current.getBoundingClientRect();
    }
    const rect = svgRectRef.current;
    // Normalisasi koordinat kembali ke ruang desain koordinat 1000x500
    const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
    const clickY = ((e.clientY - rect.top) / rect.height) * 500;
    
    // Petakan kembali ruang viewport SVG ke ruang model yang ditransformasikan
    const x = Math.round((clickX - pan.x) / zoom);
    const y = Math.round((clickY - pan.y) / zoom);
    return { x, y };
  };

  // Penangan event seret dan letakkan (drag and drop)
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    const node = buildings.find(b => b.id === id);
    if (!node) return;
    
    if (svgRef.current) {
      // Perbarui ukuran untuk memastikan koordinat presisi
      svgRectRef.current = svgRef.current.getBoundingClientRect();
      const coords = getSVGCoords(e as any);
      setDraggingId(id);
      setDragOffset({
        x: node.x - coords.x,
        y: node.y - coords.y
      });
    }
  };

  const handleSVGMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Hanya geser peta menggunakan klik kiri (tombol 0) atau klik tengah (tombol 1)
    if (e.button !== 0 && e.button !== 1) return;
    
    // Jika mengklik sub-komponen dengan tombol interaktif, abaikan geser peta
    const target = e.target as HTMLElement | SVGElement;
    if (target.closest('.no-pan') || target.tagName === 'button' || target.tagName === 'select' || target.tagName === 'input') {
      return;
    }

    if (svgRef.current) {
      svgRectRef.current = svgRef.current.getBoundingClientRect();
    }
    setIsPanning(true);
    setHasMovedDuringPan(false);
    setPanStart({ x: e.clientX, y: e.clientY });
    setInitialPan({ x: pan.x, y: pan.y });
  };

  const handleSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSVGCoords(e);
    setMousePos(coords);

    if (draggingId && activeTool === 'select') {
      const updated = buildings.map(b => {
        if (b.id === draggingId) {
          // Jaga agar tetap dalam batas kanvas yang aman
          const newX = Math.max(30, Math.min(970, coords.x + dragOffset.x));
          const newY = Math.max(30, Math.min(470, coords.y + dragOffset.y));
          return { ...b, x: newX, y: newY };
        }
        return b;
      });
      onUpdateBuildings(updated);
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;

      if (Math.hypot(dx, dy) > 5) {
        setHasMovedDuringPan(true);
      }

      if (svgRef.current) {
        if (!svgRectRef.current) {
          svgRectRef.current = svgRef.current.getBoundingClientRect();
        }
        const rect = svgRectRef.current;
        // Ubah selisih piksel layar menjadi unit viewport SVG
        const svg_dx = dx * (1000 / rect.width);
        const svg_dy = dy * (500 / rect.height);

        setPan({
          x: initialPan.x + svg_dx,
          y: initialPan.y + svg_dy
        });
      }
    }
  };

  const handleSVGMouseUp = () => {
    setDraggingId(null);
    setIsPanning(false);
  };

  // Penangan klik pada gedung/titik lokasi
  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // Alat Penghubung Jalan (Connect Road Tool)
    if (activeTool === 'connect_road') {
      if (!roadStartId) {
        setRoadStartId(id);
      } else {
        if (roadStartId !== id) {
          // Buat jalan baru jika belum ada sebelumnya
          const exists = roads.some(
            r => (r.fromId === roadStartId && r.toId === id) || (r.fromId === id && r.toId === roadStartId)
          );
          if (!exists) {
            const b1 = buildings.find(b => b.id === roadStartId)!;
            const b2 = buildings.find(b => b.id === id)!;
            const distance = Math.hypot(b1.x - b2.x, b1.y - b2.y);
            const weight = Math.round((distance / 30) * 10) / 10; // Skala jarak manusiawi

            const newRoad: Road = {
              id: `road_${Date.now()}`,
              fromId: roadStartId,
              toId: id,
              weight,
              trafficMultiplier: 1.0,
              isClosed: false
            };
            onUpdateRoads([...roads, newRoad]);
          }
        }
        setRoadStartId(null);
      }
      return;
    }

    // Alat Penghapus (Delete Tool)
    if (activeTool === 'delete') {
      // Tidak dapat menghapus kantin utama (titik pusat rute)
      if (id === 'cafeteria') return;
      
      const filteredBuildings = buildings.filter(b => b.id !== id);
      const filteredRoads = roads.filter(r => r.fromId !== id && r.toId !== id);
      
      // Atur ulang gedung asal/tujuan terpilih jika dihapus
      if (selectedStartId === id) onSelectStart('cafeteria');
      if (selectedEndId === id) {
        const remainingDorms = filteredBuildings.filter(b => b.type === 'dormitory');
        if (remainingDorms.length > 0) onSelectEnd(remainingDorms[0].id);
        else if (filteredBuildings.length > 1) onSelectEnd(filteredBuildings[filteredBuildings.length - 1].id);
      }
      
      onUpdateBuildings(filteredBuildings);
      onUpdateRoads(filteredRoads);
      return;
    }

    // Alat Pemilihan Default (Select Tool)
    if (activeTool === 'select') {
      const clicked = buildings.find(b => b.id === id);
      if (clicked?.type === 'cafeteria') {
        onSelectStart(id);
      } else {
        onSelectEnd(id);
      }
    }
  };

  // Penangan klik pada jalan
  const handleRoadClick = (e: React.MouseEvent, roadId: string) => {
    e.stopPropagation();
    
    // Alat Pemilihan Default (Select Tool) / Edit Mode
    if (activeTool === 'select') {
      setEditingRoadId(roadId);
      return;
    }

    // Alat Penghapus (Delete Tool)
    if (activeTool === 'delete') {
      onUpdateRoads(roads.filter(r => r.id !== roadId));
      return;
    }

    // Alat Lalu Lintas (Kemacetan)
    if (activeTool === 'toggle_traffic') {
      const clickedRoad = roads.find(r => r.id === roadId);
      if (clickedRoad) {
        const fromNodeName = buildings.find(b => b.id === clickedRoad.fromId)?.name || clickedRoad.fromId;
        const toNodeName = buildings.find(b => b.id === clickedRoad.toId)?.name || clickedRoad.toId;
        let nextMult = 1.0;
        let title = "Lalu Lintas Normal ✅";
        let message = `Arus lalu lintas antara [${fromNodeName}] dan [${toNodeName}] kembali lancar.`;
        let type: 'traffic' | 'success' = 'success';

        if (clickedRoad.trafficMultiplier === 1.0) {
          nextMult = 1.5;
          title = "Kepadatan Sedang 🚦";
          message = `Kepadatan lalu lintas meningkat antara [${fromNodeName}] dan [${toNodeName}].`;
          type = 'traffic';
        } else if (clickedRoad.trafficMultiplier === 1.5) {
          nextMult = 2.5;
          title = "Kemacetan Tinggi 🚦";
          message = `Terjadi penumpukan kendaraan antara [${fromNodeName}] dan [${toNodeName}].`;
          type = 'traffic';
        } else if (clickedRoad.trafficMultiplier === 2.5) {
          nextMult = 3.0;
          title = "Macet Total 🚦";
          message = `Arus lalu lintas macet total antara [${fromNodeName}] dan [${toNodeName}].`;
          type = 'traffic';
        }

        const updated = roads.map(r => r.id === roadId ? { ...r, trafficMultiplier: nextMult } : r);
        onUpdateRoads(updated);
        onTriggerToast?.(type, title, message);
      }
      return;
    }

    // Alat Penutupan Jalan (Closure Tool)
    if (activeTool === 'toggle_closure') {
      const clickedRoad = roads.find(r => r.id === roadId);
      if (clickedRoad) {
        const fromNodeName = buildings.find(b => b.id === clickedRoad.fromId)?.name || clickedRoad.fromId;
        const toNodeName = buildings.find(b => b.id === clickedRoad.toId)?.name || clickedRoad.toId;
        const willBeClosed = !clickedRoad.isClosed;

        const title = willBeClosed ? "Jalan Ditutup 🚫" : "Jalan Dibuka ✅";
        const message = willBeClosed 
          ? `Akses jalan antara [${fromNodeName}] dan [${toNodeName}] ditutup sementara.` 
          : `Akses jalan antara [${fromNodeName}] dan [${toNodeName}] telah dibuka kembali.`;
        const type = willBeClosed ? 'closure' : 'success';

        const updated = roads.map(r => r.id === roadId ? { ...r, isClosed: willBeClosed } : r);
        onUpdateRoads(updated);
        onTriggerToast?.(type, title, message);
      }
      return;
    }
  };

  // Klik ganda atau klik kanan pada jalan untuk mengubah bobot manual via overlay input langsung
  const handleRoadDoubleClick = (e: React.MouseEvent, roadId: string) => {
    e.preventDefault();
    setEditingRoadId(roadId);
  };

  // Penangan klik pada area kosong SVG untuk menambah gedung baru
  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    setEditingRoadId(null); // Tutup input edit bobot jalan yang sedang terbuka
    if (hasMovedDuringPan) {
      setHasMovedDuringPan(false);
      return;
    }

    if (activeTool === 'add_node') {
      const coords = getSVGCoords(e);
      setNewNodeCoords(coords);
      setNewNodeName(`Gedung Baru #${buildings.length + 1}`);
      setNewNodeType('classroom');
    }
    if (roadStartId) {
      setRoadStartId(null); // Batalkan penghubungan jalan
    }
  };

  // Konfirmasi penambahan gedung baru
  const handleConfirmAddBuilding = () => {
    if (!newNodeCoords) return;
    const newBuilding: Building = {
      id: `building_${Date.now()}`,
      name: newNodeName || `Gedung Baru #${buildings.length + 1}`,
      x: newNodeCoords.x,
      y: newNodeCoords.y,
      type: newNodeType
    };
    onUpdateBuildings([...buildings, newBuilding]);
    setNewNodeCoords(null);
    setActiveTool('select'); // Kembalikan alat terpilih ke pemilih (select)
  };

  const getRoadDijkstraStatus = (road: Road) => {
    if (!currentStep) return 'none';
    const isRelaxed = currentStep.relaxedEdges.includes(road.id);
    const isActive = currentStep.activeEdgeId === road.id;

    if (isActive) return 'active';
    if (isRelaxed) return 'relaxed';
    return 'none';
  };

  const getNodeDijkstraStatus = (nodeId: string) => {
    if (!currentStep) {
      if (activeRoute.includes(nodeId)) return 'final-path';
      return 'none';
    }
    const isVisited = currentStep.visited.includes(nodeId);
    const isCurrent = currentStep.currentNodeId === nodeId;
    const isNeighbor = currentStep.activeNeighborId === nodeId;

    if (isCurrent) return 'current';
    if (isNeighbor) return 'neighbor';
    if (isVisited) return 'visited';
    return 'none';
  };

  // Hitung koordinat sepeda motor kurir pengiriman beranimasi dengan pengaman anti-hilang
  let motoCoords = { x: 0, y: 0 };
  let motoAngle = 0;
  if (isDispatching && dispatchPath.length > 1) {
    // Memastikan indeks segmen berada di batas yang aman
    const safeIndex = Math.min(Math.max(0, dispatchSegmentIndex), dispatchPath.length - 2);
    const fromId = dispatchPath[safeIndex];
    const toId = dispatchPath[safeIndex + 1];
    
    const fromNode = buildings.find(b => b.id === fromId);
    const toNode = buildings.find(b => b.id === toId);
    
    if (fromNode && toNode) {
      motoCoords = {
        x: fromNode.x + (toNode.x - fromNode.x) * dispatchProgress,
        y: fromNode.y + (toNode.y - fromNode.y) * dispatchProgress
      };
      motoAngle = (Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * 180) / Math.PI;
    } else if (fromNode) {
      motoCoords = { x: fromNode.x, y: fromNode.y };
    } else if (dispatchPath.length > 0) {
      const fallbackNode = buildings.find(b => b.id === dispatchPath[0]);
      if (fallbackNode) {
        motoCoords = { x: fallbackNode.x, y: fallbackNode.y };
      }
    }
  }

  return (
    <div className="relative w-full h-[480px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
      {/* Latar Belakang Kotak Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />
      
      {/* HUD Interaktif Peta */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.8 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-bold shadow-sm font-sans">
          <Compass className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
          <span>RADAR AKTIF KAMPUS</span>
        </div>
        
        {roadStartId && (
          <div className="bg-amber-50/95 backdrop-blur-md px-3 py-2 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-bold shadow-sm flex items-center gap-2 font-sans animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Pilih gedung tujuan kedua untuk menghubungkan jalan...</span>
          </div>
        )}
      </div>

      {/* Info Legenda Kanan Atas */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="flex gap-4 items-center bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 text-[11px] text-slate-500 shadow-sm font-semibold font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
            <span>Titik Asal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600 shadow-sm animate-pulse" />
            <span>Titik Tujuan</span>
          </div>
        </div>
      </div>

      {/* Kanvas Interaktif SVG */}
      <svg
        id="campus-dispatch-svg"
        ref={svgRef}
        viewBox="0 0 1000 500"
        className={`w-full h-full select-none transition-all ${
          isPanning 
            ? 'cursor-grabbing' 
            : activeTool === 'select' 
              ? 'cursor-grab' 
              : activeTool === 'add_node' 
                ? 'cursor-crosshair' 
                : 'cursor-pointer'
        }`}
        onMouseDown={handleSVGMouseDown}
        onClick={handleSVGClick}
        onMouseMove={handleSVGMouseMove}
        onMouseUp={handleSVGMouseUp}
        onMouseLeave={handleSVGMouseUp}
      >
        {/* Pembungkus SVG untuk Geser dan Perbesaran */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {/* Pratinjau Koneksi (saat menggambar jalan baru) */}
        {roadStartId && (
          (() => {
            const startNode = buildings.find(b => b.id === roadStartId);
            if (!startNode) return null;
            return (
              <line
                x1={startNode.x}
                y1={startNode.y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="5 5"
                className="animate-pulse"
              />
            );
          })()
        )}

        {/* 1. GAMBAR JALAN / EDGES */}
        {roads.map(road => {
          const fromNode = buildings.find(b => b.id === road.fromId);
          const toNode = buildings.find(b => b.id === road.toId);
          const dijStatus = getRoadDijkstraStatus(road);
          const isFinalPath = !currentStep && activeRoute.includes(road.fromId) && activeRoute.includes(road.toId) && Math.abs(activeRoute.indexOf(road.fromId) - activeRoute.indexOf(road.toId)) === 1;
          const effectiveWeight = getEffectiveWeight(road);

          return (
            <MapRoad
              key={road.id}
              road={road}
              fromNode={fromNode}
              toNode={toNode}
              dijStatus={dijStatus}
              isFinalPath={isFinalPath}
              isDispatching={isDispatching}
              effectiveWeight={effectiveWeight}
              onRoadClick={handleRoadClick}
              onRoadDoubleClick={handleRoadDoubleClick}
              isEditing={editingRoadId === road.id}
              onSaveWeight={(weight) => {
                const updated = roads.map(r => r.id === road.id ? { ...r, weight } : r);
                onUpdateRoads(updated);
                setEditingRoadId(null);
              }}
              onCancelEdit={() => setEditingRoadId(null)}
            />
          );
        })}

        {/* 2. GAMBAR GEDUNG / NODES */}
        {buildings.map(node => {
          const dijStatus = getNodeDijkstraStatus(node.id);
          const isStart = node.id === selectedStartId;
          const isEnd = node.id === selectedEndId;
          const currentDistance = currentStep?.distances[node.id];

          return (
            <MapNode
              key={node.id}
              node={node}
              dijStatus={dijStatus}
              isStart={isStart}
              isEnd={isEnd}
              currentDistance={currentStep ? currentDistance : undefined}
              onNodeMouseDown={handleNodeMouseDown}
              onNodeClick={handleNodeClick}
            />
          );
        })}

        {/* 3. ANIMASI KENDARAAN KURIR (MOTOR) */}
        {isDispatching && motoCoords.x > 0 && (
          <g transform={`translate(${motoCoords.x}, ${motoCoords.y}) rotate(${motoAngle})`} className="pointer-events-none">
            <circle r={18} fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
            <circle r={11} fill="#10b981" stroke="#ffffff" strokeWidth={2} className="shadow-sm" />
            
            {/* Bentuk Kendaraan Kurir */}
            <path
              d="M -5 -3 L 5 0 L -5 3 Z"
              fill="#ffffff"
              transform="scale(1.1)"
            />

            {/* Kotak Makanan Kurir */}
            <rect x={-8} y={-4} width={4} height={8} fill="#f59e0b" rx={1} />
          </g>
        )}
        </g>
      </svg>

      {/* HUD Kontrol Zoom dan Geser */}
      <div 
        className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm no-pan"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoom(z => Math.min(z * 1.25, 6))}
          title="Perbesar (Zoom In)"
          className="p-1.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:text-indigo-600 transition shadow-xs flex items-center justify-center cursor-pointer font-sans"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z / 1.25, 0.4))}
          title="Perkecil (Zoom Out)"
          className="p-1.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:text-indigo-600 transition shadow-xs flex items-center justify-center cursor-pointer font-sans"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset Zoom & Geser"
          className="p-1.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-700 hover:text-indigo-600 transition shadow-xs flex items-center justify-center cursor-pointer font-sans"
        >
          <Maximize className="w-4 h-4" />
        </button>
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Keluar Mode Layar Penuh" : "Mode Layar Penuh (Sembunyikan Sidebar)"}
            className={`p-1.5 border rounded-lg transition shadow-xs flex items-center justify-center cursor-pointer font-sans ${
              isFullscreen 
                ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700" 
                : "bg-white border-slate-100 text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Hamparan Legenda Melayang */}
      <MapLegend
        isLegendOpen={isLegendOpen}
        setIsLegendOpen={setIsLegendOpen}
      />

      {/* Hamparan Indikator Koneksi */}
      {roadStartId && (
        <div 
          className={`absolute ${isLegendOpen ? 'bottom-[160px]' : 'bottom-[56px]'} left-4 bg-white/95 border border-slate-200 px-3 py-2 rounded-xl text-[11px] text-slate-600 font-sans font-semibold shadow-sm z-10 transition-all duration-300`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Mulai jalan dari: <strong className="text-amber-600">{buildings.find(b => b.id === roadStartId)?.name}</strong></span>
          </div>
        </div>
      )}

      {/* Modal Kustom Tambah Gedung */}
      <AddNodeModal
        newNodeCoords={newNodeCoords}
        setNewNodeCoords={setNewNodeCoords}
        newNodeName={newNodeName}
        setNewNodeName={setNewNodeName}
        newNodeType={newNodeType}
        setNewNodeType={setNewNodeType}
        handleConfirmAddBuilding={handleConfirmAddBuilding}
        buildingsCount={buildings.length}
      />
    </div>
  );
}
