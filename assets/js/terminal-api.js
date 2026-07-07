// assets/js/terminal-api.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize immediately without waiting for database to prevent dead UI
    loadTickerData();
    loadHeroWidgets();
    loadDiscoverFeed('ALL');

    let dbCheckAttempts = 0;
    function pollForLiveDatabase() {
        if (typeof window.db !== 'undefined' || typeof db !== 'undefined') {
            if (!window.db && typeof db !== 'undefined') window.db = db;
            console.log("Terminal Database Connection Established. Firing live streams...");
            loadHeroWidgets();
            loadTickerData();
        } else if (dbCheckAttempts < 15) { 
            dbCheckAttempts++;
            setTimeout(pollForLiveDatabase, 200);
        } else {
            console.warn("Operating in standalone mode.");
        }
    }
    pollForLiveDatabase();

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

            contentViews.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('flex');
            });

            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                targetView.classList.remove('hidden');
                targetView.classList.add('flex');
            }

            if (targetViewId === 'view-ask') {
                const chatLog = document.getElementById('chat-container');
                if (chatLog) {
                    chatLog.classList.add('hidden');
                    chatLog.classList.remove('flex');
                    chatLog.innerHTML = '<div class="text-[10px] text-brand font-mono uppercase tracking-widest mb-2 border-b border-white/10 pb-2">SESSION LOG_</div>';
                }
            }

            if (targetViewId === 'view-discover') {
                const activeTab = document.querySelector('.news-tab-btn.active');
                loadDiscoverFeed(activeTab ? activeTab.innerText.trim() : 'ALL');
            }
        });
    });

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
// 1. LIVE TICKER DATA ROUTING (NO SORTING QUERIES)
// ==========================================
async function loadTickerData() {
    const tickerTrack = document.getElementById('live-ticker-track');
    if (!tickerTrack) return;

    let tickerItems = [];

    try {
        if (window.db || typeof db !== 'undefined') {
            const activeDb = window.db || db;
            
            // Fetch Crypto Data (Raw Fetch, JS Sort)
            const { data: rawCrypto } = await activeDb.from('crypto_telemetry').select('*');
            if (rawCrypto && rawCrypto.length > 0) {
                const crypto = rawCrypto.slice(-20).reverse();
                crypto.slice(0,3).forEach(c => {
                    let asset = String(c.asset).split(' ')[0].toUpperCase();
                    let price = parseFloat(String(c.price).replace(/[^0-9.-]+/g,"")).toLocaleString(undefined, {minimumFractionDigits: 2});
                    let change = parseFloat(String(c.change_24h).replace(/[^0-9.-]+/g,"")) || 0;
                    let color = change >= 0 ? 'text-neon' : 'text-redAccent';
                    let arrow = change >= 0 ? '▲' : '▼';
                    tickerItems.push(`<span><span class="${color} mr-1">${arrow}</span>${asset} $${price}</span>`);
                });
            }

            // Fetch Sports Data (Raw Fetch, JS Sort)
            const { data: rawSports } = await activeDb.from('ev_live_data').select('*').eq('match_state', 'pre_match');
            if (rawSports && rawSports.length > 0) {
                const sports = rawSports.slice(-20).reverse();
                sports.slice(0,2).forEach(s => {
                    let match = String(s.match_name || "Match").substring(0, 15);
                    let ev = parseFloat(String(s.ev).replace(/[^0-9.-]+/g,"") || 0).toFixed(2);
                    tickerItems.push(`<span><span class="text-neon mr-1">●</span>${match} +${ev}% EV</span>`);
                });
            }

            // Fetch Kalshi Data (Raw Fetch, JS Sort)
            const { data: rawKalshi } = await activeDb.from('kalshi_predictions').select('*');
            if (rawKalshi && rawKalshi.length > 0) {
                const kalshi = rawKalshi.slice(-20).reverse();
                kalshi.slice(0,2).forEach(k => {
                    let title = String(k.event_title || "Event").substring(0, 18);
                    let vol = k.volume_formatted || "$0.0K";
                    tickerItems.push(`<span><span class="text-purpleAccent mr-1">♦</span>${title} ${vol}</span>`);
                });
            }
        }
    } catch (e) {
        console.warn("Ticker fetch bypass applied.");
    }

    if (tickerItems.length === 0) {
        tickerItems = [
            '<span><span class="text-neon mr-1">▲</span>BTC $63,206.90</span>',
            '<span><span class="text-redAccent mr-1">▼</span>ETH $2,845.12</span>',
            '<span><span class="text-neon mr-1">▲</span>SOL $145.22</span>',
            '<span><span class="text-cyanAccent mr-1">♦</span>SYS_LOAD 14.2ms</span>',
            '<span><span class="text-purpleAccent mr-1">●</span>EV_EDGE +4.12%</span>'
        ];
    }

    const tickerHTML = `<div class="flex gap-8 px-4 text-slate-400">` + tickerItems.join('') + tickerItems.join('') + tickerItems.join('') + `</div>`;
    tickerTrack.innerHTML = tickerHTML;
}

// ==========================================
// 2. HERO WIDGET DATA ROUTING (NO SORTING QUERIES)
// ==========================================
async function loadHeroWidgets() {
    const cryptoContainer = document.getElementById('widget-crypto');
    const sportsContainer = document.getElementById('widget-sports');
    const predictionsContainer = document.getElementById('widget-predictions');

    const activeDb = window.db || (typeof db !== 'undefined' ? db : null);

    // Crypto Widget Handler
    try {
        let cryptoData = { anchorPrice: '$63,206.90', anchorChange: '+1.42%', topTrendAsset: 'SOL', topTrendAdx: '34.12', topMoverAsset: 'PEPE', topMoverChange: '+14.50%' };

        if (activeDb) {
            const { data: rawCrypto, error: cryptoErr } = await activeDb.from('crypto_telemetry').select('*');
            if (!cryptoErr && rawCrypto && rawCrypto.length > 0) {
                const freshCrypto = rawCrypto.slice(-50).reverse(); // Manually sort newest
                
                const btcNode = freshCrypto.find(c => { const assetStr = String(c.asset).toUpperCase(); return assetStr.includes('BTC') || assetStr.includes('BITCOIN'); });
                if (btcNode) {
                    cryptoData.anchorPrice = '$' + parseFloat(String(btcNode.price).replace(/[^0-9.-]+/g,"")).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                    const btcChange = parseFloat(String(btcNode.change_24h).replace(/[^0-9.-]+/g,"")) || 0;
                    cryptoData.anchorChange = (btcChange >= 0 ? '+' : '') + btcChange.toFixed(2) + '%';
                }
                const sortedByAdx = [...freshCrypto].sort((a, b) => (parseFloat(String(b.adx).replace(/[^0-9.-]+/g,"")) || 0) - (parseFloat(String(a.adx).replace(/[^0-9.-]+/g,"")) || 0));
                if (sortedByAdx.length > 0) {
                    let cleanAsset = sortedByAdx[0].asset; if (cleanAsset.includes('(')) cleanAsset = cleanAsset.substring(cleanAsset.indexOf('(') + 1, cleanAsset.indexOf(')')).trim();
                    cryptoData.topTrendAsset = cleanAsset.toUpperCase(); cryptoData.topTrendAdx = parseFloat(String(sortedByAdx[0].adx).replace(/[^0-9.-]+/g,"")).toFixed(2);
                }
                const sortedByChange = [...freshCrypto].sort((a, b) => (parseFloat(String(b.change_24h).replace(/[^0-9.-]+/g,"")) || 0) - (parseFloat(String(a.change_24h).replace(/[^0-9.-]+/g,"")) || 0));
                if (sortedByChange.length > 0) {
                    let cleanAsset = sortedByChange[0].asset; if (cleanAsset.includes('(')) cleanAsset = cleanAsset.substring(cleanAsset.indexOf('(') + 1, cleanAsset.indexOf(')')).trim();
                    cryptoData.topMoverAsset = cleanAsset.toUpperCase(); const moverChange = parseFloat(String(sortedByChange[0].change_24h).replace(/[^0-9.-]+/g,"")) || 0;
                    cryptoData.topMoverChange = (moverChange >= 0 ? '+' : '') + moverChange.toFixed(2) + '%';
                }
            }
        }
        if (cryptoContainer) {
            cryptoContainer.innerHTML = `<div class="flex justify-between items-center mb-1"><span class="text-slate-500 text-[10px] uppercase tracking-widest font-bold">BTC Anchor</span><div class="flex items-center gap-2"><span class="text-white font-bold">${cryptoData.anchorPrice}</span><span class="${cryptoData.anchorChange.startsWith('+') ? 'text-neon' : 'text-redAccent'}">${cryptoData.anchorChange}</span></div></div><div class="flex justify-between items-center mb-1"><span class="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Top Trend (ADX)</span><div class="flex items-center gap-2"><span class="text-white font-bold">${cryptoData.topTrendAsset}</span><span class="text-cyanAccent">${cryptoData.topTrendAdx} ADX</span></div></div><div class="flex justify-between items-center"><span class="text-slate-500 text-[10px] uppercase tracking-widest font-bold">24H Top Mover</span><div class="flex items-center gap-2"><span class="text-white font-bold">${cryptoData.topMoverAsset}</span><span class="text-neon">${cryptoData.topMoverChange}</span></div></div>`;
        }
    } catch (e) { if (cryptoContainer) cryptoContainer.innerHTML = `<span class="text-red-500 font-mono text-[10px]">WIDGET ERROR</span>`; }

    // Sports Widget Handler
    try {
        let sportsData = [];
        if (activeDb) {
            const { data: rawSports, error } = await activeDb.from('ev_live_data').select('*').eq('match_state', 'pre_match');
            if (!error && rawSports && rawSports.length > 0) {
                const data = rawSports.slice(-50).reverse();
                const uniqueMatches = []; const seenGames = new Set();
                for (let edge of data) {
                    let matchStr = String(edge.match_name || edge.game || "MATCH").trim();
                    if (!seenGames.has(matchStr)) {
                        seenGames.add(matchStr); const val = parseFloat(String(edge.ev || edge.value || edge.edge).replace(/[^0-9.-]+/g,"")) || 0;
                        let teamName = matchStr.split(/[@]|vs/i)[0].trim(); if(teamName.length > 15) teamName = teamName.substring(0, 15) + '...';
                        uniqueMatches.push({ team: teamName, evText: `+${val.toFixed(2)}% EV`, rawEv: val });
                    }
                }
                sportsData = uniqueMatches.sort((a, b) => b.rawEv - a.rawEv).slice(0, 2);
            }
        }
        if (sportsData.length === 0) sportsData = [ { team: 'LG Twins', evText: '+8.01% EV' }, { team: 'Kiwoom Heroes', evText: '+6.45% EV' } ];
        if (sportsContainer) {
            let sportsHTML = '';
            sportsData.forEach(match => { sportsHTML += `<div class="flex justify-between items-center mb-2"><div class="flex items-center gap-2"><div class="w-6 h-6 rounded-full bg-neon/10 flex items-center justify-center text-[10px] text-neon border border-neon/30">⚽</div><div class="text-xs font-bold text-white truncate max-w-[120px]">${match.team}</div></div><div class="text-xs font-mono text-neon font-bold shrink-0">${match.evText}</div></div>`; });
            sportsContainer.innerHTML = sportsHTML;
        }
    } catch (e) { if (sportsContainer) sportsContainer.innerHTML = `<span class="text-red-500 font-mono text-[10px]">WIDGET ERROR</span>`; }

    // Predictions Widget Handler
    try {
        let predData = [];
        if (activeDb) {
            const { data: rawKalshi, error } = await activeDb.from('kalshi_predictions').select('*');
            if (!error && rawKalshi && rawKalshi.length > 0) {
                const data = rawKalshi.slice(-50).reverse();
                const uniqueMarkets = []; const seenTitles = new Set();
                for (let m of data) {
                    let title = String(m.event_title || m.ticker || "Sim Event").trim();
                    if (!seenTitles.has(title)) {
                        seenTitles.add(title); const vol = parseFloat(String(m.volume_24h).replace(/[^0-9.-]+/g,"")) || 0;
                        if (vol > 0) {
                            const probVal = parseFloat(String(m.implied_probability || "0").replace(/[^0-9.-]+/g,"")); const fillPct = isNaN(probVal) ? 50 : probVal;
                            let marketName = title.length > 25 ? title.substring(0, 25) + '...' : title;
                            uniqueMarkets.push({ market: marketName, vol: m.volume_formatted || "N/A", fill: `${fillPct}%`, rawVol: vol });
                        }
                    }
                }
                predData = uniqueMarkets.sort((a, b) => b.rawVol - a.rawVol).slice(0, 2);
            }
        }
        if (predData.length === 0) predData = [ { market: 'Fed Rate Cut - Sep', vol: '$47.0K', fill: '65%' }, { market: 'US Core CPI Target', vol: '$24.5K', fill: '40%' } ];
        if (predictionsContainer) {
            let predHTML = '';
            predData.forEach(market => { predHTML += `<div class="flex flex-col gap-1 mb-3"><div class="flex justify-between text-slate-300"><span class="truncate pr-2 text-xs">${market.market}</span><span class="text-purpleAccent font-bold text-xs shrink-0">${market.vol}</span></div><div class="w-full bg-white/5 rounded-full h-1.5"><div class="bg-purpleAccent h-1.5 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.5)]" style="width: ${market.fill}"></div></div></div>`; });
            predictionsContainer.innerHTML = predHTML;
        }
    } catch (e) { if (predictionsContainer) predictionsContainer.innerHTML = `<span class="text-red-500 font-mono text-[10px]">WIDGET ERROR</span>`; }
}

// ==========================================
// 3. DISCOVER FEED ROUTING & RENDERING
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
    
    try {
        const feedUrl = RSS_SOURCES[category] || RSS_SOURCES['ALL'];
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status !== 'ok') throw new Error("RSS parsing failed");

        const liveArticles = data.items.map(item => {
            let imgUrl = item.enclosure?.link || item.thumbnail || '';
            if (!imgUrl && item.description) { const imgMatch = item.description.match(/src="([^"]+)"/); if (imgMatch) imgUrl = imgMatch[1]; }
            const pubDate = new Date(item.pubDate.replace(/-/g, '/')); 
            const diffHours = Math.max(1, Math.round((new Date() - pubDate) / (1000 * 60 * 60)));
            const timeString = diffHours > 24 ? `${Math.floor(diffHours/24)}D AGO` : `${diffHours}H AGO`;
            return { category: category === 'ALL' ? 'NEWS' : category, time: timeString, title: item.title, summary: item.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...', link: item.link, image: imgUrl };
        });
        renderArticles(liveArticles.slice(0, 12), feedContainer);
    } catch (error) {
        renderArticles(generateMockArticles(category), feedContainer);
    }
}

function getNativeAdCard() {
    return `<div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-cyanAccent/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-center min-h-[160px] mb-4"><div class="absolute top-2 right-3 text-[8px] font-mono text-cyanAccent/50 uppercase tracking-widest flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse"></span> SPONSORED</div><div class="w-full flex-grow flex items-center justify-center border border-white/5 mt-5 rounded bg-[#000000]"><a href="https://binance.us/universal_JHHGDSKDJ/auth/registration?ref=35082567" target="_blank" class="flex flex-col justify-between w-full h-full bg-black border border-[#fcd535]/40 hover:border-[#fcd535] transition-all p-4 group cursor-pointer no-underline block"><div><div class="text-[#fcd535] font-mono text-[10px] uppercase tracking-widest mb-1 opacity-80">> LIQUIDITY GATEWAY</div><div class="text-white font-mono text-sm font-bold tracking-tight leading-tight group-hover:text-gray-200 transition-colors">SECURE TRADING MATRIX ON BINANCE.US</div></div><div class="mt-2 text-[#fcd535] font-mono text-[11px] group-hover:translate-x-1 transition-transform">ACCESS PORTAL -></div></a></div></div>`;
}

function renderArticles(articles, container) {
    container.innerHTML = '';
    articles.forEach((article, index) => {
        let colorClass = 'text-cyanAccent'; let bgClass = 'bg-cyanAccent/20'; let borderClass = 'border-cyanAccent/30'; let hoverClass = 'hover:border-cyanAccent/30';
        if (article.category === 'SPORTS') { colorClass = 'text-[#39FF14]'; bgClass = 'bg-[#39FF14]/20'; borderClass = 'border-[#39FF14]/30'; hoverClass = 'hover:border-[#39FF14]/30'; } 
        else if (article.category === 'MARKETS') { colorClass = 'text-[#a855f7]'; bgClass = 'bg-[#a855f7]/20'; borderClass = 'border-[#a855f7]/30'; hoverClass = 'hover:border-[#a855f7]/30'; }
        const safeImage = article.image || 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=600&auto=format&fit=crop';
        
        let cardHTML = index === 0 ? 
            `<a href="${article.link}" target="_blank" class="bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${hoverClass} transition-colors group mb-6 block cursor-pointer"><div class="w-full md:w-2/5 bg-slate-900 min-h-[180px] flex items-center justify-center relative border-b md:border-b-0 md:border-r border-white/10 overflow-hidden"><div class="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-500" style="background-image: url('${safeImage}');"></div><div class="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent"></div><div class="z-10 font-mono text-[10px] ${colorClass} border ${borderClass} ${bgClass} px-3 py-1 rounded backdrop-blur-sm">LEAD_STORY</div></div><div class="w-full md:w-3/5 p-6 flex flex-col justify-between relative z-10"><div><div class="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2"><span class="${bgClass} ${colorClass} px-2 py-0.5 rounded font-bold border ${borderClass}">${article.category}</span><span>• ${article.time}</span></div><h2 class="font-impact text-xl text-white uppercase tracking-wide group-hover:text-white transition-colors mb-2">${article.title}</h2><p class="text-xs text-slate-400 font-mono leading-relaxed line-clamp-3">${article.summary}</p></div></div></a>` : 
            `<a href="${article.link}" target="_blank" class="bg-[#0b0f19]/60 border border-white/5 rounded-xl p-4 flex gap-4 hover:border-white/10 transition-colors group mb-4 block cursor-pointer"><div class="w-16 h-16 bg-slate-900 rounded-lg flex-shrink-0 border border-white/10 hidden sm:flex items-center justify-center relative overflow-hidden shadow-inner"><img src="${safeImage}" alt="Thumbnail" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div><div class="flex-grow flex flex-col justify-between"><div><div class="flex items-center gap-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1"><span class="${bgClass} ${colorClass} px-2 py-0.5 rounded font-bold border ${borderClass}">${article.category}</span><span>• ${article.time}</span></div><h3 class="font-bold text-white text-sm group-hover:text-white transition-colors mb-1">${article.title}</h3><p class="text-xs text-slate-400 font-mono line-clamp-2">${article.summary}</p></div></div></a>`;
        
        container.innerHTML += cardHTML;
        if ((index + 1) % 5 === 0 && index !== articles.length - 1) container.innerHTML += getNativeAdCard();
    });
}

function generateMockArticles(filter) {
    return [
        { category: filter === 'ALL' ? 'NEWS' : filter, time: '1H AGO', title: 'Simulation Engine System Matrix Sync Confirmed', summary: 'Analytical processing nodes verifying asset pipelines and performance tracking parameters.', link: '#', image: '' },
        { category: filter === 'ALL' ? 'NEWS' : filter, time: '3H AGO', title: 'Telemetry Engine Deploys Real-Time Processing', summary: 'Parallel independent data streams isolating algorithmic edges across execution layers.', link: '#', image: '' }
    ];
}

// ==========================================
// 4. MASTER CHAT QUERY ENGINE & QUICK-ACTIONS
// ==========================================
const FIREHOSE_ENDPOINT = 'https://api.terminalsoftware.online/query'; 

setTimeout(() => {
    const chatContainer = document.getElementById('chat-container');
    const queryInput = document.getElementById('query-input');
    const submitBtn = document.getElementById('submit-btn');

    if (queryInput && submitBtn) {
        queryInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMasterQuery(); });
        submitBtn.addEventListener('click', () => handleMasterQuery());
    }

    // Dynamic Binding for Research & Answers Cards
    document.body.addEventListener('click', function(e) {
        const trigger = e.target.closest('.ai-trigger');
        if (trigger) {
            e.preventDefault();
            const presetText = trigger.getAttribute('data-query');
            const targetNavBtn = document.querySelector('[data-target="view-ask"]');
            
            if (targetNavBtn) targetNavBtn.click();
            
            if (presetText && queryInput) {
                queryInput.value = presetText;
                handleMasterQuery();
            }
        }
    });

    async function handleMasterQuery() {
        if (!queryInput || !chatContainer) return;

        const text = queryInput.value.trim();
        if (!text) return;
        
        chatContainer.classList.remove('hidden'); chatContainer.classList.add('flex');
        renderUserMessage(text);
        queryInput.value = ''; queryInput.disabled = true;

        const logId = `log-${Date.now()}`;
        renderSystemLogs(logId);

        try {
            const response = await fetch(FIREHOSE_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: text }) });
            const data = await response.json();
            const processLog = document.getElementById(logId);
            if (processLog) processLog.remove();
            
            if (data.status === "success" && data.node_response) { 
                routeResponse(data.intent, data.node_response); 
            } else { 
                renderError("Invalid payload signature received from Master Control Node."); 
            }
        } catch (error) {
            const processLog = document.getElementById(logId);
            if (processLog) processLog.remove();
            renderError("CONNECTION BREAK: Local API bridge offline. System defaulting to simulated runtime loop response.");
            routeResponse("fallback", { response: `[LOCAL RUNTIME COMPLIANCE]: Received query "${text}". Processing complete. Data node state objects updated successfully.` });
        } finally {
            queryInput.disabled = false; queryInput.focus(); chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
}, 500);

function renderUserMessage(text) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    const wrapper = document.createElement('div'); wrapper.className = 'w-full md:w-2/3 max-w-2xl self-end text-right mt-2';
    wrapper.innerHTML = `<div class="inline-block bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl rounded-tr-sm px-5 py-3.5 text-xs sm:text-sm text-white shadow-lg text-left font-mono">${escapeHtml(text)}</div>`;
    chatContainer.appendChild(wrapper);
}

function escapeHtml(unsafe) { return String(unsafe).replace(/[&<"'>]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]; }); }

function renderSystemLogs(id) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    const wrapper = document.createElement('div'); wrapper.id = id; wrapper.className = 'w-full self-start pl-5 py-3 font-mono';
    wrapper.innerHTML = `<div class="text-[9px] sm:text-[10px] font-bold text-[#06b6d4] uppercase tracking-widest leading-loose animate-pulse">&gt; INTERCEPTING QUERY...<br>&gt; ROUTING TO MASTER TERMINAL NODE...<br>&gt; SYNTHESIZING RESPONSE<span class="cursor-blink">_</span></div>`;
    chatContainer.appendChild(wrapper);
}

function renderError(msg) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    const wrapper = document.createElement('div'); wrapper.className = 'w-full self-start pl-4 py-2 font-mono';
    wrapper.innerHTML = `<div class="text-xs text-red-500 font-bold uppercase tracking-widest border border-red-500/30 bg-red-500/10 p-4 rounded-xl">&gt; WARNING: ${msg}</div>`;
    chatContainer.appendChild(wrapper);
}

function routeResponse(intent, payload) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    const wrapper = document.createElement('div'); wrapper.className = 'w-full md:w-3/4 max-w-3xl self-start font-mono mt-4';
    const textContent = payload.action || payload.response || "";
    wrapper.innerHTML = `<div class="pl-5 border-l-2 border-brand/50 bg-brand/5 py-4 rounded-r-xl text-slate-300 text-sm typewriter-target" data-text="${escapeHtml(textContent)}"></div>`;
    chatContainer.appendChild(wrapper);
    const target = wrapper.querySelector('.typewriter-target');
    if (target) {
        let i = 0; const text = target.getAttribute('data-text'); target.innerHTML = '<span class="cursor-blink">_</span>';
        function type() {
            if (i < text.length) { target.innerHTML = target.innerHTML.replace('<span class="cursor-blink">_</span>', '') + text.charAt(i) + '<span class="cursor-blink">_</span>'; i++; chatContainer.scrollTop = chatContainer.scrollHeight; setTimeout(type, 15); } 
            else { target.innerHTML = target.innerHTML.replace('<span class="cursor-blink">_</span>', ''); }
        }
        type();
    }
}
