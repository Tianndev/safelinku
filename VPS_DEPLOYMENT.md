# Menjalankan SafeLinkU di VPS

Panduan lengkap untuk deploy dan menjalankan `main.js` di VPS (Ubuntu/Debian).

## Prasyarat

- VPS dengan minimal 2GB RAM
- Ubuntu 20.04+ atau Debian 10+
- Akses SSH ke VPS
- Node.js 16+ terinstal

## Langkah 1: Instal Dependensi Sistem

```bash
sudo apt-get update

sudo apt-get install -y \
    chromium-browser \
    libgbm-dev \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils
```

## Langkah 2: Instal Node.js (jika belum terinstal)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node --version
npm --version
```

## Langkah 3: Upload File Proyek

### Opsi A: Menggunakan SCP
```bash
scp -r safelinku user@your-vps-ip:/home/user/
```

### Opsi B: Menggunakan Git
```bash
cd ~
git clone your-repo-url
cd safelinku
```

## Langkah 4: Instal Dependensi Proyek

```bash
cd safelinku
npm install
```

## Langkah 5: Konfigurasi URL

Edit file `data/safelinku.txt` dengan URL yang ingin diproses:

```bash
nano data/safelinku.txt
```

Tempelkan URL, satu per baris:
```
https://sfl.gl/mXSTMKoX
https://sfl.gl/ucSVUfFT
https://sfl.gl/LMv8mHzE
...
```

## Langkah 6: Sesuaikan Konfigurasi (Opsional)

Edit `safelinku.js` untuk menyetel performa:

```javascript
const CONFIG = {
    useProxy: true,
    headless: 'new',
    timeout: 40000,
    stepDelay: 2000,
    countdownDelay: 10,
    maxRetries: 5,
    concurrency: 10,
};
```

**Rekomendasi:**
- **2 Core CPU**: `concurrency: 5`
- **4 Core CPU**: `concurrency: 10`
- **8+ Core CPU**: `concurrency: 15-20`

## Langkah 7: Jalankan Script

### Opsi A: Foreground (untuk pengujian)
```bash
npm run safelink
```

### Opsi B: Background dengan nohup
```bash
nohup npm run safelink > safelink.log 2>&1 &

tail -f safelink.log

ps aux | grep safelinku.js
```

### Opsi C: Menggunakan Screen (Disarankan)
```bash
sudo apt-get install screen

screen -S safelink

npm run safelink

Ctrl+A lalu D

screen -r safelink
screen -ls
```

### Opsi D: Menggunakan PM2 (Produksi)
```bash
sudo npm install -g pm2

pm2 start npm --name "safelink" -- run safelink

pm2 status

pm2 logs safelink

pm2 stop safelink

pm2 restart safelink

pm2 startup
pm2 save
```

## Langkah 8: Pantau Proses

### Lihat Log
```bash
tail -f safelink.log
pm2 logs safelink
screen -r safelink
```

### Pantau Sumber Daya Sistem
```bash
sudo apt-get install htop

htop
df -h
```

## Langkah 9: Hentikan Script

### Jika berjalan di foreground
```bash
Ctrl+C
```

### Jika berjalan dengan nohup
```bash
ps aux | grep safelinku.js
kill <PID>
```

### Jika menggunakan screen
```bash
screen -r safelink
```

### Jika menggunakan PM2
```bash
pm2 stop safelink
```

## Output yang Diharapkan

```
Proxy Mode  : SOCKS (Enabled)
Available   : 1039 proxies
Source File : safelinku.txt
Total URLs  : 1000
Concurrency : 10 workers

ˢᵃᶠᵉˡⁱⁿᵏᵘ URL-1 | SUCCESS | 199.102.104.70:4145
ˢᵃᶠᵉˡⁱⁿᵏᵘ URL-3 | SUCCESS | 72.195.114.184:4145
ˢᵃᶠᵉˡⁱⁿᵏᵘ URL-2 | SUCCESS | 5.42.87.164:56789
...

══════════════════════════════════════════════════════════════════════
                          FINAL REPORT
══════════════════════════════════════════════════════════════════════

Total URLs      : 1000
Successful      : 987
Failed          : 13
Success Rate    : 98.7%
Total Duration  : 125.3s
Avg Duration    : 12.5s/url

══════════════════════════════════════════════════════════════════════
```

## Pemecahan Masalah

### Error: "No usable sandbox!"
```bash
--no-sandbox
--disable-setuid-sandbox
```

### Error: "Cannot find module chromium"
```bash
sudo apt-get install chromium-browser
```

### Error: "Failed to launch browser"
```bash
sudo apt-get install -y libgbm-dev libnss3 libatk-bridge2.0-0
```

### Penggunaan Memori Tinggi
```bash
concurrency: 5
```

### Script Macet (Hangs)
```bash
timeout: 30000
```

## Tips Performa

1. **Gunakan PM2** - Restart otomatis saat crash, manajemen log
2. **Tingkatkan concurrency** - Berdasarkan core CPU
3. **Pantau memori** - Gunakan `htop` untuk melihat penggunaan
4. **Gunakan screen/tmux** - Jaga sesi tetap hidup setelah SSH terputus
5. **Pembersihan rutin** - Hapus log secara berkala

## Catatan Keamanan

- ✅ Script menggunakan proxy (IP VPS tersembunyi)
- ✅ Mode headless (tidak memerlukan GUI)
- ✅ Tidak ada data sensitif yang dicatat
- ⚠️ Jaga keamanan `safelinku.txt` (poin ini berisi URL)

## Otomatisasi

### Cron Job (Jalankan setiap jam 2 pagi)
```bash
crontab -e

0 2 * * * cd /home/user/safelinku && /usr/bin/npm run safelink >> /home/user/safelinku/cron.log 2>&1
```

### PM2 Auto-restart saat Crash
```bash
pm2 start npm --name "safelink" --max-restarts 3 -- run safelink
```

## Bantuan

Untuk masalah, periksa:
1. Log sistem: `journalctl -xe`
2. Log aplikasi: `pm2 logs safelink`
3. Penggunaan memori: `free -h`
4. Ruang disk: `df -h`

---

**Siap untuk deploy!**

---
Licensed by Dakila Universe