// assets/js/crypto.js

let userEmail = "";
let userAccessTier = "none"; 

let lastFetchedMomentumData = [];
let currentMomentumFilter = 'all';
let momentumDataHash = ""; 

let lastFetchedWallData = [];
let currentWallFilter = 'all';
let wallDataHash = ""; 

let lastFetchedRegimeData = [];
let currentRegimeFilter = 'all';
let regimeDataHash = ""; 

let currentActiveCryptoTab = ""; 

function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "\\'"); 
}

// --- COMPREHENSIVE CRYPTO DICTIONARY WITH FALLBACKS ---
const CRYPTO_MAP = {
    'btc': { n: 'Bitcoin', c: '#F7931A', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg' },
    'eth': { n: 'Ethereum', c: '#627EEA', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg' },
    'sol': { n: 'Solana', c: '#14F195', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg' },
    'xrp': { n: 'XRP', c: '#23292F', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg' },
    'ada': { n: 'Cardano', c: '#0033AD', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.svg' },
    'avax': { n: 'Avalanche', c: '#E84142', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg' },
    'doge': { n: 'Dogecoin', c: '#C2A633', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg' },
    'dot': { n: 'Polkadot', c: '#E6007A', icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg' },
    'matic': { n: 'Polygon', c: '#8247E5', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg' },
    'pol': { n: 'Polygon', c: '#8247E5', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg' },
    'link': { n: 'Chainlink', c: '#2A5ADA', icon: 'https://cryptologos.cc/logos/chainlink-link-logo.svg' },
    'shib': { n: 'Shiba Inu', c: '#FFA409', icon: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.svg' },
    'ltc': { n: 'Litecoin', c: '#345D9D', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg' },
    'atom': { n: 'Cosmos', c: '#2E3148', icon: 'https://cryptologos.cc/logos/cosmos-atom-logo.svg' },
    'algo': { n: 'Algorand', c: '#000000', icon: 'https://cryptologos.cc/logos/algorand-algo-logo.svg' },
    'uni': { n: 'Uniswap', c: '#FF007A', icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg' },
    'xlm': { n: 'Stellar', c: '#14B6E7', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.svg' },
    'rndr': { n: 'Render', c: '#D42A2A', icon: 'https://cryptologos.cc/logos/render-token-rndr-logo.svg' },
    'fet': { n: 'Fetch.ai', c: '#1B2026', icon: 'https://cryptologos.cc/logos/fetch-ai-fet-logo.svg' },
    'sui': { n: 'Sui', c: '#38BDF8', icon: 'https://cryptologos.cc/logos/sui-sui-logo.svg' },
    'apt': { n: 'Aptos', c: '#22D3EE', icon: 'https://cryptologos.cc/logos/aptos-apt-logo.svg' },
    'arb': { n: 'Arbitrum', c: '#28A0F0', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg' },
    'op': { n: 'Optimism', c: '#FF0420', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg' },
    'tia': { n: 'Celestia', c: '#7A00E6', icon: 'https://cryptologos.cc/logos/celestia-tia-logo.svg' },
    'inj': { n: 'Injective', c: '#00D1FF', icon: 'https://cryptologos.cc/logos/injective-inj-logo.svg' },
    'hnt': { n: 'Helium', c: '#474DFF', icon: 'https://cryptologos.cc/logos/helium-hnt-logo.svg' },
    'honey': { n: 'Hivemapper', c: '#FFD700', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/22904.png' },
    'fil': { n: 'Filecoin', c: '#0090FF', icon: 'https://cryptologos.cc/logos/filecoin-fil-logo.svg' },
    'ar': { n: 'Arweave', c: '#000000', icon: 'https://cryptologos.cc/logos/arweave-ar-logo.svg' },
    'tao': { n: 'Bittensor', c: '#000000', icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/25569.png' },
    'kas': { n: 'Kaspa', c: '#70C7BA', icon: 'https://cryptologos.cc/logos/kaspa-kas-logo.svg' },
    'hbar': { n: 'Hedera', c: '#000000', icon: 'https://cryptologos.cc/logos/hedera-hbar-logo.svg' },
    'qnt': { n: 'Quant', c: '#000000', icon: 'https://cryptologos.cc/logos/quant-qnt-logo.svg' },
    'pepe': { n: 'Pepe', c: '#4B9445', icon: 'https://cryptologos.cc/logos/pepe-pepe-logo.svg' },
    'wif': { n: 'dogwifhat', c: '#D3B683', icon: 'https://cryptologos.cc/logos/dogwifhat-dogwifhat-logo.svg' },
    'bonk': { n: 'Bonk', c: '#D47D3B', icon: 'https://cryptologos.cc/logos/bonk1-bonk-logo.svg' },
    'usdt': { n: 'Tether', c: '#26A17B', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg' },
    'usdc': { n: 'USDC', c: '#2775CA', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg' }
};

const DEPIN_ASSETS = ['hnt', 'fil', 'ar', 'rndr', 'tao', 'akt', 'honey'];

function getCryptoDetails(assetStr) {
    if (!assetStr) return { n: 'Unknown', c: '#06b6d4', icon: null };
    
    // Parse pair (e.g. "SOL/USDC" or "SOL-USDT")
    let symbol = assetStr.split('/')[0].split('-')[0].toLowerCase().trim();
    
    // Check dictionary
    if (CRYPTO_MAP[symbol]) return CRYPTO_MAP[symbol];
    
    // Fallback if not in dictionary but try pulling generic CDN just in case
    return { 
        n: assetStr.split('/')[0].toUpperCase(), 
        c: '#06b6d4', 
        icon: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${symbol}.svg` 
    };
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

// --- NATIVE SVG SPARKLINE GENERATOR (MODIFIED FOR CRYPTO) ---
function generateSparklineSvg(dataArray, colorHex, isRegime = false) {
    if (!dataArray || dataArray.length < 2) return '';
    const w = 200;
    const h = 40;
    
    let min, max, range;
    if (isRegime) {
        max = Math.max(Math.abs(...dataArray));
        min = -max;
        range = max * 2 || 1;
    } else {
        min = Math.min(...dataArray);
        max = Math.max(...dataArray);
        range = (max - min) || 1; 
    }

    const points = dataArray.map((val, i) => {
        const x = (i / (dataArray.length - 1)) * w;
        const y = h - ((val - min) / range) * h * 0.8 - (h * 0.1); 
        return `${x},${y}`;
    });

    const isFavorableTrend = dataArray[dataArray.length - 1] > dataArray[0];
    
    let strokeColor = colorHex;
    let fillColor = colorHex.replace(')', ', 0.15)').replace('rgb', 'rgba'); 
    
    if (colorHex.startsWith('#')) {
        strokeColor = colorHex;
        fillColor = colorHex + '25'; 
    }

    if (isRegime) {
        const currentVal = dataArray[dataArray.length - 1];
        strokeColor = currentVal > 0 ? '#39FF14' : '#ef4444'; 
        fillColor = currentVal > 0 ? 'rgba(57,255,20,0.15)' : 'rgba(239,68,68,0.15)';
    }

    const pathStr = `M ${points.join(' L ')}`;
    const fillStr = `M 0,${h} L ${points.join(' L ')} L ${w},${h} Z`;

    const lastX = points[points.length-1].split(',')[0];
    const lastY = points[points.length-1].split(',')[1];

    let baselineHtml = '';
    if (isRegime) {
        baselineHtml = `<line x1="0" y1="${h/2}" x2="${w}" y2="${h/2}" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2" />`;
    }

    return `
        <svg viewBox="0 0 ${w} ${h}" class="w-full h-full" preserveAspectRatio="none">
            ${baselineHtml}
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
            initRealtimeListeners(); 
        }
    } catch(e) { console.error(e); }
}

async function fetchUserData() {
    try {
        const { data, error } = await db.from('client_keys').select('*').eq('email', userEmail).single();
        if (!error && data && data.tier) { 
            userAccessTier = data.tier.toLowerCase();
        } else { userAccessTier = "none"; } 
        
        if (userAccessTier !== 'crypto' && userAccessTier !== 'all') {
            switchCryptoTab('locked');
            return;
        }
        
        switchCryptoTab('crypto-momentum'); 
        
    } catch(e) { console.error(e); }
}
checkAccess();

function switchCryptoTab(target) {
    currentActiveCryptoTab = target;
    const tabs = { 'crypto-momentum': document.getElementById('tab-crypto-momentum'), 'crypto-wall': document.getElementById('tab-crypto-wall'), 'crypto-regime': document.getElementById('tab-crypto-regime') };
    const views = { 'crypto-momentum': document.getElementById('view-crypto-momentum'), 'crypto-wall': document.getElementById('view-crypto-wall'), 'crypto-regime': document.getElementById('view-crypto-regime'), 'locked': document.getElementById('view-locked') };

    if (target === 'locked') {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
        views.locked.classList.remove('hidden');
        return;
    }

    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
    
    tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-white/10 text-white border border-cyanAccent/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex justify-between items-center group';
    views[target].classList.remove('hidden');

    if(target === 'crypto-momentum') { loadMomentumTelemetry(true); }
    if(target === 'crypto-wall') { loadWallTelemetry(true); }
    if(target === 'crypto-regime') { loadRegimeTelemetry(true); }
}


function initRealtimeListeners() {
    if (typeof db === 'undefined') return;

    db.channel('crypto-all-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'crypto_momentum_data' }, payload => handleRowUpdate(payload.new, 'crypto-momentum'))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'crypto_wall_data' }, payload => handleRowUpdate(payload.new, 'crypto-wall'))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'crypto_regime_data' }, payload => handleRowUpdate(payload.new, 'crypto-regime'))
      .subscribe();
}

function handleRowUpdate(updatedRow, type) {
    if (updatedRow.status && updatedRow.status.toLowerCase() === 'expired') {
        const cardElement = document.getElementById(`card-${updatedRow.id}`);
        if (cardElement) {
            cardElement.classList.add('opacity-40', 'grayscale', 'pointer-events-none');
            cardElement.classList.remove('animate-flash-update');
            const badgeContainer = cardElement.querySelector('.status-badge-container');
            if (badgeContainer) {
                badgeContainer.innerHTML = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;
            }
            setTimeout(() => {
                if (cardElement && cardElement.parentNode) {
                    cardElement.remove();
                }
            }, 300000);
        }
    }
}

// --- CARD GENERATORS ---

function createMomentumCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        const pair = String(edge.asset_pair || edge.pair || "UNKNOWN/USD");
        const baseAsset = pair.split('/')[0].split('-')[0].toLowerCase();
        
        const cryptoDetails = getCryptoDetails(pair);
        const iconHtml = cryptoDetails.icon 
            ? `<img src="${cryptoDetails.icon}" class="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" onerror="this.outerHTML='<div class=\\'w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-inner\\'>${baseAsset.substring(0,3)}</div>'">`
            : `<div class="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-inner">${baseAsset.substring(0,3)}</div>`;

        const exchangeLogo = getExchangeLogo(edge.exchange || edge.market || 'Binance');
        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        
        const adxScore = parseFloat(edge.edge_score || edge.adx || edge.momentum || 0).toFixed(1);
        const edgeFormatted = `${adxScore} ADX`;
        
        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : 'animate-flash-update';

        let statusBadge = `<span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse shrink-0"></span>`;
        if (isExpired) {
            statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;
        }

        // Sparkline Logic
        let history = edge.history_array || edge.history || edge.line_history;
        if (!history || !Array.isArray(history) || history.length < 2) {
            // Frontend Simulation if backend isn't ready
            const currentAdx = parseFloat(adxScore);
            history = [];
            let walk = currentAdx - 10; 
            for(let i=0; i<10; i++) {
                history.push(walk);
                walk += (Math.random() * 3) - 0.5; 
            }
            history[9] = currentAdx; 
        }
        const sparklineHtml = generateSparklineSvg(history, cryptoDetails.c);

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-between h-full ${opacityClass}">
                <div class="absolute -top-10 -right-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-20" style="background-color: ${cryptoDetails.c}"></div>
                
                <div class="flex justify-between items-start mb-3 relative z-10 w-full gap-2">
                    <div class="flex items-center gap-3 flex-1 min-w-0 pr-1">
                        ${iconHtml}
                        <div class="flex-1 min-w-0 flex flex-col">
                            <h2 class="font-impact text-lg font-black uppercase tracking-wide text-white leading-tight break-words">${pair}</h2>
                            <p class="text-[9px] text-slate-400 font-bold tracking-widest uppercase leading-tight truncate" style="color: ${cryptoDetails.c}">${cryptoDetails.n}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end shrink-0 gap-0.5">
                        <span class="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">${timestamp}</span>
                        <div class="bg-studio/80 border border-white/10 rounded-lg p-1.5 shadow-lg flex items-center justify-center overflow-hidden w-16 h-6">
                            ${exchangeLogo}
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-3 relative z-10 flex-grow flex flex-col justify-end">
                    
                    <div class="h-12 w-full bg-black/40 border border-white/5 rounded-lg relative overflow-hidden mb-3">
                        <div class="absolute top-1 left-2 z-10 flex items-center gap-1.5">
                            <span class="text-[7px] font-bold text-slate-500 uppercase tracking-widest">ADX Momentum (24h)</span>
                        </div>
                        <div class="absolute inset-0 pt-4 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            ${sparklineHtml}
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-2.5 mb-2 gap-2 overflow-hidden w-full">
                        <span class="text-[8px] font-mono text-slate-500 uppercase tracking-widest truncate min-w-0 flex-1 leading-tight">Trend Strength</span>
                        <div class="status-badge-container flex items-center gap-1.5 shrink-0">
                            ${isExpired ? statusBadge : `
                                ${statusBadge}
                                <span class="text-cyanAccent font-mono font-bold text-[10px] tracking-widest whitespace-nowrap shrink-0">${edgeFormatted}</span>
                            `}
                        </div>
                    </div>
                    
                    <a href="api.html" class="w-full bg-white/5 hover:bg-cyanAccent/20 border border-white/10 hover:border-cyanAccent/50 text-slate-300 hover:text-cyanAccent shadow-[0_0_10px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 py-1.5 rounded-lg font-heading text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group">
                        Execute via API
                    </a>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

function createWallCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        const pair = String(edge.asset_pair || edge.pair || "UNKNOWN/USD");
        const baseAsset = pair.split('/')[0].split('-')[0].toLowerCase();
        
        const cryptoDetails = getCryptoDetails(pair);
        const iconHtml = cryptoDetails.icon 
            ? `<img src="${cryptoDetails.icon}" class="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" onerror="this.outerHTML='<div class=\\'w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-inner\\'>${baseAsset.substring(0,3)}</div>'">`
            : `<div class="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-inner">${baseAsset.substring(0,3)}</div>`;

        const exchangeLogo = getExchangeLogo(edge.exchange || edge.market || 'Binance');
        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        
        const volDiscrepancy = parseFloat(edge.edge_score || edge.vol_diff || 0).toFixed(1);
        const edgeFormatted = `${volDiscrepancy}% ANOMALY`;
        
        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : 'animate-flash-update';

        let statusBadge = `<span class="w-1.5 h-1.5 rounded-full bg-redAccent animate-pulse shrink-0"></span>`;
        if (isExpired) {
            statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;
        }

        // Sparkline Logic
        let history = edge.history_array || edge.history;
        if (!history || !Array.isArray(history) || history.length < 2) {
            const currentVol = parseFloat(volDiscrepancy);
            history = [];
            let walk = currentVol / 2; 
            for(let i=0; i<9; i++) {
                history.push(walk);
                walk += (Math.random() * 2) - 1; 
            }
            history[9] = currentVol; 
        }
        const sparklineHtml = generateSparklineSvg(history, '#ef4444');

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-between h-full ${opacityClass}">
                <div class="absolute -top-10 -right-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-20 bg-redAccent"></div>
                
                <div class="flex justify-between items-start mb-3 relative z-10 w-full gap-2">
                    <div class="flex items-center gap-3 flex-1 min-w-0 pr-1">
                        ${iconHtml}
                        <div class="flex-1 min-w-0 flex flex-col">
                            <h2 class="font-impact text-lg font-black uppercase tracking-wide text-white leading-tight break-words">${pair}</h2>
                            <p class="text-[9px] text-redAccent font-bold tracking-widest uppercase leading-tight truncate">Liquidity Spike</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end shrink-0 gap-0.5">
                        <span class="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">${timestamp}</span>
                        <div class="bg-studio/80 border border-white/10 rounded-lg p-1.5 shadow-lg flex items-center justify-center overflow-hidden w-16 h-6">
                            ${exchangeLogo}
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-3 relative z-10 flex-grow flex flex-col justify-end">
                    
                    <div class="h-12 w-full bg-black/40 border border-white/5 rounded-lg relative overflow-hidden mb-3">
                        <div class="absolute top-1 left-2 z-10 flex items-center gap-1.5">
                            <span class="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Cross-Exchange Vol Flow</span>
                        </div>
                        <div class="absolute inset-0 pt-4 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            ${sparklineHtml}
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-2.5 mb-2 gap-2 overflow-hidden w-full">
                        <span class="text-[8px] font-mono text-slate-500 uppercase tracking-widest truncate min-w-0 flex-1 leading-tight">Order Book Delta</span>
                        <div class="status-badge-container flex items-center gap-1.5 shrink-0">
                            ${isExpired ? statusBadge : `
                                ${statusBadge}
                                <span class="text-redAccent font-mono font-bold text-[10px] tracking-widest whitespace-nowrap shrink-0">${edgeFormatted}</span>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

function createRegimeCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        const pair = String(edge.asset_pair || edge.pair || "UNKNOWN/USD");
        const baseAsset = pair.split('/')[0].split('-')[0].toLowerCase();
        
        const cryptoDetails = getCryptoDetails(pair);
        const iconHtml = cryptoDetails.icon 
            ? `<img src="${cryptoDetails.icon}" class="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" onerror="this.outerHTML='<div class=\\'w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-inner\\'>${baseAsset.substring(0,3)}</div>'">`
            : `<div class="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-inner">${baseAsset.substring(0,3)}</div>`;

        const exchangeLogo = getExchangeLogo(edge.exchange || edge.market || 'Binance');
        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        
        const confidenceScore = parseFloat(edge.edge_score || edge.confidence || 0).toFixed(1);
        
        let regimeType = "CHOP";
        let regimeColor = "text-slate-400";
        if (confidenceScore > 5) { regimeType = "BULL"; regimeColor = "text-neon"; }
        if (confidenceScore < -5) { regimeType = "BEAR"; regimeColor = "text-redAccent"; }

        const edgeFormatted = `${Math.abs(confidenceScore)} CONF`;
        
        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : 'animate-flash-update';

        let statusBadge = `<span class="w-1.5 h-1.5 rounded-full ${regimeType === 'BULL' ? 'bg-neon' : regimeType === 'BEAR' ? 'bg-redAccent' : 'bg-slate-400'} animate-pulse shrink-0"></span>`;
        if (isExpired) {
            statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;
        }

        // Sparkline Logic
        let history = edge.history_array || edge.history;
        if (!history || !Array.isArray(history) || history.length < 2) {
            const currentConf = parseFloat(confidenceScore);
            history = [];
            let walk = 0; 
            for(let i=0; i<9; i++) {
                history.push(walk);
                walk += (currentConf / 10) + ((Math.random() * 2) - 1); 
            }
            history[9] = currentConf; 
        }
        const sparklineHtml = generateSparklineSvg(history, '#ffffff', true);

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-between h-full ${opacityClass}">
                <div class="absolute -top-10 -right-10 w-32 h-32 blur-[50px] rounded-full pointer-events-none opacity-20" style="background-color: ${regimeType === 'BULL' ? '#39FF14' : regimeType === 'BEAR' ? '#ef4444' : '#94a3b8'}"></div>
                
                <div class="flex justify-between items-start mb-3 relative z-10 w-full gap-2">
                    <div class="flex items-center gap-3 flex-1 min-w-0 pr-1">
                        ${iconHtml}
                        <div class="flex-1 min-w-0 flex flex-col">
                            <h2 class="font-impact text-lg font-black uppercase tracking-wide text-white leading-tight break-words">${pair}</h2>
                            <p class="text-[9px] ${regimeColor} font-bold tracking-widest uppercase leading-tight truncate">${regimeType} SHIFT</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end shrink-0 gap-0.5">
                        <span class="text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-1">${timestamp}</span>
                        <div class="bg-studio/80 border border-white/10 rounded-lg p-1.5 shadow-lg flex items-center justify-center overflow-hidden w-16 h-6">
                            ${exchangeLogo}
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-3 relative z-10 flex-grow flex flex-col justify-end">
                    
                    <div class="h-12 w-full bg-black/40 border border-white/5 rounded-lg relative overflow-hidden mb-3">
                        <div class="absolute top-1 left-2 z-10 flex items-center gap-1.5">
                            <span class="text-[7px] font-bold text-slate-500 uppercase tracking-widest">MA Crossover Trend</span>
                        </div>
                        <div class="absolute inset-0 pt-4 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            ${sparklineHtml}
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-2.5 mb-2 gap-2 overflow-hidden w-full">
                        <span class="text-[8px] font-mono text-slate-500 uppercase tracking-widest truncate min-w-0 flex-1 leading-tight">Algo Confidence</span>
                        <div class="status-badge-container flex items-center gap-1.5 shrink-0">
                            ${isExpired ? statusBadge : `
                                ${statusBadge}
                                <span class="${regimeColor} font-mono font-bold text-[10px] tracking-widest whitespace-nowrap shrink-0">${edgeFormatted}</span>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}


function renderCryptoFeed(data, type) {
    let container, createFn, currentFilter;
    if(type === 'crypto-momentum') { container = document.getElementById('crypto-momentum-feed-container'); createFn = createMomentumCard; currentFilter = currentMomentumFilter; }
    if(type === 'crypto-wall') { container = document.getElementById('crypto-wall-feed-container'); createFn = createWallCard; currentFilter = currentWallFilter; }
    if(type === 'crypto-regime') { container = document.getElementById('crypto-regime-feed-container'); createFn = createRegimeCard; currentFilter = currentRegimeFilter; }

    if (!container) return;
    
    let activeData = Array.isArray(data) ? data : [];

    const filteredData = (currentFilter !== 'all') ? activeData.filter(edge => {
        const pair = String(edge.asset_pair || edge.pair || '').toLowerCase();
        
        if (currentFilter === 'depin') {
            const baseAsset = pair.split('/')[0].split('-')[0];
            return DEPIN_ASSETS.includes(baseAsset);
        }
        
        return pair.includes(currentFilter);
    }) : activeData;

    if (filteredData.length === 0) {
        container.innerHTML = `<div class="col-span-full border border-dashed border-white/20 bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center shadow-lg"><span class="text-cyanAccent font-mono font-bold tracking-widest uppercase animate-pulse">SYSTEM ONLINE: AWAITING NETWORK SIGNALS...</span></div>`;
        return;
    }
    
    container.innerHTML = filteredData.map(edge => createFn(edge)).join('');
}


function setCryptoFilter(tab, value, btnElement) {
    const container = btnElement.parentElement;
    
    container.querySelectorAll('button').forEach(btn => {
        btn.className = "shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white";
    });
    
    btnElement.className = "shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all bg-cyanAccent/10 text-cyanAccent border-cyanAccent/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]";

    if (tab === 'crypto-momentum') { 
        currentMomentumFilter = value; 
        renderCryptoFeed(lastFetchedMomentumData, 'crypto-momentum'); 
    }
    if (tab === 'crypto-wall') { 
        currentWallFilter = value; 
        renderCryptoFeed(lastFetchedWallData, 'crypto-wall'); 
    }
    if (tab === 'crypto-regime') { 
        currentRegimeFilter = value; 
        renderCryptoFeed(lastFetchedRegimeData, 'crypto-regime'); 
    }
}


async function loadMomentumTelemetry(isInitialLoad = false) {
    if (currentActiveCryptoTab !== 'crypto-momentum') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('crypto_momentum_data').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        
        const currentDataHash = data ? JSON.stringify(data) : "";
        if (!isInitialLoad && currentDataHash === momentumDataHash) return; 

        if (isInitialLoad) {
            document.getElementById('loading-state-crypto-momentum').classList.add('hidden');
            document.getElementById('crypto-momentum-feed-container').classList.remove('hidden');
        }
        momentumDataHash = currentDataHash;
        lastFetchedMomentumData = data || [];
        renderCryptoFeed(lastFetchedMomentumData, 'crypto-momentum');
    } catch (err) {}
}

async function loadWallTelemetry(isInitialLoad = false) {
    if (currentActiveCryptoTab !== 'crypto-wall') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('crypto_wall_data').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        
        const currentDataHash = data ? JSON.stringify(data) : "";
        if (!isInitialLoad && currentDataHash === wallDataHash) return; 

        if (isInitialLoad) {
            document.getElementById('loading-state-crypto-wall').classList.add('hidden');
            document.getElementById('crypto-wall-feed-container').classList.remove('hidden');
        }
        wallDataHash = currentDataHash;
        lastFetchedWallData = data || [];
        renderCryptoFeed(lastFetchedWallData, 'crypto-wall');
    } catch (err) {}
}

async function loadRegimeTelemetry(isInitialLoad = false) {
    if (currentActiveCryptoTab !== 'crypto-regime') return;
    try {
        if (typeof db === 'undefined') return;
        
        const { data, error } = await db.from('crypto_regime_data').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        
        const currentDataHash = data ? JSON.stringify(data) : "";
        if (!isInitialLoad && currentDataHash === regimeDataHash) return; 

        if (isInitialLoad) {
            document.getElementById('loading-state-crypto-regime').classList.add('hidden');
            document.getElementById('crypto-regime-feed-container').classList.remove('hidden');
        }
        regimeDataHash = currentDataHash;
        lastFetchedRegimeData = data || [];
        renderCryptoFeed(lastFetchedRegimeData, 'crypto-regime');
    } catch (err) {}
}

window.onload = () => {
    setInterval(() => { if (currentActiveCryptoTab === 'crypto-momentum') loadMomentumTelemetry(false); }, 30000); 
    setInterval(() => { if (currentActiveCryptoTab === 'crypto-wall') loadWallTelemetry(false); }, 30000); 
    setInterval(() => { if (currentActiveCryptoTab === 'crypto-regime') loadRegimeTelemetry(false); }, 30000); 
};
