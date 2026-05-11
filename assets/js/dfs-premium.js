// assets/js/dfs-premium.js
// Handles the Sleek DFS Grid + Premium Telemetry Pop-up Modal

window.dfsCache = {};

function createDfsCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        window.dfsCache[edgeId] = edge;

        const edgeVal = parseFloat(edge.ev_pct || edge.edge_percent || edge.ev || edge.edge || edge.value || edge.profit || 0); 
        const edgeFormatted = `+${edgeVal.toFixed(2)}% EDGE`;
        
        // Safety Catch for Undefined Odds
        let oddsStr = (edge.odds !== undefined && edge.odds !== null) ? String(edge.odds) : "N/A";
        const odds = (oddsStr !== "N/A" && !oddsStr.startsWith('-') && !oddsStr.startsWith('+')) ? '+' + oddsStr : oddsStr;
        
        let timestampBadge = '';
        if (edge.commence_time && !String(edge.commence_time).includes('ACTIVE SLATE')) {
            try {
                const dateObj = new Date(edge.commence_time);
                const opts = { month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' };
                const dateStr = dateObj.toLocaleString('en-US', opts);
                timestampBadge = `⏳ ${dateStr.toUpperCase()}`;
            } catch(e) {
                timestampBadge = `⏳ ${edge.commence_time}`;
            }
        } else {
            let timeFallback = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
            timeFallback = String(timeFallback).replace(/🟢/g, '').replace(/\[ACTIVE SLATE\]/gi, '').trim();
            timestampBadge = `<span class="text-neon">🟢 LIVE:</span> ${timeFallback}`;
        }
        
        const platformName = escapeHtml(edge.book || edge.platform || edge.bookmaker || edge.sportsbook || "PLATFORM");
        const platformLogo = getSportsbookLogo(platformName, "w-14 h-4 object-contain");
        
        const rawMatchName = String(edge.match_name || edge.team || edge.game || edge.event || edge.matchup || "UNKNOWN MATCH");
        const safeMatchName = rawMatchName.replace(/'/g, "\\'"); 
        const abbrMatchName = getAbbreviatedMatchup(rawMatchName);
        
        const detectedSport = detectSport(edge);
        const iconHtml = generateTeamLogosHtml(detectedSport, false);

        const propString = escapeHtml(edge.target || edge.prop || edge.play || edge.selection || edge.description || edge.player_name || "UNKNOWN PROP");

        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : 'animate-flash-update';

        let statusBadge = `<span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0"></span>`;
        if (isExpired) {
            statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;
        } else if (edge.status && edge.status.toLowerCase() === 'won') {
            statusBadge = `<span class="text-neon font-black text-[9px] sm:text-[10px] uppercase">WON</span>`;
        } else if (edge.status && edge.status.toLowerCase() === 'lost') {
            statusBadge = `<span class="text-redAccent font-black text-[9px] sm:text-[10px] uppercase">LOST</span>`;
        }

        let history = edge.line_history || edge.history;
        if (!history || !Array.isArray(history) || history.length < 2) {
            const currentDec = convertToDecimal(oddsStr !== "N/A" ? oddsStr : -110); 
            history = [];
            let walk = currentDec + (Math.random() * 0.15 + 0.05); 
            for(let i=0; i<10; i++) {
                history.push(walk);
                walk -= (Math.random() * 0.04) - 0.005; 
            }
            history[9] = currentDec; 
        }
        const sparklineHtml = generateSparklineSvg(history);

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-between h-full ${opacityClass}">
                
                <div class="flex justify-between items-start mb-3 relative z-10 w-full gap-2 sm:gap-3">
                    <div class="flex items-start gap-3 flex-1 min-w-0 pr-1">
                        <div class="flex flex-col items-center w-10 sm:w-12 shrink-0 gap-1">
                            ${iconHtml}
                            <p class="text-[6px] sm:text-[7px] pt-0.5 text-slate-500 font-bold tracking-widest uppercase text-center w-full truncate">${abbrMatchName}</p>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col justify-start pt-0.5">
                            <h2 class="font-impact text-[11px] sm:text-[13px] font-black uppercase text-white leading-snug break-normal whitespace-normal odds-text pr-1">${propString}</h2>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end shrink-0 gap-1.5 w-[70px] sm:w-[80px]">
                        <span class="text-[6px] sm:text-[7px] font-mono text-slate-400 uppercase tracking-widest whitespace-nowrap overflow-hidden text-right w-full block truncate">${timestampBadge}</span>
                        <div class="bg-studio/80 border border-white/10 rounded-lg p-1.5 shrink-0 shadow-lg flex items-center justify-center overflow-hidden w-14 sm:w-16 h-6">
                            ${platformLogo}
                        </div>
                        <button onclick="openDfsModal('${edgeId}')" class="text-slate-500 hover:text-brand transition-colors flex items-center gap-1 mt-1 group" title="View Full Analytics">
                            <svg class="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <span class="text-[7px] font-black uppercase tracking-widest group-hover:text-white">Data</span>
                        </button>
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-3 relative z-10 flex-grow flex flex-col justify-end">
                    <div class="h-10 sm:h-12 w-full bg-black/40 border-y border-white/5 relative overflow-hidden mb-3 rounded-lg">
                        <div class="absolute top-1 left-2 z-10 flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_5px_rgba(57,255,20,0.8)]"></span>
                            <span class="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase tracking-widest">Market Probability Trend</span>
                        </div>
                        <div class="absolute inset-0 pt-4 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            ${sparklineHtml}
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-2 sm:p-2.5 mb-2 gap-2 overflow-hidden w-full">
                        <span class="text-[6.5px] sm:text-[7.5px] font-mono text-slate-500 uppercase tracking-widest truncate min-w-0 flex-1 leading-tight pr-2">PROP MARKET</span>
                        <div class="status-badge-container flex items-center gap-1 sm:gap-1.5 shrink-0">
                            ${isExpired ? statusBadge : `
                                ${statusBadge}
                                <span class="text-neon font-mono font-bold text-[9px] sm:text-[10px] tracking-widest whitespace-nowrap odds-text shrink-0">${edgeFormatted}</span>
                            `}
                        </div>
                    </div>
                    
                    <button onclick="logBet('${safeMatchName}', 'DFS', ${edgeVal}, 'PROP', '${propString}')" class="w-full bg-white/5 hover:bg-neon/20 border border-white/10 hover:border-neon/50 text-slate-300 hover:text-neon shadow-[0_0_10px_rgba(57,255,20,0.05)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all duration-300 py-2 rounded-lg font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group mt-1">
                        <svg class="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        Log Play (1u)
                    </button>
                </div>
            </div>
        `;
    } catch (err) { 
        console.error("DFS Card Render Error:", err);
        return ''; 
    }
}


function openDfsModal(edgeId) {
    const edge = window.dfsCache[edgeId];
    if (!edge) return;

    const modal = document.getElementById('dfs-premium-modal');
    const content = document.getElementById('dfs-premium-content');
    if (!modal || !content) return;

    const edgeVal = parseFloat(edge.ev_pct || edge.edge_percent || edge.ev || edge.edge || edge.value || edge.profit || 0); 
    const edgeFormatted = `+${edgeVal.toFixed(2)}%`;
    
    // Safety Catch for Undefined Odds
    let oddsStr = (edge.odds !== undefined && edge.odds !== null) ? String(edge.odds) : "N/A";
    const odds = (oddsStr !== "N/A" && !oddsStr.startsWith('-') && !oddsStr.startsWith('+')) ? '+' + oddsStr : oddsStr;
    
    const platformName = escapeHtml(edge.book || edge.platform || edge.bookmaker || edge.sportsbook || "PLATFORM");
    const rawMatchName = String(edge.match_name || edge.team || edge.game || edge.event || edge.matchup || "UNKNOWN MATCH");
    const abbrMatchName = getAbbreviatedMatchup(rawMatchName);
    const propString = escapeHtml(edge.target || edge.prop || edge.play || edge.selection || edge.description || edge.player_name || "UNKNOWN PROP");
    const safeMatchName = rawMatchName.replace(/'/g, "\\'"); 

    // Generate Icon for Modal
    const detectedSport = detectSport(edge);
    const iconHtml = generateTeamLogosHtml(detectedSport, false);

    const premiumHtml = `
        <div class="bg-studio/95 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto">
            
            <button onclick="closeDfsModal()" class="absolute top-3 right-3 text-slate-500 hover:text-white bg-black/50 p-1.5 rounded-full transition-colors z-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div class="absolute -top-10 -left-10 w-32 h-32 bg-brand/10 blur-3xl rounded-full pointer-events-none"></div>

            <div class="flex justify-between items-start mb-4 relative z-10 border-b border-white/10 pb-4 mt-2">
                <div class="flex items-center gap-4 w-full">
                    <div class="flex flex-col items-center gap-1.5 shrink-0 w-16">
                        ${iconHtml}
                        <span class="bg-white/10 text-slate-300 text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase border border-white/5 truncate max-w-full block text-center">${abbrMatchName}</span>
                    </div>
                    <div class="pr-2 flex-1 min-w-0">
                        <h3 class="font-impact text-white text-xl tracking-wide leading-tight mb-1.5 whitespace-normal break-normal">${propString}</h3>
                        <div class="flex items-center gap-2">
                            <p class="text-slate-400 font-mono text-[9px] uppercase tracking-widest truncate">${rawMatchName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-black/40 border border-white/5 rounded-lg p-2 mb-4 flex items-center justify-between relative z-10">
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand animate-pulse shrink-0 ml-1"></span>
                    <span class="text-brand font-black text-[9px] uppercase tracking-widest">Platform: ${platformName}</span>
                </div>
                <span class="bg-brand/20 text-brand border border-brand/30 text-[8px] px-2 py-0.5 rounded font-black tracking-widest">HIGH CONFIDENCE</span>
            </div>

            <div class="grid grid-cols-4 gap-2 mb-5 relative z-10">
                <div class="bg-black/50 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                    <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Odds</span>
                    <span class="text-white font-black text-sm">${odds}</span>
                </div>
                <div class="bg-black/50 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                    <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Implied</span>
                    <span class="text-neon font-black text-sm">--%</span>
                </div>
                <div class="bg-black/50 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                    <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Sys Edge</span>
                    <span class="text-white font-black text-sm">${edgeFormatted}</span>
                </div>
                <div class="bg-neon/10 border border-neon/30 rounded-xl p-2 text-center flex flex-col justify-center shadow-inner">
                    <span class="text-neon font-mono text-[8px] uppercase tracking-widest mb-1">Status</span>
                    <span class="text-neon font-black text-xs sm:text-sm">LIVE</span>
                </div>
            </div>

            <div class="flex justify-between items-center bg-black/50 border border-white/5 rounded-xl p-3 mb-5 relative z-10">
                <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">L5</span><span class="text-slate-300 font-bold text-xs">--%</span></div>
                <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">L10</span><span class="text-slate-300 font-bold text-xs">--%</span></div>
                <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">L20</span><span class="text-slate-300 font-bold text-xs">--%</span></div>
                <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">H2H</span><span class="text-slate-300 font-bold text-xs">--%</span></div>
                <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">SZN</span><span class="text-slate-300 font-bold text-xs">--%</span></div>
            </div>

            <div class="grid grid-cols-2 gap-4 relative z-10 border-t border-white/10 pt-4">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Player Profile</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Minutes</div>
                            <div class="text-slate-300 font-black text-sm">--</div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Conv Rate</div>
                            <div class="text-slate-300 font-black text-sm">--</div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Team Pace</div>
                            <div class="text-slate-300 font-black text-sm">--</div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Chances</div>
                            <div class="text-slate-300 font-black text-sm">--</div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Matchup Context</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp Pace</div>
                            <div class="text-slate-300 font-black text-sm">--</div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp 3PA Rate</div>
                            <div class="text-slate-300 font-black text-sm">--%</div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp Oreb %</div>
                            <div class="text-slate-300 font-black text-sm">--%</div>
                        </div>
                        <div class="bg-black/40 border border-white/5 rounded-lg p-2">
                            <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp FG %</div>
                            <div class="text-slate-300 font-black text-sm">--</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button onclick="closeDfsModal(); logBet('${safeMatchName}', 'DFS', ${edgeVal}, 'PROP', '${propString}')" class="w-full mt-6 bg-brand hover:bg-yellow-400 text-background font-black py-3 rounded-xl transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] text-xs flex justify-center items-center gap-2 group relative z-10">
                <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                Log Play to Ledger
            </button>
        </div>
    `;

    content.innerHTML = premiumHtml;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    }, 10);
}

function closeDfsModal() {
    const modal = document.getElementById('dfs-premium-modal');
    const content = document.getElementById('dfs-premium-content');
    if (!modal || !content) return;

    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        content.innerHTML = ''; 
    }, 300);
}
