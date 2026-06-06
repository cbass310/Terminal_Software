// assets/js/predictions.js
// Handles Supabase real-time polling, pill filtering, and card rendering for Kalshi markets

// --- 1. STATE & CONFIGURATION ---
let supabaseClient = null;
let predictionMarketsData = [];
let currentPredFilter = 'all'; // Top-level pill filter
let currentPredSubFilter = 'all'; // Dropdown filter
let dataPollingInterval = null;

// Ensure AdSense is loaded
(function() {
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7950419700899075";
        adScript.crossOrigin = "anonymous";
        document.head.appendChild(adScript);
    }
})();

// Map UI pills to potential backend 'target_sector' matches from Kalshi
const categoryMapping = {
    'politics': ['politics', 'elections', 'government'],
    'finance': ['finance', 'economics', 'commodities', 'markets'],
    'crypto': ['crypto', 'cryptocurrency', 'bitcoin'],
    'climate': ['climate', 'weather', 'natural disasters'],
    'culture': ['culture', 'mentions', 'sports', 'movies', 'music', 'awards', 'entertainment'],
    'science': ['science', 'tech', 'technology', 'space']
};

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    initializeSupabase();
    await fetchKalshiPredictions();
    dataPollingInterval = setInterval(fetchKalshiPredictions, 30000); // 30s Sweep
});

function initializeSupabase() {
    if (typeof supabase !== 'undefined' && window.supabaseUrl && window.supabaseAnonKey) {
        supabaseClient = supabase.createClient(window.supabaseUrl, window.supabaseAnonKey);
    } else {
        console.error("Supabase credentials missing.");
        showLoadingStates(false);
    }
}

// --- 3. DATA FETCHING ---
async function fetchKalshiPredictions() {
    if (!supabaseClient) {
        generateMockDataIfMissing();
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('kalshi_predictions')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            predictionMarketsData = data;
            renderActiveFeed();
            renderLiveMatrixTicker();
            updateStatusBar(true);
        }
    } catch (err) {
        console.error("Error pulling from public.kalshi_predictions:", err.message);
        updateStatusBar(false);
    }
}

// --- 4. FILTERING & UI CONTROLS ---
function setPredFilter(filterValue, btnElement) {
    currentPredFilter = filterValue;
    currentPredSubFilter = 'all'; // Reset subfilter when main category changes

    // Update Pill UI
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

// --- 5. GRID RENDERING & AD INJECTION ---
function renderActiveFeed() {
    const container = document.getElementById('predictions-feed-container');
    const loadingState = document.getElementById('loading-state-predictions');
    const subfilterContainer = document.getElementById('subfilter-container-predictions');
    const subfilterSelect = document.getElementById('subfilter-predictions');
    
    if (!container) return;

    // Apply Top-Level Filter
    let filteredMarkets = predictionMarketsData;
    if (currentPredFilter !== 'all') {
        filteredMarkets = predictionMarketsData.filter(market => {
            return getBaseCategory(market.target_sector) === currentPredFilter;
        });
    }

    // Populate Dynamic Subfilter Dropdown
    const availableSubs = extractUniqueSubcategories(filteredMarkets);
    if (subfilterContainer && subfilterSelect) {
        if (availableSubs.length > 0 && currentPredFilter !== 'all') {
            subfilterContainer.classList.remove('hidden');
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
        } else {
            subfilterContainer.classList.add('hidden');
            currentPredSubFilter = 'all';
        }
    }

    // Apply Sub-Filter
    if (currentPredSubFilter !== 'all') {
        filteredMarkets = filteredMarkets.filter(market => 
            String(market.target_sector).toUpperCase().trim() === currentPredSubFilter
        );
    }

    // Empty State Check
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

    // Build the Grid HTML
    let feedHtml = '';
    filteredMarkets.forEach((market, index) => {
        const cleanTicker = market.ticker || "";
        const kalshiUrl = `https://kalshi.com/markets/${cleanTicker.toLowerCase()}`;
        
        feedHtml += `
            <div class="bg-void border border-white/10 hover:border-purpleAccent/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] group animate-flash-update-purple">
                
                <div class="absolute top-0 right-0 w-12 h-12 bg-purpleAccent/5 group-hover:bg-purpleAccent/10 transition-colors transform rotate-45 translate-x-6 -translate-y-6 border-b border-white/10 group-hover:border-purpleAccent/30"></div>
                
                <div>
                    <div class="flex items-center justify-between gap-2 mb-3">
                        <span class="bg-purpleAccent/10 border border-purpleAccent/30 text-purpleAccent px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-widest">
                            ${market.target_sector || 'Global'}
                        </span>
                        <span class="font-mono text-[9px] text-slate-500 group-hover:text-purpleAccent/70 transition-colors">
                            ${cleanTicker}
                        </span>
                    </div>

                    <h3 class="font-heading font-black text-white text-base tracking-wide leading-snug mb-1 group-hover:text-purpleAccent/200 transition-colors">
                        ${market.event_title}
                    </h3>
                    
                    <p class="text-slate-400 text-xs leading-relaxed font-sans mb-4 border-l-2 border-white/5 pl-3">
                        ${market.subtitle || 'No further conditions applied.'}
                    </p>
                </div>

                <div class="mt-auto pt-4 border-t border-white/5">
                    <div class="grid grid-cols-2 gap-2 mb-4 bg-black/40 border border-white/5 p-3 rounded-xl">
                        <div class="text-center">
                            <span class="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">Probability</span>
                            <span class="font-impact text-xl text-purpleAccent tracking-wider">
                                ${market.implied_probability || '0.0%'}
                            </span>
                        </div>
                        <div class="text-center border-l border-white/5">
                            <span class="block text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-0.5">Moneyline</span>
                            <span class="font-mono font-bold text-sm text-white block mt-1">
                                ${market.converted_american_odds || 'EVEN'}
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

        // Inject Native In-Feed Ad every 5 items
        if ((index + 1) % 5 === 0 && index !== filteredMarkets.length - 1) {
            feedHtml += `
                <div class="bg-void border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-purpleAccent/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-center min-h-[220px]">
                    <div class="absolute top-2 right-3 text-[8px] font-mono text-purpleAccent/50 uppercase tracking-widest flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-purpleAccent animate-pulse"></span> SPONSORED</div>
                    
                    <div class="ad-terminal-bracket w-full flex-grow flex items-center justify-center border border-white/5 mt-5 rounded bg-[#000000]">
                        <ins class="adsbygoogle"
                             style="display:block; width:100%; height:100%; text-align:center;"
                             data-ad-format="fluid"
                             data-ad-layout-key="-6t+ed+2i-1n-4w"
                             data-ad-client="ca-pub-7950419700899075"
                             data-ad-slot=""></ins>
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = feedHtml;
    showLoadingStates(false);
    container.classList.remove('hidden');

    // Trigger AdSense Evaluation
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
}

// --- 6. TOP MATRIX STREAM / TICKER RENDERING ---
function renderLiveMatrixTicker() {
    const matrixContainer = document.getElementById('live-matrix-container');
    const wrapper = document.getElementById('global-ticker-wrapper');
    if (!matrixContainer || predictionMarketsData.length === 0) return;

    if (wrapper) {
        wrapper.classList.remove('hidden');
    }

    matrixContainer.innerHTML = predictionMarketsData.slice(0, 10).map(market => `
        <div class="flex items-center gap-2 px-6 border-r border-white/5 h-16 shrink-0 font-mono text-[11px]">
            <span class="text-slate-400 font-bold uppercase">${market.ticker}:</span>
            <span class="text-white font-black">${market.converted_american_odds}</span>
            <span class="text-purpleAccent bg-purpleAccent/10 px-1.5 py-0.5 rounded text-[9px] border border-purpleAccent/20">${market.implied_probability}</span>
        </div>
    `).join('');
}

// --- 7. UTILS ---
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

// --- 8. LOCAL FAILSAFE SEED DATA ---
function generateMockDataIfMissing() {
    console.warn("Using local cache array. Database connection uninitialized.");
    predictionMarketsData = [
        { event_title: "US Federal Reserve cuts rates by 25bps or more in next meeting", subtitle: "Based on official FOMC announcements.", ticker: "FED-CUTS-2026", target_sector: "Economics", yes_price_cents: 62, implied_probability: "62.0%", converted_american_odds: "-163" },
        { event_title: "Will OpenAI release GPT-5 before December?", subtitle: "Contract ends upon official public release.", ticker: "OPENAI-GPT5", target_sector: "Tech", yes_price_cents: 81, implied_probability: "81.0%", converted_american_odds: "-426" },
        { event_title: "Next Prime Minister of the United Kingdom", subtitle: "Contract ends upon official appointment confirmation.", ticker: "UK-PM-ELECTION", target_sector: "Politics", yes_price_cents: 54, implied_probability: "54.0%", converted_american_odds: "-117" },
        { event_title: "Highest temperature in NYC today?", subtitle: "Based on official NOAA/National Weather Service reporting.", ticker: "NYC-HIGH-TEMP", target_sector: "Climate", yes_price_cents: 88, implied_probability: "88.0%", converted_american_odds: "-733" },
        { event_title: "Will the next James Bond movie win an Oscar?", subtitle: "Any category.", ticker: "BOND-OSCAR", target_sector: "Culture", yes_price_cents: 12, implied_probability: "12.0%", converted_american_odds: "+733" },
        { event_title: "Bitcoin price at the end of 2026?", subtitle: "Target: $100,000 or above.", ticker: "BTC-100K-2026", target_sector: "Crypto", yes_price_cents: 45, implied_probability: "45.0%", converted_american_odds: "+122" }
    ];
    renderActiveFeed();
    renderLiveMatrixTicker();
    updateStatusBar(true);
}
