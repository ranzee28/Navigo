import { Building, Road } from '../types';

// Data Gedung dan Jalan Default untuk Demonstrasi
// (Data Gedung dan Jalan Default untuk Demonstrasi)

export const DEFAULT_BUILDINGS: Building[] = [
  { id: 'cafeteria', name: 'Kantin Pusat (Pusat Pengiriman)', x: 100, y: 250, type: 'cafeteria' },
  { id: 'student_union', name: 'Gedung Kegiatan Mahasiswa', x: 260, y: 150, type: 'admin' },
  { id: 'library', name: 'Perpustakaan Utama', x: 300, y: 350, type: 'library' },
  { id: 'science_hall', name: 'Fakultas Sains & Teknologi', x: 480, y: 100, type: 'classroom' },
  { id: 'engineering_hall', name: 'Laboratorium Teknik', x: 500, y: 260, type: 'classroom' },
  { id: 'admin_center', name: 'Gedung Rektorat (Admin)', x: 450, y: 420, type: 'admin' },
  { id: 'gym', name: 'Gedung Olahraga (GOR)', x: 680, y: 400, type: 'gym' },
  { id: 'dorm_a', name: 'Asrama Putra Blok A', x: 720, y: 150, type: 'dormitory' },
  { id: 'dorm_b', name: 'Asrama Putri Blok B', x: 850, y: 280, type: 'dormitory' },
  { id: 'quad_park', name: 'Taman Hijau Kampus', x: 320, y: 240, type: 'park' },
];

export const DEFAULT_ROADS: Road[] = [
  { id: 'road1', fromId: 'cafeteria', toId: 'student_union', weight: 4.5, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road2', fromId: 'cafeteria', toId: 'library', weight: 3.8, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road3', fromId: 'cafeteria', toId: 'quad_park', weight: 5.0, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road4', fromId: 'student_union', toId: 'science_hall', weight: 5.2, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road5', fromId: 'student_union', toId: 'quad_park', weight: 2.5, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road6', fromId: 'library', toId: 'quad_park', weight: 2.8, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road7', fromId: 'library', toId: 'admin_center', weight: 4.2, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road8', fromId: 'quad_park', toId: 'science_hall', weight: 4.8, trafficMultiplier: 1.2, isClosed: false },
  { id: 'road9', fromId: 'quad_park', toId: 'engineering_hall', weight: 3.5, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road10', fromId: 'quad_park', toId: 'admin_center', weight: 4.0, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road11', fromId: 'science_hall', toId: 'dorm_a', weight: 6.0, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road12', fromId: 'science_hall', toId: 'engineering_hall', weight: 3.2, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road13', fromId: 'engineering_hall', toId: 'dorm_a', weight: 4.8, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road14', fromId: 'engineering_hall', toId: 'gym', weight: 5.0, trafficMultiplier: 1.5, isClosed: false },
  { id: 'road15', fromId: 'admin_center', toId: 'gym', weight: 3.9, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road16', fromId: 'gym', toId: 'dorm_b', weight: 4.2, trafficMultiplier: 1.0, isClosed: false },
  { id: 'road17', fromId: 'dorm_a', toId: 'dorm_b', weight: 3.0, trafficMultiplier: 1.0, isClosed: false },
];

export const BUILDING_TYPES: Building['type'][] = [
  'classroom',
  'dormitory',
  'library',
  'gym',
  'admin',
  'park'
];

export const BUILDING_NAMES: Record<Building['type'], string[]> = {
  cafeteria: ['Kantin Utama', 'Kantin Barat', 'Kantin Danau', 'Kafe Utara'],
  dormitory: ['Asrama Alpha', 'Asrama Beta', 'Wisma Pinus', 'Griya Akasia', 'Pondok Mapel'],
  library: ['Perpustakaan Milton', 'Perpustakaan Sains', 'Pusat Riset', 'Ruang Baca Bersama'],
  classroom: ['Gedung Perkuliahan A', 'Lab Fisika Dasar', 'Gedung Sastra', 'Lab Biologi', 'Sekolah Bisnis'],
  gym: ['Pusat Kebugaran', 'GOR Bulutangkis', 'Kolam Renang Kampus', 'Studio Senam'],
  admin: ['Gedung Administrasi', 'Pusat Layanan Mahasiswa', 'Gedung Rektorat', 'Gedung Dekanat'],
  park: ['Taman Lingkar', 'Taman Zen', 'Hutan Kota Mini', 'Taman Danau'],
};

export function generateRandomCampusMap(nodeCount: number = 10): { buildings: Building[]; roads: Road[] } {
  const buildings: Building[] = [];
  const roads: Road[] = [];
  
  // Atur dimensi canvas (Set the canvas size)
  const width = 850;
  const height = 400;

  // 1. Tambahkan paksa Kantin sebagai titik asal di sebelah kiri (1. Force add a Cafeteria as source node on the left)
  buildings.push({
    id: 'cafeteria',
    name: 'Kantin Pusat (Pusat Pengiriman)',
    x: 60,
    y: 200,
    type: 'cafeteria',
  });

  // 2. Buat gedung-gedung lain tersebar rapi dari kiri ke kanan (2. Generate other buildings spread out nicely from left to right)
  let dormCount = 0;

  for (let i = 1; i < nodeCount; i++) {
    const fraction = i / (nodeCount - 1);
    const x = Math.round(150 + fraction * (width - 250) + (Math.random() * 40 - 20));
    const y = Math.round(50 + Math.random() * (height - 100));

    // Pilih tipe gedung berdasarkan tingkat sebaran (Choose type based on progress)
    let type: Building['type'] = 'classroom';
    if (fraction > 0.7 && dormCount < 2) {
      type = 'dormitory';
      dormCount++;
    } else {
      const types: Building['type'][] = ['classroom', 'library', 'gym', 'admin', 'park'];
      type = types[Math.floor(Math.random() * types.length)];
    }

    const nameList = BUILDING_NAMES[type];
    const baseName = nameList[Math.floor(Math.random() * nameList.length)];
    const uniqueSuffix = ` #${i}`;
    
    buildings.push({
      id: `building_${i}`,
      name: `${baseName}${uniqueSuffix}`,
      x,
      y,
      type,
    });
  }

  // Pastikan minimal ada satu gedung asrama (Ensure we have at least one dormitory)
  if (!buildings.some(b => b.type === 'dormitory')) {
    const lastNode = buildings[buildings.length - 1];
    lastNode.type = 'dormitory';
    lastNode.name = 'Asrama Nusantara';
  }

  // 3. Hubungkan jalan untuk memastikan tidak ada gedung yang terisolasi (3. Connect roads ensuring no disconnected nodes)
  const maxDistance = 250;
  let edgeIdCounter = 1;

  for (let i = 0; i < buildings.length; i++) {
    const b1 = buildings[i];
    const distances = buildings
      .map((b, idx) => ({ idx, dist: Math.hypot(b.x - b1.x, b.y - b1.y) }))
      .filter(item => item.idx !== i)
      .sort((a, b) => a.dist - b.dist);

    const connectionsCount = Math.min(2 + Math.floor(Math.random() * 2), distances.length);
    for (let c = 0; c < connectionsCount; c++) {
      const b2Idx = distances[c].idx;
      const b2 = buildings[b2Idx];
      const dist = Math.round(distances[c].dist / 30 * 10) / 10;

      const exists = roads.some(
        r => (r.fromId === b1.id && r.toId === b2.id) || (r.fromId === b2.id && r.toId === b1.id)
      );

      if (!exists && distances[c].dist < maxDistance) {
        roads.push({
          id: `road_${edgeIdCounter++}`,
          fromId: b1.id,
          toId: b2.id,
          weight: dist,
          trafficMultiplier: 1.0,
          isClosed: false,
        });
      }
    }
  }

  // Periksa kembali untuk memastikan semua gedung terhubung (Double check that every node is connected)
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    const isConnected = roads.some(r => r.fromId === b.id || r.toId === b.id);
    if (!isConnected) {
      const distances = buildings
        .map((other, idx) => ({ idx, dist: Math.hypot(other.x - b.x, other.y - b.y) }))
        .filter(item => item.idx !== i)
        .sort((a, b) => a.dist - b.dist);

      if (distances.length > 0) {
        const closestIdx = distances[0].idx;
        const closest = buildings[closestIdx];
        roads.push({
          id: `road_${edgeIdCounter++}`,
          fromId: b.id,
          toId: closest.id,
          weight: Math.round(distances[0].dist / 30 * 10) / 10,
          trafficMultiplier: 1.0,
          isClosed: false,
        });
      }
    }
  }

  return { buildings, roads };
}
