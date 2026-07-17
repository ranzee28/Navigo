import React from 'react';
import { Road, Building } from '../../types';

interface MapRoadProps {
  key?: string;
  road: Road;
  fromNode: Building | undefined;
  toNode: Building | undefined;
  dijStatus: 'none' | 'active' | 'relaxed';
  isFinalPath: boolean;
  isDispatching: boolean;
  effectiveWeight: number;
  onRoadClick: (e: React.MouseEvent, roadId: string) => void;
  onRoadDoubleClick: (e: React.MouseEvent, roadId: string) => void;
  isEditing?: boolean;
  onSaveWeight?: (weight: number) => void;
  onCancelEdit?: () => void;
}

// Mengatur penggambaran garis jalan SVG, status kepadatan lalu lintas, garis animasi proses Dijkstra, rute optimal tercepat, dan overlay bobot/jarak (km).

export default function MapRoad({
  road,
  fromNode,
  toNode,
  dijStatus,
  isFinalPath,
  isDispatching,
  effectiveWeight,
  onRoadClick,
  onRoadDoubleClick,
  isEditing = false,
  onSaveWeight,
  onCancelEdit,
}: MapRoadProps) {
  if (!fromNode || !toNode) return null;

  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const mx = fromNode.x + dx * 0.5;
  const my = fromNode.y + dy * 0.5;

  // Gaya Dasar (Basic styles)
  let strokeColor = '#cbd5e1'; // Slate terang yang sangat bersih secara default
  let strokeWidth = 3;
  let isDashed = false;
  let filterShadow = '';

  if (road.isClosed) {
    strokeColor = '#f43f5e'; // Merah bersih (Tutup)
    strokeWidth = 4;
    isDashed = true;
  } else if (dijStatus === 'active') {
    strokeColor = '#f59e0b'; // Sedang dievaluasi / aktif saat ini
    strokeWidth = 6;
    filterShadow = 'drop-shadow(0 0 4px rgba(245,158,11,0.5))';
  } else if (dijStatus === 'relaxed') {
    strokeColor = '#3b82f6'; // Jalan yang berhasil direlaksasi sejauh ini
    strokeWidth = 4;
  } else if (isFinalPath) {
    strokeColor = '#10b981'; // Rute terpendek akhir Dijkstra (emerald)
    strokeWidth = 6;
    filterShadow = 'drop-shadow(0 0 6px rgba(16,185,129,0.5))';
  }

  return (
    <g className="cursor-pointer group/road">
      {/* Pemicu sentuh transparan tebal agar mudah diklik */}
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke="transparent"
        strokeWidth={15}
        onClick={(e) => onRoadClick(e, road.id)}
        onDoubleClick={(e) => onRoadDoubleClick(e, road.id)}
      />

      {/* Garis Visual Jalan Utama */}
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isDashed ? '6 6' : undefined}
        style={{ filter: filterShadow, transition: 'all 0.2s' }}
      />

      {/* Jejak rute aktif menyala (efek pemindaian Dijkstra) */}
      {dijStatus === 'active' && (
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke="#fbbf24"
          strokeWidth={4}
          strokeDasharray="10 12"
          className="animate-[dash_1.5s_linear_infinite]"
          style={{
            animation: 'dash 1.2s linear infinite',
            strokeDashoffset: 100,
          }}
        />
      )}

      {/* Aliran panah ganda untuk rute pengiriman aktif */}
      {isFinalPath && !isDispatching && (
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke="#34d399"
          strokeWidth={3}
          strokeDasharray="8 12"
          className="animate-[dash_2s_linear_infinite]"
          style={{
            animation: 'dash 2s linear infinite',
          }}
        />
      )}

      {/* Lencana Hamparan Bobot Jalan atau Input Overlay */}
      {isEditing ? (
        <foreignObject
          x={mx - 32}
          y={my - 14}
          width={64}
          height={28}
          className="no-pan overflow-visible z-50"
        >
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="99"
            defaultValue={road.weight}
            autoFocus
            onFocus={(e) => e.target.select()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onBlur={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 0) {
                onSaveWeight?.(Math.round(val * 10) / 10);
              } else {
                onCancelEdit?.();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseFloat((e.target as HTMLInputElement).value);
                if (!isNaN(val) && val > 0) {
                  onSaveWeight?.(Math.round(val * 10) / 10);
                } else {
                  onCancelEdit?.();
                }
              } else if (e.key === 'Escape') {
                onCancelEdit?.();
              }
            }}
            className="w-full h-full px-1 text-[11px] font-mono font-bold text-center bg-white border-2 border-indigo-500 rounded-md shadow-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </foreignObject>
      ) : (
        <g transform={`translate(${mx}, ${my})`}>
          <rect
            x={-24}
            y={-10}
            width={48}
            height={20}
            rx={6}
            fill="#ffffff"
            stroke={road.isClosed ? '#f43f5e' : isFinalPath ? '#10b981' : '#e2e8f0'}
            strokeWidth={1.5}
            className="shadow-sm transition-colors"
          />
          <text
            textAnchor="middle"
            y={4}
            fill={road.isClosed ? '#e11d48' : isFinalPath ? '#047857' : '#475569'}
            className="text-[9px] font-mono font-bold"
          >
            {road.isClosed ? 'TUTUP' : `${effectiveWeight}km`}
          </text>
          
          {/* Indikator peringatan lalu lintas (kemacetan) */}
          {road.trafficMultiplier > 1.0 && !road.isClosed && (
            <circle cx={18} cy={-7} r={4.5} fill="#f59e0b" className="animate-ping" />
          )}
        </g>
      )}
    </g>
  );
}
