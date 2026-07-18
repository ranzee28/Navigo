import React from 'react';
import { DIJKSTRA_PSEUDOCODE } from '../../types';
import { Code2 } from 'lucide-react';

interface PseudocodePanelProps {
  currentLineIndex: number; // 0-indexed corresponding to step
}

export default function PseudocodePanel({ currentLineIndex }: PseudocodePanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full text-slate-800">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <Code2 className="w-4 h-4 text-indigo-600" />
        <h3 className="text-xs font-semibold text-slate-800 tracking-wide">
          Pseudocode Dijkstra
        </h3>
      </div>
      
      <div className="flex-1 overflow-auto font-mono text-[11px] leading-6 text-slate-600 select-none max-h-[300px]">
        {DIJKSTRA_PSEUDOCODE.map((line, idx) => {
          const isHighlighted = currentLineIndex === idx;
          
          return (
            <div
              key={idx}
              className={`px-3 py-1 rounded-lg transition-colors duration-150 flex items-start ${
                isHighlighted 
                  ? 'bg-indigo-50 text-indigo-900 font-bold border-l-4 border-indigo-600 shadow-sm' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <span className="w-6 text-slate-400 select-none mr-2 text-right text-[10px] pt-0.5">
                {idx + 1}
              </span>
              <pre className="whitespace-pre overflow-x-auto select-text font-mono font-medium">
                {line.substring(line.indexOf(':') + 1)}
              </pre>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-mono leading-relaxed">
        * Baris kode yang sedang dieksekusi akan ditandai dengan warna biru. Amati perubahan variabel secara langsung.
      </div>
    </div>
  );
}
