// assets/js/components.js

function setupSmartNavbar() {
    const nav = document.getElementById('global-nav');
    if (!nav) return;

    nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                
                <a href="index.html" class="flex items-center gap-3 group shrink-0">
                    <div class="w-10 h-10 bg-studio border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:border-neon/50 transition-colors">
                        <span class="font-impact text-white text-xl group-hover:text-neon transition-colors">T</span>
                    </div>
                    <span class="font-heading font-black text-white uppercase tracking-widest text-sm hidden sm:block group-hover:text-neon transition-colors">Terminal</span>
                </a>

                <div class="hidden md:flex items-center gap-8">
                    <a href="store.html" class="text-slate-300 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">Terminal Store</a>
                    
                    <div class="relative group">
                        <button class="text-slate-300 hover:text-white font-bold uppercase tracking-widest text-xs flex items-center gap-1.5 py-2 focus:outline-none">
                            Resources
                            <svg class="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        
                        <div class="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                            <div class="p-2 space-y-1">
                                <a href="ledger.html" class="block px-4 py-3 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest font-bold transition-colors">Verified Ledger</a>
                                <a href="api.html" class="block px-4 py-3 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest font-bold transition-colors">API Documentation</a>
                                <a href="squared-circle-tycoon.html" class="block px-4 py-3 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest font-bold transition-colors">Terminal Games</a>
                                
                                <div class="border-t border-white/10 my-2"></div>
                                
                                <a href="operator.html" class="block px-4 py-3 text-[10px] text-neon hover:text-background hover:bg-neon rounded-lg uppercase tracking-widest font-black transition-all flex items-center justify-between group/op">
                                    Operator Dashboard
                                    <span class="w-1.5 h-1.5 rounded-full bg-neon group-hover/op:bg-background animate-pulse"></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="hidden md:flex items-center gap-5 shrink-0">
                    <a href="login.html" class="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-colors">Sign In</a>
                    <a href="dashboard.html" class="bg-neon text-background hover:bg-white font-black px-5 py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">Enter Portal</a>
                </div>

                <button id="mobile-menu-btn" class="md:hidden text-slate-300 hover:text-white p-2 focus:outline-none transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            <div id="mobile-menu" class="hidden md:hidden border-t border-white/10 py-4 space-y-2">
                <a href="store.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">Terminal Store</a>
                <a href="ledger.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">Verified Ledger</a>
                <a href="api.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">API Docs</a>
                <a href="squared-circle-tycoon.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">Terminal Games</a>
                
                <a href="operator.html" class="block px-4 py-3 text-xs font-black text-neon bg-neon/10 border border-neon/20 uppercase tracking-widest rounded-lg mt-2 flex justify-between items-center">
                    Operator Dashboard
                    <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
                </a>
                
                <div class="border-t border-white/10 my-4"></div>
                
                <a href="login.html" class="block px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-white/5 rounded-lg">Sign In</a>
                <a href="dashboard.html" class="block px-4 py-3 text-xs font-black text-background bg-neon uppercase tracking-widest rounded-lg text-center mt-2 shadow-[0_0_15px_rgba(57,255,20,0.2)]">Enter Portal</a>
            </div>
        </div>
    `;

    // Mobile Menu Click Logic
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function renderGlobalComponents() {
    const footer = document.getElementById('global-footer');
    if (footer) {
        footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-white/5 pb-12">
                    <div class="md:col-span-2">
                        <div class="inline-flex items-center gap-3 mb-4">
                            <div class="w-8 h-8 bg-studio border border-white/10 rounded-lg flex items-center justify-center">
                                <span class="font-impact text-white text-sm">T</span>
                            </div>
                            <span class="font-heading font-black text-white uppercase tracking-widest text-sm">Terminal Software</span>
                        </div>
                        <p class="text-slate-500 font-mono text-xs max-w-sm leading-relaxed mb-6">
                            Engineering complex systems. Quantitative +EV sports telemetry, crypto momentum data-feeds, and premium strategy simulations.
                        </p>
                    </div>
                    
                    <div>
                        <h4 class="font-heading text-white font-black uppercase tracking-widest text-[10px] mb-4">Ecosystem</h4>
                        <ul class="space-y-3">
                            <li><a href="operator.html" class="text-slate-500 hover:text-neon font-mono text-xs uppercase tracking-widest transition-colors">Operator Dashboard</a></li>
                            <li><a href="api.html" class="text-slate-500 hover:text-cyanAccent font-mono text-xs uppercase tracking-widest transition-colors">Institutional API</a></li>
                            <li><a href="squared-circle-tycoon.html" class="text-slate-500 hover:text-brand font-mono text-xs uppercase tracking-widest transition-colors">Terminal Games</a></li>
                            <li><a href="ledger.html" class="text-slate-500 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">Verified Ledger</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-heading text-white font-black uppercase tracking-widest text-[10px] mb-4">Legal</h4>
                        <ul class="space-y-3">
                            <li><a href="privacy.html" class="text-slate-500 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">Privacy Policy</a></li>
                            <li><a href="terms.html" class="text-slate-500 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p class="text-slate-600 font-mono text-[10px] uppercase tracking-widest">© ${new Date().getFullYear()} Terminal Software. All rights reserved.</p>
                    <div class="flex items-center gap-4">
                        <span class="flex items-center gap-2 text-slate-600 font-mono text-[10px] uppercase tracking-widest">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
                            Systems Operational
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
}
