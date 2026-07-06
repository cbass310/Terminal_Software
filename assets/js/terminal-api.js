// assets/js/terminal-api.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Hero Widgets immediately on load
    loadHeroWidgets();

    // 2. Listen for Tab interactions
    const triggers = document.querySelectorAll('.nav-trigger');
    const views = document.querySelectorAll('.app-view');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Manage Sidebar Active States
            triggers.forEach(t => {
                t.classList.remove('active', 'text-white');
                t.classList.add('text-slate-400');
                const chevron = t.querySelector('span');
                if (chevron) chevron.classList.remove('text-cyanAccent');
                if (chevron) chevron.classList.add('text-brand');
            });
            
            trigger.classList.add('active', 'text-white');
            trigger.classList.remove('text-slate-400');
            const activeChevron = trigger.querySelector('span');
            if (activeChevron) {
                activeChevron.classList.remove('text-brand');
                activeChevron.classList.add('text-cyanAccent');
            }

            // Hide all views
            const targetId = trigger.getAttribute('data-target');
            views.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('flex');
            });

            // Show targeted view
            const activeView = document.getElementById(targetId);
            if(activeView) {
                activeView.classList.remove('hidden');
                activeView.classList.add('flex');
            }

            // If navigating to Ask Terminal, clear the chat log
            if (targetId === 'view-ask') {
                const chatContainer = document.getElementById('chat-container');
                if (chatContainer) {
                    chatContainer.classList.add('hidden');
                    chatContainer.classList.remove('flex');
                    chatContainer.innerHTML = '<div class="text-[10px] text-brand font-mono uppercase tracking-widest mb-2 border-b border-white/10 pb-2">SESSION LOG_</div>';
                }
            }

            // If navigating to Discover, load the feed
            if (targetId === 'view-discover') {
                loadDiscoverFeed('ALL');
            }
        });
    });

    // Discover Filter Tabs
    const categoryBtns = document.querySelectorAll('.news-tab-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => {
                b.classList.remove('active', 'text-black');
                b.classList.add('text-slate-400');
                b.style.backgroundColor = 'transparent';
            });
            
            e.target.classList.remove('text-slate-400');
            e.target.classList.add('active', 'text-black');
            e.target.style.backgroundColor = '#06b6d4'; 

            loadDiscoverFeed(e.target.innerText.trim());
        });
    });
});

// ==========================================
// 1. HERO WIDGET DATA ROUTING
// ==========================================
async function loadHeroWidgets() {
    
    // --- A. CRYPTO WIDGET (cyanAccent) ---
    const cryptoContainer = document.getElementById('widget-crypto');
    try {
        // Will update this when you provide crypto.js!
        const cryptoData = { btcFlow: '+$221.7M', stablecoins: '-$1.72B', volatility: 'High' }; 
        cryptoContainer.innerHTML = `
            <div class="flex justify-between"><span class="text-slate-500">BTC Flow</span><span class="text-cyanAccent">${cryptoData.btcFlow}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Stablecoins</span><span class="text-redAccent">${cryptoData.stablecoins}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">24H Volatility</span><span class="text-cyanAccent font-bold">${cryptoData.volatility}</span></div>
        `;
    } catch (e) {
        cryptoContainer.innerHTML = `<span class="text-red-500">UPLINK FAILED</span>`;
    }

    // --- B. SPORTS WIDGET (neon) ---
    // Extracted logic from your sports.js to pull the top +EV edges
    const sportsContainer = document.getElementById('widget-sports');
    try {
        let sportsData = [];
        // Pull directly from Supabase using your existing 'db' global object
        if (typeof db !== 'undefined') {
            const { data, error } = await db.from('ev_live_data')
                .select('*')
                .eq('match_state', 'pre_match')
                .order('ev', { ascending: false }) // Get highest EV first
                .limit(2);
            
            if (!error && data) {
                sportsData = data.map(edge => {
                    const val = parseFloat(edge.ev || edge.value || edge.edge) || 0;
                    const matchStr = String(edge.match_name || edge.game || "MATCH");
                    
                    // Simple logic to extract team abbreviation
                    let abbr = matchStr.split(/[@]|vs/i)[0].trim().substring(0,3).toUpperCase();
                    
                    return {
                        team: abbr,
                        ev: `+${val.toFixed(2)}% EV`
                    };
                });
            }
        }

        // Fallback if Supabase fails or data is empty
        if (sportsData.length === 0) {
            sportsData = [
                { team: 'LGT', ev: '+8.01% EV' },
                { team: 'KIW', ev: '+6.45% EV' }
            ];
        }

        let sportsHTML = '';
        sportsData.forEach(match => {
            sportsHTML += `
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-neon/10 flex items-center justify-center text-[10px] text-neon border border-neon/30">⚽</div>
                        <div class="text-xs font-bold text-white">${match.team}</div>
                    </div>
                    <div class="text-xs font-mono text-neon font-bold">${match.ev}</div>
                </div>
            `;
        });
        sportsContainer.innerHTML = sportsHTML;
    } catch (e) {
        sportsContainer.innerHTML = `<span class="text-red-500">UPLINK FAILED</span>`;
    }

    // --- C. PREDICTIONS WIDGET (purpleAccent) ---
    const predictionsContainer = document.getElementById('widget-predictions');
    try {
        // Will update this when you provide predictions.js!
        const predData = [
            { market: 'Sim Event 42', vol: '$83.2K', fill: '90%' },
            { market: 'Championship Outright', vol: '$47.0K', fill: '65%' }
        ];

        let predHTML = '';
        predData.forEach(market => {
            predHTML += `
                <div class="flex flex-col gap-1 mb-3">
                    <div class="flex justify-between text-slate-300">
                        <span>${market.market}</span>
                        <span class="text-purpleAccent font-bold">${market.vol}</span>
                    </div>
                    <div class="w-full bg-white/5 rounded-full h-1.5">
                        <div class="bg-purpleAccent h-1.5 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.5)]" style="width: ${market.fill}"></div>
                    </div>
                </div>
            `;
        });
        predictionsContainer.innerHTML = predHTML;
    } catch (e) {
        predictionsContainer.innerHTML = `<span class="text-red-500">UPLINK FAILED</span>`;
    }
}

// ==========================================
// 2. DISCOVER FEED ROUTING
// ==========================================
async function loadDiscoverFeed(category) {
    const feedContainer = document.getElementById('discover-feed-container');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = `
        <div class="flex justify-center items-center py-12">
            <span class="text-cyanAccent font-mono text-xs animate-pulse">SYNCING ${category} TELEMETRY...</span>
        </div>
    `;

    try {
        const mockData = generateMockArticles(category);
        renderArticles(mockData, feedContainer);
    } catch (error) {
        feedContainer.innerHTML = `
            <div class="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-center">
                <span class="text-red-500 font-mono text-xs">ERROR: UNABLE TO ESTABLISH UPLINK WITH INTEL WIRE.</span>
            </div>
        `;
    }
}

function renderArticles(articles, container) {
    container.innerHTML = '';
    articles.forEach((article, index) => {
        let cardHTML = '';
        let colorClass = 'text-cyanAccent';
        let bgClass = 'bg-cyanAccent/20';
        let borderClass = 'border-cyanAccent/30';
        let hoverClass = 'hover:border-cyanAccent/30';
        
        if (article.category === 'SPORTS') {
            colorClass = 'text-[#39FF14]'; bgClass = 'bg-[#39FF14]/20'; borderClass = 'border-[#39FF14]/30'; hoverClass = 'hover:border-[#39FF14]/30';
        } else if (article.category === 'MARKETS') {
            colorClass = 'text-[#a855f7]'; bgClass = 'bg-[#a855f7]/20'; borderClass = 'border-[#a855f7]/30'; hoverClass = 'hover:border-[#a855f7]/30';
        }

        if (index === 0) {
            cardHTML = `
                <div class="bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${hoverClass} transition-colors group mb-6">
                    <div class="w-full md:w-2/5 bg-slate-900 min-h-[200px] flex items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-60"></div>
                        <span class="font-impact text-5xl text-white/5 uppercase tracking-widest select-none absolute transform -rotate-12">TLDR</span>
                        <div class="z-10 font-mono text-[10px] ${colorClass} border ${borderClass} ${bgClass} px-3 py-1 rounded">LEAD_STORY</div>
                    </div>
                    <div class="w-full md:w-3/5 p-6 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                                <span class="${bgClass} ${colorClass} px-2 py-0.5 rounded font-bold border ${borderClass}">${article.category}</span>
                                <span>• ${article.time}</span>
                            </div>
                            <h2 class="font-impact text-xl sm:text-2xl text-white uppercase tracking-wide group-hover:text-white transition-colors mb-3">${article.title}</h2>
                            <p class="text-sm text-slate-400 font-mono leading-relaxed line-clamp-3">${article.summary}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            cardHTML = `
                <div class="bg-[#0b0f19]/60 border border-white/5 rounded-xl p-5 flex gap-4 hover:border-white/10 transition-colors group mb-4">
                    <div class="w-20 h-20 bg-slate-900 rounded-lg flex-shrink-0 border border-white/10 hidden sm:flex items-center justify-center relative font-mono text-[9px] ${colorClass}">NODE_${Math.floor(Math.random() * 99) + 1}</div>
                    <div class="flex-grow flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                                <span class="${bgClass} ${colorClass} px-2 py-0.5 rounded font-bold border ${borderClass}">${article.category}</span>
                                <span>• ${article.time}</span>
                            </div>
                            <h3 class="font-bold text-white text-base group-hover:text-white transition-colors mb-1">${article.title}</h3>
                            <p class="text-xs text-slate-400 font-mono line-clamp-2">${article.summary}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        container.innerHTML += cardHTML;
    });
}

function generateMockArticles(filter) {
    return [
        { category: 'SPORTS', time: '1H AGO', title: 'Simulation Engine Logs 12,000 matches confirming configurations', summary: 'Analytical evaluation nodes map roster transitions with high confidence ratios across standard league settings.' },
        { category: 'CRYPTO', time: '3H AGO', title: 'Bitcoin ETF inflows hit highest institutional momentum since late 2024', summary: 'On-chain records log spot demand parameters surging across networks, running parallel to macro asset adjustments.' },
        { category: 'MARKETS', time: '5H AGO', title: 'Implied probability shifts drastically following injury node update', summary: 'Prediction markets adjust volume rapidly as primary simulation variables are modified.' },
        { category: 'TECH', time: '12H AGO', title: 'Unmetered API execution pipelines drop local matrix query overhead', summary: 'New development routing configurations show zero token degradation tracking complex state objects.' }
    ];
}

// ==========================================
// 3. MASTER CHAT QUERY ENGINE
// ==========================================
const FIREHOSE_ENDPOINT = 'https://api.terminalsoftware.online/query'; 

setTimeout(() => {
    const chatContainer = document.getElementById('chat-container');
    const queryInput = document.getElementById('query-input');
    const submitBtn = document.getElementById('submit-btn');

    if (queryInput && submitBtn) {
        queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleMasterQuery();
        });
        submitBtn.addEventListener('click', handleMasterQuery);
    }

    async function handleMasterQuery() {
        const text = queryInput.value.trim();
        if (!text) return;
        
        chatContainer.classList.remove('hidden');
        chatContainer.classList.add('flex');

        renderUserMessage(text);
        queryInput.value = '';
        queryInput.disabled = true;

        const logId = `log-${Date.now()}`;
        renderSystemLogs(logId);

        try {
            const response = await fetch(FIREHOSE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text })
            });
            const data = await response.json();

            document.getElementById(logId).remove();

            if (data.status === "success" && data.node_response) {
                routeResponse(data.intent, data.node_response);
            } else {
                renderError("Invalid payload received from Master Node.");
            }
        } catch (error) {
            if(document.getElementById(logId)) document.getElementById(logId).remove();
            renderError("CONNECTION SEVERED: Backend API unreachable.");
        } finally {
            queryInput.disabled = false;
            queryInput.focus();
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
}, 500);

// --- HTML CHAT RENDERING HELPERS ---
function renderUserMessage(text) {
    const chatContainer = document.getElementById('chat-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full md:w-2/3 max-w-2xl self-end text-right mt-2';
    wrapper.innerHTML = `<div class="inline-block bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl rounded-tr-sm px-5 py-3.5 text-xs sm:text-sm text-white shadow-lg text-left font-mono">${escapeHtml(text)}</div>`;
    chatContainer.appendChild(wrapper);
}

function renderSystemLogs(id) {
    const chatContainer = document.getElementById('chat-container');
    const wrapper = document.createElement('div');
    wrapper.id = id;
    wrapper.className = 'w-full self-start pl-5 py-3 font-mono';
    wrapper.innerHTML = `<div class="text-[9px] sm:text-[10px] font-bold text-[#06b6d4] uppercase tracking-widest leading-loose animate-pulse">&gt; INTERCEPTING QUERY...<br>&gt; ROUTING TO MASTER TERMINAL NODE...<br>&gt; SYNTHESIZING RESPONSE<span class="cursor-blink">_</span></div>`;
    chatContainer.appendChild(wrapper);
}

function renderError(msg) {
    const chatContainer = document.getElementById('chat-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full self-start pl-4 py-2 font-mono';
    wrapper.innerHTML = `<div class="text-xs text-red-500 font-bold uppercase tracking-widest border border-red-500/30 bg-red-500/10 p-4 rounded-xl">&gt; ERROR: ${msg}</div>`;
    chatContainer.appendChild(wrapper);
}

function routeResponse(intent, payload) {
    const chatContainer = document.getElementById('chat-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full md:w-3/4 max-w-3xl self-start font-mono mt-4';
    
    // Simplifed formatting logic for brevity - this will mirror your original layout
    wrapper.innerHTML = `<div class="pl-5 border-l-2 border-brand/50 bg-brand/5 py-4 rounded-r-xl text-slate-300 text-sm typewriter-target" data-text="${payload.action || payload.response}"></div>`;
    chatContainer.appendChild(wrapper);

    const target = wrapper.querySelector('.typewriter-target');
    if (target) {
        let i = 0;
        const text = target.getAttribute('data-text');
        target.innerHTML = '<span class="cursor-blink">_</span>';
        function type() {
            if (i < text.length) {
                target.innerHTML = target.innerHTML.replace('<span class="cursor-blink">_</span>', '') + text.charAt(i) + '<span class="cursor-blink">_</span>';
                i++;
                chatContainer.scrollTop = chatContainer.scrollHeight;
                setTimeout(type, 15);
            } else {
                target.innerHTML = target.innerHTML.replace('<span class="cursor-blink">_</span>', '');
            }
        }
        type();
    }
}

function escapeHtml(unsafe) {
    return String(unsafe).replace(/[&<"'>]/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}
