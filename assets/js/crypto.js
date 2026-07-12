<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crypto Radar | Terminal Software</title>
    <link rel="icon" type="image/png" href="assets/images/favicon.png">
    
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#000000">
    <link rel="apple-touch-icon" href="/assets/images/terminal-icon-192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Terminal">
    
    <meta name="robots" content="noindex, nofollow">
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,800;0,900;1,900&family=Inter:wght@400;500;600;700&family=Oswald:wght@700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    
    <link rel="stylesheet" href="assets/css/dashboard.css">

    <style>
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Ad Container Glitch/Border Effects */
        .ad-terminal-bracket {
            position: relative;
            background-color: #000000; /* Strict black to hide iframe load flashes */
        }
        .ad-terminal-bracket::before,
        .ad-terminal-bracket::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            border: 1px solid rgba(6, 182, 212, 0.5); /* cyanAccent fallback */
            pointer-events: none;
        }
        .ad-terminal-bracket::before {
            top: 0; left: 0;
            border-right: none; border-bottom: none;
        }
        .ad-terminal-bracket::after {
            bottom: 0; right: 0;
            border-left: none; border-top: none;
        }
    </style>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: { DEFAULT: '#f59e0b', hover: '#d97706' },
                        studio: '#0f172a',
                        background: '#020617',
                        cyanAccent: '#06b6d4',
                        redAccent: '#ef4444',
                        void: '#0A0A0A',
                        neon: '#39FF14',
                        purpleAccent: '#a855f7',
                    },
                    fontFamily: {
                        heading: ['Montserrat', 'sans-serif'],
                        sans: ['Inter', 'sans-serif'],
                        mono: ['Space Mono', 'monospace'],
                        impact: ['Oswald', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then((registration) => {
                    console.log('ServiceWorker registration successful');
                }, (err) => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    </script>
</head>
<body class="text-slate-300 font-sans min-h-screen flex flex-col selection:bg-cyanAccent selection:text-void overflow-x-hidden relative pb-12">

    <div id="ambient-crypto" class="fixed bottom-0 right-1/4 w-[600px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)] rounded-full pointer-events-none -z-10"></div>

    <nav id="global-nav" class="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10"></nav>

    <div class="bg-studio/40 border-b border-white/5 backdrop-blur-sm py-3 relative z-10 h-12 flex items-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
            <span class="font-mono text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest">Live Telemetry Environment</span>
            
            <div class="flex items-center justify-end gap-4 w-auto shrink-0 relative z-20">
                <div class="flex items-center gap-2">
                    <div id="status-pulse" class="w-2 h-2 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                    <span id="status-text" class="font-mono font-bold text-cyanAccent text-[10px] tracking-widest uppercase transition-colors animate-pulse">System Online</span>
                </div>
                
                <button id="terminal-ai-toggle" class="text-slate-400 hover:text-cyanAccent transition-colors p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-cyanAccent/30 group relative focus:outline-none">
                    <span class="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-[9px] text-cyanAccent px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-cyanAccent/30 tracking-widest uppercase pointer-events-none whitespace-nowrap hidden sm:block">Terminal AI</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col md:flex-row gap-8">
        
        <aside class="w-full lg:w-[250px] flex-shrink-0 flex flex-col gap-5 lg:sticky lg:top-[90px] lg:h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar border-r border-white/5 pr-4 -mt-1">
            
            <a href="terminal-ai.html" class="flex items-center justify-between px-3 py-4 border border-transparent hover:border-cyanAccent/30 bg-black/40 backdrop-blur-md rounded-xl shadow-lg group transition-all cursor-pointer">
                <div class="flex flex-col">
                    <span class="font-impact text-xl tracking-wider text-white font-black leading-none group-hover:text-cyanAccent transition-colors group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">TERMINAL <span class="text-brand italic font-heading text-lg group-hover:text-cyanAccent transition-colors">A.I.</span></span>
                    <span class="text-[9px] font-mono text-slate-500 tracking-widest uppercase mt-1 group-hover:text-cyanAccent/70 transition-colors">v4.2 // SYS_CORE</span>
                </div>
            </a>
            
            <div id="folder-crypto" class="flex flex-col gap-1">
                <div class="flex justify-between items-center pl-3 mb-2 pr-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Crypto Radar</span>
                        <span id="lock-crypto" class="hidden text-slate-500 text-xs">🔒</span>
                    </div>
                    <button onclick="toggleCryptoNewsSidebar()" class="text-slate-500 hover:text-cyanAccent transition-colors focus:outline-none" title="Blockchain Intel Wire">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                    </button>
                </div>
                
                <button id="tab-crypto-mom" onclick="switchTab('crypto-mom')" class="sidebar-link w-full text-left flex items-center gap-3 text-sm font-medium text-white px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 shadow-lg group transition-colors">
                    <span class="text-cyanAccent font-bold font-mono transition-transform group-hover:translate-x-0.5">&gt;</span> Momentum Scan
                </button>
                <button id="tab-crypto-analysis" onclick="switchTab('crypto-analysis')" class="sidebar-link w-full text-left flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white px-3 py-2.5 rounded-xl border border-transparent group transition-colors">
                    <span class="text-cyanAccent font-bold font-mono transition-transform group-hover:translate-x-0.5">&gt;</span> Regime Analysis
                </button>
                <button id="tab-crypto-signals" onclick="switchTab('crypto-signals')" class="sidebar-link w-full text-left flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white px-3 py-2.5 rounded-xl border border-transparent group transition-colors">
                    <span class="text-cyanAccent font-bold font-mono transition-transform group-hover:translate-x-0.5">&gt;</span> Signal Radar
                </button>
            </div>
            
            <div class="flex flex-col gap-1 mt-2">
                <div class="text-[10px] text-slate-500 font-mono uppercase tracking-widest pl-3 mb-2">Infrastructure</div>
                <button id="tab-api" onclick="switchTab('api')" class="sidebar-link w-full text-left flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white px-3 py-2.5 rounded-xl border border-transparent group transition-colors">
                    <span class="text-cyanAccent font-bold font-mono transition-transform group-hover:translate-x-0.5">&gt;</span> Developer API
                </button>
            </div>

            <div class="flex flex-col gap-1 mt-2">
                <div class="text-[10px] text-slate-500 font-mono uppercase tracking-widest pl-3 mb-2">Cross-Division</div>
                <a href="dashboard.html" class="w-full text-left flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white px-3 py-2.5 rounded-xl border border-transparent group transition-colors">
                    <span class="w-1.5 h-1.5 rounded-full bg-neon group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(57,255,20,0.6)] shrink-0"></span> Sports Matrix
                </a>
                <a href="https://terminalsoftware.online/predictions-dashboard.html" class="w-full text-left flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white px-3 py-2.5 rounded-xl border border-transparent group transition-colors">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#a855f7] group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(168,85,247,0.6)] shrink-0"></span> Prediction Markets
                </a>
                <a href="games.html" class="w-full text-left flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white px-3 py-2.5 rounded-xl border border-transparent group transition-colors">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(245,158,11,0.6)] shrink-0"></span> Gaming Hub
                </a>
            </div>

            <div class="w-full flex flex-col mt-4 border-t border-white/5 pt-4">
                <div class="flex items-center gap-2 mb-2 px-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                    <span class="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">> SPONSORED_TELEMETRY</span>
                </div>
                
                <div class="ad-terminal-bracket w-full min-h-[250px] md:min-h-[600px] flex items-center justify-center border-y border-white/10 transition-colors">
                    <a href="https://advanced.coinbase.com/join/FDNBYUH?src=referral-link" target="_blank" class="flex flex-col items-center justify-center w-full h-full bg-[#0a0a0a] border border-[#2563eb]/30 hover:border-[#2563eb]/80 transition-all p-6 group cursor-pointer no-underline relative overflow-hidden block">
                        <div class="absolute top-0 left-0 w-full h-1 bg-[#2563eb]/40 group-hover:bg-[#2563eb] transition-colors"></div>
                        <span class="text-[#2563eb] font-mono text-[10px] uppercase tracking-widest mb-4 opacity-70">> EXCHANGE SYNC</span>
                        <span class="text-white font-mono text-xl md:text-2xl font-black text-center mb-2 tracking-tighter leading-none">COINBASE ADVANCED</span>
                        <span class="text-gray-500 font-mono text-[10px] md:text-xs text-center mb-4 md:mb-8 leading-relaxed px-2">Execute institutional crypto trades with deep liquidity and lower fees.</span>
                        <div class="bg-transparent border border-[#2563eb] text-[#2563eb] font-mono text-sm px-6 py-3 font-bold group-hover:bg-[#2563eb] group-hover:text-white transition-all w-full text-center">
                            INITIALIZE UPLINK
                        </div>
                    </a>
                </div>
            </div>
        </aside>

        <div class="flex-grow w-full min-h-[500px]">
            
            <div id="view-crypto-mom" class="hidden w-full transition-opacity duration-300">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-6">
                    <h2 class="font-heading text-2xl font-black text-white uppercase tracking-widest">Momentum Scanner</h2>
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        <div class="bg-cyanAccent/10 border border-cyanAccent/30 hover:border-cyanAccent/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg flex-grow md:flex-grow-0 group">
                            <span class="text-cyanAccent font-bold uppercase tracking-widest text-xs">Sort:</span>
                            <select id="crypto-mom-filter" class="bg-transparent text-white font-bold uppercase tracking-widest text-sm focus:outline-none cursor-pointer appearance-none outline-none w-full group-hover:text-cyanAccent transition-colors">
                                <option value="market_cap" selected>Top Market Cap</option>
                                <option value="adx">Highest Momentum (ADX)</option>
                                <option value="alpha">Alphabetical Order (A-Z)</option>
                                <option value="price_desc">Price (High to Low)</option>
                                <option value="volume">24H Volume</option>
                            </select>
                            <svg class="w-4 h-4 text-cyanAccent shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div class="w-full mb-6 py-1 bg-[#020617]">
                    <div class="flex justify-between items-end mb-1">
                        <span class="text-[8px] font-mono text-cyanAccent/70 uppercase tracking-widest pl-2">SPONSORED_TELEMETRY</span>
                        <span class="text-[8px] font-mono text-slate-600 uppercase pr-2">SYS.NET.ID: 0x99A</span>
                    </div>
                    <div class="ad-terminal-bracket w-full min-h-[90px] flex items-center justify-center border-y border-white/10 transition-colors">
                        <a href="https://cash.app/app/LBBSDMF" target="_blank" class="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-0 w-full h-full bg-black border border-[#22c55e]/40 hover:border-[#22c55e] transition-all px-4 sm:px-6 py-4 group cursor-pointer no-underline text-center sm:text-left">
                            <div class="flex flex-col justify-center">
                                <span class="text-[#22c55e] font-mono text-[10px] uppercase tracking-widest mb-1 opacity-80">> FIAT TO CRYPTO GATEWAY</span>
                                <span class="text-white font-mono text-lg font-bold tracking-tight group-hover:text-gray-200 transition-colors">ACCUMULATE BITCOIN VIA CASH APP</span>
                            </div>
                            <div class="bg-[#22c55e]/10 border border-[#22c55e] text-[#22c55e] font-mono text-xs px-4 py-2 rounded-sm group-hover:bg-[#22c55e] group-hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                [ GET BONUS ]
                            </div>
                        </a>
                    </div>
                </div>

                <div id="loading-state-crypto-mom" class="text-center py-20">
                    <div class="inline-block w-10 h-10 border-4 border-white/10 border-t-cyanAccent rounded-full animate-spin mb-6"></div>
                    <p class="font-mono font-bold text-cyanAccent text-sm uppercase tracking-widest animate-pulse">Calibrating Radar...</p>
                </div>
                <div id="crypto-mom-feed-container" class="space-y-4 hidden w-full"></div>
            </div>

            <div id="view-crypto-analysis" class="hidden w-full transition-opacity duration-300">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-6">
                    <h2 class="font-heading text-2xl font-black text-white uppercase tracking-widest">Regime Analysis</h2>
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        <div class="bg-cyanAccent/10 border border-cyanAccent/30 hover:border-cyanAccent/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg flex-grow md:flex-grow-0 group">
                            <span class="text-cyanAccent font-bold uppercase tracking-widest text-xs">Sort:</span>
                            <select id="crypto-analysis-filter" class="bg-transparent text-white font-bold uppercase tracking-widest text-sm focus:outline-none cursor-pointer appearance-none outline-none w-full group-hover:text-cyanAccent transition-colors">
                                <option value="adx" selected>Highest Momentum (ADX)</option>
                                <option value="alpha">Alphabetical Order (A-Z)</option>
                                <option value="price_desc">Price (High to Low)</option>
                            </select>
                            <svg class="w-4 h-4 text-cyanAccent shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div class="w-full mb-6 py-1 bg-[#020617]">
                    <div class="flex justify-between items-end mb-1">
                        <span class="text-[8px] font-mono text-cyanAccent/70 uppercase tracking-widest pl-2">SPONSORED_TELEMETRY</span>
                        <span class="text-[8px] font-mono text-slate-600 uppercase pr-2">SYS.NET.ID: 0x99B</span>
                    </div>
                    <div class="ad-terminal-bracket w-full min-h-[90px] flex items-center justify-center border-y border-white/10 transition-colors">
                        <a href="https://coinbase.com/join/HCAYBSH?src=referral-link" target="_blank" class="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-0 w-full h-full bg-black border border-[#3b82f6]/40 hover:border-[#3b82f6] transition-all px-4 sm:px-6 py-4 group cursor-pointer no-underline text-center sm:text-left">
                            <div class="flex flex-col justify-center">
                                <span class="text-[#3b82f6] font-mono text-[10px] uppercase tracking-widest mb-1 opacity-80">> SECURE STORAGE & YIELD</span>
                                <span class="text-white font-mono text-lg font-bold tracking-tight group-hover:text-gray-200 transition-colors">CLAIM YOUR COINBASE SIGN-UP REWARD</span>
                            </div>
                            <div class="bg-[#3b82f6]/10 border border-[#3b82f6] text-[#3b82f6] font-mono text-xs px-4 py-2 rounded-sm group-hover:bg-[#3b82f6] group-hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                [ EXECUTE ONBOARDING ]
                            </div>
                        </a>
                    </div>
                </div>

                <div id="loading-state-crypto-analysis" class="text-center py-20">
                    <div class="inline-block w-10 h-10 border-4 border-white/10 border-t-cyanAccent rounded-full animate-spin mb-6"></div>
                    <p class="font-mono font-bold text-cyanAccent text-sm uppercase tracking-widest animate-pulse">Processing Market Regimes...</p>
                </div>
                <div id="crypto-analysis-feed-container" class="space-y-4 hidden w-full"></div>
            </div>

            <div id="view-crypto-signals" class="hidden w-full transition-opacity duration-300">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-6">
                    <h2 class="font-heading text-2xl font-black text-white uppercase tracking-widest">Signal Radar</h2>
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        <div class="bg-cyanAccent/10 border border-cyanAccent/30 hover:border-cyanAccent/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg flex-grow md:flex-grow-0 group">
                            <span class="text-cyanAccent font-bold uppercase tracking-widest text-xs">Sort:</span>
                            <select id="crypto-signals-filter" class="bg-transparent text-white font-bold uppercase tracking-widest text-sm focus:outline-none cursor-pointer appearance-none outline-none w-full group-hover:text-cyanAccent transition-colors">
                                <option value="adx" selected>Highest Signal (ADX)</option>
                                <option value="alpha">Alphabetical (A-Z)</option>
                            </select>
                            <svg class="w-4 h-4 text-cyanAccent shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div class="w-full mb-6 py-1 bg-[#020617]">
                    <div class="flex justify-between items-end mb-1">
                        <span class="text-[8px] font-mono text-cyanAccent/70 uppercase tracking-widest pl-2">SPONSORED_TELEMETRY</span>
                        <span class="text-[8px] font-mono text-slate-600 uppercase pr-2">SYS.NET.ID: 0x99C</span>
                    </div>
                    <div class="ad-terminal-bracket w-full min-h-[90px] flex items-center justify-center border-y border-white/10 transition-colors">
                        <a href="https://advanced.coinbase.com/join/FDNBYUH?src=referral-link" target="_blank" class="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-0 w-full h-full bg-black border border-[#8b5cf6]/40 hover:border-[#8b5cf6] transition-all px-4 sm:px-6 py-4 group cursor-pointer no-underline text-center sm:text-left">
                            <div class="flex flex-col justify-center">
                                <span class="text-[#8b5cf6] font-mono text-[10px] uppercase tracking-widest mb-1 opacity-80">> INSTITUTIONAL LIQUIDITY</span>
                                <span class="text-white font-mono text-lg font-bold tracking-tight group-hover:text-gray-200 transition-colors">TRADE ON COINBASE ADVANCED</span>
                            </div>
                            <div class="bg-[#8b5cf6]/10 border border-[#8b5cf6] text-[#8b5cf6] font-mono text-xs px-4 py-2 rounded-sm group-hover:bg-[#8b5cf6] group-hover:text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                                [ ACCESS EXCHANGE ]
                            </div>
                        </a>
                    </div>
                </div>

                <div id="loading-state-crypto-signals" class="text-center py-20">
                    <div class="inline-block w-10 h-10 border-4 border-white/10 border-t-cyanAccent rounded-full animate-spin mb-6"></div>
                    <p class="font-mono font-bold text-cyanAccent text-sm uppercase tracking-widest animate-pulse">Scanning Active Signals...</p>
                </div>
                <div id="crypto-signals-feed-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 hidden w-full"></div>
            </div>

            <div id="view-api" class="hidden w-full">
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyanAccent/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden group transition duration-500">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-cyanAccent/10 group-hover:bg-cyanAccent/20 blur-[50px] rounded-full pointer-events-none transition-all duration-700"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto mb-6 text-cyanAccent/50 group-hover:text-cyanAccent group-hover:scale-110 transition-all duration-500"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                    <h2 class="font-impact text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-widest leading-tight">Institutional <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-blue-500">Firehose</span></h2>
                    <p class="text-slate-400 font-medium max-w-xl mx-auto leading-relaxed mb-8">Direct WebSocket and REST API access to the live crypto telemetry feed. Connect your custom execution engines directly to the Terminal Software matrix.</p>
                    <div id="api-key-container" class="max-w-2xl mx-auto mb-10 min-h-[100px] flex items-center justify-center">
                        <div class="inline-block w-6 h-6 border-2 border-white/10 border-t-cyanAccent rounded-full animate-spin"></div>
                    </div>
                    <a href="api.html" class="inline-block bg-cyanAccent/10 hover:bg-cyanAccent text-cyanAccent hover:text-background font-bold py-4 px-8 rounded-xl transition-all duration-300 uppercase tracking-widest text-sm border border-cyanAccent shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-1">Read Documentation</a>
                </div>
            </div>

            <div id="view-locked" class="hidden w-full pt-10">
                <div class="bg-black/80 backdrop-blur-md border border-red-500/30 rounded-3xl p-12 text-center shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                    <span class="text-6xl mb-6 block">🔒</span>
                    <h2 class="font-impact text-4xl font-black text-white mb-4 uppercase tracking-widest">Access Denied</h2>
                    <p class="text-slate-400 font-mono text-sm max-w-md mx-auto mb-8">Your current subscription tier does not include access to this division's telemetry feed.</p>
                    <a href="store.html" class="inline-block bg-white/10 hover:bg-white text-white hover:text-background font-bold py-4 px-8 rounded-xl transition-all duration-300 uppercase tracking-widest text-sm border border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-1">Upgrade Provisioning</a>
                </div>
            </div>

        </div>
    </main>

    <div id="crypto-news-overlay" onclick="toggleCryptoNewsSidebar()" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] hidden opacity-0 transition-opacity duration-300"></div>
    
    <div id="crypto-news-sidebar" class="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-studio/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[100] transform translate-x-full transition-transform duration-300 ease-in-out flex flex-col">
        <div class="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
            <div class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
                <h2 class="font-heading text-lg font-black text-white uppercase tracking-widest">Blockchain Intel Wire</h2>
            </div>
            <button onclick="toggleCryptoNewsSidebar()" class="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div id="crypto-news-feed-container" class="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-4">
            <div class="text-center py-20">
                <div class="inline-block w-8 h-8 border-4 border-white/10 border-t-cyanAccent rounded-full animate-spin mb-4"></div>
                <p class="font-mono text-cyanAccent text-[10px] uppercase tracking-widest animate-pulse">Intercepting Wire...</p>
            </div>
        </div>
    </div>

    <div id="global-ticker-wrapper" class="fixed bottom-0 left-0 w-full bg-black/90 border-t border-cyanAccent/30 backdrop-blur-xl overflow-hidden z-50 h-10 flex items-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transition-colors duration-500 hidden">
        <div id="ticker-container" class="animate-ticker"></div>
    </div>

    <footer id="global-footer" class="bg-background py-12 border-t border-slate-800 mt-auto relative z-20"></footer>

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

    <script>
        const aiToggleBtn = document.getElementById('terminal-ai-toggle');
        const aiModalWindow = document.getElementById('terminal-ai-modal');
        const aiModalContent = document.getElementById('terminal-ai-content');
        const aiCloseBtn = document.getElementById('close-ai-modal');
        
        const aiChatContainer = document.getElementById('ai-chat-container');
        const aiQueryInput = document.getElementById('ai-query-input');
        const aiSubmitBtn = document.getElementById('ai-submit-btn');

        const FIREHOSE_ENDPOINT = 'https://api.terminalsoftware.online/query'; 

        // Toggle Modal Logic
        aiToggleBtn.addEventListener('click', () => {
            aiModalWindow.classList.remove('hidden');
            setTimeout(() => {
                aiModalWindow.classList.remove('opacity-0');
                aiModalContent.classList.remove('scale-95');
                aiQueryInput.focus();
            }, 10);
        });

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

        // Chat Submission Logic
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
            const wrapper = document.createElement('div');
            wrapper.className = 'w-full md:w-3/4 max-w-3xl self-start font-mono';
            let htmlContent = '';

            switch(intent) {
                case 'SPORTS':
                    htmlContent = `
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
                    htmlContent = `
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
                    htmlContent = `
                        <div class="pl-5 border-l-2 border-cyanAccent/50 bg-cyanAccent/5 py-4 rounded-r-xl">
                            <div class="text-[10px] font-bold text-cyanAccent uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-cyanAccent animate-pulse"></span>
                                Terminal AI Response
                            </div>
                            <div class="text-sm text-slate-300 ai-typewriter-target leading-relaxed" data-text="${payload.response || payload.action}"></div>
                        </div>`;
                    break;
            }

            wrapper.innerHTML = htmlContent;
            aiChatContainer.appendChild(wrapper);

            const target = wrapper.querySelector('.ai-typewriter-target');
            if (target) {
                typeAIWriterEffect(target, target.getAttribute('data-text'));
            } else {
                scrollAIToBottom();
            }
        }

        function renderAIUserMessage(text) {
            const wrapper = document.createElement('div');
            wrapper.className = 'w-full md:w-2/3 max-w-2xl self-end text-right mt-2';
            wrapper.innerHTML = `
                <div class="inline-block bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl rounded-tr-sm px-5 py-3.5 text-sm text-white shadow-lg text-left font-mono">
                    ${escapeAIHtml(text)}
                </div>
            `;
            aiChatContainer.appendChild(wrapper);
            scrollAIToBottom();
        }

        function renderAISystemLogs(id) {
            const wrapper = document.createElement('div');
            wrapper.id = id;
            wrapper.className = 'w-full self-start pl-5 py-3 font-mono';
            wrapper.innerHTML = `
                <div class="text-[10px] font-bold text-cyanAccent uppercase tracking-widest leading-loose animate-pulse">
                    > Intercepting query...<br>
                    > Routing to Master Terminal Node...<br>
                    > Synthesizing response<span class="animate-pulse">_</span>
                </div>
            `;
            aiChatContainer.appendChild(wrapper);
            scrollAIToBottom();
        }

        function renderAIError(msg) {
            const wrapper = document.createElement('div');
            wrapper.className = 'w-full self-start pl-4 py-2 font-mono';
            wrapper.innerHTML = `<div class="text-xs text-red-500 font-bold uppercase tracking-widest border border-red-500/30 bg-red-500/10 p-4 rounded-xl">> ERROR: ${msg}</div>`;
            aiChatContainer.appendChild(wrapper);
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
    </script>

    <script src="assets/js/auth.js"></script>
    <script src="assets/js/components.js"></script>
    <script src="assets/js/crypto.js"></script>
    <script src="assets/js/crypto-intel.js"></script>

</body>
</html>
