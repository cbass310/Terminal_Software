// --- 1. Supabase Initialization & Global State ---
window.sportsApiKey = "";
window.cryptoApiKey = "";
let userEmail = "";
let userAccessTier = "none"; 

let lastFetchedSportsEvData = [];
let currentSportsEvFilter = 'all';
let sportsEvDataHash = ""; 

let lastFetchedSportsArbData = [];
let currentSportsArbFilter = 'all';
let sportsArbDataHash = ""; 

let lastFetchedSportsDfsData = [];
let currentSportsDfsFilter = 'all';
let sportsDfsDataHash = ""; 

let lastFetchedCryptoMomData = [];
let currentCryptoMomFilter = 'market_cap'; 
let cryptoMomDataHash = "";

let lastFetchedCryptoAnalysis = [];
let currentCryptoAnalysisFilter = 'adx'; // Default fallback
let cryptoAnalysisHash = "";

let currentActiveTab = ""; 

// --- 2. LOGO & UI GENERATORS ---

function getTeamLogoUrl(teamName) {
    if (!teamName) return null;
    const normalized = String(teamName).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const megaMap = {
        // NFL
        'arizonacardinals': {a:'ari', s:'nfl'}, 'atlantafalcons': {a:'atl', s:'nfl'}, 'baltimoreravens': {a:'bal', s:'nfl'},
        'buffalobills': {a:'buf', s:'nfl'}, 'carolinapanthers': {a:'car', s:'nfl'}, 'chicagobears': {a:'chi', s:'nfl'},
        'cincinnatibengals': {a:'cin', s:'nfl'}, 'clevelandbrowns': {a:'cle', s:'nfl'}, 'dallascowboys': {a:'dal', s:'nfl'},
        'denverbroncos': {a:'den', s:'nfl'}, 'detroitlions': {a:'det', s:'nfl'}, 'greenbaypackers': {a:'gb', s:'nfl'},
        'houstontexans': {a:'hou', s:'nfl'}, 'indianapoliscolts': {a:'ind', s:'nfl'}, 'jacksonvillejaguars': {a:'jax', s:'nfl'},
        'kansascitychiefs': {a:'kc', s:'nfl'}, 'lasvegasraiders': {a:'lv', s:'nfl'}, 'losangeleschargers': {a:'lac', s:'nfl'},
        'losangelesrams': {a:'lar', s:'nfl'}, 'miamidolphins': {a:'mia', s:'nfl'}, 'minnesotavikings': {a:'min', s:'nfl'},
        'newenglandpatriots': {a:'ne', s:'nfl'}, 'neworleanssaints': {a:'no', s:'nfl'}, 'newyorkgiants': {a:'nyg', s:'nfl'},
        'newyorkjets': {a:'nyj', s:'nfl'}, 'philadelphiaeagles': {a:'phi', s:'nfl'}, 'pittsburghsteelers': {a:'pit', s:'nfl'},
        'sanfrancisco49ers': {a:'sf', s:'nfl'}, 'seattleseahawks': {a:'sea', s:'nfl'}, 'tampabaybuccaneers': {a:'tb', s:'nfl'},
        'tennesseetitans': {a:'ten', s:'nfl'}, 'washingtoncommanders': {a:'was', s:'nfl'},
        // NBA
        'atlantahawks': {a:'atl', s:'nba'}, 'bostonceltics': {a:'bos', s:'nba'}, 'brooklynnets': {a:'bkn', s:'nba'},
        'charlottehornets': {a:'cha', s:'nba'}, 'chicagobulls': {a:'chi', s:'nba'}, 'clevelandcavaliers': {a:'cle', s:'nba'},
        'dallasmavericks': {a:'dal', s:'nba'}, 'denvernuggets': {a:'den', s:'nba'}, 'detroitpistons': {a:'det', s:'nba'},
        'goldenstatewarriors': {a:'gsw', s:'nba'}, 'houstonrockets': {a:'hou', s:'nba'}, 'indianapacers': {a:'ind', s:'nba'},
        'laclippers': {a:'lac', s:'nba'}, 'losangelesclippers': {a:'lac', s:'nba'}, 'losangeleslakers': {a:'lal', s:'nba'},
        'memphisgrizzlies': {a:'mem', s:'nba'}, 'miamiheat': {a:'mia', s:'nba'}, 'milwaukeebucks': {a:'mil', s:'nba'},
        'minnesotatimberwolves': {a:'min', s:'nba'}, 'neworleanspelicans': {a:'nop', s:'nba'}, 'newyorkknicks': {a:'nyk', s:'nba'},
        'oklahomacitythunder': {a:'okc', s:'nba'}, 'orlandomagic': {a:'orl', s:'nba'}, 'philadelphia76ers': {a:'phi', s:'nba'},
        'phoenixsuns': {a:'phx', s:'nba'}, 'portlandtrailblazers': {a:'por', s:'nba'}, 'sacramentokings': {a:'sac', s:'nba'},
        'sanantoniospurs': {a:'sas', s:'nba'}, 'torontoraptors': {a:'tor', s:'nba'}, 'utahjazz': {a:'uta', s:'nba'},
        'washingtonwizards': {a:'was', s:'nba'},
        // MLB
        'ari': {a:'ari', s:'mlb'}, 'arizonadiamondbacks': {a:'ari', s:'mlb'}, 'atl': {a:'atl', s:'mlb'}, 'atlantabraves': {a:'atl', s:'mlb'},
        'bal': {a:'bal', s:'mlb'}, 'baltimoreorioles': {a:'bal', s:'mlb'}, 'bos': {a:'bos', s:'mlb'}, 'bostonredsox': {a:'bos', s:'mlb'},
        'chc': {a:'chc', s:'mlb'}, 'chicagocubs': {a:'chc', s:'mlb'}, 'cws': {a:'cws', s:'mlb'}, 'chicagowhitesox': {a:'cws', s:'mlb'},
        'cin': {a:'cin', s:'mlb'}, 'cincinnatireds': {a:'cin', s:'mlb'}, 'cle': {a:'cle', s:'mlb'}, 'clevelandguardians': {a:'cle', s:'mlb'},
        'col': {a:'col', s:'mlb'}, 'coloradorockies': {a:'col', s:'mlb'}, 'det': {a:'det', s:'mlb'}, 'detroittigers': {a:'det', s:'mlb'},
        'hou': {a:'hou', s:'mlb'}, 'houstonastros': {a:'hou', s:'mlb'}, 'kc': {a:'kc', s:'mlb'}, 'kansascityroyals': {a:'kc', s:'mlb'},
        'laa': {a:'laa', s:'mlb'}, 'losangelesangels': {a:'laa', s:'mlb'}, 'lad': {a:'lad', s:'mlb'}, 'losangelesdodgers': {a:'lad', s:'mlb'},
        'mia': {a:'mia', s:'mlb'}, 'miamimarlins': {a:'mia', s:'mlb'}, 'mil': {a:'mil', s:'mlb'}, 'milwaukeebrewers': {a:'mil', s:'mlb'},
        'min': {a:'min', s:'mlb'}, 'minnesotatwins': {a:'min', s:'mlb'}, 'nym': {a:'nym', s:'mlb'}, 'newyorkmets': {a:'nym', s:'mlb'},
        'nyy': {a:'nyy', s:'mlb'}, 'newyorkyankees': {a:'nyy', s:'mlb'}, 'oak': {a:'oak', s:'mlb'}, 'oaklandathletics': {a:'oak', s:'mlb'},
        'phi': {a:'phi', s:'mlb'}, 'philadelphiaphillies': {a:'phi', s:'mlb'}, 'pit': {a:'pit', s:'mlb'}, 'pittsburghpirates': {a:'pit', s:'mlb'},
        'sd': {a:'sd', s:'mlb'}, 'sandiegopadres': {a:'sd', s:'mlb'}, 'sf': {a:'sf', s:'mlb'}, 'sanfranciscogiants': {a:'sf', s:'mlb'},
        'sea': {a:'sea', s:'mlb'}, 'seattlemariners': {a:'sea', s:'mlb'}, 'stl': {a:'stl', s:'mlb'}, 'stlouiscardinals': {a:'stl', s:'mlb'},
        'tb': {a:'tb', s:'mlb'}, 'tampabayrays': {a:'tb', s:'mlb'}, 'tex': {a:'tex', s:'mlb'}, 'texasrangers': {a:'tex', s:'mlb'},
        'tor': {a:'tor', s:'mlb'}, 'torontobluejays': {a:'tor', s:'mlb'}, 'was': {a:'was', s:'mlb'}, 'washingtonnationals': {a:'was', s:'mlb'},
        // NHL
        'anaheimducks': {a:'ana', s:'nhl'}, 'bostonbruins': {a:'bos', s:'nhl'}, 'buffalosabres': {a:'buf', s:'nhl'}, 'calgaryflames': {a:'cgy', s:'nhl'},
        'carolinahurricanes': {a:'car', s:'nhl'}, 'chicagoblackhawks': {a:'chi', s:'nhl'}, 'coloradoavalanche': {a:'col', s:'nhl'}, 'columbusbluejackets': {a:'cbj', s:'nhl'},
        'dallasstars': {a:'dal', s:'nhl'}, 'detroitredwings': {a:'det', s:'nhl'}, 'edmontonoilers': {a:'edm', s:'nhl'}, 'floridapanthers': {a:'fla', s:'nhl'},
        'losangeleskings': {a:'lak', s:'nhl'}, 'minnesotawild': {a:'min', s:'nhl'}, 'montrealcanadiens': {a:'mtl', s:'nhl'}, 'nashvillepredators': {a:'nsh', s:'nhl'},
        'newjerseydevils': {a:'njd', s:'nhl'}, 'newyorkislanders': {a:'nyi', s:'nhl'}, 'newyorkrangers': {a:'nyr', s:'nhl'}, 'ottawasenators': {a:'ott', s:'nhl'},
        'philadelphiaflyers': {a:'phi', s:'nhl'}, 'pittsburghpenguins': {a:'pit', s:'nhl'}, 'sanjosesharks': {a:'sjs', s:'nhl'}, 'seattlekraken': {a:'sea', s:'nhl'},
        'stlouisblues': {a:'stl', s:'nhl'}, 'tampabaylightning': {a:'tbl', s:'nhl'}, 'torontomapleleafs': {a:'tor', s:'nhl'}, 'vancouvercanucks': {a:'van', s:'nhl'},
        'vegasgoldenknights': {a:'vgk', s:'nhl'}, 'washingtoncapitals': {a:'wsh', s:'nhl'}, 'winnipegjets': {a:'wpg', s:'nhl'}
    };
    
    const match = megaMap[normalized];
    if (match) {
        return `https://a.espncdn.com/i/teamlogos/${match.s}/500/${match.a}.png`;
    }
    return null;
}

// FIXED: Strict sizing for all sportsbook logos
function getSportsbookLogo(bookName, classes = "w-20 h-5 object-contain") {
    if (!bookName) return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 UNKNOWN</span>`;
    const normalized = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bookMap = {
        'draftkings': 'draftkings', 'fanduel': 'fanduel', 'pinnacle': 'pinnacle', 'circa': 'circa', 'circasports': 'circa',
        'betmgm': 'betmgm', 'mgm': 'betmgm', 'fanatics': 'fanatics', 'bovada': 'bovada', 'betrivers': 'betrivers', 'rivers': 'betrivers',
        'prizepicks': 'prizepicks', 'underdog': 'underdog', 'underdogfantasy': 'underdog', 'sleeper': 'sleeper'
    };
    const fileName = bookMap[normalized];
    if (fileName) return `<img src="assets/images/books/${fileName}.svg" alt="${bookName}" class="${classes} filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" onerror="this.outerHTML='<span class=\\'font-bold text-white tracking-widest text-[10px]\\'>🏦 ${bookName.toUpperCase()}</span>'">`;
    return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 ${bookName.toUpperCase()}</span>`;
}

function getCryptoLogoCDN(ticker, classes = "w-4 h-4") {
    const cleanTicker = String(ticker).toLowerCase();
    return `<img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${cleanTicker}.svg" alt="${ticker}" class="${classes}" onerror="this.style.display='none'">`;
}

function getSportIcon(sportStr, iconClasses = "w-8 h-8 text-neon opacity-30") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="${iconClasses}"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle></svg>`;
}

function generateTeamLogosHtml(matchName, targetName, sportStr, isTicker = false) {
    const safeMatch = String(matchName || '');
    let team1 = null, team2 = null;

    if (safeMatch.includes('@')) { 
        const parts = safeMatch.split('@');
        team1 = parts[0]; team2 = parts[1];
    } else if (safeMatch.toLowerCase().includes(' vs ')) { 
        const parts = safeMatch.toLowerCase().split(' vs ');
        team1 = parts[0]; team2 = parts[1];
    }

    let logo1 = team1 ? getTeamLogoUrl(team1.trim()) : null;
    let logo2 = team2 ? getTeamLogoUrl(team2.trim()) : null;

    const containerClass = isTicker ? "w-8 h-8 rounded-lg" : "w-14 h-14 rounded-xl";
    const imgClass1 = isTicker ? "top-0.5 left-0.5 w-4 h-4" : "top-0.5 left-0.5 w-8 h-8";
    const imgClass2 = isTicker ? "bottom-0.5 right-0.5 w-4 h-4" : "bottom-0.5 right-0.5 w-8 h-8";
    
    let fallbackIcon = getSportIcon(sportStr, isTicker ? "w-5 h-5 text-neon" : "w-8 h-8 text-neon opacity-30");

    if (logo1 && logo2) {
        return `<div class="relative ${containerClass} bg-white shrink-0 shadow-inner overflow-hidden"><img src="${logo1}" class="absolute ${imgClass1} object-contain z-10" onerror="this.style.display='none'"><img src="${logo2}" class="absolute ${imgClass2} object-contain z-20" onerror="this.style.display='none'"></div>`;
    } else if (logo1 || logo2) {
        return `<div class="${containerClass} bg-white shrink-0 p-1 shadow-inner flex items-center justify-center"><img src="${logo1 || logo2}" class="w-full h-full object-contain" onerror="this.outerHTML='${fallbackIcon.replace(/"/g, '&quot;')}'"></div>`;
    } else if (targetName) {
        let tgtLogo = getTeamLogoUrl(targetName);
        if (tgtLogo) return `<div class="${containerClass} bg-white shrink-0 p-1 shadow-inner flex items-center justify-center"><img src="${tgtLogo}" class="w-full h-full object-contain" onerror="this.outerHTML='${fallbackIcon.replace(/"/g, '&quot;')}'"></div>`;
    }
    return `<div class="${containerClass} bg-black/40 border border-white/10 shrink-0 flex items-center justify-center shadow-inner">${fallbackIcon}</div>`;
}

function formatLargeNumber(num) {
    if (num === null || num === undefined || num === '') return 'TBD';
    const cleanString = String(num).replace(/,/g, '').replace(/\$/g, '').trim();
    const val = parseFloat(cleanString);
    if (isNaN(val) || val === 0) return 'TBD';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return (val / 1e3).toFixed(2) + 'K';
    return val.toLocaleString(undefined, {maximumFractionDigits: 2});
}

// --- 3. BOUNCER & TAB ROUTING ---
async function checkAccess() {
    try {
        if (typeof db === 'undefined') return;
        const { data: { session }, error } = await db.auth.getSession();
        if (error || !session) window.location.replace('login.html');
        else {
            userEmail = session.user.email;
            fetchUserData(); 
        }
    } catch(e) { console.error(e); }
}

async function fetchUserData() {
    try {
        const { data, error } = await db.from('client_keys').select('*').eq('email', userEmail).single();
        if (!error && data && data.tier) { 
            userAccessTier = data.tier.toLowerCase();
            window.sportsApiKey = data.sports_api_key || "";
            window.cryptoApiKey = data.crypto_api_key || "";
        } else { userAccessTier = "none"; } 
        
        applyLocksToSidebar();
        fetchUserApiKey(data); 

        if (userAccessTier === 'crypto') switchTab('crypto-mom', 'crypto');
        else switchTab('sports-ev', 'sports'); 
    } catch(e) { console.error(e); }
}

checkAccess();

function applyLocksToSidebar() {
    if (userAccessTier === 'crypto') document.getElementById('folder-sports').classList.add('hidden');
    else if (userAccessTier === 'sports') document.getElementById('folder-crypto').classList.add('hidden');
    else if (userAccessTier === 'none') {
        document.getElementById('lock-sports').classList.remove('hidden');
        document.getElementById('lock-crypto').classList.remove('hidden');
    }
}

function switchTab(target, category) {
    const tabs = { 
        'sports-ev': document.getElementById('tab-sports-ev'), 
        'sports-arb': document.getElementById('tab-sports-arb'), 
        'sports-dfs': document.getElementById('tab-sports-dfs'), 
        'crypto-mom': document.getElementById('tab-crypto-mom'), 
        'crypto-analysis': document.getElementById('tab-crypto-analysis'), 
        'api': document.getElementById('tab-api') 
    };
    const views = { 
        'sports-ev': document.getElementById('view-sports-ev'), 
        'sports-arb': document.getElementById('view-sports-arb'), 
        'sports-dfs': document.getElementById('view-sports-dfs'), 
        'crypto-mom': document.getElementById('view-crypto-mom'), 
        'crypto-analysis': document.getElementById('view-crypto-analysis'), 
        'api': document.getElementById('view-api'), 
        'locked': document.getElementById('view-locked') 
    };

    currentActiveTab = target;
    if (category === 'sports' && (userAccessTier === 'crypto' || userAccessTier === 'none')) { showLockedState(target, views, tabs); return; }
    if (category === 'crypto' && (userAccessTier === 'sports' || userAccessTier === 'none')) { showLockedState(target, views, tabs); return; }

    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(tabs).forEach(t => { 
        if(!t.classList.contains('hidden')) t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group'; 
    });

    tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-white/10 text-white border border-white/20 shadow-lg flex justify-between items-center group';
    views[target].classList.remove('hidden');

    const ambientSports = document.getElementById('ambient-sports');
    const ambientCrypto = document.getElementById('ambient-crypto');
    const statusPulse = document.getElementById('status-pulse');
    const statusText = document.getElementById('status-text');
    const tickerWrapper = document.getElementById('global-ticker-wrapper');

    if (category === 'sports') {
        ambientCrypto.classList.replace('opacity-100', 'opacity-0');
        ambientSports.classList.replace('opacity-0', 'opacity-100');
        statusPulse.className = 'w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]';
        statusText.innerText = "System Online";
        statusText.className = 'font-mono font-bold text-neon text-[10px] tracking-widest uppercase transition-colors';
        tickerWrapper.classList.remove('hidden');
        
        if(target === 'sports-ev') { updateTicker(lastFetchedSportsEvData, 'sports-ev'); loadLiveTelemetry(true); }
        if(target === 'sports-arb') { updateTicker(lastFetchedSportsArbData, 'sports-arb'); loadArbTelemetry(true); }
        if(target === 'sports-dfs') { updateTicker(lastFetchedSportsDfsData, 'sports-dfs'); loadDfsTelemetry(true); }

    } else if (category === 'crypto' || category === 'api') {
        ambientSports.classList.replace('opacity-100', 'opacity-0');
        ambientCrypto.classList.replace('opacity-0', 'opacity-100');
        statusPulse.className = 'w-2 h-2 rounded-full bg-cyanAccent animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]';
        statusText.innerText = "System Online";
        statusText.className = 'font-mono font-bold text-cyanAccent text-[10px] tracking-widest uppercase transition-colors';
        
        if (category === 'crypto') {
            tickerWrapper.classList.remove('hidden');
            if (target === 'crypto-mom') { 
                updateTicker(lastFetchedCryptoMomData, 'crypto-mom'); 
                loadCryptoRadar(true); 
            }
            if (target === 'crypto-analysis') { 
                updateTicker(lastFetchedCryptoAnalysis, 'crypto-analysis'); 
                loadCryptoAnalysis(true); 
            }
        } else {
            tickerWrapper.classList.add('hidden'); 
        }
    }
}

function showLockedState(targetTab, views, tabs) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(tabs).forEach(t => { 
        if(!t.classList.contains('hidden')) t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group'; 
    });
    tabs[targetTab].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/30 flex justify-between items-center group';
    views.locked.classList.remove('hidden');
    document.getElementById('global-ticker-wrapper').classList.add('hidden');
}

// --- 4. GLOBAL TICKER ENGINE ---
function updateTicker(data, type) {
    const tickerContainer = document.getElementById('ticker-container');
    const wrapper = document.getElementById('global-ticker-wrapper');
    let items = [];

    if (type.startsWith('sports')) {
        wrapper.className = "fixed bottom-0 left-0 w-full bg-black/90 border-t border-neon/30 backdrop-blur-xl overflow-hidden z-50 h-10 flex items-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transition-colors duration-500";
        
        if (!data || data.length === 0) {
            items.push(`<div class="inline-flex items-center gap-4 px-6 text-neon font-bold tracking-widest uppercase text-xs shrink-0">⚡ SYSTEM ONLINE <span class="text-slate-500">|</span> SCANNING MARKET MATRIX <span class="text-slate-500">|</span> AWAITING PULSE...</div>`);
        } else {
            data.slice(0, 10).forEach(edge => {
                let textBlock = "";
                
                const rawTime = String(edge.time_display || edge.telemetry || edge.created_at || "LIVE").toUpperCase();
                let statusTag = "[LIVE]";
                if (rawTime.includes("PRE-MATCH") || rawTime.includes(" AM") || rawTime.includes(" PM") || rawTime.includes("TODAY") || rawTime.includes("TMRW")) {
                    statusTag = "[RADAR]";
                }

                if(type === 'sports-ev') {
                    const ev = parseFloat(edge.ev) ? `+${parseFloat(edge.ev).toFixed(2)}% EV` : "LIVE";
                    const matchName = edge.match_name || "MATCH";
                    const tickerLogos = generateTeamLogosHtml(matchName, edge.target, edge.sport, true);
                    
                    textBlock = `${tickerLogos} <span class="text-neon ml-2">${matchName}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">${edge.target || "TARGET"}</span> <span class="text-slate-500">|</span> <span class="text-neon font-bold">⚡ ${ev}</span>`;
                
                } else if(type === 'sports-arb') {
                    const arb = parseFloat(edge.arb_pct || edge.arb_percentage || edge.arb_percent || 0).toFixed(2);
                    const matchName = edge.match_name || edge.game || "MATCH";
                    const tickerLogos = generateTeamLogosHtml(matchName, null, edge.sport, true);
                    
                    const book1 = edge.book1 || edge.book_1 || edge.bookmaker_1;
                    const book2 = edge.book2 || edge.book_2 || edge.bookmaker_2;
                    
                    textBlock = `${tickerLogos} <span class="text-neon ml-2">${matchName}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">${edge.market || "MARKET"}</span> <span class="text-slate-500">|</span> <span class="text-white">${book1}</span> <span class="text-slate-500">vs</span> <span class="text-white">${book2}</span> <span class="text-slate-500">|</span> <span class="text-neon font-bold">🎯 ${arb}% ARB</span>`;
                
                } else if(type === 'sports-dfs') {
                    const ev = parseFloat(edge.edge_percent || edge.ev || edge.edge || 0).toFixed(2);
                    const platformName = edge.book || edge.platform || edge.bookmaker || "PLATFORM";
                    const tickerLogos = generateTeamLogosHtml(edge.match_name || edge.team, null, edge.sport, true);
                    
                    let rawStat = edge.stat_type || edge.prop_type || edge.market || "PROP";
                    if (typeof rawStat === 'string') {
                        rawStat = rawStat.replace(/^player_/i, '');
                        rawStat = rawStat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    }
                    const line = edge.target || edge.line || edge.prop_line || "";
                    
                    textBlock = `${tickerLogos} <span class="text-neon ml-2">${edge.player_name || edge.player || "PLAYER"}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">${line} ${rawStat}</span> <span class="text-slate-500">|</span> <span class="text-white uppercase">${platformName}</span> <span class="text-slate-500">|</span> <span class="text-neon font-bold">⚡ +${ev}% EDGE</span>`;
                }

                items.push(`<div class="inline-flex items-center gap-3 px-6 font-mono text-xs uppercase tracking-widest whitespace-nowrap shrink-0"><span class="text-white font-black">${statusTag}</span> ${textBlock}</div>`);
            });
        }
    } else if (type.startsWith('crypto')) {
        wrapper.className = "fixed bottom-0 left-0 w-full bg-black/90 border-t border-cyanAccent/30 backdrop-blur-xl overflow-hidden z-50 h-10 flex items-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transition-colors duration-500";
        
        if (!data || data.length === 0) {
            items.push(`<div class="inline-flex items-center gap-4 px-6 text-cyanAccent font-bold tracking-widest uppercase text-xs shrink-0">⚡ SYSTEM ONLINE <span class="text-slate-500">|</span> SCANNING CRYPTO MARKET <span class="text-slate-500">|</span> AWAITING PULSE...</div>`);
        } else {
            data.slice(0, 10).forEach(coin => {
                const asset = coin.clean_asset || "ASSET";
                let statusText = "";
                
                if (coin.adx !== undefined && type === 'crypto-mom') {
                    const isHot = coin.regime_status && coin.regime_status.toUpperCase().includes('HOT');
                    const adx = parseFloat(coin.adx).toFixed(2) || "0.00";
                    let emoji = isHot ? '🟢' : '⚪';
                    statusText = `${emoji} <span class="${isHot ? 'text-cyanAccent' : 'text-slate-400'} font-bold ml-1">ADX: ${adx}</span>`;
                } else if (coin.action) {
                    const isBullish = coin.action.toUpperCase().includes('BUY') || coin.action.toUpperCase().includes('LONG') || (coin.regime_status && coin.regime_status.toUpperCase().includes('UP'));
                    const isBearish = coin.action.toUpperCase().includes('SELL') || coin.action.toUpperCase().includes('SHORT') || (coin.regime_status && coin.regime_status.toUpperCase().includes('DOWN'));
                    
                    let aColor = 'text-slate-400';
                    let emoji = '⚪';
                    if(isBullish) { aColor = 'text-neon'; emoji = '🟢'; }
                    if(isBearish) { aColor = 'text-redAccent'; emoji = '🔴'; }
                    
                    statusText = `${emoji} <span class="${aColor} font-bold ml-1">${coin.action}</span>`;
                }

                const coinLogo = getCryptoLogoCDN(asset, "w-4 h-4 rounded-full bg-slate-800 border border-white/20 shrink-0");

                items.push(`<div class="inline-flex items-center gap-3 px-6 font-mono text-xs uppercase tracking-widest whitespace-nowrap shrink-0"><span class="text-white font-black">[RADAR]</span> <div class="relative w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/20"><span class="text-[6px] font-black text-cyanAccent/50 uppercase tracking-widest absolute z-0">${asset.substring(0,3)}</span>${coinLogo}</div> <span class="text-cyanAccent">${asset}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">$${coin.price || '0.00'}</span> <span class="text-slate-500">|</span> ${statusText}</div>`);
            });
        }
    }

    const rowHtml = items.join(`<span class="text-slate-600 font-bold px-2 shrink-0">•</span>`);
    tickerContainer.innerHTML = `<div class="flex items-center shrink-0 w-max">${rowHtml}<span class="text-slate-600 font-bold px-8 shrink-0">•</span>${rowHtml}</div>`; 
}

// --- 5. SPORTS ENGINES LOGIC ---
document.getElementById('sport-ev-filter').addEventListener('change', (e) => {
    currentSportsEvFilter = e.target.value;
    sportsEvDataHash = ""; 
    renderSportsFeed(lastFetchedSportsEvData, 'sports-ev'); 
});

document.getElementById('sport-arb-filter').addEventListener('change', (e) => {
    currentSportsArbFilter = e.target.value;
    sportsArbDataHash = ""; 
    renderSportsFeed(lastFetchedSportsArbData, 'sports-arb'); 
});

document.getElementById('sport-dfs-filter').addEventListener('change', (e) => {
    currentSportsDfsFilter = e.target.value;
    sportsDfsDataHash = ""; 
    renderSportsFeed(lastFetchedSportsDfsData, 'sports-dfs'); 
});

function createEvCard(edge) {
    try {
        const edgeVal = parseFloat(edge.ev) || 0; 
        const edgeFormatted = `+${edgeVal.toFixed(2)}% EV`;
        let oddsStr = String(edge.odds);
        const odds = (!oddsStr.startsWith('-') && !oddsStr.startsWith('+') && oddsStr !== "undefined" && oddsStr !== "null") ? '+' + oddsStr : oddsStr;
        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        
        const bookLogoBig = getSportsbookLogo(edge.sportsbook);
        const matchName = edge.match_name || "UNKNOWN MATCH";
        const iconHtml = generateTeamLogosHtml(matchName, edge.target, edge.sport, false);

        return `
            <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 relative z-10 w-full">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div class="w-14 h-14 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center shadow-inner shrink-0 p-1">${iconHtml}</div>
                        <div class="min-w-0 flex-1">
                            <h2 class="font-impact text-2xl sm:text-3xl font-black uppercase tracking-wide text-white leading-tight break-words">${matchName}</h2>
                            <p class="text-xs text-neon font-bold tracking-widest mt-1">${edge.telemetry || "PRE-MATCH"}</p>
                        </div>
                    </div>
                    <div class="bg-neon/10 border border-neon/50 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.15)] flex items-center gap-2 shrink-0">
                        <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0"></span>
                        <span class="text-neon font-mono font-bold text-lg tracking-widest">${edgeFormatted}</span>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-t border-white/10 pt-6 relative z-10">
                    
                    <div class="space-y-2 font-mono min-w-0 flex-1 w-full pr-4">
                        <div class="flex items-start gap-3">
                            <span class="text-slate-500 font-bold uppercase tracking-widest text-[10px] w-16 shrink-0 pt-0.5">Target:</span>
                            <span class="text-white font-bold text-sm sm:text-base uppercase break-words leading-tight">${edge.target || "UNKNOWN"}</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="text-slate-500 font-bold uppercase tracking-widest text-[10px] w-16 shrink-0 pt-0.5">Market:</span>
                            <span class="text-slate-300 font-medium text-xs uppercase break-words leading-tight">${edge.market || "UNKNOWN"}</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 mt-4 sm:mt-0 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <span class="text-slate-500 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap">${timestamp}</span>
                        <div class="bg-studio/80 border border-white/10 text-white rounded-lg px-3 py-2 flex items-center shadow-lg min-w-0">
                            <div class="h-5 sm:h-6 flex items-center justify-center shrink-0">${bookLogoBig}</div>
                            <span class="font-heading font-black text-sm uppercase tracking-widest border-l border-white/20 pl-2 ml-2 shrink-0">${odds}</span>
                        </div>
                    </div>

                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

function createArbCard(edge) {
    try {
        const arbVal = parseFloat(edge.arb_pct || edge.arb_percentage || edge.arb_percent || edge.edge || 0); 
        const arbFormatted = `${arbVal.toFixed(2)}% ARB`;
        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        
        const book1Logo = getSportsbookLogo(edge.book1 || edge.book_1 || edge.bookmaker_1);
        const book2Logo = getSportsbookLogo(edge.book2 || edge.book_2 || edge.bookmaker_2);
        
        let odds1Str = String(edge.odds1 || edge.odds_1 || "N/A");
        let odds2Str = String(edge.odds2 || edge.odds_2 || "N/A");
        const odds1 = (!odds1Str.startsWith('-') && !odds1Str.startsWith('+') && odds1Str !== "N/A") ? '+' + odds1Str : odds1Str;
        const odds2 = (!odds2Str.startsWith('-') && !odds2Str.startsWith('+') && odds2Str !== "N/A") ? '+' + odds2Str : odds2Str;

        const matchName = edge.match_name || edge.game || "UNKNOWN MATCH";
        const iconHtml = generateTeamLogosHtml(matchName, null, edge.sport, false);

        const target1Html = edge.target1 ? `<div class="text-white font-bold text-xs uppercase tracking-wider mb-1 leading-tight break-words" title="${edge.target1}">${edge.target1}</div>` : '';
        const target2Html = edge.target2 ? `<div class="text-white font-bold text-xs uppercase tracking-wider mb-1 leading-tight break-words" title="${edge.target2}">${edge.target2}</div>` : '';

        return `
            <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 border-b border-white/10 pb-6 relative z-10 w-full">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div class="w-14 h-14 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center shadow-inner shrink-0 p-1">${iconHtml}</div>
                        <div class="min-w-0 flex-1">
                            <h2 class="font-impact text-xl sm:text-2xl font-black uppercase tracking-wide text-white leading-tight break-words">${matchName}</h2>
                            <p class="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">${edge.market || edge.bet_type || "UNKNOWN MARKET"}</p>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="bg-neon/10 border border-neon/50 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.15)] flex items-center gap-2 inline-flex">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0"></span>
                            <span class="text-neon font-mono font-bold text-lg tracking-widest">${arbFormatted}</span>
                        </div>
                        <p class="text-[10px] text-slate-500 font-mono mt-2 tracking-widest uppercase block">${timestamp}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 relative z-10 items-stretch flex-grow">
                    <div class="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-full w-full overflow-hidden">
                        <div class="flex flex-col gap-1 min-w-0 mb-3">
                            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Leg 1</span>
                            ${target1Html}
                        </div>
                        <div class="flex justify-between items-end mt-auto gap-2">
                            <div class="flex items-center justify-start overflow-hidden shrink-0">${book1Logo}</div>
                            <span class="font-heading font-black text-lg sm:text-xl text-white tracking-widest shrink-0 text-right">${odds1}</span>
                        </div>
                    </div>
                    <div class="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-full w-full overflow-hidden">
                        <div class="flex flex-col gap-1 min-w-0 mb-3">
                            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Leg 2</span>
                            ${target2Html}
                        </div>
                        <div class="flex justify-between items-end mt-auto gap-2">
                            <div class="flex items-center justify-start overflow-hidden shrink-0">${book2Logo}</div>
                            <span class="font-heading font-black text-lg sm:text-xl text-white tracking-widest shrink-0 text-right">${odds2}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

function createDfsCard(edge) {
    try {
        const edgeVal = parseFloat(edge.edge_percent || edge.ev || edge.edge || 0); 
        const edgeFormatted = `+${edgeVal.toFixed(2)}% EDGE`;
        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        
        const playerName = edge.player_name || edge.player || "UNKNOWN PLAYER";
        
        let rawStat = edge.stat_type || edge.prop_type || edge.market || "PROP";
        if (typeof rawStat === 'string') {
            rawStat = rawStat.replace(/^player_/i, '');
            rawStat = rawStat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        }
        
        const line = edge.target || edge.line || edge.prop_line || "N/A";
        const side = edge.side || edge.over_under || "OVER";
        const platformLogo = getSportsbookLogo(edge.book || edge.platform || edge.bookmaker);
        const isOver = side.toUpperCase().includes('OVER');
        const sideColor = isOver ? 'text-cyanAccent' : 'text-redAccent';
        const iconHtml = generateTeamLogosHtml(edge.match_name || edge.team, null, edge.sport, false);

        return `
            <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-between h-full">
                <div class="flex justify-between items-start mb-6 relative z-10 w-full">
                    <div class="flex items-center gap-4 min-w-0 pr-4">
                        <div class="w-14 h-14 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center shadow-inner shrink-0 p-1">${iconHtml}</div>
                        <div class="min-w-0">
                            <h2 class="font-impact text-2xl font-black uppercase tracking-wide text-white leading-tight break-words">${playerName}</h2>
                            <p class="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">${edge.match_name || edge.team || "UNKNOWN MATCH"}</p>
                        </div>
                    </div>
                    <div class="bg-studio/80 border border-white/10 rounded-lg p-2 shrink-0 shadow-lg flex items-center justify-center overflow-hidden">
                        ${platformLogo}
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-5 relative z-10 flex-grow flex flex-col justify-end">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Prop Line</span>
                            <span class="font-mono text-xl font-black text-white">${line} ${rawStat}</span>
                        </div>
                        <div class="text-right">
                            <span class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target</span>
                            <span class="font-heading text-xl font-black uppercase tracking-widest ${sideColor}">${side}</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-3">
                        <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">${timestamp}</span>
                        <div class="flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0"></span>
                            <span class="text-neon font-mono font-bold text-sm tracking-widest">${edgeFormatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

function renderSportsFeed(data, type) {
    let container, createFn, currentFilter;
    if(type === 'sports-ev') { container = document.getElementById('sports-ev-feed-container'); createFn = createEvCard; currentFilter = currentSportsEvFilter; }
    if(type === 'sports-arb') { container = document.getElementById('sports-arb-feed-container'); createFn = createArbCard; currentFilter = currentSportsArbFilter; }
    if(type === 'sports-dfs') { container = document.getElementById('sports-dfs-feed-container'); createFn = createDfsCard; currentFilter = currentSportsDfsFilter; }

    if (!container) return;
    const safeData = Array.isArray(data) ? data : [];

    // FIXED: Ghost Filter relaxes DFS rules to ensure it loads
    const activeData = safeData.filter(edge => {
        try {
            if (type === 'sports-dfs') {
                const pName = String(edge.player_name || edge.player || '').toUpperCase();
                if (!pName || pName === 'N/A' || pName === 'UNKNOWN PLAYER' || pName === 'NULL') return false;
                const val = parseFloat(edge.edge_percent || edge.edge_pct || edge.ev || edge.edge || edge.value || 0);
                if (isNaN(val) || val <= 0.001) return false;
                return true; 
            }
            
            const mName = String(edge.match_name || edge.game || edge.team || '').toUpperCase();
            if (!mName || mName === 'N/A' || mName === 'UNKNOWN MATCH' || mName === 'NULL') return false;
            
            let val = 0;
            if (type === 'sports-arb') val = parseFloat(edge.arb_pct || edge.arb_percentage || edge.arb_percent || edge.edge || 0);
            if (type === 'sports-ev') val = parseFloat(edge.ev || 0);
            if (isNaN(val) || val <= 0.001) return false;
            return true;
        } catch(e) { return false; }
    });

    // FIXED: Omni-Search Fuzzy Match guarantees filter works without strict db formatting
    const filteredData = (currentFilter !== 'all') ? activeData.filter(edge => {
        const searchStr = (String(edge.sport || '') + ' ' + String(edge.match_name || edge.game || edge.team || '')).toLowerCase();
        
        if (currentFilter === 'baseball_mlb' && (searchStr.includes('mlb') || searchStr.includes('baseball'))) return true;
        if (currentFilter === 'basketball_nba' && (searchStr.includes('nba') || searchStr.includes('basketball'))) return true;
        if (currentFilter === 'football_nfl' && (searchStr.includes('nfl') || searchStr.includes('football'))) return true;
        if (currentFilter === 'hockey_nhl' && (searchStr.includes('nhl') || searchStr.includes('hockey'))) return true;
        
        return false;
    }) : activeData;

    if (currentActiveTab === type) updateTicker(filteredData, type); 

    if (filteredData.length === 0) {
        container.innerHTML = `<div class="col-span-full border border-dashed border-white/20 bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center shadow-lg"><span class="text-neon font-mono font-bold tracking-widest uppercase animate-pulse">SYSTEM ONLINE: AWAITING DISCREPANCIES...</span></div>`;
        return;
    }
    container.innerHTML = filteredData.map(edge => createFn(edge)).join('');
}

// EV Engine
async function loadLiveTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-ev') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('ev_live_data').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        const currentDataHash = data ? data.map(d => d.id).join('') : "";
        if (!isInitialLoad && currentDataHash === sportsEvDataHash) return; 

        if (isInitialLoad) {
            document.getElementById('loading-state-sports-ev').classList.add('hidden');
            document.getElementById('sports-ev-feed-container').classList.remove('hidden');
        }
        sportsEvDataHash = currentDataHash;
        lastFetchedSportsEvData = data || [];
        renderSportsFeed(lastFetchedSportsEvData, 'sports-ev');
    } catch (err) { console.error("EV Fetch error:", err); }
}

// Arb Engine
async function loadArbTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-arb') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('arbitrage_live_data').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        const currentDataHash = data ? data.map(d => d.id).join('') : "";
        if (!isInitialLoad && currentDataHash === sportsArbDataHash) return; 

        if (isInitialLoad) {
            document.getElementById('loading-state-sports-arb').classList.add('hidden');
            document.getElementById('sports-arb-feed-container').classList.remove('hidden');
        }
        sportsArbDataHash = currentDataHash;
        lastFetchedSportsArbData = data || [];
        renderSportsFeed(lastFetchedSportsArbData, 'sports-arb');
    } catch (err) { console.error("Arb Fetch error:", err); }
}

// DFS Engine
async function loadDfsTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-dfs') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('dfs_live_data').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        const currentDataHash = data ? data.map(d => d.id).join('') : "";
        if (!isInitialLoad && currentDataHash === sportsDfsDataHash) return; 

        if (isInitialLoad) {
            document.getElementById('loading-state-sports-dfs').classList.add('hidden');
            document.getElementById('sports-dfs-feed-container').classList.remove('hidden');
        }
        sportsDfsDataHash = currentDataHash;
        lastFetchedSportsDfsData = data || [];
        renderSportsFeed(lastFetchedSportsDfsData, 'sports-dfs');
    } catch (err) { console.error("DFS Fetch error:", err); }
}

// --- 6. CRYPTO ENGINES LOGIC ---
document.getElementById('crypto-mom-filter').addEventListener('change', (e) => {
    currentCryptoMomFilter = e.target.value;
    cryptoMomDataHash = ""; 
    loadCryptoRadar(false); 
});

document.getElementById('crypto-analysis-filter').addEventListener('change', (e) => {
    currentCryptoAnalysisFilter = e.target.value;
    cryptoAnalysisHash = ""; 
    loadCryptoAnalysis(false); 
});

async function loadCryptoRadar(isInitialLoad = false) {
    if (currentActiveTab !== 'crypto-mom') return;
    const container = document.getElementById('crypto-mom-feed-container');
    const loader = document.getElementById('loading-state-crypto-mom');

    try {
        if (typeof db === 'undefined') return;
        let query = db.from('crypto_telemetry').select('*');
        
        if (currentCryptoMomFilter === 'adx') query = query.order('adx', { ascending: false }).limit(200);
        else if (currentCryptoMomFilter === 'alpha') query = query.order('asset', { ascending: true }).limit(200);
        else if (currentCryptoMomFilter === 'price_desc') query = query.order('price', { ascending: false }).limit(200);
        else if (currentCryptoMomFilter === 'market_cap') query = query.order('market_cap', { ascending: false, nullsFirst: false }).limit(200);
        else if (currentCryptoMomFilter === 'volume') query = query.order('volume_24h', { ascending: false, nullsFirst: false }).limit(200);

        const { data, error } = await query;
        if (error) throw error;

        const seenTickers = new Set();
        const fiatAndStables = new Set(['EUR', 'GBP', 'USD', 'USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'USDP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNH']);
        const uniqueData = [];

        if (data) {
            data.forEach(coin => {
                let rawName = coin.asset || 'UNKNOWN';
                let ticker = rawName.toUpperCase();
                let fullName = rawName; 
                if (ticker.includes('(') && ticker.includes(')')) {
                    ticker = ticker.substring(ticker.indexOf('(') + 1, ticker.indexOf(')')).trim();
                    fullName = rawName.substring(0, rawName.indexOf('(')).trim();
                }
                if (!seenTickers.has(ticker) && !fiatAndStables.has(ticker)) {
                    seenTickers.add(ticker);
                    coin.clean_asset = ticker; 
                    coin.full_name = fullName; 
                    uniqueData.push(coin);
                }
            });
        }

        let displayData = uniqueData;
        if (currentCryptoMomFilter === 'adx' || currentCryptoMomFilter === 'price_desc' || currentCryptoMomFilter === 'market_cap' || currentCryptoMomFilter === 'volume') {
            displayData = uniqueData.slice(0, 50); 
        }

        const currentDataHash = displayData.map(d => d.clean_asset + d.price).join('');
        if (!isInitialLoad && currentDataHash === cryptoMomDataHash) return;

        if (isInitialLoad) {
            loader.classList.add('hidden');
            container.classList.remove('hidden');
        }

        cryptoMomDataHash = currentDataHash;
        lastFetchedCryptoMomData = displayData; 

        if (currentActiveTab === 'crypto-mom') {
            updateTicker(lastFetchedCryptoMomData, 'crypto-mom'); 
        }

        container.innerHTML = '';
        displayData.forEach(coin => {
            const isHot = coin.regime_status && coin.regime_status.toUpperCase().includes('HOT');
            const statusColor = isHot ? 'text-brand' : 'text-slate-400';
            const borderGlow = isHot ? 'border-brand/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/10';
            let formatVol = formatLargeNumber(coin.volume_24h);
            if (formatVol !== 'TBD') formatVol = '$' + formatVol;
            let formatCap = formatLargeNumber(coin.market_cap);
            if (formatCap !== 'TBD') formatCap = '$' + formatCap;
            const logoHtml = getCryptoLogoCDN(coin.clean_asset, "absolute inset-0 w-full h-full object-cover z-10");

            container.innerHTML += `
                <div class="bg-white/5 backdrop-blur-md border ${borderGlow} rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 w-full">
                    <div class="flex flex-col xl:flex-row items-start xl:items-center gap-6 w-full">
                        <div class="flex items-center gap-4 w-full xl:w-56 shrink-0">
                            <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-white/20 relative shadow-inner">
                                <span class="text-[10px] font-black text-cyanAccent/50 uppercase tracking-widest absolute z-0">${coin.clean_asset.substring(0,3)}</span>
                                ${logoHtml}
                            </div>
                            <div class="flex flex-col justify-center min-w-0">
                                <h3 class="font-impact text-2xl font-black text-white uppercase tracking-widest leading-none truncate">${coin.clean_asset}</h3>
                                <span class="text-[10px] text-slate-500 font-mono tracking-widest uppercase truncate mt-1 w-full block" title="${coin.full_name}">${coin.full_name}</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 md:flex md:flex-wrap lg:grid lg:grid-cols-5 gap-3 lg:gap-4 w-full flex-grow border-t border-b border-white/5 xl:border-none py-4 xl:py-0 my-2 xl:my-0">
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">Mark Price</span><span class="text-white font-bold font-mono text-[10px] sm:text-xs truncate block">$${coin.price}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">80H Floor</span><span class="text-red-400 font-bold font-mono text-[10px] sm:text-xs truncate block">$${coin.floor_80h || 'N/A'}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">80H Ceiling</span><span class="text-cyanAccent font-bold font-mono text-[10px] sm:text-xs truncate block">$${coin.ceiling_80h || 'N/A'}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">24H Volume</span><span class="text-slate-300 font-bold font-mono text-[10px] sm:text-xs truncate block">${formatVol}</span></div>
                            <div class="min-w-0 pr-2"><span class="text-slate-500 block text-[10px] uppercase mb-1 truncate">Market Cap</span><span class="text-slate-300 font-bold font-mono text-[10px] sm:text-xs truncate block">${formatCap}</span></div>
                        </div>
                        <div class="w-full xl:w-48 shrink-0 flex flex-row xl:flex-col justify-between xl:justify-center items-center xl:items-end gap-2">
                            <span class="${statusColor} font-mono font-bold text-[10px] sm:text-xs uppercase tracking-widest whitespace-normal break-words text-left xl:text-right leading-tight max-w-[150px] xl:max-w-full">${coin.regime_status || 'NEUTRAL'}</span>
                            <div class="bg-black/40 px-4 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 shrink-0">
                                <span class="text-slate-500 font-bold uppercase text-[10px]">ADX:</span>
                                <span class="${isHot ? 'text-cyanAccent' : 'text-white'} font-black font-mono text-base">${parseFloat(coin.adx).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) { console.error("Crypto Mom Fetch error:", err); }
}

// FIXED: Client-Side Sorting to prevent Supabase Index timeout
async function loadCryptoAnalysis(isInitialLoad = false) {
    if (currentActiveTab !== 'crypto-analysis') return;
    const container = document.getElementById('crypto-analysis-feed-container');
    const loader = document.getElementById('loading-state-crypto-analysis');

    try {
        if (typeof db === 'undefined') return;
        
        let query = db.from('market_analysis').select('*');
        const { data, error } = await query;
        if (error) throw error;

        const currentDataHash = data ? data.map(d => d.id || d.coin).join('') : "";
        if (!isInitialLoad && currentDataHash === cryptoAnalysisHash) return;

        if (isInitialLoad) {
            loader.classList.add('hidden');
            container.classList.remove('hidden');
        }

        cryptoAnalysisHash = currentDataHash;
        let processedData = data || [];

        processedData.forEach(d => {
            const rawCoin = d.coin || "UNKNOWN";
            let ticker = rawCoin.toUpperCase();
            if (ticker.includes('(') && ticker.includes(')')) {
                ticker = ticker.substring(ticker.indexOf('(') + 1, ticker.indexOf(')')).trim();
            }
            d.clean_asset = ticker;
            d.price = d.mark_price;
            d.regime_status = d.status;
        });

        if (currentCryptoAnalysisFilter === 'adx') {
            processedData.sort((a, b) => parseFloat(b.adx || 0) - parseFloat(a.adx || 0));
        } else if (currentCryptoAnalysisFilter === 'price_desc') {
            processedData.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        } else if (currentCryptoAnalysisFilter === 'alpha') {
            processedData.sort((a, b) => (a.clean_asset || '').localeCompare(b.clean_asset || ''));
        }

        lastFetchedCryptoAnalysis = processedData.slice(0, 50); 

        if (currentActiveTab === 'crypto-analysis') {
            updateTicker(lastFetchedCryptoAnalysis, 'crypto-analysis'); 
        }

        container.innerHTML = '';

        if (!lastFetchedCryptoAnalysis || lastFetchedCryptoAnalysis.length === 0) {
            container.innerHTML = `<div class="border border-dashed border-white/20 bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center"><span class="text-cyanAccent font-mono font-bold tracking-widest uppercase animate-pulse">AWAITING REGIME DATA...</span></div>`;
            return;
        }

        lastFetchedCryptoAnalysis.forEach(item => {
            const coin = item.coin || "UNKNOWN";
            const status = item.status || "NEUTRAL";
            const action = item.action || "WAIT";
            const adx = parseFloat(item.adx || 0).toFixed(2);
            const price = item.mark_price || "0.00";
            
            const isBullish = action.toUpperCase().includes('BUY') || action.toUpperCase().includes('LONG') || status.toUpperCase().includes('UP');
            const isBearish = action.toUpperCase().includes('SELL') || action.toUpperCase().includes('SHORT') || status.toUpperCase().includes('DOWN');
            
            let actionColor = 'text-slate-400 bg-slate-800/50 border-slate-700';
            if (isBullish) actionColor = 'text-neon bg-neon/10 border-neon/30';
            if (isBearish) actionColor = 'text-redAccent bg-redAccent/10 border-redAccent/30';

            const logoHtml = getCryptoLogoCDN(item.clean_asset, "absolute inset-0 w-full h-full object-cover z-10");

            container.innerHTML += `
                <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div class="flex items-center gap-4 min-w-[150px] shrink-0">
                        <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-white/20 relative shadow-inner">
                            <span class="text-[8px] font-black text-cyanAccent/50 uppercase tracking-widest absolute z-0">${item.clean_asset.substring(0,3)}</span>
                            ${logoHtml}
                        </div>
                        <div>
                            <h3 class="font-impact text-xl font-black text-white uppercase tracking-widest leading-none">${coin}</h3>
                            <span class="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1 block">$${price}</span>
                        </div>
                    </div>
                    <div class="flex gap-6 w-full md:w-auto shrink-0 border-y border-white/5 md:border-none py-3 md:py-0">
                        <div>
                            <span class="text-slate-500 block text-[10px] uppercase mb-1">Status</span>
                            <span class="text-white font-bold font-mono text-xs sm:text-sm uppercase tracking-widest whitespace-normal break-words leading-tight max-w-[100px] sm:max-w-full block">${status}</span>
                        </div>
                        <div>
                            <span class="text-slate-500 block text-[10px] uppercase mb-1">ADX</span>
                            <span class="text-cyanAccent font-bold font-mono text-sm tracking-widest">${adx}</span>
                        </div>
                    </div>
                    <div class="w-full md:flex-1 md:max-w-lg">
                        <div class="p-3 rounded-lg border ${actionColor} font-mono text-[10px] md:text-xs uppercase tracking-wide shadow-inner whitespace-normal break-words leading-relaxed text-left h-full flex items-center">
                            ${action}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) { console.error("Crypto Analysis Fetch error:", err); }
}

        // --- 7. DEVELOPER VAULT LOGIC ---
        async function fetchUserApiKey(data) {
            const apiContainer = document.getElementById('api-key-container');
            if(!apiContainer || !data) return;
            
            try {
                const currentTier = (data.tier || 'none').toLowerCase();
                let htmlOutput = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mt-4">`;

                if (currentTier === 'sports' || currentTier === 'both') {
                    htmlOutput += `
                        <div class="bg-black/50 border border-neon/30 rounded-xl p-6 shadow-lg flex flex-col justify-between">
                            <div>
                                <p class="text-xs text-neon font-bold uppercase tracking-widest mb-1">Sports Telemetry Key</p>
                                <p class="text-[10px] text-slate-500 font-mono mb-4">Grants access to +EV Edge Ledger endpoints.</p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <code id="sports-key-text" class="bg-background px-4 py-3 rounded-lg text-neon text-sm border border-white/10 select-all font-mono break-all">${data.sports_api_key || 'AWAITING GENERATION...'}</code>
                                <button onclick="navigator.clipboard.writeText(document.getElementById('sports-key-text').innerText); alert('Sports API Key Copied!');" class="bg-white/10 hover:bg-neon/20 hover:text-neon hover:border-neon px-6 py-3 rounded-lg font-bold text-white transition-all uppercase text-xs tracking-widest border border-white/10 text-center">Copy Key</button>
                            </div>
                        </div>`;
                } else {
                    htmlOutput += `
                        <div class="bg-black/50 border border-white/10 rounded-xl p-6 shadow-lg flex flex-col justify-center items-center text-center opacity-50 grayscale">
                            <span class="text-3xl mb-2">🔒</span>
                            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Sports API Locked</p>
                        </div>`;
                }

                if (currentTier === 'crypto' || currentTier === 'both') {
                    htmlOutput += `
                        <div class="bg-black/50 border border-cyanAccent/30 rounded-xl p-6 shadow-lg flex flex-col justify-between">
                            <div>
                                <p class="text-xs text-cyanAccent font-bold uppercase tracking-widest mb-1">Crypto Radar Key</p>
                                <p class="text-[10px] text-slate-500 font-mono mb-4">Grants access to live momentum scraping endpoints.</p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <code id="crypto-key-text" class="bg-background px-4 py-3 rounded-lg text-cyanAccent text-sm border border-white/10 select-all font-mono break-all">${data.crypto_api_key || 'AWAITING GENERATION...'}</code>
                                <button onclick="navigator.clipboard.writeText(document.getElementById('crypto-key-text').innerText); alert('Crypto API Key Copied!');" class="bg-white/10 hover:bg-cyanAccent/20 hover:text-cyanAccent hover:border-cyanAccent px-6 py-3 rounded-lg font-bold text-white transition-all uppercase text-xs tracking-widest border border-white/10 text-center">Copy Key</button>
                            </div>
                        </div>`;
                } else {
                    htmlOutput += `
                        <div class="bg-black/50 border border-white/10 rounded-xl p-6 shadow-lg flex flex-col justify-center items-center text-center opacity-50 grayscale">
                            <span class="text-3xl mb-2">🔒</span>
                            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Crypto API Locked</p>
                        </div>`;
                }

                htmlOutput += `</div>`;
                apiContainer.innerHTML = htmlOutput;

            } catch(e) {
                console.error("Vault Error:", e);
                apiContainer.innerHTML = `<p class="text-xs text-red-400 font-mono tracking-widest">Error establishing secure vault connection.</p>`;
            }
        }

        // --- 8. INITIALIZATION ---
        window.onload = () => {
            // FIXED: Polling slowed down to 30 seconds to completely prevent UI flicker
            setInterval(() => { if (currentActiveTab === 'sports-ev') loadLiveTelemetry(false); }, 30000); 
            setInterval(() => { if (currentActiveTab === 'sports-arb') loadArbTelemetry(false); }, 30000); 
            setInterval(() => { if (currentActiveTab === 'sports-dfs') loadDfsTelemetry(false); }, 30000); 
            setInterval(() => { if (currentActiveTab === 'crypto-mom') loadCryptoRadar(false); }, 300000); 
            setInterval(() => { if (currentActiveTab === 'crypto-analysis') loadCryptoAnalysis(false); }, 300000); 
        };

    </script>
</body>
</html>
