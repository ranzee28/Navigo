import React from 'react';
import { 
  Coffee, Building2, BookOpen, GraduationCap, Trophy, Landmark, Trees 
} from 'lucide-react';
import { Building } from '../../types';

interface MapNodeProps {
  key?: string;
  node: Building;
  dijStatus: 'none' | 'final-path' | 'current' | 'neighbor' | 'visited';
  isStart: boolean;
  isEnd: boolean;
  currentDistance: number | undefined;
  onNodeMouseDown: (e: React.MouseEvent, id: string) => void;
  onNodeClick: (e: React.MouseEvent, id: string) => void;
}

// Mengatur rendering visual untuk setiap gedung/titik lokasi, ikon spesifik dari Lucide-react, animasi pulsa gelombang, label nama gedung, serta label kalkulasi jarak sementara Dijkstra.

// Mendapatkan ikon untuk jenis gedung tertentu
const getBuildingIcon = (type: Building['type'], size = 18) => {
  switch (type) {
    case 'cafeteria':
      return <Coffee size={size} className="text-amber-500 animate-pulse" />;
    case 'dormitory':
      return <GraduationCap size={size} className="text-indigo-600" />;
    case 'library':
      return <BookOpen size={size} className="text-teal-600" />;
    case 'classroom':
      return <Building2 size={size} className="text-sky-600" />;
    case 'gym':
      return <Trophy size={size} className="text-rose-500" />;
    case 'admin':
      return <Landmark size={size} className="text-emerald-600" />;
    case 'park':
      return <Trees size={size} className="text-green-600" />;
    default:
      return <Building2 size={size} className="text-slate-500" />;
  }
};

export default function MapNode({
  node,
  dijStatus,
  isStart,
  isEnd,
  currentDistance,
  onNodeMouseDown,
  onNodeClick,
}: MapNodeProps) {
  let fill = '#ffffff'; // Putih murni
  let stroke = '#94a3b8'; // Warna Slate-400
  let strokeWidth = 2;
  let r = 21;
  let glow = '';

  if (isStart) {
    fill = '#f59e0b'; // Warna Amber
    stroke = '#d97706';
    strokeWidth = 3;
    r = 23;
    glow = 'drop-shadow(0 4px 6px rgba(245,158,11,0.25))';
  } else if (isEnd) {
    fill = '#4f46e5'; // Warna Indigo
    stroke = '#3730a3';
    strokeWidth = 3;
    r = 23;
    glow = 'drop-shadow(0 4px 6px rgba(79,70,229,0.25))';
  } else if (dijStatus === 'current') {
    fill = '#e11d48'; // Warna Rose-600
    stroke = '#9f1239';
    strokeWidth = 3;
    r = 25;
    glow = 'drop-shadow(0 4px 10px rgba(225,29,72,0.4))';
  } else if (dijStatus === 'neighbor') {
    fill = '#fef08a'; // Warna Kuning-200
    stroke = '#ca8a04';
    strokeWidth = 2.5;
    r = 22;
    glow = 'drop-shadow(0 3px 6px rgba(250,204,21,0.2))';
  } else if (dijStatus === 'visited') {
    fill = '#eff6ff'; // Warna Biru Muda-50
    stroke = '#2563eb'; // Warna Biru-600
    strokeWidth = 2.5;
    glow = 'drop-shadow(0 2px 4px rgba(37,99,235,0.15))';
  } else if (dijStatus === 'final-path') {
    fill = '#ecfdf5'; // Warna Emerald-50
    stroke = '#10b981'; // Warna Emerald-500
    strokeWidth = 2.5;
    r = 22;
    glow = 'drop-shadow(0 3px 6px rgba(16,185,129,0.2))';
  }

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      className="cursor-grab active:cursor-grabbing transition-all duration-200"
      onMouseDown={(e) => onNodeMouseDown(e, node.id)}
      onClick={(e) => onNodeClick(e, node.id)}
    >
      {/* Efek Denyut Luar (Pulse) */}
      {(dijStatus === 'current' || isEnd) && (
        <circle
          r={r + 8}
          fill="none"
          stroke={dijStatus === 'current' ? '#e11d48' : '#4f46e5'}
          strokeWidth={2}
          className="animate-ping opacity-50"
        />
      )}

      {/* Lingkaran Gedung Utama */}
      <circle
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={{ filter: glow, transition: 'all 0.2s' }}
        className="shadow-sm"
      />

      {/* Ikon Gedung */}
      <g transform="translate(-9, -9)" className="pointer-events-none">
        {getBuildingIcon(node.type, 18)}
      </g>

      {/* Label: Nama Gedung */}
      <g transform={`translate(0, ${r + 14})`}>
        <rect
          x={-60}
          y={-9}
          width={120}
          height={18}
          rx={6}
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth={1}
          className="shadow-sm"
        />
        <text
          textAnchor="middle"
          fill="#1e293b"
          className="text-[9px] font-sans font-bold tracking-wide"
        >
          {node.name.length > 18 ? node.name.slice(0, 16) + '..' : node.name}
        </text>
      </g>

      {/* Hamparan label jarak gedung */}
      {currentDistance !== undefined && (
        <g transform={`translate(0, -${r + 8})`}>
          <rect
            x={-20}
            y={-8}
            width={40}
            height={15}
            rx={4}
            fill="#1e293b"
            stroke={dijStatus === 'current' ? '#e11d48' : '#475569'}
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            y={3}
            fill={currentDistance === Infinity ? '#94a3b8' : '#38bdf8'}
            className="text-[9px] font-mono font-bold"
          >
            {currentDistance === Infinity ? '∞' : `${currentDistance.toFixed(1)}`}
          </text>
        </g>
      )}
    </g>
  );
}
