// assets/js/dfs-premium.js
// Handles the Premium DFS Scouting Cards

function createDfsCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        const edgeVal = parseFloat(edge.ev_pct || edge.edge_percent || edge.ev || edge.edge || edge.value || edge.profit || 0); 
        const edgeFormatted = `+${edgeVal.toFixed(2)}%`;
        
        let oddsStr = String(edge.odds);
        const odds = (!oddsStr.startsWith('-') && !oddsStr.startsWith('+') && oddsStr !== "undefined" && oddsStr !== "null") ? '+' + oddsStr : oddsStr;
        
        const platformName = escapeHtml(edge.book || edge.platform || edge.bookmaker || edge.sportsbook || "PLATFORM");
        
        const rawMatchName = String(edge.match_name || edge.team || edge.game || edge.event || edge.matchup || "UNKNOWN MATCH");
        const safeMatchName = rawMatchName.replace(/'/g, "\\'"); 
        const abbrMatchName = getAbbreviatedMatchup(rawMatchName);

        const propString = escapeHtml(edge.target || edge.prop || edge.play || edge.selection || edge.description || edge.player_name || "UNKNOWN PROP");

        // Premium Card UI
        return `
            <div id="card-${edgeId}" class="bg-studio/50 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden group hover:border-brand/30 transition-all duration-300 w-full max-w-md mx-auto animate-flash-update">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand/10 transition-colors"></div>

                <div class="flex justify-between items-start mb-4 relative z-10 border-b border-white/10 pb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-impact text-white text-base sm:text-lg tracking-wide leading-none mb-1 w-32 sm:w-40 truncate" title="${propString}">${propString}</h3>
                            <p class="text-slate-400 font-mono text-[9px] uppercase tracking-widest truncate w-32 sm:w-40">${abbrMatchName}</p>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-0.5">${platformName}</div>
                        <div class="bg-neon/10 border border-neon/30 text-neon font-black px-2 py-1 rounded shadow-[0_0_10px_rgba(57,255,20,0.1)] flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path></svg>
                            ${edgeFormatted}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-2 mb-4 relative z-10">
                    <div class="bg-black/40 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                        <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Odds</span>
                        <span class="text-white font-black text-sm">${odds}</span>
                    </div>
                    <div class="bg-black/40 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                        <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Implied</span>
                        <span class="text-neon font-black text-sm">--%</span>
                    </div>
                    <div class="bg-black/40 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center">
                        <span class="text-slate-500 font-mono text-[8px] uppercase tracking-widest mb-1">Sys Edge</span>
                        <span class="text-white font-black text-sm">${edgeFormatted}</span>
                    </div>
                    <div class="bg-neon/5 border border-neon/20 rounded-xl p-2 text-center flex flex-col justify-center shadow-inner">
                        <span class="text-neon font-mono text-[8px] uppercase tracking-widest mb-1">Status</span>
                        <span class="text-neon font-black text-xs sm:text-sm">LIVE</span>
                    </div>
                </div>

                <div class="flex justify-between items-center bg-black/40 border border-white/5 rounded-xl p-3 mb-5 relative z-10">
                    <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">L5</span><span class="text-slate-400 font-bold text-xs">--%</span></div>
                    <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">L10</span><span class="text-slate-400 font-bold text-xs">--%</span></div>
                    <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">L20</span><span class="text-slate-400 font-bold text-xs">--%</span></div>
                    <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">H2H</span><span class="text-slate-400 font-bold text-xs">--%</span></div>
                    <div class="text-center"><span class="text-slate-500 font-mono text-[8px] mr-1">SZN</span><span class="text-slate-400 font-bold text-xs">--%</span></div>
                </div>

                <div class="grid grid-cols-2 gap-4 relative z-10 border-t border-white/10 pt-4">
                    
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Player Profile</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Minutes</div>
                                <div class="text-slate-400 font-black text-sm">--</div>
                            </div>
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Conv Rate</div>
                                <div class="text-slate-400 font-black text-sm">--</div>
                            </div>
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Team Pace</div>
                                <div class="text-slate-400 font-black text-sm">--</div>
                            </div>
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Chances</div>
                                <div class="text-slate-400 font-black text-sm">--</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Matchup Context</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp Pace</div>
                                <div class="text-slate-400 font-black text-sm">--</div>
                            </div>
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp 3PA Rate</div>
                                <div class="text-slate-400 font-black text-sm">--%</div>
                            </div>
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp Oreb %</div>
                                <div class="text-slate-400 font-black text-sm">--%</div>
                            </div>
                            <div class="bg-black/30 border border-white/5 rounded-lg p-2">
                                <div class="text-slate-500 text-[7px] font-mono uppercase mb-0.5">Opp FG %</div>
                                <div class="text-slate-400 font-black text-sm">--</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button onclick="logBet('${safeMatchName}', 'DFS', ${edgeVal}, 'PROP', '${propString}')" class="w-full mt-5 bg-white/5 hover:bg-brand/20 border border-white/10 hover:border-brand/50 text-slate-300 hover:text-brand shadow-[0_0_10px_rgba(245,158,11,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 py-2.5 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2 group relative z-10">
                    <svg class="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    Log Play to Ledger
                </button>
            </div>
        `;
    } catch (err) { return ''; }
}
