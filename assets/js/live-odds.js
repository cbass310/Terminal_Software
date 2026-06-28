// assets/js/live-odds.js
// Terminal Software - Dedicated Live Odds Matrix Engine

let matrixDataHash = "";
let liveMatrixInterval = null;
let currentMatrixSportFilter = "all";
let globalMatrixData = []; 

// --- UTILITY LOGIC ---
function matrixConvertToDecimal(americanStr) {
    if (!americanStr || americanStr === "N/A" || americanStr === "-") return 0;
    // Strip out plus signs and commas to ensure clean math
    const odds = parseFloat(String(americanStr).replace('+', '').replace(/,/g, '').trim());
    if (isNaN(odds) || odds === 0) return 0;
    if (odds > 0) return (odds / 100) + 1;
    if (odds < 0) return (100 / Math.abs(odds)) + 1;
    return 1;
}

// --- LOGO PATH FUNCTION (NUCLEAR CACHE BUSTER APPLIED) ---
function getSportsbookLogo(bookName, classes = "w-14 sm:w-16 h-4 sm:h-5 object-contain") {
    if (!bookName) return `<span class="text-[10px] text-slate-400 font-mono font-bold uppercase">🏦 UNKNOWN</span>`;
    
    const normalized = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bookMap = {
        'draftkings': 'draftkings', 'fanduel': 'fanduel', 'pinnacle': 'pinnacle',
        'circa': 'circa', 'circasports': 'circa', 'betmgm': 'betmgm', 'mgm': 'betmgm',
        'fanatics': 'fanatics', 'bovada': 'bovada', 'betrivers': 'betrivers', 'rivers': 'betrivers',
        'prizepicks': 'prizepicks', 'underdog': 'underdog', 'underdogfantasy': 'underdog', 
        'sleeper': 'sleeper', 'betonlineag': 'betonlineag', 'betonline': 'betonlineag',
        'caesars': 'caesars', 'pointsbetus': 'pointsbet', 'pointsbet': 'pointsbet',
        'wynnbet': 'wynnbet', 'betanysports': 'betanysports'
    };
    
    const fileName = bookMap[normalized];
    
    // Generates a unique millisecond timestamp to permanently bypass the browser cache
    const cacheBuster = Date.now();
    
    if (fileName) {
        return `<img src="assets/images/books/${fileName}.svg?v=${cacheBuster}" class="${classes}" alt="${bookName}" onerror="this.onerror=null; this.src='assets/images/books/${fileName}.png'; this.className='${classes} opacity-50';"/>`;
    }
    return `<span class="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">🏦 ${bookName}</span>`;
}

// --- DATA PIPELINE (SERVER-SIDE FILTERING) ---
async function fetchMatrixData() {
    if (typeof db === 'undefined') {
        console.error("Matrix Error: Supabase DB not initialized.");
        return;
    }
    
    try {
        let query = db.from('raw_odds_matrix')
            .select('*')
            .eq('status', 'active');
            
        // The Smart Filter: Only fetch the exact sport requested
        if (currentMatrixSportFilter !== 'all') {
            query = query.ilike('sport', `%${currentMatrixSportFilter}%`);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(2500); 

        if (error) throw error;
        
        globalMatrixData = data || [];
        renderLiveOddsMatrix();
    } catch (e) {
        console.error("Matrix Fetch Failed:", e);
    }
}

// --- RENDER ENGINE ---
function renderLiveOddsMatrix() {
    const matrixContainer = document.getElementById('matrix-rows-container');
    const headerContainer = document.getElementById('matrix-header-container');
    if (!matrixContainer || !headerContainer) return;

    // 1. Generate Native Static Sports Navigation
    const staticSports = ['all', 'baseball', 'basketball', 'football', 'hockey', 'soccer', 'tennis', 'mma', 'golf'];
    let sportsHtml = `<div class="flex overflow-x-auto hide-scrollbar gap-2 mb-4 pb-2 w-full">`;
    
    staticSports.forEach(sport => {
        const isActive = currentMatrixSportFilter === sport;
        const activeClass = isActive ? 'bg-neon/10 text-neon border-neon/50 shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white';
        sportsHtml += `<button onclick="setMatrixFilter('${sport}')" class="shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeClass}">${sport}</button>`;
    });
    sportsHtml += `</div>`;

    if (globalMatrixData.length === 0) {
        headerContainer.innerHTML = sportsHtml;
        matrixContainer.innerHTML = `<div class="text-center py-10"><span class="text-neon font-mono text-[10px] tracking-widest uppercase animate-pulse">Awaiting ${currentMatrixSportFilter.toUpperCase()} Telemetry...</span></div>`;
        return;
    }

    // 2. Pivot the Data
    const grouped = {};
    const activeBooks = new Set();

    globalMatrixData.forEach(edge => {
        if (String(edge.status).toLowerCase() === 'prevent_empty_delete') return;
        
        const key = `${edge.match_name}_${edge.target}_${edge.market}`;
        
        if (!grouped[key]) {
            grouped[key] = {
                match_name: edge.match_name,
                target: edge.target,
                market: edge.market,
                sport: edge.sport,
                league: edge.league || edge.sport,
                baseline: edge.market_avg || "N/A",
                odds: {},
                edges: {}
            };
        }
        
        const bookNameRaw = String(edge.sportsbook || edge.book || '');
        const bookName = bookNameRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (bookName && bookName !== 'pinnacle') {
            activeBooks.add(bookNameRaw);
        }

        grouped[key].odds[bookName] = edge.odds;
        grouped[key].edges[bookName] = parseFloat(edge.ev || 0);
        
        if (bookName === 'pinnacle' && edge.odds && edge.odds !== "N/A") {
            grouped[key].baseline = edge.odds;
        }
    });

    const dynamicColumns = Array.from(activeBooks).sort();
    const gridCols = `grid-template-columns: 2.5fr 1fr repeat(${dynamicColumns.length + 1}, 1fr);`;
    
    // 3. Build Dynamic Logo Header beneath the Sports Pills
    let headerHtml = `
        ${sportsHtml}
        <div class="grid w-full text-[10px] sm:text-xs font-heading font-black text-slate-500 tracking-widest border-b border-white/10 pb-3 mb-4 items-center" style="${gridCols}">
            <div class="pl-2">MATCHUP / MARKET</div>
            <div class="text-center">TARGET ASSET</div>
            <div class="flex justify-center">${getSportsbookLogo('pinnacle')}</div>
    `;
    
    dynamicColumns.forEach(bookRaw => {
        headerHtml += `<div class="flex justify-center">${getSportsbookLogo(bookRaw)}</div>`;
    });
    headerHtml += `</div>`;
    headerContainer.innerHTML = headerHtml;

    // 4. Build HTML Rows
    let html = '';
    const currentFormat = window.currentOddsFormat || 'american';
    let currentMatchName = '';

    Object.values(grouped).forEach(item => {
        if (item.match_name !== currentMatchName) {
            html += `
                <div class="w-full bg-neon/10 border border-neon/20 mt-4 mb-2 py-2 px-4 rounded-lg flex justify-between items-center shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                    <span class="font-heading font-black text-white text-xs sm:text-sm tracking-widest uppercase">${item.match_name}</span>
                    <span class="font-mono text-[9px] sm:text-[10px] text-neon uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-neon/30">${item.league}</span>
                </div>
            `;
            currentMatchName = item.match_name;
        }

        let baselineAm = item.baseline;
        let baselineImplied = 'N/A';
        if (item.baseline !== "N/A" && item.baseline !== null) {
            const dec = matrixConvertToDecimal(item.baseline);
            baselineImplied = (dec > 0) ? (1 / dec * 100).toFixed(1) + '%' : 'N/A';
            baselineAm = (!String(item.baseline).startsWith('-') && !String(item.baseline).startsWith('+')) ? '+' + item.baseline : item.baseline;
        }

        html += `<div class="grid w-full items-center py-3 border-b border-white/5 hover:bg-white/5 transition-colors group" style="${gridCols}">`;
        
        html += `
            <div class="flex flex-col pl-2">
                <span class="font-bold text-white text-xs sm:text-sm truncate">${item.market.toUpperCase()}</span>
            </div>
            <div class="text-center font-mono text-xs text-slate-300 font-bold bg-black/30 py-1 rounded border border-white/5 truncate px-1 mx-1">
                ${item.target}
            </div>
            <div class="text-center font-mono text-sm text-white font-bold bg-white/5 py-1 rounded mx-1">
                ${currentFormat === 'american' ? baselineAm : baselineImplied}
            </div>
        `;

        dynamicColumns.forEach(bookRaw => {
            const bookKey = bookRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
            const rawOdds = item.odds[bookKey];
            
            if (!rawOdds || rawOdds === "N/A") {
                html += `<div class="text-center font-mono text-xs text-slate-600">-</div>`;
                return;
            }

            const decimal = matrixConvertToDecimal(rawOdds);
            const implied = (decimal > 0) ? (1 / decimal * 100).toFixed(1) + '%' : '0.0%';
            const am = (!String(rawOdds).startsWith('-') && !String(rawOdds).startsWith('+')) ? '+' + rawOdds : rawOdds;
            
            const isEdge = item.edges[bookKey] > 0;
            const displayStr = currentFormat === 'american' ? am : implied;

            if (isEdge) {
                html += `
                <div class="flex justify-center px-1">
                    <div class="w-full text-center font-mono text-sm font-bold text-black bg-neon py-1 rounded shadow-[0_0_8px_rgba(57,255,20,0.6)]">
                        ${displayStr}
                    </div>
                </div>`;
            } else {
                html += `<div class="text-center font-mono text-sm text-slate-400 font-bold">${displayStr}</div>`;
            }
        });
        html += `</div>`;
    });

    if (Object.keys(grouped).length === 0) {
        html = `<div class="text-center font-mono text-[10px] text-slate-500 tracking-widest uppercase py-10 w-full">NO ODDS FOUND FOR THIS SPORT</div>`;
    }

    matrixContainer.innerHTML = html;
}

// Global filter hook
window.setMatrixFilter = function(sport) {
    currentMatrixSportFilter = sport;
    const matrixContainer = document.getElementById('matrix-rows-container');
    if (matrixContainer) {
        matrixContainer.innerHTML = `<div class="text-center py-10"><span class="text-neon font-mono text-[10px] tracking-widest uppercase animate-pulse">Syncing ${sport.toUpperCase()} Telemetry...</span></div>`;
    }
    // Re-render immediately to update the active button class, then fetch
    renderLiveOddsMatrix();
    fetchMatrixData();
}

// --- GLOBAL EVENT LISTENERS ---
document.addEventListener('click', function(e) {
    if (e.target.closest('#toggle-american')) {
        e.preventDefault();
        setOddsFormat('american');
    }
    if (e.target.closest('#toggle-implied')) {
        e.preventDefault();
        setOddsFormat('implied');
    }
});

// Implied Probability and American Odds Toggle
window.setOddsFormat = function(format) {
    window.currentOddsFormat = format;
    const toggleAm = document.getElementById('toggle-american');
    const toggleImp = document.getElementById('toggle-implied');

    if (format === 'american') {
        if(toggleAm) toggleAm.className = "px-4 py-1.5 rounded-md font-bold font-mono text-[10px] uppercase tracking-widest transition-all bg-white/10 text-white shadow-sm pointer-events-none";
        if(toggleImp) toggleImp.className = "px-4 py-1.5 rounded-md font-bold font-mono text-[10px] uppercase tracking-widest transition-all text-slate-500 hover:text-slate-300 cursor-pointer";
    } else {
        if(toggleImp) toggleImp.className = "px-4 py-1.5 rounded-md font-bold font-mono text-[10px] uppercase tracking-widest transition-all bg-white/10 text-white shadow-sm pointer-events-none";
        if(toggleAm) toggleAm.className = "px-4 py-1.5 rounded-md font-bold font-mono text-[10px] uppercase tracking-widest transition-all text-slate-500 hover:text-slate-300 cursor-pointer";
    }
    
    renderLiveOddsMatrix();
};

// --- TAB ROUTING & INIT ---
window.addEventListener('DOMContentLoaded', () => {
    const btnPre = document.getElementById('ev-tab-pre');
    const btnLive = document.getElementById('ev-tab-live');
    const btnMatrix = document.getElementById('ev-tab-matrix');
    
    const evCardsView = document.getElementById('sports-ev-cards-view');
    const matrixView = document.getElementById('sports-matrix-view');
    
    window.currentOddsFormat = 'american';
    
    function activateMatrix() {
        if(evCardsView) evCardsView.classList.add('hidden');
        if(matrixView) matrixView.classList.remove('hidden');
        
        btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
        if(btnPre) btnPre.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        if(btnLive) btnLive.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        
        fetchMatrixData();
        if (liveMatrixInterval) clearInterval(liveMatrixInterval);
        liveMatrixInterval = setInterval(fetchMatrixData, 15000);
    }
    
    function revertToCards() {
        if(matrixView) matrixView.classList.add('hidden');
        if(evCardsView) evCardsView.classList.remove('hidden');
        
        btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        if (liveMatrixInterval) clearInterval(liveMatrixInterval);
    }
    
    if (btnMatrix) btnMatrix.addEventListener('click', activateMatrix);
    if(btnPre) btnPre.addEventListener('click', revertToCards);
    if(btnLive) btnLive.addEventListener('click', revertToCards);
});
