/**
 * Terminal Software Global Components
 * Manages Navbar, Unified Compliance Footer, and GEO Schema Injection
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
    // 4. GEO Tech Tutorial / HowTo Schema for pSEO pages
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
    // 5. Default GEO Organization Schema for Home/About/Ledger
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

    // Inject the schema into the <head> for AI crawlers
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

function renderGlobalComponents() {
    const navbar = document.getElementById('global-nav');
    const footer = document.getElementById('global-footer');

    // 1. NAVBAR HTML (Updated with Tracker Link)
    if (navbar) {
        navbar.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <a href="index.html" class="flex items-center gap-3 group">
                    <img src="assets/images/teminal-logo.jpg" alt="Logo" class="h-11 w-auto rounded-md shadow-md transform group-hover:scale-105 transition-all duration-300">
                    <span class="font-heading text-2xl font-black uppercase tracking-tighter text-white hidden sm:block drop-shadow-sm group-hover:opacity-90 transition-opacity duration-300">
                        Terminal<span class="text-brand">Software</span>
                    </span>
                </a>
                <div class="hidden md:flex gap-8 items-center">
                    <a href="index.html" class="text-sm font-semibold text-white hover:text-brand transition tracking-wide uppercase">Home</a>
                    <a href="api.html" class="text-sm font-semibold text-white hover:text-cyanAccent transition tracking-wide uppercase">API</a>
                    <a href="squared-circle-tycoon.html" class="text-sm font-semibold text-white hover:text-brand transition tracking-wide uppercase">Games</a>
                    
                    <div class="relative group py-2">
                        <button class="text-sm font-semibold text-white group-hover:text-neon transition tracking-wide uppercase flex items-center gap-1 focus:outline-none">
                            Free Tools
                            <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="absolute left-0 mt-2 w-56 rounded-xl bg-studio/95 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                            <a href="ev-calculator.html" class="block px-5 py-4 text-xs font-bold text-white hover:bg-white/10 hover:text-neon uppercase tracking-widest border-b border-white/5">EV Calculator</a>
                            <a href="arb-calculator.html" class="block px-5 py-4 text-xs font-bold text-white hover:bg-white/10 hover:text-neon uppercase tracking-widest border-b border-white/5">Arbitrage Calculator</a>
                            <a href="ledger.html" class="block px-5 py-4 text-xs font-bold text-white hover:bg-white/10 hover:text-neon uppercase tracking-widest flex items-center justify-between border-b border-white/5">
                                Public Ledger
                                <svg class="w-3 h-3 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </a>
                            <a href="tracker.html" class="block px-5 py-4 text-xs font-bold text-white hover:bg-white/10 hover:text-neon uppercase tracking-widest flex items-center justify-between">
                                Tracker
                                <svg class="w-3 h-3 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </a>
                        </div>
                    </div>

                    <a href="store.html" class="text-sm font-semibold text-white hover:text-brand transition tracking-wide uppercase">Store</a>
                    
                    <a href="tracker.html" class="text-xs font-mono font-bold text-neon hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1 bg-neon/10 px-3 py-1.5 rounded-lg border border-neon/30 hover:bg-neon/20">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        Tracker
                    </a>

                    <a href="account.html" class="text-sm font-semibold text-brand tracking-wide uppercase border-b-2 border-brand pb-1 ml-2">Account</a>
                    <div id="dynamic-auth-nav" class="flex items-center"></div>
                </div>
                <div class="md:hidden flex items-center">
                    <button id="mobile-menu-btn" class="text-slate-400 hover:text-white p-2 transition">
                        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>
        </div>
        <div id="mobile-menu" class="hidden md:hidden absolute w-full bg-studio/95 backdrop-blur-xl border-b border-white/10 transition-all shadow-2xl z-50">
            <div class="px-4 pt-4 pb-6 space-y-4 font-heading font-black uppercase tracking-wide">
                <a href="index.html" class="block px-4 py-2 text-white hover:text-brand">Home</a>
                <a href="api.html" class="block px-4 py-2 text-white hover:text-cyanAccent">API</a>
                <a href="squared-circle-tycoon.html" class="block px-4 py-2 text-white">Games</a>
                
                <div class="pt-2 pb-2 border-y border-white/5 my-2">
                    <span class="block px-4 py-2 text-[10px] font-bold text-slate-500 tracking-widest">FREE TOOLS & TRACKING</span>
                    <a href="ev-calculator.html" class="block px-6 py-2 text-sm text-slate-300 hover:text-neon transition">- EV Calculator</a>
                    <a href="arb-calculator.html" class="block px-6 py-2 text-sm text-slate-300 hover:text-neon transition">- Arb Calculator</a>
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
            </div>
        </div>`;
    }

    // 2. UNIFIED FOOTER + DISCLAIMER HTML
    if (footer) {
        footer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 font-medium gap-8 md:gap-4">
            
            <div class="flex items-center gap-3">
                <img src="assets/images/teminal-logo.jpg" alt="Icon" class="h-8 w-auto grayscale opacity-50 rounded">
                &copy; 2026 Terminal Software.
            </div>
            
            <div class="flex flex-wrap justify-center gap-6">
                <a href="tos.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs">Terms</a>
                <a href="privacy.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs">Privacy</a>
                <a href="about.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs">Contact</a>
                <a href="ev-calculator.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs text-slate-400">EV Calc</a>
                <a href="arb-calculator.html" class="hover:text-white transition uppercase tracking-wide text-[10px] md:text-xs text-slate-400">Arb Calc</a>
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
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
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

document.addEventListener('DOMContentLoaded', () => {
    injectGEOSchema(); // FIRE GEO SCHEMA INJECTION
    renderGlobalComponents();
    // Run auth display logic (ensure setupSmartNavbar is in auth.js)
    if (typeof setupSmartNavbar === 'function') setupSmartNavbar();
});
