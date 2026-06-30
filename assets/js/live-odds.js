// assets/js/live-odds.js
// Terminal Software - Dedicated Live Odds Matrix Engine

let matrixDataHash = "";
let liveMatrixInterval = null;
let currentMatrixSportFilter = "all";
let currentMatrixLeagueFilter = "all"; // Tracks the active league dropdown
let globalMatrixData = []; 

// --- UTILITY LOGIC ---
function matrixConvertToDecimal(americanStr) {
    const odds = parseFloat(String(americanStr).replace('+', '').replace(/,/g, '').trim());
    if (isNaN(odds) || odds === 0) return 0;
    if (odds > 0) return (odds / 100) + 1;
    if (odds < 0) return (100 / Math.abs(odds)) + 1;
    return 1;
}

// --- LOGO PATH FUNCTION (UNIVERSAL MAPPER) ---
function getSportsbookLogo(bookName, classes = "w-14 sm:w-16 h-4 sm:h-5 object-contain") {
    if (!bookName) return `<span class="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">🏦 UNKNOWN</span>`;
    
    const normalized = String(bookName).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // HARDCODE OVERRIDE FOR BETONLINE
    if (normalized.includes('betonline')) {
        return `<img src="assets/images/books/betonlineag.svg?v=2" class="${classes}" alt="BetOnline" onerror="this.onerror=null; this.src='assets/images/books/betonlineag.png';"/>`;
    }

    const bookMap = {
        'draftkings': 'draftkings', 
        'fanduel': 'fanduel', 
        'pinnacle': 'pinnacle',
        'circa': 'circa', 
        'circasports': 'circa', 
        'betmgm': 'betmgm', 
        'mgm': 'betmgm',
        'fanatics': 'fanatics', 
        'bovada': 'bovada', 
        'betrivers': 'betrivers', 
        'rivers': 'betrivers',
        'prizepicks': 'prizepicks', 
        'underdog': 'underdog', 
        'underdogfantasy': 'underdog', 
        'sleeper': 'sleeper', 
        'caesars': 'caesars', 
        'pointsbetus': 'pointsbet', 
        'pointsbet': 'pointsbet',
        'wynnbet': 'wynnbet', 
        'betanysports': 'betanysports'
    };
    
    const fileName = bookMap[normalized];
    
    if (fileName) {
        return `<img src="assets/images/books/${fileName}.svg?v=2" class="${classes}" alt="${bookName}" onerror="this.onerror=null; this.src='assets/images/books/${fileName}.png';"/>`;
    }
    return `<span class="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">🏦 ${bookName.toUpperCase()}</span>`;
}

// --- DATA PIPELINE (SERVER-SIDE FILTERING) ---
async function fetchMatrixData() {
    // Failsafe for uninitialized DB
    const database = typeof db !== 'undefined' ? db : window.db;
    if (!database) {
        console.error("Matrix Error: Supabase DB not initialized.");
        return;
    }
    
    try {
        const { data, error } = await database.from('raw_odds_matrix')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(10000); 

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

    if (globalMatrixData.length === 0) {
        matrixContainer.innerHTML = `<div class="text-center py-10"><span class="text-neon font-mono text-[10px] tracking-widest uppercase animate-pulse">Awaiting Matrix Telemetry...</span></div>`;
        return;
    }

    // 1. Filter Data by Sport
    const sportFilteredData = globalMatrixData.filter(edge => {
        if (String(edge.status).toLowerCase() === 'prevent_empty_delete') return false;
        if (currentMatrixSportFilter === "all") return true;
        const sport = String(edge.sport || '').toLowerCase();
        return sport.includes(currentMatrixSportFilter);
    });

    // Extract available leagues based on the selected sport for the dropdown
    const availableLeagues = new Set();
    sportFilteredData.forEach(edge => {
        const l = String(edge.league || edge.sport || 'UNKNOWN').toUpperCase();
        if (l && l !== 'UNKNOWN') availableLeagues.add(l);
    });

    // 1.5 Filter Data by League
    const finalFilteredData = sportFilteredData.filter(edge => {
        if (currentMatrixLeagueFilter === "all") return true;
        const l = String(edge.league || edge.sport || 'UNKNOWN').toUpperCase();
        return l === currentMatrixLeagueFilter;
    });

    // 2. Pivot the Data & Find Active Books
    const grouped = {};
    const activeBooks = new Set();

    finalFilteredData.forEach(edge => {
        const key = `${edge.match_name}_${edge.target}_${edge.market}`;
        
        if (!grouped[key]) {
            grouped[key] = {
                match_name: edge.match_name,
                target: edge.target,
                market: edge.market,
                sport: edge.sport,
                league: edge.league || edge.sport,
                time_display: edge.time_display || "LIVE", 
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
    
    // 3. Build Header: Hardcoded Sports Pills & Dynamic League Dropdown
    let leagueOptions = `<option value="all">ALL LEAGUES</option>`;
    Array.from(availableLeagues).sort().forEach(l => {
        leagueOptions += `<option value="${l}" ${currentMatrixLeagueFilter === l ? 'selected' : ''}>${l}</option>`;
    });

    // RESTORED: Hardcoded Sports Array
    const staticSports = ['all', 'baseball', 'basketball', 'football', 'hockey', 'soccer', 'tennis', 'mma', 'golf'];

    let sportsHtml = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-4 gap-4">
        <div class="flex overflow-x-auto hide-scrollbar gap-2 pb-2 w-full sm:w-auto">
    `;
    
    staticSports.forEach(sport => {
        let cleanSport = sport === 'all' ? 'ALL SPORTS' : sport.toUpperCase();
        const isActive = currentMatrixSportFilter === sport;
        const activeClass = isActive ? 'bg-neon/10 text-neon border-neon/50 shadow-[0_0_10px_rgba(57,255,20,0.1)]' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white';
        sportsHtml += `<button onclick="setMatrixFilter('${sport}')" class="shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${activeClass}">${cleanSport}</button>`;
    });

    sportsHtml += `
        </div>
        <div class="shrink-0 relative group z-20">
            <select id="matrix-league-filter" onchange="setMatrixLeagueFilter(this.value)" class="bg-black/60 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] rounded-full px-4 py-1.5 focus:outline-none cursor-pointer hover:border-neon hover:text-neon transition-colors shadow-lg appearance-none w-32 sm:w-48 pr-8">
                ${leagueOptions}
            </select>
            <svg class="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-neon transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
    </div>`;

    // Static Column Headers
    let headerHtml = `
        ${sportsHtml}
        <div class="min-w-[900px] lg:min-w-full">
            <div class="grid w-full text-[10px] sm:text-xs font-heading font-black text-slate-500 tracking-widest border-b border-white/10 pb-3 mb-2 items-center" style="${gridCols}">
                <div class="pl-2">MATCHUP / MARKET</div>
                <div class="text-center">TARGET ASSET</div>
                <div class="flex justify-center">${getSportsbookLogo('pinnacle')}</div>
    `;
    
    dynamicColumns.forEach(bookRaw => {
        headerHtml += `<div class="flex justify-center">${getSportsbookLogo(bookRaw)}</div>`;
    });
    headerHtml += `</div></div>`;
    
    if (headerContainer) headerContainer.innerHTML = headerHtml;

    // 4. Build the HTML Rows (WITH INTERNAL SCROLLBAR ENFORCEMENT)
    let html = `<div class="max-h-[550px] overflow-y-auto custom-scrollbar pr-2 min-w-[900px] lg:min-w-full [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-all pb-4">`;
    const currentFormat = window.currentOddsFormat || 'american';
    let currentMatchName = '';

    Object.values(grouped).forEach(item => {
        // Group Header (Sticky to Top of Scroll) RESTORED GLASSMORPHISM (bg-black/60 backdrop-blur-md)
        if (item.match_name !== currentMatchName) {
            html += `
                <div class="w-full bg-black/60 backdrop-blur-md border border-white/10 mt-4 mb-2 py-2 px-4 rounded-lg flex justify-between items-center shadow-lg sticky top-0 z-10">
                    <span class="font-heading font-black text-white text-xs sm:text-sm tracking-widest uppercase">${item.match_name}</span>
                    <span class="font-mono text-[9px] sm:text-[10px] text-neon uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-neon/30">${item.league} | ${item.time_display}</span>
                </div>
            `;
            currentMatchName = item.match_name;
        }

        // Parse Dynamic Column Odds
        const getOddsDisplay = (bookKey) => {
            const rawOdds = item.odds[bookKey];
            if (!rawOdds || rawOdds === "N/A") return `<div class="text-center font-mono text-xs text-slate-600">-</div>`;
            
            const decimal = matrixConvertToDecimal(rawOdds);
            const implied = (decimal > 0) ? (1 / decimal * 100).toFixed(1) + '%' : '0.0%';
            const am = (!String(rawOdds).startsWith('-') && !String(rawOdds).startsWith('+') && rawOdds !== "undefined") ? '+' + rawOdds : rawOdds;
            
            const isEdge = item.edges[bookKey] > 0;
            const displayStr = currentFormat === 'american' ? am : implied;

            if (isEdge) {
                // Route execution links
                let affLink = "https://terminalsoftware.online/store";
                if(bookKey.includes('prizepicks')) affLink = "https://app.prizepicks.com/sign-up?invite_code=PR-X3HWR8P";
                if(bookKey.includes('underdog')) affLink = "https://play.underdogfantasy.com/cbass310-bbbdfc02f9d75f4b";
                if(bookKey.includes('draftkings')) affLink = "https://www.draftkings.com/r/Cbass310/US-DK/US-CA";
                
                return `
                <div class="flex justify-center px-1">
                    <a href="${affLink}" target="_blank" class="w-full text-center font-mono text-sm font-bold text-black bg-neon py-1 rounded shadow-[0_0_8px_rgba(57,255,20,0.6)] hover:scale-105 transition-transform cursor-pointer no-underline block">
                        <span>${displayStr}</span>
                    </a>
                </div>`;
            } else {
                return `
                <div class="text-center font-mono text-sm text-slate-400 font-bold">
                    <span>${displayStr}</span>
                </div>`;
            }
        };

        let baselineAm = item.baseline;
        let baselineImplied = 'N/A';
        if (item.baseline !== "N/A" && item.baseline !== null) {
            const dec = matrixConvertToDecimal(item.baseline);
            baselineImplied = (dec > 0) ? (1 / dec * 100).toFixed(1) + '%' : 'N/A';
            baselineAm = (!String(item.baseline).startsWith('-') && !String(item.baseline).startsWith('+')) ? '+' + item.baseline : item.baseline;
        }

        // Inject row
        html += `
            <div class="grid w-full items-center py-3 border-b border-white/5 hover:bg-white/5 transition-colors group" style="${gridCols}">
                <div class="flex flex-col pl-2">
                    <span class="font-bold text-white text-xs sm:text-sm whitespace-normal break-words pr-2 leading-tight">${item.market.toUpperCase()}</span>
                </div>
                <div class="text-center font-mono text-[9px] sm:text-[10px] text-slate-300 font-bold bg-black/30 py-1.5 rounded border border-white/5 whitespace-normal px-2 mx-1 leading-tight break-words">
                    ${item.target}
                </div>
                <div class="text-center font-mono text-sm text-white font-bold bg-white/5 py-1.5 rounded mx-1">
                    <span>${currentFormat === 'american' ? baselineAm : baselineImplied}</span>
                </div>
        `;
        
        dynamicColumns.forEach(bookRaw => {
            const bookKey = bookRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
            html += getOddsDisplay(bookKey);
        });
        
        html += `</div>`;
    });

    html += `</div>`; // Close scroll container

    if(Object.keys(grouped).length === 0) {
        html = `<div class="text-center font-mono text-[10px] text-slate-500 tracking-widest uppercase py-10 w-full">NO ODDS FOUND FOR THIS CATEGORY</div>`;
    }

    if (matrixContainer) matrixContainer.innerHTML = html;
}

// Global Filter Hooks
window.setMatrixLeagueFilter = function(league) {
    currentMatrixLeagueFilter = league;
    renderLiveOddsMatrix(); // Re-render instantly without hitting DB
};

window.setMatrixFilter = function(sport) {
    currentMatrixSportFilter = sport;
    currentMatrixLeagueFilter = 'all'; // Reset league filter when sport changes
    renderLiveOddsMatrix(); // Re-render instantly without hitting DB
};

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
    
    // Instantly re-calculate the entire table
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
        
        if(btnMatrix) btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
        if(btnPre) btnPre.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        if(btnLive) btnLive.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        
        fetchMatrixData();
        if (liveMatrixInterval) clearInterval(liveMatrixInterval);
        liveMatrixInterval = setInterval(fetchMatrixData, 15000);
    }
    
    function revertToCards() {
        if(matrixView) matrixView.classList.add('hidden');
        if(evCardsView) evCardsView.classList.remove('hidden');
        
        if(btnMatrix) btnMatrix.className = "px-6 py-2.5 rounded-xl font-heading text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        if (liveMatrixInterval) clearInterval(liveMatrixInterval);
    }
    
    if (btnMatrix) btnMatrix.addEventListener('click', activateMatrix);
    if(btnPre) btnPre.addEventListener('click', revertToCards);
    if(btnLive) btnLive.addEventListener('click', revertToCards);
});
