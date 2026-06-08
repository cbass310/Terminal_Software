// assets/js/predictions-intel.js
// Handles fetching and rendering live global market news for the Predictions Dashboard

let isPredictionNewsLoaded = false;

function togglePredictionNews() {
    const panel = document.getElementById('news-panel');
    if (!panel) return;

    if (panel.classList.contains('translate-x-full')) {
        panel.classList.remove('translate-x-full');
        
        // Only fetch from the API if we haven't loaded it yet this session
        if (!isPredictionNewsLoaded) {
            fetchPredictionNews();
        }
    } else {
        panel.classList.add('translate-x-full');
    }
}

async function fetchPredictionNews() {
    const contentDiv = document.getElementById('news-feed-content');
    if (!contentDiv) return;

    // Set Loading State
    contentDiv.innerHTML = `
        <div class="text-center py-10">
            <div class="inline-block w-6 h-6 border-2 border-white/10 border-t-purpleAccent rounded-full animate-spin mb-4"></div>
            <p class="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Aggregating Global Intel...</p>
        </div>
    `;

    try {
        // Fetching live real-world finance/market news from Yahoo Finance RSS via a public JSON converter
        const rssUrl = encodeURIComponent('https://finance.yahoo.com/news/rssindex');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        
        if (!response.ok) throw new Error("Failed to fetch news feed");
        
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            let html = '';
            
            // Slice top 15 news items
            data.items.slice(0, 15).forEach(item => {
                
                // Format the timestamp cleanly
                const pubDate = new Date(item.pubDate);
                const timeString = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Keep source generic or pull from feed if available
                const sourceStr = "GLOBAL WIRE";

                html += `
                    <a href="${item.link}" target="_blank" class="block border-b border-white/5 pb-4 last:border-0 group cursor-pointer mt-4 hover:bg-white/5 p-2 rounded transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-[9px] font-mono text-purpleAccent uppercase tracking-widest shrink-0">${sourceStr}</span>
                            <span class="text-[8px] font-mono text-slate-500 uppercase tracking-widest shrink-0 text-right pl-2">${timeString}</span>
                        </div>
                        <h4 class="text-slate-300 font-bold text-xs leading-snug group-hover:text-white transition-colors">${item.title}</h4>
                    </a>
                `;
            });
            
            contentDiv.innerHTML = html;
            isPredictionNewsLoaded = true; // Mark as loaded so we don't spam the API
        } else {
            throw new Error("Empty feed data returned");
        }
    } catch (error) {
        console.error("Prediction Intel Fetch Error:", error);
        contentDiv.innerHTML = `
            <div class="p-4 bg-redAccent/10 border border-redAccent/30 rounded-xl text-center mt-4">
                <p class="text-[10px] font-mono text-redAccent uppercase tracking-widest">Failed to establish uplink to news server.</p>
                <button onclick="fetchPredictionNews()" class="mt-4 px-4 py-2 border border-white/20 text-xs text-white hover:text-purpleAccent hover:border-purpleAccent transition-colors rounded">Retry Connection</button>
            </div>
        `;
    }
}
