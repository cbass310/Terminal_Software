// assets/js/ai-picks.js
// Handles the Premium AI Advisory Syndicate Rationale Modal

function openAiModal(slipId) {
    const slip = currentOptimizedSlip; 
    if (!slip) return;

    const modal = document.getElementById('ai-premium-modal');
    const content = document.getElementById('ai-premium-content');
    if (!modal || !content) return;

    const avgEdge = parseFloat(slip.average_edge || 0).toFixed(2);
    const legsCount = slip.legs ? slip.legs.length : 0;

    // Dynamic mock text to simulate the AI reasoning based on the slip's parameters
    const aiText = `The neural network flags a highly correlated ${legsCount}-leg sequence. Variance models indicate these specific player props share a positive dependency—meaning if Leg 1 hits, the probability of the subsequent legs hitting increases mathematically. Consensus market implied probability sits significantly lower than our projected hit rate. Recommended allocation: 0.5u to 1.0u based on the +${avgEdge}% system edge.`;

    const premiumHtml = `
        <div class="bg-studio/95 border border-brand/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto">
            <button onclick="closeAiModal()" class="absolute top-4 right-4 text-slate-500 hover:text-white bg-black/50 p-1.5 rounded-full transition-colors z-[60]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div class="absolute -top-20 -left-10 w-48 h-48 bg-brand/10 blur-[60px] rounded-full pointer-events-none"></div>

            <div class="relative z-10 mb-4 border-b border-white/10 pb-4 pr-8">
                <div class="inline-flex items-center gap-2 bg-brand/20 border border-brand/30 text-brand px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest mb-3">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
                    AI Syndicate Analysis
                </div>
                <h3 class="font-impact text-white text-xl sm:text-2xl tracking-wide leading-tight">Correlated Parlay Rationale</h3>
            </div>

            <div class="bg-black/40 border border-white/5 rounded-xl p-4 mb-5 relative z-10">
                <div class="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                    <span class="text-brand text-lg">🤖</span>
                    <span class="text-white font-bold text-[10px] uppercase tracking-widest">Neural Network Output</span>
                </div>
                <p class="text-slate-300 font-mono text-[11px] leading-relaxed">${aiText}</p>
            </div>

            <button onclick="closeAiModal()" class="w-full bg-white/5 hover:bg-brand/20 border border-white/10 hover:border-brand/50 text-slate-300 hover:text-brand transition-all duration-300 py-3 rounded-lg font-heading text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group relative z-10">
                Acknowledge Intelligence
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

function closeAiModal() {
    const modal = document.getElementById('ai-premium-modal');
    const content = document.getElementById('ai-premium-content');
    if (!modal || !content) return;

    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        content.innerHTML = ''; 
    }, 300);
}
