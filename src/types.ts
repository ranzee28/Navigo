export interface Building {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'cafeteria' | 'dormitory' | 'library' | 'classroom' | 'gym' | 'admin' | 'park';
}

export interface Road {
  id: string;
  fromId: string;
  toId: string;
  weight: number; // Bobot dasar (misalnya dalam kilometer atau menit)
  trafficMultiplier: number; // Pengali lalu lintas: 1.0 (lancar) hingga 3.0 (sangat padat/macet)
  isClosed: boolean;
}

export interface TrafficEvent {
  id: string;
  roadId: string;
  name: string;
  multiplier: number;
  type: 'accident' | 'construction' | 'rush_hour' | 'flooding';
}

export interface QueueItem {
  nodeId: string;
  priority: number;
}

export interface DijkstraStep {
  stepIndex: number;
  currentNodeId: string | null;
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visited: string[];
  queue: QueueItem[];
  activeEdgeId: string | null; // Sisi jalan yang sedang direlaksasi saat ini (Edge currently being relaxed)
  activeNeighborId: string | null; // Simpul tetangga yang sedang dievaluasi saat ini (Neighbor node currently being evaluated)
  relaxedEdges: string[]; // Sisi jalan yang telah berhasil direlaksasi sejauh ini (Edges that have been relaxed so far)
  lineOfCode: number; // Indeks baris pseudocode yang sedang berjalan (Index of the pseudocode line running)
  description: string;
}

export const DIJKSTRA_PSEUDOCODE = [
  "1:  fungsi Dijkstra(Graf, sumber):",
  "2:      buat antrean prioritas Q untuk simpul",
  "3:      untuk setiap simpul v dalam Graf:",
  "4:          jarak[v] ← TAK_HINGGA",
  "5:          sebelumnya[v] ← BELUM_TERDEFINISI",
  "6:          masukkan v ke dalam Q dengan prioritas jarak[v]",
  "7:      jarak[sumber] ← 0",
  "8:      perbarui prioritas sumber di Q menjadi 0",
  "9:      selama Q tidak kosong:",
  "10:         u ← Q.ekstrak_terkecil()",
  "11:         tambahkan u ke himpunan selesai_dikunjungi",
  "12:         untuk setiap tetangga v dari u:",
  "13:             jika v belum selesai_dikunjungi:",
  "14:                 alt ← jarak[u] + bobot(u, v)",
  "15:                 jika alt < jarak[v]:",
  "16:                     jarak[v] ← alt",
  "17:                     sebelumnya[v] ← u",
  "18:                     perbarui prioritas v di Q menjadi alt",
  "19:     kembalikan jarak, sebelumnya"
];
