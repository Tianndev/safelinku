# SafeLinkU Link Navigator

Solusi otomatisasi navigasi tautan SafeLinkU yang dibangun di atas Puppeteer. Dirancang dengan arsitektur multi-worker konkuren, rotasi proxy SOCKS otomatis, dan emulasi browser mobile untuk memastikan keandalan navigasi yang optimal.

## Fitur

- **Navigasi Otomatis** — Mengelola seluruh alur navigasi tautan SafeLinkU dari awal hingga selesai.
- **Rotasi Proxy SOCKS** — Mengambil dan merotasi proxy SOCKS4/5 dari sumber publik secara otomatis.
- **Pemrosesan Konkuren** — Menjalankan beberapa worker secara paralel untuk throughput maksimal.
- **Emulasi Browser Mobile** — Mensimulasikan perilaku browser mobile nyata untuk navigasi yang konsisten dan andal.
- **Filter Iklan** — Memblokir request domain iklan secara otomatis untuk mempercepat waktu muat halaman.
- **Operasi Headless** — Berjalan sepenuhnya di latar belakang tanpa antarmuka visual.

![Preview Tools](data/image.png)

## Prasyarat

Pastikan perangkat lunak berikut telah terpasang sebelum memulai:

- **Node.js** `>= 16.0.0`
- **NPM** — Node Package Manager (sudah termasuk dalam paket Node.js)
- **Git** — Untuk mengkloning repositori
- **Koneksi Internet Stabil** — Diperlukan untuk pengambilan proxy dan proses navigasi

## Instalasi

1. **Clone Repositori**

    ```bash
    git clone https://github.com/Tianndev/safelinku.git
    cd safelinku
    ```

2. **Instal Dependensi**

    ```bash
    npm install
    ```

## Konfigurasi

### Daftar URL

Buat file `safelinku.txt` di dalam direktori `data/`, lalu isi dengan URL SafeLinkU target — satu URL per baris.

**Lokasi:** `data/safelinku.txt`

```text
https://sfl.gl/contoh1
https://sfl.gl/contoh2
https://sfl.gl/contoh3
```

### Parameter Lanjutan

Sesuaikan konfigurasi melalui objek `CONFIG` di dalam `main.js`:

```javascript
const CONFIG = {
    useProxy: true,       // Aktifkan/nonaktifkan proxy
    headless: 'new',      // 'new' = headless, false = tampilkan browser
    timeout: 40000,       // Batas waktu operasi (ms)
    stepDelay: 500,       // Jeda antar langkah navigasi (ms)
    countdownDelay: 10,   // Durasi hitung mundur pada halaman (detik)
    maxRetries: 2,        // Batas percobaan ulang untuk URL yang gagal
    concurrency: 5,       // Jumlah worker yang berjalan bersamaan
};
```

## Penggunaan

```bash
npm run safelink
```

Setelah dijalankan, aplikasi akan mengambil daftar proxy, lalu mulai memproses setiap tautan secara konkuren. Status dan laporan akhir akan ditampilkan langsung di terminal.

## Penafian

Perangkat lunak ini disediakan semata-mata untuk keperluan riset, edukasi, dan pengujian teknis. Penulis tidak bertanggung jawab atas segala bentuk penyalahgunaan atau konsekuensi yang timbul dari penggunaan alat ini. Pengguna sepenuhnya bertanggung jawab untuk memastikan kepatuhan terhadap hukum dan ketentuan layanan yang berlaku.

## Lisensi

Hak Cipta © 2026 **Dakila Universe**. Semua Hak Dilindungi.

Dilarang keras menyalin, memodifikasi, mendistribusikan, atau menggunakan perangkat lunak ini tanpa izin tertulis dari pemegang hak cipta.
