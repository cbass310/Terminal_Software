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
let currentPredFilter = 'all'; // Top-level pill filter
let currentPredSubFilter = 'all'; // Dropdown filter
let dataPollingInterval = null;

// Map UI pills to potential backend 'target_sector' matches from Kalshi
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
        } else { userAccessTier = "none"; } 
        
        if (userAccessTier === 'none') {
            document.getElementById('view-pred-main').classList.add('hidden');
            document.getElementById('view-locked').classList.remove('hidden');
        } else {
            document.getElementById('view-pred-main').classList.remove('hidden');
            document.getElementById('view-locked').classList.add('hidden');
            
            // Initialize Data Feed
            await fetchKalshiPredictions();
            dataPollingInterval = setInterval(fetchKalshiPredictions, 30000); // 30s Sweep
        }
    } catch(e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAccess();
});

// --- 4. DATA FETCHING ---
async function fetchKalshiPredictions() {
    try {
        if (typeof db === 'undefined') throw new Error("Supabase undefined");
        
        // Querying the EXACT correct 'kalshi_predictions' table you built
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
        console.error("Prediction Telemetry Error:", err.message);
        updateStatusBar(false);
        
        // This failsafe drops the error onto the UI so it doesn't spin forever
        const loader = document.getElementById('loading-state-predictions');
        if (loader) {
            loader.innerHTML = `<p class="text-redAccent font-mono text-xs uppercase tracking-widest bg-redAccent/10 border border-redAccent/30 p-4 rounded-xl">Error: ${err.message}</p>`;
        }
    }
}

// --- 5. FILTERING & UI CONTROLS ---
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
    return 'other'; // Falls back here if Kalshi sends a brand new category
}

function extractUniqueSubcategories(dataArray) {
    const subs = new Set();
    dataArray.forEach(market => {
        // Tied to your actual target_sector column
        if (market.target_sector) {
            subs.add(String(market.target_sector).toUpperCase().trim());
        }
    });
    return Array.from(subs).sort();
}

// --- 6. GRID RENDERING & AD INJECTION ---
function renderActiveFeed() {
    const container = document.getElementById('predictions-feed-container');
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

    // Official Kalshi Affiliate Execution URL
    const kalshiUrl = "https://kalshi.com/sign-up/?referral=d1acc622-b754-4d23-85d7-19059ec5dc0f";

    // Build the Grid HTML mapping to your exact Supabase columns
    let feedHtml = '';
    filteredMarkets.forEach((market, index) => {
        const cleanTicker = market.ticker || "UNKNOWN";
        const sector = market.target_sector || "GLOBAL";
        const title = market.event_title || "Pending Event Context";
        const subtitle = market.subtitle || "No further conditions applied.";
        const prob = market.implied_probability || "0.0%";
        const odds = market.converted_american_odds || "EVEN";
        
        feedHtml += `
            <div class="bg-void border border-white/10 hover:border-purpleAccent/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] group animate-flash-update-purple">
                
                <div class="absolute top-0 right-0 w-12 h-12 bg-purpleAccent/5 group-hover:bg-purpleAccent/10 transition-colors transform rotate-45 translate-x-6 -translate-y-6 border-b border-white/10 group-hover:border-purpleAccent/30"></div>
                
                <div>
                    <div class="flex items-center justify-between gap-2 mb-3">
                        <span class="bg-purpleAccent/10 border border-purpleAccent/30 text-purpleAccent px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-widest truncate max-w-[50%]">
                            ${sector}
                        </span>
                        <span class="font-mono text-[9px] text-slate-500 group-hover:text-purpleAccent/70 transition-colors">
                            ${cleanTicker}
                        </span>
                    </div>

                    <h3 class="font-heading font-black text-white text-base tracking-wide leading-snug mb-1 group-hover:text-purpleAccent/200 transition-colors">
                        ${title}
                    </h3>
                    
                    <p class="text-slate-400 text-xs leading-relaxed font-sans mb-4 border-l-2 border-white/5 pl-3">
                        ${subtitle}
                    </p>
                </div>

                <div class="mt-auto pt-4 border-t border-white/5">
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

        // Inject Native In-Feed Ad every 5 items with strict height bindings
        if ((index + 1) % 5 === 0 && index !== filteredMarkets.length - 1) {
            feedHtml += `
                <div class="bg-void border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-purpleAccent/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-center min-h-[220px]">
                    <div class="absolute top-2 right-3 text-[8px] font-mono text-purpleAccent/50 uppercase tracking-widest flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-purpleAccent animate-pulse"></span> SPONSORED</div>
                    
                    <div class="ad-terminal-bracket w-full flex-grow flex items-center justify-center border border-white/5 mt-5 rounded bg-[#000000] overflow-hidden">
                        <ins class="adsbygoogle"
                             style="display:inline-block;width:100%;max-width:728px;height:90px;"
                             data-ad-format="horizontal"
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

// --- 7. TOP MATRIX STREAM / TICKER RENDERING ---
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

// --- 8. UTILS ---
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
