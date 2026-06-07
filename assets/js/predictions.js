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
            console.warn("DB connection not established yet. Retrying in 500ms...");
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
        console.error("Auth Check Error:", e); 
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
        console.error("User Data Fetch Error:", e);
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
        console.error("Prediction Telemetry Error:", err.message);
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

// --- 6. GRID RENDERING & AD INJECTION ---
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
                            <span class="bg-purpleAccent/10 border border-purpleAccent/30 text-purpleAccent px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-widest truncate max-w-[50%]">
                                ${sector}
                            </span>
                            <span class="font-mono text-[9px] text-slate-500 group-hover:text-purpleAccent/70 transition-colors">
                                ${cleanTicker}
                            </span>
                        </div>
                        <h3 class="font-heading font-black text-white text-base tracking-wide leading-snug mb-1 group-hover:text-purpleAccent/200 transition-colors">
                            ${title}
                        </h3>
                        <p class="text-slate-400 text-[10px] leading-relaxed font-sans mb-4 border-l-2 border-white/5 pl-3">
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
        console.error("Critical Render Error:", e);
        injectUIError(`Rendering Engine Failed: ${e.message}`);
    }
}

// --- 7. BOTTOM MATRIX STREAM / TICKER RENDERING ---
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

// --- 8. NEWS DRAWER LOGIC ---
function toggleNewsPanel() {
    const panel = document.getElementById('news-panel');
    if (!panel) return;
    
    if (panel.classList.contains('translate-x-full')) {
        panel.classList.remove('translate-x-full');
        fetchPredictionNews(); 
    } else {
        panel.classList.add('translate-x-full');
    }
}

function fetchPredictionNews() {
    const newsContent = document.getElementById('news-feed-content');
    if (!newsContent || newsContent.getAttribute('data-loaded') === 'true') return;

    const mockNews = [
        { title: "Fed Hints at Possible Rate Cut Next Quarter", time: "10m ago", source: "EconDaily" },
        { title: "UK Election Markets Shift as New Polls Released", time: "45m ago", source: "GlobalWire" },
        { title: "Tech Sector Rallies Amid AI Infrastructure Boom", time: "2h ago", source: "Terminal Intel" },
        { title: "Unseasonal Weather Patterns Drive Climate Contracts", time: "4h ago", source: "ClimateWatch" }
    ];

    let html = '';
    mockNews.forEach(article => {
        html += `
            <div class="border-b border-white/5 pb-4 last:border-0 group cursor-pointer">
                <div class="flex justify-between items-start mb-1">
                    <span class="text-[9px] font-mono text-purpleAccent uppercase tracking-widest">${article.source}</span>
                    <span class="text-[8px] font-mono text-slate-500 uppercase tracking-widest">${article.time}</span>
                </div>
                <h4 class="text-slate-300 font-bold text-xs leading-snug group-hover:text-white transition-colors">${article.title}</h4>
            </div>
        `;
    });

    newsContent.innerHTML = html;
    newsContent.setAttribute('data-loaded', 'true');
}

// --- 9. TERMINAL AI COPILOT LOGIC ---
function toggleTerminalAiModal() {
    const modal = document.getElementById('terminal-ai-modal');
    const content = document.getElementById('terminal-ai-content');
    if (!modal || !content) return;
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Trigger chat input listener
        const inputField = document.getElementById('ai-query-input');
        if(inputField) {
            inputField.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') submitAiQuery();
            });
            setTimeout(() => inputField.focus(), 100);
        }

        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    } else {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }, 300);
    }
}

async function submitAiQuery() {
    const queryInput = document.getElementById('ai-query-input');
    const text = queryInput.value.trim();
    if (!text) return;

    renderAiUserMessage(text);
    queryInput.value = '';
    queryInput.disabled = true;

    const logId = `log-${Date.now()}`;
    renderAiSystemLogs(logId);

    try {
        const response = await fetch('https://api.terminalsoftware.online/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text })
        });
        const data = await response.json();

        document.getElementById(logId).remove();

        if (data.status === "success" && data.node_response) {
            routeAiResponse(data.intent, data.node_response);
        } else {
            renderAiError("Invalid payload received from Master Node.");
        }

    } catch (error) {
        document.getElementById(logId).remove();
        renderAiError("CONNECTION SEVERED: Backend API unreachable.");
    } finally {
        queryInput.disabled = false;
        queryInput.focus();
        scrollAiToBottom();
    }
}

function routeAiResponse(intent, payload) {
    const chatContainer = document.getElementById('ai-chat-history');
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full self-start font-mono pt-2';
    
    // Simplifies the response layout for the pop-up modal styling
    const htmlContent = `
        <div class="pl-4 border-l-2 border-cyanAccent/50 bg-cyanAccent/5 py-3 rounded-r-lg">
            <div class="text-[9px] font-bold text-cyanAccent uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse"></span>
                Terminal AI Response
            </div>
            <div class="text-xs text-slate-300 typewriter-target leading-relaxed" data-text="${payload.response || payload.action || 'Data acquired.'}"></div>
        </div>
    `;

    wrapper.innerHTML = htmlContent;
    chatContainer.appendChild(wrapper);

    const target = wrapper.querySelector('.typewriter-target');
    if (target) {
        typeWriterEffect(target, target.getAttribute('data-text'), 15);
    } else {
        scrollAiToBottom();
    }
}

function renderAiUserMessage(text) {
    const chatContainer = document.getElementById('ai-chat-history');
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full self-end text-right mt-2';
    wrapper.innerHTML = `
        <div class="inline-block bg-white/10 border border-white/20 backdrop-blur-md rounded-xl rounded-tr-sm px-4 py-2.5 text-xs text-white shadow-lg text-left font-mono">
            ${escapeHtml(text)}
        </div>
    `;
    chatContainer.appendChild(wrapper);
    scrollAiToBottom();
}

function renderAiSystemLogs(id) {
    const chatContainer = document.getElementById('ai-chat-history');
    const wrapper = document.createElement('div');
    wrapper.id = id;
    wrapper.className = 'w-full self-start pl-4 py-2 font-mono';
    wrapper.innerHTML = `
        <div class="text-[9px] font-bold sys-log uppercase tracking-widest leading-loose animate-pulse text-cyanAccent">
            &gt; Intercepting query...<br>
            &gt; Routing to Master Terminal Node...<br>
            &gt; Synthesizing response<span class="cursor-blink">_</span>
        </div>
    `;
    chatContainer.appendChild(wrapper);
    scrollAiToBottom();
}

function renderAiError(msg) {
    const chatContainer = document.getElementById('ai-chat-history');
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full self-start pl-3 py-2 font-mono';
    wrapper.innerHTML = `<div class="text-[10px] text-red-500 font-bold uppercase tracking-widest border border-red-500/30 bg-red-500/10 p-3 rounded-lg shadow-inner">&gt; ERROR: ${msg}</div>`;
    chatContainer.appendChild(wrapper);
    scrollAiToBottom();
}

function typeWriterEffect(element, text, speed = 15, callback = null) {
    element.innerHTML = '';
    let i = 0;
    element.innerHTML += '<span class="cursor-blink">_</span>';
    
    function type() {
        if (i < text.length) {
            element.innerHTML = element.innerHTML.replace('<span class="cursor-blink">_</span>', '');
            element.innerHTML += text.charAt(i) + '<span class="cursor-blink">_</span>';
            i++;
            scrollAiToBottom();
            setTimeout(type, speed);
        } else {
            setTimeout(() => {
                element.innerHTML = element.innerHTML.replace('<span class="cursor-blink">_</span>', '');
                if (callback) callback();
            }, 1000);
        }
    }
    type();
}

function scrollAiToBottom() {
    const chatContainer = document.getElementById('ai-chat-history');
    if(chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHtml(unsafe) {
    return String(unsafe).replace(/[&<"'>]/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

// --- 10. UTILS ---
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
