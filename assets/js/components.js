/**
 * Terminal Software Global Components
 * Manages Navbar, Unified Compliance Footer, and GEO Schema Injection
 */

function injectGEOSchema() {
    const path = window.location.pathname;
    let schema = {};

    // 1. Product/Pricing Schema for Store
    if (path.includes('store.html') || path.includes('dashboard-store.html')) {
        schema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Terminal Software Institutional Telemetry",
            "description": "High-frequency API and Dashboard access for Crypto momentum and Sportsbook +EV data.",
            "brand": {"@type": "Brand", "name": "Terminal Software"},
            "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": "49.00",
                "highPrice": "299.00"
            }
        };
    } 
    // 2. Tech/API Schema for Documentation
    else if (path.includes('api.html') || path.includes('docs.html')) {
         schema = {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "Terminal Software Telemetry API Documentation",
            "description": "Technical documentation, endpoints, and authentication for the Terminal Software Sports and Crypto Data-as-a-Service API.",
            "publisher": {"@type": "Organization", "name": "Terminal Software"}
         };
    } 
    // 3. Video Game Schema for SCT
    else if (path.includes('squared-circle-tycoon.html')) {
         schema = {
            "@context": "https://schema.org",
            "@type": "VideoGame",
            "name": "Squared Circle Tycoon",
            "description": "A deep, premium professional wrestling management and booking simulation game.",
            "operatingSystem": "Windows, iOS, Android",
            "applicationCategory": "Game",
            "publisher": {"@type": "Organization", "name": "Terminal Software"}
         };
    } 
    // 4. Tech Tutorial / HowTo Schema for pSEO pages
    else if (path.includes('/tutorials/')) {
         schema = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Terminal Software API Tutorial",
            "description": "A technical guide for quantitative developers building automated scripts using the Terminal Software API.",
            "publisher": {"@type": "Organization", "name": "Terminal Software"}
         };
    } 
    // 5. Default Organization Schema for Home/About
    else {
        schema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Terminal Software",
            "url": "https://terminalsoftware.online",
            "logo": "https://terminalsoftware.online/assets/images/teminal-logo.jpg",
            "founder": "Charles Bass"
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

    // 1. NAVBAR HTML
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
                    <a href="ev-calculator.html" class="text-sm font-semibold text-white hover:text-neon transition tracking-wide uppercase">Free Tools</a>
                    <a href="store.html" class="text-sm font-semibold text-white hover:text-brand transition tracking-wide uppercase">Store</a>
                    <a href="account.html" class="text-sm font-semibold text-brand tracking-wide uppercase border-b-2 border-brand pb-1">Account</a>
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
            <div class="px-4 pt-4 pb-6 space-y-3 font-heading font-black uppercase tracking-wide">
                <a href="index.html" class="block px-4 py-3 text-white hover:text-brand">Home</a>
                <a href="api.html" class="block px-4 py-3 text-white hover:text-cyanAccent">API</a>
                <a href="squared-circle-tycoon.html" class="block px-4 py-3 text-white">Games</a>
                <a href="ev-calculator.html" class="block px-4 py-3 text-white hover:text-neon">Free Tools</a>
                <a href="store.html" class="block px-4 py-3 text-white">Store</a>
                <a href="account.html" class="block px-4 py-3 text-brand">Account</a>
            </div>
        </div>`;
    }

    // 2. UNIFIED FOOTER + DISCLAIMER HTML
    if (footer) {
        footer.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 font-medium gap-6">
            <div class="flex items-center gap-3">
                <img src="assets/images/teminal-logo.jpg" alt="Icon" class="h-8 w-auto grayscale opacity-50 rounded">
                &copy; 2026 Terminal Software. All rights reserved.
            </div>
            <div class="flex flex-wrap justify-center gap-8">
                <a href="tos.html" class="hover:text-white transition uppercase tracking-wide text-xs">Terms of Service</a>
                <a href="privacy.html" class="hover:text-white transition uppercase tracking-wide text-xs">Privacy</a>
                <a href="about.html" class="hover:text-white transition uppercase tracking-wide text-xs">Contact</a>
                <a href="ev-calculator.html" class="hover:text-neon transition uppercase tracking-wide text-xs font-bold">EV Calculator</a>
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
