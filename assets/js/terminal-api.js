// assets/js/terminal-api.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Polling function to wait for auth.js to securely log in and expose the 'db' variable
    function initWhenDbReady() {
        if (typeof window.db !== 'undefined' || typeof db !== 'undefined') {
            // Ensure window.db is the reference we use everywhere
            if (!window.db && typeof db !== 'undefined') window.db = db;
            loadHeroWidgets();
        } else {
            setTimeout(initWhenDbReady, 200);
        }
    }
    initWhenDbReady();

    // ==========================================
    // SPA LAYOUT ROUTER
    // ==========================================
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const contentViews = document.querySelectorAll('.app-view');

    navTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const currentBtn = btn.closest('.nav-trigger');
            if (!currentBtn) return;

            const targetViewId = currentBtn.getAttribute('data-target');

            // Toggle Sidebar Link CSS Highlight States
            navTriggers.forEach(t => {
                t.classList.remove('active', 'text-white', 'bg-cyanAccent/5', 'border-cyanAccent/20');
                t.classList.add('text-slate-400');
                const chevron = t.querySelector('span');
                if (chevron) chevron.className = 'text-brand font-bold font-mono transition-transform';
            });
            
            currentBtn.classList.add('active', 'text-white', 'bg-cyanAccent/05', 'border-cyanAccent/20');
            currentBtn.classList.remove('text-slate-400');
            const activeChevron = currentBtn.querySelector('span');
            if (activeChevron) activeChevron.className = 'text-cyanAccent font-bold font-mono transition-transform';

            // Toggle Center Content Workspace Visibility
            contentViews.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('flex');
            });

            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                targetView.classList.remove('hidden');
                targetView.classList.add('flex');
            }

            // Clean UI session on navigating back to main Search page
            if (targetViewId === 'view-ask') {
                const chatLog = document.getElementById('chat-container');
                if (chatLog) {
                    chatLog.classList.add('hidden');
                    chatLog.classList.remove('flex');
                    chatLog.innerHTML = '<div class="text-[10px] text-brand font-mono uppercase tracking-widest mb-2 border-b border-white/10 pb-2">SESSION LOG_</div>';
                }
            }

            // Auto-trigger RSS population if looking at Discover feed
            if (targetViewId === 'view-discover') {
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
// 1. HERO WIDGET DATA ROUTING (TIMESTAMP CORRECTED)
// ==========================================
async function loadHeroWidgets() {
    
    // --- A. CRYPTO WIDGET (cyanAccent) ---
    const cryptoContainer = document.getElementById('widget-crypto');
    try {
        let cryptoData = { 
            anchorPrice: '$0.00', anchorChange: '0.00%', 
            topTrendAsset: 'N/A', topTrendAdx: '0.00',
            topMoverAsset: 'N/A', topMoverChange: '0.00%'
        };

        if (window.db) {
            // Fetch the 50 newest rows to guarantee we are looking at the live snapshot
            const { data: freshCrypto, error: cryptoErr } = await window.db.from('crypto_telemetry')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(50);
            
            if (!cryptoErr && freshCrypto && freshCrypto.length > 0) {
                // 1. Find BTC Anchor from the fresh batch
                const btcNode = freshCrypto.find(c => String(c.asset).toUpperCase().includes('BTC'));
                if (btcNode) {
                    cryptoData.anchorPrice = '$' + parseFloat(String(btcNode.price).replace(/[^0-9.-]+/g,"")).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                    const btcChange = parseFloat(String(btcNode.change_24h).replace(/[^0-9.-]+/g,"")) || 0;
                    cryptoData.anchorChange = (btcChange >= 0 ? '+' : '') + btcChange.toFixed(2) + '%';
                }

                // 2. Find Highest ADX (Trend) from the fresh batch
                const sortedByAdx = [...freshCrypto].sort((a, b) => {
                    return (parseFloat(String(b.adx).replace(/[^0-9.-]+/g,"")) || 0) - (parseFloat(String(a.adx).replace(/[^0-9.-]+/g,"")) || 0);
                });
                if (sortedByAdx.length > 0) {
                    let cleanAsset = sortedByAdx[0].asset;
                    if (cleanAsset.includes('(')) cleanAsset = cleanAsset.substring(cleanAsset.indexOf('(') + 1, cleanAsset.indexOf(')')).trim();
                    cryptoData.topTrendAsset = cleanAsset.toUpperCase();
                    cryptoData.topTrendAdx = parseFloat(String(sortedByAdx[0].adx).replace(/[^0-9.-]+/g,"")).toFixed(2);
                }

                // 3. Find Highest 24H Change from the fresh batch
                const sortedByChange = [...freshCrypto].sort((a, b) => {
                    return (parseFloat(String(b.change_24h).replace(/[^0-9.-]+/g,"")) || 0) - (parseFloat(String(a.change_24h).replace(/[^0-9.-]+/g,"")) || 0);
                });
                if (sortedByChange.length > 0) {
                    let cleanAsset = sortedByChange[0].asset;
                    if (cleanAsset.includes('(')) cleanAsset = cleanAsset.substring(cleanAsset.indexOf('(') + 1, cleanAsset.indexOf(')')).trim();
                    cryptoData.topMoverAsset = cleanAsset.toUpperCase();
                    const moverChange = parseFloat(String(sortedByChange[0].change_24h).replace(/[^0-9.-]+/g,"")) || 0;
                    cryptoData.topMoverChange = (moverChange >= 0 ? '+' : '') + moverChange.toFixed(2) + '%';
                }
            }
        }

        cryptoContainer.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="text-slate-500 text-[10px] uppercase tracking-widest font-bold">BTC Anchor</span>
                <div class="flex items-center gap-2">
                    <span class="text-white font-bold">${cryptoData.anchorPrice}</span>
                    <span class="${cryptoData.anchorChange.startsWith('+') ? 'text-neon' : 'text-redAccent'}">${cryptoData.anchorChange}</span>
                </div>
            </div>
            <div class="flex justify-between items-center mb-1">
                <span class="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Top Trend (ADX)</span>
                <div class="flex items-center gap-2">
                    <span class="text-white font-bold">${cryptoData.topTrendAsset}</span>
                    <span class="text-cyanAccent">${cryptoData.topTrendAdx} ADX</span>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-slate-500 text-[10px] uppercase tracking-widest font-bold">24H Top Mover</span>
                <div class="flex items-center gap-2">
                    <span class="text-white font-bold">${cryptoData.topMoverAsset}</span>
                    <span class="text-neon">${cryptoData.topMoverChange}</span>
                </div>
            </div>
        `;
    } catch (e) {
        cryptoContainer.innerHTML = `<span class="text-red-500 animate-pulse">UPLINK FAILED</span>`;
    }

    // --- B. SPORTS WIDGET (neon) ---
    const sportsContainer = document.getElementById('widget-sports');
    try {
        let sportsData = [];
        if (window.db) {
            // Fetch newest rows and filter in memory to deduplicate matches
            const { data, error } = await window.db.from('ev_live_data')
                .select('*')
                .eq('match_state', 'pre_match')
                .order('updated_at', { ascending: false })
                .limit(50);
            
            if (!error && data && data.length > 0) {
                // Deduplicate by match name so we don't show the same game twice
                const uniqueMatches = [];
                const seenGames = new Set();
                
                for (let edge of data) {
                    let matchStr = String(edge.match_name || edge.game || "MATCH").trim();
                    if (!seenGames.has(matchStr)) {
                        seenGames.add(matchStr);
                        const val = parseFloat(String(edge.ev || edge.value || edge.edge).replace(/[^0-9.-]+/g,"")) || 0;
                        let teamName = matchStr.split(/[@]|vs/i)[0].trim();
                        if(teamName.length > 15) teamName = teamName.substring(0, 15) + '...';
                        
                        uniqueMatches.push({ team: teamName, evText: `+${val.toFixed(2)}% EV`, rawEv: val });
                    }
                }
                
                // Sort by highest EV and take top 2
                sportsData = uniqueMatches.sort((a, b) => b.rawEv - a.rawEv).slice(0, 2);
            }
        }

        if (sportsData.length === 0) {
            sportsData = [ { team: 'LG Twins', evText: '+8.01% EV' }, { team: 'Kiwoom Heroes', evText: '+6.45% EV' } ];
        }

        let sportsHTML = '';
        sportsData.forEach(match => {
            sportsHTML += `
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-neon/10 flex items-center justify-center text-[10px] text-neon border border-neon/30">⚽</div>
                        <div class="text-xs font-bold text-white truncate max-w-[120px]">${match.team}</div>
                    </div>
                    <div class="text-xs font-mono text-neon font-bold shrink-0">${match.evText}</div>
                </div>
            `;
        });
        sportsContainer.innerHTML = sportsHTML;
    } catch (e) {
        sportsContainer.innerHTML = `<span class="text-red-500 animate-pulse">UPLINK FAILED</span>`;
    }

    // --- C. PREDICTIONS WIDGET (purpleAccent) ---
    const predictionsContainer = document.getElementById('widget-predictions');
    try {
        let predData = [];
        if (window.db) {
            const { data, error } = await window.db.from('kalshi_predictions')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(50);

            if (!error && data && data.length > 0) {
                // Deduplicate by event title
                const uniqueMarkets = [];
                const seenTitles = new Set();
                
                for (let m of data) {
                    let title = String(m.event_title || m.ticker || "Sim Event").trim();
                    if (!seenTitles.has(title)) {
                        seenTitles.add(title);
                        const vol = parseFloat(String(m.volume_24h).replace(/[^0-9.-]+/g,"")) || 0;
                        if (vol > 0) {
                            const probString = m.implied_probability || "0";
                            const probVal = parseFloat(String(probString).replace(/[^0-9.-]+/g,""));
                            const fillPct = isNaN(probVal) ? 50 : probVal;
                            
                            let marketName = title.length > 25 ? title.substring(0, 25) + '...' : title;
                            
                            uniqueMarkets.push({
                                market: marketName,
                                vol: m.volume_formatted || "N/A",
                                fill: `${fillPct}%`,
                                rawVol: vol
                            });
                        }
                    }
                }
                
                predData = uniqueMarkets.sort((a, b) => b.rawVol - a.rawVol).slice(0, 2);
            }
        }

        if (predData.length === 0) {
            predData = [
                { market: 'Presidential Election 2028', vol: '$83.2K', fill: '90%' },
                { market: 'Fed Rate Cut - Sep', vol: '$47.0K', fill: '65%' }
            ];
        }

        let predHTML = '';
        predData.forEach(market => {
            predHTML += `
                <div class="flex flex-col gap-1 mb-3">
                    <div class="flex justify-between text-slate-300">
                        <span class="truncate pr-2">${market.market}</span>
                        <span class="text-purpleAccent font-bold shrink-0">${market.vol}</span>
                    </div>
                    <div class="w-full bg-white/5 rounded-full h-1.5">
                        <div class="bg-purpleAccent h-1.5 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.5)]" style="width: ${market.fill}"></div>
                    </div>
                </div>
            `;
        });
        predictionsContainer.innerHTML = predHTML;
    } catch (e) {
        predictionsContainer.innerHTML = `<span class="text-red-500 animate-pulse">UPLINK FAILED</span>`;
    }
}

// ==========================================
// 2. DISCOVER FEED ROUTING & RENDERING (LIVE RSS)
// ==========================================
const RSS_SOURCES = {
    'ALL': 'https://cointelegraph.com/rss', 
    'SPORTS': 'https://www.espn.com/espn/rss/news',
    'CRYPTO': 'https://cointelegraph.com/rss',
    'MARKETS': 'https://search.cnbc.com/rs/search/combinedcms/view.xml?profile=120000000&id=10000664',
    'TECH': 'https://search.cnbc.com/rs/search/combinedcms/view.xml?profile=120000000&id=19854910'
};

async function loadDiscoverFeed(category) {
    const feedContainer = document.getElementById('discover-feed-container');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = `
        <div class="flex justify-center items-center py-12">
            <span class="text-cyanAccent font-mono text-xs animate-pulse">SYNCING ${category} TELEMETRY...</span>
        </div>
    `;

    try {
        const feedUrl = RSS_SOURCES[category] || RSS_SOURCES['ALL'];
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (data.status !== 'ok') throw new Error("RSS parsing failed");

        const liveArticles = data.items.map(item => {
            let imgUrl = item.enclosure?.link || item.thumbnail || '';
            if (!imgUrl && item.description) {
                const imgMatch = item.description.match(/src="([^"]+)"/);
                if (imgMatch) imgUrl = imgMatch[1];
            }

            const pubDate = new Date(item.pubDate.replace(/-/g, '/')); 
            const diffHours = Math.max(1, Math.round((new Date() - pubDate) / (1000 * 60 * 60)));
            const timeString = diffHours > 24 ? `${Math.floor(diffHours/24)}D AGO` : `${diffHours}H AGO`;

            return {
                category: category === 'ALL' ? 'NEWS' : category,
                time: timeString,
                title: item.title,
                summary: item.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
                link: item.link,
                image: imgUrl
            };
        });

        renderArticles(liveArticles.slice(0, 12), feedContainer);

    } catch (error) {
        console.warn("Live RSS Feed unavailable. Falling back to cached simulation data.");
        const fallbackData = generateMockArticles(category);
        renderArticles(fallbackData, feedContainer);
    }
}

function getNativeAdCard() {
    return `
    <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-cyanAccent/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-center min-h-[220px] mb-4">
        <div class="absolute top-2 right-3 text-[8px] font-mono text-cyanAccent/50 uppercase tracking-widest flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse"></span> SPONSORED</div>
        <div class="w-full flex-grow flex items-center justify-center border border-white/5 mt-5 rounded bg-[#000000]">
            <a href="https://binance.us/universal_JHHGDSKDJ/auth/registration?ref=35082567" target="_blank" class="flex flex-col justify-between w-full h-full bg-black border border-[#fcd535]/40 hover:border-[#fcd535] transition-all p-5 group cursor-pointer no-underline block">
                <div>
                    <div class="text-[#fcd535] font-mono text-[10px] uppercase tracking-widest mb-2 opacity-80">> MARKET LIQUIDITY</div>
                    <div class="text-white font-mono text-xl font-bold tracking-tight leading-tight group-hover:text-gray-200 transition-colors">TRADE ON BINANCE.US</div>
                </div>
                <div class="mt-4 text-[#fcd535] font-mono text-xs group-hover:translate-x-1 transition-transform">
                    ACCESS EXCHANGE ->
                </div>
            </a>
        </div>
    </div>`;
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

        const safeImage = article.image || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=600&auto=format&fit=crop';

        if (index === 0) {
            cardHTML = `
                <a href="${article.link}" target="_blank" class="bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${hoverClass} transition-colors group mb-6 block cursor-pointer">
                    <div class="w-full md:w-2/5 bg-slate-900 min-h-[200px] flex items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
                        <div class="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-500" style="background-image: url('${safeImage}');"></div>
                        <div class="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent"></div>
                        <span class="font-impact text-5xl text-white/10 uppercase tracking-widest select-none absolute transform -rotate-12 z-0">TLDR</span>
                        <div class="z-10 font-mono text-[10px] ${colorClass} border ${borderClass} ${bgClass} px-3 py-1 rounded backdrop-blur-sm">LEAD_STORY</div>
                    </div>
                    <div class="w-full md:w-3/5 p-6 flex flex-col justify-between relative z-10">
                        <div>
                            <div class="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                                <span class="${bgClass} ${colorClass} px-2 py-0.5 rounded font-bold border ${borderClass}">${article.category}</span>
                                <span>• ${article.time}</span>
                            </div>
                            <h2 class="font-impact text-xl sm:text-2xl text-white uppercase tracking-wide group-hover:text-white transition-colors mb-3">${article.title}</h2>
                            <p class="text-sm text-slate-400 font-mono leading-relaxed line-clamp-3">${article.summary}</p>
                        </div>
                    </div>
                </a>
            `;
        } else {
            cardHTML = `
                <a href="${article.link}" target="_blank" class="bg-[#0b0f19]/60 border border-white/5 rounded-xl p-5 flex gap-4 hover:border-white/10 transition-colors group mb-4 block cursor-pointer">
                    <div class="w-20 h-20 bg-slate-900 rounded-lg flex-shrink-0 border border-white/10 hidden sm:flex items-center justify-center relative overflow-hidden shadow-inner">
                        <img src="${safeImage}" alt="Thumbnail" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
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
                </a>
            `;
        }
        container.innerHTML += cardHTML;

        // Ad Injection Loop
        if ((index + 1) % 5 === 0 && index !== articles.length - 1) {
            container.innerHTML += getNativeAdCard();
        }
    });
}

function generateMockArticles(filter) {
    return [
        { category: 'SPORTS', time: '1H AGO', title: 'Simulation Engine Logs 12,000 matches confirming configurations', summary: 'Analytical evaluation nodes map roster transitions with high confidence ratios across standard league settings.', image: '' },
        { category: 'CRYPTO', time: '3H AGO', title: 'Bitcoin ETF inflows hit highest institutional momentum since late 2024', summary: 'On-chain records log spot demand parameters surging across networks, running parallel to macro asset adjustments.', image: '' },
        { category: 'MARKETS', time: '5H AGO', title: 'Implied probability shifts drastically following injury node update', summary: 'Prediction markets adjust volume rapidly as primary simulation variables are modified.', image: '' },
        { category: 'TECH', time: '12H AGO', title: 'Unmetered API execution pipelines drop local matrix query overhead', summary: 'New development routing configurations show zero token degradation tracking complex state objects.', image: '' }
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
    
    wrapper.innerHTML = `<div class="pl-5 border-l-2 border-brand/50 bg-brand/5 py-4 rounded-r-xl text-slate-300 text-sm typewriter-target" data-text="${escapeHtml(payload.action || payload.response)}"></div>`;
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
