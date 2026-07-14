import { Building, Road, DijkstraStep, QueueItem } from '../types';

// Fungsi Kalkulasi Bobot Efektif Dinamis
// Pembantu untuk menghitung bobot jalan efektif (bobot dasar * pengali kemacetan)
export function getEffectiveWeight(road: Road, mode: 'shortest' | 'fastest' = 'fastest'): number {
  if (road.isClosed) return Infinity;
  if (mode === 'shortest') return road.weight;
  return Math.round(road.weight * road.trafficMultiplier * 10) / 10;
}

// Fungsi utama untuk generateDijkstraSteps
// Algoritma Dijkstra yang menghasilkan langkah-langkah terperinci
export function generateDijkstraSteps(
  nodes: Building[],
  edges: Road[],
  sourceId: string,
  targetId?: string,
  mode: 'shortest' | 'fastest' = 'fastest'
): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  let stepIndex = 0;

  // Kloning struktur demi keamanan data
  const nodeIds = nodes.map(n => n.id);
  
  // Pembantu untuk mencari jalan yang terhubung langsung (tetangga)
  const getNeighbors = (uId: string) => {
    const neighbors: { neighborId: string; road: Road }[] = [];
    for (const edge of edges) {
      if (edge.isClosed) continue;
      if (edge.fromId === uId) {
        neighbors.push({ neighborId: edge.toId, road: edge });
      } else if (edge.toId === uId) {
        // Jalan dua arah (bolak-balik)
        neighbors.push({ neighborId: edge.fromId, road: edge });
      }
    }
    return neighbors;
  };

  // Pembantu untuk merekam setiap langkah algoritme
  const recordStep = (
    lineOfCode: number,
    currentNodeId: string | null,
    distances: Record<string, number>,
    previous: Record<string, string | null>,
    visited: string[],
    queue: QueueItem[],
    activeEdgeId: string | null,
    activeNeighborId: string | null,
    relaxedEdges: string[],
    description: string
  ) => {
    steps.push({
      stepIndex: stepIndex++,
      currentNodeId,
      distances: { ...distances },
      previous: { ...previous },
      visited: [...visited],
      queue: queue.map(item => ({ ...item })),
      activeEdgeId,
      activeNeighborId,
      relaxedEdges: [...relaxedEdges],
      lineOfCode,
      description,
    });
  };

  // 1. Kondisi Awal (Initial State)
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: string[] = [];
  let queue: QueueItem[] = [];
  const relaxedEdges: string[] = [];

  recordStep(
    0, // Baris 1
    null,
    distances,
    previous,
    visited,
    queue,
    null,
    null,
    relaxedEdges,
    `Memulai algoritme Dijkstra dari gedung asal: ${nodes.find(n => n.id === sourceId)?.name || sourceId}`
  );

  // 2. Pembuatan Antrean Prioritas Q
  recordStep(
    1, // Baris 2: buat antrean prioritas titik Q
    null,
    distances,
    previous,
    visited,
    queue,
    null,
    null,
    relaxedEdges,
    "Membuat antrean prioritas Q yang kosong."
  );

  // 3. Mengisi antrean dan jarak awal
  for (const nId of nodeIds) {
    distances[nId] = Infinity;
    previous[nId] = null;
    queue.push({ nodeId: nId, priority: Infinity });
  }
  
  // Urutkan antrean (hanya untuk visualisasi yang akurat)
  queue.sort((a, b) => a.priority - b.priority);

  recordStep(
    2, // Baris 3-6: untuk setiap titik v dalam Graf, dist[v] = INF, prev[v] = UNDEF, masukkan ke Q
    null,
    distances,
    previous,
    visited,
    queue,
    null,
    null,
    relaxedEdges,
    "Mengatur semua jarak gedung ke Tak Hingga dan memasukkannya ke antrean prioritas Q."
  );

  // 4. Mengatur Jarak Titik Asal
  distances[sourceId] = 0;
  queue = queue.map(item => item.nodeId === sourceId ? { ...item, priority: 0 } : item);
  queue.sort((a, b) => a.priority - b.priority);

  recordStep(
    6, // Baris 7-8: dist[source] = 0, perbarui prioritas di Q
    null,
    distances,
    previous,
    visited,
    queue,
    null,
    null,
    relaxedEdges,
    `Mengatur jarak gedung asal ke 0 dan memindahkannya ke antrean paling depan di Q.`
  );

  // 5. Perulangan Utama Dijkstra
  while (queue.length > 0) {
    // Baris 9: selama Q tidak kosong
    recordStep(
      8, // Baris 9
      null,
      distances,
      previous,
      visited,
      queue,
      null,
      null,
      relaxedEdges,
      `Memeriksa apakah antrean prioritas kosong. Tersisa ${queue.length} gedung di Q.`
    );

    // Baris 10: ambil nilai minimum (extract min)
    // Urutkan untuk memastikan keamanan urutan
    queue.sort((a, b) => a.priority - b.priority);
    const minItem = queue.shift()!;
    const uId = minItem.nodeId;
    const uNode = nodes.find(n => n.id === uId);

    // Jika gedung yang diambil berjarak Tak Hingga, berarti gedung-gedung yang tersisa tidak dapat dijangkau
    if (distances[uId] === Infinity) {
      recordStep(
        9, // Baris 10
        uId,
        distances,
        previous,
        visited,
        queue,
        null,
        null,
        relaxedEdges,
        `Mengambil gedung ${uNode?.name || uId} dengan jarak Tak Hingga. Sisa gedung tidak dapat dijangkau.`
      );
      break;
    }

    recordStep(
      9, // Baris 10
      uId,
      distances,
      previous,
      visited,
      queue,
      null,
      null,
      relaxedEdges,
      `Mengambil gedung terdekat ${uNode?.name || uId} (jarak saat ini: ${distances[uId]}) dari antrean prioritas.`
    );

    // Baris 11: tambahkan ke daftar yang sudah dikunjungi
    visited.push(uId);
    recordStep(
      10, // Baris 11
      uId,
      distances,
      previous,
      visited,
      queue,
      null,
      null,
      relaxedEdges,
      `Menambahkan ${uNode?.name || uId} ke daftar selesai dikunjungi (rute terpendek final dikunci).`
    );

    // Jika kita telah mencapai tujuan, kita bisa mencatatnya dan menghentikan perulangan (opsional)
    if (targetId && uId === targetId) {
      recordStep(
        10,
        uId,
        distances,
        previous,
        visited,
        queue,
        null,
        null,
        relaxedEdges,
        `Gedung tujuan ${uNode?.name || uId} berhasil dicapai! Pencarian rute terpendek selesai.`
      );
      break;
    }

    // Baris 12: tetangga yang terhubung
    const neighbors = getNeighbors(uId);
    recordStep(
      11, // Baris 12
      uId,
      distances,
      previous,
      visited,
      queue,
      null,
      null,
      relaxedEdges,
      `Memindai jalan yang terhubung dari gedung ${uNode?.name || uId}. Menemukan ${neighbors.length} jalur jalan.`
    );

    for (const { neighborId, road } of neighbors) {
      const vNode = nodes.find(n => n.id === neighborId);
      
      // Baris 13: jika v belum dikunjungi
      const isVisited = visited.includes(neighborId);
      recordStep(
        12, // Baris 13
        uId,
        distances,
        previous,
        visited,
        queue,
        road.id,
        neighborId,
        relaxedEdges,
        `Memeriksa apakah gedung tetangga ${vNode?.name || neighborId} sudah selesai dikunjungi.`
      );

      if (!isVisited) {
        // Baris 14: alt = dist[u] + weight(u, v)
        const weight = getEffectiveWeight(road, mode);
        const alt = distances[uId] + weight;
        
        recordStep(
          13, // Baris 14
          uId,
          distances,
          previous,
          visited,
          queue,
          road.id,
          neighborId,
          relaxedEdges,
          `Menghitung potensi jarak ke ${vNode?.name || neighborId}: jarak(${uNode?.name}) [${distances[uId]}] + bobot jalan [${weight}] = ${alt}.`
        );

        // Baris 15: jika alt < dist[v]
        const currentDist = distances[neighborId];
        recordStep(
          14, // Baris 15
          uId,
          distances,
          previous,
          visited,
          queue,
          road.id,
          neighborId,
          relaxedEdges,
          `Membandingkan potensi jarak baru ${alt} dengan jarak tercatat ${currentDist === Infinity ? 'Tak Hingga' : currentDist} untuk ${vNode?.name || neighborId}.`
        );

        if (alt < currentDist) {
          // Baris 16-18: perbarui jarak, pendahulu, dan turunkan prioritasnya di Q
          distances[neighborId] = alt;
          previous[neighborId] = uId;
          
          // Perbarui prioritas antrean
          queue = queue.map(item => item.nodeId === neighborId ? { ...item, priority: alt } : item);
          queue.sort((a, b) => a.priority - b.priority);

          if (!relaxedEdges.includes(road.id)) {
            relaxedEdges.push(road.id);
          }

          recordStep(
            15, // Baris 16-18 (dipadatkan agar alur visual lebih lancar)
            uId,
            distances,
            previous,
            visited,
            queue,
            road.id,
            neighborId,
            relaxedEdges,
            `BERHASIL RELAKSASI! Jarak ke ${vNode?.name || neighborId} dipangkas menjadi ${alt}. Pendahulu diset ke ${uNode?.name || uId} & urutan Q diperbarui.`
          );
        } else {
          recordStep(
            14, // Baris 15 (perbandingan gagal, tidak lebih cepat)
            uId,
            distances,
            previous,
            visited,
            queue,
            road.id,
            neighborId,
            relaxedEdges,
            `Tidak perlu relaksasi. Rute saat ini ke ${vNode?.name || neighborId} sudah lebih optimal (${currentDist}).`
          );
        }
      } else {
        recordStep(
          12, // Baris 13
          uId,
          distances,
          previous,
          visited,
          queue,
          road.id,
          neighborId,
          relaxedEdges,
          `Gedung tetangga ${vNode?.name || neighborId} sudah final dikunjungi, dilewati.`
        );
      }
    }
  }

  // Langkah Akhir: kembalikan hasil
  recordStep(
    18, // Baris 19
    null,
    distances,
    previous,
    visited,
    queue,
    null,
    null,
    relaxedEdges,
    "Algoritme Dijkstra selesai. Rute terpendek berhasil dipetakan secara optimal!"
  );

  return steps;
}

// Fungsi Pencarian Jalur Terpendek
// Pemecah langsung sederhana untuk segera mendapatkan rute terpendek (misal untuk kalkulasi instan saat menyeret gedung atau mengubah lalu lintas)
export function getShortestPath(
  nodes: Building[],
  edges: Road[],
  sourceId: string,
  targetId: string,
  mode: 'shortest' | 'fastest' = 'fastest'
): { path: string[]; distance: number } {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  for (const node of nodes) { // Iterasi sebanyak N (jumlah node)
    distances[node.id] = Infinity; // Operasi penugasan: O(1)
    previous[node.id] = null; // Operasi penugasan: O(1)
    unvisited.add(node.id); // Operasi penambahan set: O(1)
  }
  distances[sourceId] = 0; // Operasi penugasan: O(1)

  const getNeighbors = (uId: string) => {
    const neighbors: { neighborId: string; weight: number }[] = [];
    for (const edge of edges) {
      if (edge.isClosed) continue;
      if (edge.fromId === uId) {
        neighbors.push({ neighborId: edge.toId, weight: getEffectiveWeight(edge, mode) });
      } else if (edge.toId === uId) {
        neighbors.push({ neighborId: edge.fromId, weight: getEffectiveWeight(edge, mode) });
      }
    }
    return neighbors;
  };

  while (unvisited.size > 0) {
    // Cari titik dengan jarak terkecil
    let currentId: string | null = null;
    let minDistance = Infinity;
    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    }

    if (currentId === null || currentId === targetId || minDistance === Infinity) {
      break;
    }

    unvisited.delete(currentId); // Operasi penghapusan set: O(1)

    const neighbors = getNeighbors(currentId); // Operasi pencarian: O(1)
    for (const { neighborId, weight } of neighbors) { // Iterasi sebanyak E (jumlah edge)
      if (!unvisited.has(neighborId)) continue; // Operasi pencarian: O(1)
      const alt = distances[currentId] + weight; // Operasi penambahan: O(1)
      if (alt < distances[neighborId]) { // Operasi perbandingan: O(1)
        distances[neighborId] = alt; // Operasi penugasan: O(1)
        previous[neighborId] = currentId; // Operasi penugasan: O(1)
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = targetId;
  if (distances[targetId] !== Infinity) {
    while (curr !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  return {
    path: path[0] === sourceId ? path : [],
    distance: distances[targetId] === Infinity ? 0 : distances[targetId],
  };
}
