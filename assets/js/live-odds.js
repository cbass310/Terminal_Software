// assets/js/live-odds.js
// Terminal Software - Dedicated Live Odds Matrix Engine

let matrixDataHash = "";
let liveMatrixInterval = null;
let rawMatrixData = [];
let currentMatrixSportFilter = 'all';

// --- UTILITY LOGIC ---
function matrixConvertToDecimal(americanStr) {
    const odds = parseFloat(String(americanStr).replace('+', ''));
    if (isNaN(odds)) return 1;
    if (odds > 0) return (odds / 100) + 1;
    if (odds < 0) return (100 / Math.abs(odds)) + 1;
    return 1; 
}

window.setMatrixSportFilter = function(sport) {
    currentMatrixSportFilter = sport;
    renderLiveOddsMatrix(rawMatrixData);
};

// --- UPDATED LOGO PATH FUNCTION ---
function getSportsbookLogo(bookName, classes = "w-14 sm:w-16 h-4 sm:h-5 object-contain") {
    if (!bookName) return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 UNKNOWN</span>`;
    const normalized = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bookMap = {
        'draftkings': 'draftkings', 'fanduel': 'fanduel', 'pinnacle': 'pinnacle', 'circa': 'circa', 'circasports': 'circa',
        'betmgm': 'betmgm', 'mgm': 'betmgm', 'fanatics': 'fanatics', 'bovada': 'bovada', 'betrivers': 'betrivers', 'rivers': 'betrivers',
        'prizepicks': 'prizepicks', 'underdog': 'underdog', 'underdogfantasy': 'underdog', 'sleeper': 'sleeper'
    };
    const fileName = bookMap[normalized];
    if (fileName) return `<img src="assets/images/books/${fileName}.svg" alt="${bookName}" class="${classes} filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" onerror="this.outerHTML='<span class=\\'font-bold text-white tracking-widest text-[10px]\\'>🏦 ${bookName.toUpperCase()}</span>'">`;
    return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 ${bookName.toUpperCase()}</span>`;
}

// --- DATA PIPELINE ---
async function fetchMatrixData() {
    const database = window.db || db; 
    
    if (!database) {
        console.error("Matrix Error: Supabase DB not initialized.");
        return;
    }
    
    try {
        const { data, error } = await database.from('raw_odds_matrix')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1000); 

        if (error) throw error;

        const currentDataHash = data ? JSON.stringify(data) : "";
        if (currentDataHash === matrixDataHash) return; 

        matrixDataHash = currentDataHash;
        rawMatrixData = data || [];
        renderLiveOddsMatrix(rawMatrixData);
        
    } catch (err) {
        console.error("Matrix Telemetry Error:", err);
        const container = document.getElementById('matrix-rows-container');
        if (container) {
            container.innerHTML = `<div class="text-center text-redAccent font-mono text-[10px] uppercase tracking-widest py-8">> CONNECTION SEVERED: UNABLE TO REACH TELEMETRY NODE.</div>`;
        }
    }
}

// --- RENDER ENGINE ---
function renderLiveOddsMatrix(data) {
    const matrixContainer = document.getElementById('matrix-rows-container');
    if (!matrixContainer) return;

    // HIJACK THE DOM: Hide the old static HTML header from dashboard.html
    const parentGrid = matrixContainer.parentElement;
    if (parentGrid) {
        const oldHeader = parentGrid.querySelector('.grid-cols-6');
        if (oldHeader && oldHeader !== matrixContainer) {
            oldHeader.style.display = 'none'; 
        }
    }

    // 1. EXTRACT UNIQUE SPORTS FOR THE FILTER BAR
    const sportsSet = new Set();
    data.forEach(edge => {
        if(edge.sport && String(edge.status).toLowerCase() !== 'expired') {
            sportsSet.add(String(edge.sport).toLowerCase());
        }
    });
    const uniqueSports = Array.from(sportsSet).sort();

    // 2. FILTER DATA BASED ON SELECTION
    const filteredData = currentMatrixSportFilter === 'all' 
        ? data 
        : data.filter(e => String(e.sport).toLowerCase() === currentMatrixSportFilter);

    // 3. GROUP DATA BY MATCH & TARGET
    const groupedByMatch = {};

    filteredData.forEach(edge => {
        if (String(edge.status).toLowerCase() === 'expired') return;
        
        const matchName = edge.match_name || "UNKNOWN MATCH";
        if (!groupedByMatch[matchName]) {
            groupedByMatch[matchName] = {
                sport: edge.sport,
                league: edge.league || edge.sport || 'SPORTS',
                targets: {}
            };
        }
        
        const key = `${edge.target}_${edge.market}`;
        if (!groupedByMatch[matchName].targets[key]) {
            groupedByMatch[matchName].targets[key] = {
                target: edge.target,
                market: edge.market,
                baseline: edge.market_avg || "N/A",
                odds: {},
                edges: {}
            };
        }
        
        const bookName = String(edge.sportsbook || edge.book || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        groupedByMatch[matchName].targets[key].odds[bookName] = edge.odds;
        groupedByMatch[matchName].targets[key].edges[bookName] = parseFloat(edge.ev || 0);

        if (bookName === 'pinnacle' && edge.odds) {
            groupedByMatch[matchName].targets[key].baseline = edge.odds;
        }
    });

    const currentFormat = window.currentOddsFormat || 'american';

    // 4. BUILD FILTER BAR UI
    let html = `<div class="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2 w-full border-b border-white/5">`;
    const isActiveAll = currentMatrixSportFilter === 'all' ? 'bg-neon/10 text-neon border-neon/50 shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white';
    html += `<button onclick="setMatrixSportFilter('all')" class="shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${isActiveAll}">All</button>`;

    uniqueSports.forEach(sport => {
        const isActive = currentMatrixSportFilter === sport ? 'bg-neon/10 text-neon border-neon/50 shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white';
        let displaySport = sport.replace(/_/g, ' ').toUpperCase();
        if (displaySport.includes('SOCCER')) displaySport = 'SOCCER';
        html += `<button onclick="setMatrixSportFilter('${sport}')" class="shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${isActive}">${displaySport}</button>`;
    });
    html += `</div>`;

    // 5. INJECT ALIGNED MATRIX HEADER
    html += `
        <div class="grid grid-cols-6 gap-4 border-b border-white/10 pb-3 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest items-center">
            <div class="text-left col-span-1">Target Asset</div>
            <div class="flex flex-col items-center border-b border-white/30 pb-1 w-full">
                ${getSportsbookLogo('pinnacle', 'h-4 sm:h-5 object-contain opacity-80 filter grayscale hover:grayscale-0 transition-all')}
                <span class="text-[7px] text-slate-400 mt-1">BASELINE</span>
            </div>
            <div class="flex justify-center w-full">
                ${getSportsbookLogo('betmgm', 'h-4 sm:h-5 object-contain opacity-80 filter grayscale hover:grayscale-0 transition-all')}
            </div>
            <div class="flex justify-center w-full">
                ${getSportsbookLogo('bovada', 'h-4 sm:h-5 object-contain opacity-80 filter grayscale hover:grayscale-0 transition-all')}
            </div>
            <div class="flex justify-center w-full">
                ${getSportsbookLogo('betrivers', 'h-4 sm:h-5 object-contain opacity-80 filter grayscale hover:grayscale-0 transition-all')}
            </div>
            <div class="flex justify-center w-full">
                ${getSportsbookLogo('fanatics', 'h-4 sm:h-5 object-contain opacity-80 filter grayscale hover:grayscale-0 transition-all')}
            </div>
        </div>
    `;

    // 6. INJECT DYNAMIC DATA ROWS
    Object.keys(groupedByMatch).forEach(matchName => {
        const matchData = groupedByMatch[matchName];
        const displayLeague = String(matchData.league).toUpperCase();

        // FIX: Justify-between to push the league tag to the far right
        html += `
            <div class="col-span-full flex items-center justify-between bg-studio/50 border-y border-white/10 px-4 py-2 mt-4 mb-2 rounded-lg">
                <div class="flex items-center gap-3 min-w-0 pr-4">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)] shrink-0"></span>
                    <h3 class="text-white font-bold text-[11px] uppercase tracking-widest truncate">${matchName}</h3>
                </div>
                <span class="text-slate-500 font-mono text-[9px] uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/10 shrink-0">${displayLeague}</span>
            </div>
        `;

        Object.values(matchData.targets).forEach(item => {
            const getOddsDisplay = (bookKey) => {
                const rawOdds = item.odds[bookKey];
                if (!rawOdds) return `<div class="text-center text-slate-600 font-bold">-</div>`;
                
                const decimal = matrixConvertToDecimal(rawOdds);
                const implied = (decimal > 0) ? (1 / decimal * 100).toFixed(1) + '%' : '0%';
                const am = (!String(rawOdds).startsWith('-') && !String(rawOdds).startsWith('+') && rawOdds !== "undefined") ? '+' + rawOdds : rawOdds;
                
                const isEdge = item.edges[bookKey] > 0;
                
                if (isEdge) {
                    let affLink = "https://terminalsoftware.online/store";
                    if(bookKey.includes('betmgm')) affLink = "https://sports.betmgm.com/";
                    if(bookKey.includes('bovada')) affLink = "https://www.bovada.lv/";
                    if(bookKey.includes('betrivers')) affLink = "https://betrivers.com/";
                    if(bookKey.includes('fanatics')) affLink = "https://sportsbook.fanatics.com/";

                    return `
                        <a href="${affLink}" target="_blank" class="block text-center bg-neon/10 border border-neon/40 text-neon font-black py-2 rounded hover:bg-neon hover:text-background transition-all cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.15)] relative odds-cell group" data-american="${am}" data-implied="${implied}">
                            ${currentFormat === 'american' ? am : implied}
                            <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-neon text-[9px] px-2 py-1 rounded border border-neon/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">Execute Edge ↗</span>
                        </a>
                    `;
                } else {
                    return `<div class="text-center text-slate-500 odds-cell" data-american="${am}" data-implied="${implied}">${currentFormat === 'american' ? am : implied}</div>`;
                }
            };

            const baselineAm = (!String(item.baseline).startsWith('-') && !String(item.baseline).startsWith('+') && item.baseline !== "N/A") ? '+' + item.baseline : item.baseline;
            const baselineImplied = (item.baseline !== "N/A") ? (1 / matrixConvertToDecimal(item.baseline) * 100).toFixed(1) + '%' : 'N/A';

            html += `
                <div class="grid grid-cols-6 gap-4 items-center border-b border-white/5 pb-3 mb-3 font-mono text-sm hover:bg-white/5 transition-colors p-2 rounded-lg -mx-2 group">
                    <div class="text-left col-span-1 min-w-0 pr-2 flex flex-col justify-center">
                        <span class="block text-white font-bold text-[10px] uppercase truncate w-full" title="${item.target}">${item.target}</span>
                        <span class="block text-slate-500 text-[8px] uppercase tracking-widest mt-0.5 truncate w-full" title="${item.market}">${item.market}</span>
                    </div>
                    
                    <div class="text-center text-slate-400 font-bold odds-cell" data-american="${baselineAm}" data-implied="${baselineImplied}">${currentFormat === 'american' ? baselineAm : baselineImplied}</div>
                    
                    ${getOddsDisplay('betmgm')}
                    ${getOddsDisplay('bovada')}
                    ${getOddsDisplay('betrivers')}
                    ${getOddsDisplay('fanatics')}
                </div>
            `;
        });
    });

    if(Object.keys(groupedByMatch).length === 0) {
        html += `
            <div class="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5 mt-4">
                <span class="text-slate-500 font-mono text-[10px] tracking-widest uppercase animate-pulse">> AWAITING MATRIX DISCREPANCIES...</span>
            </div>
        `;
    }

    matrixContainer.innerHTML = html;
}

// --- TAB ROUTING LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const btnMatrix = document.getElementById('ev-tab-matrix');
    const btnPre = document.getElementById('ev-tab-pre');
    const btnLive = document.getElementById('ev-tab-live');
    
    const cardsView = document.getElementById('sports-ev-cards-view');
    const matrixView = document.getElementById('sports-matrix-view');

    if (btnMatrix && cardsView && matrixView) {
        btnMatrix.addEventListener('click', (e) => {
            cardsView.classList.add('hidden');
            matrixView.classList.remove('hidden');
            
            btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
            if(btnPre) btnPre.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
            if(btnLive) btnLive.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent flex items-center gap-2";
            
            fetchMatrixData(); 
            if (!liveMatrixInterval) liveMatrixInterval = setInterval(fetchMatrixData, 30000);
        });

        const revertToCards = () => {
            cardsView.classList.remove('hidden');
            matrixView.classList.add('hidden');
            
            btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
            
            if (liveMatrixInterval) {
                clearInterval(liveMatrixInterval);
                liveMatrixInterval = null;
            }
        };

        if(btnPre) btnPre.addEventListener('click', revertToCards);
        if(btnLive) btnLive.addEventListener('click', revertToCards);
    }
});
