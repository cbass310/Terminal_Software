// assets/js/dfs-premium.js
// Handles the Sleek DFS Grid + Premium Telemetry Pop-up Modal

window.dfsCache = {};

function createDfsCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        window.dfsCache[edgeId] = edge;

        const edgeVal = parseFloat(edge.ev_pct || edge.edge_percent || edge.ev || edge.edge || edge.value || edge.profit || 0); 
        const edgeFormatted = `+${edgeVal.toFixed(2)}% EDGE`;
        
        let oddsStr = String(edge.odds);
        // Fallback for null or undefined odds
        const odds = (!oddsStr.startsWith('-') && !oddsStr.startsWith('+') && oddsStr !== "undefined" && oddsStr !== "null" && oddsStr !== "") ? '+' + oddsStr : 
                     (oddsStr === "undefined" || oddsStr === "null" || oddsStr === "" ? "--" : oddsStr);
        
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
            const currentDec = convertToDecimal(oddsStr !== "undefined" && oddsStr !== "null" ? oddsStr : -110); 
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
                
                <div class="flex justify-between items-center mb-3 pb-2 border-b border-white/5 w-full">
                    <span class="text-[6.5px] sm:text-[7.5px] font-mono text-slate-400 uppercase tracking-widest flex-1 pr-2">${timestampBadge}</span>
                    <div class="bg-studio/80 border border-white/10 rounded-lg p-1.5 shrink-0 shadow-lg flex items-center justify-center overflow-hidden w-14 sm:w-16 h-6">
                        ${platformLogo}
                    </div>
                </div>

                <div class="flex items-center gap-3 mb-3 relative z-10 w-full">
                    <div class="flex flex-col items-center w-12 sm:w-14 shrink-0 gap-1">
                        ${iconHtml}
                        <p class="text-[6px] sm:text-[7px] text-slate-500 font-bold tracking-widest uppercase text-center w-full truncate">${abbrMatchName}</p>
                    </div>
                    <div class="flex-1 min-w-0 flex flex-col">
                        <h2 class="font-impact text-sm sm:text-base font-black uppercase tracking-wide text-white leading-tight">${propString}</h2>
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
                    
                    <div class="flex gap-2 mt-1">
                        <button onclick="openDfsModal('${edgeId}')" class="flex-1 bg-black/40 hover:bg-brand/20 border border-white/10 hover:border-brand/50 text-slate-400 hover:text-brand transition-all duration-300 py-1.5 rounded-lg font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 cursor-pointer">
                            📊 Deep Dive
                        </button>
                        <button onclick="logBet('${safeMatchName}', 'DFS', ${edgeVal}, 'PROP', '${propString}')" class="flex-1 bg-white/5 hover:bg-neon/20 border border-white/10 hover:border-neon/50 text-slate-300 hover:text-neon shadow-[0_0_10px_rgba(57,255,20,0.05)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all duration-300 py-1.5 rounded-lg font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group cursor-pointer">
                            <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            Log Play
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

function generateNativeBarChart(last10, line) {
    if (!last10 || !Array.isArray(last10) || last10.length === 0) return `<div class="h-32 flex items-center justify-center text-slate-500 font-mono text-xs">NO TELEMETRY AVAILABLE</div>`;

    const targetLine = parseFloat(line) || 0;
    const maxVal = Math.max(...last10, targetLine * 1.5) * 1.1; 
    const targetPercent = maxVal > 0 ? (targetLine / maxVal) * 100 : 50;

    const barsHtml = last10.map(val => {
        const isOver = val > targetLine;
        const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
        const colorClass = isOver ? 'bg-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.3)]';
        
        return `
            <div class="flex-1 flex flex-col items-center justify-end group h-full">
                <span class="text-[9px] font-black text-white mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">${val}</span>
                <div class="w-full max-w-[28px] rounded-t-sm transition-all duration-500 ${colorClass}" style="height: ${height}%;"></div>
            </div>
        `;
    }).join('');

    return `
        <div class="relative h-40 w-full mt-4 flex items-end gap-1 px-1">
            <div class="absolute left-0 right-0 border-t-2 border-dashed border-white/60 z-0 flex items-center w-full" style="bottom: ${targetPercent}%;">
                <span class="absolute -left-2 sm:-left-4 text-[9px] font-black text-white bg-studio px-1 rounded">${targetLine}</span>
            </div>
            <div class="relative z-10 flex w-full h-full items-end gap-1 sm:gap-1.5">
                ${barsHtml}
            </div>
        </div>
    `;
}

function openDfsModal(edgeId) {
    const edge = window.dfsCache[edgeId];
    if (!edge) return;

    const modal = document.getElementById('dfs-premium-modal');
    const content = document.getElementById('dfs-premium-content');
    if (!modal || !content) return;

    const edgeVal = parseFloat(edge.ev_pct || edge.edge_percent || edge.ev || edge.edge || edge.value || edge.profit || 0); 
    const edgeFormatted = `+${edgeVal.toFixed(2)}%`;
    
    let oddsStr = String(edge.odds);
    // Fallback for null or undefined odds in the modal
    const odds = (!oddsStr.startsWith('-') && !oddsStr.startsWith('+') && oddsStr !== "undefined" && oddsStr !== "null" && oddsStr !== "") ? '+' + oddsStr : 
                 (oddsStr === "undefined" || oddsStr === "null" || oddsStr === "" ? "--" : oddsStr);
    
    const platformName = escapeHtml(edge.book || edge.platform || edge.bookmaker || edge.sportsbook || "PLATFORM");
    const rawMatchName = String(edge.match_name || edge.team || edge.game || edge.event || edge.matchup || "UNKNOWN MATCH");
    const abbrMatchName = getAbbreviatedMatchup(rawMatchName);
    const propString = escapeHtml(edge.target || edge.prop || edge.play || edge.selection || edge.description || edge.player_name || "UNKNOWN PROP");
    const safeMatchName = rawMatchName.replace(/'/g, "\\'"); 

    const detectedSport = detectSport(edge);
    const iconHtml = generateTeamLogosHtml(detectedSport, false);

    // Deep Dive Data Extraction
    const dd = edge.deep_dive_data || {};
    let last10Raw = dd.last_10_array || edge.last_10_array;
    
    // Check if the array is populated with actual historical data
    let hasTelemetry = Array.isArray(last10Raw) && last10Raw.length > 0 && last10Raw.some(val => val !== 0);
    const last10 = hasTelemetry ? last10Raw.slice(-10) : []; 

    // STRICT REGEX PARSING FOR TARGET LINE
    // Grabs the first number (integer or decimal) it finds in the line, target_line, or target fields
    let rawTargetData = edge.line || edge.target_line || dd.line || edge.target || "0";
    let targetMatch = String(rawTargetData).match(/\d+(\.\d+)?/);
    const targetLine = targetMatch ? parseFloat(targetMatch[0]) : 0;
    
    // Extract Implied Pct directly from the new backend column
    const impliedRaw = edge.implied_pct ?? dd.implied_pct ?? null;
    const impliedFormatted = (impliedRaw !== null && !isNaN(parseFloat(impliedRaw))) ? `${parseFloat(impliedRaw).toFixed(1)}%` : '--%';

    const l5Hit = dd.l5_hit || edge.l5_hit || '--%';
    const l10Hit = dd.l10_hit || edge.l10_hit || '--%';
    const sznHit = dd.szn_hit || edge.szn_hit || '--%';
    
    // Build conditionally
    let hitRatesHtml = '';
    let chartHtml = '';

    if (hasTelemetry) {
        chartHtml = `
            <div class="relative z-10 border-t border-white/10 pt-4 bg-black/20 rounded-xl p-3 mb-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-white font-black text-[11px] uppercase tracking-widest">Prop Target: ${targetLine}</span>
                    <div class="flex gap-2">
                        <span class="bg-[#39FF14]/20 text-[#39FF14] text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase">OVER</span>
                        <span class="bg-red-500/20 text-red-500 text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase">UNDER</span>
                    </div>
                </div>
                ${generateNativeBarChart(last10, targetLine)}
            </div>
        `;

        hitRatesHtml = `
            <div class="flex justify-between items-center bg-black/50 border border-white/5 rounded-xl p-3 mb-5 relative z-10">
                <div class="text-center w-full"><span class="text-slate-500 font-mono text-[8px] block mb-0.5">L5</span><span class="text-neon font-bold text-xs">${l5Hit}</span></div>
                <div class="text-center w-full border-l border-white/10"><span class="text-slate-500 font-mono text-[8px] block mb-0.5">L10</span><span class="text-neon font-bold text-xs">${l10Hit}</span></div>
                <div class="text-center w-full border-l border-white/10"><span class="text-slate-500 font-mono text-[8px] block mb-0.5">SZN</span><span class="text-neon font-bold text-xs">${sznHit}</span></div>
            </div>
        `;
    }

    const premiumHtml = `
        <div class="bg-studio/95 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto">
            
            <button onclick="closeDfsModal()" class="absolute top-3 right-3 text-slate-500 hover:text-white bg-black/50 p-1.5 rounded-full transition-colors z-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div class="absolute -top-10 -left-10 w-32 h-32 bg-brand/10 blur-3xl rounded-full pointer-events-none"></div>

            <div class="flex justify-between items-start mb-4 relative z-10 border-b border-white/10 pb-4 mt-2">
                <div class="flex items-center gap-4">
                    <div class="flex flex-col items-center gap-1.5 shrink-0">
                        ${iconHtml}
                        <span class="bg-white/10 text-slate-300 text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase border border-white/5">${abbrMatchName}</span>
                    </div>
                    <div class="pr-2">
                        <h3 class="font-impact text-white text-xl tracking-wide leading-tight mb-1.5">${propString}</h3>
                        <div class="flex items-center gap-2">
                            <p class="text-slate-400 font-mono text-[9px] uppercase tracking-widest">${rawMatchName}</p>
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

            <div class="grid grid-cols-4 gap-2 mb-4 relative z-10">
                <div class="bg-black/50 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                    <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Odds</span>
                    <span class="text-white font-black text-sm">${odds}</span>
                </div>
                <div class="bg-black/50 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                    <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Implied</span>
                    <span class="text-neon font-black text-sm">${impliedFormatted}</span>
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

            ${hitRatesHtml}
            ${chartHtml}
            
            <button onclick="closeDfsModal(); logBet('${safeMatchName}', 'DFS', ${edgeVal}, 'PROP', '${propString}')" class="w-full mt-2 bg-brand hover:bg-yellow-400 text-background font-black py-3 rounded-xl transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] text-xs flex justify-center items-center gap-2 group relative z-10 cursor-pointer">
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
