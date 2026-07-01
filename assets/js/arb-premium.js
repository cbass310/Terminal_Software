// assets/js/arb-premium.js
// Handles the Sleek Arbitrage Grid + Premium Calculator Modal

window.arbCache = {};

function createArbCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        window.arbCache[edgeId] = edge;

        const isMiddle = String(edge.market || '').toUpperCase().includes('MIDDLE');
        const arbVal = parseFloat(edge.arb_pct || edge.arb_percentage || edge.arb_percent || edge.arb || edge.edge || edge.value || edge.profit || edge.roi || edge.margin || edge.percentage || 0); 
        
        const arbFormatted = isMiddle ? `${arbVal.toFixed(1)} PTS` : `${arbVal.toFixed(2)}% ARB`;
        const badgeThemeClass = isMiddle ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-neon/10 border-neon/50 text-neon';
        const dotThemeClass = isMiddle ? 'bg-purple-400' : 'bg-neon';

        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        const leagueName = getLeague(edge); 
        
        const book1Name = edge.book1 || edge.book_1 || edge.bookmaker_1 || edge.sportsbook_1 || edge.sportsbook1 || edge.leg1_book || "Book 1";
        const book2Name = edge.book2 || edge.book_2 || edge.bookmaker_2 || edge.sportsbook_2 || edge.sportsbook2 || edge.leg2_book || "Book 2";
        const book1Logo = getSportsbookLogo(book1Name, "w-10 sm:w-12 h-3 object-contain");
        const book2Logo = getSportsbookLogo(book2Name, "w-10 sm:w-12 h-3 object-contain");
        
        let odds1Str = String(edge.odds1 || edge.odds_1 || "N/A");
        let odds2Str = String(edge.odds2 || edge.odds_2 || "N/A");
        const odds1 = (!odds1Str.startsWith('-') && !odds1Str.startsWith('+') && odds1Str !== "N/A") ? '+' + odds1Str : odds1Str;
        const odds2 = (!odds2Str.startsWith('-') && !odds2Str.startsWith('+') && odds2Str !== "N/A") ? '+' + odds2Str : odds2Str;

        const rawMatchName = String(edge.match_name || edge.game || edge.event || edge.event_name || edge.matchup || edge.teams || "UNKNOWN MATCH");
        const safeMatchName = rawMatchName.replace(/'/g, "\\'"); 
        const abbrMatchName = getAbbreviatedMatchup(rawMatchName);

        const detectedSport = detectSport(edge);
        const iconHtml = generateTeamLogosHtml(detectedSport, false);

        const target1Html = edge.target1 || edge.leg1_target ? escapeHtml(edge.target1 || edge.leg1_target) : 'Leg 1';
        const target2Html = edge.target2 || edge.leg2_target ? escapeHtml(edge.target2 || edge.leg2_target) : 'Leg 2';

        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : 'animate-flash-update';
        const oddsStrike = isExpired ? 'line-through text-slate-600' : 'text-white odds-text';
        
        let badgeHtml = isExpired 
            ? `<div class="status-badge-container flex items-center"><span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span></div>`
            : `<div class="status-badge-container flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full ${dotThemeClass} animate-pulse shrink-0 shadow-[0_0_5px_rgba(57,255,20,0.8)]"></span>
                    <span class="${badgeThemeClass.includes('purple') ? 'text-purple-400' : 'text-neon'} font-mono font-bold text-[9px] sm:text-[10px] tracking-widest whitespace-nowrap shrink-0">${arbFormatted}</span>
               </div>`;

        const is3Way = (edge.book3 || edge.odds3) ? true : false;
        const leg3Marker = is3Way ? `<div class="mt-2 text-center border-t border-white/5 pt-2"><span class="text-[8px] font-mono text-cyanAccent uppercase tracking-widest font-bold px-2 py-0.5 bg-cyanAccent/10 border border-cyanAccent/30 rounded">3-Way Market Detected</span></div>` : '';

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-between h-full ${opacityClass}">
                
                <div class="flex justify-between items-start mb-3 relative z-10 w-full gap-2">
                    <div class="flex items-start gap-2 flex-1 min-w-0 pr-1">
                        
                        <div class="flex flex-col items-center w-10 sm:w-12 shrink-0 gap-1">
                            ${iconHtml}
                            <div class="bg-black/50 border border-neon/30 px-1 py-0.5 rounded text-[5px] sm:text-[6px] font-mono text-neon uppercase tracking-widest shadow-[0_0_5px_rgba(57,255,20,0.1)] w-full text-center truncate">
                                ${escapeHtml(leagueName)}
                            </div>
                            <p class="text-[5px] sm:text-[6px] text-slate-500 font-bold tracking-widest uppercase text-center w-full truncate">${abbrMatchName}</p>
                        </div>
                        
                        <div class="flex-1 min-w-0 flex flex-col pt-0.5 pl-1.5">
                            <h2 class="font-impact text-[10px] sm:text-xs font-black uppercase tracking-wide text-white leading-tight line-clamp-2 mb-1 odds-text">${rawMatchName}</h2>
                        </div>
                    </div>

                    <div class="flex flex-col items-end shrink-0 gap-0.5">
                        <span class="text-[6px] sm:text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">${timestamp}</span>
                        <div class="bg-studio/80 border border-white/10 rounded-lg p-1 text-center shadow-lg w-12 sm:w-14 h-5">
                            <span class="text-[6px] font-bold text-slate-400 block pb-0.5">CROSS-BOOK</span>
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-3 relative z-10 flex-grow flex flex-col justify-end">
                    
                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-2 sm:p-2.5 mb-2 gap-2 overflow-hidden w-full">
                        <span class="text-[6.5px] sm:text-[7.5px] font-mono text-slate-500 uppercase tracking-widest truncate min-w-0 flex-1 leading-tight">${safeMarket}</span>
                        <div class="status-badge-container flex items-center gap-1 sm:gap-1.5 shrink-0">
                            ${statusBadge}
                            <span class="${colorClass} font-mono font-bold text-[9px] sm:text-[10px] tracking-widest whitespace-nowrap shrink-0">${arbString}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 relative z-10 mb-3">
                        <div class="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between w-full overflow-hidden">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5 truncate" title="${target1Html}">${target1Html}</span>
                            <div class="flex justify-between items-end mt-auto gap-1 w-full">
                                <div class="flex items-center justify-start overflow-hidden shrink-0 h-3 sm:h-4">${book1Logo}</div>
                                <span class="font-heading font-black text-xs sm:text-sm tracking-widest shrink-0 text-right ${oddsStrike}">${odds1}</span>
                            </div>
                        </div>
                        <div class="bg-black/30 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between w-full overflow-hidden">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1.5 truncate" title="${target2Html}">${target2Html}</span>
                            <div class="flex justify-between items-end mt-auto gap-1 w-full">
                                <div class="flex items-center justify-start overflow-hidden shrink-0 h-3 sm:h-4">${book2Logo}</div>
                                <span class="font-heading font-black text-xs sm:text-sm tracking-widest shrink-0 text-right ${oddsStrike}">${odds2}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${leg3Marker}

                    <div class="mt-auto pt-2">
                        <button onclick="openArbModal('${edgeId}')" class="w-full bg-white/5 hover:bg-neon/20 border border-white/10 hover:border-neon/50 text-slate-300 hover:text-neon shadow-[0_0_10px_rgba(57,255,20,0.05)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all duration-300 py-2 rounded-lg font-heading text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group">
                            <span class="text-[12px] group-hover:scale-110 transition-transform">🧮</span>
                            Open Calculator
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}


// --- CALCULATOR ENGINE ---

function convertToDecimalSafe(americanStr) {
    const odds = parseFloat(String(americanStr).replace('+', ''));
    if (isNaN(odds)) return 1;
    if (odds > 0) return (odds / 100) + 1;
    if (odds < 0) return (100 / Math.abs(odds)) + 1;
    return 1; 
}

function openArbModal(edgeId) {
    const edge = window.arbCache[edgeId];
    if (!edge) return;

    const modal = document.getElementById('arb-premium-modal');
    const content = document.getElementById('arb-premium-content');
    if (!modal || !content) return;

    const rawMatchName = String(edge.match_name || edge.game || edge.event || "UNKNOWN MATCH");
    const market = escapeHtml(edge.market || edge.bet_type || "UNKNOWN MARKET");
    const arbVal = parseFloat(edge.arb_pct || edge.arb_percentage || edge.arb || edge.edge || 0);
    const arbFormatted = `+${arbVal.toFixed(2)}% Guaranteed Profit`;

    const savedBankroll = parseFloat(localStorage.getItem('ts_default_bankroll')) || 1000;

    // Detect if 2-way or 3-way
    const is3Way = (edge.book3 || edge.odds3) ? true : false;
    
    // Leg 1 Data
    const b1Name = escapeHtml(edge.book1 || "Book 1");
    const o1Str = String(edge.odds1 || "-110");
    const t1 = escapeHtml(edge.target1 || "Leg 1");
    
    // Leg 2 Data
    const b2Name = escapeHtml(edge.book2 || "Book 2");
    const o2Str = String(edge.odds2 || "-110");
    const t2 = escapeHtml(edge.target2 || "Leg 2");

    // Leg 3 Data (Optional)
    let leg3Html = '';
    if (is3Way) {
        const b3Name = escapeHtml(edge.book3 || "Book 3");
        const o3Str = String(edge.odds3 || "-110");
        const t3 = escapeHtml(edge.target3 || "Leg 3");

        leg3Html = `
            <div class="bg-black/40 border border-white/5 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all shrink-0">
                <div class="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest truncate w-2/3">${t3}</span>
                    <span class="text-white font-black text-sm uppercase bg-white/10 px-2 py-0.5 rounded border border-white/10">${(o3Str > 0 && !o3Str.startsWith('+') ? '+'+o3Str : o3Str)}</span>
                </div>
                <div class="flex justify-between items-end mt-3">
                    <div class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">${b3Name}</div>
                    <div class="text-right">
                        <span class="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Place Stake:</span>
                        <span id="arb-stake-3" class="text-xl font-black text-white">$0.00</span>
                    </div>
                </div>
            </div>
        `;
    }

    const premiumHtml = `
        <div class="bg-studio/95 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl relative w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col">
            
            <button onclick="closeArbModal()" class="absolute top-4 right-4 text-slate-500 hover:text-white bg-black/50 p-1.5 rounded-full transition-colors z-[60]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div class="absolute -top-20 -left-10 w-48 h-48 bg-neon/10 blur-[60px] rounded-full pointer-events-none"></div>

            <div class="relative z-10 mb-5 border-b border-white/10 pb-4 shrink-0 pr-8">
                <div class="inline-flex items-center gap-2 bg-neon/10 border border-neon/30 text-neon px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest mb-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
                    ${arbFormatted}
                </div>
                <h3 class="font-impact text-white text-xl sm:text-2xl tracking-wide leading-tight mb-1">${rawMatchName}</h3>
                <p class="text-slate-400 font-mono text-[10px] uppercase tracking-widest">${market}</p>
            </div>

            <div class="mb-5 relative z-10 bg-black/50 border border-brand/30 rounded-xl p-4 shadow-inner shrink-0">
                <label class="block text-[10px] font-bold text-brand uppercase tracking-widest mb-2">Total Bankroll Input ($)</label>
                <div class="relative w-full">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white font-black text-lg">$</span>
                    <input type="number" id="arb-bankroll-input" onkeyup="recalculateArb('${edgeId}', this.value)" onchange="recalculateArb('${edgeId}', this.value)" class="w-full bg-black/80 border border-brand/50 rounded-lg py-3 pl-8 pr-4 text-white text-lg font-black focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon font-mono transition-all" value="${savedBankroll}">
                </div>
            </div>

            <div class="space-y-3 relative z-10 mb-5 flex-grow">
                
                <div class="bg-black/40 border border-white/5 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all shrink-0">
                    <div class="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest truncate w-2/3">${t1}</span>
                        <span class="text-white font-black text-sm uppercase bg-white/10 px-2 py-0.5 rounded border border-white/10">${(o1Str > 0 && !o1Str.startsWith('+') ? '+'+o1Str : o1Str)}</span>
                    </div>
                    <div class="flex justify-between items-end mt-3">
                        <div class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">${b1Name}</div>
                        <div class="text-right">
                            <span class="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Place Stake:</span>
                            <span id="arb-stake-1" class="text-xl font-black text-white">$0.00</span>
                        </div>
                    </div>
                </div>

                <div class="bg-black/40 border border-white/5 rounded-xl p-4 relative overflow-hidden group hover:border-white/20 transition-all shrink-0">
                    <div class="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest truncate w-2/3">${t2}</span>
                        <span class="text-white font-black text-sm uppercase bg-white/10 px-2 py-0.5 rounded border border-white/10">${(o2Str > 0 && !o2Str.startsWith('+') ? '+'+o2Str : o2Str)}</span>
                    </div>
                    <div class="flex justify-between items-end mt-3">
                        <div class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">${b2Name}</div>
                        <div class="text-right">
                            <span class="block text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Place Stake:</span>
                            <span id="arb-stake-2" class="text-xl font-black text-white">$0.00</span>
                        </div>
                    </div>
                </div>

                ${leg3Html}

            </div>
            
            <div class="flex items-center justify-between bg-neon/10 border border-neon/30 rounded-xl p-4 relative z-10 shrink-0">
                <span class="text-neon font-black text-[11px] uppercase tracking-widest">Guaranteed Payout</span>
                <span id="arb-total-payout" class="text-neon font-black text-xl sm:text-2xl font-mono">+$0.00</span>
            </div>
            
        </div>
    `;

    content.innerHTML = premiumHtml;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        // Trigger initial calculation
        recalculateArb(edgeId, savedBankroll);
    }, 10);
}

function recalculateArb(edgeId, bankrollVal) {
    const edge = window.arbCache[edgeId];
    if (!edge) return;

    const bankroll = parseFloat(bankrollVal);
    if (isNaN(bankroll) || bankroll <= 0) {
        document.getElementById('arb-stake-1').innerText = "$0.00";
        document.getElementById('arb-stake-2').innerText = "$0.00";
        if(document.getElementById('arb-stake-3')) document.getElementById('arb-stake-3').innerText = "$0.00";
        document.getElementById('arb-total-payout').innerText = "$0.00";
        return;
    }

    const dec1 = convertToDecimalSafe(edge.odds1);
    const dec2 = convertToDecimalSafe(edge.odds2);
    
    const imp1 = 1 / dec1;
    const imp2 = 1 / dec2;
    
    let is3Way = (edge.book3 || edge.odds3) ? true : false;
    let imp3 = 0;
    let dec3 = 0;
    
    if (is3Way) {
        dec3 = convertToDecimalSafe(edge.odds3);
        imp3 = 1 / dec3;
    }

    const totalImp = imp1 + imp2 + imp3;

    // Distribute stakes proportionally
    const stake1 = (bankroll * imp1) / totalImp;
    const stake2 = (bankroll * imp2) / totalImp;
    const stake3 = is3Way ? (bankroll * imp3) / totalImp : 0;

    // Payout is the same regardless of which leg hits
    const payout = stake1 * dec1;
    const profit = payout - bankroll;

    // Update DOM
    document.getElementById('arb-stake-1').innerText = '$' + stake1.toFixed(2);
    document.getElementById('arb-stake-2').innerText = '$' + stake2.toFixed(2);
    if (is3Way && document.getElementById('arb-stake-3')) {
        document.getElementById('arb-stake-3').innerText = '$' + stake3.toFixed(2);
    }
    
    document.getElementById('arb-total-payout').innerText = '+$' + profit.toFixed(2) + ' Profit';
}

function closeArbModal() {
    const modal = document.getElementById('arb-premium-modal');
    const content = document.getElementById('arb-premium-content');
    if (!modal || !content) return;

    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        content.innerHTML = ''; 
    }, 300);
}
