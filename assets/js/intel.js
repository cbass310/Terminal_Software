// assets/js/intel.js
// Handles the Player Intel Wire (RSS Proxy)

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
    if (!container) return;

    try {
        // Yahoo Sports RSS Feed proxy
        const rssUrl = encodeURIComponent('https://sports.yahoo.com/rss/');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await response.json();

        if (data && data.items && data.items.length > 0) {
            let html = '';
            
            data.items.slice(0, 15).forEach(item => {
                // Format the timestamp nicely
                const pubDate = new Date(item.pubDate);
                const timeString = pubDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dateString = pubDate.toLocaleDateString([], {month: 'short', day: 'numeric'});
                
                // Strip HTML tags and images from the description for a clean text look
                let cleanDesc = item.description.replace(/<[^>]*>?/gm, '').trim();
                if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + '...';

                html += `
                    <div class="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-brand/50 transition-all duration-300 shadow-md group relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-16 h-16 bg-brand/5 blur-2xl rounded-full group-hover:bg-brand/10 transition-colors pointer-events-none"></div>
                        
                        <div class="flex justify-between items-start mb-2 relative z-10">
                            <span class="text-brand font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                ${timeString} • ${dateString}
                            </span>
                        </div>
                        
                        <h3 class="font-impact text-white text-sm uppercase tracking-wide leading-tight mb-2 group-hover:text-brand transition-colors relative z-10">
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="after:absolute after:inset-0">${item.title}</a>
                        </h3>
                        
                        <p class="text-slate-400 font-mono text-[10px] leading-relaxed relative z-10">${cleanDesc}</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            throw new Error("No intel on wire.");
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
