// assets/js/crypto-intel.js
// Handles the Crypto Intel Wire (RSS Proxy + Keyword Sentiment)

function toggleCryptoNewsSidebar() {
    const sidebar = document.getElementById('crypto-news-sidebar');
    const overlay = document.getElementById('crypto-news-overlay');
    
    if (!sidebar || !overlay) return;

    if (sidebar.classList.contains('translate-x-full')) {
        // Open Sidebar
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        
        // Lazy load the feed
        const container = document.getElementById('crypto-news-feed-container');
        if (container && container.innerHTML.includes('Intercepting Wire')) {
            fetchCryptoIntel();
        }
    } else {
        // Close Sidebar
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

// Helper to decode ugly HTML entities
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

async function fetchCryptoIntel() {
    const container = document.getElementById('crypto-news-feed-container');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-20">
            <div class="inline-block w-8 h-8 border-4 border-white/10 border-t-cyanAccent rounded-full animate-spin mb-4"></div>
            <p class="font-mono text-cyanAccent text-[10px] uppercase tracking-widest animate-pulse">Intercepting Blockchain Wire...</p>
        </div>
    `;

    try {
        // CoinTelegraph is the fastest, most reliable crypto RSS feed
        const rssUrl = encodeURIComponent('https://cointelegraph.com/rss');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await response.json();

        if (data && data.items && data.items.length > 0) {
            let html = '';
            
            data.items.slice(0, 15).forEach(item => {
                const pubDate = new Date(item.pubDate);
                const timeString = pubDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dateString = pubDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
                
                const cleanTitle = decodeHtml(item.title);
                let cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();
                cleanDesc = decodeHtml(cleanDesc);
                if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + '...';

                // Sentiment Color Coding
                const titleLower = cleanTitle.toLowerCase();
                let badgeColor = 'text-cyanAccent';
                let dotColor = 'bg-cyanAccent';
                
                // Red for bearish/bad news
                if (/\b(hack|stolen|sec|sues|ban|banned|crash|scam|ftx|fraud)\b/i.test(titleLower)) {
                    badgeColor = 'text-redAccent';
                    dotColor = 'bg-redAccent';
                // Green for bullish/good news
                } else if (/\b(etf|bull|surge|adopts|approves|all-time high|ath|rally)\b/i.test(titleLower)) {
                    badgeColor = 'text-neon';
                    dotColor = 'bg-neon';
                }

                html += `
                    <div class="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all duration-300 shadow-md group relative overflow-hidden">
                        <div class="flex justify-between items-start mb-2 relative z-10">
                            <span class="${badgeColor} font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse"></span>
                                ${timeString} • ${dateString}
                            </span>
                        </div>
                        
                        <h3 class="font-impact text-white text-sm uppercase tracking-wide leading-tight mb-2 transition-colors relative z-10">
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="hover:text-cyanAccent after:absolute after:inset-0">${cleanTitle}</a>
                        </h3>
                        
                        <p class="text-slate-400 font-mono text-[10px] leading-relaxed relative z-10">${cleanDesc}</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="text-center py-10 bg-white/5 rounded-xl border border-white/10">
                    <span class="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-2">No Intel Found</span>
                    <span class="text-slate-500 font-mono text-[9px]">The blockchain wire is currently quiet.</span>
                </div>
            `;
        }
    } catch (err) {
        console.error("Crypto Intel Fetch Error:", err);
        container.innerHTML = `
            <div class="text-center py-10 bg-red-500/5 rounded-xl border border-red-500/10">
                <span class="text-redAccent font-black text-[10px] uppercase tracking-widest block mb-2">Connection Severed</span>
                <span class="text-slate-500 font-mono text-[9px]">Failed to parse blockchain wire.</span>
            </div>
        `;
    }
}
