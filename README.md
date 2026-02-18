# SafeLinkU Automation Tool

Alat ini mengotomatiskan proses navigasi URL SafeLinkU, dirancang untuk tujuan pengujian dan simulasi traffic. Fitur utamanya mencakup dukungan rotasi proxy, pemrosesan multi-threading untuk konkurensi, dan otomatisasi browser menggunakan Puppeteer.

## Fitur

- **Navigasi Otomatis**: Menangani seluruh alur navigasi tautan SafeLinkU.
- **Dukungan Proxy**: Secara otomatis mengambil dan menggunakan proxy SOCKS4/5 untuk menyembunyikan alamat IP.
- **Pemrosesan Konkuren**: Mendukung eksekusi multi-thread untuk memproses banyak URL secara bersamaan.
- **Kemampuan Stealth**: Mengimplementasikan berbagai teknik untuk menghindari mekanisme deteksi bot.
- **Operasi Headless**: Berjalan di latar belakang tanpa antarmuka browser yang terlihat untuk efisiensi.

## Prasyarat

Pastikan perangkat lunak berikut terinstal di sistem Anda sebelum melanjutkan:

- **Node.js**: Versi 16.0.0 atau lebih tinggi.
- **NPM**: Node Package Manager (biasanya disertakan dengan Node.js).
- **Git**: Untuk mengkloning repositori.
- **Koneksi Internet Stabil**: Diperlukan untuk pengambilan proxy dan navigasi.

## Instalasi

Ikuti langkah-langkah ini untuk menyiapkan proyek secara lokal:

1.  **Clone Repositori**

    ```bash
    git clone https://github.com/DakilaUniverse/safelinku.git
    cd safelinku
    ```

2.  **Instal Dependensi**

    Instal paket Node.js yang diperlukan dengan menjalankan:

    ```bash
    npm install
    ```

    Perintah ini akan menginstal Puppeteer, agen proxy, dan pustaka lain yang diperlukan yang didefinisikan dalam `package.json`.

## Konfigurasi

### URL Target

Buat file bernama `safelinku.txt` di dalam direktori `data`. Tambahkan URL SafeLinkU target, satu per baris. Jika direktori tidak ada, buat terlebih dahulu.

**Jalur File:** `data/safelinku.txt`

**Contoh Konten:**
```text
https://sfl.gl/contoh1
https://sfl.gl/contoh2
https://sfl.gl/contoh3
```

### Pengaturan Lanjutan

Anda dapat menyesuaikan parameter operasional dengan memodifikasi objek `CONFIG` di dalam file `main.js`:

```javascript
const CONFIG = {
    useProxy: true,       // Set ke false untuk menonaktifkan penggunaan proxy
    headless: 'new',      // 'new' untuk mode headless, false untuk browser terlihat
    timeout: 40000,       // Waktu maksimum (ms) menunggu operasi
    stepDelay: 500,       // Jeda (ms) antar langkah navigasi
    countdownDelay: 10,   // Durasi hitung mundur (detik) pada halaman
    maxRetries: 2,        // Upaya percobaan ulang maksimum untuk URL yang gagal
    concurrency: 5,       // Jumlah instansi browser konkuren
};
```

## Penggunaan

Untuk memulai proses otomatisasi, jalankan perintah berikut di terminal Anda:

```bash
npm run safelink
```

Aplikasi akan menginisialisasi, mengambil proxy yang tersedia, dan mulai memproses URL yang terdaftar di `data/safelinku.txt`. Kemajuan dan status akan ditampilkan di konsol.

## Penafian

Perangkat lunak ini disediakan hanya untuk tujuan pendidikan dan pengujian. Penulis tidak bertanggung jawab atas penyalahgunaan alat ini atau atas konsekuensi apa pun yang diakibatkan oleh penggunaannya. Pengguna bertanggung jawab penuh untuk memastikan tindakan mereka mematuhi semua hukum dan ketentuan layanan yang berlaku.

## Lisensi

Hak Cipta © 2026 **Dakila Universe**. Semua Hak Dilindungi.

Penyalinan, modifikasi, distribusi, atau penggunaan perangkat lunak ini secara tidak sah sangat dilarang tanpa izin tertulis dari pemegang hak cipta.