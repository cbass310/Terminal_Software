// assets/js/intel.js
// Handles the Player Intel Wire (RSS Proxy + Keyword Filter)

function toggleNewsSidebar() {
    const sidebar = document.getElementById('news-sidebar');
    const overlay = document.getElementById('news-overlay');
    
    if (!sidebar || !overlay) return;

    if (sidebar.classList.contains('translate-x-full')) {
        // Open Sidebar
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        
        // Slight delay to allow display:block to apply before fading in opacity
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        
        // Lazy-Load: Only fetch news if the container is empty or showing the loader
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

async function fetchPlayerIntel() {
    const container = document.getElementById('news-feed-container');
    const leagueFilter = document.getElementById('intel-league-filter').value;
    
    if (!container) return;

    // Show Loader
    container.innerHTML = `
        <div class="text-center py-20">
            <div class="inline-block w-8 h-8 border-4 border-white/10 border-t-brand rounded-full animate-spin mb-4"></div>
            <p class="font-mono text-brand text-[10px] uppercase tracking-widest animate-pulse">Intercepting Wire...</p>
        </div>
    `;

    try {
        // Define which RSS endpoints to hit based on the dropdown
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

        // Fetch all required feeds
        for (let url of feedUrls) {
            const rssUrl = encodeURIComponent(url);
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
            const data = await response.json();
            if (data && data.items) {
                allItems = allItems.concat(data.items);
            }
        }

        // Sort everything by most recent
        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // THE MAGIC: Strict Keyword Filter
        // This drops all generic news and only keeps player status/injury updates
        const validKeywords = [
            'injury', 'injured', 'questionable', 'doubtful', 'probable', 'out', 
            'active', 'starts', 'starting', 'surgery', 'rehab', 'trade', 
            'waived', 'signs', 'contract', 'return', 'practice', 'cleared', 
            'sprain', 'tear', 'ruled'
        ];

        const filteredItems = allItems.filter(item => {
            const textToSearch = (item.title + " " + item.description).toLowerCase();
            return validKeywords.some(keyword => textToSearch.includes(keyword));
        });

        if (filteredItems.length > 0) {
            let html = '';
            
            // Limit to top 15 most recent, relevant articles
            filteredItems.slice(0, 15).forEach(item => {
                // Format the timestamp nicely
                const pubDate = new Date(item.pubDate);
                const timeString = pubDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dateString = pubDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
                
                // Strip HTML tags and images from the description for a clean text look
                let cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();
                if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + '...';

                // Color code the indicator dot based on the severity of the news
                const titleLower = item.title.toLowerCase();
                let badgeColor = 'text-brand';
                let dotColor = 'bg-brand';
                
                if (titleLower.includes('out') || titleLower.includes('surgery') || titleLower.includes('injury') || titleLower.includes('tear') || titleLower.includes('sprain') || titleLower.includes('doubtful')) {
                    badgeColor = 'text-redAccent';
                    dotColor = 'bg-redAccent';
                } else if (titleLower.includes('cleared') || titleLower.includes('active') || titleLower.includes('return') || titleLower.includes('starts') || titleLower.includes('signs')) {
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
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="hover:text-brand after:absolute after:inset-0">${item.title}</a>
                        </h3>
                        
                        <p class="text-slate-400 font-mono text-[10px] leading-relaxed relative z-10">${cleanDesc}</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            // Show this if no players are injured/active in the latest news cycle
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
