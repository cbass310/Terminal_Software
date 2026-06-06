// assets/js/predictions.js
// Handles Supabase real-time polling, view mapping, and card rendering for Kalshi markets

// --- 1. STATE & CONFIGURATION ---
let supabaseClient = null;
let predictionMarketsData = [];
let currentActivePredTab = 'pred-politics';
let dataPollingInterval = null;

// Map UI tabs to backend 'target_sector' values expected from prediction_architect.py
const sectorMapping = {
    'pred-politics': ['politics', 'government', 'elections'],
    'pred-culture': ['culture', 'economics', 'demographics', 'finance'],
    'pred-tech': ['science', 'technology', 'ai', 'space']
};

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    initializeSupabase();
    setupTabClickListeners();
    
    // Initial fetch and set default view
    await fetchKalshiPredictions();
    switchTab(currentActivePredTab);
    
    // Polling sweep every 30 seconds to fetch fresh database upserts
    dataPollingInterval = setInterval(fetchKalshiPredictions, 30000);
});

function initializeSupabase() {
    // Verifies global availability of Supabase from CDN template setup
    if (typeof supabase !== 'undefined' && window.supabaseUrl && window.supabaseAnonKey) {
        supabaseClient = supabase.createClient(window.supabaseUrl, window.supabaseAnonKey);
    } else {
        console.error("Supabase credentials missing. Ensure they are assigned globally in auth.js or components.js");
        // Fallback to local mockup if client initialization fails entirely
        showLoadingStates(false);
    }
}

// --- 3. DATA FETCHING (SUPABASE INTERACTION) ---
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

// --- 4. UI TERMINAL RENDERING ---
function renderActiveFeed() {
    const containerId = `${currentActivePredTab}-feed-container`;
    const loadingId = `loading-state-${currentActivePredTab}`;
    
    const container = document.getElementById(containerId);
    const loadingState = document.getElementById(loadingId);
    
    if (!container) return;

    // Filter data matching current taxonomy rules
    const allowedSectors = sectorMapping[currentActivePredTab] || [];
    const filteredMarkets = predictionMarketsData.filter(market => 
        allowedSectors.includes(market.target_sector?.toLowerCase())
    );

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

    // Map out the stylized graphic cards
    container.innerHTML = filteredMarkets.map(market => {
        // Build affiliate link matching layout tracking strategy
        const cleanTicker = market.ticker || "";
        const kalshiUrl = `https://kalshi.com/markets/${cleanTicker.toLowerCase()}`;
        
        return `
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
    }).join('');

    showLoadingStates(false);
    container.classList.remove('hidden');
}

// --- 5. TOP MATRIX STREAM / TICKER RENDERING ---
function renderLiveMatrixTicker() {
    const matrixContainer = document.getElementById('live-matrix-container');
    if (!matrixContainer || predictionMarketsData.length === 0) return;

    matrixContainer.innerHTML = predictionMarketsData.slice(0, 8).map(market => `
        <div class="flex items-center gap-2 px-6 border-r border-white/5 h-16 shrink-0 font-mono text-[11px]">
            <span class="text-slate-400 font-bold uppercase">${market.ticker}:</span>
            <span class="text-white font-black">${market.converted_american_odds}</span>
            <span class="text-purpleAccent bg-purpleAccent/10 px-1 rounded text-[9px]">${market.implied_probability}</span>
        </div>
    `).join('');
}

// --- 6. VIEW CONTROLLER (TAB HANDLING) ---
function switchTab(tabId) {
    currentActivePredTab = tabId;
    
    // Reset and iterate through views
    const views = ['view-pred-politics', 'view-pred-culture', 'view-pred-tech'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });

    // Reset button design states
    const tabs = ['tab-pred-politics', 'tab-pred-culture', 'tab-pred-tech'];
    tabs.forEach(t => {
        const btn = document.getElementById(t);
        if (btn) {
            btn.classList.remove('text-purpleAccent', 'bg-purpleAccent/10', 'border-purpleAccent/30');
            btn.classList.add('text-slate-400', 'border-transparent');
        }
    });

    // Make target panel active
    const activeView = document.getElementById(`view-${tabId}`);
    if (activeView) activeView.classList.remove('hidden');

    const activeBtn = document.getElementById(`tab-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-400', 'border-transparent');
        activeBtn.classList.add('text-purpleAccent', 'bg-purpleAccent/10', 'border-purpleAccent/30');
    }

    showLoadingStates(true);
    renderActiveFeed();
}

function showLoadingStates(isLoading) {
    const loadingId = `loading-state-${currentActivePredTab}`;
    const containerId = `${currentActivePredTab}-feed-container`;
    
    const loader = document.getElementById(loadingId);
    const container = document.getElementById(containerId);

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

function setupTabClickListeners() {
    // Explicit global attachments for routing paths cleanly across contexts
    window.switchTab = switchTab;
}

// --- 7. LOCAL FAILSAFE SEED DATA ---
function generateMockDataIfMissing() {
    console.warn("Using local cache array. Database connection uninitialized.");
    predictionMarketsData = [
        { event_title: "US Federal Reserve cuts rates by 25bps or more in next meeting", subtitle: "Based on official FOMC announcements.", ticker: "FED-CUTS-2026", target_sector: "culture", yes_price_cents: 62, implied_probability: "62.0%", converted_american_odds: "-163" },
        { event_title: "Next Prime Minister of the United Kingdom", subtitle: "Contract ends upon official appointment confirmation.", ticker: "UK-PM-ELECTION", target_sector: "politics", yes_price_cents: 54, implied_probability: "54.0%", converted_american_odds: "-117" },
        { event_title: "Commercial Orbital Launch System achieves Mars payload orbit by end of year", subtitle: "Requires successful separation tracking telemetry.", ticker: "MARS-ORBIT-2026", target_sector: "science", yes_price_cents: 18, implied_probability: "18.0%", converted_american_odds: "+455" }
    ];
    renderActiveFeed();
    renderLiveMatrixTicker();
    updateStatusBar(true);
}
