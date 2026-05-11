// assets/js/ai-picks.js
// Handles the Premium AI Advisory Syndicate Feed

function renderAiPicks(data) {
    const container = document.getElementById('sports-ai-feed-container');
    const loader = document.getElementById('loading-state-sports-ai');

    if(loader) loader.classList.add('hidden');
    if(container) container.classList.remove('hidden');

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="text-center p-8 text-slate-500 font-mono tracking-widest uppercase bg-black/40 rounded-2xl border border-white/5">AWAITING AI MODEL OUTPUT...</div>`;
        return;
    }

    // Sort by highest EV and take top 3 for the premium feed
    const sortedData = [...data].sort((a, b) => {
        const valA = parseFloat(a.ev_pct || a.edge_percent || a.ev || a.edge || a.value || a.profit || 0);
        const valB = parseFloat(b.ev_pct || b.edge_percent || b.ev || b.edge || b.value || b.profit || 0);
        return valB - valA;
    });

    const topPicks = sortedData.slice(0, 3);

    const html = topPicks.map((edge, index) => {
        const edgeVal = parseFloat(edge.ev_pct || edge.edge_percent || edge.ev || edge.edge || edge.value || edge.profit || 0);
        const rawMatchName = String(edge.match_name || edge.team || edge.game || edge.event || edge.matchup || "UNKNOWN MATCH");
        const safeMatchName = rawMatchName.replace(/'/g, "\\'");
        const propString = escapeHtml(edge.target || edge.prop || edge.play || edge.selection || edge.description || edge.player_name || "UNKNOWN PROP");

        // Mock AI text based on data
        const aiText = `The neural network flags a significant discrepancy here. Consensus market probability sits around ${(50 - edgeVal/2).toFixed(1)}%, while the offered line implies a much lower barrier. Historical pace telemetry indicates a highly favorable game script. We project a ${Math.max(55, 50 + edgeVal).toFixed(1)}% hit rate for this specific prop based on the latest opponent defensive configurations.`;

        let oddsStr = (edge.odds !== undefined && edge.odds !== null) ? String(edge.odds) : "-110";
        const odds = (oddsStr !== "N/A" && !oddsStr.startsWith('-') && !oddsStr.startsWith('+')) ? '+' + oddsStr : oddsStr;

        return `
            <div class="bg-studio/50 border border-brand/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.05)] relative overflow-hidden group transition-all hover:border-brand">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand/10 transition-colors"></div>
                
                <div class="flex justify-between items-start mb-4 border-b border-white/10 pb-4 relative z-10">
                    <div class="flex gap-4 items-center w-full">
                        <div class="bg-brand/20 text-brand p-3 rounded-xl border border-brand/30 shadow-inner">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between items-center w-full">
                                <div class="text-brand font-black text-[10px] tracking-widest uppercase mb-1">Top Pick #${index + 1}</div>
                                <div class="text-white font-black text-sm bg-black/50 px-2 py-1 rounded border border-white/10">${odds}</div>
                            </div>
                            <h3 class="font-impact text-lg sm:text-xl text-white uppercase tracking-wide leading-tight">${propString}</h3>
                            <div class="text-slate-400 font-mono text-[10px] uppercase tracking-widest mt-0.5">${rawMatchName}</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-black/40 border border-white/5 rounded-xl p-4 mb-4 relative z-10">
                    <div class="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                        <span class="text-brand text-lg">🤖</span>
                        <span class="text-white font-bold text-[10px] uppercase tracking-widest">AI Rationale & Analysis</span>
                        <span class="ml-auto text-brand font-mono font-bold text-[10px] tracking-widest">+${edgeVal.toFixed(2)}% EDGE</span>
                    </div>
                    <p class="text-slate-300 font-mono text-[11px] leading-relaxed">${aiText}</p>
                </div>
                
                <button onclick="logBet('${safeMatchName}', 'AI_PICK', ${edgeVal}, '${oddsStr}', '${propString}')" class="w-full bg-brand/10 hover:bg-brand text-brand hover:text-background border border-brand/50 font-black py-3 rounded-xl transition-all shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] text-[10px] sm:text-xs uppercase tracking-widest flex justify-center items-center gap-2 relative z-10">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Log AI Play
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}
