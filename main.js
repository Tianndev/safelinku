const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonUA = require('puppeteer-extra-plugin-anonymize-ua');
const UserPreferences = require('puppeteer-extra-plugin-user-preferences');
const randomUseragent = require('random-useragent');
const chalk = require('chalk');
const os = require('os');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

puppeteer.use(StealthPlugin());
puppeteer.use(AnonUA());
puppeteer.use(UserPreferences({
    userPrefs: {
        general: {
            useragent: {
                override: randomUseragent.getRandom()
            }
        }
    }
}));

const CONFIG = {
    useProxy: true,
    safelinkFile: path.join(__dirname, 'data/safelinku.txt'),
    headless: 'new',
    timeout: 40000,
    stepDelay: 500,
    countdownDelay: 10,
    maxRetries: 2,
    concurrency: 5,
};

const urlStats = {};
const failedProxies = new Set();
let requestCounter = 0;

function colorizeText(text, currentCount) {
    const colors = ['cyan', 'blue', 'magenta', 'yellow', 'green', 'red'];
    const chars = text.split('');
    const charsToColor = (currentCount % (chars.length + 1)) || chars.length;

    let result = '';
    for (let i = 0; i < chars.length; i++) {
        if (i < charsToColor) {
            result += chalk[colors[i % colors.length]].bold(chars[i]);
        } else {
            result += chalk.gray(chars[i]);
        }
    }

    return result;
}

function formatProxy(proxyUrl) {
    if (!proxyUrl) return 'Direct';
    return proxyUrl
        .replace('http://', '')
        .replace('https://', '')
        .replace('socks4://', '')
        .replace('socks5://', '');
}

function logProgress(urlId, message, proxy, color) {
    requestCounter++;
    const colorFn = chalk[color]?.bold || chalk.white.bold;
    const coloredPrefix = colorizeText('ˢᵃᶠᵉˡⁱⁿᵏᵘ', requestCounter);
    console.log(`${coloredPrefix} ${colorFn(urlId)} | ${colorFn(message)} | ${colorFn(formatProxy(proxy))}`);
}

function displayBanner() {
    const asciiArt = [
        "⠀⠀⠀⢠⣾⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀safelinku.js",
        "⠀⠀⣰⣿⣿⣿⣿⣷⡀⠀⠀⠀   ⠀       ⠀⠀⠀⠀⠀⠀⠀⠀",
        "⠀⢰⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
        "⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⣄⣀⣀⣤⣤⣶⣾⣿⣿⣿⡷",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀",
        "⣿⣿⣿⡇⠀⡾⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣧⡀⠁⣀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠉⢹⠉⠙⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣀⠀⣀⣼⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠀⠤⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⣿⣿⠿⣿⣿⣿⣿⣿⣿⣿⠿⠋⢃⠈⠢⡁⠒⠄⡀⠈⠁⠀⠀⠀⠀⠀⠀⠀",
        "⣿⣿⠟⠁⠀⠀⠈⠉⠉⠁⠀⠀⠀⠀⠈⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
        "⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"
    ];

    const platformNames = {
        'darwin': `macOS ${os.release()}`,
        'win32': `Windows ${os.release()}`,
        'linux': `Linux ${os.release()}`,
        'freebsd': `FreeBSD ${os.release()}`,
        'openbsd': `OpenBSD ${os.release()}`,
        'sunos': `SunOS ${os.release()}`,
        'aix': `AIX ${os.release()}`
    };

    const info = [
        { label: 'Name', value: 'SAFELINKU BYPASS' },
        { label: 'Version', value: '1.0.0' },
        { label: 'Author', value: 'Dakila Universe' },
        { label: 'Engine', value: 'Puppeteer + Stealth' },
        { label: 'PID', value: process.pid },
        { label: 'Host', value: os.hostname() },
        { label: 'Mode', value: 'Browser Automation' },
        { label: 'Notes', value: "𝐵𝑜𝑟𝑛 𝑡𝑜 𝑑𝑖𝑒." },
        { label: 'Platform', value: platformNames[process.platform] || process.platform.toUpperCase() },
        { label: 'Arch', value: process.arch },
        { label: 'CPU', value: `${os.cpus().length} cores` },
        { label: 'Node', value: process.version },
        { label: 'RAM', value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(0)}MB` },
        { label: 'Proxy', value: CONFIG.useProxy ? 'Enabled' : 'Disabled' },
    ];

    console.log('');
    const startInfoLine = Math.floor((asciiArt.length - info.length) / 2);

    asciiArt.forEach((line, i) => {
        let output = chalk.magenta.bold(line);
        if (i >= startInfoLine && i < startInfoLine + info.length) {
            const infoItem = info[i - startInfoLine];
            const padding = ' '.repeat(6);
            output += padding + `${chalk.white.bold(infoItem.label.padEnd(8))}: ${chalk.green.bold(infoItem.value)}`;
        }
        console.log(output);
    });

    console.log('');
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatProxyUrl(proxy) {
    if (!proxy) return null;
    if (proxy.startsWith('http') || proxy.startsWith('socks')) return proxy;
    return `http://${proxy}`;
}

function testProxy(proxyUrl, timeoutMs = 5000) {
    return new Promise((resolve) => {
        try {
            const net = require('net');
            const url = new URL(formatProxyUrl(proxyUrl));
            const socket = net.createConnection({
                host: url.hostname,
                port: parseInt(url.port) || 1080,
                timeout: timeoutMs,
            });
            socket.on('connect', () => { socket.destroy(); resolve(true); });
            socket.on('error', () => resolve(false));
            socket.on('timeout', () => { socket.destroy(); resolve(false); });
        } catch {
            resolve(false);
        }
    });
}

async function fetchAllProxies() {
    try {
        const metaRes = await axios.get(
            'https://raw.githubusercontent.com/proxifly/free-proxy-list/refs/heads/main/proxies/meta/data.json',
            { timeout: 10000 }
        );
        const data = metaRes.data;

        console.log(chalk.white.bold('Proxy Source'));
        console.log(chalk.white.bold('========================================'));
        console.log(chalk.white.bold(`Total         : `) + chalk.cyan.bold(data.totals.all));
        console.log(chalk.white.bold(`HTTP          : `) + chalk.cyan.bold(data.totals.protocols.http) + chalk.white.bold('  | HTTPS: ') + chalk.cyan.bold(data.totals.protocols.https));
        console.log(chalk.white.bold(`SOCKS4        : `) + chalk.cyan.bold(data.totals.protocols.socks4) + chalk.white.bold('  | SOCKS5: ') + chalk.cyan.bold(data.totals.protocols.socks5));
        console.log(chalk.white.bold('========================================'));
        console.log('');

        const topCountries = Object.entries(data.totals.countries)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([cc]) => cc);

        const results = await Promise.allSettled(
            topCountries.map(cc =>
                axios.get(
                    `https://raw.githubusercontent.com/proxifly/free-proxy-list/refs/heads/main/proxies/countries/${cc}/data.json`,
                    { timeout: 10000 }
                ).then(r => ({ cc, data: r.data }))
            )
        );

        const allProxies = [];
        for (const result of results) {
            if (result.status !== 'fulfilled' || !Array.isArray(result.value.data)) continue;
            const { data: proxyList } = result.value;
            const proxies = proxyList
                .filter(p => p.protocol === 'socks4' || p.protocol === 'socks5')
                .map(p => p.proxy);
            if (proxies.length > 0) {
                allProxies.push(...proxies);
            }
        }

        const unique = [...new Set(allProxies)];

        for (let i = unique.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [unique[i], unique[j]] = [unique[j], unique[i]];
        }

        return unique;
    } catch (error) {
        return [];
    }
}

async function clickButton(page, text, description) {
    try {
        await page.waitForFunction(
            (searchText) => {
                const buttons = Array.from(document.querySelectorAll('a, button'));
                return buttons.some(btn => btn.textContent.includes(searchText));
            },
            { timeout: CONFIG.timeout },
            text
        );

        const clicked = await page.evaluate((searchText) => {
            const buttons = Array.from(document.querySelectorAll('a, button'));
            const button = buttons.find(btn => btn.textContent.includes(searchText));
            if (button) {
                button.click();
                return true;
            }
            return false;
        }, text);

        if (!clicked) {
            throw new Error(`Button "${text}" tidak ditemukan`);
        }

        return true;
    } catch (error) {
        throw new Error(`Gagal klik ${description}: ${error.message}`);
    }
}

async function extractFinalUrl(page) {
    const finalUrl = await page.evaluate(() => {
        const button = document.querySelector('button[id]');
        if (button && button.id) {
            const scripts = document.querySelectorAll('script:not([src])');
            for (const script of scripts) {
                const content = script.textContent;
                if (content.includes(button.id) && content.includes('window.location.href')) {
                    const match = content.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
                    if (match) return match[1].replace(/\\/g, '');
                }
            }
        }

        const scripts = document.querySelectorAll('script:not([src])');
        for (const script of scripts) {
            const match = script.textContent.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
            if (match) return match[1].replace(/\\/g, '');
        }
        return null;
    });
    return finalUrl;
}

async function processSafeLink(url, urlId, proxyUrl = null) {
    let browser = null;

    try {
        const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'America/Los_Angeles', 'Europe/Paris', 'Asia/Singapore'];
        const randomTimezone = timezones[Math.floor(Math.random() * timezones.length)];

        const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];

        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

        const args = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--window-size=1920,1080',
            '--disable-infobars',
            '--disable-notifications',
            '--disable-popup-blocking',
            `--lang=en-US,en`,
        ];

        if (proxyUrl) {
            args.push(`--proxy-server=${formatProxyUrl(proxyUrl)}`);
        }

        browser = await puppeteer.launch({
            headless: CONFIG.headless,
            args,
            defaultViewport: null,
            ignoreHTTPSErrors: true,
        });

        const context = browser.defaultBrowserContext();
        await context.overridePermissions('https://sfl.gl', ['geolocation', 'notifications']);

        const page = await browser.newPage();

        await page.setUserAgent(userAgent);
        await page.setViewport({ width: 1920, height: 1080 });

        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        });

        await page.evaluateOnNewDocument((tz, platform) => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'platform', { get: () => platform });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' },
                ]
            });

            Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
                value: function () {
                    const original = Intl.DateTimeFormat.prototype.resolvedOptions;
                    const result = original.call(this);
                    result.timeZone = tz;
                    return result;
                }
            });

            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: 'default' }) :
                    originalQuery(parameters)
            );

            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
            Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
            Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });

            const getParameter = WebGLRenderingContext.prototype.getParameter;
            WebGLRenderingContext.prototype.getParameter = function (parameter) {
                if (parameter === 37445) return 'Intel Inc.';
                if (parameter === 37446) return 'Intel Iris OpenGL Engine';
                return getParameter.apply(this, arguments);
            };

            const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
            HTMLCanvasElement.prototype.toDataURL = function (type) {
                const context = this.getContext('2d');
                if (context) {
                    const imageData = context.getImageData(0, 0, this.width, this.height);
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        const noise = Math.floor(Math.random() * 5) - 2;
                        imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
                        imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
                        imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
                    }
                    context.putImageData(imageData, 0, 0);
                }
                return originalToDataURL.apply(this, arguments);
            };

            delete navigator.__proto__.webdriver;
            window.chrome = {
                runtime: {},
                loadTimes: function () { },
                csi: function () { },
                app: {}
            };

            window.open = function () {
                return null;
            };
        }, randomTimezone, randomPlatform);

        page.on('error', () => { });
        page.on('pageerror', () => { });

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setCookie({
            name: 'cf_clearance',
            value: 'cookie_' + Math.random().toString(36).substring(2, 15),
            domain: '.sfl.gl',
            path: '/',
            httpOnly: false,
            secure: true,
            sameSite: 'Lax'
        });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: CONFIG.timeout
        });

        await delay(2000);

        const cloudflareChallenge = await page.$('div.cf-browser-verification');
        if (cloudflareChallenge) {
            await delay(8000);
        }

        await delay(2000);
        await clickButton(page, 'Open', 'Button Open #1');
        await delay(CONFIG.stepDelay);
        await delay(CONFIG.countdownDelay * 1000);
        await clickButton(page, 'Next', 'Button Next');
        await delay(CONFIG.stepDelay);
        await clickButton(page, 'Open', 'Button Open #2');
        await delay(5000);
        await clickButton(page, 'Open', 'Button Open #3');
        await delay(5000);
        await clickButton(page, 'Go to Link', 'Button Go to Link');
        await delay(3000);
        await page.waitForSelector('body.font-poppins', { timeout: CONFIG.timeout });
        await delay(1000);

        const finalUrl = await extractFinalUrl(page);

        if (finalUrl) {
            logProgress(urlId, `SUCCESS`, proxyUrl, 'green');
            return { success: true, finalUrl, error: null };
        } else {
            throw new Error('URL final tidak ditemukan');
        }

    } catch (error) {
        return { success: false, finalUrl: null, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function main() {
    const startTime = Date.now();
    try {
        displayBanner();

        const content = fs.readFileSync(CONFIG.safelinkFile, 'utf-8');
        const urls = content.split('\n')
            .map(line => line.trim())
            .filter(line => line && line.startsWith('http'));

        if (urls.length === 0) {
            console.log(chalk.red.bold('✗ Tidak ada URL ditemukan di file safelinku.txt'));
            process.exit(1);
        }

        urls.forEach((url, i) => {
            urlStats[`URL-${i + 1}`] = { success: 0, failed: 0, url };
        });

        let allProxies = [];
        if (CONFIG.useProxy) {
            allProxies = await fetchAllProxies();
            if (allProxies.length > 0) {
                console.log(chalk.white.bold('Proxy Mode  : ') + chalk.cyan.bold('SOCKS (Multi-Country)'));
                console.log(chalk.white.bold('Available   : ') + chalk.cyan.bold(`${allProxies.length} proxies`));
            } else {
                console.log(chalk.white.bold('Proxy Mode  : ') + chalk.cyan.bold('Direct (No Proxy)'));
            }
        } else {
            console.log(chalk.white.bold('Proxy Mode  : ') + chalk.cyan.bold('Direct'));
        }

        const fileName = path.basename(CONFIG.safelinkFile);
        console.log(chalk.white.bold('Source File : ') + chalk.cyan.bold(fileName));
        console.log(chalk.white.bold('Total URLs  : ') + chalk.cyan.bold(urls.length));
        console.log(chalk.white.bold('Blacklisted : ') + chalk.red.bold(failedProxies.size) + chalk.white.bold(' proxies'));

        const processedResults = [];


        if (allProxies.length > 0) {
            const proxyQueue = [...allProxies];
            let proxyIndex = 0;
            const workerCount = Math.min(CONFIG.concurrency, allProxies.length);

            console.log(chalk.white.bold('Workers     : ') + chalk.cyan.bold(workerCount));
            console.log('');

            const workers = Array.from({ length: workerCount }, () =>
                (async () => {
                    while (true) {
                        const idx = proxyIndex++;
                        if (idx >= proxyQueue.length) break;

                        const proxy = proxyQueue[idx];

                        if (failedProxies.has(proxy)) {
                            continue;
                        }

                        const alive = await testProxy(proxy, 5000);
                        if (!alive) {
                            failedProxies.add(proxy);
                            continue;
                        }

                        let consecutiveFailures = 0;
                        const maxConsecutiveFailures = 3;

                        for (let i = 0; i < urls.length; i++) {
                            if (consecutiveFailures >= maxConsecutiveFailures) {
                                failedProxies.add(proxy);
                                break;
                            }

                            const urlId = `URL-${i + 1}`;
                            const result = await processSafeLink(urls[i], urlId, proxy);



                            if (result.success) {
                                urlStats[urlId].success++;
                                consecutiveFailures = 0;
                            } else {
                                urlStats[urlId].failed++;
                                consecutiveFailures++;
                                const errorMsg = result.error || 'Unknown error';
                                logProgress(urlId, `FAILED: ${errorMsg}`, proxy, 'red');
                            }

                            processedResults.push({
                                url: urls[i],
                                proxy: formatProxy(proxy),
                                ...result
                            });

                            await delay(500);
                        }

                        if (proxyIndex < proxyQueue.length) {
                            await delay(1000);
                        }
                    }
                })()
            );

            await Promise.all(workers);
        } else {
            console.log('');
            for (let i = 0; i < urls.length; i++) {
                const urlId = `URL-${i + 1}`;
                const result = await processSafeLink(urls[i], urlId, null);

                if (result.success) {
                    urlStats[urlId].success++;
                } else {
                    urlStats[urlId].failed++;
                    const errorMsg = result.error || 'Unknown error';
                    logProgress(urlId, `FAILED: ${errorMsg}`, null, 'red');
                }

                processedResults.push({
                    url: urls[i],
                    proxy: 'Direct',
                    ...result
                });
            }
        }

        const results = processedResults;
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const totalDuration = Date.now() - startTime;
        const avgDuration = results.length > 0 ? totalDuration / results.length : 0;

        console.log('');
        console.log(chalk.white.bold('═'.repeat(70)));
        console.log(chalk.white.bold('                          FINAL REPORT'));
        console.log(chalk.white.bold('═'.repeat(70)));
        console.log('');
        console.log(chalk.white.bold('Total URLs      : ') + chalk.cyan.bold(results.length));
        console.log(chalk.green.bold('Successful      : ') + chalk.green.bold(successful));
        console.log(chalk.red.bold('Failed          : ') + chalk.red.bold(failed));
        if (results.length > 0) {
            console.log(chalk.white.bold('Success Rate    : ') + chalk.cyan.bold(`${((successful / results.length) * 100).toFixed(1)}%`));
            console.log(chalk.white.bold('Avg Duration    : ') + chalk.cyan.bold(`${(avgDuration / 1000).toFixed(1)}s/url`));
        }
        console.log(chalk.white.bold('Total Duration  : ') + chalk.cyan.bold(`${(totalDuration / 1000).toFixed(1)}s`));
        console.log('');
        console.log(chalk.white.bold('═'.repeat(70)));
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error(chalk.red.bold(`✗ Fatal Error: ${error.message}`));
        process.exit(1);
    }
}

main().catch(error => {
    console.error(chalk.red.bold(`✗ Fatal Error: ${error.message}`));
    process.exit(1);
});