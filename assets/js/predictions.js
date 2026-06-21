// assets/js/predictions.js
// Handles Supabase real-time polling, pill filtering, and card rendering for Kalshi markets

// --- 1. INJECT GOOGLE ADSENSE GLOBALLY ---
(function() {
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7950419700899075";
        adScript.crossOrigin = "anonymous";
        document.head.appendChild(adScript);
    }
})();

// --- 2. STATE & CONFIGURATION ---
let userEmail = "";
let userAccessTier = "none";
let predictionMarketsData = [];
let currentPredFilter = 'all'; 
let currentPredSubFilter = 'all'; 
let dataPollingInterval = null;

const categoryMapping = {
    'politics': ['politics', 'elections', 'government'],
    'finance': ['finance', 'economics', 'commodities', 'markets'],
    'crypto': ['crypto', 'cryptocurrency', 'bitcoin'],
    'climate': ['climate', 'weather', 'natural disasters'],
    'culture': ['culture', 'mentions', 'sports', 'movies', 'music', 'awards', 'entertainment'],
    'science': ['science', 'tech', 'technology', 'space']
};

// --- 3. AUTHENTICATION & BOUNCER ---
async function checkAccess() {
    try {
        if (typeof db === 'undefined') {
            setTimeout(checkAccess, 500);
            return;
        }

        const { data: { session }, error } = await db.auth.getSession();
        if (error || !session) {
            window.location.replace('login.html');
        } else {
            userEmail = session.user.email;
            fetchUserData(); 
        }
    } catch(e) { 
        injectUIError("Authentication verification failed.");
    }
}

async function fetchUserData() {
    try {
        const { data, error } = await db.from('client_keys').select('*').eq('email', userEmail).single();
        if (!error && data && data.tier) { 
            userAccessTier = data.tier.toLowerCase();
        } else { 
            userAccessTier = "none"; 
        } 
        
        const mainView = document.getElementById('view-pred-main');
        const lockedView = document.getElementById('view-locked');

        if (userAccessTier === 'none') {
            if (mainView) mainView.classList.add('hidden');
            if (lockedView) lockedView.classList.remove('hidden');
        } else {
            if (mainView) mainView.classList.remove('hidden');
            if (lockedView) lockedView.classList.add('hidden');
            
            // Initialize Data Feed
            await fetchKalshiPredictions();
            dataPollingInterval = setInterval(fetchKalshiPredictions, 30000); 
        }
    } catch(e) { 
        injectUIError("Failed to verify user access tier.");
    }
}

checkAccess();

// --- 4. DATA FETCHING ---
async function fetchKalshiPredictions() {
    try {
        if (typeof db === 'undefined') throw new Error("Supabase client is undefined.");
        
        const { data, error } = await db
            .from('kalshi_predictions')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            predictionMarketsData = data;
            renderActiveFeed();
            renderLiveMatrixTicker();
            updateStatusBar(true);
        } else {
            showLoadingStates(false);
            const container = document.getElementById('predictions-feed-container');
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full border border-dashed border-purpleAccent/20 rounded-xl p-12 text-center bg-void">
                        <p class="font-mono text-xs text-slate-500 uppercase tracking-widest">No active contract telemetry found for this matrix branch.</p>
                    </div>
                `;
                container.classList.remove('hidden');
            }
        }
    } catch (err) {
        updateStatusBar(false);
        injectUIError(`Database Sync Failed: ${err.message}`);
    }
}

// --- 5. FILTERING & UI CONTROLS ---
function setPredFilter(filterValue, btnElement) {
    currentPredFilter = filterValue;
    currentPredSubFilter = 'all'; 

    const container = document.getElementById('pred-pill-container');
    if (container) {
        container.querySelectorAll('button').forEach(btn => {
            btn.className = "shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white";
        });
        if (btnElement) {
            btnElement.className = "shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all bg-purpleAccent/10 text-purpleAccent border-purpleAccent/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]";
        }
    }
    renderActiveFeed();
}

function handlePredSubFilter(value) {
    currentPredSubFilter = value;
    renderActiveFeed();
}

function getBaseCategory(sector) {
    const s = String(sector).toLowerCase().trim();
    for (const [cat, aliases] of Object.entries(categoryMapping)) {
        if (aliases.includes(s) || aliases.some(a => s.includes(a))) return cat;
    }
    return 'other';
}

function extractUniqueSubcategories(dataArray) {
    const subs = new Set();
    dataArray.forEach(market => {
        if (market.target_sector) {
            subs.add(String(market.target_sector).toUpperCase().trim());
        }
    });
    return Array.from(subs).sort();
}

// --- 6. SVG SPARKLINE GENERATOR ---
function generatePurpleSparkline(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return `<svg class="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <path d="M0,15 L100,15" fill="none" stroke="#a855f7" stroke-width="2" stroke-opacity="0.3"></path>
                </svg>`;
    }
    
    const max = Math.max(...dataArray);
    const min = Math.min(...dataArray);
    const range = max - min === 0 ? 1 : max - min;
    
    const width = 100;
    const height = 30;
    const padding = 2;
    
    let pathD = "";
    dataArray.forEach((val, i) => {
        const x = (i / (dataArray.length - 1)) * width;
        const normalizedY = (val - min) / range;
        const y = height - padding - (normalizedY * (height - 2 * padding));
        
        if (i === 0) pathD += `M${x},${y}`;
        else pathD += ` L${x},${y}`;
    });
    
    return `<svg class="w-full h-8 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" preserveAspectRatio="none" viewBox="0 0 ${width} ${height}">
                <path d="${pathD}" fill="none" stroke="#a855f7" stroke-width="2"></path>
            </svg>`;
}

// --- 7. GRID RENDERING & AD INJECTION ---
function renderActiveFeed() {
    const container = document.getElementById('predictions-feed-container');
    const subfilterContainer = document.getElementById('subfilter-container-predictions');
    const subfilterSelect = document.getElementById('subfilter-predictions');
    
    if (!container) return;

    try {
        let filteredMarkets = predictionMarketsData;
        
        if (currentPredFilter !== 'all') {
            filteredMarkets = predictionMarketsData.filter(market => {
                return getBaseCategory(market.target_sector) === currentPredFilter;
            });
        }

        const availableSubs = extractUniqueSubcategories(filteredMarkets);
        if (subfilterContainer && subfilterSelect) {
            let html = `<option value="all">All Markets</option>`;
            availableSubs.forEach(sub => {
                html += `<option value="${sub}">${sub}</option>`;
            });
            subfilterSelect.innerHTML = html;
            
            if (availableSubs.includes(currentPredSubFilter)) {
                subfilterSelect.value = currentPredSubFilter;
            } else {
                subfilterSelect.value = 'all';
                currentPredSubFilter = 'all';
            }
        }

        if (currentPredSubFilter !== 'all') {
            filteredMarkets = filteredMarkets.filter(market => 
                String(market.target_sector).toUpperCase().trim() === currentPredSubFilter
            );
        }

        if (filteredMarkets.length === 0) {
            container.innerHTML = `
                <div class="col-span-full border border-dashed border-purpleAccent/20 rounded-xl p-12 text-center bg-void">
                    <p class="font-mono text-xs text-slate-500 uppercase tracking-widest">No active contract telemetry found for this matrix branch.</p>
                </div>
            `;
            showLoadingStates(false);
            container.classList.remove('hidden');
            return;
        }

        const kalshiUrl = "https://kalshi.com/sign-up/?referral=d1acc622-b754-4d23-85d7-19059ec5dc0f";

        let feedHtml = '';
        filteredMarkets.forEach((market, index) => {
            const sector = market.target_sector || "GLOBAL";
            const title = market.event_title || "Pending Event Context";
            const subtitle = market.subtitle || "No further conditions applied.";
            const prob = market.implied_probability || "0.0%";
            const odds = market.converted_american_odds || "EVEN";
            
            // Extract the new Deep Dive telemetry metrics
            const volume = market.volume_formatted || "N/A";
            const whaleFlow = market.whale_flow || "NEUTRAL";
            const historyArray = market.history_array || [];
            
            const sparklineHtml = generatePurpleSparkline(historyArray);
            
            // Dynamic styling for Whale Flow sentiment
            let whaleColorClass = "text-slate-400";
            if (whaleFlow.includes("BUY") || whaleFlow.includes("BULLISH")) whaleColorClass = "text-neon";
            else if (whaleFlow.includes("SELL") || whaleFlow.includes("BEARISH")) whaleColorClass = "text-redAccent";
            else if (whaleFlow !== "NEUTRAL") whaleColorClass = "text-purpleAccent";
            
            feedHtml += `
                <div class="bg-void border border-white/10 hover:border-purpleAccent/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] group animate-flash-update-purple">
                    <div class="absolute top-0 right-0 w-12 h-12 bg-purpleAccent/5 group-hover:bg-purpleAccent/10 transition-colors transform rotate-45 translate-x-6 -translate-y-6 border-b border-white/10 group-hover:border-purpleAccent/30"></div>
                    
                    <div class="relative z-10 w-full">
                        <div class="mb-4 text-left">
                            <span class="inline-block bg-purpleAccent/10 border border-purpleAccent/30 text-purpleAccent px-3 py-1.5 rounded font-mono text-[9px] font-bold uppercase tracking-widest whitespace-normal break-words">
                                ${sector}
                            </span>
                        </div>
                        
                        <h3 class="font-heading font-black text-white text-base tracking-wide leading-snug mb-2 group-hover:text-purpleAccent transition-colors text-left">
                            ${title}
                        </h3>
                        
                        <p class="text-slate-400 text-[10px] leading-relaxed font-sans mb-4 text-left border-t border-white/5 pt-3 mt-2">
                            ${subtitle}
                        </p>
                        
                        <div class="mb-4 bg-black/40 border border-white/5 rounded-xl p-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-[9px] font-mono text-slate-500 tracking-widest uppercase">24H Volume</span>
                                <span class="text-[10px] font-bold text-white font-mono">${volume}</span>
                            </div>
                            <div class="flex justify-between items-center mb-3">
                                <span class="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Whale Flow</span>
                                <span class="text-[10px] font-bold ${whaleColorClass} font-mono uppercase">${whaleFlow}</span>
                            </div>
                            <div class="pt-2 border-t border-white/5">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Trend Velocity (24H)</span>
                                </div>
                                ${sparklineHtml}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-auto pt-4 border-t border-white/5 relative z-10">
                        <div class="grid grid-cols-2 gap-2 mb-4 bg-black/40 border border-white/5 p-3 rounded-xl">
                            <div class="text-center">
                                <span class="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">Probability</span>
                                <span class="font-impact text-xl text-purpleAccent tracking-wider">
                                    ${prob}
                                </span>
                            </div>
                            <div class="text-center border-l border-white/5">
                                <span class="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">Moneyline</span>
                                <span class="font-mono font-bold text-sm text-white block mt-1">
                                    ${odds}
                                </span>
                            </div>
                        </div>
                        <a href="${kalshiUrl}" target="_blank" class="w-full flex items-center justify-between bg-purpleAccent/5 hover:bg-purpleAccent text-purpleAccent hover:text-void border border-purpleAccent/30 hover:border-transparent rounded-xl px-4 py-2.5 transition-all duration-300 text-xs font-mono font-bold uppercase tracking-widest">
                            <span>[ ENTER PLATFORM ]</span>
                            <svg class="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                            </svg>
                        </a>
                    </div>
                </div>
            `;

            // AdSense Injection
            if ((index + 1) % 5 === 0 && index !== filteredMarkets.length - 1) {
                feedHtml += `
                    <div class="bg-void border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-purpleAccent/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-center min-h-[220px]">
                        <div class="absolute top-2 right-3 text-[8px] font-mono text-purpleAccent/50 uppercase tracking-widest flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-purpleAccent animate-pulse"></span> SPONSORED</div>
                        <div class="ad-terminal-bracket w-full flex-grow flex items-center justify-center border border-white/5 mt-5 rounded bg-[#000000] overflow-hidden">
                            <ins class="adsbygoogle"
                                 style="display:block; width:100%; height:100%; text-align:center;"
                                 data-ad-format="fluid"
                                 data-ad-layout-key="-6t+ed+2i-1n-4w"
                                 data-ad-client="ca-pub-7950419700899075"
                                 data-ad-slot="6353427997"></ins>
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = feedHtml;
        showLoadingStates(false);
        container.classList.remove('hidden');

        setTimeout(() => {
            try {
                const adTags = container.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
                adTags.forEach(() => {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                });
            } catch(e) {
                console.warn("AdSense push failed inside prediction feed loop", e);
            }
        }, 100);

    } catch(e) {
        injectUIError(`Rendering Engine Failed: ${e.message}`);
    }
}

// --- 8. BOTTOM MATRIX STREAM / TICKER RENDERING ---
function renderLiveMatrixTicker() {
    const tickerContainer = document.getElementById('ticker-container');
    const wrapper = document.getElementById('global-ticker-wrapper');
    
    if (!tickerContainer || predictionMarketsData.length === 0) return;

    if (wrapper) {
        wrapper.classList.remove('hidden');
    }

    let items = [];
    predictionMarketsData.slice(0, 10).forEach(market => {
        let textBlock = `<span class="text-purpleAccent font-black">🌍 MARKET SHIFT:</span> <span class="text-white ml-2">${market.event_title || market.ticker}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">${market.converted_american_odds}</span> <span class="text-slate-500">|</span> <span class="text-purpleAccent font-bold">🎯 ${market.implied_probability}</span>`;
        items.push(`<div class="inline-flex items-center gap-3 px-6 font-mono text-xs uppercase tracking-widest whitespace-nowrap shrink-0">${textBlock}</div>`);
    });

    const rowHtml = items.join(`<span class="text-slate-600 font-bold px-2 shrink-0">•</span>`);
    tickerContainer.innerHTML = `<div class="flex items-center shrink-0 w-max">${rowHtml}<span class="text-slate-600 font-bold px-8 shrink-0">•</span>${rowHtml}</div>`; 
}

// --- 9. UTILS ---
function showLoadingStates(isLoading) {
    const loader = document.getElementById('loading-state-predictions');
    const container = document.getElementById('predictions-feed-container');

    if (isLoading) {
        if (loader) loader.classList.remove('hidden');
        if (container) container.classList.add('hidden');
    } else {
        if (loader) loader.classList.add('hidden');
    }
}

function updateStatusBar(isLive) {
    const pulse = document.getElementById('status-pulse');
    const text = document.getElementById('status-text');
    if (!pulse || !text) return;

    if (isLive) {
        pulse.className = "w-2 h-2 rounded-full bg-purpleAccent animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]";
        text.innerText = "Pipeline Live";
        text.className = "font-mono font-bold text-purpleAccent text-[10px] tracking-widest uppercase hidden sm:inline-block";
    } else {
        pulse.className = "w-2 h-2 rounded-full bg-redAccent animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]";
        text.innerText = "Sync Error";
        text.className = "font-mono font-bold text-redAccent text-[10px] tracking-widest uppercase hidden sm:inline-block";
    }
}

function injectUIError(message) {
    showLoadingStates(false);
    const container = document.getElementById('predictions-feed-container');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full border border-redAccent/30 bg-redAccent/10 rounded-xl p-8 text-center shadow-lg">
                <p class="font-mono text-xs text-redAccent font-bold uppercase tracking-widest">[SYSTEM ERROR] ${message}</p>
                <p class="font-mono text-[10px] text-slate-400 mt-2">Check console logs for stack trace.</p>
            </div>
        `;
        container.classList.remove('hidden');
    }
}
