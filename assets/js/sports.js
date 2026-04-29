// assets/js/sports.js

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

let currentActiveTab = ""; 

// --- TEAM LOGOS ---
function getTeamLogoUrl(teamName) {
    if (!teamName) return null;
    
    // NEW: Smart-strip spreads and totals from the end of the string (e.g., " +1.5" or " 215.5") 
    // This preserves teams like the "49ers" but cleans the target for the logo dictionary.
    const cleanName = String(teamName).replace(/\s*[+-]?\d+(\.\d+)?\s*$/, '');
    
    const normalized = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const megaMap = {
        // NFL
        'arizonacardinals': {a:'ari', s:'nfl'}, 'atlantafalcons': {a:'atl', s:'nfl'}, 'baltimoreravens': {a:'bal', s:'nfl'}, 'buffalobills': {a:'buf', s:'nfl'}, 'carolinapanthers': {a:'car', s:'nfl'}, 'chicagobears': {a:'chi', s:'nfl'}, 'cincinnatibengals': {a:'cin', s:'nfl'}, 'clevelandbrowns': {a:'cle', s:'nfl'}, 'dallascowboys': {a:'dal', s:'nfl'}, 'denverbroncos': {a:'den', s:'nfl'}, 'detroitlions': {a:'det', s:'nfl'}, 'greenbaypackers': {a:'gb', s:'nfl'}, 'houstontexans': {a:'hou', s:'nfl'}, 'indianapoliscolts': {a:'ind', s:'nfl'}, 'jacksonvillejaguars': {a:'jax', s:'nfl'}, 'kansascitychiefs': {a:'kc', s:'nfl'}, 'lasvegasraiders': {a:'lv', s:'nfl'}, 'losangeleschargers': {a:'lac', s:'nfl'}, 'losangelesrams': {a:'lar', s:'nfl'}, 'miamidolphins': {a:'mia', s:'nfl'}, 'minnesotavikings': {a:'min', s:'nfl'}, 'newenglandpatriots': {a:'ne', s:'nfl'}, 'neworleanssaints': {a:'no', s:'nfl'}, 'newyorkgiants': {a:'nyg', s:'nfl'}, 'newyorkjets': {a:'nyj', s:'nfl'}, 'philadelphiaeagles': {a:'phi', s:'nfl'}, 'pittsburghsteelers': {a:'pit', s:'nfl'}, 'sanfrancisco49ers': {a:'sf', s:'nfl'}, 'seattleseahawks': {a:'sea', s:'nfl'}, 'tampabaybuccaneers': {a:'tb', s:'nfl'}, 'tennesseetitans': {a:'ten', s:'nfl'}, 'washingtoncommanders': {a:'was', s:'nfl'},
        // NBA
        'atlantahawks': {a:'atl', s:'nba'}, 'bostonceltics': {a:'bos', s:'nba'}, 'brooklynnets': {a:'bkn', s:'nba'}, 'charlottehornets': {a:'cha', s:'nba'}, 'chicagobulls': {a:'chi', s:'nba'}, 'clevelandcavaliers': {a:'cle', s:'nba'}, 'dallasmavericks': {a:'dal', s:'nba'}, 'denvernuggets': {a:'den', s:'nba'}, 'detroitpistons': {a:'det', s:'nba'}, 'goldenstatewarriors': {a:'gsw', s:'nba'}, 'houstonrockets': {a:'hou', s:'nba'}, 'indianapacers': {a:'ind', s:'nba'}, 'laclippers': {a:'lac', s:'nba'}, 'losangelesclippers': {a:'lac', s:'nba'}, 'losangeleslakers': {a:'lal', s:'nba'}, 'memphisgrizzlies': {a:'mem', s:'nba'}, 'miamiheat': {a:'mia', s:'nba'}, 'milwaukeebucks': {a:'mil', s:'nba'}, 'minnesotatimberwolves': {a:'min', s:'nba'}, 'neworleanspelicans': {a:'nop', s:'nba'}, 'newyorkknicks': {a:'nyk', s:'nba'}, 'oklahomacitythunder': {a:'okc', s:'nba'}, 'orlandomagic': {a:'orl', s:'nba'}, 'philadelphia76ers': {a:'phi', s:'nba'}, 'phoenixsuns': {a:'phx', s:'nba'}, 'portlandtrailblazers': {a:'por', s:'nba'}, 'sacramentokings': {a:'sac', s:'nba'}, 'sanantoniospurs': {a:'sas', s:'nba'}, 'torontoraptors': {a:'tor', s:'nba'}, 'utahjazz': {a:'uta', s:'nba'}, 'washingtonwizards': {a:'was', s:'nba'},
        // MLB
        'ari': {a:'ari', s:'mlb'}, 'arizonadiamondbacks': {a:'ari', s:'mlb'}, 'atl': {a:'atl', s:'mlb'}, 'atlantabraves': {a:'atl', s:'mlb'}, 'bal': {a:'bal', s:'mlb'}, 'baltimoreorioles': {a:'bal', s:'mlb'}, 'bos': {a:'bos', s:'mlb'}, 'bostonredsox': {a:'bos', s:'mlb'}, 'chc': {a:'chc', s:'mlb'}, 'chicagocubs': {a:'chc', s:'mlb'}, 'cws': {a:'cws', s:'mlb'}, 'chicagowhitesox': {a:'cws', s:'mlb'}, 'cin': {a:'cin', s:'mlb'}, 'cincinnatireds': {a:'cin', s:'mlb'}, 'cle': {a:'cle', s:'mlb'}, 'clevelandguardians': {a:'cle', s:'mlb'}, 'col': {a:'col', s:'mlb'}, 'coloradorockies': {a:'col', s:'mlb'}, 'det': {a:'det', s:'mlb'}, 'detroittigers': {a:'det', s:'mlb'}, 'hou': {a:'hou', s:'mlb'}, 'houstonastros': {a:'hou', s:'mlb'}, 'kc': {a:'kc', s:'mlb'}, 'kansascityroyals': {a:'kc', s:'mlb'}, 'laa': {a:'laa', s:'mlb'}, 'losangelesangels': {a:'laa', s:'mlb'}, 'lad': {a:'lad', s:'mlb'}, 'losangelesdodgers': {a:'lad', s:'mlb'}, 'mia': {a:'mia', s:'mlb'}, 'miamimarlins': {a:'mia', s:'mlb'}, 'mil': {a:'mil', s:'mlb'}, 'milwaukeebrewers': {a:'mil', s:'mlb'}, 'min': {a:'min', s:'mlb'}, 'minnesotatwins': {a:'min', s:'mlb'}, 'nym': {a:'nym', s:'mlb'}, 'newyorkmets': {a:'nym', s:'mlb'}, 'nyy': {a:'nyy', s:'mlb'}, 'newyorkyankees': {a:'nyy', s:'mlb'}, 'oak': {a:'oak', s:'mlb'}, 'oaklandathletics': {a:'oak', s:'mlb'}, 'phi': {a:'phi', s:'mlb'}, 'philadelphiaphillies': {a:'phi', s:'mlb'}, 'pit': {a:'pit', s:'mlb'}, 'pittsburghpirates': {a:'pit', s:'mlb'}, 'sd': {a:'sd', s:'mlb'}, 'sandiegopadres': {a:'sd', s:'mlb'}, 'sf': {a:'sf', s:'mlb'}, 'sanfranciscogiants': {a:'sf', s:'mlb'}, 'sea': {a:'sea', s:'mlb'}, 'seattlemariners': {a:'sea', s:'mlb'}, 'stl': {a:'stl', s:'mlb'}, 'stlouiscardinals': {a:'stl', s:'mlb'}, 'tb': {a:'tb', s:'mlb'}, 'tampabayrays': {a:'tb', s:'mlb'}, 'tex': {a:'tex', s:'mlb'}, 'texasrangers': {a:'tex', s:'mlb'}, 'tor': {a:'tor', s:'mlb'}, 'torontobluejays': {a:'tor', s:'mlb'}, 'was': {a:'was', s:'mlb'}, 'washingtonnationals': {a:'was', s:'mlb'},
        // NHL
        'anaheimducks': {a:'ana', s:'nhl'}, 'bostonbruins': {a:'bos', s:'nhl'}, 'buffalosabres': {a:'buf', s:'nhl'}, 'calgaryflames': {a:'cgy', s:'nhl'}, 'carolinahurricanes': {a:'car', s:'nhl'}, 'chicagoblackhawks': {a:'chi', s:'nhl'}, 'coloradoavalanche': {a:'col', s:'nhl'}, 'columbusbluejackets': {a:'cbj', s:'nhl'}, 'dallasstars': {a:'dal', s:'nhl'}, 'detroitredwings': {a:'det', s:'nhl'}, 'edmontonoilers': {a:'edm', s:'nhl'}, 'floridapanthers': {a:'fla', s:'nhl'}, 'losangeleskings': {a:'lak', s:'nhl'}, 'minnesotawild': {a:'min', s:'nhl'}, 'montrealcanadiens': {a:'mtl', s:'nhl'}, 'nashvillepredators': {a:'nsh', s:'nhl'}, 'newjerseydevils': {a:'njd', s:'nhl'}, 'newyorkislanders': {a:'nyi', s:'nhl'}, 'newyorkrangers': {a:'nyr', s:'nhl'}, 'ottawasenators': {a:'ott', s:'nhl'}, 'philadelphiaflyers': {a:'phi', s:'nhl'}, 'pittsburghpenguins': {a:'pit', s:'nhl'}, 'sanjosesharks': {a:'sjs', s:'nhl'}, 'seattlekraken': {a:'sea', s:'nhl'}, 'stlouisblues': {a:'stl', s:'nhl'}, 'tampabaylightning': {a:'tbl', s:'nhl'}, 'torontomapleleafs': {a:'tor', s:'nhl'}, 'vancouvercanucks': {a:'van', s:'nhl'}, 'vegasgoldenknights': {a:'vgk', s:'nhl'}, 'washingtoncapitals': {a:'wsh', s:'nhl'}, 'winnipegjets': {a:'wpg', s:'nhl'}
    };
    
    const match = megaMap[normalized];
    if (match) return `https://a.espncdn.com/i/teamlogos/${match.s}/500/${match.a}.png`;
    return null;
}

// Helper to auto-detect sport for filters
function detectSport(text) {
    if (!text) return 'unknown';
    const s = String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
    const mlb = ['mlb', 'baseball', 'diamondbacks', 'braves', 'orioles', 'redsox', 'cubs', 'whitesox', 'reds', 'guardians', 'rockies', 'tigers', 'astros', 'royals', 'angels', 'dodgers', 'marlins', 'brewers', 'twins', 'mets', 'yankees', 'athletics', 'phillies', 'pirates', 'padres', 'giants', 'mariners', 'cardinals', 'rays', 'rangers', 'bluejays', 'nationals'];
    const nba = ['nba', 'basketball', 'hawks', 'celtics', 'nets', 'hornets', 'bulls', 'cavaliers', 'mavericks', 'nuggets', 'pistons', 'warriors', 'rockets', 'pacers', 'clippers', 'lakers', 'grizzlies', 'heat', 'bucks', 'timberwolves', 'pelicans', 'knicks', 'thunder', 'magic', '76ers', 'suns', 'trailblazers', 'kings', 'spurs', 'raptors', 'jazz', 'wizards'];
    const nfl = ['nfl', 'football', 'cardinals', 'falcons', 'ravens', 'bills', 'panthers', 'bears', 'bengals', 'browns', 'cowboys', 'broncos', 'lions', 'packers', 'texans', 'colts', 'jaguars', 'chiefs', 'raiders', 'chargers', 'rams', 'dolphins', 'vikings', 'patriots', 'saints', 'giants', 'jets', 'eagles', 'steelers', '49ers', 'seahawks', 'buccaneers', 'titans', 'commanders'];
    const nhl = ['nhl', 'hockey', 'ducks', 'bruins', 'sabres', 'flames', 'hurricanes', 'blackhawks', 'avalanche', 'bluejackets', 'stars', 'redwings', 'oilers', 'panthers', 'kings', 'wild', 'canadiens', 'predators', 'devils', 'islanders', 'rangers', 'senators', 'flyers', 'penguins', 'sharks', 'kraken', 'blues', 'lightning', 'mapleleafs', 'canucks', 'goldenknights', 'capitals', 'jets'];

    for (let team of mlb) if (s.includes(team)) return 'baseball_mlb';
    for (let team of nba) if (s.includes(team)) return 'basketball_nba';
    for (let team of nfl) if (s.includes(team)) return 'football_nfl';
    for (let team of nhl) if (s.includes(team)) return 'hockey_nhl';
    return 'unknown';
}

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

// --- BOUNCER & TABS ---
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
        } else { userAccessTier = "none"; } 
        
        if (userAccessTier === 'crypto') {
            document.getElementById('view-sports-ev').classList.add('hidden');
            document.getElementById('view-locked').classList.remove('hidden');
        } else {
            switchTab('sports-ev'); 
        }
    } catch(e) { console.error(e); }
}
checkAccess();

function switchTab(target) {
    currentActiveTab = target;
    const tabs = { 'sports-ev': document.getElementById('tab-sports-ev'), 'sports-arb': document.getElementById('tab-sports-arb'), 'sports-dfs': document.getElementById('tab-sports-dfs') };
    const views = { 'sports-ev': document.getElementById('view-sports-ev'), 'sports-arb': document.getElementById('view-sports-arb'), 'sports-dfs': document.getElementById('view-sports-dfs'), 'locked': document.getElementById('view-locked') };

    if (userAccessTier === 'crypto' || userAccessTier === 'none') {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
        tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/30 flex justify-between items-center group';
        views.locked.classList.remove('hidden');
        document.getElementById('global-ticker-wrapper').classList.add('hidden');
        return;
    }

    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
    
    tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-white/10 text-white border border-white/20 shadow-lg flex justify-between items-center group';
    views[target].classList.remove('hidden');
    document.getElementById('global-ticker-wrapper').classList.remove('hidden');

    if(target === 'sports-ev') { updateTicker(lastFetchedSportsEvData, 'sports-ev'); loadLiveTelemetry(true); }
    if(target === 'sports-arb') { updateTicker(lastFetchedSportsArbData, 'sports-arb'); loadArbTelemetry(true); }
    if(target === 'sports-dfs') { updateTicker(lastFetchedSportsDfsData, 'sports-dfs'); loadDfsTelemetry(true); }
}

// --- TICKER ---
function updateTicker(data, type) {
    const tickerContainer = document.getElementById('ticker-container');
    const wrapper = document.getElementById('global-ticker-wrapper');
    let items = [];

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
                if (typeof rawStat === 'string') rawStat = rawStat.replace(/^player_/i, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                const line = edge.target || edge.line || edge.prop_line || "";
                textBlock = `${tickerLogos} <span class="text-neon ml-2">${edge.player_name || edge.player || "PLAYER"}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">${line} ${rawStat}</span> <span class="text-slate-500">|</span> <span class="text-white uppercase">${platformName}</span> <span class="text-slate-500">|</span> <span class="text-neon font-bold">⚡ +${ev}% EDGE</span>`;
            }

            items.push(`<div class="inline-flex items-center gap-3 px-6 font-mono text-xs uppercase tracking-widest whitespace-nowrap shrink-0"><span class="text-white font-black">${statusTag}</span> ${textBlock}</div>`);
        });
    }

    const rowHtml = items.join(`<span class="text-slate-600 font-bold px-2 shrink-0">•</span>`);
    tickerContainer.innerHTML = `<div class="flex items-center shrink-0 w-max">${rowHtml}<span class="text-slate-600 font-bold px-8 shrink-0">•</span>${rowHtml}</div>`; 
}

// --- CARD GENERATORS ---
document.body.addEventListener('change', (e) => {
    if (e.target.tagName === 'SELECT') {
        const val = e.target.value;
        if (currentActiveTab === 'sports-ev') { currentSportsEvFilter = val; sportsEvDataHash = ""; renderSportsFeed(lastFetchedSportsEvData, 'sports-ev'); }
        if (currentActiveTab === 'sports-arb') { currentSportsArbFilter = val; sportsArbDataHash = ""; renderSportsFeed(lastFetchedSportsArbData, 'sports-arb'); }
        if (currentActiveTab === 'sports-dfs') { currentSportsDfsFilter = val; sportsDfsDataHash = ""; renderSportsFeed(lastFetchedSportsDfsData, 'sports-dfs'); }
    }
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
                        <div class="bg-studio/80 border border-white/10 text-white rounded-lg px-3 py-2 flex items-center shadow-lg min-w-0 max-w-[200px]">
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
        if (typeof rawStat === 'string') rawStat = rawStat.replace(/^player_/i, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        
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

    const filteredData = (currentFilter !== 'all') ? activeData.filter(edge => {
        const searchStr = JSON.stringify(edge).toLowerCase();
        const detected = detectSport(searchStr);
        
        if (currentFilter === 'baseball_mlb' && (searchStr.includes('mlb') || searchStr.includes('baseball') || detected === 'baseball_mlb')) return true;
        if (currentFilter === 'basketball_nba' && (searchStr.includes('nba') || searchStr.includes('basketball') || detected === 'basketball_nba')) return true;
        if (currentFilter === 'football_nfl' && (searchStr.includes('nfl') || searchStr.includes('football') || detected === 'football_nfl')) return true;
        if (currentFilter === 'hockey_nhl' && (searchStr.includes('nhl') || searchStr.includes('hockey') || detected === 'hockey_nhl')) return true;
        return false;
    }) : activeData;

    if (currentActiveTab === type) updateTicker(filteredData, type); 

    if (filteredData.length === 0) {
        container.innerHTML = `<div class="col-span-full border border-dashed border-white/20 bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center shadow-lg"><span class="text-neon font-mono font-bold tracking-widest uppercase animate-pulse">SYSTEM ONLINE: AWAITING DISCREPANCIES...</span></div>`;
        return;
    }
    container.innerHTML = filteredData.map(edge => createFn(edge)).join('');
}

// FETCH ENGINES
async function loadLiveTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-ev') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('ev_live_data').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        
        const currentDataHash = data ? JSON.stringify(data) : "";
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

async function loadArbTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-arb') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('arbitrage_live_data').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        
        const currentDataHash = data ? JSON.stringify(data) : "";
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

async function loadDfsTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-dfs') return;
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('dfs_live_data').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        
        const currentDataHash = data ? JSON.stringify(data) : "";
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

// INITIALIZATION
window.onload = () => {
    setInterval(() => { if (currentActiveTab === 'sports-ev') loadLiveTelemetry(false); }, 30000); 
    setInterval(() => { if (currentActiveTab === 'sports-arb') loadArbTelemetry(false); }, 30000); 
    setInterval(() => { if (currentActiveTab === 'sports-dfs') loadDfsTelemetry(false); }, 30000); 
};
