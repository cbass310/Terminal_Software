// assets/js/components.js

function setupSmartNavbar() {
    const nav = document.getElementById('global-nav');
    if (!nav) return;

    nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20 w-full">
                
                <a href="index.html" class="flex items-center shrink-0 group">
                    <img src="assets/images/logo.png" alt="Terminal Software" class="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" onerror="this.src='assets/images/favicon.png'">
                </a>

                <div class="hidden lg:flex items-center justify-end gap-6 ml-auto">
                    
                    <div class="relative group">
                        <button class="text-slate-300 hover:text-white font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5 py-2 focus:outline-none transition-colors">
                            Resources
                            <svg class="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        
                        <div class="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                            <div class="p-2 space-y-1">
                                <a href="ledger.html" class="block px-4 py-3 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest font-bold transition-colors">Verified Ledger</a>
                                <a href="api.html" class="block px-4 py-3 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest font-bold transition-colors">API Documentation</a>
                                
                                <div class="border-t border-white/10 my-2"></div>
                                
                                <a href="operator.html" class="block px-4 py-3 text-[10px] text-neon hover:text-background hover:bg-neon rounded-lg uppercase tracking-widest font-black transition-all flex items-center justify-between group/op">
                                    Operator Dashboard
                                    <span class="w-1.5 h-1.5 rounded-full bg-neon group-hover/op:bg-background animate-pulse"></span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="relative group">
                        <button class="text-slate-300 hover:text-white font-bold uppercase tracking-widest text-[11px] flex items-center gap-1.5 py-2 focus:outline-none transition-colors">
                            Free Tools
                            <svg class="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                            <div class="p-2 space-y-1">
                                <a href="squared-circle-tycoon.html" class="block px-4 py-3 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 rounded-lg uppercase tracking-widest font-bold transition-colors">Terminal Games</a>
                            </div>
                        </div>
                    </div>

                    <a href="store.html" class="text-slate-300 hover:text-white font-bold uppercase tracking-widest text-[11px] transition-colors">Store</a>
                    
                    <a href="account.html" class="text-brand hover:text-yellow-400 font-bold uppercase tracking-widest text-[11px] transition-colors border-b-2 border-brand pb-1">Account</a>
                    
                    <div class="flex items-center gap-5 shrink-0 pl-6 border-l border-white/10">
                        <a href="dashboard.html" class="text-brand hover:text-yellow-400 font-black uppercase tracking-widest text-[11px] transition-colors">Enter Portal</a>
                        <button onclick="if(typeof handleSignOut === 'function') handleSignOut();" class="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all border border-white/10">Sign Out</button>
                    </div>
                </div>

                <button id="mobile-menu-btn" class="lg:hidden text-slate-300 hover:text-white p-2 focus:outline-none transition-colors ml-auto">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            <div id="mobile-menu" class="hidden lg:hidden border-t border-white/10 py-4 space-y-2">
                <a href="store.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">Store</a>
                <a href="ledger.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">Verified Ledger</a>
                <a href="api.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">API Docs</a>
                <a href="squared-circle-tycoon.html" class="block px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-widest hover:bg-white/5 rounded-lg">Terminal Games</a>
                
                <a href="operator.html" class="block px-4 py-3 text-xs font-black text-neon bg-neon/10 border border-neon/20 uppercase tracking-widest rounded-lg mt-2 flex justify-between items-center">
                    Operator Dashboard
                    <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
                </a>
                
                <div class="border-t border-white/10 my-4"></div>
                
                <a href="account.html" class="block px-4 py-3 text-xs font-bold text-brand uppercase tracking-widest hover:bg-white/5 rounded-lg">Account</a>
                <a href="dashboard.html" class="block px-4 py-3 text-xs font-black text-brand uppercase tracking-widest hover:bg-white/5 rounded-lg">Enter Portal</a>
                <button onclick="if(typeof handleSignOut === 'function') handleSignOut();" class="block w-full text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-white/5 rounded-lg">Sign Out</button>
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
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
                <div class="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-6">
                    
                    <div class="text-slate-400 font-bold text-sm tracking-widest">
                        © ${new Date().getFullYear()} Terminal Software.
                    </div>
                    
                    <div class="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                        <a href="terms.html" class="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Terms</a>
                        <a href="privacy.html" class="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Privacy</a>
                        <a href="contact.html" class="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Contact</a>
                        <a href="education.html" class="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Education</a>
                        <a href="calculators.html" class="text-slate-400 hover:text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Calculators</a>
                        <a href="ledger.html" class="flex items-center gap-1.5 text-white hover:text-neon font-black uppercase tracking-widest text-[10px] sm:text-xs transition-colors">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
                            Live Ledger
                        </a>
                    </div>

                    <div class="flex items-center gap-4">
                        <a href="https://x.com/Terminal_Soft" target="_blank" class="text-slate-400 hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href="https://www.facebook.com/TerminalSoftware/" target="_blank" class="text-slate-400 hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg>
                        </a>
                        <a href="https://www.reddit.com/user/terminalsoftware/" target="_blank" class="text-slate-400 hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.505 1.12-.816 2.646-1.364 4.354-1.468l.849-3.974c.026-.123.142-.207.268-.198l2.96.626a1.24 1.24 0 0 1 1.59-1.005zm-7.616 8.528c-.85 0-1.534.686-1.534 1.536 0 .848.685 1.534 1.534 1.534.848 0 1.534-.686 1.534-1.534 0-.85-.686-1.536-1.534-1.536zm5.212 0c-.85 0-1.534.686-1.534 1.536 0 .848.685 1.534 1.534 1.534.848 0 1.534-.686 1.534-1.534 0-.85-.686-1.536-1.534-1.536zm-4.394 3.738c-1.054 0-1.956.402-2.316.924l.654.498c.205-.285.805-.59 1.662-.59 1.134 0 1.754.4 1.831.464l.582-.622c-.152-.142-1.018-.674-2.413-.674z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div class="text-center font-mono text-[8px] sm:text-[9px] text-slate-600 uppercase tracking-widest leading-relaxed">
                    TERMINAL SOFTWARE IS AN INFORMATIONAL DATA-AS-A-SERVICE (DAAS) PIPELINE. WE ARE NOT A SPORTSBOOK OR A REGISTERED INVESTMENT ADVISOR, AND WE DO NOT ACCEPT WAGERS, DEPOSITS, OR HOLD USER FUNDS. ALL QUANTITATIVE DATA, ODDS, AND CRYPTO MARKET SIGNALS ARE PROVIDED FOR EDUCATIONAL AND ENTERTAINMENT PURPOSES ONLY AND DO NOT CONSTITUTE FINANCIAL, TRADING, OR INVESTMENT ADVICE. DIGITAL ASSETS AND SPORTS MARKETS CARRY INHERENT FINANCIAL RISKS; TERMINAL SOFTWARE ASSUMES NO LIABILITY FOR ANY DECISIONS MADE OR LOSSES INCURRED USING THIS DATA. IF YOU OR SOMEONE YOU KNOW HAS A GAMBLING PROBLEM, PLEASE PLAY RESPONSIBLY AND CALL 1-800-GAMBLER.
                </div>
            </div>
        `;
    }
}
