# Running SafeLinkU on VPS

Complete guide untuk deploy dan run `safelinku.js` di VPS (Ubuntu/Debian).

## Prerequisites

- VPS dengan minimal 2GB RAM
- Ubuntu 20.04+ atau Debian 10+
- SSH access ke VPS
- Node.js 16+ installed

## Step 1: Install System Dependencies

```bash
# Update package list
sudo apt-get update

# Install Chromium and required libraries
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

## Step 2: Install Node.js (if not installed)

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 3: Upload Project Files

### Option A: Using SCP
```bash
# From your local machine
scp -r vizey user@your-vps-ip:/home/user/
```

### Option B: Using Git
```bash
# On VPS
cd ~
git clone your-repo-url
cd vizey
```

## Step 4: Install Project Dependencies

```bash
cd vizey
npm install
```

## Step 5: Configure URLs

Edit file `data/safelinku.txt` dengan URLs yang ingin diproses:

```bash
nano data/safelinku.txt
```

Paste URLs, satu per line:
```
https://sfl.gl/mXSTMKoX
https://sfl.gl/ucSVUfFT
https://sfl.gl/LMv8mHzE
...
```

## Step 6: Adjust Configuration (Optional)

Edit `safelinku.js` untuk tuning performance:

```javascript
const CONFIG = {
    useProxy: true,
    headless: 'new',
    timeout: 40000,
    stepDelay: 2000,
    countdownDelay: 10,
    maxRetries: 5,
    concurrency: 10,  // Increase untuk VPS powerful
};
```

**Recommendations:**
- **2 CPU cores**: `concurrency: 5`
- **4 CPU cores**: `concurrency: 10`
- **8+ CPU cores**: `concurrency: 15-20`

## Step 7: Run Script

### Option A: Foreground (for testing)
```bash
npm run safelink
```

### Option B: Background with nohup
```bash
nohup npm run safelink > safelink.log 2>&1 &

# Check logs
tail -f safelink.log

# Check process
ps aux | grep safelinku.js
```

### Option C: Using Screen (Recommended)
```bash
# Install screen
sudo apt-get install screen

# Start new screen session
screen -S safelink

# Run script
npm run safelink

# Detach from screen: Ctrl+A then D

# Reattach later
screen -r safelink

# List sessions
screen -ls
```

### Option D: Using PM2 (Production)
```bash
# Install PM2
sudo npm install -g pm2

# Start script
pm2 start npm --name "safelink" -- run safelink

# Check status
pm2 status

# View logs
pm2 logs safelink

# Stop
pm2 stop safelink

# Restart
pm2 restart safelink

# Auto-start on VPS reboot
pm2 startup
pm2 save
```

## Step 8: Monitor Progress

### View Logs
```bash
# If using nohup
tail -f safelink.log

# If using PM2
pm2 logs safelink

# If using screen
screen -r safelink
```

### Monitor System Resources
```bash
# Install htop
sudo apt-get install htop

# Monitor CPU & Memory
htop

# Check disk space
df -h
```

## Step 9: Stop Script

### If running in foreground
```bash
Ctrl+C
```

### If running with nohup
```bash
# Find process ID
ps aux | grep safelinku.js

# Kill process
kill <PID>
```

### If using screen
```bash
screen -r safelink
# Then press Ctrl+C
```

### If using PM2
```bash
pm2 stop safelink
```

## Expected Output

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

## Troubleshooting

### Error: "No usable sandbox!"
```bash
# Add to browser args (already included)
--no-sandbox
--disable-setuid-sandbox
```

### Error: "Cannot find module chromium"
```bash
# Install chromium
sudo apt-get install chromium-browser
```

### Error: "Failed to launch browser"
```bash
# Install missing dependencies
sudo apt-get install -y libgbm-dev libnss3 libatk-bridge2.0-0
```

### High Memory Usage
```bash
# Reduce concurrency
concurrency: 3  # Instead of 10
```

### Script Hangs
```bash
# Reduce timeout
timeout: 30000  # Instead of 40000
```

## Performance Tips

1. **Use PM2** - Auto-restart on crash, log management
2. **Increase concurrency** - Based on CPU cores
3. **Monitor memory** - Use `htop` to watch usage
4. **Use screen/tmux** - Keep session alive after SSH disconnect
5. **Regular cleanup** - Clear logs periodically

## Security Notes

- ✅ Script uses proxies (VPS IP hidden)
- ✅ Headless mode (no GUI required)
- ✅ No sensitive data logged
- ⚠️ Keep `safelinku.txt` secure (contains URLs)

## Automation

### Cron Job (Run daily at 2 AM)
```bash
# Edit crontab
crontab -e

# Add line:
0 2 * * * cd /home/user/vizey && /usr/bin/npm run safelink >> /home/user/vizey/cron.log 2>&1
```

### PM2 Auto-restart on Crash
```bash
pm2 start npm --name "safelink" --max-restarts 3 -- run safelink
```

## Support

For issues, check:
1. System logs: `journalctl -xe`
2. Application logs: `pm2 logs safelink`
3. Memory usage: `free -h`
4. Disk space: `df -h`

---

**Ready to deploy!** 🚀