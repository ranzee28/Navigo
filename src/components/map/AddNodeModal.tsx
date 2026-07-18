import React from 'react';
import { Plus } from 'lucide-react';
import { Building } from '../../types';

interface AddNodeModalProps {
  newNodeCoords: { x: number; y: number } | null;
  setNewNodeCoords: (coords: { x: number; y: number } | null) => void;
  newNodeName: string;
  setNewNodeName: (name: string) => void;
  newNodeType: Building['type'];
  setNewNodeType: (type: Building['type']) => void;
  handleConfirmAddBuilding: () => void;
  buildingsCount: number;
}

// Menangani tampilan modal pop-up ketika pengguna meletakkan gedung kampus baru di peta.

export default function AddNodeModal({
  newNodeCoords,
  setNewNodeCoords,
  newNodeName,
  setNewNodeName,
  newNodeType,
  setNewNodeType,
  handleConfirmAddBuilding,
  buildingsCount,
}: AddNodeModalProps) {
  if (!newNodeCoords) return null;

  return (
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-30">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 w-80 shadow-xl flex flex-col gap-4 text-xs text-slate-800">
        <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 uppercase">
          <Plus className="w-4 h-4 text-indigo-600" />
          TAMBAH GEDUNG KAMPUS BARU
        </h4>
        
        <div className="flex flex-col gap-1">
          <span className="text-slate-500 font-semibold text-[11px]">Nama Lokasi / Gedung:</span>
          <input
            type="text"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-slate-500 font-semibold text-[11px]">Jenis Gedung:</span>
          <select
            value={newNodeType}
            onChange={(e) => setNewNodeType(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="classroom">Gedung Kuliah / Lab</option>
            <option value="dormitory">Gedung Asrama</option>
            <option value="library">Perpustakaan Utama</option>
            <option value="gym">Fasilitas Olahraga (GOR)</option>
            <option value="admin">Gedung Administrasi</option>
            <option value="park">Taman / Area Terbuka</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => setNewNodeCoords(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg font-bold transition-all text-xs"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmAddBuilding}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg font-bold transition-all text-xs shadow-sm"
          >
            Letakkan Lokasi
          </button>
        </div>
      </div>
    </div>
  );
}
