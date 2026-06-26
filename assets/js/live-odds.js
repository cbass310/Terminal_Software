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

// --- DATA PIPELINE ---
async function fetchMatrixData() {
    if (typeof db === 'undefined') {
        console.error("Matrix Error: Supabase DB not initialized.");
        return;
    }
    
    try {
        // Fetch the latest 500 records to ensure we capture all overlapping book lines for a specific prop
        const { data, error } = await db.from('ev_live_data')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) throw error;

        // Prevent redundant DOM repaints if the data hasn't changed
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

    // 1. Pivot the Data: Group data first by Match Name, then by Target + Market
    const groupedByMatch = {};

    data.forEach(edge => {
        // Ignore expired lines
        if (String(edge.status).toLowerCase() === 'expired') return;
        
        const matchName = edge.match_name || "UNKNOWN MATCH";
        if (!groupedByMatch[matchName]) {
            groupedByMatch[matchName] = {
                sport: edge.sport,
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
        
        // Normalize sportsbook names for reliable column matching
        const bookName = String(edge.sportsbook || edge.book || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        groupedByMatch[matchName].targets[key].odds[bookName] = edge.odds;
        groupedByMatch[matchName].targets[key].edges[bookName] = parseFloat(edge.ev || 0);

        // Map pinnacle lines directly to the baseline column if they exist
        if (bookName === 'pinnacle' && edge.odds) {
            groupedByMatch[matchName].targets[key].baseline = edge.odds;
        }
    });

    // 2. Build HTML Structure with Match Headers
    let html = '';
    const currentFormat = window.currentOddsFormat || 'american';

    Object.keys(groupedByMatch).forEach(matchName => {
        const matchData = groupedByMatch[matchName];

        // Inject Full-Width Match Header Row
        html += `
            <div class="col-span-full flex items-center gap-3 bg-studio/50 border-y border-white/10 px-4 py-2 mt-4 mb-2 rounded-lg">
                <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span>
                <h3 class="text-white font-bold text-[11px] uppercase tracking-widest">${matchName}</h3>
            </div>
        `;

        // Loop through all props/targets under this match
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
                    if(bookKey.includes('prizepicks')) affLink = "https://app.prizepicks.com/sign-up?invite_code=PR-X3HWR8P";
                    if(bookKey.includes('underdog')) affLink = "https://play.underdogfantasy.com/cbass310-bbbdfc02f9d75f4b";
                    if(bookKey.includes('draftkings')) affLink = "https://www.draftkings.com/r/Cbass310/US-DK/US-CA";

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

            // The first column ONLY contains the Target & Market, leaving plenty of room for all the odds
            html += `
                <div class="grid grid-cols-6 gap-4 items-center border-b border-white/5 pb-3 mb-3 font-mono text-sm hover:bg-white/5 transition-colors p-2 rounded-lg -mx-2 group">
                    <div class="text-left col-span-1 min-w-0 pr-2 flex flex-col justify-center">
                        <span class="block text-white font-bold text-[10px] uppercase truncate w-full" title="${item.target}">${item.target}</span>
                        <span class="block text-slate-500 text-[8px] uppercase tracking-widest mt-0.5 truncate w-full" title="${item.market}">${item.market}</span>
                    </div>
                    
                    <div class="text-center text-slate-400 font-bold odds-cell" data-american="${baselineAm}" data-implied="${baselineImplied}">${currentFormat === 'american' ? baselineAm : baselineImplied}</div>
                    
                    ${getOddsDisplay('draftkings')}
                    ${getOddsDisplay('fanduel')}
                    ${getOddsDisplay('prizepicks')}
                    ${getOddsDisplay('underdog')}
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
// Intercept tab clicks to swap between normal cards and the full matrix view
document.addEventListener('DOMContentLoaded', () => {
    const btnMatrix = document.getElementById('ev-tab-matrix');
    const btnPre = document.getElementById('ev-tab-pre');
    const btnLive = document.getElementById('ev-tab-live');
    
    const cardsView = document.getElementById('sports-ev-cards-view');
    const matrixView = document.getElementById('sports-matrix-view');

    if (btnMatrix && cardsView && matrixView) {
        btnMatrix.addEventListener('click', (e) => {
            // Hide normal cards, show matrix
            cardsView.classList.add('hidden');
            matrixView.classList.remove('hidden');
            
            // Toggle active styling
            btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
            if(btnPre) btnPre.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
            if(btnLive) btnLive.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent flex items-center gap-2";
            
            // Kickstart Matrix polling
            fetchMatrixData(); 
            if (!liveMatrixInterval) liveMatrixInterval = setInterval(fetchMatrixData, 30000);
        });

        const revertToCards = () => {
            // Hide matrix, show normal cards
            cardsView.classList.remove('hidden');
            matrixView.classList.add('hidden');
            
            btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
            
            // Shut off matrix polling to save memory while user is on standard view
            if (liveMatrixInterval) {
                clearInterval(liveMatrixInterval);
                liveMatrixInterval = null;
            }
        };

        if(btnPre) btnPre.addEventListener('click', revertToCards);
        if(btnLive) btnLive.addEventListener('click', revertToCards);
    }
});
