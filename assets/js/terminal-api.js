// assets/js/terminal-api.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the feed when the Discover tab is opened
    const discoverBtn = document.querySelector('[data-target="view-discover"]');
    if (discoverBtn) {
        discoverBtn.addEventListener('click', () => {
            loadDiscoverFeed('ALL');
        });
    }

    // Listen for Category Filter Clicks in the Discover View
    const categoryBtns = document.querySelectorAll('.news-tab-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update Active State
            categoryBtns.forEach(b => b.classList.remove('active', 'text-black', 'bg-[#06b6d4]'));
            categoryBtns.forEach(b => b.classList.add('text-slate-400'));
            
            e.target.classList.remove('text-slate-400');
            e.target.classList.add('active', 'text-black');
            e.target.style.backgroundColor = '#06b6d4'; // Cyan active state

            // Fetch specific feed
            const category = e.target.innerText.trim();
            loadDiscoverFeed(category);
        });
    });
});

// --- API FETCH LOGIC ---
async function loadDiscoverFeed(category) {
    const feedContainer = document.getElementById('discover-feed-container');
    
    // 1. Show Loading State
    feedContainer.innerHTML = `
        <div class="flex justify-center items-center py-12">
            <span class="text-cyanAccent font-mono text-xs animate-pulse">SYNCING ${category} TELEMETRY...</span>
        </div>
    `;

    try {
        // Replace this URL with your actual Terminal Software RSS/News endpoint
        const endpoint = `https://api.terminalsoftware.online/wire?category=${encodeURIComponent(category)}`;
        
        /* // UNCOMMENT THIS WHEN YOUR ENDPOINT IS LIVE
        const response = await fetch(endpoint);
        const data = await response.json(); 
        */

        // MOCK DATA: Simulating your backend response for testing the UI
        const mockData = generateMockArticles(category);
        
        // 2. Render the Data
        renderArticles(mockData, feedContainer);

    } catch (error) {
        feedContainer.innerHTML = `
            <div class="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-center">
                <span class="text-red-500 font-mono text-xs">ERROR: UNABLE TO ESTABLISH UPLINK WITH INTEL WIRE.</span>
            </div>
        `;
    }
}

// --- HTML RENDERING ENGINE ---
function renderArticles(articles, container) {
    container.innerHTML = ''; // Clear loading state

    articles.forEach((article, index) => {
        let cardHTML = '';

        // Determine styling based on category
        let colorClass = 'text-cyanAccent';
        let bgClass = 'bg-cyanAccent/20';
        let borderClass = 'border-cyanAccent/30';
        let hoverClass = 'hover:border-cyanAccent/30';
        
        if (article.category === 'SPORTS') {
            colorClass = 'text-[#39FF14]'; // Neon
            bgClass = 'bg-[#39FF14]/20';
            borderClass = 'border-[#39FF14]/30';
            hoverClass = 'hover:border-[#39FF14]/30';
        } else if (article.category === 'MARKETS') {
            colorClass = 'text-[#a855f7]'; // Purple
            bgClass = 'bg-[#a855f7]/20';
            borderClass = 'border-[#a855f7]/30';
            hoverClass = 'hover:border-[#a855f7]/30';
        }

        // Render Lead Story for the first item
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
                                <span class="${bgClass} ${colorClass} px-2 py-0.5 rounded font-bold">${article.category}</span>
                                <span>• ${article.time}</span>
                            </div>
                            <h2 class="font-impact text-xl sm:text-2xl text-white uppercase tracking-wide group-hover:text-white transition-colors mb-3">
                                ${article.title}
                            </h2>
                            <p class="text-sm text-slate-400 font-mono leading-relaxed line-clamp-3">
                                ${article.summary}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Render standard list item
            cardHTML = `
                <div class="bg-[#0b0f19]/60 border border-white/5 rounded-xl p-5 flex gap-4 hover:border-white/10 transition-colors group mb-4">
                    <div class="w-20 h-20 bg-slate-900 rounded-lg flex-shrink-0 border border-white/10 hidden sm:flex items-center justify-center relative font-mono text-[9px] ${colorClass}">
                        NODE_${Math.floor(Math.random() * 99) + 1}
                    </div>
                    <div class="flex-grow flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                                <span class="${bgClass} ${colorClass} px-2 py-0.5 rounded font-bold">${article.category}</span>
                                <span>• ${article.time}</span>
                            </div>
                            <h3 class="font-bold text-white text-base group-hover:text-white transition-colors mb-1">
                                ${article.title}
                            </h3>
                            <p class="text-xs text-slate-400 font-mono line-clamp-2">
                                ${article.summary}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML += cardHTML;
    });
}

// Helper to generate fake data until your API is hooked up
function generateMockArticles(filter) {
    return [
        { category: 'SPORTS', time: '1H AGO', title: 'Simulation Engine Logs 12,000 matches confirming configurations', summary: 'Analytical evaluation nodes map roster transitions with high confidence ratios across standard league settings.' },
        { category: 'CRYPTO', time: '3H AGO', title: 'Bitcoin ETF inflows hit highest institutional momentum since late 2024', summary: 'On-chain records log spot demand parameters surging across networks, running parallel to macro asset adjustments.' },
        { category: 'MARKETS', time: '5H AGO', title: 'Implied probability shifts drastically following injury node update', summary: 'Prediction markets adjust volume rapidly as primary simulation variables are modified.' },
        { category: 'TECH', time: '12H AGO', title: 'Unmetered API execution pipelines drop local matrix query overhead', summary: 'New development routing configurations show zero token degradation tracking complex state objects.' }
    ];
}
