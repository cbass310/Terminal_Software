// assets/js/live-odds.js
// Terminal Software - Dedicated Live Odds Matrix Engine

let matrixDataHash = "";
let liveMatrixInterval = null;

// --- UTILITY LOGIC ---
function matrixConvertToDecimal(americanStr) {
    const odds = parseFloat(String(americanStr).replace('+', ''));
    if (isNaN(odds)) return 1;
    if (odds > 0) return (odds / 100) + 1;
    if (odds < 0) return (100 / Math.abs(odds)) + 1;
    return 1; 
}

// --- UPDATED LOGO PATH FUNCTION (WITH LEADING SLASH) ---
function getSportsbookLogo(bookName, classes = "w-14 sm:w-16 h-4 sm:h-5 object-contain") {
    if (!bookName) return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 UNKNOWN</span>`;
    const normalized = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bookMap = {
        'draftkings': 'draftkings', 'fanduel': 'fanduel', 'pinnacle': 'pinnacle', 'circa': 'circa', 'circasports': 'circa',
        'betmgm': 'betmgm', 'mgm': 'betmgm', 'fanatics': 'fanatics', 'bovada': 'bovada', 'betrivers': 'betrivers', 'rivers': 'betrivers',
        'prizepicks': 'prizepicks', 'underdog': 'underdog', 'underdogfantasy': 'underdog', 'sleeper': 'sleeper'
    };
    const fileName = bookMap[normalized];
    if (fileName) return `<img src="/assets/images/books/${fileName}.svg" alt="${bookName}" class="${classes} filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" onerror="this.outerHTML='<span class=\\'font-bold text-white tracking-widest text-[10px]\\'>🏦 ${bookName.toUpperCase()}</span>'">`;
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
        const { data, error } = await database.from('ev_live_data')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1000); 

        if (error) throw error;

        const currentDataHash = data ? JSON.stringify(data) : "";
        if (currentDataHash === matrixDataHash) return; 

        matrixDataHash = currentDataHash;
        renderLiveOddsMatrix(data || []);
        
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

    const groupedByMatch = {};

    data.forEach(edge => {
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

    let html = '';
    const currentFormat = window.currentOddsFormat || 'american';

    Object.keys(groupedByMatch).forEach(matchName => {
        const matchData = groupedByMatch[matchName];
        const displayLeague = String(matchData.league).toUpperCase();

        // Inject Full-Width Match Header Row
        html += `
            <div class="col-span-full flex items-center gap-3 bg-studio/50 border-y border-white/10 px-4 py-2 mt-4 mb-2 rounded-lg">
                <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span>
                <h3 class="text-white font-bold text-[11px] uppercase tracking-widest">${matchName}</h3>
                <span class="text-slate-500 font-mono text-[9px] uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/10 ml-2">${displayLeague}</span>
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

            // UPDATED COLUMNS TO MATCH SUPABASE DATA (BetMGM, Bovada, BetRivers, Fanatics)
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
        html = `
            <div class="text-center py-10 border border-dashed border-white/10 rounded-xl bg-white/5">
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
