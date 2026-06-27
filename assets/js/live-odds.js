// assets/js/live-odds.js
// Terminal Software - Dynamic 15-Book Live Odds Matrix Engine

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

// --- UPDATED LOGO PATH FUNCTION ---
function getSportsbookLogo(bookName, classes = "w-14 sm:w-16 h-4 sm:h-5 object-contain") {
    if (!bookName) return `<span>🏦 UNKNOWN</span>`;
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
    if (fileName) return `<img src="assets/images/books/${fileName}.svg" class="${classes}" alt="${bookName}" onerror="this.onerror=null; this.src='assets/images/books/${fileName}.png'; this.className='${classes} opacity-50';"/>`;
    return `<span class="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">🏦 ${bookName}</span>`;
}

// --- DATA PIPELINE ---
async function fetchMatrixData() {
    if (typeof db === 'undefined') {
        console.error("Matrix Error: Supabase DB not initialized.");
        return;
    }
    
    try {
        // Target the NEW raw odds matrix and pull a deep batch to capture all sports
        const { data, error } = await db.from('raw_odds_matrix')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10000); 

        if (error) throw error;
        
        renderLiveOddsMatrix(data);
    } catch (e) {
        console.error("Matrix Fetch Failed:", e);
    }
}

// --- RENDER ENGINE ---
function renderLiveOddsMatrix(data) {
    const matrixContainer = document.getElementById('matrix-rows-container');
    const headerContainer = document.getElementById('matrix-header-container'); // Ensure you add an ID to your header div in HTML
    if (!matrixContainer) return;

    // 1. Pivot the Data & Find Active Books
    const grouped = {};
    const activeBooks = new Set();

    data.forEach(edge => {
        // Skip dead rows
        if (String(edge.status).toLowerCase() === 'expired') return;
        
        const key = `${edge.match_name}_${edge.target}_${edge.market}`;
        
        if (!grouped[key]) {
            grouped[key] = {
                match_name: edge.match_name,
                target: edge.target,
                market: edge.market,
                sport: edge.sport,
                league: edge.league || edge.sport, // Capture the league
                baseline: edge.market_avg || "N/A",
                odds: {},
                edges: {}
            };
        }
        
        const bookNameRaw = String(edge.sportsbook || edge.book || '');
        const bookName = bookNameRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (bookName && bookName !== 'pinnacle') {
            activeBooks.add(bookNameRaw); // Add to dynamic column list
        }

        grouped[key].odds[bookName] = edge.odds;
        grouped[key].edges[bookName] = parseFloat(edge.ev || 0);
        
        if (bookName === 'pinnacle' && edge.odds) {
            grouped[key].baseline = edge.odds;
        }
    });

    // Sort books alphabetically so columns remain stable
    const dynamicColumns = Array.from(activeBooks).sort();

    // 2. Generate Dynamic Header
    // We use a CSS grid layout that dynamically scales based on how many books exist
    const gridCols = `grid-template-columns: 2fr 1fr repeat(${dynamicColumns.length + 1}, 1fr);`;
    
    let headerHtml = `
        <div class="grid w-full text-[10px] sm:text-xs font-heading font-black text-slate-500 tracking-widest border-b border-white/10 pb-3 mb-4 items-center" style="${gridCols}">
            <div class="pl-2">MATCHUP / MARKET</div>
            <div class="text-center">TARGET ASSET</div>
            <div class="flex justify-center">${getSportsbookLogo('pinnacle')}</div>
    `;
    
    dynamicColumns.forEach(book => {
        headerHtml += `<div class="flex justify-center">${getSportsbookLogo(book)}</div>`;
    });
    headerHtml += `</div>`;
    
    if (headerContainer) {
        headerContainer.innerHTML = headerHtml;
    }

    // 3. Build the HTML Rows
    let html = '';
    const currentFormat = window.currentOddsFormat || 'american';
    let currentMatchName = '';

    Object.values(grouped).forEach(item => {
        
        // Render a Match Header if we are jumping to a new game
        if (item.match_name !== currentMatchName) {
            html += `
                <div class="w-full bg-neon/10 border border-neon/20 mt-4 mb-2 py-2 px-4 rounded-lg flex justify-between items-center shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                    <span class="font-heading font-black text-white text-xs sm:text-sm tracking-widest uppercase">${item.match_name}</span>
                    <span class="font-mono text-[9px] sm:text-[10px] text-neon uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-neon/30">${item.league}</span>
                </div>
            `;
            currentMatchName = item.match_name;
        }

        const baselineAm = (!String(item.baseline).startsWith('-') && !String(item.baseline).startsWith('+') && item.baseline !== "N/A") ? '+' + item.baseline : item.baseline;
        const baselineImplied = (item.baseline !== "N/A") ? (1 / matrixConvertToDecimal(item.baseline) * 100).toFixed(1) + '%' : 'N/A';

        // Start Row
        html += `<div class="grid w-full items-center py-3 border-b border-white/5 hover:bg-white/5 transition-colors group" style="${gridCols}">`;
        
        // Column 1 & 2: Market and Target
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

        // Columns 3+: The Dynamic Books
        dynamicColumns.forEach(bookRaw => {
            const bookKey = bookRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
            const rawOdds = item.odds[bookKey];
            
            if (!rawOdds) {
                html += `<div class="text-center font-mono text-xs text-slate-600">-</div>`;
                return;
            }

            const decimal = matrixConvertToDecimal(rawOdds);
            const implied = (decimal > 0) ? (1 / decimal * 100).toFixed(1) + '%' : '0%';
            const am = (!String(rawOdds).startsWith('-') && !String(rawOdds).startsWith('+') && rawOdds !== "undefined") ? '+' + rawOdds : rawOdds;
            
            const isEdge = item.edges[bookKey] > 0;
            const displayStr = currentFormat === 'american' ? am : implied;

            if (isEdge) {
                html += `
                <div class="flex justify-center px-1">
                    <a href="#" class="w-full text-center font-mono text-sm font-bold text-black bg-neon py-1 rounded shadow-[0_0_8px_rgba(57,255,20,0.6)] hover:bg-white transition-all cursor-pointer">
                        ${displayStr}
                    </a>
                </div>`;
            } else {
                html += `<div class="text-center font-mono text-sm text-slate-400 font-bold">${displayStr}</div>`;
            }
        });

        html += `</div>`; // Close Row
    });

    matrixContainer.innerHTML = html;
}

// --- TAB ROUTING & INIT ---
window.addEventListener('DOMContentLoaded', () => {
    const btnPre = document.getElementById('ev-tab-pre');
    const btnLive = document.getElementById('ev-tab-live');
    const btnMatrix = document.getElementById('ev-tab-matrix');
    
    const evCardsView = document.getElementById('sports-ev-cards-view');
    const matrixView = document.getElementById('sports-matrix-view');
    
    function activateMatrix() {
        if(evCardsView) evCardsView.classList.add('hidden');
        if(matrixView) matrixView.classList.remove('hidden');
        
        btnMatrix.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
        if(btnPre) btnPre.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        if(btnLive) btnLive.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        
        fetchMatrixData();
        if (liveMatrixInterval) clearInterval(liveMatrixInterval);
        liveMatrixInterval = setInterval(fetchMatrixData, 15000);
    }
    
    function revertToCards() {
        if(matrixView) matrixView.classList.add('hidden');
        if(evCardsView) evCardsView.classList.remove('hidden');
        
        btnMatrix.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
        if (liveMatrixInterval) clearInterval(liveMatrixInterval);
    }
    
    if (btnMatrix) {
        btnMatrix.addEventListener('click', activateMatrix);
        
        // Also map formatting toggle
        const btnFormat = document.getElementById('matrix-format-toggle');
        if (btnFormat) {
            btnFormat.addEventListener('click', () => {
                window.currentOddsFormat = (window.currentOddsFormat === 'american') ? 'implied' : 'american';
                btnFormat.innerText = (window.currentOddsFormat === 'american') ? '[ SWAP TO IMPLIED % ]' : '[ SWAP TO AMERICAN ]';
                fetchMatrixData();
            });
        }
    }
    
    if(btnPre) btnPre.addEventListener('click', revertToCards);
    if(btnLive) btnLive.addEventListener('click', revertToCards);
});
