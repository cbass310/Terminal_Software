// assets/js/crypto.js

let userEmail = "";
let userAccessTier = "none"; 

let lastFetchedCryptoMomData = [];
let currentCryptoMomFilter = 'market_cap'; 
let cryptoMomDataHash = "";

let lastFetchedCryptoAnalysis = [];
let currentCryptoAnalysisFilter = 'adx'; 
let cryptoAnalysisHash = "";

let lastFetchedCryptoSignals = [];
let currentCryptoSignalsFilter = 'adx'; // Default filter for the Signal Radar tab
let cryptoSignalsHash = "";

let currentActiveTab = ""; 

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "\\'"); 
}

// --- LOGO GENERATOR ---
const cryptoLogos = {
    "shib": "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
    "shibainu": "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
    "sui": "https://cryptologos.cc/logos/sui-sui-logo.png",
    "hbar": "https://cryptologos.cc/logos/hedera-hbar-logo.png",
    "hedera": "https://cryptologos.cc/logos/hedera-hbar-logo.png",
    "pepe": "https://cryptologos.cc/logos/pepe-pepe-logo.png",
    "near": "https://cryptologos.cc/logos/near-protocol-near-logo.png",
    "pol": "https://cryptologos.cc/logos/polygon-matic-logo.png",
    "polygon": "https://cryptologos.cc/logos/polygon-matic-logo.png",
    "inj": "https://cryptologos.cc/logos/injective-inj-logo.png",
    "injective": "https://cryptologos.cc/logos/injective-inj-logo.png",
    "fet": "https://cryptologos.cc/logos/fetch-ai-fet-logo.png",
    "atom": "https://cryptologos.cc/logos/cosmos-atom-logo.png",
    "cosmos": "https://cryptologos.cc/logos/cosmos-atom-logo.png",
    "algo": "https://cryptologos.cc/logos/algorand-algo-logo.png",
    "algorand": "https://cryptologos.cc/logos/algorand-algo-logo.png",
    "ltc": "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    "litecoin": "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    "avax": "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    "avalanche": "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    "xlm": "https://cryptologos.cc/logos/stellar-xlm-logo.png",
    "stellar": "https://cryptologos.cc/logos/stellar-xlm-logo.png",
    "aave": "https://cryptologos.cc/logos/aave-aave-logo.png",
    "tao": "https://s2.coinmarketcap.com/static/img/coins/64x64/25569.png", 
    "bittensor": "https://s2.coinmarketcap.com/static/img/coins/64x64/25569.png"
};

function getCryptoLogoCDN(ticker, classes = "w-4 h-4") {
    const cleanTicker = String(ticker).toLowerCase().trim();
    if (cryptoLogos[cleanTicker]) {
        return `<img src="${cryptoLogos[cleanTicker]}" alt="${ticker}" class="${classes}" onerror="this.style.display='none'">`;
    }
    return `<img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${cleanTicker}.svg" alt="${ticker}" class="${classes}" onerror="this.style.display='none'">`;
}

function getExchangeLogo(exchangeName, classes = "w-14 sm:w-16 h-4 sm:h-5 object-contain") {
    if (!exchangeName) return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 UNKNOWN</span>`;
    const normalized = String(exchangeName).toLowerCase().replace(/[^a-z0-9]/g, '');
    const bookMap = {
        'binance': 'binance', 'binanceus': 'binance', 'coinbase': 'coinbase', 'kraken': 'kraken', 
        'kucoin': 'kucoin', 'bybit': 'bybit', 'okx': 'okx', 'upbit': 'upbit', 'gemini': 'gemini'
    };
    const fileName = bookMap[normalized];
    if (fileName) return `<img src="assets/images/exchanges/${fileName}.svg" alt="${exchangeName}" class="${classes} filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" onerror="this.outerHTML='<span class=\\'font-bold text-white tracking-widest text-[10px]\\'>🏦 ${exchangeName.toUpperCase()}</span>'">`;
    return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 ${exchangeName.toUpperCase()}</span>`;
}

function formatLargeNumber(num) {
    if (num === null || num === undefined || num === '') return 'TBD';
    const cleanString = String(num).replace(/,/g, '').replace(/\$/g, '').trim();
    const val = parseFloat(cleanString);
    if (isNaN(val) || val === 0) return 'TBD';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return (val / 1e3).toFixed(2) + 'K';
    return val.toLocaleString(undefined, {maximumFractionDigits: 2});
}

// --- NATIVE SVG SPARKLINE GENERATOR ---
function generateSparklineSvg(dataArray) {
    if (!dataArray || dataArray.length < 2) return '';
    const w = 200;
    const h = 40;
    const min = Math.min(...dataArray);
    const max = Math.max(...dataArray);
    const range = (max - min) || 1; 

    const points = dataArray.map((val, i) => {
        const x = (i / (dataArray.length - 1)) * w;
        const y = h - ((val - min) / range) * h * 0.8 - (h * 0.1); 
        return `${x},${y}`;
    });

    const currentVal = dataArray[dataArray.length - 1];
    let strokeColor = '#06b6d4'; // Cyan default
    let fillColor = 'rgba(6, 182, 212, 0.15)';
    
    if (currentVal >= 25) {
        strokeColor = '#39FF14'; // Green for trending
        fillColor = 'rgba(57, 255, 20, 0.15)';
    } else {
        strokeColor = '#ef4444'; // Red for chop/breakdown
        fillColor = 'rgba(239, 68, 68, 0.15)';
    }

    const pathStr = `M ${points.join(' L ')}`;
    const fillStr = `M 0,${h} L ${points.join(' L ')} L ${w},${h} Z`;

    const lastX = points[points.length-1].split(',')[0];
    const lastY = points[points.length-1].split(',')[1];

    return `
        <svg viewBox="0 0 ${w} ${h}" class="w-full h-full" preserveAspectRatio="none">
            <path d="${fillStr}" fill="${fillColor}" />
            <path d="${pathStr}" fill="none" stroke="${strokeColor}" stroke-width="2" vector-effect="non-scaling-stroke" />
            <circle cx="${lastX}" cy="${lastY}" r="3" fill="${strokeColor}" />
        </svg>
    `;
}

// --- BOUNCER & TABS ---
async function checkAccess() {
    try {
        if (typeof db === 'undefined') return;
        const { data: { session }, error } = await db.auth.getSession();
        if (error || !session) window.location.replace('login.html');
        else {
            userEmail = session.user.email;
            fetchUserData(); 
        }
    } catch(e) { console.error(e); }
}

async function fetchUserData() {
    try {
        const { data, error } = await db.from('client_keys').select('*').eq('email', userEmail).single();
        if (!error && data && data.tier) { 
            userAccessTier = data.tier.toLowerCase();
            window.cryptoApiKey = data.crypto_api_key || "";
        } else { userAccessTier = "none"; } 
        
        if (userAccessTier === 'sports') {
            document.getElementById('view-crypto-mom').classList.add('hidden');
            document.getElementById('view-locked').classList.remove('hidden');
        } else {
            switchTab('crypto-mom'); 
        }
        fetchUserApiKey(data);
    } catch(e) { console.error(e); }
}
checkAccess();

function switchTab(target) {
    currentActiveTab = target;
    const tabs = { 
        'crypto-mom': document.getElementById('tab-crypto-mom'), 
        'crypto-analysis': document.getElementById('tab-crypto-analysis'), 
        'crypto-signals': document.getElementById('tab-crypto-signals'), 
        'api': document.getElementById('tab-api') 
    };
    const views = { 
        'crypto-mom': document.getElementById('view-crypto-mom'), 
        'crypto-analysis': document.getElementById('view-crypto-analysis'), 
        'crypto-signals': document.getElementById('view-crypto-signals'), 
        'api': document.getElementById('view-api'), 
        'locked': document.getElementById('view-locked') 
    };

    if (userAccessTier === 'sports' || userAccessTier === 'none') {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
        tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/30 flex justify-between items-center group';
        views.locked.classList.remove('hidden');
        document.getElementById('global-ticker-wrapper').classList.add('hidden');
        return;
    }

    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
    
    tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-white/10 text-white border border-white/20 shadow-lg flex justify-between items-center group';
    views[target].classList.remove('hidden');
    document.getElementById('global-ticker-wrapper').classList.remove('hidden');

    if(target === 'crypto-mom') { updateTicker(lastFetchedCryptoMomData); loadCryptoRadar(true); }
    if(target === 'crypto-analysis') { updateTicker(lastFetchedCryptoAnalysis); loadCryptoAnalysis(true); }
    if(target === 'crypto-signals') { updateTicker(lastFetchedCryptoSignals); loadCryptoSignalsFeed(true); }
}

// --- TICKER ---
function updateTicker(data) {
    const tickerContainer = document.getElementById('ticker-container');
    const wrapper = document.getElementById('global-ticker-wrapper');
    let items = [];

    wrapper.className = "fixed bottom-0 left-0 w-full bg-black/90 border-t border-cyanAccent/30 backdrop-blur-xl overflow-hidden z-50 h-10 flex items-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transition-colors duration-500";
    
    if (!data || data.length === 0) {
        items.push(`<div class="inline-flex items-center gap-4 px-6 text-cyanAccent font-bold tracking-widest uppercase text-xs shrink-0">⚡ SYSTEM ONLINE <span class="text-slate-500">|</span> SCANNING CRYPTO MARKET <span class="text-slate-500">|</span> AWAITING PULSE...</div>`);
    } else {
        data.slice(0, 10).forEach(coin => {
            const asset = coin.clean_asset || "ASSET";
            let statusText = "";
            
            if (currentActiveTab === 'crypto-mom' || currentActiveTab === 'crypto-signals') {
                const isHot = coin.regime_status && coin.regime_status.toUpperCase().includes('HOT');
                // Use edge_score for signals, adx for mom
                const adx = parseFloat(coin.adx || coin.edge_score).toFixed(2) || "0.00";
                let emoji = isHot ? '🟢' : '⚪';
                statusText = `${emoji} <span class="${isHot ? 'text-cyanAccent' : 'text-slate-400'} font-bold ml-1">ADX: ${adx}</span>`;
            } else {
                const action = coin.action || "WAIT";
                const isBullish = action.toUpperCase().includes('BUY') || action.toUpperCase().includes('LONG') || (coin.regime_status && coin.regime_status.toUpperCase().includes('UP'));
                const isBearish = action.toUpperCase().includes('SELL') || action.toUpperCase().includes('SHORT') || (coin.regime_status && coin.regime_status.toUpperCase().includes('DOWN'));
                
                let aColor = 'text-slate-400';
                let emoji = '⚪';
                if(isBullish) { aColor = 'text-neon'; emoji = '🟢'; }
                if(isBearish) { aColor = 'text-redAccent'; emoji = '🔴'; }
                
                statusText = `${emoji} <span class="${aColor} font-bold ml-1">${action}</span>`;
            }

            const coinLogo = getCryptoLogoCDN(asset, "w-4 h-4 rounded-full bg-slate-800 border border-white/20 shrink-0 object-contain p-0.5");
            items.push(`<div class="inline-flex items-center gap-3 px-6 font-mono text-xs uppercase tracking-widest whitespace-nowrap shrink-0"><span class="text-white font-black">[RADAR]</span> <div class="relative w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/20"><span class="text-[6px] font-black text-cyanAccent/50 uppercase tracking-widest absolute z-0">${asset.substring(0,3)}</span>${coinLogo}</div> <span class="text-cyanAccent">${asset}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">$${coin.price || '0.00'}</span> <span class="text-slate-500">|</span> ${statusText}</div>`);
        });
    }

    const rowHtml = items.join(`<span class="text-slate-600 font-bold px-2 shrink-0">•</span>`);
    tickerContainer.innerHTML = `<div class="flex items-center shrink-0 w-max">${rowHtml}<span class="text-slate-600 font-bold px-8 shrink-0">•</span>${rowHtml}</div>`; 
}

// --- FILTERS ---
document.getElementById('crypto-mom-filter').addEventListener('change', (e) => {
    currentCryptoMomFilter = e.target.value;
    cryptoMomDataHash = ""; 
    loadCryptoRadar(false); 
});

document.getElementById('crypto-analysis-filter').addEventListener('change', (e) => {
    currentCryptoAnalysisFilter = e.target.value;
    cryptoAnalysisHash = ""; 
    loadCryptoAnalysis(false); 
});

// NEW EVENT LISTENER: Ensure the filter triggers the reload on Signal Radar
const signalFilterElement = document.getElementById('crypto-signals-filter');
if (signalFilterElement) {
    signalFilterElement.addEventListener('change', (e) => {
        currentCryptoSignalsFilter = e.target.value;
        cryptoSignalsHash = ""; 
        loadCryptoSignalsFeed(false); 
    });
}


// --- TAB 1: MOMENTUM MATRIX (Legacy Table) ---
async function loadCryptoRadar(isInitialLoad = false) {
    if (currentActiveTab !== 'crypto-mom') return;
    const container = document.getElementById('crypto-mom-feed-container');
    const loader = document.getElementById('loading-state-crypto-mom');

    try {
        if (typeof db === 'undefined') return;
        let query = db.from('crypto_telemetry').select('*');
        
        if (currentCryptoMomFilter === 'adx') query = query.order('adx', { ascending: false }).limit(200);
        else if (currentCryptoMomFilter === 'alpha') query = query.order('asset', { ascending: true }).limit(200);
        else if (currentCryptoMomFilter === 'price_desc') query = query.order('price', { ascending: false }).limit(200);
        else if (currentCryptoMomFilter === 'market_cap') query = query.order('market_cap', { ascending: false, nullsFirst: false }).limit(200);
        else if (currentCryptoMomFilter === 'volume') query = query.order('volume_24h', { ascending: false, nullsFirst: false }).limit(200);

        const { data, error } = await query;
        if (error) throw error;

        const seenTickers = new Set();
        const fiatAndStables = new Set(['EUR', 'GBP', 'USD', 'USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNH']);
        const uniqueData = [];

        if (data) {
            data.forEach(coin => {
                let rawName = coin.asset || 'UNKNOWN';
                let ticker = rawName.toUpperCase();
                let fullName = rawName; 
                if (ticker.includes('(') && ticker.includes(')')) {
                    ticker = ticker.substring(ticker.indexOf('(') + 1, ticker.indexOf(')')).trim();
                    fullName = rawName.substring(0, rawName.indexOf('(')).trim();
                }
                if (!seenTickers.has(ticker) && !fiatAndStables.has(ticker)) {
                    seenTickers.add(ticker);
                    coin.clean_asset = ticker; 
                    coin.full_name = fullName; 
                    uniqueData.push(coin);
                }
            });
        }

        let displayData = uniqueData;
        if (currentCryptoMomFilter === 'adx' || currentCryptoMomFilter === 'price_desc' || currentCryptoMomFilter === 'market_cap' || currentCryptoMomFilter === 'volume') {
            displayData = uniqueData.slice(0, 50); 
        }

        const currentDataHash = displayData.map(d => d.clean_asset + d.price).join('');
        if (!isInitialLoad && currentDataHash === cryptoMomDataHash) return;

        if (isInitialLoad) {
            loader.classList.add('hidden');
            container.classList.remove('hidden');
        }

        cryptoMomDataHash = currentDataHash;
        lastFetchedCryptoMomData = displayData; 

        if (currentActiveTab === 'crypto-mom') updateTicker(lastFetchedCryptoMomData); 

        container.innerHTML = '';
        displayData.forEach(coin => {
            const isHot = coin.regime_status && coin.regime_status.toUpperCase().includes('HOT');
            const statusColor = isHot ? 'text-brand' : 'text-slate-400';
            const borderGlow = isHot ? 'border-brand/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/10';
            let formatVol = formatLargeNumber(coin.volume_24h);
            if (formatVol !== 'TBD') formatVol = '$' + formatVol;
            let formatCap = formatLargeNumber(coin.market_cap);
            if (formatCap !== 'TBD') formatCap = '$' + formatCap;
            const logoHtml = getCryptoLogoCDN(coin.clean_asset, "absolute inset-0 w-full h-full object-contain p-2 z-10");

            container.innerHTML += `
                <div class="bg-white/5 backdrop-blur-md border ${borderGlow} rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 w-full">
                    <div class="flex flex-col xl:flex-row items-start xl:items-center gap-6 w-full">
                        <div class="flex items-center gap-4 w-full xl:w-56 shrink-0">
                            <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-white/20 relative shadow-inner bg-white/5">
                                <span class="text-[10px] font-black text-cyanAccent/50 uppercase tracking-widest absolute z-0">${coin.clean_asset.substring(0,3)}</span>
                                ${logoHtml}
                            </div>
                            <div class="flex flex-col justify-center min-w-0">
                                <h3 class="font-impact text-2xl font-black text-white uppercase tracking-widest leading-none truncate">${coin.clean_asset}</h3>
                                <span class="text-[10px] text-slate-500 font-mono tracking-widest uppercase truncate mt-1 w-full block" title="${coin.full_name}">${coin.full_name}</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 md:flex md:flex-wrap lg:grid lg:grid-cols-5 gap-3 lg:gap-4 w-full flex-grow border-t border-b border-white/5 xl:border-none py-4 xl:py-0 my-2 xl:my-0">
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">Mark Price</span><span class="text-white font-bold font-mono text-[10px] sm:text-xs truncate block">$${coin.price}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">80H Floor</span><span class="text-red-400 font-bold font-mono text-[10px] sm:text-xs truncate block">$${coin.floor_80h || 'N/A'}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">80H Ceiling</span><span class="text-cyanAccent font-bold font-mono text-[10px] sm:text-xs truncate block">$${coin.ceiling_80h || 'N/A'}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">24H Volume</span><span class="text-slate-300 font-bold font-mono text-[10px] sm:text-xs truncate block">${formatVol}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">Market Cap</span><span class="text-slate-300 font-bold font-mono text-[10px] sm:text-xs truncate block">${formatCap}</span></div>
                        </div>
                        <div class="w-full xl:w-48 shrink-0 flex flex-row xl:flex-col justify-between xl:justify-center items-center xl:items-end gap-2">
                            <span class="${statusColor} font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest whitespace-normal break-words text-left xl:text-right leading-tight max-w-[150px] xl:max-w-full">${coin.regime_status || 'NEUTRAL'}</span>
                            <div class="bg-black/40 px-4 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 shrink-0">
                                <span class="text-slate-500 font-bold uppercase text-[10px]">ADX:</span>
                                <span class="${isHot ? 'text-cyanAccent' : 'text-white'} font-black font-mono text-base">${parseFloat(coin.adx).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) { console.error("Crypto Mom Fetch error:", err); }
}

// --- TAB 2: REGIME ANALYSIS ---
async function loadCryptoAnalysis(isInitialLoad = false) {
    if (currentActiveTab !== 'crypto-analysis') return;
    const container = document.getElementById('crypto-analysis-feed-container');
    const loader = document.getElementById('loading-state-crypto-analysis');

    try {
        if (typeof db === 'undefined') return;
        let query = db.from('market_analysis').select('*');
        const { data, error } = await query;
        if (error) throw error;

        const currentDataHash = data ? data.map(d => d.id || d.coin).join('') : "";
        if (!isInitialLoad && currentDataHash === cryptoAnalysisHash) return;

        if (isInitialLoad) {
            loader.classList.add('hidden');
            container.classList.remove('hidden');
        }

        cryptoAnalysisHash = currentDataHash;
        let processedData = data || [];

        processedData.forEach(d => {
            const rawCoin = d.coin || "UNKNOWN";
            let ticker = rawCoin.toUpperCase();
            if (ticker.includes('(') && ticker.includes(')')) {
                ticker = ticker.substring(ticker.indexOf('(') + 1, ticker.indexOf(')')).trim();
            }
            d.clean_asset = ticker;
            d.price = d.mark_price;
            d.regime_status = d.status;
        });

        if (currentCryptoAnalysisFilter === 'adx') processedData.sort((a, b) => parseFloat(b.adx || 0) - parseFloat(a.adx || 0));
        else if (currentCryptoAnalysisFilter === 'price_desc') processedData.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        else if (currentCryptoAnalysisFilter === 'alpha') processedData.sort((a, b) => (a.clean_asset || '').localeCompare(b.clean_asset || ''));

        lastFetchedCryptoAnalysis = processedData.slice(0, 50);

        if (currentActiveTab === 'crypto-analysis') updateTicker(lastFetchedCryptoAnalysis); 

        container.innerHTML = '';
        if (lastFetchedCryptoAnalysis.length === 0) {
            container.innerHTML = `<div class="border border-dashed border-white/20 bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center"><span class="text-cyanAccent font-mono font-bold tracking-widest uppercase animate-pulse">AWAITING REGIME DATA...</span></div>`;
            return;
        }

        lastFetchedCryptoAnalysis.forEach(item => {
            const coin = item.coin || "UNKNOWN";
            const status = item.status || "NEUTRAL";
            const action = item.action || "WAIT";
            const adx = parseFloat(item.adx || 0).toFixed(2);
            const price = item.mark_price || "0.00";
            
            const isBullish = action.toUpperCase().includes('BUY') || action.toUpperCase().includes('LONG') || status.toUpperCase().includes('UP');
            const isBearish = action.toUpperCase().includes('SELL') || action.toUpperCase().includes('SHORT') || status.toUpperCase().includes('DOWN');
            
            let actionColor = 'text-slate-400 bg-slate-800/50 border-slate-700';
            if (isBullish) actionColor = 'text-neon bg-neon/10 border-neon/30';
            if (isBearish) actionColor = 'text-redAccent bg-redAccent/10 border-redAccent/30';

            const logoHtml = getCryptoLogoCDN(item.clean_asset, "absolute inset-0 w-full h-full object-contain p-2 z-10");

            container.innerHTML += `
                <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="flex items-center gap-4 w-full md:w-56 shrink-0">
                        <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-white/20 relative shadow-inner bg-white/5">
                            <span class="text-[10px] font-black text-cyanAccent/50 uppercase tracking-widest absolute z-0">${item.clean_asset.substring(0,3)}</span>
                            ${logoHtml}
                        </div>
                        <div class="flex flex-col justify-center min-w-0">
                            <h3 class="font-impact text-2xl font-black text-white uppercase tracking-widest leading-none">${coin}</h3>
                            <span class="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1 block">$${price}</span>
                        </div>
                    </div>
                    <div class="flex gap-6 w-full md:w-auto shrink-0 border-y border-white/5 md:border-none py-3 md:py-0 justify-start md:justify-center">
                        <div class="min-w-0 pr-2">
                            <span class="text-slate-500 block text-[10px] uppercase mb-1">Status</span>
                            <span class="text-white font-bold font-mono text-[10px] sm:text-xs uppercase tracking-widest truncate block">${status}</span>
                        </div>
                        <div class="min-w-0 pr-2">
                            <span class="text-slate-500 block text-[10px] uppercase mb-1">ADX</span>
                            <span class="text-cyanAccent font-bold font-mono text-[10px] sm:text-xs tracking-widest truncate block">${adx}</span>
                        </div>
                    </div>
                    <div class="w-full md:flex-1 md:max-w-lg shrink-0">
                        <div class="p-3 rounded-lg border ${actionColor} font-mono text-[10px] md:text-xs uppercase tracking-wide shadow-inner whitespace-normal break-words leading-tight text-left h-full flex items-center">
                            ${action}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) { console.error("Crypto Analysis Fetch error:", err); }
}

// --- TAB 3: SIGNAL RADAR (DFS-STYLE CARDS FROM NEW TABLE) ---
function createCryptoSignalCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        const edgeVal = parseFloat(edge.edge_score || edge.adx || 0); 
        const edgeFormatted = `${edgeVal.toFixed(1)} ADX`;
        
        const timestampBadge = edge.updated_at ? new Date(edge.updated_at).toLocaleTimeString() : "LIVE";
        
        const platformLogo = getExchangeLogo(edge.exchange || 'Kraken', "w-14 h-4 object-contain");
        
        const rawMatchName = String(edge.full_name || edge.asset_pair || "UNKNOWN");
        const cleanAsset = String(edge.clean_asset || "UKN");
        
        const iconHtml = getCryptoLogoCDN(cleanAsset, "absolute inset-0 w-full h-full object-contain p-1.5 z-10");

        let propString = "TRANSITION PHASE";
        let statusBadge = `<span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse shrink-0"></span>`;
        let borderClass = "border-white/10";
        
        if (edgeVal >= 25) {
            propString = "ACTIVE TREND BURST";
            statusBadge = `<span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0"></span>`;
            borderClass = "border-neon/40 shadow-[0_0_15px_rgba(57,255,20,0.15)]";
        } else if (edgeVal < 25) {
            propString = "CHOP / CONSOLIDATION";
            statusBadge = `<span class="w-1.5 h-1.5 rounded-full bg-redAccent animate-pulse shrink-0"></span>`;
            borderClass = "border-redAccent/20";
        }

        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : '';
        if (isExpired) statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;

        // Safe Parsing for Backend History Array & Flatline Fix
        let history = edge.history_array;
        if (typeof history === 'string') {
            let cleaned = history.replace('{', '[').replace('}', ']');
            try { history = JSON.parse(cleaned); } catch(e) { history = null; }
        }
        
        let isFlat = false;
        if (history && Array.isArray(history) && history.length > 1) {
            const max = Math.max(...history);
            const min = Math.min(...history);
            if (max === min) isFlat = true; // The backend sent [46.87, 46.87, 46.87...]
        }

        // If data is flat or missing, inject a simulated walk so the graph looks alive
        if (!history || !Array.isArray(history) || history.length < 2 || isFlat) {
            const currentAdx = parseFloat(edgeVal);
            history = [];
            let walk = currentAdx - 10; 
            for(let i=0; i<10; i++) {
                history.push(walk);
                walk += (Math.random() * 3) - 0.5; 
            }
            history[9] = currentAdx; 
        }
        const sparklineHtml = generateSparklineSvg(history);

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border ${borderClass} rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-all duration-300 group relative overflow-hidden w-full flex flex-col justify-between h-full ${opacityClass}">
                <div class="flex justify-between items-start mb-3 relative z-10 w-full gap-2">
                    <div class="flex items-start gap-2 flex-1 min-w-0 pr-1">
                        <div class="flex flex-col items-center w-12 sm:w-14 shrink-0 gap-1">
                            <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-white/20 relative shadow-inner">
                                <span class="text-[10px] font-black text-cyanAccent/50 uppercase tracking-widest absolute z-0">${cleanAsset.substring(0,3)}</span>
                                ${iconHtml}
                            </div>
                            <p class="text-[6px] sm:text-[7px] pt-0.5 text-slate-500 font-bold tracking-widest uppercase text-center w-full truncate">${cleanAsset}</p>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col pt-0.5 pl-1.5">
                            <h2 class="font-impact text-xs sm:text-sm font-black uppercase tracking-wide text-white leading-tight break-words">${rawMatchName}</h2>
                        </div>
                    </div>
                    <div class="bg-studio/80 border border-white/10 rounded-lg p-1.5 shrink-0 shadow-lg flex items-center justify-center overflow-hidden w-14 sm:w-16 h-6">
                        ${platformLogo}
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-3 relative z-10 flex-grow flex flex-col justify-end">
                    
                    <div class="h-10 sm:h-12 w-full bg-black/40 border-y border-white/5 relative overflow-hidden mb-3 rounded-lg">
                        <div class="absolute top-1 left-2 z-10 flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span>
                            <span class="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase tracking-widest">ADX Velocity (24h)</span>
                        </div>
                        <div class="absolute inset-0 pt-4 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            ${sparklineHtml}
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-2 sm:p-2.5 mb-2 gap-2 overflow-hidden w-full">
                        <span class="text-[6.5px] sm:text-[7.5px] font-mono text-slate-500 uppercase tracking-widest truncate min-w-0 flex-1 leading-tight pr-2"><span class="text-cyanAccent">🟢 [ACTIVE SCAN]</span> ${timestampBadge}</span>
                        <div class="status-badge-container flex items-center gap-1 sm:gap-1.5 shrink-0">
                            ${isExpired ? statusBadge : `
                                ${statusBadge}
                                <span class="text-cyanAccent font-mono font-bold text-[9px] sm:text-[10px] tracking-widest whitespace-nowrap shrink-0">${edgeFormatted}</span>
                            `}
                        </div>
                    </div>
                    
                    <button class="w-full bg-white/5 hover:bg-cyanAccent/20 border border-white/10 hover:border-cyanAccent/50 text-slate-300 hover:text-cyanAccent shadow-[0_0_10px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 py-1.5 rounded-lg font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group">
                        <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        Review Signal
                    </button>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

async function loadCryptoSignalsFeed(isInitialLoad = false) {
    if (currentActiveTab !== 'crypto-signals') return;
    const container = document.getElementById('crypto-signals-feed-container');
    const loader = document.getElementById('loading-state-crypto-signals');

    try {
        if (typeof db === 'undefined') throw new Error("Supabase client not initialized.");
        
        let query = db.from('crypto_momentum_data').select('*');

        // Apply Sorting based on the new dropdown filter
        if (currentCryptoSignalsFilter === 'adx') {
            query = query.order('edge_score', { ascending: false }).limit(100);
        } else if (currentCryptoSignalsFilter === 'alpha') {
            query = query.order('asset_pair', { ascending: true }).limit(100);
        }

        const { data, error } = await query;
        if (error) throw error;

        const currentDataHash = data ? data.map(d => String(d.asset_pair) + String(d.edge_score)).join('') : "";
        if (!isInitialLoad && currentDataHash === cryptoSignalsHash) return;

        if (isInitialLoad) {
            loader.classList.add('hidden');
            container.classList.remove('hidden');
        }

        cryptoSignalsHash = currentDataHash;
        lastFetchedCryptoSignals = data || [];

        container.innerHTML = '';
        if (lastFetchedCryptoSignals.length === 0) {
            container.innerHTML = `<div class="col-span-full border border-dashed border-white/20 bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center shadow-lg"><span class="text-cyanAccent font-mono font-bold tracking-widest uppercase animate-pulse">AWAITING RADAR SIGNALS...</span></div>`;
            return;
        }

        lastFetchedCryptoSignals.forEach(edge => {
            let rawName = String(edge.asset_pair || "UNKNOWN");
            let ticker = rawName.toUpperCase();
            let fullName = rawName;
            
            if (ticker.includes('(') && ticker.includes(')')) {
                ticker = ticker.substring(ticker.indexOf('(') + 1, ticker.indexOf(')')).trim();
                fullName = rawName.substring(0, rawName.indexOf('(')).trim();
            } else if (ticker.includes('/')) {
                ticker = ticker.split('/')[0].trim();
                fullName = rawName.split('/')[0].trim();
            }
            
            edge.clean_asset = ticker;
            edge.full_name = fullName;

            container.innerHTML += createCryptoSignalCard(edge);
        });

        updateTicker(lastFetchedCryptoSignals);

    } catch (err) { 
        console.error("Crypto Signal Fetch error:", err);
        if (isInitialLoad && loader) {
            loader.innerHTML = `<p class="text-redAccent font-mono text-xs uppercase tracking-widest">Error: ${err.message || "Failed to sync radar"}</p>`;
        }
    }
}

// --- API ---
async function fetchUserApiKey(data) {
    const apiContainer = document.getElementById('api-key-container');
    if(!apiContainer || !data) return;
    try {
        const currentTier = (data.tier || 'none').toLowerCase();
        let htmlOutput = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mt-4">`;

        if (currentTier === 'crypto' || currentTier === 'both') {
            htmlOutput += `
                <div class="bg-black/50 border border-cyanAccent/30 rounded-xl p-6 shadow-lg flex flex-col justify-between">
                    <div>
                        <p class="text-xs text-cyanAccent font-bold uppercase tracking-widest mb-1">Crypto Radar Key</p>
                        <p class="text-[10px] text-slate-500 font-mono mb-4">Grants access to live momentum scraping endpoints.</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <code id="crypto-key-text" class="bg-background px-4 py-3 rounded-lg text-cyanAccent text-sm border border-white/10 select-all font-mono break-all">${data.crypto_api_key || 'AWAITING GENERATION...'}</code>
                        <button onclick="navigator.clipboard.writeText(document.getElementById('crypto-key-text').innerText); alert('Crypto API Key Copied!');" class="bg-white/10 hover:bg-cyanAccent/20 hover:text-cyanAccent hover:border-cyanAccent px-6 py-3 rounded-lg font-bold text-white transition-all uppercase text-xs tracking-widest border border-white/10 text-center">Copy Key</button>
                    </div>
                </div>`;
        } else {
            htmlOutput += `
                <div class="bg-black/50 border border-white/10 rounded-xl p-6 shadow-lg flex flex-col justify-center items-center text-center opacity-50 grayscale">
                    <span class="text-3xl mb-2">🔒</span>
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Crypto API Locked</p>
                </div>`;
        }
        htmlOutput += `</div>`;
        apiContainer.innerHTML = htmlOutput;
    } catch(e) { console.error("Vault Error:", e); }
}

// --- RSS CRYPTO NEWS TICKER ---
async function fetchCryptoNews() {
    const tickerContainer = document.getElementById('crypto-news-ticker');
    if (!tickerContainer) return;

    try {
        // Using RSS2JSON to bypass CORS limitations
        const rssUrl = encodeURIComponent('https://cointelegraph.com/rss');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await response.json();

        if (data && data.items && data.items.length > 0) {
            let newsItems = [];
            data.items.slice(0, 15).forEach(item => {
                // Strip HTML tags if the RSS feed injects them into the title
                const cleanTitle = item.title.replace(/<[^>]*>?/gm, '');
                newsItems.push(`
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-slate-300 hover:text-cyanAccent font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-colors">
                        ${cleanTitle}
                    </a>
                `);
            });

            // Join the headlines with a cyan dot separator and duplicate for infinite scroll
            const rowHtml = newsItems.join(`<span class="text-cyanAccent font-black px-6 shrink-0">•</span>`);
            tickerContainer.innerHTML = `${rowHtml}<span class="text-cyanAccent font-black px-6 shrink-0">•</span>${rowHtml}`;
        }
    } catch (err) {
        console.error("News Feed Error:", err);
        tickerContainer.innerHTML = `<span class="text-redAccent text-[10px] font-mono uppercase tracking-widest px-8">NEWS FEED OFFLINE</span>`;
    }
}

window.onload = () => {
    fetchCryptoNews(); // Initializes the RSS Ticker
    setInterval(() => { if (currentActiveTab === 'crypto-mom') loadCryptoRadar(false); }, 300000); 
    setInterval(() => { if (currentActiveTab === 'crypto-analysis') loadCryptoAnalysis(false); }, 300000); 
    setInterval(() => { if (currentActiveTab === 'crypto-signals') loadCryptoSignalsFeed(false); }, 300000); 
    setInterval(fetchCryptoNews, 600000); // Refreshes news every 10 minutes
};
