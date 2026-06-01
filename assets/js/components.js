/**
 * Terminal Software Global Components
 * Manages Navbar, Unified Compliance Footer, GEO Schema Injection, and Terminal AI Copilot
 */

function injectGEOSchema() {
    const path = window.location.pathname;
    let schema = {};

    // 1. GEO Product/Pricing Schema for Store
    if (path.includes('store.html') || path.includes('dashboard-store.html')) {
        schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Product",
                    "@id": "https://terminalsoftware.online/store/#product",
                    "name": "Terminal Software Institutional Telemetry",
                    "description": "High-frequency API and Dashboard access for Crypto momentum and Sportsbook +EV data.",
                    "brand": {
                        "@type": "Brand",
                        "name": "Terminal Software"
                    },
                    "offers": {
                        "@type": "AggregateOffer",
                        "priceCurrency": "USD",
                        "lowPrice": "49.00",
                        "highPrice": "299.00"
                    }
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": [{
                        "@type": "Question",
                        "name": "What does the Terminal Software API provide?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "The Terminal Software API provides direct access to high-frequency live crypto momentum metrics and verified Expected Value (+EV) sports betting data."
                        }
                    }]
                }
            ]
        };
    } 
    // 2. GEO Tech/API Schema for Documentation
    else if (path.includes('api.html') || path.includes('docs.html')) {
        schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "TechArticle",
                    "@id": "https://terminalsoftware.online/api/#article",
                    "headline": "Terminal Software Telemetry API Documentation",
                    "description": "Technical documentation, endpoints, and authentication for the Terminal Software Sports and Crypto Data-as-a-Service API.",
                    "publisher": {
                        "@type": "Organization",
                        "name": "Terminal Software"
                    }
                }
            ]
        };
    } 
    // 3. GEO Video Game Schema for SCT
    else if (path.includes('squared-circle-tycoon.html')) {
        schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "SoftwareApplication",
                    "@id": "https://terminalsoftware.online/squared-circle-tycoon/#software",
                    "name": "Squared Circle Tycoon",
                    "applicationCategory": "GameApplication",
                    "operatingSystem": "Web, iOS, Android",
                    "author": {
                        "@type": "Organization",
                        "name": "Terminal Software"
                    },
                    "description": "A deep, premium professional wrestling management and booking simulation game.",
                    "offers": {
                        "@type": "Offer",
                        "price": "0.00",
                        "priceCurrency": "USD"
                    }
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": [{
                        "@type": "Question",
                        "name": "What is Squared Circle Tycoon?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Squared Circle Tycoon is a pro wrestling management simulation RPG developed by Terminal Software. Players run their own promotion, manage rosters, and book events."
                        }
                    }]
                }
            ]
        };
    } 
    // 4. NEW: GEO Schema for Operator Dashboard Landing Page
    else if (path.includes('operator.html') || path.includes('sports.html')) {
        schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Terminal Operator Dashboard",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web Browser",
            "description": "Institutional-grade retail execution dashboard for +EV sports betting, real-time cross-market arbitrage, and AI-correlated DFS props.",
            "publisher": {
                "@type": "Organization",
                "name": "Terminal Software"
            }
        };
    }
    // 5. GEO Tech Tutorial / HowTo Schema for pSEO pages
    else if (path.includes('/tutorials/')) {
        schema = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Terminal Software API Tutorial",
            "description": "A technical guide for quantitative developers building automated scripts using the Terminal Software API.",
            "publisher": {
                "@type": "Organization",
                "name": "Terminal Software"
            }
        };
    } 
    // 6. Default GEO Organization Schema for Home/About/Ledger
    else {
        schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Organization",
                    "@id": "https://terminalsoftware.online/#organization",
                    "name": "Terminal Software",
                    "legalName": "Terminal Software",
                    "url": "https://terminalsoftware.online",
                    "logo": "https://terminalsoftware.online/assets/images/teminal-logo.jpg",
                    "founder": "Charles Bass",
                    "description": "A premier remote software studio specializing in sports management simulations and AI-driven telemetry dashboards."
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": [{
                        "@type": "Question",
                        "name": "What does Terminal Software do?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Terminal Software develops premium sports management simulations like Squared Circle Tycoon and operates a verified, live Data-as-a-Service (DaaS) telemetry pipeline for sports betting and cryptocurrency markets."
                        }
                    }]
                }
            ]
        };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

function updateAuthStatus() {
    const desktopAuth = document.getElementById('desktop-auth-container');
    const mobileAuth = document.getElementById('mobile-auth-container');
    
    // Check if user is logged in by scanning for Supabase auth token
    let isLoggedIn = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).includes('-auth-token')) {
            isLoggedIn = true;
            break;
        }
    }

    // Dynamic Auth HTML
    const desktopHtml = isLoggedIn 
        ? `<button onclick="if(typeof handleSignOut === 'function') { handleSignOut(); } else { localStorage.clear(); window.location.href='login.html'; }" class="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors cursor-pointer">Sign Out</button>
           <a href="dashboard.html" class="bg-neon text-background hover:bg-white font-black px-5 py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]">Enter Portal</a>`
        : `<a href="login.html" class="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Sign In</a>
           <a href="dashboard.html" class="bg-neon text-background hover:bg-white font-black px-5 py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]">Enter Portal</a>`;

    const mobileHtml = isLoggedIn
        ? `<button onclick="if(typeof handleSignOut === 'function') { handleSignOut(); } else { localStorage.clear(); window.location.href='login.html'; }" class="block w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white font-bold uppercase tracking-widest">Sign Out</button>
           <a href="dashboard.html" class="block w-full text-center px-4 py-3 mt-2 text-xs text-background bg-neon font-black uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.2)]">Enter Portal</a>`
        : `<a href="login.html" class="block px-4 py-2 text-sm text-slate-400 hover:text-white font-bold uppercase tracking-widest">Sign In</a>
           <a href="dashboard.html" class="block w-full text-center px-4 py-3 mt-2 text-xs text-background bg-neon font-black uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.2)]">Enter Portal</a>`;

    if (desktopAuth) desktopAuth.innerHTML = desktopHtml;
    if (mobileAuth) mobileAuth.innerHTML = mobileHtml;
}

function renderGlobalComponents() {
    const navbar = document.getElementById('global-nav');
    const footer = document.getElementById('global-footer');

    // 1. NAVBAR HTML (Restored Original Logo + Right Aligned Links)
    if (navbar) {
        navbar.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20 w-full">
                
                <a href="index.html" class="flex items-center gap-3 group shrink-0 pr-4">
                    <img src="assets/images/teminal-logo.jpg" alt="Logo" class="h-10 w-auto rounded-md shadow-md transform group-hover:scale-105 transition-all duration-300">
                    <span class="font-heading text-lg xl:text-xl font-black uppercase tracking-tighter text-white hidden sm:block drop-shadow-sm group-hover:opacity-90 transition-opacity duration-300">
                        Terminal<span class="text-brand">Software</span>
                    </span>
                </a>
                
                <div class="hidden md:flex gap-4 lg:gap-6 items-center justify-end w-full ml-auto">
                    
                    <div class="relative group py-2">
                        <button class="text-xs font-semibold text-white group-hover:text-cyanAccent transition tracking-wide uppercase flex items-center gap-1 focus:outline-none">
                            Resources
                            <svg class="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="absolute left-0 mt-2 w-48 rounded-xl bg-studio/95 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                            <a href="operator.html" class="block px-5 py-3 text-[10px] font-bold text-neon hover:bg-white/10 uppercase tracking-widest border-b border-white/5 flex items-center justify-between">
                                Operator Dashboard
                                <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]"></span>
                            </a>
                            <a href="b2b.html" class="block px-5 py-3 text-[10px] font-bold text-brand hover:bg-white/10 uppercase tracking-widest border-b border-white/5 flex items-center justify-between">
                                B2B Consultations
                            </a>
                            <a href="api.html" class="block px-5 py-3 text-[10px] font-bold text-white hover:bg-white/10 hover:text-cyanAccent uppercase tracking-widest border-b border-white/5">Developer API</a>
                            <a href="education.html" class="block px-5 py-3 text-[10px] font-bold text-white hover:bg-white/10 hover:text-cyanAccent uppercase tracking-widest border-b border-white/5">Education Hub</a>
                            <a href="squared-circle-tycoon.html" class="block px-5 py-3 text-[10px] font-bold text-white hover:bg-white/10 hover:text-cyanAccent uppercase tracking-widest">Games</a>
                        </div>
                    </div>

                    <div class="relative group py-2">
                        <button class="text-xs font-semibold text-white group-hover:text-neon transition tracking-wide uppercase flex items-center gap-1 focus:outline-none">
                            Free Tools
                            <svg class="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="absolute left-0 mt-2 w-52 rounded-xl bg-studio/95 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                            <a href="ev-calculator.html" class="block px-5 py-3 text-[10px] font-bold text-white hover:bg-white/10 hover:text-neon uppercase tracking-widest border-b border-white/5">Calculators</a>
                            <a href="ledger.html" class="block px-5 py-3 text-[10px] font-bold text-white hover:bg-white/10 hover:text-neon uppercase tracking-widest flex items-center justify-between border-b border-white/5">
                                Public Ledger
                                <svg class="w-3 h-3 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </a>
                            <a href="tracker.html" class="block px-5 py-3 text-[10px] font-bold text-white hover:bg-white/10 hover:text-neon uppercase tracking-widest flex items-center justify-between">
                                Tracker
                                <svg class="w-3 h-3 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </a>
                        </div>
                    </div>

                    <a href="store.html" class="text-xs font-semibold text-white hover:text-brand transition tracking-wide uppercase">Store</a>
                    
                    <a href="account.html" class="text-xs font-semibold text-brand tracking-wide uppercase border-b-2 border-brand pb-1 ml-2">Account</a>
                    
                    <div id="desktop-auth-container" class="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                        </div>
                </div>
                
                <div class="md:hidden flex items-center">
                    <button id="mobile-menu-btn" class="text-slate-400 hover:text-white p-2 transition focus:outline-none">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>
        </div>
        
        <div id="mobile-menu" class="hidden md:hidden absolute w-full bg-studio/95 backdrop-blur-xl border-b border-white/10 transition-all shadow-2xl z-50">
            <div class="px-4 pt-4 pb-6 space-y-4 font-heading font-black uppercase tracking-wide">
                <a href="index.html" class="block px-4 py-2 text-white hover:text-brand">Home</a>
                
                <div class="pt-2 pb-2 border-y border-white/5 my-2">
                    <span class="block px-4 py-2 text-[10px] font-bold text-slate-500 tracking-widest">RESOURCES</span>
                    <a href="operator.html" class="block px-6 py-2 text-sm text-neon hover:text-white flex items-center gap-2 transition">
                        <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]"></span>
                        Operator Dashboard
                    </a>
                    <a href="b2b.html" class="block px-6 py-2 text-sm text-brand hover:text-white transition">- B2B Consultations</a>
                    <a href="api.html" class="block px-6 py-2 text-sm text-slate-300 hover:text-cyanAccent transition">- Developer API</a>
                    <a href="education.html" class="block px-6 py-2 text-sm text-slate-300 hover:text-cyanAccent transition">- Education Hub</a>
                    <a href="squared-circle-tycoon.html" class="block px-6 py-2 text-sm text-slate-300 hover:text-cyanAccent transition">- Games</a>
                </div>
                
                <div class="pt-2 pb-2 border-b border-white/5 my-2">
                    <span class="block px-4 py-2 text-[10px] font-bold text-slate-500 tracking-widest">FREE TOOLS</span>
                    <a href="ev-calculator.html" class="block px-6 py-2 text-sm text-slate-300 hover:text-neon transition">- Calculators</a>
                    <a href="ledger.html" class="block px-6 py-2 text-sm text-slate-300 hover:text-neon transition flex items-center gap-2">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Verified Ledger
                    </a>
                    <a href="tracker.html" class="block px-6 py-2 text-sm text-neon hover:text-white transition flex items-center gap-2">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        Performance Tracker
                    </a>
                </div>

                <a href="store.html" class="block px-4 py-2 text-white">Store</a>
                <a href="account.html" class="block px-4 py-2 text-brand">Account</a>

                <div id="mobile-auth-container" class="pt-2">
                    </div>
            </div>
        </div>`;
    }

    // 2. UNIFIED FOOTER HTML
    if (footer) {
        footer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 font-medium gap-8 md:gap-4">
            
            <div class="flex items-center gap-3">
                <img src="assets/images/teminal-logo.jpg" alt="Icon" class="h-8 w-auto grayscale opacity-50 rounded" onerror="this.src='assets/images/favicon.png'">
                &copy; 2026 Terminal Software.
            </div>
            
            <div class="flex flex-wrap justify-center gap-6">
                <a href="tos.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs">Terms</a>
                <a href="privacy.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs">Privacy</a>
                <a href="about.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs">Contact</a>
                <a href="education.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs text-slate-400">Education</a>
                <a href="ev-calculator.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs text-slate-400">Calculators</a>
                <a href="ledger.html" class="hover:text-neon transition uppercase tracking-wide text-[10px] md:text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse"></span>
                    Live Ledger
                </a>
            </div>

            <div class="flex items-center gap-5">
                <a href="https://x.com/Terminal_Soft" target="_blank" rel="noopener noreferrer" class="text-slate-500 hover:text-brand transition-colors" aria-label="Twitter/X">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.93H5.078z"/></svg>
                </a>
                <a href="https://www.facebook.com/TerminalSoftware/" target="_blank" rel="noopener noreferrer" class="text-slate-500 hover:text-brand transition-colors" aria-label="Facebook">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z"/></svg>
                </a>
                <a href="https://www.reddit.com/user/terminalsoftware/" target="_blank" rel="noopener noreferrer" class="text-slate-500 hover:text-brand transition-colors" aria-label="Reddit">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.505 1.12-.816 2.646-1.364 4.354-1.468l.849-3.974c.026-.123.142-.207.268-.198l2.96.626a1.24 1.24 0 0 1 1.59-1.005zm-7.616 8.528c-.85 0-1.534.686-1.534 1.536 0 .848.685 1.534 1.534 1.534.848 0 1.534-.686 1.534-1.534 0-.85-.686-1.536-1.534-1.536zm5.212 0c-.85 0-1.534.686-1.534 1.536 0 .848.685 1.534 1.534 1.534.848 0 1.534-.686 1.534-1.534 0-.85-.686-1.536-1.534-1.536zm-4.394 3.738c-1.054 0-1.956.402-2.316.924l.654.498c.205-.285.805-.59 1.662-.59 1.134 0 1.754.4 1.831.464l.582-.622c-.152-.142-1.018-.674-2.413-.674z"/></svg>
                </a>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-white/5 text-center">
            <p class="text-[10px] text-slate-600/60 font-mono leading-relaxed max-w-5xl mx-auto uppercase tracking-tighter">
                Terminal Software is an informational Data-as-a-Service (DaaS) pipeline. We are not a sportsbook or a registered investment advisor, and we do not accept wagers, deposits, or hold user funds. All quantitative data, odds, and crypto market signals are provided for educational and entertainment purposes only and do not constitute financial, trading, or investment advice. Digital assets and sports markets carry inherent financial risks; Terminal Software assumes no liability for any decisions made or losses incurred using this data. If you or someone you know has a gambling problem, please play responsibly and call 1-800-GAMBLER.
            </p>
        </div>`;
    }

    // Re-bind mobile menu logic after injection
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.onclick = () => menu.classList.toggle('hidden');
    }
}

// ----------------------------------------------------------------------
// TERMINAL AI COPILOT GLOBAL INJECTION
// ----------------------------------------------------------------------
function injectTerminalAICopilot() {
    // Only inject if it doesn't already exist on the page
    if (document.getElementById('terminal-ai-modal')) return;

    // 1. Create and inject the modal HTML structure
    const modalHTML = `
        <div id="terminal-ai-modal" class="hidden fixed inset-0 z-[1000] bg-background/90 backdrop-blur-md flex items-center justify-center p-4 opacity-0 transition-opacity duration-300">
            <div class="bg-studio/95 border border-cyanAccent/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] w-full max-w-4xl flex flex-col h-[80vh] overflow-hidden relative transform scale-95 transition-transform duration-300" id="terminal-ai-content">
                
                <div class="flex items-center justify-between p-5 border-b border-white/10 bg-black/60 shrink-0">
                    <div class="flex items-center gap-3">
                        <span class="w-2.5 h-2.5 bg-cyanAccent rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.6)]"></span>
                        <h2 class="font-impact text-white tracking-widest uppercase text-xl">Terminal AI Copilot</h2>
                    </div>
                    <button id="close-ai-modal" class="text-slate-500 hover:text-redAccent transition-colors p-1 focus:outline-none">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div id="ai-chat-container" class="flex-grow overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 hide-scrollbar relative">
                    <div class="text-slate-500 font-mono text-xs uppercase tracking-widest mb-4 border-l-2 border-cyanAccent/50 pl-4 w-full">
                        > Initializing Master Terminal Node... [OK]<br>
                        > Establishing DAAS Uplink... [OK]<br>
                        > Awaiting Query.
                    </div>
                </div>

                <div class="bg-black/80 border-t border-white/10 p-5 shrink-0">
                    <div class="relative w-full max-w-4xl mx-auto">
                        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-cyanAccent font-bold font-mono">></div>
                        <input type="text" id="ai-query-input" 
                            class="w-full bg-background border border-white/20 rounded-xl py-4 pl-10 pr-16 text-white focus:outline-none focus:border-cyanAccent focus:ring-1 focus:ring-cyanAccent/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)] placeholder-slate-600 font-mono text-sm"
                            placeholder="Query sports props, crypto telemetry, or tycoon stats..."
                            autocomplete="off" spellcheck="false">
                        <button id="ai-submit-btn" class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 text-cyanAccent hover:text-white p-2.5 rounded-lg transition-colors focus:outline-none">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML;
    document.body.appendChild(wrapper.firstElementChild);

    // 2. Bind all logic and event listeners globally
    const aiToggleBtn = document.getElementById('terminal-ai-toggle');
    const aiModalWindow = document.getElementById('terminal-ai-modal');
    const aiModalContent = document.getElementById('terminal-ai-content');
    const aiCloseBtn = document.getElementById('close-ai-modal');
    const aiChatContainer = document.getElementById('ai-chat-container');
    const aiQueryInput = document.getElementById('ai-query-input');
    const aiSubmitBtn = document.getElementById('ai-submit-btn');

    const FIREHOSE_ENDPOINT = 'https://api.terminalsoftware.online/query'; 

    if (aiToggleBtn) {
        aiToggleBtn.addEventListener('click', () => {
            aiModalWindow.classList.remove('hidden');
            setTimeout(() => {
                aiModalWindow.classList.remove('opacity-0');
                aiModalContent.classList.remove('scale-95');
                aiQueryInput.focus();
            }, 10);
        });
    }

    function closeAI() {
        aiModalWindow.classList.add('opacity-0');
        aiModalContent.classList.add('scale-95');
        setTimeout(() => {
            aiModalWindow.classList.add('hidden');
        }, 300);
    }

    aiCloseBtn.addEventListener('click', closeAI);
    aiModalWindow.addEventListener('click', (e) => {
        if (e.target === aiModalWindow) closeAI();
    });

    aiQueryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAIQuery();
    });
    aiSubmitBtn.addEventListener('click', handleAIQuery);

    async function handleAIQuery() {
        const text = aiQueryInput.value.trim();
        if (!text) return;

        renderAIUserMessage(text);
        aiQueryInput.value = '';
        aiQueryInput.disabled = true;

        const logId = `log-${Date.now()}`;
        renderAISystemLogs(logId);

        try {
            const response = await fetch(FIREHOSE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text })
            });
            const data = await response.json();

            document.getElementById(logId).remove();

            if (data.status === "success" && data.node_response) {
                routeAIResponse(data.intent, data.node_response);
            } else {
                renderAIError("Invalid payload received from Master Node.");
            }

        } catch (error) {
            document.getElementById(logId).remove();
            renderAIError("CONNECTION SEVERED: Backend API unreachable.");
        } finally {
            aiQueryInput.disabled = false;
            aiQueryInput.focus();
            scrollAIToBottom();
        }
    }

    function routeAIResponse(intent, payload) {
        const chatWrapper = document.createElement('div');
        chatWrapper.className = 'w-full md:w-3/4 max-w-3xl self-start font-mono';
        let contentHtml = '';

        switch(intent) {
            case 'SPORTS':
                contentHtml = `
                    <div class="bg-black/60 border border-brand/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden">
                        <div class="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                            <span class="text-brand text-xl">⚡</span>
                            <h3 class="font-impact text-white uppercase tracking-widest text-xl leading-none">${payload.module}</h3>
                            <span class="ml-auto text-[9px] bg-brand/20 text-brand font-bold px-3 py-1 rounded border border-brand/30 uppercase tracking-widest">${payload.status}</span>
                        </div>
                        <div class="text-sm text-slate-300 ai-typewriter-target leading-relaxed" data-text="${payload.action} | ${payload.insights || 'Awaiting telemetry...'}"></div>
                    </div>`;
                break;
            case 'CRYPTO':
                contentHtml = `
                    <div class="bg-black/60 border border-neon/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(57,255,20,0.1)] relative overflow-hidden">
                        <div class="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                            <span class="text-neon text-xl">🪙</span>
                            <h3 class="font-impact text-white uppercase tracking-widest text-xl leading-none">${payload.module}</h3>
                            <span class="ml-auto text-[9px] bg-neon/20 text-neon font-bold px-3 py-1 rounded border border-neon/30 uppercase tracking-widest">${payload.status}</span>
                        </div>
                        <div class="text-sm text-slate-300 ai-typewriter-target leading-relaxed" data-text="${payload.action} | ${payload.insights || 'Awaiting telemetry...'}"></div>
                    </div>`;
                break;
            default:
                contentHtml = `
                    <div class="pl-5 border-l-2 border-cyanAccent/50 bg-cyanAccent/5 py-4 rounded-r-xl">
                        <div class="text-[10px] font-bold text-cyanAccent uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse"></span>
                            Terminal AI Response
                        </div>
                        <div class="text-sm text-slate-300 ai-typewriter-target leading-relaxed" data-text="${payload.response || payload.action}"></div>
                    </div>`;
                break;
        }

        chatWrapper.innerHTML = contentHtml;
        aiChatContainer.appendChild(chatWrapper);

        const target = chatWrapper.querySelector('.ai-typewriter-target');
        if (target) {
            typeAIWriterEffect(target, target.getAttribute('data-text'));
        } else {
            scrollAIToBottom();
        }
    }

    function renderAIUserMessage(text) {
        const bubble = document.createElement('div');
        bubble.className = 'w-full md:w-2/3 max-w-2xl self-end text-right mt-2';
        bubble.innerHTML = `
            <div class="inline-block bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm text-white shadow-lg text-left font-mono">
                ${escapeAIHtml(text)}
            </div>
        `;
        aiChatContainer.appendChild(bubble);
        scrollAIToBottom();
    }

    function renderAISystemLogs(id) {
        const logs = document.createElement('div');
        logs.id = id;
        logs.className = 'w-full self-start pl-5 py-3 font-mono';
        logs.innerHTML = `
            <div class="text-[10px] font-bold text-cyanAccent uppercase tracking-widest leading-loose animate-pulse">
                > Intercepting query...<br>
                > Routing to Master Terminal Node...<br>
                > Synthesizing response<span class="animate-pulse">_</span>
            </div>
        `;
        aiChatContainer.appendChild(logs);
        scrollAIToBottom();
    }

    function renderAIError(msg) {
        const err = document.createElement('div');
        err.className = 'w-full self-start pl-4 py-2 font-mono';
        err.innerHTML = `<div class="text-xs text-red-500 font-bold uppercase tracking-widest border border-red-500/30 bg-red-500/10 p-4 rounded-xl">> ERROR: ${msg}</div>`;
        aiChatContainer.appendChild(err);
        scrollAIToBottom();
    }

    function typeAIWriterEffect(element, text, speed = 15) {
        element.innerHTML = '';
        let i = 0;
        element.innerHTML += '<span class="animate-pulse">_</span>';
        
        function type() {
            if (i < text.length) {
                element.innerHTML = element.innerHTML.replace('<span class="animate-pulse">_</span>', '');
                element.innerHTML += text.charAt(i) + '<span class="animate-pulse">_</span>';
                i++;
                scrollAIToBottom();
                setTimeout(type, speed);
            } else {
                setTimeout(() => {
                    element.innerHTML = element.innerHTML.replace('<span class="animate-pulse">_</span>', '');
                }, 2000);
            }
        }
        type();
    }

    function scrollAIToBottom() {
        aiChatContainer.scrollTop = aiChatContainer.scrollHeight;
    }

    function escapeAIHtml(unsafe) {
        return String(unsafe).replace(/[&<"'>]/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        });
    }
}

// Ensure components populate right after load
function setupSmartNavbar() {
    renderGlobalComponents();
    updateAuthStatus();
    injectTerminalAICopilot(); // Inject AI Modal globally
}

document.addEventListener('DOMContentLoaded', () => {
    injectGEOSchema(); 
    setupSmartNavbar();
});
