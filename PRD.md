# Product Requirement Document (PRD)
## Sistem Simulasi & Visualisasi Rute Tercepat (Dijkstra Algorithm)

---

### 1. Ringkasan Proyek (Project Overview)
Aplikasi ini adalah platform interaktif berbasis web untuk memvisualisasikan cara kerja algoritma Dijkstra dalam menyelesaikan masalah pencarian rute terpendek/tercepat secara real-time. Aplikasi didesain secara spesifik menggunakan tema simulasi pengantaran makanan (food delivery), di mana pengguna bertindak sebagai analis lalu lintas atau pengelola rute logistik untuk membantu kurir menemukan rute paling optimal dari gedung asal ke gedung tujuan.

Sistem mendukung dinamika dunia nyata seperti kemacetan lalu lintas, penutupan jalan secara mendadak, serta modifikasi graf secara penuh (menambah/menghapus gedung dan jalan secara interaktif).

---

### 2. Tujuan & Sasaran (Objectives & Goals)
- **Visualisasi Edukatif & Interaktif**: Mempermudah pengguna memahami konsep struktur data graf (Node & Edge) dan cara kerja algoritma Dijkstra melalui animasi langkah demi langkah (step-by-step).
- **Simulasi Dinamis Dunia Nyata**: Mengintegrasikan variabel eksternal seperti tingkat kemacetan lalu lintas (Traffic Multiplier) dan status pemblokiran jalan (Road Closures).
- **Manipulasi Graf Tanpa Hambatan (Smooth Editor)**: Menyediakan fungsionalitas editor peta yang intuitif (menambah, menghapus, menggeser gedung dengan drag-and-drop yang sangat mulus, dan mengedit bobot jalan langsung melalui input overlay).
- **Ruang Observasi Maksimal**: Menyediakan opsi layar penuh (Fullscreen) untuk menyembunyikan elemen kontrol/analisis samping sehingga pengguna dapat berfokus sepenuhnya pada visualisasi peta.

---

### 3. Fitur Utama (Key Features)

#### A. Interactive Map Canvas (SVG-based Editor)
- **Sistem Zoom & Pan Berbasis Titik Fokus**: Memungkinkan navigasi peta besar secara fleksibel menggunakan scroll mouse atau tombol kontrol.
- **Drag & Drop Gedung (Node) yang Mulus**: Pengoptimalan performa menggunakan penempatan koordinat instan berbasis bounding rect cache untuk menghilangkan stuttering saat memindahkan gedung.
- **Penyuntingan Bobot Jalan (Edge Weight) Langsung**: Menggunakan integrasi elemen `<foreignObject>` untuk memunculkan input numerik langsung di atas jalan yang dipilih (klik dalam mode Select atau double-click), mempermudah penyesuaian jarak secara cepat.
- **Visualisasi Arus Pengiriman**: Animasi kurir bergerak di sepanjang rute hasil kalkulasi Dijkstra dari gedung awal menuju tujuan secara dinamis.

#### B. Toolset Peta Terintegrasi
- **Select (Pilih/Edit)**: Memilih jalan untuk mengubah bobot manual.
- **Add Node (Tambah Gedung)**: Klik pada area kosong peta untuk mendirikan gedung baru dengan nama kustom.
- **Add Road (Hubungkan Jalan)**: Menarik garis penghubung antar-gedung untuk membuat rute baru.
- **Toggle Traffic (Ubah Kepadatan)**: Mengubah level kemacetan jalan secara siklik (Lancar -> Kepadatan Sedang -> Kemacetan Tinggi -> Macet Total).
- **Toggle Closure (Tutup/Buka Jalan)**: Memblokir atau membuka kembali akses jalan untuk memaksa algoritma Dijkstra menghitung rute alternatif secara instan.
- **Delete (Penghapus)**: Menghapus gedung atau jalan secara selektif dari peta.

#### C. Algoritma Dijkstra & Simulator Langkah (Step Explorer)
- **Eksekusi Seketika (Instant Solve)**: Menemukan dan menampilkan jalur terpendek dalam hitungan milidetik dengan garis warna hijau terang yang kontras.
- **Mode Putar Simulasi (Simulation Mode)**: Memvisualisasikan eksplorasi algoritma secara bertahap (node mana yang sedang diproses, antrean prioritas, dan pembaruan jarak sementara).
- **Panel Pseudocode**: Menampilkan baris kode algoritma Dijkstra yang aktif selaras dengan animasi langkah visual untuk memperdalam pemahaman teoritis.

#### D. Sistem Manajemen Insiden Dinamis
- **Simulasi Insiden Acak (Random Incidents)**: Tombol instan untuk menghasilkan kemacetan atau penutupan jalan secara acak guna menguji ketahanan rute pengantaran.
- **Normalisasi Lalu Lintas**: Reset global untuk mengembalikan seluruh kondisi jalan ke status normal (bebas hambatan).

#### E. Fitur Premium Terbaru (Optimasi Pengalaman Pengguna)
- **Sistem Notifikasi Ringkas (Toast Notification System)**:
  - Memunculkan notifikasi pop-up kecil, modern, dan informatif di sudut kanan bawah saat terjadi perubahan kondisi lalu lintas secara tiba-tiba (misal: "Jalan Ditutup 🚫", "Kemacetan Terdeteksi 🚦").
  - Memiliki kode warna yang konsisten dengan peta (Amber untuk kemacetan, Rose untuk penutupan jalan, Emerald untuk pembersihan jalur/sukses).
  - Menggunakan animasi transisi `motion` untuk masuk dan keluar layar dengan elegan.
- **Mode Layar Penuh (Fullscreen Button)**:
  - Tombol khusus di sudut Map Canvas untuk menyembunyikan bilah sisi kiri (Control Panel) dan kanan (Data & Analytics) secara instan.
  - Memberikan luas pandang maksimal untuk fokus mengobservasi simulasi rute pada layar beresolusi rendah maupun tinggi.

---

### 4. Detail Arsitektur & Teknologi

- **Frontend Framework**: React 18+ (TypeScript) dengan Vite sebagai builder utama.
- **Styling**: Tailwind CSS untuk keseluruhan tata letak modern berorientasi kontras tinggi (Inter untuk teks umum & JetBrains Mono untuk metrik data).
- **Animasi**: Framer Motion (`motion/react`) untuk transisi panel samping, efek detak lalu lintas (ping), dan notifikasi toast.
- **Manajemen State**: React State & Context yang dilokalisasi untuk performa rendering tinggi. Perhitungan Dijkstra ditulis dalam TypeScript murni (`/src/algorithms/dijkstra.ts`) untuk memisahkan logika kalkulasi dengan representasi UI.

---

### 5. Alur Pengguna (User Flow)
1. **Inisialisasi**: Pengguna membuka aplikasi dan disajikan dengan skenario peta default.
2. **Konfigurasi Rute**: Pengguna memilih Gedung Pengirim (Asal) dan Gedung Penerima (Tujuan).
3. **Analisis Awal**: Sistem langsung menggambar rute optimal tercepat lengkap dengan kalkulasi waktu tempuh dan jarak total.
4. **Modifikasi Kondisi**: Pengguna menutup salah satu jalan utama menggunakan tool "Toggle Closure".
5. **Respons Sistem**:
   - Peta langsung memicu pembaruan rute tercepat alternatif.
   - Peringatan instan muncul di log sistem.
   - Notifikasi Toast muncul di kanan bawah memberi tahu penutupan rute secara visual.
6. **Observasi Mendalam**: Pengguna mengklik tombol "Fullscreen" untuk menyembunyikan kontrol samping, memperbesar peta, dan menjalankan animasi perjalanan kurir makanan dengan visual yang bersih dan lega.

---

*Dokumen PRD ini dirancang untuk memastikan keselarasan pengembangan fitur dan menjaga standar kualitas visual serta kemudahan interaksi pengguna tetap berada pada level tertinggi.*
