// assets/js/intel.js
// Handles the Player Intel Wire (RSS Proxy + Strict Keyword Filter)

function toggleNewsSidebar() {
    const sidebar = document.getElementById('news-sidebar');
    const overlay = document.getElementById('news-overlay');
    
    if (!sidebar || !overlay) return;

    if (sidebar.classList.contains('translate-x-full')) {
        // Open Sidebar
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        
        const container = document.getElementById('news-feed-container');
        if (container && container.innerHTML.includes('Intercepting Wire')) {
            fetchPlayerIntel();
        }
    } else {
        // Close Sidebar
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

// Helper to decode ugly HTML entities like &#39; into real apostrophes
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

async function fetchPlayerIntel() {
    const container = document.getElementById('news-feed-container');
    const leagueFilter = document.getElementById('intel-league-filter').value;
    
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-20">
            <div class="inline-block w-8 h-8 border-4 border-white/10 border-t-brand rounded-full animate-spin mb-4"></div>
            <p class="font-mono text-brand text-[10px] uppercase tracking-widest animate-pulse">Intercepting Wire...</p>
        </div>
    `;

    try {
        let feedUrls = [];
        if (leagueFilter === 'all') {
            feedUrls = [
                'https://sports.yahoo.com/nba/rss/',
                'https://sports.yahoo.com/mlb/rss/',
                'https://sports.yahoo.com/nfl/rss/'
            ];
        } else {
            feedUrls = [`https://sports.yahoo.com/${leagueFilter}/rss/`];
        }

        let allItems = [];

        for (let url of feedUrls) {
            const rssUrl = encodeURIComponent(url);
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
            const data = await response.json();
            if (data && data.items) {
                allItems = allItems.concat(data.items);
            }
        }

        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // THE MAGIC: Strict Regex Keyword Filter
        const validKeywords = [
            'injury', 'injured', 'questionable', 'doubtful', 'probable', 'out', 
            'active', 'starts', 'starting', 'surgery', 'rehab', 'trade', 
            'waived', 'signs', 'contract', 'return', 'practice', 'cleared', 
            'sprain', 'tear', 'ruled'
        ];

        // This Regex \b ensures it only matches EXACT whole words. "out" will no longer match "without"
        const regexPattern = new RegExp(`\\b(${validKeywords.join('|')})\\b`, 'i');

        const filteredItems = allItems.filter(item => {
            const textToSearch = (item.title + " " + item.description).toLowerCase();
            return regexPattern.test(textToSearch);
        });

        if (filteredItems.length > 0) {
            let html = '';
            
            filteredItems.slice(0, 15).forEach(item => {
                const pubDate = new Date(item.pubDate);
                const timeString = pubDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dateString = pubDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
                
                // Clean the text and decode HTML entities
                const cleanTitle = decodeHtml(item.title);
                let cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();
                cleanDesc = decodeHtml(cleanDesc);
                if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + '...';

                const titleLower = cleanTitle.toLowerCase();
                let badgeColor = 'text-brand';
                let dotColor = 'bg-brand';
                
                // Strict check for the red severity dot
                if (/\b(out|surgery|injury|injured|tear|sprain|doubtful|ruled)\b/i.test(titleLower)) {
                    badgeColor = 'text-redAccent';
                    dotColor = 'bg-redAccent';
                } else if (/\b(cleared|active|return|starts|starting|signs)\b/i.test(titleLower)) {
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
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="hover:text-brand after:absolute after:inset-0">${cleanTitle}</a>
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
                    <span class="text-slate-500 font-mono text-[9px]">No injury or status updates on the wire right now.</span>
                </div>
            `;
        }
    } catch (err) {
        console.error("Intel Fetch Error:", err);
        container.innerHTML = `
            <div class="text-center py-10 bg-red-500/5 rounded-xl border border-red-500/10">
                <span class="text-redAccent font-black text-[10px] uppercase tracking-widest block mb-2">Connection Severed</span>
                <span class="text-slate-500 font-mono text-[9px]">Failed to parse news wire.</span>
            </div>
        `;
    }
}
